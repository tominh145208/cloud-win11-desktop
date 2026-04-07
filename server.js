const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT_DIR = __dirname;
const lanAddresses = getLocalIPv4Addresses();
const DATA_DIR = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(ROOT_DIR, "data");
const ADMIN_DATA_PATH = path.join(DATA_DIR, "limore-admin-data.json");
const ADMIN_AUTH_PATH = path.join(DATA_DIR, "admin-auth.json");
const ADMIN_AUDIT_LOG_PATH = path.join(DATA_DIR, "admin-audit-log.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const DEFAULT_ADMIN_PASSWORD = "12345";
const DEFAULT_ADMIN_OTP_CODE = "123456";
const adminSessions = new Map();
const DEFAULT_ROLLOUT_CONFIG = Object.freeze({
    enabled: false,
    percent: 100,
    stableVersion: "stable",
    latestVersion: "latest",
    updatedAt: ""
});
const ONLINE_THRESHOLD_MS = 180000;
const DEFAULT_DEPLOY_STATUS = Object.freeze({
    state: "success",
    updatedAt: "",
    note: "",
    source: "server"
});
const MAX_CLIENT_ACTIVITY_ROWS = 30000;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8"
};

function getLocalIPv4Addresses() {
    const interfaces = os.networkInterfaces();
    const all = [];

    Object.values(interfaces).forEach((entries) => {
        (entries || []).forEach((entry) => {
            if (entry.family === "IPv4" && !entry.internal) {
                all.push(entry.address);
            }
        });
    });

    return Array.from(new Set(all));
}

function safeResolvePath(urlPathname) {
    const decodedPath = decodeURIComponent(urlPathname);
    const normalized = path.normalize(decodedPath).replace(/^([/\\])+/, "");
    const resolved = path.resolve(ROOT_DIR, normalized);
    if (!resolved.startsWith(ROOT_DIR)) {
        return null;
    }
    return resolved;
}

function sendFile(res, filepath) {
    fs.readFile(filepath, (error, fileBuffer) => {
        if (error) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Internal Server Error");
            return;
        }

        const ext = path.extname(filepath).toLowerCase();
        const fileName = path.basename(filepath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const shouldDisableCache =
            ext === ".html"
            || ext === ".webmanifest"
            || fileName === "service-worker.js";

        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": shouldDisableCache ? "no-cache, no-store, must-revalidate" : "public, max-age=300",
            "Access-Control-Allow-Origin": "*"
        });
        res.end(fileBuffer);
    });
}

function ensureDataDir() {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error("Could not create data directory");
    }
}

function readAdminData() {
    try {
        const raw = fs.readFileSync(ADMIN_DATA_PATH, "utf8");
        return JSON.parse(raw);
    } catch (error) {
        return {};
    }
}

function writeAdminData(data) {
    ensureDataDir();
    fs.writeFileSync(ADMIN_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
    maybeWriteDailyBackup(data);
}

function sanitizeAdminUsers(users, fallbackPassword = DEFAULT_ADMIN_PASSWORD) {
    const seen = new Set();
    const nextUsers = (Array.isArray(users) ? users : [])
        .map((entry, index) => {
            const username = String(entry?.username || `admin${index + 1}`).trim().toLowerCase();
            const password = String(entry?.password || fallbackPassword).trim();
            const role = String(entry?.role || "mod").trim().toLowerCase() === "super_admin" ? "super_admin" : "mod";
            return {
                username,
                password: password || fallbackPassword,
                role
            };
        })
        .filter((entry) => {
            if (!entry.username || seen.has(entry.username)) {
                return false;
            }
            seen.add(entry.username);
            return true;
        });

    if (!nextUsers.length) {
        nextUsers.push({
            username: "admin",
            password: fallbackPassword,
            role: "super_admin"
        });
    }

    if (!nextUsers.some((entry) => entry.role === "super_admin")) {
        nextUsers[0].role = "super_admin";
    }

    return nextUsers;
}

function readAdminAuditLog() {
    try {
        const raw = fs.readFileSync(ADMIN_AUDIT_LOG_PATH, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function writeAdminAuditLog(rows) {
    ensureDataDir();
    fs.writeFileSync(ADMIN_AUDIT_LOG_PATH, JSON.stringify(Array.isArray(rows) ? rows : [], null, 2), "utf8");
}

function appendAdminAuditLog(event) {
    const nextEvent = {
        id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        at: new Date().toISOString(),
        ...event
    };
    const rows = readAdminAuditLog();
    rows.unshift(nextEvent);
    writeAdminAuditLog(rows.slice(0, 500));
}

function readAdminAuthConfig() {
    try {
        const raw = fs.readFileSync(ADMIN_AUTH_PATH, "utf8");
        const parsed = JSON.parse(raw);
        const legacyPassword = String(parsed?.password || DEFAULT_ADMIN_PASSWORD).trim() || DEFAULT_ADMIN_PASSWORD;
        const users = sanitizeAdminUsers(parsed?.users, legacyPassword);
        return {
            users,
            otpEnabled: Boolean(parsed?.otpEnabled),
            otpCode: String(parsed?.otpCode || DEFAULT_ADMIN_OTP_CODE).trim() || DEFAULT_ADMIN_OTP_CODE
        };
    } catch (error) {
        return {
            users: sanitizeAdminUsers([], DEFAULT_ADMIN_PASSWORD),
            otpEnabled: false,
            otpCode: DEFAULT_ADMIN_OTP_CODE
        };
    }
}

function writeAdminAuthConfig(config) {
    ensureDataDir();
    const fallbackPassword = String(config?.password || DEFAULT_ADMIN_PASSWORD).trim() || DEFAULT_ADMIN_PASSWORD;
    const users = sanitizeAdminUsers(config?.users, fallbackPassword);
    const nextConfig = {
        users,
        otpEnabled: Boolean(config?.otpEnabled),
        otpCode: String(config?.otpCode || DEFAULT_ADMIN_OTP_CODE).trim() || DEFAULT_ADMIN_OTP_CODE,
        password: users[0]?.password || DEFAULT_ADMIN_PASSWORD
    };
    fs.writeFileSync(ADMIN_AUTH_PATH, JSON.stringify(nextConfig, null, 2), "utf8");
}

function getAdminToken(req) {
    return String(req.headers["x-admin-token"] || "").trim();
}

function isAuthorizedAdmin(req) {
    const token = getAdminToken(req);
    return Boolean(token) && adminSessions.has(token);
}

function getAdminSession(req) {
    const token = getAdminToken(req);
    if (!token) {
        return null;
    }
    return adminSessions.get(token) || null;
}

function isSuperAdmin(req) {
    return getAdminSession(req)?.role === "super_admin";
}

function createAdminSessionToken(sessionPayload = {}) {
    const token = `admin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    adminSessions.set(token, {
        username: String(sessionPayload.username || "admin"),
        role: String(sessionPayload.role || "mod") === "super_admin" ? "super_admin" : "mod",
        createdAt: new Date().toISOString()
    });
    return token;
}

function getBlockedClientIds(data) {
    return Array.isArray(data?.state?.blockedClientIds)
        ? data.state.blockedClientIds.map((value) => String(value || "").trim()).filter(Boolean)
        : [];
}

function sanitizeLimoreUsers(users, fallbackUsers = []) {
    const sourceUsers = Array.isArray(users) && users.length
        ? users
        : (Array.isArray(fallbackUsers) ? fallbackUsers : []);
    const seen = new Set();
    const nextUsers = sourceUsers
        .map((entry, index) => ({
            id: String(entry?.id || `user${index + 1}`).trim() || `user${index + 1}`,
            desktopName: String(entry?.desktopName || `User ${index + 1}`).trim() || `User ${index + 1}`,
            limoreName: String(entry?.limoreName || "Anonymous").trim() || "Anonymous",
            balance: Math.max(0, Math.round(Number(entry?.balance || 0))),
            activePackageId: String(entry?.activePackageId || "").trim(),
            locked: Boolean(entry?.locked)
        }))
        .filter((entry) => {
            if (!entry.id || seen.has(entry.id)) {
                return false;
            }
            seen.add(entry.id);
            return true;
        });

    if (!nextUsers.length) {
        nextUsers.push({
            id: "dzminh",
            desktopName: "Dz Minh",
            limoreName: "Anonymous",
            balance: 0,
            activePackageId: "",
            locked: false
        });
    }
    return nextUsers;
}

function sanitizeDeployStatus(rawStatus = {}, fallbackStatus = DEFAULT_DEPLOY_STATUS) {
    const safeState = String(rawStatus?.state || fallbackStatus.state || "success").trim().toLowerCase();
    const nextState = safeState === "building" || safeState === "fail" ? safeState : "success";
    return {
        state: nextState,
        updatedAt: String(rawStatus?.updatedAt || fallbackStatus.updatedAt || "").trim(),
        note: String(rawStatus?.note || fallbackStatus.note || "").trim().slice(0, 240),
        source: String(rawStatus?.source || fallbackStatus.source || "server").trim().slice(0, 80) || "server"
    };
}

function getDeployStatus(data) {
    return sanitizeDeployStatus(data?.state?.deployStatus || {}, DEFAULT_DEPLOY_STATUS);
}

function sanitizeRolloutConfig(rawConfig = {}, fallbackConfig = DEFAULT_ROLLOUT_CONFIG) {
    const percentRaw = Number(rawConfig?.percent ?? fallbackConfig.percent);
    const percent = Number.isFinite(percentRaw)
        ? Math.max(0, Math.min(100, Math.round(percentRaw)))
        : fallbackConfig.percent;
    const stableVersion = String(rawConfig?.stableVersion || fallbackConfig.stableVersion || "stable").trim() || "stable";
    const latestVersion = String(rawConfig?.latestVersion || fallbackConfig.latestVersion || "latest").trim() || "latest";
    const updatedAt = String(rawConfig?.updatedAt || fallbackConfig.updatedAt || "").trim();
    return {
        enabled: Boolean(rawConfig?.enabled),
        percent,
        stableVersion: stableVersion.slice(0, 48),
        latestVersion: latestVersion.slice(0, 48),
        updatedAt
    };
}

function getRolloutConfig(data) {
    const raw = data?.state?.rollout;
    return sanitizeRolloutConfig(raw || {}, DEFAULT_ROLLOUT_CONFIG);
}

function hashSeedToBucket(seed) {
    const safeSeed = String(seed || "").trim();
    if (!safeSeed) {
        return 0;
    }
    let hash = 0;
    for (let index = 0; index < safeSeed.length; index += 1) {
        hash = (hash * 31 + safeSeed.charCodeAt(index)) % 1000003;
    }
    return Math.abs(hash) % 100;
}

function resolveClientRollout(data, clientIdRaw, fallbackSeedRaw = "") {
    const config = getRolloutConfig(data);
    const clientId = String(clientIdRaw || "").trim();
    const fallbackSeed = String(fallbackSeedRaw || "").trim();
    const rolloutSeed = clientId || fallbackSeed || "unknown";
    const bucket = hashSeedToBucket(rolloutSeed);
    const shouldUseLatest = !config.enabled || bucket < config.percent;
    const channel = shouldUseLatest ? "latest" : "stable";
    const assignedVersion = shouldUseLatest ? config.latestVersion : config.stableVersion;
    return {
        enabled: config.enabled,
        percent: config.percent,
        stableVersion: config.stableVersion,
        latestVersion: config.latestVersion,
        channel,
        assignedVersion,
        bucket,
        key: `${config.enabled ? 1 : 0}:${config.percent}:${config.stableVersion}:${config.latestVersion}:${channel}`,
        updatedAt: config.updatedAt || ""
    };
}

function getClientUserBindings(data) {
    const raw = data?.state?.clientUserBindings;
    if (!raw || typeof raw !== "object") {
        return {};
    }
    return Object.fromEntries(
        Object.entries(raw)
            .map(([key, value]) => [String(key || "").trim(), String(value || "").trim()])
            .filter(([key, value]) => key && value)
    );
}

function getIpUserBindings(data) {
    const raw = data?.state?.ipUserBindings;
    if (!raw || typeof raw !== "object") {
        return {};
    }
    return Object.fromEntries(
        Object.entries(raw)
            .map(([key, value]) => [String(key || "").trim(), String(value || "").trim()])
            .filter(([key, value]) => key && value)
    );
}

function getClientIp(req) {
    const priorityHeaders = [
        "cf-connecting-ip",
        "fly-client-ip",
        "x-real-ip"
    ];

    for (const headerName of priorityHeaders) {
        const directIp = String(req.headers[headerName] || "").trim();
        if (directIp) {
            return directIp.replace(/^::ffff:/, "");
        }
    }

    const forwarded = String(req.headers["x-forwarded-for"] || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    if (forwarded.length > 0) {
        return forwarded[0].replace(/^::ffff:/, "");
    }

    const remoteAddress = String(req.socket?.remoteAddress || req.connection?.remoteAddress || "").trim();
    return remoteAddress.replace(/^::ffff:/, "");
}

function normalizeUserAgentSignature(userAgent) {
    return String(userAgent || "")
        .toLowerCase()
        .replace(/\b(iphone os|cpu iphone os|cpu os|android|windows nt|mac os x|version)\s[\d._]+/g, "$1 x")
        .replace(/\/[\d._-]+/g, "/x")
        .replace(/\bmobile\/[\w._-]+/g, "mobile/x")
        .replace(/\bbuild\/[\w._-]+/g, "build/x")
        .replace(/\s+/g, " ")
        .trim();
}

function buildClientFingerprint(client) {
    const ipAddress = String(client?.ipAddress || "").trim().toLowerCase();
    const deviceType = String(client?.deviceType || "unknown").trim().toLowerCase();
    const currentUserId = String(client?.currentUserId || "").trim().toLowerCase();
    const desktopName = String(client?.desktopName || "").trim().toLowerCase();
    const limoreName = String(client?.limoreName || "").trim().toLowerCase();
    const userIdentity = currentUserId || desktopName || limoreName || "-";
    const isMobile = client?.isMobile ? "mobile" : "desktop";
    const userAgent = String(client?.userAgent || "").toLowerCase();
    const deviceFamily = /iphone/.test(userAgent)
        ? "iphone"
        : /ipad/.test(userAgent)
            ? "ipad"
            : /android/.test(userAgent)
                ? "android"
                : /windows/.test(userAgent)
                    ? "windows"
                    : /macintosh|mac os/.test(userAgent)
                        ? "mac"
                        : /linux/.test(userAgent)
                            ? "linux"
                            : deviceType;
    return [ipAddress || "-", deviceFamily, isMobile, userIdentity].join("|");
}

function mergeClientEntry(existingClient, incomingClient) {
    if (!existingClient) {
        return incomingClient;
    }

    const existingLastSeenAt = new Date(existingClient.lastSeenAt || 0).getTime();
    const incomingLastSeenAt = new Date(incomingClient.lastSeenAt || 0).getTime();
    const newerClient = incomingLastSeenAt >= existingLastSeenAt ? incomingClient : existingClient;
    const olderClient = newerClient === incomingClient ? existingClient : incomingClient;

    return {
        ...olderClient,
        ...newerClient,
        clientId: String(newerClient.clientId || olderClient.clientId || "").trim()
    };
}

function mergeClientRows(clients) {
    const normalizedClients = (Array.isArray(clients) ? clients : [])
        .map((client) => ({
            ...client,
            clientId: String(client?.clientId || "").trim(),
            ipAddress: String(client?.ipAddress || "").trim(),
            deviceType: String(client?.deviceType || "unknown").trim() || "unknown",
            userAgent: String(client?.userAgent || ""),
            currentPage: String(client?.currentPage || ""),
            activeAppId: String(client?.activeAppId || ""),
            desktopName: String(client?.desktopName || ""),
            limoreName: String(client?.limoreName || ""),
            currentUserId: String(client?.currentUserId || ""),
            setupComplete: Boolean(client?.setupComplete),
            isMobile: Boolean(client?.isMobile),
            anonymous: Boolean(client?.anonymous),
            trackingAccepted: Boolean(client?.trackingAccepted),
            rolloutChannel: String(client?.rolloutChannel || ""),
            rolloutVersion: String(client?.rolloutVersion || ""),
            rolloutBucket: Number(client?.rolloutBucket) || 0,
            lastSeenAt: String(client?.lastSeenAt || "")
        }))
        .filter((client) => client.clientId || client.ipAddress || client.userAgent || client.lastSeenAt)
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")));

    const byClientId = new Map();
    const clientRowsWithoutId = [];

    normalizedClients.forEach((normalizedClient) => {
        const clientId = normalizedClient.clientId;
        if (clientId) {
            const existing = byClientId.get(clientId);
            byClientId.set(clientId, mergeClientEntry(existing, normalizedClient));
            return;
        }
        clientRowsWithoutId.push(normalizedClient);
    });

    const byFingerprint = new Map();
    [...byClientId.values(), ...clientRowsWithoutId].forEach((client) => {
        const fingerprint = buildClientFingerprint(client);
        const existing = byFingerprint.get(fingerprint);
        byFingerprint.set(fingerprint, mergeClientEntry(existing, client));
    });

    return Array.from(byFingerprint.values())
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")));
}

function buildConcurrentLoginAlerts(clients) {
    const now = Date.now();
    const recentClients = (Array.isArray(clients) ? clients : []).filter((client) => {
        const lastSeenMs = client?.lastSeenAt ? new Date(client.lastSeenAt).getTime() : 0;
        return lastSeenMs > 0 && now - lastSeenMs <= ONLINE_THRESHOLD_MS;
    });
    const bucket = new Map();
    recentClients.forEach((client) => {
        const userId = String(client?.currentUserId || "").trim();
        if (!userId) {
            return;
        }
        const deviceKey = buildClientFingerprint(client);
        const existing = bucket.get(userId) || { userId, devices: new Map() };
        existing.devices.set(deviceKey, client);
        bucket.set(userId, existing);
    });
    return Array.from(bucket.values())
        .map((entry) => ({
            userId: entry.userId,
            devices: Array.from(entry.devices.values())
        }))
        .filter((entry) => entry.devices.length >= 2);
}

function getFirewallRules(data) {
    return Array.isArray(data?.state?.firewallRules)
        ? data.state.firewallRules.map((value) => String(value || "").trim()).filter(Boolean)
        : [];
}

function getClientHistory(data) {
    return Array.isArray(data?.state?.clientHistory)
        ? data.state.clientHistory
            .map((entry) => ({
                at: String(entry?.at || ""),
                clientId: String(entry?.clientId || ""),
                fingerprint: String(entry?.fingerprint || ""),
                ipAddress: String(entry?.ipAddress || ""),
                currentUserId: String(entry?.currentUserId || ""),
                currentPage: String(entry?.currentPage || ""),
                deviceType: String(entry?.deviceType || "unknown"),
                isMobile: Boolean(entry?.isMobile),
                blockedByFirewall: Boolean(entry?.blockedByFirewall)
            }))
            .filter((entry) => entry.at)
        : [];
}

function getClientActivityHistory(data) {
    return Array.isArray(data?.state?.clientActivityHistory)
        ? data.state.clientActivityHistory
            .map((entry) => ({
                at: String(entry?.at || ""),
                clientId: String(entry?.clientId || "").trim(),
                currentUserId: String(entry?.currentUserId || "").trim(),
                desktopName: String(entry?.desktopName || "").trim(),
                limoreName: String(entry?.limoreName || "").trim(),
                deviceType: String(entry?.deviceType || "unknown").trim() || "unknown",
                isMobile: Boolean(entry?.isMobile),
                currentPage: String(entry?.currentPage || "").trim(),
                eventType: String(entry?.eventType || "unknown").trim() || "unknown",
                action: String(entry?.action || "").trim(),
                detail: String(entry?.detail || "").trim(),
                targetTitle: String(entry?.targetTitle || "").trim(),
                ipAddress: String(entry?.ipAddress || "").trim()
            }))
            .filter((entry) => entry.at && entry.clientId)
        : [];
}

function getTrackingAcceptedUsers(data) {
    const raw = data?.state?.trackingAcceptedUsers;
    if (!raw || typeof raw !== "object") {
        return {};
    }
    const normalized = {};
    Object.entries(raw).forEach(([userIdRaw, value]) => {
        const userId = String(userIdRaw || "").trim();
        if (!userId) {
            return;
        }
        const clientIds = Array.isArray(value?.clientIds)
            ? value.clientIds.map((id) => String(id || "").trim()).filter(Boolean)
            : [];
        normalized[userId] = {
            userId,
            desktopName: String(value?.desktopName || "").trim(),
            limoreName: String(value?.limoreName || "").trim(),
            acceptedAt: String(value?.acceptedAt || "").trim(),
            lastSeenAt: String(value?.lastSeenAt || "").trim(),
            clientIds: Array.from(new Set(clientIds)).slice(0, 40)
        };
    });
    return normalized;
}

function getKnownIpsByUser(data) {
    const raw = data?.state?.knownIpsByUser;
    if (!raw || typeof raw !== "object") {
        return {};
    }
    return Object.fromEntries(
        Object.entries(raw).map(([userId, values]) => {
            const nextValues = Array.isArray(values)
                ? values.map((ip) => String(ip || "").trim()).filter(Boolean)
                : [];
            return [String(userId || "").trim(), Array.from(new Set(nextValues)).slice(0, 40)];
        }).filter(([userId]) => Boolean(userId))
    );
}

function getIpAlerts(data) {
    return Array.isArray(data?.state?.ipAlerts)
        ? data.state.ipAlerts
            .map((alert) => ({
                id: String(alert?.id || ""),
                at: String(alert?.at || ""),
                userId: String(alert?.userId || ""),
                ipAddress: String(alert?.ipAddress || ""),
                ack: Boolean(alert?.ack),
                reason: String(alert?.reason || "ip_moi")
            }))
            .filter((alert) => alert.id && alert.at && alert.userId && alert.ipAddress)
        : [];
}

function isValidIPv4(ipAddress) {
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(ipAddress) && ipAddress.split(".").every((part) => {
        const value = Number(part);
        return value >= 0 && value <= 255;
    });
}

function ipv4ToNumber(ipAddress) {
    if (!isValidIPv4(ipAddress)) {
        return null;
    }
    const parts = ipAddress.split(".").map(Number);
    return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0;
}

function isIpInRule(ipAddress, rule) {
    const normalizedIp = String(ipAddress || "").trim();
    const normalizedRule = String(rule || "").trim();
    if (!normalizedIp || !normalizedRule || !isValidIPv4(normalizedIp)) {
        return false;
    }

    if (normalizedRule.includes("/")) {
        const [baseIpRaw, prefixRaw] = normalizedRule.split("/");
        const baseIp = String(baseIpRaw || "").trim();
        const prefix = Number(prefixRaw);
        if (!isValidIPv4(baseIp) || Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
            return false;
        }
        const ipNum = ipv4ToNumber(normalizedIp);
        const baseNum = ipv4ToNumber(baseIp);
        if (ipNum === null || baseNum === null) {
            return false;
        }
        const mask = prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0);
        return (ipNum & mask) === (baseNum & mask);
    }

    if (normalizedRule.includes("-")) {
        const [startIpRaw, endIpRaw] = normalizedRule.split("-");
        const startIp = String(startIpRaw || "").trim();
        const endIp = String(endIpRaw || "").trim();
        const ipNum = ipv4ToNumber(normalizedIp);
        const startNum = ipv4ToNumber(startIp);
        const endNum = ipv4ToNumber(endIp);
        if (ipNum === null || startNum === null || endNum === null) {
            return false;
        }
        return ipNum >= Math.min(startNum, endNum) && ipNum <= Math.max(startNum, endNum);
    }

    return normalizedIp === normalizedRule;
}

function isIpBlocked(ipAddress, rules) {
    const normalizedRules = Array.isArray(rules) ? rules : [];
    return normalizedRules.some((rule) => isIpInRule(ipAddress, rule));
}

function maybeWriteDailyBackup(data) {
    try {
        ensureDataDir();
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        const day = new Date().toISOString().slice(0, 10);
        const backupPath = path.join(BACKUP_DIR, `backup-${day}.json`);
        if (fs.existsSync(backupPath)) {
            return;
        }
        const snapshot = {
            at: new Date().toISOString(),
            users: Array.isArray(data?.users) ? data.users : [],
            clients: Array.isArray(data?.clients) ? data.clients : [],
            state: data?.state && typeof data.state === "object" ? data.state : {}
        };
        fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), "utf8");
    } catch (error) {
        console.error("Could not write daily backup");
    }
}

function toCsvValue(value) {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
}

function buildClientsCsv(clients) {
    const rows = [["clientId", "deviceType", "desktopName", "limoreName", "currentUserId", "ipAddress", "currentPage", "activeAppId", "trackingAccepted", "isMobile", "anonymous", "lastSeenAt", "userAgent"]];
    (Array.isArray(clients) ? clients : []).forEach((client) => {
        rows.push([
            client.clientId || "",
            client.deviceType || "",
            client.desktopName || "",
            client.limoreName || "",
            client.currentUserId || "",
            client.ipAddress || "",
            client.currentPage || "",
            client.activeAppId || "",
            client.trackingAccepted ? "1" : "0",
            client.isMobile ? "1" : "0",
            client.anonymous ? "1" : "0",
            client.lastSeenAt || "",
            client.userAgent || ""
        ]);
    });
    return rows.map((row) => row.map((value) => toCsvValue(value)).join(",")).join("\n");
}

function buildOnlineStats(clientHistory) {
    const now = Date.now();
    const hourly = Array.from({ length: 24 }, (_, index) => ({
        label: `${index.toString().padStart(2, "0")}:00`,
        count: 0
    }));
    const daily = Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(now - offset * 24 * 60 * 60 * 1000);
        const label = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        return { label, count: 0 };
    }).reverse();

    (Array.isArray(clientHistory) ? clientHistory : []).forEach((event) => {
        const timestamp = new Date(event?.at || "").getTime();
        if (!timestamp) {
            return;
        }
        const eventDate = new Date(timestamp);
        const eventHour = eventDate.getHours();
        hourly[eventHour].count += 1;

        const dayLabel = `${eventDate.getDate().toString().padStart(2, "0")}/${(eventDate.getMonth() + 1).toString().padStart(2, "0")}`;
        const dayBucket = daily.find((bucket) => bucket.label === dayLabel);
        if (dayBucket) {
            dayBucket.count += 1;
        }
    });

    return {
        hourly,
        daily
    };
}

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = "";
        req.on("data", (chunk) => {
            raw += chunk;
            if (raw.length > 1024 * 1024) {
                reject(new Error("Payload too large"));
                req.destroy();
            }
        });
        req.on("end", () => {
            if (!raw.trim()) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

function buildUserIndex(users) {
    const map = new Map();
    (Array.isArray(users) ? users : []).forEach((user) => {
        const id = String(user?.id || "").trim();
        if (!id) {
            return;
        }
        map.set(id, user);
    });
    return map;
}

const server = http.createServer(async (req, res) => {
    const baseUrl = `http://${req.headers.host || "localhost"}`;
    const reqUrl = new URL(req.url || "/", baseUrl);
    const pathname = reqUrl.pathname || "/";

    if (pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    if (pathname === "/network-info") {
        const hostHeader = req.headers.host || `localhost:${PORT}`;
        const currentOrigin = `http://${hostHeader}`;
        const lanUrls = lanAddresses.map((ip) => `http://${ip}:${PORT}`);
        const localUrl = `http://localhost:${PORT}`;

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
            ok: true,
            currentOrigin,
            localUrl,
            lanUrls
        }));
        return;
    }

    if (pathname === "/api/admin-auth/verify" && req.method === "GET") {
        const session = getAdminSession(req);
        if (!session) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            username: session.username,
            role: session.role
        }));
        return;
    }

    if (pathname === "/api/admin-auth/login" && req.method === "POST") {
        try {
            const payload = await parseJsonBody(req);
            const adminAuthConfig = readAdminAuthConfig();
            const inputUsername = String(payload?.username || "").trim().toLowerCase();
            const loginUser = adminAuthConfig.users.find((entry) => entry.username === inputUsername)
                || (!inputUsername ? adminAuthConfig.users[0] : null);
            const password = String(payload?.password || "");
            const otpCode = String(payload?.otpCode || "").trim();

            if (!loginUser || password !== loginUser.password) {
                res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Sai mat khau admin" }));
                return;
            }

            if (adminAuthConfig.otpEnabled && otpCode !== adminAuthConfig.otpCode) {
                res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Ma OTP khong dung" }));
                return;
            }

            const token = createAdminSessionToken({
                username: loginUser.username,
                role: loginUser.role
            });
            appendAdminAuditLog({
                type: "admin_login",
                username: loginUser.username,
                role: loginUser.role,
                ipAddress: getClientIp(req),
                detail: "Dang nhap admin thanh cong"
            });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                token,
                username: loginUser.username,
                role: loginUser.role,
                otpEnabled: adminAuthConfig.otpEnabled
            }));
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        }
        return;
    }

    if (pathname === "/api/admin-auth/change-password" && req.method === "POST") {
        const adminSession = getAdminSession(req);
        if (!adminSession) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        try {
            const payload = await parseJsonBody(req);
            const currentPassword = String(payload.currentPassword || "");
            const nextPassword = String(payload.newPassword || "").trim();
            const adminAuthConfig = readAdminAuthConfig();
            const targetUsername = String(payload?.targetUsername || adminSession.username || "").trim().toLowerCase();
            const targetIndex = adminAuthConfig.users.findIndex((entry) => entry.username === targetUsername);
            if (targetIndex < 0) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Khong tim thay tai khoan admin" }));
                return;
            }
            const targetUser = adminAuthConfig.users[targetIndex];
            const canManageUser = adminSession.role === "super_admin" || targetUser.username === adminSession.username;
            if (!canManageUser) {
                res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chi Super Admin moi sua duoc user khac" }));
                return;
            }

            if (currentPassword !== targetUser.password) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Mat khau hien tai khong dung" }));
                return;
            }

            if (nextPassword.length < 4) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Mat khau moi phai tu 4 ky tu" }));
                return;
            }

            const nextUsers = [...adminAuthConfig.users];
            nextUsers[targetIndex] = {
                ...targetUser,
                password: nextPassword
            };
            writeAdminAuthConfig({
                ...adminAuthConfig,
                users: nextUsers
            });
            appendAdminAuditLog({
                type: "admin_change_password",
                username: adminSession.username,
                role: adminSession.role,
                ipAddress: getClientIp(req),
                detail: `Doi mat khau admin cho ${targetUser.username}`
            });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true }));
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        }
        return;
    }

    if (pathname === "/api/admin-auth/otp") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        if (req.method === "GET") {
            const authConfig = readAdminAuthConfig();
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                otpEnabled: authConfig.otpEnabled,
                otpCode: authConfig.otpCode
            }));
            return;
        }

        if (req.method === "POST") {
            if (!isSuperAdmin(req)) {
                res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chi Super Admin duoc sua OTP" }));
                return;
            }
            try {
                const payload = await parseJsonBody(req);
                const authConfig = readAdminAuthConfig();
                const nextOtpCode = String(payload?.otpCode || authConfig.otpCode || DEFAULT_ADMIN_OTP_CODE).trim();
                const nextConfig = {
                    ...authConfig,
                    otpEnabled: Boolean(payload?.otpEnabled),
                    otpCode: nextOtpCode.length >= 4 ? nextOtpCode : (authConfig.otpCode || DEFAULT_ADMIN_OTP_CODE)
                };
                writeAdminAuthConfig(nextConfig);
                appendAdminAuditLog({
                    type: "admin_update_otp",
                    username: getAdminSession(req)?.username || "unknown",
                    role: getAdminSession(req)?.role || "unknown",
                    ipAddress: getClientIp(req),
                    detail: `Cap nhat OTP: ${nextConfig.otpEnabled ? "Bat" : "Tat"}`
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, otpEnabled: nextConfig.otpEnabled, otpCode: nextConfig.otpCode }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/admin-auth/users") {
        const session = getAdminSession(req);
        if (!session) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        if (session.role !== "super_admin") {
            res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Chi Super Admin duoc quan ly role" }));
            return;
        }

        if (req.method === "GET") {
            const authConfig = readAdminAuthConfig();
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                users: authConfig.users.map((entry) => ({
                    username: entry.username,
                    role: entry.role
                }))
            }));
            return;
        }

        if (req.method === "POST") {
            try {
                const payload = await parseJsonBody(req);
                const action = String(payload?.action || "").trim();
                const username = String(payload?.username || "").trim().toLowerCase();
                const authConfig = readAdminAuthConfig();
                const users = [...authConfig.users];

                if (!username) {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "Can nhap username" }));
                    return;
                }

                if (action === "upsert") {
                    const role = String(payload?.role || "mod").trim().toLowerCase() === "super_admin" ? "super_admin" : "mod";
                    const password = String(payload?.password || "").trim();
                    const existingIndex = users.findIndex((entry) => entry.username === username);
                    if (existingIndex >= 0) {
                        users[existingIndex] = {
                            ...users[existingIndex],
                            role,
                            password: password || users[existingIndex].password
                        };
                    } else {
                        users.push({
                            username,
                            role,
                            password: password || DEFAULT_ADMIN_PASSWORD
                        });
                    }
                } else if (action === "delete") {
                    const target = users.find((entry) => entry.username === username);
                    if (!target) {
                        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
                        res.end(JSON.stringify({ ok: false, error: "Khong tim thay user" }));
                        return;
                    }
                    if (target.role === "super_admin" && users.filter((entry) => entry.role === "super_admin").length <= 1) {
                        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                        res.end(JSON.stringify({ ok: false, error: "Can giu lai it nhat 1 Super Admin" }));
                        return;
                    }
                    if (username === session.username) {
                        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                        res.end(JSON.stringify({ ok: false, error: "Khong the xoa user dang dang nhap" }));
                        return;
                    }
                    const nextUsers = users.filter((entry) => entry.username !== username);
                    writeAdminAuthConfig({
                        ...authConfig,
                        users: nextUsers
                    });
                    appendAdminAuditLog({
                        type: "admin_delete_role_user",
                        username: session.username,
                        role: session.role,
                        ipAddress: getClientIp(req),
                        detail: `Xoa user role ${username}`
                    });
                    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({
                        ok: true,
                        users: nextUsers.map((entry) => ({
                            username: entry.username,
                            role: entry.role
                        }))
                    }));
                    return;
                } else {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "Action khong hop le" }));
                    return;
                }

                const nextConfig = {
                    ...authConfig,
                    users
                };
                writeAdminAuthConfig(nextConfig);
                appendAdminAuditLog({
                    type: "admin_update_role_user",
                    username: session.username,
                    role: session.role,
                    ipAddress: getClientIp(req),
                    detail: `Cap nhat role user ${username}`
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    users: nextConfig.users.map((entry) => ({
                        username: entry.username,
                        role: entry.role
                    }))
                }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/admin-audit-log" && req.method === "GET") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            logs: readAdminAuditLog()
        }));
        return;
    }

    if (pathname === "/api/admin-firewall") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        if (req.method === "GET") {
            const data = readAdminData();
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                rules: getFirewallRules(data)
            }));
            return;
        }

        if (req.method === "POST") {
            try {
                const payload = await parseJsonBody(req);
                const rules = Array.isArray(payload?.rules)
                    ? payload.rules.map((value) => String(value || "").trim()).filter(Boolean)
                    : [];
                const data = readAdminData();
                const nextData = {
                    ...data,
                    state: {
                        ...(data.state || {}),
                        firewallRules: Array.from(new Set(rules)).slice(0, 100)
                    }
                };
                writeAdminData(nextData);
                appendAdminAuditLog({
                    type: "admin_update_firewall",
                    username: getAdminSession(req)?.username || "unknown",
                    role: getAdminSession(req)?.role || "unknown",
                    ipAddress: getClientIp(req),
                    detail: `Cap nhat firewall (${nextData.state.firewallRules.length} rule)`
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    rules: nextData.state.firewallRules
                }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/admin-devices/dedupe" && req.method === "POST") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        const data = readAdminData();
        const beforeCount = Array.isArray(data.clients) ? data.clients.length : 0;
        const mergedClients = mergeClientRows(data.clients);
        const afterCount = mergedClients.length;
        const nextData = {
            ...data,
            clients: mergedClients
        };
        writeAdminData(nextData);
        appendAdminAuditLog({
            type: "admin_manual_dedupe_clients",
            username: getAdminSession(req)?.username || "unknown",
            role: getAdminSession(req)?.role || "unknown",
            ipAddress: getClientIp(req),
            detail: `Gop trung client ${beforeCount} -> ${afterCount}`
        });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
            ok: true,
            removed: Math.max(0, beforeCount - afterCount),
            clients: mergedClients
        }));
        return;
    }

    if (pathname === "/api/admin-devices/export" && req.method === "GET") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        const data = readAdminData();
        const mergedClients = mergeClientRows(data.clients);
        const csv = buildClientsCsv(mergedClients);
        res.writeHead(200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename=\"limore-clients-${new Date().toISOString().slice(0, 10)}.csv\"`,
            "Cache-Control": "no-cache"
        });
        res.end(csv);
        return;
    }

    if (pathname === "/api/admin-devices/detail" && req.method === "GET") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        const data = readAdminData();
        const clients = mergeClientRows(data.clients);
        const clientId = String(reqUrl.searchParams.get("clientId") || "").trim();
        const fingerprint = String(reqUrl.searchParams.get("fingerprint") || "").trim();
        const targetClient = clients.find((entry) => {
            if (clientId && String(entry.clientId || "") === clientId) {
                return true;
            }
            if (fingerprint && buildClientFingerprint(entry) === fingerprint) {
                return true;
            }
            return false;
        });
        if (!targetClient) {
            res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Khong tim thay client" }));
            return;
        }

        const targetFingerprint = buildClientFingerprint(targetClient);
        const history = getClientHistory(data)
            .filter((event) => event.clientId === targetClient.clientId || event.fingerprint === targetFingerprint)
            .sort((left, right) => String(right.at || "").localeCompare(String(left.at || "")))
            .slice(0, 80);

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            client: targetClient,
            history
        }));
        return;
    }

    if (pathname === "/api/admin-client-activity" && req.method === "GET") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        const data = readAdminData();
        const userIdFilter = String(reqUrl.searchParams.get("userId") || "").trim().toLowerCase();
        const clientIdFilter = String(reqUrl.searchParams.get("clientId") || "").trim().toLowerCase();
        const actionFilter = String(reqUrl.searchParams.get("action") || "").trim().toLowerCase();
        const limitRaw = Number(reqUrl.searchParams.get("limit") || 250);
        const limit = Number.isFinite(limitRaw) ? Math.max(50, Math.min(1000, Math.round(limitRaw))) : 250;
        const now = Date.now();
        const clients = mergeClientRows(data.clients);
        const clientsById = new Map();
        clients.forEach((client) => {
            const clientId = String(client?.clientId || "").trim();
            if (clientId) {
                clientsById.set(clientId, client);
            }
        });

        const activities = getClientActivityHistory(data)
            .sort((left, right) => String(right.at || "").localeCompare(String(left.at || "")))
            .filter((entry) => {
                const entryUser = String(entry.currentUserId || "").toLowerCase();
                const entryClient = String(entry.clientId || "").toLowerCase();
                const entryAction = `${entry.eventType || ""} ${entry.action || ""} ${entry.detail || ""}`.toLowerCase();
                if (userIdFilter && !entryUser.includes(userIdFilter)) {
                    return false;
                }
                if (clientIdFilter && !entryClient.includes(clientIdFilter)) {
                    return false;
                }
                if (actionFilter && !entryAction.includes(actionFilter)) {
                    return false;
                }
                return true;
            })
            .slice(0, limit)
            .map((entry) => {
                const liveClient = clientsById.get(entry.clientId);
                const lastSeenMs = liveClient?.lastSeenAt ? new Date(liveClient.lastSeenAt).getTime() : 0;
                const online = lastSeenMs > 0 && now - lastSeenMs <= ONLINE_THRESHOLD_MS;
                return {
                    ...entry,
                    online,
                    liveCurrentPage: String(liveClient?.currentPage || entry.currentPage || ""),
                    activeAppId: String(liveClient?.activeAppId || ""),
                    lastSeenAt: String(liveClient?.lastSeenAt || "")
                };
            });

        const acceptedUsers = Object.values(getTrackingAcceptedUsers(data))
            .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")));

        const liveUsersMap = new Map();
        clients.forEach((client) => {
            const userId = String(client?.currentUserId || "").trim();
            if (!userId || !client?.trackingAccepted) {
                return;
            }
            const existing = liveUsersMap.get(userId);
            const lastSeenAt = String(client?.lastSeenAt || "");
            if (!existing || lastSeenAt > existing.lastSeenAt) {
                liveUsersMap.set(userId, {
                    userId,
                    desktopName: String(client?.desktopName || ""),
                    limoreName: String(client?.limoreName || ""),
                    clientId: String(client?.clientId || ""),
                    currentPage: String(client?.currentPage || ""),
                    activeAppId: String(client?.activeAppId || ""),
                    lastSeenAt
                });
            }
        });
        const liveUsers = Array.from(liveUsersMap.values()).map((entry) => {
            const seenMs = entry.lastSeenAt ? new Date(entry.lastSeenAt).getTime() : 0;
            return {
                ...entry,
                online: seenMs > 0 && now - seenMs <= ONLINE_THRESHOLD_MS
            };
        }).sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")));

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            activities,
            acceptedUsers,
            liveUsers
        }));
        return;
    }

    if (pathname === "/api/admin-sync" && req.method === "POST") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        const data = readAdminData();
        const nextData = {
            ...data,
            state: {
                ...(data.state || {}),
                syncSignal: `sync-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
            }
        };
        writeAdminData(nextData);
        appendAdminAuditLog({
            type: "admin_sync_clients",
            username: getAdminSession(req)?.username || "unknown",
            role: getAdminSession(req)?.role || "unknown",
            ipAddress: getClientIp(req),
            detail: "Dong bo tat ca client"
        });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
            ok: true,
            syncSignal: nextData.state.syncSignal
        }));
        return;
    }

    if (pathname === "/api/admin-deploy-status") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        if (req.method === "GET") {
            const data = readAdminData();
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                status: getDeployStatus(data)
            }));
            return;
        }

        if (req.method === "POST") {
            if (!isSuperAdmin(req)) {
                res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chi Super Admin duoc sua deploy status" }));
                return;
            }
            try {
                const payload = await parseJsonBody(req);
                const data = readAdminData();
                const nextStatus = sanitizeDeployStatus({
                    ...getDeployStatus(data),
                    ...(payload?.status || payload || {}),
                    updatedAt: new Date().toISOString(),
                    source: "admin"
                }, DEFAULT_DEPLOY_STATUS);
                const nextData = {
                    ...data,
                    state: {
                        ...(data.state || {}),
                        deployStatus: nextStatus
                    }
                };
                writeAdminData(nextData);
                appendAdminAuditLog({
                    type: "admin_update_deploy_status",
                    username: getAdminSession(req)?.username || "unknown",
                    role: getAdminSession(req)?.role || "unknown",
                    ipAddress: getClientIp(req),
                    detail: `Deploy status ${nextStatus.state}`
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    status: nextStatus
                }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/admin-data/export" && req.method === "GET") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        const data = readAdminData();
        const payload = {
            exportedAt: new Date().toISOString(),
            data: {
                games: Array.isArray(data.games) ? data.games : [],
                packages: Array.isArray(data.packages) ? data.packages : [],
                users: sanitizeLimoreUsers(data.users),
                state: data?.state && typeof data.state === "object" ? data.state : {}
            }
        };
        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename=\"limore-admin-export-${new Date().toISOString().slice(0, 10)}.json\"`,
            "Cache-Control": "no-cache"
        });
        res.end(JSON.stringify(payload, null, 2));
        return;
    }

    if (pathname === "/api/admin-data/import" && req.method === "POST") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        if (!isSuperAdmin(req)) {
            res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Chi Super Admin duoc import du lieu" }));
            return;
        }
        try {
            const payload = await parseJsonBody(req);
            const incoming = payload?.data && typeof payload.data === "object" ? payload.data : payload;
            const data = readAdminData();
            const nextUsers = sanitizeLimoreUsers(incoming?.users, data.users);
            const nextState = {
                ...(data.state || {}),
                ...(incoming?.state || {})
            };
            const nextData = {
                ...data,
                games: Array.isArray(incoming?.games) ? incoming.games : (data.games || []),
                packages: Array.isArray(incoming?.packages) ? incoming.packages : (data.packages || []),
                users: nextUsers,
                state: nextState
            };
            writeAdminData(nextData);
            appendAdminAuditLog({
                type: "admin_import_data",
                username: getAdminSession(req)?.username || "unknown",
                role: getAdminSession(req)?.role || "unknown",
                ipAddress: getClientIp(req),
                detail: "Import admin data"
            });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, data: nextData }));
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        }
        return;
    }

    if (pathname === "/api/admin-alerts") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        if (req.method === "GET") {
            const data = readAdminData();
            const alerts = getIpAlerts(data)
                .sort((left, right) => String(right.at || "").localeCompare(String(left.at || "")))
                .slice(0, 120);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                alerts
            }));
            return;
        }

        if (req.method === "POST") {
            try {
                const payload = await parseJsonBody(req);
                const action = String(payload?.action || "").trim();
                const alertId = String(payload?.alertId || "").trim();
                const data = readAdminData();
                const alerts = getIpAlerts(data);
                let nextAlerts = alerts;
                if (action === "ack" && alertId) {
                    nextAlerts = alerts.map((alert) => alert.id === alertId ? { ...alert, ack: true } : alert);
                }
                if (action === "ack_all") {
                    nextAlerts = alerts.map((alert) => ({ ...alert, ack: true }));
                }
                const nextData = {
                    ...data,
                    state: {
                        ...(data.state || {}),
                        ipAlerts: nextAlerts
                    }
                };
                writeAdminData(nextData);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, alerts: nextAlerts }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/admin-dashboard" && req.method === "GET") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }
        const data = readAdminData();
        const stats = buildOnlineStats(getClientHistory(data));
        const mergedClients = mergeClientRows(data.clients);
        const concurrentLogins = buildConcurrentLoginAlerts(mergedClients);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            stats,
            concurrentLogins
        }));
        return;
    }

    if (pathname === "/api/admin-rollout") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        if (req.method === "GET") {
            const data = readAdminData();
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                rollout: getRolloutConfig(data)
            }));
            return;
        }

        if (req.method === "POST") {
            if (!isSuperAdmin(req)) {
                res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chi Super Admin duoc sua rollout" }));
                return;
            }
            try {
                const payload = await parseJsonBody(req);
                const data = readAdminData();
                const nextRollout = sanitizeRolloutConfig({
                    ...getRolloutConfig(data),
                    ...(payload?.rollout || payload || {}),
                    updatedAt: new Date().toISOString()
                });
                const nextData = {
                    ...data,
                    state: {
                        ...(data.state || {}),
                        rollout: nextRollout
                    }
                };
                writeAdminData(nextData);
                appendAdminAuditLog({
                    type: "admin_update_rollout",
                    username: getAdminSession(req)?.username || "unknown",
                    role: getAdminSession(req)?.role || "unknown",
                    ipAddress: getClientIp(req),
                    detail: `Rollout ${nextRollout.enabled ? "Bat" : "Tat"} ${nextRollout.percent}% (${nextRollout.stableVersion} -> ${nextRollout.latestVersion})`
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    rollout: nextRollout
                }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/limore-admin-data") {
        if (req.method === "GET") {
            const data = readAdminData();
            const clientId = String(req.headers["x-limore-client-id"] || "").trim();
            const clientIp = getClientIp(req);
            const clientUserBindings = getClientUserBindings(data);
            const ipUserBindings = getIpUserBindings(data);
            const rememberedCurrentUserId = clientUserBindings[clientId] || ipUserBindings[clientIp] || "";
            const rollout = resolveClientRollout(data, clientId, clientIp);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                data,
                rememberedCurrentUserId,
                rollout,
                syncSignal: String(data?.state?.syncSignal || ""),
                deployStatus: getDeployStatus(data)
            }));
            return;
        }

        if (req.method === "POST") {
            try {
                const payload = await parseJsonBody(req);
                if (payload?.state?.blockedClientIds !== undefined && !isAuthorizedAdmin(req)) {
                    res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "Admin auth required for blocked clients" }));
                    return;
                }
                if (payload?.state?.rollout !== undefined && !isAuthorizedAdmin(req)) {
                    res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "Admin auth required for rollout settings" }));
                    return;
                }
                if (payload?.state?.deployStatus !== undefined && !isAuthorizedAdmin(req)) {
                    res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "Admin auth required for deploy status" }));
                    return;
                }
                const existing = readAdminData();
                const payloadClients = Array.isArray(payload?.clients) ? payload.clients : [];
                const session = getAdminSession(req);
                const incomingUsers = Array.isArray(payload?.users) ? payload.users : null;
                const existingUsers = Array.isArray(existing?.users) ? existing.users : [];
                const canEditUserBalances = Boolean(session);
                const safeIncomingUsers = incomingUsers
                    ? sanitizeLimoreUsers(incomingUsers, existingUsers)
                    : sanitizeLimoreUsers(existingUsers);
                const nextUsers = safeIncomingUsers.map((entry) => ({
                    ...entry,
                    balance: canEditUserBalances
                        ? Number(entry?.balance || 0)
                        : Number(existingUsers.find((user) => String(user?.id || "") === String(entry?.id || ""))?.balance || 0),
                    locked: Boolean(entry?.locked)
                }));
                const nextData = {
                    ...existing,
                    ...payload,
                    users: nextUsers,
                    clients: mergeClientRows([...(existing.clients || []), ...payloadClients]),
                    state: {
                        ...(existing.state || {}),
                        ...(payload.state || {})
                    }
                };
                if (!isSuperAdmin(req)) {
                    nextData.state.rollout = getRolloutConfig(existing);
                    nextData.state.deployStatus = getDeployStatus(existing);
                } else if (payload?.state?.rollout !== undefined) {
                    nextData.state.rollout = sanitizeRolloutConfig({
                        ...getRolloutConfig(existing),
                        ...(payload?.state?.rollout || {}),
                        updatedAt: new Date().toISOString()
                    });
                }
                if (payload?.state?.deployStatus !== undefined && isSuperAdmin(req)) {
                    nextData.state.deployStatus = sanitizeDeployStatus({
                        ...getDeployStatus(existing),
                        ...(payload?.state?.deployStatus || {}),
                        updatedAt: new Date().toISOString(),
                        source: "admin"
                    }, DEFAULT_DEPLOY_STATUS);
                }
                writeAdminData(nextData);
                if (session) {
                    appendAdminAuditLog({
                        type: "admin_save_data",
                        username: session.username,
                        role: session.role,
                        ipAddress: getClientIp(req),
                        detail: "Luu cap nhat admin data"
                    });
                }
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, data: nextData }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    if (pathname === "/api/limore-client-activity" && req.method === "POST") {
        try {
            const payload = await parseJsonBody(req);
            const trackingAccepted = Boolean(payload?.trackingAccepted);
            if (!trackingAccepted) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, ignored: true }));
                return;
            }

            const rawEvents = Array.isArray(payload?.events) ? payload.events : [];
            const clientIp = getClientIp(req);
            const nowIso = new Date().toISOString();
            const normalizedEvents = rawEvents
                .slice(0, 80)
                .map((event) => {
                    const clientId = String(event?.clientId || "").trim();
                    if (!clientId) {
                        return null;
                    }
                    return {
                        at: String(event?.at || nowIso).trim() || nowIso,
                        clientId,
                        currentUserId: String(event?.currentUserId || "").trim(),
                        desktopName: String(event?.desktopName || "").trim(),
                        limoreName: String(event?.limoreName || "").trim(),
                        deviceType: String(event?.deviceType || "unknown").trim() || "unknown",
                        isMobile: Boolean(event?.isMobile),
                        currentPage: String(event?.currentPage || "").trim(),
                        eventType: String(event?.eventType || "unknown").trim().slice(0, 64) || "unknown",
                        action: String(event?.action || "").trim().slice(0, 120),
                        detail: String(event?.detail || "").trim().slice(0, 240),
                        targetTitle: String(event?.targetTitle || "").trim().slice(0, 120),
                        ipAddress: clientIp
                    };
                })
                .filter(Boolean);

            if (!normalizedEvents.length) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, ignored: true }));
                return;
            }

            const data = readAdminData();
            const existingHistory = getClientActivityHistory(data);
            const existingAcceptedUsers = getTrackingAcceptedUsers(data);
            const nextAcceptedUsers = { ...existingAcceptedUsers };

            normalizedEvents.forEach((event) => {
                if (!event.currentUserId) {
                    return;
                }
                const currentEntry = nextAcceptedUsers[event.currentUserId] || {
                    userId: event.currentUserId,
                    desktopName: "",
                    limoreName: "",
                    acceptedAt: "",
                    lastSeenAt: "",
                    clientIds: []
                };
                const nextClientIds = Array.isArray(currentEntry.clientIds) ? currentEntry.clientIds.slice() : [];
                if (!nextClientIds.includes(event.clientId)) {
                    nextClientIds.push(event.clientId);
                }
                nextAcceptedUsers[event.currentUserId] = {
                    userId: event.currentUserId,
                    desktopName: event.desktopName || currentEntry.desktopName || "",
                    limoreName: event.limoreName || currentEntry.limoreName || "",
                    acceptedAt: currentEntry.acceptedAt || event.at,
                    lastSeenAt: event.at || currentEntry.lastSeenAt || "",
                    clientIds: Array.from(new Set(nextClientIds)).slice(0, 40)
                };
            });

            const nextHistory = [...normalizedEvents, ...existingHistory]
                .sort((left, right) => String(right.at || "").localeCompare(String(left.at || "")))
                .slice(0, MAX_CLIENT_ACTIVITY_ROWS);
            const nextData = {
                ...data,
                state: {
                    ...(data.state || {}),
                    clientActivityHistory: nextHistory,
                    trackingAcceptedUsers: nextAcceptedUsers
                }
            };
            writeAdminData(nextData);

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, stored: normalizedEvents.length }));
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        }
        return;
    }

    if (pathname === "/api/limore-stats" && req.method === "GET") {
        const data = readAdminData();
        const clients = mergeClientRows(data.clients);
        const now = Date.now();
        const onlineCount = clients.filter((client) => {
            const lastSeen = Date.parse(client?.lastSeenAt || "");
            return Number.isFinite(lastSeen) && now - lastSeen <= ONLINE_THRESHOLD_MS;
        }).length;

        const historyRows = Array.isArray(data?.state?.clientHistory) ? data.state.clientHistory : [];
        const uniqueVisitors = new Set(
            historyRows.map((row) => String(row?.clientId || "").trim()).filter(Boolean)
        );
        const totalVisitors = uniqueVisitors.size || clients.length;

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            online: onlineCount,
            total: totalVisitors
        }));
        return;
    }

    if (pathname === "/api/limore-clients") {
        if (req.method === "GET") {
            if (!isAuthorizedAdmin(req)) {
                res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
                return;
            }
            const data = readAdminData();
            const mergedClients = mergeClientRows(data.clients);
            const existingClients = Array.isArray(data.clients) ? data.clients : [];
            if (JSON.stringify(existingClients) !== JSON.stringify(mergedClients)) {
                writeAdminData({
                    ...data,
                    clients: mergedClients
                });
            }
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                clients: mergedClients
            }));
            return;
        }

        if (req.method === "POST") {
            try {
                const payload = await parseJsonBody(req);
                const data = readAdminData();
                const currentClients = mergeClientRows(data.clients);
                const clientId = String(payload.clientId || "").trim();
                const clientIp = getClientIp(req);
                if (!clientId) {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "clientId is required" }));
                    return;
                }

                const firewallRules = getFirewallRules(data);
                const blockedByFirewall = isIpBlocked(clientIp, firewallRules);
                const rollout = resolveClientRollout(data, clientId, clientIp);

                const userIndex = buildUserIndex(data?.users);
                const currentUser = userIndex.get(String(payload.currentUserId || "").trim());
                const userLocked = Boolean(currentUser?.locked);
                const nextClient = {
                    clientId,
                    ipAddress: clientIp,
                    deviceType: String(payload.deviceType || "unknown"),
                    userAgent: String(payload.userAgent || ""),
                    currentPage: String(payload.currentPage || ""),
                    activeAppId: String(payload.activeAppId || ""),
                    desktopName: String(payload.desktopName || ""),
                    limoreName: String(payload.limoreName || ""),
                    currentUserId: String(payload.currentUserId || ""),
                    setupComplete: Boolean(payload.setupComplete),
                    isMobile: Boolean(payload.isMobile),
                    anonymous: Boolean(payload.anonymous),
                    trackingAccepted: Boolean(payload.trackingAccepted),
                    rolloutChannel: rollout.channel,
                    rolloutVersion: rollout.assignedVersion,
                    rolloutBucket: rollout.bucket,
                    lastSeenAt: new Date().toISOString()
                };

                const nextClientFingerprint = buildClientFingerprint(nextClient);
                const historyRows = getClientHistory(data);
                const nextHistoryRows = [
                    {
                        at: nextClient.lastSeenAt,
                        clientId: nextClient.clientId,
                        fingerprint: nextClientFingerprint,
                        ipAddress: nextClient.ipAddress,
                        currentUserId: nextClient.currentUserId,
                        currentPage: nextClient.currentPage,
                        deviceType: nextClient.deviceType,
                        isMobile: nextClient.isMobile,
                        blockedByFirewall
                    },
                    ...historyRows
                ].slice(0, 6000);

                if (blockedByFirewall) {
                    const blockedData = {
                        ...data,
                        state: {
                            ...(data.state || {}),
                            clientHistory: nextHistoryRows
                        }
                    };
                    writeAdminData(blockedData);
                    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({
                        ok: true,
                        blocked: true,
                        blockedByFirewall: true,
                        rollout
                    }));
                    return;
                }

                const existingIndex = currentClients.findIndex((client) =>
                    client.clientId === clientId ||
                    buildClientFingerprint(client) === nextClientFingerprint
                );
                if (existingIndex >= 0) {
                    currentClients[existingIndex] = {
                        ...currentClients[existingIndex],
                        ...nextClient
                    };
                } else {
                    currentClients.push(nextClient);
                }

                const mergedClients = mergeClientRows(currentClients);

                const nextData = {
                    ...data,
                    clients: mergedClients.slice(0, 100),
                    state: {
                        ...(data.state || {}),
                        clientHistory: nextHistoryRows
                    }
                };

                if (nextClient.setupComplete && nextClient.currentUserId) {
                    nextData.state.clientUserBindings = {
                        ...getClientUserBindings(nextData),
                        [clientId]: nextClient.currentUserId
                    };

                    if (nextClient.ipAddress) {
                        nextData.state.ipUserBindings = {
                            ...getIpUserBindings(nextData),
                            [nextClient.ipAddress]: nextClient.currentUserId
                        };
                    }
                }

                if (nextClient.setupComplete && nextClient.currentUserId && nextClient.ipAddress) {
                    const knownIpsByUser = getKnownIpsByUser(nextData);
                    const userId = nextClient.currentUserId;
                    const knownUserIps = Array.isArray(knownIpsByUser[userId]) ? knownIpsByUser[userId] : [];
                    const isNewIp = !knownUserIps.includes(nextClient.ipAddress);
                    const hadKnownIp = knownUserIps.length > 0;
                    const nextKnownIps = Array.from(new Set([...knownUserIps, nextClient.ipAddress])).slice(0, 40);
                    nextData.state.knownIpsByUser = {
                        ...knownIpsByUser,
                        [userId]: nextKnownIps
                    };

                    if (isNewIp && hadKnownIp) {
                        const existingAlerts = getIpAlerts(nextData);
                        const alreadyExists = existingAlerts.some((alert) =>
                            !alert.ack
                            && alert.userId === userId
                            && alert.ipAddress === nextClient.ipAddress
                        );
                        if (!alreadyExists) {
                            nextData.state.ipAlerts = [
                                {
                                    id: `alert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
                                    at: nextClient.lastSeenAt,
                                    userId,
                                    ipAddress: nextClient.ipAddress,
                                    ack: false,
                                    reason: "ip_moi"
                                },
                                ...existingAlerts
                            ].slice(0, 300);
                        }
                    }
                }

                if (nextClient.trackingAccepted && nextClient.currentUserId) {
                    const acceptedUsers = getTrackingAcceptedUsers(nextData);
                    const currentAccepted = acceptedUsers[nextClient.currentUserId] || {
                        userId: nextClient.currentUserId,
                        desktopName: "",
                        limoreName: "",
                        acceptedAt: "",
                        lastSeenAt: "",
                        clientIds: []
                    };
                    const acceptedClientIds = Array.isArray(currentAccepted.clientIds)
                        ? currentAccepted.clientIds.slice()
                        : [];
                    if (!acceptedClientIds.includes(nextClient.clientId)) {
                        acceptedClientIds.push(nextClient.clientId);
                    }
                    nextData.state.trackingAcceptedUsers = {
                        ...acceptedUsers,
                        [nextClient.currentUserId]: {
                            userId: nextClient.currentUserId,
                            desktopName: nextClient.desktopName || currentAccepted.desktopName || "",
                            limoreName: nextClient.limoreName || currentAccepted.limoreName || "",
                            acceptedAt: currentAccepted.acceptedAt || nextClient.lastSeenAt,
                            lastSeenAt: nextClient.lastSeenAt,
                            clientIds: Array.from(new Set(acceptedClientIds)).slice(0, 40)
                        }
                    };
                }

                const blockedClientIds = getBlockedClientIds(nextData);
                writeAdminData(nextData);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    blocked: blockedClientIds.includes(clientId),
                    blockedByFirewall: false,
                    rollout,
                    userLocked
                }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
            }
            return;
        }
    }

    const targetPath = pathname === "/" ? "index.html" : pathname;
    const resolvedPath = safeResolvePath(targetPath);
    if (!resolvedPath) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
    }

    fs.stat(resolvedPath, (err, stat) => {
        if (!err && stat.isFile()) {
            sendFile(res, resolvedPath);
            return;
        }

        if (pathname.startsWith("/api/")) {
            res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "API endpoint not found" }));
            return;
        }

        // Missing static file should be 404, not index fallback.
        if (path.extname(pathname)) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not Found");
            return;
        }

        // SPA-like fallback to index for unknown app routes.
        sendFile(res, path.join(ROOT_DIR, "index.html"));
    });
});

server.listen(PORT, HOST, () => {
    console.log("");
    console.log("Win11 LAN server is running:");
    console.log(`- Local:   http://localhost:${PORT}`);
    console.log(`- Admin:   http://localhost:${PORT}/admin.html`);
    if (lanAddresses.length > 0) {
        lanAddresses.forEach((ip) => {
            console.log(`- LAN:     http://${ip}:${PORT}`);
            console.log(`- Admin:   http://${ip}:${PORT}/admin.html`);
        });
    } else {
        console.log("- LAN:     (No IPv4 address found)");
    }
    console.log("");
    console.log("Open one LAN URL above on iOS Safari / Android Chrome.");
});

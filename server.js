const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT_DIR = __dirname;
const lanAddresses = getLocalIPv4Addresses();
const LAN_GUIDE_PATH = path.join(ROOT_DIR, "lan-links.txt");
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
            desktopName: String(client?.desktopName || ""),
            limoreName: String(client?.limoreName || ""),
            currentUserId: String(client?.currentUserId || ""),
            setupComplete: Boolean(client?.setupComplete),
            isMobile: Boolean(client?.isMobile),
            anonymous: Boolean(client?.anonymous),
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
    const rows = [["clientId", "deviceType", "desktopName", "limoreName", "currentUserId", "ipAddress", "currentPage", "isMobile", "anonymous", "lastSeenAt", "userAgent"]];
    (Array.isArray(clients) ? clients : []).forEach((client) => {
        rows.push([
            client.clientId || "",
            client.deviceType || "",
            client.desktopName || "",
            client.limoreName || "",
            client.currentUserId || "",
            client.ipAddress || "",
            client.currentPage || "",
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

function writeLanGuideFile() {
    const lines = [
        "WIN11 LAN LINKS",
        "",
        `Local: http://localhost:${PORT}`,
        `Local Admin: http://localhost:${PORT}/admin.html`,
        ""
    ];

    if (lanAddresses.length > 0) {
        lines.push("LAN:");
        lanAddresses.forEach((ip) => {
            lines.push(`http://${ip}:${PORT}`);
            lines.push(`http://${ip}:${PORT}/admin.html`);
        });
    } else {
        lines.push("LAN:");
        lines.push("(No IPv4 LAN address found)");
    }

    lines.push("");
    lines.push("IOS SAFARI:");
    lines.push("1. Open one LAN link above directly in Safari.");
    lines.push("2. Make sure iPhone and PC use the same Wi-Fi.");
    lines.push("3. If iPhone asks for Local Network access, tap Allow.");
    lines.push("4. If Windows Firewall asks, allow Private network access.");
    lines.push("5. Use the direct LAN link, not localhost.");

    try {
        fs.writeFileSync(LAN_GUIDE_PATH, lines.join(os.EOL), "utf8");
    } catch (error) {
        console.error("Could not write lan-links.txt");
    }
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
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({
            ok: true,
            stats
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
                rollout
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
                const existing = readAdminData();
                const payloadClients = Array.isArray(payload?.clients) ? payload.clients : [];
                const session = getAdminSession(req);
                const incomingUsers = Array.isArray(payload?.users) ? payload.users : null;
                const existingUsers = Array.isArray(existing?.users) ? existing.users : [];
                const nextUsers = incomingUsers
                    ? incomingUsers.map((entry) => ({
                        ...entry,
                        balance: session?.role === "super_admin"
                            ? Number(entry?.balance || 0)
                            : Number(existingUsers.find((user) => String(user?.id || "") === String(entry?.id || ""))?.balance || 0)
                    }))
                    : existingUsers;
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
                } else if (payload?.state?.rollout !== undefined) {
                    nextData.state.rollout = sanitizeRolloutConfig({
                        ...getRolloutConfig(existing),
                        ...(payload?.state?.rollout || {}),
                        updatedAt: new Date().toISOString()
                    });
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

                const nextClient = {
                    clientId,
                    ipAddress: clientIp,
                    deviceType: String(payload.deviceType || "unknown"),
                    userAgent: String(payload.userAgent || ""),
                    currentPage: String(payload.currentPage || ""),
                    desktopName: String(payload.desktopName || ""),
                    limoreName: String(payload.limoreName || ""),
                    currentUserId: String(payload.currentUserId || ""),
                    setupComplete: Boolean(payload.setupComplete),
                    isMobile: Boolean(payload.isMobile),
                    anonymous: Boolean(payload.anonymous),
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

                const blockedClientIds = getBlockedClientIds(nextData);
                writeAdminData(nextData);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    blocked: blockedClientIds.includes(clientId),
                    blockedByFirewall: false,
                    rollout
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

        // SPA-like fallback to index for unknown routes.
        sendFile(res, path.join(ROOT_DIR, "index.html"));
    });
});

writeLanGuideFile();

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
    console.log(`Saved LAN links to: ${LAN_GUIDE_PATH}`);
    console.log("Open one LAN URL above on iOS Safari / Android Chrome.");
    console.log("If Windows Firewall asks, allow Private network access.");
});

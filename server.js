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
const DEFAULT_ADMIN_PASSWORD = "12345";
const adminSessions = new Set();

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
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300",
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
}

function readAdminAuthConfig() {
    try {
        const raw = fs.readFileSync(ADMIN_AUTH_PATH, "utf8");
        const parsed = JSON.parse(raw);
        return {
            password: String(parsed?.password || DEFAULT_ADMIN_PASSWORD)
        };
    } catch (error) {
        return {
            password: DEFAULT_ADMIN_PASSWORD
        };
    }
}

function writeAdminAuthConfig(config) {
    ensureDataDir();
    fs.writeFileSync(ADMIN_AUTH_PATH, JSON.stringify({
        password: String(config?.password || DEFAULT_ADMIN_PASSWORD)
    }, null, 2), "utf8");
}

function getAdminToken(req) {
    return String(req.headers["x-admin-token"] || "").trim();
}

function isAuthorizedAdmin(req) {
    const token = getAdminToken(req);
    return Boolean(token) && adminSessions.has(token);
}

function createAdminSessionToken() {
    return `admin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getBlockedClientIds(data) {
    return Array.isArray(data?.state?.blockedClientIds)
        ? data.state.blockedClientIds.map((value) => String(value || "").trim()).filter(Boolean)
        : [];
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

function mergeClientRows(clients) {
    const byClientId = new Map();
    const byFingerprint = new Map();

    (Array.isArray(clients) ? clients : []).forEach((client) => {
        const normalizedClient = {
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
            lastSeenAt: String(client?.lastSeenAt || "")
        };

        const clientId = normalizedClient.clientId;
        const fingerprint = buildClientFingerprint(normalizedClient);
        const existing =
            (clientId && byClientId.get(clientId)) ||
            byFingerprint.get(fingerprint);

        if (existing) {
            const existingLastSeenAt = new Date(existing.lastSeenAt || 0).getTime();
            const incomingLastSeenAt = new Date(normalizedClient.lastSeenAt || 0).getTime();
            const newerClient = incomingLastSeenAt >= existingLastSeenAt ? normalizedClient : existing;
            const olderClient = newerClient === normalizedClient ? existing : normalizedClient;
            const mergedClient = {
                ...olderClient,
                ...newerClient
            };

            if (!mergedClient.clientId) {
                mergedClient.clientId = newerClient.clientId || olderClient.clientId;
            }

            if (clientId) {
                byClientId.set(clientId, mergedClient);
            }
            if (mergedClient.clientId) {
                byClientId.set(mergedClient.clientId, mergedClient);
            }
            byFingerprint.set(buildClientFingerprint(mergedClient), mergedClient);
            return;
        }

        if (clientId) {
            byClientId.set(clientId, normalizedClient);
        }
        byFingerprint.set(fingerprint, normalizedClient);
    });

    return Array.from(new Set(byFingerprint.values()))
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")));
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
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    if (pathname === "/api/admin-auth/login" && req.method === "POST") {
        try {
            const payload = await parseJsonBody(req);
            const adminAuthConfig = readAdminAuthConfig();
            if (String(payload.password || "") !== adminAuthConfig.password) {
                res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Sai mat khau admin" }));
                return;
            }

            const token = createAdminSessionToken();
            adminSessions.add(token);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({ ok: true, token }));
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        }
        return;
    }

    if (pathname === "/api/admin-auth/change-password" && req.method === "POST") {
        if (!isAuthorizedAdmin(req)) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
            return;
        }

        try {
            const payload = await parseJsonBody(req);
            const currentPassword = String(payload.currentPassword || "");
            const nextPassword = String(payload.newPassword || "").trim();
            const adminAuthConfig = readAdminAuthConfig();

            if (currentPassword !== adminAuthConfig.password) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Mat khau hien tai khong dung" }));
                return;
            }

            if (nextPassword.length < 4) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Mat khau moi phai tu 4 ky tu" }));
                return;
            }

            writeAdminAuthConfig({ password: nextPassword });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true }));
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Invalid JSON payload" }));
        }
        return;
    }

    if (pathname === "/api/limore-admin-data") {
        if (req.method === "GET") {
            const data = readAdminData();
            const clientId = String(req.headers["x-limore-client-id"] || "").trim();
            const clientIp = getClientIp(req);
            const clientUserBindings = getClientUserBindings(data);
            const ipUserBindings = getIpUserBindings(data);
            const rememberedCurrentUserId = clientUserBindings[clientId] || ipUserBindings[clientIp] || "";
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
            res.end(JSON.stringify({
                ok: true,
                data,
                rememberedCurrentUserId
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
                const existing = readAdminData();
                const nextData = {
                    ...existing,
                    ...payload,
                    clients: Array.isArray(payload.clients) ? payload.clients : (existing.clients || []),
                    state: {
                        ...(existing.state || {}),
                        ...(payload.state || {})
                    }
                };
                writeAdminData(nextData);
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
                if (!clientId) {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: false, error: "clientId is required" }));
                    return;
                }

                const nextClient = {
                    clientId,
                    ipAddress: getClientIp(req),
                    deviceType: String(payload.deviceType || "unknown"),
                    userAgent: String(payload.userAgent || ""),
                    currentPage: String(payload.currentPage || ""),
                    desktopName: String(payload.desktopName || ""),
                    limoreName: String(payload.limoreName || ""),
                    currentUserId: String(payload.currentUserId || ""),
                    setupComplete: Boolean(payload.setupComplete),
                    isMobile: Boolean(payload.isMobile),
                    anonymous: Boolean(payload.anonymous),
                    lastSeenAt: new Date().toISOString()
                };

                const nextClientFingerprint = buildClientFingerprint(nextClient);
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
                        ...(data.state || {})
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

                const blockedClientIds = getBlockedClientIds(nextData);
                writeAdminData(nextData);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({
                    ok: true,
                    blocked: blockedClientIds.includes(clientId)
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

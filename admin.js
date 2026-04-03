const LIMORE_ADMIN_DATA_KEY = "win11_limore_admin_data_v1";
const STEAM_ASSET_BASE_URL = "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps";
const LIMORE_ADMIN_DATA_API = "/api/limore-admin-data";
const LIMORE_CLIENTS_API = "/api/limore-clients";
const ADMIN_AUTH_LOGIN_API = "/api/admin-auth/login";
const ADMIN_AUTH_VERIFY_API = "/api/admin-auth/verify";
const ADMIN_AUTH_CHANGE_PASSWORD_API = "/api/admin-auth/change-password";
const ADMIN_TOKEN_KEY = "win11_admin_session_token_v1";

const defaultGames = [
    { appId: 730, title: "Counter-Strike 2", genre: "FPS Tactical", release: "2012", sections: "home games played settings" },
    { appId: 3321460, title: "Crimson Desert", genre: "Open World Action", release: "2026", sections: "home games" },
    { appId: 1172470, title: "Apex Legends", genre: "Hero Shooter", release: "2020", sections: "home games played settings" },
    { appId: 2868840, title: "Slay the Spire 2", genre: "Deckbuilder Roguelike", release: "2026", sections: "home games saves" },
    { appId: 578080, title: "PUBG: BATTLEGROUNDS", genre: "Battle Royale", release: "2017", sections: "home games played" },
    { appId: 230410, title: "Warframe", genre: "Co-op Action", release: "2013", sections: "games played settings" },
    { appId: 1808500, title: "ARC Raiders", genre: "Extraction Adventure", release: "2025", sections: "home games played" },
    { appId: 1174180, title: "Red Dead Redemption 2", genre: "Open World Western", release: "2019", sections: "games played saves" },
    { appId: 2767030, title: "Marvel Rivals", genre: "Team PvP Shooter", release: "2024", sections: "home games played settings" },
    { appId: 2479810, title: "Gray Zone Warfare", genre: "Tactical Extraction", release: "2024", sections: "games played settings" },
    { appId: 3240220, title: "Grand Theft Auto V Enhanced", genre: "Open World Crime", release: "2025", sections: "home games played saves" },
    { appId: 3764200, title: "Resident Evil Requiem", genre: "Survival Horror", release: "2026", sections: "home games saves" },
    { appId: 381210, title: "Dead by Daylight", genre: "Asym Horror", release: "2016", sections: "games played" },
    { appId: 553850, title: "HELLDIVERS 2", genre: "Co-op Shooter", release: "2024", sections: "home games played settings" },
    { appId: 570, title: "Dota 2", genre: "MOBA", release: "2013", sections: "games played settings" },
    { appId: 359550, title: "Rainbow Six Siege", genre: "Tactical FPS", release: "2015", sections: "games played settings" },
    { appId: 252490, title: "Rust", genre: "Survival Sandbox", release: "2018", sections: "home games played saves" },
    { appId: 1144200, title: "Ready or Not", genre: "Tactical Breach FPS", release: "2023", sections: "games played settings" },
    { appId: 1086940, title: "Baldur's Gate 3", genre: "CRPG", release: "2023", sections: "home games saves" },
    { appId: 2358720, title: "Black Myth: Wukong", genre: "Action RPG", release: "2024", sections: "home games played saves" },
    { appId: 1245620, title: "ELDEN RING", genre: "Action RPG", release: "2022", sections: "home games played saves" }
];

const defaultPackages = [
    {
        id: "starter",
        badge: "1 THANG",
        title: "Starter VN Cloud",
        price: 129000,
        vnPriceLabel: "129k",
        globalPriceLabel: "$12.99",
        description: "Phu hop cho nguoi moi can choi game AAA, esports va stream on dinh moi ngay.",
        specs: [
            "CPU Ryzen 7 7800X3D",
            "GPU RTX 4070 12GB",
            "RAM 32GB DDR5",
            "SSD NVMe 1TB toc do cao",
            "1080p / 1440p, do tre thap"
        ],
        featured: false
    },
    {
        id: "pro",
        badge: "2 THANG",
        title: "Pro Duo Power",
        price: 219000,
        vnPriceLabel: "219k",
        globalPriceLabel: "$23.99",
        description: "Goi tiet kiem nhat cho nguoi choi thuong xuyen, uu tien FPS on dinh va cloud save.",
        specs: [
            "CPU Ryzen 9 7900",
            "GPU RTX 4070 SUPER",
            "RAM 32GB DDR5 dual-channel",
            "SSD NVMe Gen4 1TB",
            "Ho tro choi game nang, stream Discord"
        ],
        featured: true
    },
    {
        id: "ultimate",
        badge: "VINH VIEN",
        title: "Ultimate Lifetime",
        price: 699000,
        vnPriceLabel: "699k",
        globalPriceLabel: "$55.99",
        description: "Danh cho nguoi muon dau tu 1 lan de dung lau dai voi cau hinh manh va uu tien tai nguyen.",
        specs: [
            "CPU Ryzen 9 7950X / tuong duong",
            "GPU RTX 4080 class",
            "RAM 64GB DDR5",
            "SSD NVMe 2TB + cloud backup",
            "Uu tien may chu, phu hop AAA va mod"
        ],
        featured: false
    }
];

const defaultState = {
    currentUserId: "dzminh",
    setupComplete: false,
    blockedClientIds: []
};

const defaultUsers = [
    {
        id: "dzminh",
        desktopName: "Dz Minh",
        limoreName: "Anonymous",
        balance: 0,
        activePackageId: ""
    }
];

const balanceInput = document.getElementById("balance-input");
const activePackageInput = document.getElementById("active-package-input");
const currentUserInput = document.getElementById("current-user-input");
const desktopNameInput = document.getElementById("desktop-name-input");
const limoreNameInput = document.getElementById("limore-name-input");
const packagesForm = document.getElementById("packages-form");
const gamesTableBody = document.getElementById("games-table-body");
const usersTableBody = document.getElementById("users-table-body");
const clientsTableBody = document.getElementById("clients-table-body");
const saveAllButton = document.getElementById("save-all-button");
const resetDefaultsButton = document.getElementById("reset-defaults-button");
const addGameButton = document.getElementById("add-game-button");
const addUserButton = document.getElementById("add-user-button");
const newGameAppIdInput = document.getElementById("new-game-appid");
const newGameTitleInput = document.getElementById("new-game-title");
const newGameGenreInput = document.getElementById("new-game-genre");
const newGameReleaseInput = document.getElementById("new-game-release");
const newGameSectionsInput = document.getElementById("new-game-sections");
const newUserIdInput = document.getElementById("new-user-id");
const newUserDesktopNameInput = document.getElementById("new-user-desktop-name");
const newUserLimoreNameInput = document.getElementById("new-user-limore-name");
const overviewBalance = document.getElementById("overview-balance");
const overviewPackage = document.getElementById("overview-package");
const overviewGames = document.getElementById("overview-games");
const adminStatus = document.getElementById("admin-status");
const adminShell = document.getElementById("admin-shell");
const adminAuthScreen = document.getElementById("admin-auth-screen");
const adminLoginForm = document.getElementById("admin-login-form");
const adminPasswordInput = document.getElementById("admin-password-input");
const adminLoginButton = document.getElementById("admin-login-button");
const adminAuthError = document.getElementById("admin-auth-error");
const adminCurrentPasswordInput = document.getElementById("admin-current-password");
const adminNewPasswordInput = document.getElementById("admin-new-password");
const adminConfirmPasswordInput = document.getElementById("admin-confirm-password");
const changePasswordButton = document.getElementById("change-password-button");
const adminNavButtons = Array.from(document.querySelectorAll(".admin-nav-btn[data-admin-section-target]"));
const adminSections = Array.from(document.querySelectorAll(".admin-section[data-admin-section]"));

let adminData = loadAdminData();
let clientRows = [];
let adminToken = "";
let adminLiveSyncTimer = 0;
let activeAdminSection = "overview";

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function buildSteamHeaderImage(appId) {
    return `${STEAM_ASSET_BASE_URL}/${appId}/header.jpg`;
}

function getDefaultAdminData() {
    return {
        games: cloneJson(defaultGames),
        packages: cloneJson(defaultPackages),
        users: cloneJson(defaultUsers),
        state: cloneJson(defaultState)
    };
}

function sanitizeUsers(users) {
    const nextUsers = (Array.isArray(users) ? users : []).map((user, index) => ({
        id: String(user?.id || `user${index + 1}`).trim() || `user${index + 1}`,
        desktopName: String(user?.desktopName || `User ${index + 1}`).trim() || `User ${index + 1}`,
        limoreName: String(user?.limoreName || "Anonymous").trim() || "Anonymous",
        balance: Number(user?.balance) || 0,
        activePackageId: String(user?.activePackageId || "")
    })).filter((user, index, array) => array.findIndex((item) => item.id === user.id) === index);

    return nextUsers.length ? nextUsers : cloneJson(defaultUsers);
}

function getCurrentUser() {
    return adminData.users.find((user) => user.id === adminData.state.currentUserId) || adminData.users[0];
}

function mergeAdminData(rawData = {}) {
    const defaults = getDefaultAdminData();
    const legacyBalance = Number(rawData?.state?.balance) || 0;
    const legacyActivePackageId = String(rawData?.state?.activePackageId || "");
    const nextUsers = Array.isArray(rawData?.users) && rawData.users.length
        ? rawData.users
        : [{
            ...defaultUsers[0],
            balance: legacyBalance,
            activePackageId: legacyActivePackageId
        }];
    return {
        games: Array.isArray(rawData?.games) && rawData.games.length ? rawData.games : defaults.games,
        packages: Array.isArray(rawData?.packages) && rawData.packages.length ? rawData.packages : defaults.packages,
        users: sanitizeUsers(nextUsers),
        clients: Array.isArray(rawData?.clients) ? rawData.clients : [],
        state: {
            currentUserId: String(rawData?.state?.currentUserId || defaults.state.currentUserId),
            setupComplete: rawData?.state?.setupComplete === undefined ? true : Boolean(rawData?.state?.setupComplete),
            blockedClientIds: Array.isArray(rawData?.state?.blockedClientIds)
                ? rawData.state.blockedClientIds.map((value) => String(value || "").trim()).filter(Boolean)
                : []
        }
    };
}

function getAuthHeaders(includeJson = true) {
    const headers = {};
    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }
    if (adminToken) {
        headers["x-admin-token"] = adminToken;
    }
    return headers;
}

function storeAdminToken(token) {
    adminToken = String(token || "");
    if (!adminToken) {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        return;
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
}

function setAdminLockedState(message = "") {
    window.clearInterval(adminLiveSyncTimer);
    adminShell?.setAttribute("hidden", "");
    adminAuthScreen?.removeAttribute("hidden");
    if (adminAuthError) {
        adminAuthError.textContent = message;
    }
    adminPasswordInput?.focus();
}

function setAdminUnlockedState() {
    adminAuthScreen?.setAttribute("hidden", "");
    adminShell?.removeAttribute("hidden");
    if (adminAuthError) {
        adminAuthError.textContent = "";
    }
}

function loadAdminData() {
    try {
        const raw = localStorage.getItem(LIMORE_ADMIN_DATA_KEY);
        return mergeAdminData(raw ? JSON.parse(raw) : {});
    } catch (error) {
        return getDefaultAdminData();
    }
}

function buildNoCacheUrl(baseUrl) {
    const separator = String(baseUrl || "").includes("?") ? "&" : "?";
    return `${baseUrl}${separator}t=${Date.now()}`;
}

async function fetchAdminDataFromServer() {
    try {
        const response = await fetch(buildNoCacheUrl(LIMORE_ADMIN_DATA_API), { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Could not load admin data");
        }
        const payload = await response.json();
        adminData = mergeAdminData(payload?.data || {});
    } catch (error) {
        adminData = loadAdminData();
    }
}

async function saveAdminData() {
    const response = await fetch(LIMORE_ADMIN_DATA_API, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData)
    });
    if (response.status === 401 || response.status === 403) {
        throw new Error("admin_auth_required");
    }
    if (!response.ok) {
        throw new Error("Could not save admin data");
    }
}

async function fetchClientRows() {
    try {
        const response = await fetch(buildNoCacheUrl(LIMORE_CLIENTS_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("Could not load clients");
        }
        const payload = await response.json();
        clientRows = Array.isArray(payload?.clients) ? payload.clients : [];
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        clientRows = Array.isArray(adminData.clients) ? adminData.clients : [];
    }
}

function formatBalance(value) {
    const numericValue = Number(value) || 0;
    if (numericValue <= 0) {
        return "0d";
    }
    if (numericValue >= 1000000) {
        return `${(numericValue / 1000000).toFixed(1).replace(".0", "")}m`;
    }
    if (numericValue >= 1000) {
        return `${Math.round(numericValue / 1000)}k`;
    }
    return `${numericValue}d`;
}

function showStatus(message) {
    adminStatus.textContent = message;
    adminStatus.classList.add("show");
    window.clearTimeout(showStatus._timer);
    showStatus._timer = window.setTimeout(() => {
        adminStatus.classList.remove("show");
    }, 1800);
}

function getBlockedClientIds() {
    return Array.isArray(adminData?.state?.blockedClientIds)
        ? adminData.state.blockedClientIds
        : [];
}

function renderOverview() {
    const currentUser = getCurrentUser();
    overviewBalance.textContent = formatBalance(currentUser?.balance || 0);
    overviewGames.textContent = String(adminData.games.length);
    const activePackage = adminData.packages.find((pkg) => pkg.id === currentUser?.activePackageId);
    overviewPackage.textContent = activePackage ? activePackage.title : "Chua co";
}

function renderAccountForm() {
    const currentUser = getCurrentUser();
    currentUserInput.innerHTML = adminData.users.map((user) => `<option value="${user.id}">${user.desktopName}</option>`).join("");
    currentUserInput.value = adminData.state.currentUserId || currentUser?.id || "";
    desktopNameInput.value = currentUser?.desktopName || "";
    limoreNameInput.value = currentUser?.limoreName || "";
    balanceInput.value = String(currentUser?.balance || 0);
    activePackageInput.innerHTML = `
        <option value="">Chua co goi</option>
        ${adminData.packages.map((pkg) => `<option value="${pkg.id}">${pkg.title}</option>`).join("")}
    `;
    activePackageInput.value = currentUser?.activePackageId || "";
}

function renderPackagesForm() {
    packagesForm.innerHTML = adminData.packages.map((pkg) => `
        <article class="package-editor" data-package-id="${pkg.id}">
            <div>
                <div class="package-editor-meta">${pkg.id}</div>
                <h3>${pkg.title}</h3>
            </div>
            <label class="field">
                <span>Badge</span>
                <input type="text" data-field="badge" value="${pkg.badge}">
            </label>
            <label class="field">
                <span>Ten goi</span>
                <input type="text" data-field="title" value="${pkg.title}">
            </label>
            <label class="field">
                <span>Gia VN thuc te</span>
                <input type="number" min="0" step="1000" data-field="price" value="${pkg.price}">
            </label>
            <label class="field">
                <span>Gia hien thi VN</span>
                <input type="text" data-field="vnPriceLabel" value="${pkg.vnPriceLabel}">
            </label>
            <label class="field">
                <span>Gia Global</span>
                <input type="text" data-field="globalPriceLabel" value="${pkg.globalPriceLabel}">
            </label>
            <label class="field">
                <span>Mo ta</span>
                <textarea data-field="description">${pkg.description}</textarea>
            </label>
            <label class="field">
                <span>Cau hinh</span>
                <textarea data-field="specs">${pkg.specs.join("\n")}</textarea>
            </label>
            <label class="checkline">
                <input type="checkbox" data-field="featured" ${pkg.featured ? "checked" : ""}>
                <span>Danh dau noi bat</span>
            </label>
        </article>
    `).join("");
}

function renderGamesTable() {
    gamesTableBody.innerHTML = adminData.games.map((game, index) => `
        <tr data-index="${index}">
            <td><input type="number" min="1" data-field="appId" value="${game.appId}"></td>
            <td><input type="text" data-field="title" value="${game.title}"></td>
            <td><input type="text" data-field="genre" value="${game.genre}"></td>
            <td><input type="text" data-field="release" value="${game.release}"></td>
            <td><input type="text" data-field="sections" value="${game.sections}"></td>
            <td><button type="button" class="table-delete-btn" data-action="delete-game"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join("");
}

function renderUsersTable() {
    usersTableBody.innerHTML = adminData.users.map((user, index) => `
        <tr data-index="${index}">
            <td>
                <label class="user-active-toggle">
                    <input type="radio" name="current-user" data-action="set-current-user" value="${user.id}" ${user.id === adminData.state.currentUserId ? "checked" : ""}>
                    <span>${user.id === adminData.state.currentUserId ? "Active" : ""}</span>
                </label>
            </td>
            <td><input type="text" data-field="id" value="${user.id}"></td>
            <td><input type="text" data-field="desktopName" value="${user.desktopName}"></td>
            <td><input type="text" data-field="limoreName" value="${user.limoreName}"></td>
            <td><input type="number" min="0" step="1000" data-field="balance" value="${user.balance}"></td>
            <td>
                <select data-field="activePackageId">
                    <option value="">Chua co goi</option>
                    ${adminData.packages.map((pkg) => `<option value="${pkg.id}" ${pkg.id === user.activePackageId ? "selected" : ""}>${pkg.title}</option>`).join("")}
                </select>
            </td>
            <td><button type="button" class="table-delete-btn" data-action="delete-user"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join("");
}

function renderClientsTable() {
    if (!clientsTableBody) {
        return;
    }

    const mergedClientRows = mergeClientRows(clientRows);

    if (!mergedClientRows.length) {
        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="6">Chua co client nao ket noi vao server.</td>
            </tr>
        `;
        return;
    }

    const blockedClientIds = new Set(getBlockedClientIds());
    clientsTableBody.innerHTML = mergedClientRows
        .slice()
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")))
        .map((client) => {
            const lastSeenAtMs = client.lastSeenAt ? new Date(client.lastSeenAt).getTime() : 0;
            const isOnline = lastSeenAtMs > 0 && Date.now() - lastSeenAtMs < 180000;
            const isBlocked = blockedClientIds.has(String(client.clientId || ""));
            const lastSeen = client.lastSeenAt
                ? new Date(client.lastSeenAt).toLocaleString("vi-VN")
                : "-";
            const identityStatus = client.anonymous ? "An danh" : "Da nhan dien";
            const deviceTitle = getClientDeviceTitle(client);
            const deviceMeta = getClientDeviceMeta(client);
            const desktopName = client.desktopName || "-";
            const limoreName = client.limoreName || "Anonymous";
            const userDisplay = desktopName !== "-" ? desktopName : (client.currentUserId || "Chua co user");
            const pageDisplay = client.currentPage || "/";
            const ipDisplay = client.ipAddress || "-";
            return `
                <tr>
                    <td>
                        <div class="client-primary">${deviceTitle}</div>
                        <div class="client-secondary">${deviceMeta}</div>
                    </td>
                    <td>
                        <div class="client-primary">${userDisplay}</div>
                        <div class="client-secondary">Limore: ${limoreName}</div>
                    </td>
                    <td>
                        <div class="client-primary">${ipDisplay}</div>
                        <div class="client-secondary">Trang: ${pageDisplay}</div>
                    </td>
                    <td>
                        <div class="client-status-stack">
                            <span class="status-pill ${isOnline ? "is-online" : "is-offline"}">${isOnline ? "Online" : "Offline"}</span>
                            <span class="status-pill ${isBlocked ? "is-blocked" : ""}">${isBlocked ? "Bi ngat" : identityStatus}</span>
                        </div>
                    </td>
                    <td>${lastSeen}</td>
                    <td>
                        <button
                            type="button"
                            class="admin-btn is-small ${isBlocked ? "" : "is-danger"}"
                            data-action="toggle-client-block"
                            data-client-id="${client.clientId || ""}"
                        >
                            ${isBlocked ? "Mo lai" : "Ngat"}
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
}

function getClientDeviceTitle(client) {
    const normalizedUa = String(client?.userAgent || "");
    const deviceType = String(client?.deviceType || "unknown").trim().toLowerCase();

    if (/iphone/i.test(normalizedUa)) {
        return "iPhone";
    }
    if (/ipad/i.test(normalizedUa)) {
        return "iPad";
    }
    if (/android/i.test(normalizedUa)) {
        return deviceType === "tablet" ? "Android Tablet" : "Android Phone";
    }
    if (/windows/i.test(normalizedUa)) {
        return "Windows Desktop";
    }
    if (/macintosh|mac os/i.test(normalizedUa)) {
        return "Mac";
    }
    if (/linux/i.test(normalizedUa) && !/android/i.test(normalizedUa)) {
        return "Linux Desktop";
    }
    if (deviceType === "desktop") {
        return "Desktop";
    }
    if (deviceType === "tablet") {
        return "Tablet";
    }
    return client?.isMobile ? "Mobile Device" : "Unknown Device";
}

function getClientDeviceMeta(client) {
    const userAgent = String(client?.userAgent || "");
    const matches = [];

    const iosMatch = userAgent.match(/OS\s([\d_]+)/i);
    if (iosMatch) {
        matches.push(`iOS ${iosMatch[1].replace(/_/g, ".")}`);
    }

    const androidMatch = userAgent.match(/Android\s([\d.]+)/i);
    if (androidMatch) {
        matches.push(`Android ${androidMatch[1]}`);
    }

    const windowsMatch = userAgent.match(/Windows NT\s([\d.]+)/i);
    if (windowsMatch) {
        matches.push(`Windows ${windowsMatch[1]}`);
    }

    const macMatch = userAgent.match(/Mac OS X\s([\d_]+)/i);
    if (macMatch) {
        matches.push(`macOS ${macMatch[1].replace(/_/g, ".")}`);
    }

    if (!matches.length) {
        matches.push(String(client?.deviceType || "unknown"));
    }

    return matches.join(" | ");
}

function normalizeClientUserAgent(userAgent) {
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
    const identity = currentUserId || desktopName || limoreName || "-";
    const isMobile = client?.isMobile ? "mobile" : "desktop";
    return [ipAddress || "-", deviceFamily, isMobile, identity].join("|");
}

function mergeClientRows(clients) {
    const mergedRows = new Map();

    (Array.isArray(clients) ? clients : []).forEach((client) => {
        const fingerprint = buildClientFingerprint(client);
        const existingClient = mergedRows.get(fingerprint);
        const existingLastSeen = existingClient?.lastSeenAt ? new Date(existingClient.lastSeenAt).getTime() : 0;
        const currentLastSeen = client?.lastSeenAt ? new Date(client.lastSeenAt).getTime() : 0;
        if (!existingClient || currentLastSeen >= existingLastSeen) {
            mergedRows.set(fingerprint, client);
        }
    });

    return Array.from(mergedRows.values());
}

function renderAll() {
    renderOverview();
    renderAccountForm();
    renderPackagesForm();
    renderUsersTable();
    renderClientsTable();
    renderGamesTable();
    renderAdminSections();
}

function renderAdminSections() {
    adminNavButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.adminSectionTarget === activeAdminSection);
    });
    adminSections.forEach((section) => {
        section.classList.toggle("active", section.dataset.adminSection === activeAdminSection);
    });
}

function setActiveAdminSection(sectionId) {
    activeAdminSection = sectionId || "overview";
    renderAdminSections();
}

function syncAccountForm() {
    const selectedUser = adminData.users.find((user) => user.id === currentUserInput.value);
    const currentUser = selectedUser || getCurrentUser();
    if (!currentUser) {
        return;
    }
    currentUser.desktopName = desktopNameInput.value.trim() || currentUser.desktopName;
    currentUser.limoreName = limoreNameInput.value.trim() || currentUser.limoreName;
    currentUser.balance = Number(balanceInput.value) || 0;
    currentUser.activePackageId = activePackageInput.value || "";
    renderUsersTable();
    renderOverview();
}

function handleCurrentUserChange() {
    adminData.state.currentUserId = currentUserInput.value || adminData.users[0]?.id || defaultUsers[0].id;
    renderAccountForm();
    renderOverview();
}

function syncPackagesForm() {
    packagesForm.querySelectorAll(".package-editor[data-package-id]").forEach((card) => {
        const packageId = card.dataset.packageId;
        const targetPackage = adminData.packages.find((pkg) => pkg.id === packageId);
        if (!targetPackage) {
            return;
        }

        targetPackage.badge = card.querySelector('[data-field="badge"]').value.trim();
        targetPackage.title = card.querySelector('[data-field="title"]').value.trim();
        targetPackage.price = Number(card.querySelector('[data-field="price"]').value) || 0;
        targetPackage.vnPriceLabel = card.querySelector('[data-field="vnPriceLabel"]').value.trim();
        targetPackage.globalPriceLabel = card.querySelector('[data-field="globalPriceLabel"]').value.trim();
        targetPackage.description = card.querySelector('[data-field="description"]').value.trim();
        targetPackage.specs = card.querySelector('[data-field="specs"]').value
            .split("\n")
            .map((value) => value.trim())
            .filter(Boolean);
        targetPackage.featured = card.querySelector('[data-field="featured"]').checked;
    });
    renderOverview();
}

function syncGamesTable() {
    const rows = gamesTableBody.querySelectorAll("tr[data-index]");
    adminData.games = Array.from(rows).map((row) => {
        const appId = Number(row.querySelector('[data-field="appId"]').value) || 0;
        return {
            appId,
            title: row.querySelector('[data-field="title"]').value.trim() || `Game ${appId || "New"}`,
            genre: row.querySelector('[data-field="genre"]').value.trim() || "Unknown Genre",
            release: row.querySelector('[data-field="release"]').value.trim() || "",
            sections: row.querySelector('[data-field="sections"]').value.trim() || "games",
            image: buildSteamHeaderImage(appId),
            storeUrl: `https://store.steampowered.com/app/${appId}/`
        };
    });
    renderOverview();
}

function syncUsersTable() {
    const rows = usersTableBody.querySelectorAll("tr[data-index]");
    adminData.users = Array.from(rows).map((row, index) => ({
        id: row.querySelector('[data-field="id"]').value.trim() || `user${index + 1}`,
        desktopName: row.querySelector('[data-field="desktopName"]').value.trim() || `User ${index + 1}`,
        limoreName: row.querySelector('[data-field="limoreName"]').value.trim() || "Anonymous",
        balance: Number(row.querySelector('[data-field="balance"]').value) || 0,
        activePackageId: row.querySelector('[data-field="activePackageId"]').value || ""
    }));
    adminData.users = sanitizeUsers(adminData.users);
    if (!adminData.users.some((user) => user.id === adminData.state.currentUserId)) {
        adminData.state.currentUserId = adminData.users[0]?.id || defaultUsers[0].id;
    }
    renderAccountForm();
    renderOverview();
}

async function handleSaveAll() {
    syncAccountForm();
    syncPackagesForm();
    syncUsersTable();
    syncGamesTable();
    adminData.state.setupComplete = adminData.users.length > 0;
    try {
        await saveAdminData();
        showStatus("Da luu du lieu Limore Cloud");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus("Khong luu duoc len server");
    }
}

async function handleResetDefaults() {
    adminData = getDefaultAdminData();
    try {
        await saveAdminData();
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus("Khong reset duoc len server");
        return;
    }
    renderAll();
    showStatus("Da khoi phuc du lieu mac dinh");
}

function handleAddGame() {
    const appId = Number(newGameAppIdInput.value) || 0;
    const title = newGameTitleInput.value.trim();
    if (!appId || !title) {
        showStatus("Can nhap App ID va ten game");
        return;
    }

    adminData.games.push({
        appId,
        title,
        genre: newGameGenreInput.value.trim() || "Unknown Genre",
        release: newGameReleaseInput.value.trim() || "",
        sections: newGameSectionsInput.value.trim() || "games",
        image: buildSteamHeaderImage(appId),
        storeUrl: `https://store.steampowered.com/app/${appId}/`
    });
    renderGamesTable();
    renderOverview();

    newGameAppIdInput.value = "";
    newGameTitleInput.value = "";
    newGameGenreInput.value = "";
    newGameReleaseInput.value = "";
    newGameSectionsInput.value = "";
}

function handleAddUser() {
    const id = newUserIdInput.value.trim();
    const desktopName = newUserDesktopNameInput.value.trim();
    if (!id || !desktopName) {
        showStatus("Can nhap User ID va Desktop name");
        return;
    }

    if (adminData.users.some((user) => user.id === id)) {
        showStatus("User ID da ton tai");
        return;
    }

    adminData.users.push({
        id,
        desktopName,
        limoreName: newUserLimoreNameInput.value.trim() || "Anonymous",
        balance: 0,
        activePackageId: ""
    });
    renderUsersTable();
    renderAccountForm();

    newUserIdInput.value = "";
    newUserDesktopNameInput.value = "";
    newUserLimoreNameInput.value = "";
}

async function verifyAdminSession() {
    const savedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!savedToken) {
        return false;
    }

    storeAdminToken(savedToken);
    try {
        const response = await fetch(ADMIN_AUTH_VERIFY_API, {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 404) {
            throw new Error("server_outdated");
        }
        if (!response.ok) {
            throw new Error("invalid_session");
        }
        return true;
    } catch (error) {
        storeAdminToken("");
        return false;
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    const password = adminPasswordInput?.value || "";
    if (!password.trim()) {
        if (adminAuthError) {
            adminAuthError.textContent = "Nhap mat khau admin truoc khi vao.";
        }
        adminPasswordInput?.focus();
        return;
    }

    adminLoginButton?.setAttribute("disabled", "");
    if (adminAuthError) {
        adminAuthError.textContent = "";
    }

    try {
        const response = await fetch(ADMIN_AUTH_LOGIN_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });
        if (response.status === 404) {
            throw new Error("Server chua cap nhat admin auth. Tat server cu va chay lai run.bat.");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.token) {
            throw new Error(payload?.error || "Dang nhap that bai");
        }

        storeAdminToken(payload.token);
        adminPasswordInput.value = "";
        setAdminUnlockedState();
        await loadAdminDashboard();
        startAdminLiveSync();
        showStatus("Da mo khoa trang admin");
    } catch (error) {
        if (adminAuthError) {
            adminAuthError.textContent = error.message || "Sai mat khau admin";
        }
    } finally {
        adminLoginButton?.removeAttribute("disabled");
    }
}

async function handleChangePassword() {
    const currentPassword = adminCurrentPasswordInput?.value || "";
    const nextPassword = adminNewPasswordInput?.value || "";
    const confirmPassword = adminConfirmPasswordInput?.value || "";

    if (!currentPassword || !nextPassword || !confirmPassword) {
        showStatus("Nhap day du 3 o mat khau");
        return;
    }

    if (nextPassword.length < 4) {
        showStatus("Mat khau moi phai tu 4 ky tu");
        return;
    }

    if (nextPassword !== confirmPassword) {
        showStatus("Nhap lai mat khau moi chua trung");
        return;
    }

    try {
        const response = await fetch(ADMIN_AUTH_CHANGE_PASSWORD_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                currentPassword,
                newPassword: nextPassword
            })
        });
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error(payload?.error || "Khong doi duoc mat khau");
        }

        adminCurrentPasswordInput.value = "";
        adminNewPasswordInput.value = "";
        adminConfirmPasswordInput.value = "";
        showStatus("Da doi mat khau admin");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong doi duoc mat khau");
    }
}

async function handleToggleClientBlock(clientId) {
    const normalizedClientId = String(clientId || "").trim();
    if (!normalizedClientId) {
        return;
    }

    const blockedClientIds = new Set(getBlockedClientIds());
    const isBlocked = blockedClientIds.has(normalizedClientId);

    if (isBlocked) {
        blockedClientIds.delete(normalizedClientId);
    } else {
        blockedClientIds.add(normalizedClientId);
    }

    adminData.state.blockedClientIds = Array.from(blockedClientIds);

    try {
        await saveAdminData();
        await fetchClientRows();
        renderClientsTable();
        showStatus(isBlocked ? "Da mo lai client" : "Da ngat client khoi he thong");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus("Khong cap nhat duoc client");
    }
}

async function loadAdminDashboard() {
    await fetchAdminDataFromServer();
    try {
        await fetchClientRows();
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
    }
    renderAll();
}

function startAdminLiveSync() {
    window.clearInterval(adminLiveSyncTimer);
    adminLiveSyncTimer = window.setInterval(async () => {
        try {
            await fetchAdminDataFromServer();
            await fetchClientRows();
            renderAll();
        } catch (error) {
            if (error.message === "admin_auth_required") {
                storeAdminToken("");
                setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            }
        }
    }, 6000);
}

balanceInput.addEventListener("input", syncAccountForm);
activePackageInput.addEventListener("change", syncAccountForm);
currentUserInput.addEventListener("change", handleCurrentUserChange);
desktopNameInput.addEventListener("input", syncAccountForm);
limoreNameInput.addEventListener("input", syncAccountForm);
packagesForm.addEventListener("input", syncPackagesForm);
packagesForm.addEventListener("change", syncPackagesForm);
usersTableBody.addEventListener("input", syncUsersTable);
usersTableBody.addEventListener("change", (event) => {
    const radio = event.target.closest('[data-action="set-current-user"]');
    if (radio) {
        adminData.state.currentUserId = radio.value;
    }
    syncUsersTable();
});
gamesTableBody.addEventListener("input", syncGamesTable);
usersTableBody.addEventListener("click", (event) => {
    const deleteButton = event.target.closest('[data-action="delete-user"]');
    if (!deleteButton) {
        return;
    }

    const row = deleteButton.closest("tr[data-index]");
    const rowIndex = Number(row?.dataset.index);
    if (Number.isNaN(rowIndex)) {
        return;
    }

    adminData.users.splice(rowIndex, 1);
    adminData.users = sanitizeUsers(adminData.users);
    if (!adminData.users.some((user) => user.id === adminData.state.currentUserId)) {
        adminData.state.currentUserId = adminData.users[0]?.id || defaultUsers[0].id;
    }
    renderUsersTable();
    renderAccountForm();
    renderOverview();
});
gamesTableBody.addEventListener("click", (event) => {
    const deleteButton = event.target.closest('[data-action="delete-game"]');
    if (!deleteButton) {
        return;
    }

    const row = deleteButton.closest("tr[data-index]");
    const rowIndex = Number(row?.dataset.index);
    if (Number.isNaN(rowIndex)) {
        return;
    }

    adminData.games.splice(rowIndex, 1);
    renderGamesTable();
    renderOverview();
});

adminNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveAdminSection(button.dataset.adminSectionTarget || "overview");
    });
});

saveAllButton.addEventListener("click", handleSaveAll);
resetDefaultsButton.addEventListener("click", handleResetDefaults);
addGameButton.addEventListener("click", handleAddGame);
addUserButton.addEventListener("click", handleAddUser);
adminLoginForm?.addEventListener("submit", handleAdminLogin);
changePasswordButton?.addEventListener("click", handleChangePassword);
clientsTableBody?.addEventListener("click", (event) => {
    const toggleButton = event.target.closest('[data-action="toggle-client-block"]');
    if (!toggleButton) {
        return;
    }

    handleToggleClientBlock(toggleButton.dataset.clientId);
});

window.addEventListener("storage", (event) => {
    if (event.key !== LIMORE_ADMIN_DATA_KEY) {
        return;
    }

    if (document.visibilityState !== "visible") {
        return;
    }

    adminData = loadAdminData();
    renderAll();
});

async function bootstrapAdmin() {
    renderAdminSections();
    const hasValidSession = await verifyAdminSession();
    if (!hasValidSession) {
        setAdminLockedState("Neu vua cap nhat code ma van khong vao duoc, hay tat server cu va chay lai run.bat.");
        return;
    }

    setAdminUnlockedState();
    await loadAdminDashboard();
    startAdminLiveSync();
}

bootstrapAdmin();


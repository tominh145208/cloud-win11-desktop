const LIMORE_ADMIN_DATA_KEY = "win11_limore_admin_data_v1";
const STEAM_ASSET_BASE_URL = "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps";
const LIMORE_ADMIN_DATA_API = "/api/limore-admin-data";
const LIMORE_CLIENTS_API = "/api/limore-clients";
const ADMIN_AUTH_LOGIN_API = "/api/admin-auth/login";
const ADMIN_AUTH_VERIFY_API = "/api/admin-auth/verify";
const ADMIN_AUTH_CHANGE_PASSWORD_API = "/api/admin-auth/change-password";
const ADMIN_AUTH_OTP_API = "/api/admin-auth/otp";
const ADMIN_AUTH_USERS_API = "/api/admin-auth/users";
const ADMIN_AUDIT_LOG_API = "/api/admin-audit-log";
const ADMIN_FIREWALL_API = "/api/admin-firewall";
const ADMIN_DEVICES_DEDUPE_API = "/api/admin-devices/dedupe";
const ADMIN_DEVICES_EXPORT_API = "/api/admin-devices/export";
const ADMIN_DEVICE_DETAIL_API = "/api/admin-devices/detail";
const ADMIN_ALERTS_API = "/api/admin-alerts";
const ADMIN_DASHBOARD_API = "/api/admin-dashboard";
const ADMIN_ROLLOUT_API = "/api/admin-rollout";
const ADMIN_TOKEN_KEY = "win11_admin_session_token_v1";
const ADMIN_ACTIVE_SECTION_KEY = "win11_admin_active_section_v1";

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
    { appId: 1245620, title: "ELDEN RING", genre: "Action RPG", release: "2022", sections: "home games played saves" },
    { appId: 900001, title: "Garena PC", genre: "Game Launcher", release: "2009", sections: "home games settings" },
    { appId: 900002, title: "Lien Minh Huyen Thoai (Riot)", genre: "MOBA", release: "2009", sections: "home games played settings" },
    { appId: 900003, title: "Dau Truong Chan Ly (Riot)", genre: "Auto Battler", release: "2019", sections: "home games played settings" }
];

const defaultPackages = [
    {
        id: "starter",
        badge: "1 THANG",
        title: "Starter VN Cloud",
        price: 131000,
        vnPriceLabel: "131k",
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
    blockedClientIds: [],
    firewallRules: [],
    ipAlerts: [],
    clientHistory: [],
    knownIpsByUser: {},
    rollout: {
        enabled: false,
        percent: 100,
        stableVersion: "stable",
        latestVersion: "latest",
        updatedAt: ""
    }
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
const balanceInputPreview = document.getElementById("balance-input-preview");
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
const adminUsernameInput = document.getElementById("admin-username-input");
const adminOtpInput = document.getElementById("admin-otp-input");
const adminLoginButton = document.getElementById("admin-login-button");
const adminAuthError = document.getElementById("admin-auth-error");
const adminCurrentPasswordInput = document.getElementById("admin-current-password");
const adminNewPasswordInput = document.getElementById("admin-new-password");
const adminConfirmPasswordInput = document.getElementById("admin-confirm-password");
const changePasswordButton = document.getElementById("change-password-button");
const adminRoleInput = document.getElementById("admin-role-input");
const otpEnabledInput = document.getElementById("otp-enabled-input");
const otpCodeInput = document.getElementById("otp-code-input");
const saveOtpButton = document.getElementById("save-otp-button");
const roleUsernameInput = document.getElementById("role-username-input");
const roleLevelInput = document.getElementById("role-level-input");
const rolePasswordInput = document.getElementById("role-password-input");
const saveRoleUserButton = document.getElementById("save-role-user-button");
const roleUsersTableBody = document.getElementById("role-users-table-body");
const refreshAuditButton = document.getElementById("refresh-audit-button");
const auditLogList = document.getElementById("audit-log-list");
const onlineChartCanvas = document.getElementById("online-chart-canvas");
const alertsList = document.getElementById("alerts-list");
const refreshAlertsButton = document.getElementById("refresh-alerts-button");
const ackAllAlertsButton = document.getElementById("ack-all-alerts-button");
const clientFilterOnline = document.getElementById("client-filter-online");
const clientFilterDevice = document.getElementById("client-filter-device");
const clientFilterIp = document.getElementById("client-filter-ip");
const clientFilterUser = document.getElementById("client-filter-user");
const clientFilterResetButton = document.getElementById("client-filter-reset-button");
const dedupeClientsButton = document.getElementById("dedupe-clients-button");
const exportClientsCsvButton = document.getElementById("export-clients-csv-button");
const rolloutEnabledInput = document.getElementById("rollout-enabled-input");
const rolloutPercentInput = document.getElementById("rollout-percent-input");
const rolloutPercentValue = document.getElementById("rollout-percent-value");
const rolloutStableVersionInput = document.getElementById("rollout-stable-version-input");
const rolloutLatestVersionInput = document.getElementById("rollout-latest-version-input");
const rolloutQuickPercentButtons = Array.from(document.querySelectorAll("[data-rollout-percent]"));
const saveRolloutButton = document.getElementById("save-rollout-button");
const rolloutPreviewCopy = document.getElementById("rollout-preview-copy");
const firewallRuleInput = document.getElementById("firewall-rule-input");
const addFirewallRuleButton = document.getElementById("add-firewall-rule-button");
const firewallRulesList = document.getElementById("firewall-rules-list");
const deviceDetailModal = document.getElementById("device-detail-modal");
const closeDeviceDetailButton = document.getElementById("close-device-detail-button");
const deviceDetailBody = document.getElementById("device-detail-body");
const adminRealtimeNotifyContainer = document.getElementById("admin-realtime-notify-container");
const adminContent = document.querySelector(".admin-content");
const adminNavButtons = Array.from(document.querySelectorAll(".admin-nav-btn[data-admin-section-target]"));
const adminSections = Array.from(document.querySelectorAll(".admin-section[data-admin-section]"));
const adminHero = document.getElementById("admin-hero");
const adminSectionIds = new Set(adminSections.map((section) => String(section.dataset.adminSection || "").trim()).filter(Boolean));

let adminData = loadAdminData();
let clientRows = [];
let adminToken = "";
let adminLiveSyncTimer = 0;
let activeAdminSection = loadStoredAdminSection();
let adminRole = "mod";
let adminUsername = "admin";
let adminRoleUsers = [];
let adminAuditLogs = [];
let adminAlerts = [];
let adminFirewallRules = [];
let dashboardStats = { hourly: [], daily: [] };
let hasHydratedClientPresence = false;
const knownClientPresence = new Map();
let realtimeAudioContext = null;
const CLIENT_ONLINE_THRESHOLD_MS = 180000;
const CLIENT_RECENT_WINDOW_MS = 45000;
const clientFilters = {
    online: "all",
    device: "all",
    ip: "",
    user: ""
};
const ADMIN_EDIT_SYNC_COOLDOWN_MS = 12000;
let adminEditCooldownUntil = 0;
let hasUnsavedAdminChanges = false;

function markAdminEditing() {
    hasUnsavedAdminChanges = true;
    adminEditCooldownUntil = Date.now() + ADMIN_EDIT_SYNC_COOLDOWN_MS;
}

function normalizeAdminSection(sectionId) {
    const safeSection = String(sectionId || "").trim();
    return adminSectionIds.has(safeSection) ? safeSection : "overview";
}

function loadStoredAdminSection() {
    try {
        return normalizeAdminSection(localStorage.getItem(ADMIN_ACTIVE_SECTION_KEY));
    } catch (error) {
        return "overview";
    }
}

function storeActiveAdminSection(sectionId) {
    try {
        localStorage.setItem(ADMIN_ACTIVE_SECTION_KEY, normalizeAdminSection(sectionId));
    } catch (error) {
        // Ignore storage errors.
    }
}

function clearAdminEditing() {
    hasUnsavedAdminChanges = false;
    adminEditCooldownUntil = 0;
}

function isAdminEditingNow() {
    if (hasUnsavedAdminChanges) {
        return true;
    }
    if (Date.now() < adminEditCooldownUntil) {
        return true;
    }
    const activeEl = document.activeElement;
    if (!activeEl || !(activeEl instanceof HTMLElement)) {
        return false;
    }
    if (!(activeEl.matches("input, textarea, select") || activeEl.isContentEditable)) {
        return false;
    }
    return Boolean(activeEl.closest("#admin-shell"));
}

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

function mergeGamesWithDefaults(rawGames, fallbackGames) {
    const nextGames = (Array.isArray(rawGames) && rawGames.length)
        ? rawGames.map((game) => ({ ...game }))
        : cloneJson(fallbackGames);

    const appIdSet = new Set(nextGames.map((game) => Number(game?.appId) || 0).filter((appId) => appId > 0));
    const titleSet = new Set(nextGames.map((game) => String(game?.title || "").trim().toLowerCase()).filter(Boolean));

    fallbackGames.forEach((defaultGame) => {
        const appId = Number(defaultGame?.appId) || 0;
        const title = String(defaultGame?.title || "").trim().toLowerCase();
        const existsByAppId = appId > 0 && appIdSet.has(appId);
        const existsByTitle = title && titleSet.has(title);
        if (existsByAppId || existsByTitle) {
            return;
        }
        nextGames.push({ ...defaultGame });
        if (appId > 0) {
            appIdSet.add(appId);
        }
        if (title) {
            titleSet.add(title);
        }
    });

    return nextGames;
}

function sanitizeRolloutConfig(rawConfig = {}, fallbackConfig = defaultState.rollout) {
    const percentRaw = Number(rawConfig?.percent ?? fallbackConfig.percent);
    const percent = Number.isFinite(percentRaw)
        ? Math.max(0, Math.min(100, Math.round(percentRaw)))
        : fallbackConfig.percent;
    const stableVersion = String(rawConfig?.stableVersion || fallbackConfig.stableVersion || "stable").trim() || "stable";
    const latestVersion = String(rawConfig?.latestVersion || fallbackConfig.latestVersion || "latest").trim() || "latest";
    return {
        enabled: Boolean(rawConfig?.enabled),
        percent,
        stableVersion: stableVersion.slice(0, 48),
        latestVersion: latestVersion.slice(0, 48),
        updatedAt: String(rawConfig?.updatedAt || fallbackConfig.updatedAt || "").trim()
    };
}

function formatVnPriceLabel(value) {
    const numericValue = Math.max(0, Math.round(Number(value) || 0));
    if (numericValue >= 1000000) {
        return `${(numericValue / 1000000).toFixed(1).replace(".0", "")}m`;
    }
    if (numericValue >= 1000) {
        return `${Math.round(numericValue / 1000)}k`;
    }
    return String(numericValue);
}

function sanitizePackages(packages) {
    const sourcePackages = Array.isArray(packages) && packages.length
        ? packages
        : defaultPackages;
    return sourcePackages.map((pkg, index) => {
        const fallbackPackage = defaultPackages[index] || defaultPackages[0];
        const fallbackPrice = Math.max(0, Math.round(Number(fallbackPackage.price) || 0));
        const rawPrice = Math.max(0, Math.round(Number(pkg?.price ?? fallbackPrice) || fallbackPrice));
        const resolvedId = String(pkg?.id || fallbackPackage.id || "").trim() || fallbackPackage.id;
        const resolvedPrice = resolvedId === "starter" && rawPrice === 129000 ? 131000 : rawPrice;
        const resolvedSpecs = Array.isArray(pkg?.specs)
            ? pkg.specs.map((spec) => String(spec || "").trim()).filter(Boolean)
            : cloneJson(fallbackPackage.specs);
        return {
            ...fallbackPackage,
            ...pkg,
            id: resolvedId,
            price: resolvedPrice,
            vnPriceLabel: formatVnPriceLabel(resolvedPrice),
            specs: resolvedSpecs
        };
    });
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
        games: mergeGamesWithDefaults(rawData?.games, defaults.games),
        packages: sanitizePackages(rawData?.packages),
        users: sanitizeUsers(nextUsers),
        clients: Array.isArray(rawData?.clients) ? rawData.clients : [],
        state: {
            currentUserId: String(rawData?.state?.currentUserId || defaults.state.currentUserId),
            setupComplete: rawData?.state?.setupComplete === undefined ? true : Boolean(rawData?.state?.setupComplete),
            blockedClientIds: Array.isArray(rawData?.state?.blockedClientIds)
                ? rawData.state.blockedClientIds.map((value) => String(value || "").trim()).filter(Boolean)
                : [],
            firewallRules: Array.isArray(rawData?.state?.firewallRules)
                ? rawData.state.firewallRules.map((value) => String(value || "").trim()).filter(Boolean)
                : [],
            ipAlerts: Array.isArray(rawData?.state?.ipAlerts) ? rawData.state.ipAlerts : [],
            clientHistory: Array.isArray(rawData?.state?.clientHistory) ? rawData.state.clientHistory : [],
            knownIpsByUser: rawData?.state?.knownIpsByUser && typeof rawData.state.knownIpsByUser === "object"
                ? rawData.state.knownIpsByUser
                : {},
            rollout: sanitizeRolloutConfig(rawData?.state?.rollout, defaults.state.rollout)
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

function isSuperAdmin() {
    return adminRole === "super_admin";
}

function applyRolePermissions() {
    if (adminRoleInput) {
        adminRoleInput.value = adminRole;
    }

    const canEditBalance = Boolean(adminToken);
    const balanceTargets = [
        balanceInput,
        ...Array.from(document.querySelectorAll('#users-table-body [data-field="balance"]'))
    ];
    balanceTargets.forEach((input) => {
        if (!input) {
            return;
        }
        if (canEditBalance) {
            input.removeAttribute("disabled");
        } else {
            input.setAttribute("disabled", "");
        }
    });

    if (saveOtpButton) {
        saveOtpButton.disabled = !isSuperAdmin();
    }
    if (saveRoleUserButton) {
        saveRoleUserButton.disabled = !isSuperAdmin();
    }
    [roleUsernameInput, roleLevelInput, rolePasswordInput, otpEnabledInput, otpCodeInput].forEach((input) => {
        if (!input) {
            return;
        }
        if (isSuperAdmin()) {
            input.removeAttribute("disabled");
        } else {
            input.setAttribute("disabled", "");
        }
    });

    [rolloutEnabledInput, rolloutPercentInput, rolloutStableVersionInput, rolloutLatestVersionInput, saveRolloutButton].forEach((input) => {
        if (!input) {
            return;
        }
        if (isSuperAdmin()) {
            input.removeAttribute("disabled");
        } else {
            input.setAttribute("disabled", "");
        }
    });
    rolloutQuickPercentButtons.forEach((button) => {
        if (isSuperAdmin()) {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "");
        }
    });
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
        handleRealtimeClientJoin(clientRows);
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        clientRows = Array.isArray(adminData.clients) ? adminData.clients : [];
        handleRealtimeClientJoin(clientRows);
    }
}

function getClientPresenceKey(client) {
    const id = String(client?.clientId || "").trim();
    if (id) {
        return `id:${id}`;
    }
    return `fp:${buildClientFingerprint(client)}`;
}

function getClientPresenceDisplayName(client) {
    const desktopName = String(client?.desktopName || "").trim();
    const currentUserId = String(client?.currentUserId || "").trim();
    const limoreName = String(client?.limoreName || "").trim();
    return desktopName || currentUserId || limoreName || "Nguoi dung moi";
}

function showRealtimeJoinToast(title, message) {
    if (!adminRealtimeNotifyContainer) {
        return;
    }
    const toast = document.createElement("div");
    toast.className = "admin-realtime-toast";
    const titleEl = document.createElement("strong");
    titleEl.textContent = title;
    const messageEl = document.createElement("span");
    messageEl.textContent = message;
    toast.appendChild(titleEl);
    toast.appendChild(messageEl);
    adminRealtimeNotifyContainer.appendChild(toast);
    window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-8px)";
        window.setTimeout(() => toast.remove(), 220);
    }, 4200);
}

function playJoinTingSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            return;
        }
        if (!realtimeAudioContext) {
            realtimeAudioContext = new AudioCtx();
        }
        if (realtimeAudioContext.state === "suspended") {
            realtimeAudioContext.resume().catch(() => {});
        }
        const now = realtimeAudioContext.currentTime;
        const gainNode = realtimeAudioContext.createGain();
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.connect(realtimeAudioContext.destination);

        const tone1 = realtimeAudioContext.createOscillator();
        tone1.type = "sine";
        tone1.frequency.setValueAtTime(1046, now);
        tone1.connect(gainNode);
        tone1.start(now);
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        tone1.stop(now + 0.16);

        const tone2 = realtimeAudioContext.createOscillator();
        tone2.type = "sine";
        tone2.frequency.setValueAtTime(1318, now + 0.18);
        tone2.connect(gainNode);
        tone2.start(now + 0.18);
        gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.22);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        tone2.stop(now + 0.36);
    } catch (error) {
        // Ignore audio failures.
    }
}

function warmupJoinSoundContext() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            return;
        }
        if (!realtimeAudioContext) {
            realtimeAudioContext = new AudioCtx();
        }
        if (realtimeAudioContext.state === "suspended") {
            realtimeAudioContext.resume().catch(() => {});
        }
    } catch (error) {
        // Ignore audio failures.
    }
}

function handleRealtimeClientJoin(rows) {
    const mergedRows = mergeClientRows(rows);
    const rowMap = new Map();
    const now = Date.now();
    mergedRows.forEach((client) => {
        const key = getClientPresenceKey(client);
        const seenMs = client?.lastSeenAt ? new Date(client.lastSeenAt).getTime() : 0;
        const isOnline = seenMs > 0 && now - seenMs < CLIENT_ONLINE_THRESHOLD_MS;
        rowMap.set(key, {
            client,
            seenMs,
            isOnline
        });
    });

    if (!hasHydratedClientPresence) {
        knownClientPresence.clear();
        rowMap.forEach((entry, key) => {
            knownClientPresence.set(key, {
                seenMs: entry.seenMs,
                isOnline: entry.isOnline
            });
        });
        hasHydratedClientPresence = true;
        return;
    }

    rowMap.forEach((entry, key) => {
        const previous = knownClientPresence.get(key);
        const isRecent = entry.seenMs > 0 && now - entry.seenMs <= CLIENT_RECENT_WINDOW_MS;
        let shouldNotify = false;

        if (!previous) {
            shouldNotify = isRecent;
        } else if (!previous.isOnline && entry.isOnline) {
            shouldNotify = true;
        }

        if (shouldNotify) {
            const deviceTitle = getClientDeviceTitle(entry.client);
            const displayName = getClientPresenceDisplayName(entry.client);
            const ipDisplay = String(entry.client?.ipAddress || "khong ro IP");
            showRealtimeJoinToast("Co nguoi vua vao web", `${displayName} • ${deviceTitle} • ${ipDisplay}`);
            playJoinTingSound();
        }

        knownClientPresence.set(key, {
            seenMs: entry.seenMs,
            isOnline: entry.isOnline
        });
    });

    const currentKeys = new Set(rowMap.keys());
    Array.from(knownClientPresence.keys()).forEach((key) => {
        if (!currentKeys.has(key)) {
            knownClientPresence.delete(key);
        }
    });
}

async function fetchOtpSettings() {
    try {
        const response = await fetch(buildNoCacheUrl(ADMIN_AUTH_OTP_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("otp_fetch_failed");
        }
        const payload = await response.json();
        if (otpEnabledInput) {
            otpEnabledInput.value = payload?.otpEnabled ? "1" : "0";
        }
        if (otpCodeInput) {
            otpCodeInput.value = String(payload?.otpCode || "");
        }
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
    }
}

async function fetchRoleUsers() {
    if (!isSuperAdmin()) {
        adminRoleUsers = [];
        renderRoleUsersTable();
        return;
    }
    try {
        const response = await fetch(buildNoCacheUrl(ADMIN_AUTH_USERS_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("role_users_fetch_failed");
        }
        const payload = await response.json();
        adminRoleUsers = Array.isArray(payload?.users) ? payload.users : [];
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        adminRoleUsers = [];
    }
    renderRoleUsersTable();
}

async function fetchAuditLogs() {
    try {
        const response = await fetch(buildNoCacheUrl(ADMIN_AUDIT_LOG_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("audit_fetch_failed");
        }
        const payload = await response.json();
        adminAuditLogs = Array.isArray(payload?.logs) ? payload.logs : [];
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        adminAuditLogs = [];
    }
    renderAuditLogs();
}

async function fetchAlerts() {
    try {
        const response = await fetch(buildNoCacheUrl(ADMIN_ALERTS_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("alerts_fetch_failed");
        }
        const payload = await response.json();
        adminAlerts = Array.isArray(payload?.alerts) ? payload.alerts : [];
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        adminAlerts = [];
    }
    renderAlerts();
}

async function fetchFirewallRules() {
    try {
        const response = await fetch(buildNoCacheUrl(ADMIN_FIREWALL_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("firewall_fetch_failed");
        }
        const payload = await response.json();
        adminFirewallRules = Array.isArray(payload?.rules) ? payload.rules : [];
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        adminFirewallRules = Array.isArray(adminData?.state?.firewallRules) ? adminData.state.firewallRules : [];
    }
    renderFirewallRules();
}

async function fetchDashboardStats() {
    try {
        const response = await fetch(buildNoCacheUrl(ADMIN_DASHBOARD_API), {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("dashboard_fetch_failed");
        }
        const payload = await response.json();
        dashboardStats = payload?.stats && typeof payload.stats === "object"
            ? payload.stats
            : { hourly: [], daily: [] };
    } catch (error) {
        if (error.message === "admin_auth_required") {
            throw error;
        }
        dashboardStats = { hourly: [], daily: [] };
    }
    renderDashboardChart();
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

function formatBalanceInput(value) {
    const numericValue = Number(value) || 0;
    return String(Math.max(0, Math.round(numericValue)));
}

function parseBalanceInputValue(rawValue, fallbackValue = 0) {
    const fallback = Math.max(0, Math.round(Number(fallbackValue) || 0));
    const safeValue = String(rawValue ?? "").trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "");
    if (!safeValue) {
        return 0;
    }

    const match = safeValue.match(/^(-?\d+(?:\.\d+)?)([kmb])?$/i);
    if (match) {
        const baseValue = Number(match[1]);
        if (!Number.isFinite(baseValue)) {
            return fallback;
        }
        const unit = String(match[2] || "").toLowerCase();
        const multiplier = unit === "k" ? 1000 : unit === "m" ? 1000000 : unit === "b" ? 1000000000 : 1;
        return Math.max(0, Math.round(baseValue * multiplier));
    }

    const numericOnly = Number(safeValue.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(numericOnly)) {
        return fallback;
    }
    return Math.max(0, Math.round(numericOnly));
}

function refreshBalanceInputPreview() {
    if (!balanceInputPreview || !balanceInput) {
        return;
    }
    const parsedBalance = parseBalanceInputValue(balanceInput.value, 0);
    balanceInputPreview.textContent = formatBalance(parsedBalance);
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

function renderRoleUsersTable() {
    if (!roleUsersTableBody) {
        return;
    }
    if (!isSuperAdmin()) {
        roleUsersTableBody.innerHTML = `
            <tr><td colspan="3">Chi Super Admin moi xem/sua duoc danh sach role user.</td></tr>
        `;
        return;
    }
    if (!adminRoleUsers.length) {
        roleUsersTableBody.innerHTML = `<tr><td colspan="3">Chua co role user nao.</td></tr>`;
        return;
    }
    roleUsersTableBody.innerHTML = adminRoleUsers.map((entry) => `
        <tr data-username="${entry.username}">
            <td>${entry.username}</td>
            <td>${entry.role}</td>
            <td>
                <button type="button" class="table-delete-btn" data-action="delete-role-user" data-username="${entry.username}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

function renderAuditLogs() {
    if (!auditLogList) {
        return;
    }
    if (!adminAuditLogs.length) {
        auditLogList.innerHTML = `<div class="simple-list-item"><span>Chua co lich su thao tac.</span></div>`;
        return;
    }
    auditLogList.innerHTML = adminAuditLogs.slice(0, 80).map((entry) => `
        <div class="simple-list-item">
            <strong>${entry.type || "event"} • ${entry.username || "-"}</strong>
            <span>${entry.detail || "-"}</span>
            <span>${new Date(entry.at || Date.now()).toLocaleString("vi-VN")} • IP: ${entry.ipAddress || "-"}</span>
        </div>
    `).join("");
}

function renderAlerts() {
    if (!alertsList) {
        return;
    }
    if (!adminAlerts.length) {
        alertsList.innerHTML = `<div class="simple-list-item"><span>Khong co canh bao moi.</span></div>`;
        return;
    }
    alertsList.innerHTML = adminAlerts.slice(0, 80).map((alert) => `
        <div class="simple-list-item">
            <strong>${alert.ack ? "Da doc" : "Moi"} • ${alert.userId}</strong>
            <span>IP: ${alert.ipAddress}</span>
            <span>${new Date(alert.at || Date.now()).toLocaleString("vi-VN")}</span>
            <div class="simple-list-actions">
                <button type="button" class="admin-btn is-small" data-action="ack-alert" data-alert-id="${alert.id}" ${alert.ack ? "disabled" : ""}>Da doc</button>
            </div>
        </div>
    `).join("");
}

function renderFirewallRules() {
    if (!firewallRulesList) {
        return;
    }
    if (!adminFirewallRules.length) {
        firewallRulesList.innerHTML = `<div class="simple-list-item"><span>Chua co rule chan IP nao.</span></div>`;
        return;
    }
    firewallRulesList.innerHTML = adminFirewallRules.map((rule, index) => `
        <div class="simple-list-item">
            <strong>${rule}</strong>
            <div class="simple-list-actions">
                <button type="button" class="admin-btn is-small" data-action="delete-firewall-rule" data-index="${index}">Xoa</button>
            </div>
        </div>
    `).join("");
}

function renderDashboardChart() {
    if (!onlineChartCanvas) {
        return;
    }
    const ctx = onlineChartCanvas.getContext("2d");
    if (!ctx) {
        return;
    }
    const width = onlineChartCanvas.clientWidth || 600;
    const height = Number(onlineChartCanvas.getAttribute("height") || 220);
    onlineChartCanvas.width = width;
    onlineChartCanvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const hourlyValues = (Array.isArray(dashboardStats?.hourly) ? dashboardStats.hourly : []).map((entry) => Number(entry?.count || 0));
    const dailyValues = (Array.isArray(dashboardStats?.daily) ? dashboardStats.daily : []).map((entry) => Number(entry?.count || 0));
    const values = [...hourlyValues, ...dailyValues];
    const maxValue = Math.max(1, ...values);
    const leftPad = 28;
    const rightPad = 10;
    const topPad = 12;
    const bottomPad = 24;
    const chartHeight = height - topPad - bottomPad;

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPad, topPad);
    ctx.lineTo(leftPad, height - bottomPad);
    ctx.lineTo(width - rightPad, height - bottomPad);
    ctx.stroke();

    const barAreaWidth = width - leftPad - rightPad;
    const totalBars = hourlyValues.length + dailyValues.length + 1;
    const barWidth = Math.max(2, Math.floor(barAreaWidth / Math.max(1, totalBars * 1.4)));
    let cursorX = leftPad + 8;

    hourlyValues.forEach((value) => {
        const barHeight = Math.round((value / maxValue) * chartHeight);
        ctx.fillStyle = "rgba(96, 170, 255, 0.8)";
        ctx.fillRect(cursorX, height - bottomPad - barHeight, barWidth, barHeight);
        cursorX += Math.max(4, Math.floor(barWidth * 1.35));
    });

    cursorX += 8;
    dailyValues.forEach((value) => {
        const barHeight = Math.round((value / maxValue) * chartHeight);
        ctx.fillStyle = "rgba(95, 232, 174, 0.8)";
        ctx.fillRect(cursorX, height - bottomPad - barHeight, barWidth, barHeight);
        cursorX += Math.max(4, Math.floor(barWidth * 1.35));
    });

    ctx.fillStyle = "rgba(228, 238, 252, 0.9)";
    ctx.font = "12px Segoe UI";
    ctx.fillText("Gio", leftPad + 8, height - 6);
    ctx.fillText("Ngay", Math.max(leftPad + 90, width - 90), height - 6);
}

function renderOverview() {
    const currentUser = getCurrentUser();
    overviewBalance.textContent = formatBalance(currentUser?.balance || 0);
    overviewGames.textContent = String(adminData.games.length);
    const activePackage = adminData.packages.find((pkg) => pkg.id === currentUser?.activePackageId);
    overviewPackage.textContent = activePackage ? activePackage.title : "Chua co";
}

function getCurrentRolloutConfig() {
    const fallback = defaultState.rollout;
    adminData.state = adminData.state && typeof adminData.state === "object" ? adminData.state : {};
    adminData.state.rollout = sanitizeRolloutConfig(adminData.state.rollout, fallback);
    return adminData.state.rollout;
}

function updateRolloutPreview() {
    if (!rolloutPreviewCopy) {
        return;
    }
    const rollout = getCurrentRolloutConfig();
    const statusLabel = rollout.enabled
        ? `Bat rollout ${rollout.percent}% (${rollout.stableVersion} -> ${rollout.latestVersion})`
        : `Tat rollout (tat ca dung ${rollout.latestVersion})`;
    const updatedAtLabel = rollout.updatedAt
        ? ` - cap nhat ${new Date(rollout.updatedAt).toLocaleString("vi-VN")}`
        : "";
    rolloutPreviewCopy.textContent = `Rollout hien tai: ${statusLabel}${updatedAtLabel}`;
}

function renderRolloutPanel() {
    const rollout = getCurrentRolloutConfig();
    if (rolloutEnabledInput) {
        rolloutEnabledInput.value = rollout.enabled ? "1" : "0";
    }
    if (rolloutPercentInput) {
        rolloutPercentInput.value = String(rollout.percent);
    }
    if (rolloutPercentValue) {
        rolloutPercentValue.textContent = `${rollout.percent}%`;
    }
    if (rolloutStableVersionInput) {
        rolloutStableVersionInput.value = rollout.stableVersion;
    }
    if (rolloutLatestVersionInput) {
        rolloutLatestVersionInput.value = rollout.latestVersion;
    }
    updateRolloutPreview();
}

function renderAccountForm() {
    const currentUser = getCurrentUser();
    currentUserInput.innerHTML = adminData.users.map((user) => `<option value="${user.id}">${user.desktopName}</option>`).join("");
    currentUserInput.value = adminData.state.currentUserId || currentUser?.id || "";
    desktopNameInput.value = currentUser?.desktopName || "";
    limoreNameInput.value = currentUser?.limoreName || "";
    balanceInput.value = formatBalanceInput(currentUser?.balance || 0);
    refreshBalanceInputPreview();
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
                <span>Gia hien thi VN (tu dong theo gia goc)</span>
                <input type="text" data-field="vnPriceLabel" value="${pkg.vnPriceLabel}" readonly>
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
            <td>
                <div class="balance-cell">
                    <input type="text" inputmode="decimal" data-field="balance" value="${formatBalanceInput(user.balance)}" placeholder="0 / 100k / 1m">
                    <small class="balance-preview">${formatBalance(user.balance)}</small>
                </div>
            </td>
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
    const filteredRows = mergedClientRows
        .slice()
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")))
        .filter((client) => {
            const lastSeenAtMs = client.lastSeenAt ? new Date(client.lastSeenAt).getTime() : 0;
            const isOnline = lastSeenAtMs > 0 && Date.now() - lastSeenAtMs < 180000;
            if (clientFilters.online === "online" && !isOnline) {
                return false;
            }
            if (clientFilters.online === "offline" && isOnline) {
                return false;
            }
            if (clientFilters.device === "mobile" && !client.isMobile) {
                return false;
            }
            if (clientFilters.device === "desktop" && client.isMobile) {
                return false;
            }

            const ipDisplay = String(client.ipAddress || "").toLowerCase();
            if (clientFilters.ip && !ipDisplay.includes(clientFilters.ip.toLowerCase())) {
                return false;
            }

            const userDisplay = `${client.desktopName || ""} ${client.currentUserId || ""} ${client.limoreName || ""}`.toLowerCase();
            if (clientFilters.user && !userDisplay.includes(clientFilters.user.toLowerCase())) {
                return false;
            }

            return true;
        });

    if (!filteredRows.length) {
        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="6">Khong co thiet bi phu hop bo loc.</td>
            </tr>
        `;
        return;
    }

    clientsTableBody.innerHTML = filteredRows
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
            const fingerprint = buildClientFingerprint(client);
            return `
                <tr class="client-row-clickable" data-action="open-client-detail" data-client-id="${client.clientId || ""}" data-client-fingerprint="${fingerprint}">
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
                            data-no-row-open="1"
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

function mergeClientEntry(existingClient, incomingClient) {
    if (!existingClient) {
        return incomingClient;
    }

    const existingLastSeen = existingClient?.lastSeenAt ? new Date(existingClient.lastSeenAt).getTime() : 0;
    const incomingLastSeen = incomingClient?.lastSeenAt ? new Date(incomingClient.lastSeenAt).getTime() : 0;
    const newerClient = incomingLastSeen >= existingLastSeen ? incomingClient : existingClient;
    const olderClient = newerClient === incomingClient ? existingClient : incomingClient;

    return {
        ...olderClient,
        ...newerClient,
        clientId: String(newerClient?.clientId || olderClient?.clientId || "").trim()
    };
}

function mergeClientRows(clients) {
    const normalizedRows = (Array.isArray(clients) ? clients : [])
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
            lastSeenAt: String(client?.lastSeenAt || "")
        }))
        .filter((client) => client.clientId || client.ipAddress || client.userAgent || client.lastSeenAt)
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")));

    const byClientId = new Map();
    const rowsWithoutClientId = [];

    normalizedRows.forEach((client) => {
        const clientId = String(client?.clientId || "").trim();
        if (clientId) {
            const existingByClientId = byClientId.get(clientId);
            byClientId.set(clientId, mergeClientEntry(existingByClientId, client));
            return;
        }
        rowsWithoutClientId.push(client);
    });

    const mergedRows = new Map();
    [...byClientId.values(), ...rowsWithoutClientId].forEach((client) => {
        const fingerprint = buildClientFingerprint(client);
        const existingClient = mergedRows.get(fingerprint);
        mergedRows.set(fingerprint, mergeClientEntry(existingClient, client));
    });

    return Array.from(mergedRows.values());
}

function renderAll() {
    renderOverview();
    renderRolloutPanel();
    renderAccountForm();
    renderPackagesForm();
    renderUsersTable();
    renderClientsTable();
    renderRoleUsersTable();
    renderAuditLogs();
    renderAlerts();
    renderFirewallRules();
    renderDashboardChart();
    renderGamesTable();
    renderAdminSections();
    applyRolePermissions();
}

function renderAdminSections() {
    const resolvedSection = normalizeAdminSection(activeAdminSection);
    if (resolvedSection !== activeAdminSection) {
        activeAdminSection = resolvedSection;
    }

    adminNavButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.adminSectionTarget === activeAdminSection);
    });
    adminSections.forEach((section) => {
        const isActive = section.dataset.adminSection === activeAdminSection;
        section.classList.toggle("active", isActive);
        section.hidden = !isActive;
    });

    if (adminHero) {
        adminHero.hidden = activeAdminSection !== "overview";
    }
}

function setActiveAdminSection(sectionId) {
    activeAdminSection = normalizeAdminSection(sectionId);
    storeActiveAdminSection(activeAdminSection);
    renderAdminSections();
    if (adminContent) {
        adminContent.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

function syncAccountForm() {
    const selectedUser = adminData.users.find((user) => user.id === currentUserInput.value);
    const currentUser = selectedUser || getCurrentUser();
    if (!currentUser) {
        return;
    }
    currentUser.desktopName = desktopNameInput.value.trim() || currentUser.desktopName;
    currentUser.limoreName = limoreNameInput.value.trim() || currentUser.limoreName;
    currentUser.balance = parseBalanceInputValue(balanceInput.value, currentUser.balance);
    refreshBalanceInputPreview();
    currentUser.activePackageId = activePackageInput.value || "";
    renderUsersTable();
    renderOverview();
    applyRolePermissions();
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
        targetPackage.price = Math.max(0, Math.round(Number(card.querySelector('[data-field="price"]').value) || 0));
        targetPackage.vnPriceLabel = formatVnPriceLabel(targetPackage.price);
        const vnPriceLabelInput = card.querySelector('[data-field="vnPriceLabel"]');
        if (vnPriceLabelInput) {
            vnPriceLabelInput.value = targetPackage.vnPriceLabel;
        }
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
    adminData.users = Array.from(rows).map((row, index) => {
        const parsedBalance = parseBalanceInputValue(
            row.querySelector('[data-field="balance"]').value,
            Number((adminData.users[index] || {}).balance || 0)
        );
        const balancePreviewEl = row.querySelector(".balance-preview");
        if (balancePreviewEl) {
            balancePreviewEl.textContent = formatBalance(parsedBalance);
        }
        return {
            id: row.querySelector('[data-field="id"]').value.trim() || `user${index + 1}`,
            desktopName: row.querySelector('[data-field="desktopName"]').value.trim() || `User ${index + 1}`,
            limoreName: row.querySelector('[data-field="limoreName"]').value.trim() || "Anonymous",
            balance: parsedBalance,
            activePackageId: row.querySelector('[data-field="activePackageId"]').value || ""
        };
    });
    adminData.users = sanitizeUsers(adminData.users);
    if (!adminData.users.some((user) => user.id === adminData.state.currentUserId)) {
        adminData.state.currentUserId = adminData.users[0]?.id || defaultUsers[0].id;
    }
    renderAccountForm();
    renderOverview();
    applyRolePermissions();
}

async function handleSaveAll() {
    syncAccountForm();
    syncPackagesForm();
    syncUsersTable();
    syncGamesTable();
    adminData.state.setupComplete = adminData.users.length > 0;
    try {
        await saveAdminData();
        clearAdminEditing();
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
    clearAdminEditing();
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
    markAdminEditing();
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
    markAdminEditing();
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
        const payload = await response.json().catch(() => ({}));
        adminRole = String(payload?.role || "mod");
        adminUsername = String(payload?.username || "admin");
        return true;
    } catch (error) {
        storeAdminToken("");
        return false;
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    const username = adminUsernameInput?.value?.trim().toLowerCase() || "admin";
    const password = adminPasswordInput?.value || "";
    const otpCode = adminOtpInput?.value?.trim() || "";
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
            body: JSON.stringify({
                username,
                password,
                otpCode
            })
        });
        if (response.status === 404) {
            throw new Error("Server chua cap nhat admin auth. Tat server cu va chay lai run.bat.");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.token) {
            throw new Error(payload?.error || "Dang nhap that bai");
        }

        storeAdminToken(payload.token);
        adminRole = String(payload?.role || "mod");
        adminUsername = String(payload?.username || username);
        adminPasswordInput.value = "";
        if (adminOtpInput) {
            adminOtpInput.value = "";
        }
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

async function handleDedupeClients() {
    try {
        const response = await fetch(ADMIN_DEVICES_DEDUPE_API, {
            method: "POST",
            headers: getAuthHeaders()
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong gop trung duoc");
        }
        clientRows = Array.isArray(payload?.clients) ? payload.clients : [];
        renderClientsTable();
        showStatus(`Da gop trung, xoa ${Number(payload?.removed || 0)} dong trung.`);
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong gop trung duoc");
    }
}

async function handleExportClientsCsv() {
    try {
        const response = await fetch(ADMIN_DEVICES_EXPORT_API, {
            method: "GET",
            headers: getAuthHeaders(false),
            cache: "no-store"
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        if (!response.ok) {
            throw new Error("Khong xuat duoc CSV");
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = `limore-clients-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong xuat duoc CSV");
    }
}

function closeDeviceDetailModal() {
    deviceDetailModal?.setAttribute("hidden", "");
    if (deviceDetailBody) {
        deviceDetailBody.innerHTML = "";
    }
}

async function openClientDetail(clientId, fingerprint) {
    if (!deviceDetailModal || !deviceDetailBody) {
        return;
    }
    deviceDetailModal.removeAttribute("hidden");
    deviceDetailBody.innerHTML = `<div class="simple-list-item"><span>Dang tai chi tiet...</span></div>`;
    try {
        const query = new URLSearchParams();
        if (clientId) {
            query.set("clientId", clientId);
        }
        if (fingerprint) {
            query.set("fingerprint", fingerprint);
        }
        const response = await fetch(`${ADMIN_DEVICE_DETAIL_API}?${query.toString()}`, {
            cache: "no-store",
            headers: getAuthHeaders(false)
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.client) {
            throw new Error(payload?.error || "Khong tai duoc chi tiet");
        }
        const client = payload.client;
        const historyRows = Array.isArray(payload?.history) ? payload.history : [];
        deviceDetailBody.innerHTML = `
            <div class="admin-modal-grid">
                <div class="admin-modal-meta"><strong>Client ID:</strong> ${client.clientId || "-"}</div>
                <div class="admin-modal-meta"><strong>Loai may:</strong> ${getClientDeviceTitle(client)}</div>
                <div class="admin-modal-meta"><strong>User:</strong> ${client.desktopName || client.currentUserId || "-"}</div>
                <div class="admin-modal-meta"><strong>IP:</strong> ${client.ipAddress || "-"}</div>
                <div class="admin-modal-meta"><strong>Trang:</strong> ${client.currentPage || "/"}</div>
                <div class="admin-modal-meta"><strong>Lan cuoi:</strong> ${client.lastSeenAt ? new Date(client.lastSeenAt).toLocaleString("vi-VN") : "-"}</div>
            </div>
            <div class="admin-modal-history">
                ${historyRows.length
                    ? historyRows.map((entry) => `
                        <div class="admin-modal-history-item">
                            <strong>${new Date(entry.at || Date.now()).toLocaleString("vi-VN")}</strong><br>
                            IP: ${entry.ipAddress || "-"} • Page: ${entry.currentPage || "/"} • ${entry.blockedByFirewall ? "Bi firewall chan" : "Hop le"}
                        </div>
                    `).join("")
                    : `<div class="admin-modal-history-item">Chua co lich su cho client nay.</div>`}
            </div>
        `;
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        deviceDetailBody.innerHTML = `<div class="simple-list-item"><span>${error.message || "Khong tai duoc chi tiet thiet bi"}</span></div>`;
    }
}

async function saveFirewallRules() {
    try {
        const response = await fetch(ADMIN_FIREWALL_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                rules: adminFirewallRules
            })
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong luu duoc firewall");
        }
        adminFirewallRules = Array.isArray(payload?.rules) ? payload.rules : adminFirewallRules;
        renderFirewallRules();
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong luu duoc firewall");
    }
}

async function handleAddFirewallRule() {
    const rule = String(firewallRuleInput?.value || "").trim();
    if (!rule) {
        showStatus("Nhap rule IP truoc khi them");
        return;
    }
    if (!adminFirewallRules.includes(rule)) {
        adminFirewallRules = [...adminFirewallRules, rule];
    }
    if (firewallRuleInput) {
        firewallRuleInput.value = "";
    }
    await saveFirewallRules();
    showStatus("Da them firewall rule");
}

async function handleDeleteFirewallRule(index) {
    const rowIndex = Number(index);
    if (Number.isNaN(rowIndex) || rowIndex < 0 || rowIndex >= adminFirewallRules.length) {
        return;
    }
    adminFirewallRules = adminFirewallRules.filter((_, itemIndex) => itemIndex !== rowIndex);
    await saveFirewallRules();
    showStatus("Da xoa firewall rule");
}

async function handleAckAlert(alertId) {
    try {
        const response = await fetch(ADMIN_ALERTS_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                action: "ack",
                alertId
            })
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong cap nhat duoc canh bao");
        }
        adminAlerts = Array.isArray(payload?.alerts) ? payload.alerts : adminAlerts;
        renderAlerts();
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong cap nhat duoc canh bao");
    }
}

async function handleAckAllAlerts() {
    try {
        const response = await fetch(ADMIN_ALERTS_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                action: "ack_all"
            })
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong cap nhat duoc canh bao");
        }
        adminAlerts = Array.isArray(payload?.alerts) ? payload.alerts : adminAlerts;
        renderAlerts();
        showStatus("Da danh dau doc tat ca canh bao");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong cap nhat duoc canh bao");
    }
}

async function handleSaveOtpSettings() {
    if (!isSuperAdmin()) {
        showStatus("Chi Super Admin duoc sua OTP");
        return;
    }
    try {
        const response = await fetch(ADMIN_AUTH_OTP_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                otpEnabled: otpEnabledInput?.value === "1",
                otpCode: String(otpCodeInput?.value || "").trim()
            })
        });
        if (response.status === 401) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong luu duoc OTP");
        }
        if (otpEnabledInput) {
            otpEnabledInput.value = payload?.otpEnabled ? "1" : "0";
        }
        if (otpCodeInput) {
            otpCodeInput.value = String(payload?.otpCode || "");
        }
        showStatus("Da cap nhat OTP");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong luu duoc OTP");
    }
}

function syncRolloutConfigFromForm() {
    const rollout = getCurrentRolloutConfig();
    const nextRollout = sanitizeRolloutConfig({
        ...rollout,
        enabled: rolloutEnabledInput?.value === "1",
        percent: Number(rolloutPercentInput?.value ?? rollout.percent),
        stableVersion: String(rolloutStableVersionInput?.value || rollout.stableVersion).trim(),
        latestVersion: String(rolloutLatestVersionInput?.value || rollout.latestVersion).trim()
    }, rollout);
    adminData.state.rollout = nextRollout;
    if (rolloutPercentValue) {
        rolloutPercentValue.textContent = `${nextRollout.percent}%`;
    }
    updateRolloutPreview();
}

async function handleSaveRolloutSettings() {
    if (!isSuperAdmin()) {
        showStatus("Chi Super Admin duoc sua rollout");
        return;
    }
    syncRolloutConfigFromForm();
    try {
        const response = await fetch(ADMIN_ROLLOUT_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                rollout: adminData.state.rollout
            })
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong luu duoc rollout");
        }
        adminData.state.rollout = sanitizeRolloutConfig(payload?.rollout, defaultState.rollout);
        renderRolloutPanel();
        showStatus("Da cap nhat rollout version");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong luu duoc rollout");
    }
}

async function handleSaveRoleUser() {
    if (!isSuperAdmin()) {
        showStatus("Chi Super Admin duoc sua role user");
        return;
    }
    const username = String(roleUsernameInput?.value || "").trim().toLowerCase();
    if (!username) {
        showStatus("Nhap username role user");
        return;
    }
    try {
        const response = await fetch(ADMIN_AUTH_USERS_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                action: "upsert",
                username,
                role: roleLevelInput?.value || "mod",
                password: String(rolePasswordInput?.value || "").trim()
            })
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong luu duoc role user");
        }
        adminRoleUsers = Array.isArray(payload?.users) ? payload.users : adminRoleUsers;
        renderRoleUsersTable();
        if (roleUsernameInput) {
            roleUsernameInput.value = "";
        }
        if (rolePasswordInput) {
            rolePasswordInput.value = "";
        }
        showStatus("Da cap nhat role user");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong luu duoc role user");
    }
}

async function handleDeleteRoleUser(username) {
    if (!isSuperAdmin()) {
        showStatus("Chi Super Admin duoc xoa role user");
        return;
    }
    try {
        const response = await fetch(ADMIN_AUTH_USERS_API, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                action: "delete",
                username
            })
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error("admin_auth_required");
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Khong xoa duoc role user");
        }
        adminRoleUsers = Array.isArray(payload?.users) ? payload.users : adminRoleUsers;
        renderRoleUsersTable();
        showStatus("Da xoa role user");
    } catch (error) {
        if (error.message === "admin_auth_required") {
            storeAdminToken("");
            setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            return;
        }
        showStatus(error.message || "Khong xoa duoc role user");
    }
}

async function loadAdminDashboard() {
    await fetchAdminDataFromServer();
    try {
        await fetchClientRows();
        await Promise.all([
            fetchOtpSettings(),
            fetchRoleUsers(),
            fetchAuditLogs(),
            fetchAlerts(),
            fetchFirewallRules(),
            fetchDashboardStats()
        ]);
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
        if (isAdminEditingNow()) {
            return;
        }
        try {
            await fetchAdminDataFromServer();
            await fetchClientRows();
            await Promise.all([
                fetchAuditLogs(),
                fetchAlerts(),
                fetchFirewallRules(),
                fetchDashboardStats(),
                fetchRoleUsers()
            ]);
            renderAll();
        } catch (error) {
            if (error.message === "admin_auth_required") {
                storeAdminToken("");
                setAdminLockedState("Phien admin da het han. Vui long dang nhap lai.");
            }
        }
    }, 6000);
}

balanceInput.addEventListener("input", () => {
    markAdminEditing();
    syncAccountForm();
});
activePackageInput.addEventListener("change", () => {
    markAdminEditing();
    syncAccountForm();
});
currentUserInput.addEventListener("change", handleCurrentUserChange);
desktopNameInput.addEventListener("input", () => {
    markAdminEditing();
    syncAccountForm();
});
limoreNameInput.addEventListener("input", () => {
    markAdminEditing();
    syncAccountForm();
});
packagesForm.addEventListener("input", () => {
    markAdminEditing();
    syncPackagesForm();
});
packagesForm.addEventListener("change", () => {
    markAdminEditing();
    syncPackagesForm();
});
usersTableBody.addEventListener("input", () => {
    markAdminEditing();
    syncUsersTable();
});
usersTableBody.addEventListener("change", (event) => {
    markAdminEditing();
    const radio = event.target.closest('[data-action="set-current-user"]');
    if (radio) {
        adminData.state.currentUserId = radio.value;
    }
    syncUsersTable();
});
gamesTableBody.addEventListener("input", () => {
    markAdminEditing();
    syncGamesTable();
});
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
    markAdminEditing();
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
    markAdminEditing();
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
saveOtpButton?.addEventListener("click", handleSaveOtpSettings);
saveRoleUserButton?.addEventListener("click", handleSaveRoleUser);
refreshAuditButton?.addEventListener("click", fetchAuditLogs);
refreshAlertsButton?.addEventListener("click", fetchAlerts);
ackAllAlertsButton?.addEventListener("click", handleAckAllAlerts);
addFirewallRuleButton?.addEventListener("click", handleAddFirewallRule);
dedupeClientsButton?.addEventListener("click", handleDedupeClients);
exportClientsCsvButton?.addEventListener("click", handleExportClientsCsv);
rolloutEnabledInput?.addEventListener("change", syncRolloutConfigFromForm);
rolloutPercentInput?.addEventListener("input", syncRolloutConfigFromForm);
rolloutStableVersionInput?.addEventListener("input", syncRolloutConfigFromForm);
rolloutLatestVersionInput?.addEventListener("input", syncRolloutConfigFromForm);
rolloutQuickPercentButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!rolloutPercentInput) {
            return;
        }
        const percent = Number(button.dataset.rolloutPercent || "");
        if (Number.isFinite(percent)) {
            rolloutPercentInput.value = String(Math.max(0, Math.min(100, percent)));
            syncRolloutConfigFromForm();
        }
    });
});
saveRolloutButton?.addEventListener("click", handleSaveRolloutSettings);
clientFilterOnline?.addEventListener("change", () => {
    clientFilters.online = clientFilterOnline.value || "all";
    renderClientsTable();
});
clientFilterDevice?.addEventListener("change", () => {
    clientFilters.device = clientFilterDevice.value || "all";
    renderClientsTable();
});
clientFilterIp?.addEventListener("input", () => {
    clientFilters.ip = clientFilterIp.value.trim();
    renderClientsTable();
});
clientFilterUser?.addEventListener("input", () => {
    clientFilters.user = clientFilterUser.value.trim();
    renderClientsTable();
});
clientFilterResetButton?.addEventListener("click", () => {
    clientFilters.online = "all";
    clientFilters.device = "all";
    clientFilters.ip = "";
    clientFilters.user = "";
    if (clientFilterOnline) {
        clientFilterOnline.value = "all";
    }
    if (clientFilterDevice) {
        clientFilterDevice.value = "all";
    }
    if (clientFilterIp) {
        clientFilterIp.value = "";
    }
    if (clientFilterUser) {
        clientFilterUser.value = "";
    }
    renderClientsTable();
});
clientsTableBody?.addEventListener("click", (event) => {
    const toggleButton = event.target.closest('[data-action="toggle-client-block"]');
    if (toggleButton) {
        handleToggleClientBlock(toggleButton.dataset.clientId);
        return;
    }

    const detailRow = event.target.closest('[data-action="open-client-detail"]');
    if (detailRow) {
        openClientDetail(detailRow.dataset.clientId, detailRow.dataset.clientFingerprint);
    }
});
roleUsersTableBody?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest('[data-action="delete-role-user"]');
    if (!deleteButton) {
        return;
    }
    handleDeleteRoleUser(String(deleteButton.dataset.username || ""));
});
firewallRulesList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest('[data-action="delete-firewall-rule"]');
    if (!deleteButton) {
        return;
    }
    handleDeleteFirewallRule(deleteButton.dataset.index);
});
alertsList?.addEventListener("click", (event) => {
    const ackButton = event.target.closest('[data-action="ack-alert"]');
    if (!ackButton) {
        return;
    }
    handleAckAlert(String(ackButton.dataset.alertId || ""));
});
closeDeviceDetailButton?.addEventListener("click", closeDeviceDetailModal);
deviceDetailModal?.addEventListener("click", (event) => {
    if (event.target === deviceDetailModal) {
        closeDeviceDetailModal();
    }
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

window.addEventListener("pointerdown", warmupJoinSoundContext, { passive: true });
window.addEventListener("keydown", warmupJoinSoundContext, { passive: true });

async function bootstrapAdmin() {
    renderAdminSections();
    if (adminUsernameInput && !adminUsernameInput.value) {
        adminUsernameInput.value = "admin";
    }
    const hasValidSession = await verifyAdminSession();
    if (!hasValidSession) {
        setAdminLockedState("Neu vua cap nhat code ma van khong vao duoc, hay tat server cu va chay lai run.bat.");
        return;
    }

    setAdminUnlockedState();
    await loadAdminDashboard();
    startAdminLiveSync();
    applyRolePermissions();
}

bootstrapAdmin();


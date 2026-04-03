const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const desktop = document.querySelector(".desktop");
const desktopIcons = document.getElementById("desktop-icons");
const desktopSelectionBox = document.getElementById("desktop-selection-box");
const windowLayer = document.getElementById("window-layer");
const runningApps = document.getElementById("running-apps");
const bootScreen = document.getElementById("boot-screen");
const lockScreen = document.getElementById("lock-screen");
const lockTime = document.getElementById("lock-time");
const lockDate = document.getElementById("lock-date");
const lockUserName = document.getElementById("lock-user-name");
const startUserName = document.getElementById("start-user-name");
const setupPanel = document.getElementById("setup-panel");
const setupDesktopNameInput = document.getElementById("setup-desktop-name");
const setupLimoreNameInput = document.getElementById("setup-limore-name");
const createAccountButton = document.getElementById("create-account-button");
const loginPanel = document.getElementById("login-panel");
const unlockButton = document.getElementById("unlock-button");
const clientBlockScreen = document.getElementById("client-block-screen");
const blockedRefreshButton = document.getElementById("blocked-refresh-button");
const volumeButton = document.getElementById("volume-button");
const volumeIcon = document.getElementById("volume-icon");
const quickSettings = document.getElementById("quick-settings");
const networkInfoButton = document.getElementById("network-info-button");
const networkInfoPanel = document.getElementById("network-info-panel");
const networkCurrentLink = document.getElementById("network-current-link");
const networkLanLinks = document.getElementById("network-lan-links");
const clockButton = document.getElementById("clock-button");
const calendarPanel = document.getElementById("calendar-panel");
const calendarTodayLabel = document.getElementById("calendar-today-label");
const calendarTimeLabel = document.getElementById("calendar-time-label");
const calendarMonthLabel = document.getElementById("calendar-month-label");
const calendarGrid = document.getElementById("calendar-grid");
const calendarPrevMonthButton = document.getElementById("calendar-prev-month");
const calendarNextMonthButton = document.getElementById("calendar-next-month");
const openWallpaperPanelButton = document.getElementById("open-wallpaper-panel");
const desktopThemePanel = document.getElementById("desktop-theme-panel");
const closeWallpaperPanelButton = document.getElementById("close-wallpaper-panel");
const powerButton = document.querySelector(".start-footer .fa-power-off");
const volumeSlider = document.getElementById("volume-slider");
const brightnessSlider = document.getElementById("brightness-slider");
const brightnessValue = document.getElementById("brightness-value");
const brightnessStatusBadge = document.getElementById("brightness-status-badge");
const batteryStatusBadge = document.getElementById("battery-status-badge");
const volumeValue = document.getElementById("volume-value");
const quickVolumeIcon = document.getElementById("qs-volume-icon");
const trayWifiIcon = document.getElementById("tray-wifi-icon");
const trayFlyoutButton = document.getElementById("tray-flyout-button");
const widgetsButton = document.getElementById("widgets-button");
const taskbarSearchButton = document.getElementById("taskbar-search-button");
const taskViewButton = document.getElementById("task-view-button");
const searchPanel = document.getElementById("search-panel");
const searchPanelInput = document.getElementById("search-panel-input");
const searchPanelResults = document.getElementById("search-panel-results");
const widgetsBoard = document.getElementById("widgets-board");
const widgetOpenApps = document.getElementById("widget-open-apps");
const taskViewPanel = document.getElementById("task-view-panel");
const taskViewGrid = document.getElementById("task-view-grid");
const virtualDesktopsEl = document.getElementById("virtual-desktops");
const notificationCenter = document.getElementById("notification-center");
const notificationCenterDate = document.getElementById("notification-center-date");
const notificationHistory = document.getElementById("notification-history");
const clearNotificationsButton = document.getElementById("clear-notifications-button");
const runDialog = document.getElementById("run-dialog");
const runDialogInput = document.getElementById("run-dialog-input");
const runDialogOkButton = document.getElementById("run-dialog-ok");
const runDialogCancelButton = document.getElementById("run-dialog-cancel");
const powerMenu = document.getElementById("power-menu");
const winxMenu = document.getElementById("winx-menu");
const shortcutContextMenu = document.getElementById("shortcut-context-menu");
const taskbarPreview = document.getElementById("taskbar-preview");
const toastContainer = document.getElementById("toast-container");
const snapAssistOverlay = document.getElementById("snap-assist-overlay");
const altTabOverlay = document.getElementById("alt-tab-overlay");
const startPinnedGrid = document.getElementById("start-pinned-grid");
const openTaskmanagerButton = document.getElementById("open-taskmanager-button");
const openSysteminfoButton = document.getElementById("open-systeminfo-button");
const controllerMenuToggle = document.getElementById("controller-menu-toggle");
const controllerMenu = document.getElementById("controller-menu");
const virtualGamepad = document.getElementById("virtual-gamepad");
const controllerUptime = document.getElementById("controller-uptime");
const controllerPing = document.getElementById("controller-ping");
const togglePhysicalGamepadButton = document.getElementById("toggle-physical-gamepad");
const toggleTouchMouseButton = document.getElementById("toggle-touch-mouse");
const toggleTouchLeftHoldButton = document.getElementById("toggle-touch-left-hold");
const toggleVirtualGamepadButton = document.getElementById("toggle-virtual-gamepad");
const toggleLayoutEditButton = document.getElementById("toggle-layout-edit");
const controllerSizeDownButton = document.getElementById("controller-size-down");
const controllerSizeUpButton = document.getElementById("controller-size-up");
const controllerResetLayoutButton = document.getElementById("controller-reset-layout");
const uiShell = document.getElementById("ui-shell");

const MOBILE_FIT_BREAKPOINT = 900;
const MOBILE_FIT_BASE_WIDTH = 1366;
const MOBILE_FIT_MIN_HEIGHT = 560;
const mobileFitState = {
    active: false,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    windowScale: 1
};

let screenWakeLock = null;
let wakeLockBootstrapped = false;
const wakeLockBootstrapEvents = ["pointerdown", "touchstart", "keydown"];

async function requestScreenWakeLock() {
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") {
        return false;
    }

    if (screenWakeLock) {
        return true;
    }

    try {
        screenWakeLock = await navigator.wakeLock.request("screen");
        screenWakeLock.addEventListener("release", () => {
            screenWakeLock = null;
        }, { once: true });
        return true;
    } catch (error) {
        screenWakeLock = null;
        return false;
    }
}

function bootstrapScreenWakeLock() {
    requestScreenWakeLock().then((locked) => {
        if (!locked) {
            return;
        }

        wakeLockBootstrapEvents.forEach((eventName) => {
            document.removeEventListener(eventName, bootstrapScreenWakeLock);
        });
    });
}

function initializeScreenWakeLock() {
    if (!("wakeLock" in navigator) || wakeLockBootstrapped) {
        return;
    }

    wakeLockBootstrapped = true;
    wakeLockBootstrapEvents.forEach((eventName) => {
        document.addEventListener(eventName, bootstrapScreenWakeLock, { passive: true });
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            requestScreenWakeLock();
            return;
        }

        if (screenWakeLock) {
            screenWakeLock.release().catch(() => {});
            screenWakeLock = null;
        }
    });

    window.addEventListener("pageshow", () => {
        requestScreenWakeLock();
    });

    window.addEventListener("focus", () => {
        requestScreenWakeLock();
    });
}

const appCatalog = {
    chrome: {
        name: "Google Chrome",
        icon: "https://img.icons8.com/color/48/chrome--v1.png",
        description: "Trinh duyet Chrome da mo. Ban co the mo lai tu taskbar."
    },
    edge: {
        name: "Microsoft Edge",
        icon: "https://img.icons8.com/fluency/48/microsoft-edge.png",
        description: "Edge dang chay voi giao dien gia lap."
    },
    files: {
        name: "File Explorer",
        icon: "https://img.icons8.com/color/48/folder-invoices--v1.png",
        description: "Quan ly file theo phong cach Windows 11."
    },
    word: {
        name: "Microsoft Word",
        icon: "https://img.icons8.com/fluency/48/microsoft-word-2019.png",
        description: "Cua so Word da duoc khoi tao."
    },
    settings: {
        name: "Settings",
        icon: "https://img.icons8.com/fluency/48/settings.png",
        description: "Cai dat he thong dang san sang."
    },
    thispc: {
        name: "This PC",
        icon: "assets/this-pc-custom-v3.png",
        description: "Trang tong quan This PC."
    },
    recycle: {
        name: "Recycle Bin",
        icon: "assets/recycle-bin-custom-v3.png",
        description: "Thung rac hien dang trong."
    },
    photos: {
        name: "Photos",
        icon: "https://img.icons8.com/fluency/48/picture.png",
        description: "Bo suu tap anh trong assets.",
        layout: "photos"
    },
    taskmanager: {
        name: "Task Manager",
        icon: "https://img.icons8.com/fluency/48/combo-chart.png",
        description: "Giam sat app dang mo, CPU va RAM.",
        layout: "task-manager"
    },
    systeminfo: {
        name: "About This PC",
        icon: "https://img.icons8.com/fluency/48/system-information.png",
        description: "Thong tin he thong va cau hinh.",
        layout: "system-info"
    },
    gamecloud: {
        name: "Limore Cloud",
        icon: "assets/game-cloud.webp",
        description: "Ung dung Limore Cloud da san sang.",
        layout: "limore-cloud"
    }
};

const limoreCloudSections = {
    home: {
        title: "Home",
        subtitle: "Bo suu tap game Steam dang hot duoc chon cho hom nay."
    },
    games: {
        title: "Games",
        subtitle: "Thu vien game Steam mo rong voi anh header day du."
    },
    packages: {
        title: "Cloud",
        subtitle: "3 goi cloud gaming cau hinh manh cho nguoi dung Viet Nam va quoc te."
    },
    played: {
        title: "Played Games",
        subtitle: "Nhung tua game hot phu hop de quay lai choi ngay."
    },
    saves: {
        title: "My Game Saves",
        subtitle: "Danh sach game noi bat co the bo sung luu tru cloud."
    },
    topup: {
        title: "Nap tien",
        subtitle: ""
    },
    settings: {
        title: "My Game Settings",
        subtitle: "Thu vien game moi de gan profile va cau hinh."
    }
};

const STEAM_ASSET_BASE_URL = "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps";
const LIMORE_ADMIN_DATA_KEY = "win11_limore_admin_data_v1";
const LIMORE_ADMIN_DATA_API = "/api/limore-admin-data";
const LIMORE_CLIENTS_API = "/api/limore-clients";
const LIMORE_CLIENT_ID_KEY = "win11_limore_client_id_v1";
const DESKTOP_CURRENT_USER_KEY = "win11_current_user_id_v1";
let blockedClientIds = [];

function buildSteamHeaderImage(appId) {
    return `${STEAM_ASSET_BASE_URL}/${appId}/header.jpg`;
}

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeLimoreCloudGames(games) {
    return (Array.isArray(games) ? games : []).map((game, index) => {
        const appId = Number(game.appId) || 0;
        return {
            ...game,
            appId,
            title: String(game.title || "Unknown Game"),
            genre: String(game.genre || "Unknown Genre"),
            release: String(game.release || ""),
            sections: String(game.sections || "games"),
            rank: index + 1,
            image: game.image || buildSteamHeaderImage(appId),
            storeUrl: game.storeUrl || (appId ? `https://store.steampowered.com/app/${appId}/` : "#")
        };
    });
}

function sanitizeLimoreCloudPackages(packages) {
    return (Array.isArray(packages) ? packages : []).map((pkg, index) => {
        const defaultPackage = defaultLimoreCloudPackages[index] || defaultLimoreCloudPackages[0];
        return {
            ...defaultPackage,
            ...pkg,
            id: defaultPackage.id,
            price: Number(pkg?.price ?? defaultPackage.price) || defaultPackage.price,
            specs: Array.isArray(pkg?.specs)
                ? pkg.specs.map((spec) => String(spec || "").trim()).filter(Boolean)
                : cloneJson(defaultPackage.specs)
        };
    });
}

function sanitizeDesktopUsers(users) {
    const safeUsers = (Array.isArray(users) ? users : []).map((user, index) => ({
        id: String(user?.id || `user${index + 1}`).trim() || `user${index + 1}`,
        desktopName: String(user?.desktopName || user?.name || `User ${index + 1}`).trim() || `User ${index + 1}`,
        limoreName: String(user?.limoreName || "Anonymous").trim() || "Anonymous",
        balance: Number(user?.balance) || 0,
        activePackageId: String(user?.activePackageId || "")
    })).filter((user, index, array) => array.findIndex((item) => item.id === user.id) === index);

    return safeUsers.length ? safeUsers : cloneJson(defaultDesktopUsers);
}

function getPendingDesktopUser() {
    return {
        id: "",
        desktopName: "",
        limoreName: "Anonymous",
        balance: 0,
        activePackageId: ""
    };
}

function getStoredDesktopUserId() {
    try {
        return String(localStorage.getItem(DESKTOP_CURRENT_USER_KEY) || "").trim();
    } catch (error) {
        return "";
    }
}

function storeDesktopUserId(userId) {
    try {
        if (!userId) {
            localStorage.removeItem(DESKTOP_CURRENT_USER_KEY);
            return;
        }
        localStorage.setItem(DESKTOP_CURRENT_USER_KEY, String(userId));
    } catch (error) {
        // Ignore storage failures.
    }
}

function buildDesktopUserId(desktopName) {
    const baseSlug = String(desktopName || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24) || "user";
    return `${baseSlug}-${getOrCreateClientId().slice(-6)}`;
}

function getCurrentDesktopUser() {
    if (!initialSetupComplete) {
        return getPendingDesktopUser();
    }

    return desktopUsers.find((user) => user.id === currentDesktopUserId) || desktopUsers[0] || cloneJson(defaultDesktopUsers[0]);
}

function syncDesktopUserUi() {
    const currentUser = getCurrentDesktopUser();
    const displayName = initialSetupComplete ? currentUser.desktopName : "New User";
    if (lockUserName) {
        lockUserName.textContent = displayName;
    }
    if (startUserName) {
        startUserName.textContent = displayName;
    }
}

function getOrCreateClientId() {
    try {
        const existingClientId = localStorage.getItem(LIMORE_CLIENT_ID_KEY);
        if (existingClientId) {
            return existingClientId;
        }
        const nextClientId = `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(LIMORE_CLIENT_ID_KEY, nextClientId);
        return nextClientId;
    } catch (error) {
        return `client-${Date.now().toString(36)}`;
    }
}

function getClientDeviceType() {
    if (isMobileLikeViewport()) {
        return detectMobileDeviceClass();
    }
    return "desktop";
}

function syncClientBlockScreen() {
    const isBlocked = blockedClientIds.includes(getOrCreateClientId());
    if (isBlocked) {
        clientBlockScreen?.removeAttribute("hidden");
        document.body.classList.add("is-client-blocked");
        return true;
    }

    clientBlockScreen?.setAttribute("hidden", "");
    document.body.classList.remove("is-client-blocked");
    return false;
}

function sendClientHeartbeat() {
    const currentUser = getCurrentDesktopUser();
    const payload = {
        clientId: getOrCreateClientId(),
        deviceType: getClientDeviceType(),
        userAgent: navigator.userAgent,
        currentPage: window.location.pathname,
        desktopName: currentUser.desktopName,
        limoreName: currentUser.limoreName,
        currentUserId: currentDesktopUserId,
        setupComplete: initialSetupComplete,
        isMobile: isMobileLikeViewport(),
        anonymous: !initialSetupComplete || !currentUser.limoreName || currentUser.limoreName === "Anonymous"
    };

    fetch(LIMORE_CLIENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).then((response) => response.ok ? response.json() : null)
        .then((responsePayload) => {
            if (!responsePayload || typeof responsePayload.blocked !== "boolean") {
                return;
            }

            const currentClientId = getOrCreateClientId();
            if (responsePayload.blocked) {
                if (!blockedClientIds.includes(currentClientId)) {
                    blockedClientIds = [...blockedClientIds, currentClientId];
                }
            } else {
                blockedClientIds = blockedClientIds.filter((clientId) => clientId !== currentClientId);
            }
            syncClientBlockScreen();
        })
        .catch(() => {});
}

function getDefaultLimoreAdminData() {
    return {
        games: cloneJson(defaultLimoreCloudLibrary),
        packages: cloneJson(defaultLimoreCloudPackages),
        users: cloneJson(defaultDesktopUsers),
        state: {
            currentUserId: defaultDesktopUsers[0].id,
            setupComplete: false,
            blockedClientIds: []
        }
    };
}

function mergeLimoreAdminData(rawData = {}) {
    const defaults = getDefaultLimoreAdminData();
    const legacyBalance = Number(rawData?.state?.balance) || 0;
    const legacyActivePackageId = String(rawData?.state?.activePackageId || "");
    const nextUsers = Array.isArray(rawData?.users) && rawData.users.length
        ? rawData.users
        : [{
            ...defaultDesktopUsers[0],
            balance: legacyBalance,
            activePackageId: legacyActivePackageId
        }];

    return {
        games: Array.isArray(rawData?.games) && rawData.games.length ? rawData.games : defaults.games,
        packages: Array.isArray(rawData?.packages) && rawData.packages.length ? rawData.packages : defaults.packages,
        users: nextUsers,
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

function loadLimoreAdminData() {
    if (limoreAdminDataCache) {
        return limoreAdminDataCache;
    }

    try {
        const raw = localStorage.getItem(LIMORE_ADMIN_DATA_KEY);
        limoreAdminDataCache = mergeLimoreAdminData(raw ? JSON.parse(raw) : {});
    } catch (error) {
        limoreAdminDataCache = getDefaultLimoreAdminData();
    }
    return limoreAdminDataCache;
}

async function fetchLimoreAdminDataFromServer() {
    try {
        const response = await fetch(LIMORE_ADMIN_DATA_API, {
            cache: "no-store",
            headers: {
                "X-Limore-Client-Id": getOrCreateClientId()
            }
        });
        if (!response.ok) {
            throw new Error("Could not load admin data");
        }
        const payload = await response.json();
        limoreAdminDataCache = mergeLimoreAdminData({
            ...(payload?.data || {}),
            state: {
                ...((payload?.data || {}).state || {}),
                rememberedCurrentUserId: String(payload?.rememberedCurrentUserId || "")
            }
        });
        try {
            localStorage.setItem(LIMORE_ADMIN_DATA_KEY, JSON.stringify(limoreAdminDataCache));
        } catch (error) {
            // Ignore storage failures.
        }
        return limoreAdminDataCache;
    } catch (error) {
        return loadLimoreAdminData();
    }
}

async function refreshLimoreAdminDataFromServer() {
    const nextData = await fetchLimoreAdminDataFromServer();
    applyLimoreAdminData(nextData);

    const limoreState = openAppMap.get("gamecloud");
    if (limoreState) {
        refreshLimoreBalance(limoreState.windowEl);
        refreshLimorePackages(limoreState.windowEl);
        updateLimoreCloudWindow(limoreState.windowEl);
    }
}

function getLimoreVisualSignature(data = loadLimoreAdminData()) {
    const mergedData = mergeLimoreAdminData(data);
    return JSON.stringify({
        games: normalizeLimoreCloudGames(mergedData.games).map((game) => ({
            appId: game.appId,
            title: game.title,
            genre: game.genre,
            release: game.release,
            sections: game.sections,
            image: game.image,
            storeUrl: game.storeUrl
        })),
        packages: sanitizeLimoreCloudPackages(mergedData.packages).map((pkg) => ({
            id: pkg.id,
            badge: pkg.badge,
            title: pkg.title,
            price: pkg.price,
            vnPriceLabel: pkg.vnPriceLabel,
            globalPriceLabel: pkg.globalPriceLabel,
            description: pkg.description,
            featured: Boolean(pkg.featured),
            specs: Array.isArray(pkg.specs) ? pkg.specs : []
        })),
        users: sanitizeDesktopUsers(mergedData.users),
        state: {
            currentUserId: String(mergedData.state?.currentUserId || ""),
            setupComplete: Boolean(mergedData.state?.setupComplete),
            blockedClientIds: Array.isArray(mergedData.state?.blockedClientIds) ? mergedData.state.blockedClientIds : []
        }
    });
}

function persistLimoreAdminData(partialData = {}) {
    const currentData = loadLimoreAdminData();
    limoreAdminDataCache = {
        games: Array.isArray(partialData.games) ? partialData.games : currentData.games,
        packages: Array.isArray(partialData.packages) ? partialData.packages : currentData.packages,
        users: Array.isArray(partialData.users) ? partialData.users : currentData.users,
        clients: Array.isArray(partialData.clients) ? partialData.clients : currentData.clients,
        state: partialData.state ? {
            currentUserId: String(partialData.state.currentUserId || currentData.state.currentUserId || defaultDesktopUsers[0].id),
            setupComplete: partialData.state.setupComplete === undefined
                ? Boolean(currentData.state.setupComplete)
                : Boolean(partialData.state.setupComplete)
            ,
            blockedClientIds: Array.isArray(partialData.state.blockedClientIds)
                ? partialData.state.blockedClientIds.map((value) => String(value || "").trim()).filter(Boolean)
                : (Array.isArray(currentData.state?.blockedClientIds) ? currentData.state.blockedClientIds : [])
        } : currentData.state
    };

    try {
        localStorage.setItem(LIMORE_ADMIN_DATA_KEY, JSON.stringify(limoreAdminDataCache));
    } catch (error) {
        // Ignore storage failures to keep the app responsive.
    }

    fetch(LIMORE_ADMIN_DATA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limoreAdminDataCache)
    }).catch(() => {});
}

function applyLimoreAdminData(data = loadLimoreAdminData()) {
    limoreCloudLibrary = normalizeLimoreCloudGames(data.games);
    limoreCloudPackages = sanitizeLimoreCloudPackages(data.packages);
    desktopUsers = sanitizeDesktopUsers(data.users);
    const storedDesktopUserId = getStoredDesktopUserId();
    const rememberedCurrentUserId = String(data?.state?.rememberedCurrentUserId || "").trim();
    const matchedDesktopUser = desktopUsers.find((user) => user.id === storedDesktopUserId);
    const rememberedDesktopUser = desktopUsers.find((user) => user.id === rememberedCurrentUserId);
    const resolvedDesktopUser = matchedDesktopUser || rememberedDesktopUser || null;
    currentDesktopUserId = resolvedDesktopUser?.id || "";
    initialSetupComplete = Boolean(resolvedDesktopUser);
    if (resolvedDesktopUser?.id) {
        storeDesktopUserId(resolvedDesktopUser.id);
    }
    blockedClientIds = Array.isArray(data.state?.blockedClientIds)
        ? data.state.blockedClientIds.map((value) => String(value || "").trim()).filter(Boolean)
        : [];
    const currentUser = getCurrentDesktopUser();
    limoreCloudState.balance = Number(currentUser.balance) || 0;
    limoreCloudState.activePackageId = String(currentUser.activePackageId || "");
    syncDesktopUserUi();
    syncClientBlockScreen();
}

function persistLimoreCloudState() {
    const nextUsers = sanitizeDesktopUsers(loadLimoreAdminData().users).map((user) => user.id === currentDesktopUserId ? {
        ...user,
        balance: limoreCloudState.balance,
        activePackageId: limoreCloudState.activePackageId
    } : user);
    persistLimoreAdminData({
        users: nextUsers
    });
}

function refreshOpenLimoreCloudWindow() {
    const appState = openAppMap.get("gamecloud");
    if (!appState) {
        return;
    }

    const activeSection = appState.windowEl.querySelector(".limore-nav-item.active")?.dataset.section || "games";
    const searchValue = appState.windowEl.querySelector(".limore-cloud-search-input")?.value || "";
    const expandedTopupSections = Array.from(appState.windowEl.querySelectorAll(".limore-topup-item.is-open")).map((item, index) => {
        const toggle = item.querySelector(".limore-topup-toggle");
        return toggle?.getAttribute("aria-expanded") === "true" ? index : -1;
    }).filter((index) => index >= 0);

    const restoreState = {
        rect: appState.restoreRect || captureRect(appState.windowEl),
        maximized: appState.maximized,
        minimized: appState.windowEl.classList.contains("minimized"),
        zIndex: Number(appState.windowEl.style.zIndex) || 0,
        limore: {
            activeSection,
            searchValue,
            expandedTopupSections
        }
    };
    const shouldFocus = activeAppId === "gamecloud" && !restoreState.minimized;

    closeApp("gamecloud");
    openApp("gamecloud", {
        restoreState,
        skipFocus: !shouldFocus
    });

    if (shouldFocus) {
        focusApp("gamecloud");
    }
}

const defaultLimoreCloudLibrary = [
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
    { appId: 440, title: "Team Fortress 2", genre: "Hero FPS", release: "2007", sections: "games played settings" },
    { appId: 550, title: "Left 4 Dead 2", genre: "Co-op Zombie Shooter", release: "2009", sections: "games played saves" },
    { appId: 500, title: "Left 4 Dead", genre: "Co-op Zombie Shooter", release: "2008", sections: "games played" },
    { appId: 240, title: "Counter-Strike: Source", genre: "Classic FPS", release: "2004", sections: "games played settings" },
    { appId: 10, title: "Counter-Strike", genre: "Classic FPS", release: "2000", sections: "games played" },
    { appId: 400, title: "Portal", genre: "Puzzle FPS", release: "2007", sections: "games saves" },
    { appId: 620, title: "Portal 2", genre: "Puzzle Co-op", release: "2011", sections: "games saves" },
    { appId: 70, title: "Half-Life", genre: "Sci-Fi FPS", release: "1998", sections: "games played" },
    { appId: 220, title: "Half-Life 2", genre: "Sci-Fi FPS", release: "2004", sections: "games played" },
    { appId: 380, title: "Half-Life 2: Episode One", genre: "Sci-Fi FPS", release: "2006", sections: "games played" },
    { appId: 420, title: "Half-Life 2: Episode Two", genre: "Sci-Fi FPS", release: "2007", sections: "games played" },
    { appId: 130, title: "Half-Life: Blue Shift", genre: "Sci-Fi FPS", release: "2001", sections: "games played" },
    { appId: 300, title: "Day of Defeat: Source", genre: "WW2 FPS", release: "2005", sections: "games played" },
    { appId: 320, title: "Half-Life 2: Deathmatch", genre: "Arena FPS", release: "2004", sections: "games played" },
    { appId: 340, title: "Half-Life 2: Lost Coast", genre: "Tech Demo FPS", release: "2005", sections: "games" },
    { appId: 431960, title: "Wallpaper Engine", genre: "Desktop Utility", release: "2018", sections: "home games settings" },
    { appId: 227300, title: "Euro Truck Simulator 2", genre: "Driving Sim", release: "2012", sections: "home games played saves" },
    { appId: 270880, title: "American Truck Simulator", genre: "Driving Sim", release: "2016", sections: "games played saves" },
    { appId: 413150, title: "Stardew Valley", genre: "Farm Life Sim", release: "2016", sections: "home games saves" },
    { appId: 4000, title: "Garry's Mod", genre: "Sandbox", release: "2006", sections: "games played settings" },
    { appId: 108600, title: "Project Zomboid", genre: "Zombie Survival", release: "2013", sections: "games played saves" },
    { appId: 322330, title: "Don't Starve Together", genre: "Co-op Survival", release: "2016", sections: "games played saves" },
    { appId: 219740, title: "Don't Starve", genre: "Survival", release: "2013", sections: "games saves" },
    { appId: 292030, title: "The Witcher 3: Wild Hunt", genre: "Open World RPG", release: "2015", sections: "home games played saves" },
    { appId: 1091500, title: "Cyberpunk 2077", genre: "Open World RPG", release: "2020", sections: "home games played saves" },
    { appId: 1551360, title: "Forza Horizon 5", genre: "Open World Racing", release: "2021", sections: "home games played" },
    { appId: 1240440, title: "Halo Infinite", genre: "Sci-Fi FPS", release: "2021", sections: "games played settings" },
    { appId: 976730, title: "Halo: The Master Chief Collection", genre: "Sci-Fi FPS", release: "2019", sections: "games played saves" },
    { appId: 1172620, title: "Sea of Thieves", genre: "Pirate Adventure", release: "2020", sections: "home games played" },
    { appId: 1593500, title: "God of War", genre: "Action Adventure", release: "2022", sections: "home games played saves" },
    { appId: 1817070, title: "Marvel's Spider-Man Remastered", genre: "Open World Action", release: "2022", sections: "home games played saves" },
    { appId: 1817190, title: "Marvel's Spider-Man: Miles Morales", genre: "Open World Action", release: "2022", sections: "games played saves" },
    { appId: 1888930, title: "The Last of Us Part I", genre: "Action Adventure", release: "2023", sections: "home games played saves" },
    { appId: 2215430, title: "Ghost of Tsushima DIRECTOR'S CUT", genre: "Open World Samurai", release: "2024", sections: "home games played saves" },
    { appId: 1675200, title: "Dragon's Dogma 2", genre: "Action RPG", release: "2024", sections: "home games played saves" },
    { appId: 1364780, title: "Street Fighter 6", genre: "Fighting", release: "2023", sections: "games played settings" },
    { appId: 1778820, title: "TEKKEN 8", genre: "Fighting", release: "2024", sections: "games played settings" },
    { appId: 1895880, title: "Lies of P", genre: "Soulslike", release: "2023", sections: "games played saves" },
    { appId: 1888160, title: "ARMORED CORE VI FIRES OF RUBICON", genre: "Mech Action", release: "2023", sections: "games played settings" },
    { appId: 2050650, title: "Resident Evil 4", genre: "Survival Horror", release: "2023", sections: "games played saves" },
    { appId: 883710, title: "Resident Evil 2", genre: "Survival Horror", release: "2019", sections: "games played saves" },
    { appId: 952060, title: "Resident Evil 3", genre: "Survival Horror", release: "2020", sections: "games played saves" },
    { appId: 1196590, title: "Resident Evil Village", genre: "Survival Horror", release: "2021", sections: "games played saves" },
    { appId: 814380, title: "Sekiro: Shadows Die Twice", genre: "Action Adventure", release: "2019", sections: "games played saves" },
    { appId: 570940, title: "DARK SOULS REMASTERED", genre: "Action RPG", release: "2018", sections: "games played saves" },
    { appId: 374320, title: "DARK SOULS III", genre: "Action RPG", release: "2016", sections: "games played saves" },
    { appId: 582010, title: "Monster Hunter: World", genre: "Co-op Action", release: "2018", sections: "home games played" },
    { appId: 1446780, title: "Monster Hunter Rise", genre: "Co-op Action", release: "2022", sections: "games played" },
    { appId: 1145360, title: "Hades", genre: "Roguelike Action", release: "2020", sections: "home games saves" },
    { appId: 367520, title: "Hollow Knight", genre: "Metroidvania", release: "2017", sections: "games saves" },
    { appId: 632360, title: "Risk of Rain 2", genre: "Co-op Roguelike", release: "2020", sections: "games played settings" },
    { appId: 294100, title: "RimWorld", genre: "Colony Sim", release: "2018", sections: "games saves settings" },
    { appId: 892970, title: "Valheim", genre: "Co-op Survival", release: "2021", sections: "home games played saves" },
    { appId: 548430, title: "Deep Rock Galactic", genre: "Co-op FPS", release: "2020", sections: "home games played settings" },
    { appId: 648800, title: "Raft", genre: "Co-op Survival", release: "2022", sections: "games played saves" },
    { appId: 1326470, title: "Sons Of The Forest", genre: "Survival Horror", release: "2024", sections: "games played saves" },
    { appId: 242760, title: "The Forest", genre: "Survival Horror", release: "2018", sections: "games played saves" },
    { appId: 251570, title: "7 Days to Die", genre: "Zombie Survival", release: "2013", sections: "games played settings" },
    { appId: 526870, title: "Satisfactory", genre: "Factory Builder", release: "2024", sections: "games played settings" },
    { appId: 275850, title: "No Man's Sky", genre: "Space Survival", release: "2016", sections: "home games played saves" },
    { appId: 2399830, title: "ARK: Survival Ascended", genre: "Survival Sandbox", release: "2023", sections: "games played saves" },
    { appId: 346110, title: "ARK: Survival Evolved", genre: "Survival Sandbox", release: "2017", sections: "games played saves" },
    { appId: 1085660, title: "Destiny 2", genre: "Sci-Fi Loot Shooter", release: "2019", sections: "home games played settings" },
    { appId: 304930, title: "Unturned", genre: "Zombie Survival", release: "2017", sections: "games played" },
    { appId: 236390, title: "War Thunder", genre: "Vehicle Combat", release: "2013", sections: "games played settings" },
    { appId: 238960, title: "Path of Exile", genre: "Action RPG", release: "2013", sections: "games played settings" },
    { appId: 2694490, title: "Path of Exile 2", genre: "Action RPG", release: "2026", sections: "home games settings" },
    { appId: 582660, title: "Black Desert", genre: "MMORPG", release: "2017", sections: "games played settings" },
    { appId: 223750, title: "DCS World Steam Edition", genre: "Flight Sim", release: "2014", sections: "games settings" },
    { appId: 438100, title: "VRChat", genre: "Social Sandbox", release: "2017", sections: "games played" },
    { appId: 444200, title: "World of Tanks Blitz", genre: "Vehicle Combat", release: "2016", sections: "games played" },
    { appId: 218620, title: "PAYDAY 2", genre: "Co-op Heist FPS", release: "2013", sections: "games played settings" },
    { appId: 394360, title: "Hearts of Iron IV", genre: "Grand Strategy", release: "2016", sections: "games settings saves" },
    { appId: 236850, title: "Europa Universalis IV", genre: "Grand Strategy", release: "2013", sections: "games settings saves" },
    { appId: 281990, title: "Stellaris", genre: "Grand Strategy", release: "2016", sections: "games settings saves" },
    { appId: 1158310, title: "Crusader Kings III", genre: "Grand Strategy", release: "2020", sections: "games settings saves" },
    { appId: 289070, title: "Sid Meier's Civilization VI", genre: "Turn-Based Strategy", release: "2016", sections: "games settings saves" },
    { appId: 8930, title: "Sid Meier's Civilization V", genre: "Turn-Based Strategy", release: "2010", sections: "games settings saves" },
    { appId: 594570, title: "Total War: WARHAMMER II", genre: "Grand Strategy", release: "2017", sections: "games settings saves" },
    { appId: 1142710, title: "Total War: WARHAMMER III", genre: "Grand Strategy", release: "2022", sections: "games settings saves" },
    { appId: 960090, title: "Bloons TD 6", genre: "Tower Defense", release: "2018", sections: "games played saves" },
    { appId: 945360, title: "Among Us", genre: "Party Social", release: "2018", sections: "games played" },
    { appId: 739630, title: "Phasmophobia", genre: "Co-op Horror", release: "2020", sections: "games played" },
    { appId: 1966720, title: "Lethal Company", genre: "Co-op Horror", release: "2023", sections: "home games played" },
    { appId: 1599340, title: "Lost Ark", genre: "MMORPG", release: "2022", sections: "home games played settings" },
    { appId: 1203220, title: "NARAKA: BLADEPOINT", genre: "Battle Royale Action", release: "2021", sections: "games played settings" },
    { appId: 990080, title: "Hogwarts Legacy", genre: "Open World RPG", release: "2023", sections: "home games played saves" },
    { appId: 1716740, title: "Starfield", genre: "Sci-Fi RPG", release: "2023", sections: "home games played saves" },
    { appId: 1687950, title: "Persona 5 Royal", genre: "JRPG", release: "2022", sections: "games played saves" },
    { appId: 524220, title: "NieR:Automata", genre: "Action RPG", release: "2017", sections: "games played saves" },
    { appId: 1237970, title: "Titanfall 2", genre: "Sci-Fi FPS", release: "2020", sections: "games played settings" },
    { appId: 225540, title: "Just Cause 3", genre: "Open World Action", release: "2015", sections: "games played" },
    { appId: 379430, title: "Kingdom Come: Deliverance", genre: "Medieval RPG", release: "2018", sections: "games played saves" },
    { appId: 1097840, title: "Gears 5", genre: "Action Shooter", release: "2020", sections: "games played" },
    { appId: 1971870, title: "Mortal Kombat 1", genre: "Fighting", release: "2023", sections: "games played settings" },
    { appId: 1782210, title: "Like a Dragon: Infinite Wealth", genre: "JRPG", release: "2024", sections: "games played saves" },
    { appId: 1235140, title: "Yakuza: Like a Dragon", genre: "JRPG", release: "2020", sections: "games played saves" },
    { appId: 1248130, title: "Farming Simulator 22", genre: "Farm Sim", release: "2021", sections: "games saves settings" },
    { appId: 962130, title: "Grounded", genre: "Co-op Survival", release: "2022", sections: "games played saves" },
    { appId: 304390, title: "For Honor", genre: "Action Fighting", release: "2017", sections: "games played settings" },
    { appId: 218230, title: "PlanetSide 2", genre: "Massive FPS", release: "2015", sections: "games played settings" },
    { appId: 391540, title: "Undertale", genre: "Indie RPG", release: "2015", sections: "games saves" },
    { appId: 271590, title: "GTA5 VN", genre: "Roleplay Community", release: "2015", sections: "home games played saves", storeUrl: "https://www.gta5vn.net/" }
];

const defaultLimoreCloudPackages = [
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

const defaultDesktopUsers = [
    {
        id: "dzminh",
        desktopName: "Dz Minh",
        limoreName: "Anonymous",
        balance: 0,
        activePackageId: ""
    }
];

const limoreCloudState = {
    balance: 0,
    activePackageId: ""
};

let limoreCloudLibrary = [];
let limoreCloudPackages = [];
let desktopUsers = [];
let currentDesktopUserId = defaultDesktopUsers[0].id;
let initialSetupComplete = false;
let limoreAdminDataCache = null;

const openAppMap = new Map();
let activeAppId = "";
let zCounter = 1000;
let desktopMenuEl = null;
let activeControllerDrag = null;
let desktopVirtualCursorEl = null;
let physicalGamepadMode = true;
let touchMouseMode = false;
let touchMouseLeftHold = false;
let calendarViewDate = new Date();
let bootSequenceComplete = false;
let lockScreenDismissed = false;
let desktopStateRestoreInProgress = false;
let desktopStateSaveTimer = null;

const DESKTOP_WALLPAPER_KEY = "win11_desktop_wallpaper_v1";
const DESKTOP_STATE_KEY = "win11_desktop_state_v1";
const DESKTOP_ICON_STATE_KEY = "win11_desktop_icons_v1";
const START_PINS_KEY = "win11_start_pins_v1";
const desktopWallpapers = [
    {
        id: "black",
        name: "Windows Dark",
        path: "assets/windows-11-black-wallpaper-2400x1350_50.jpg"
    },
    {
        id: "wukong",
        name: "Wukong Hero",
        path: "assets/wukong-hero.jpg"
    },
    {
        id: "gta",
        name: "GTA V Hero",
        path: "assets/gta5-hero.jpg"
    }
];
let activeWallpaperId = desktopWallpapers[0].id;
let activeBrightness = 80;
let taskbarLocked = true;
let currentVirtualDesktopId = "desktop-1";
let recycleBinItems = [];
let desktopSelection = [];
let notificationItems = [];
let desktopIconsState = [];
let pinnedStartApps = ["edge", "word", "settings", "files", "chrome", "gamecloud"];
let systemSettingState = {
    wifi: true,
    bluetooth: true,
    airplane: false,
    nightlight: true,
    accessibility: false,
    battery: true
};
let altTabIndex = 0;
let altTabSessionOpen = false;
let lockScreenWallpaperIndex = 0;

const CONTROLLER_LAYOUT_KEY = "win11_virtual_controller_layout_v2";
const controllerSessionStart = Date.now();
const controllerPressedKeys = new Set();
const virtualButtonStates = new Map();
const desktopVirtualPointerState = {
    x: window.innerWidth * 0.55,
    y: window.innerHeight * 0.45,
    axisX: 0,
    axisY: 0,
    dpadX: 0,
    dpadY: 0
};
const touchMouseState = {
    tracking: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    moved: false,
    longPressFired: false,
    longPressTimer: null,
    lastTapAt: 0,
    lastTapX: 0,
    lastTapY: 0,
    scrolling: false,
    lastScrollY: 0,
    leftHoldTarget: null
};

const WINDOW_MIN_WIDTH = 420;
const WINDOW_MIN_HEIGHT = 260;

function getViewportWidth() {
    return window.visualViewport ? window.visualViewport.width : window.innerWidth;
}

function getViewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
}

function detectMobileDeviceClass() {
    const ua = navigator.userAgent || "";
    const isIPhone = /iPhone/i.test(ua);
    const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isTablet = isIPad || /Tablet/i.test(ua);

    if (isIPhone) {
        return "iphone";
    }
    if (isTablet) {
        return "tablet";
    }
    if (isAndroid) {
        return "android";
    }
    return "generic";
}

function isMobileLikeViewport() {
    return getViewportWidth() <= MOBILE_FIT_BREAKPOINT;
}

function isTouchMouseModeEnabled() {
    return touchMouseMode && isMobileLikeViewport();
}

function getDesktopViewportWidth() {
    return mobileFitState.active ? mobileFitState.width : window.innerWidth;
}

function getDesktopViewportHeight() {
    return mobileFitState.active ? mobileFitState.height : window.innerHeight;
}

function toDesktopX(clientX) {
    if (!mobileFitState.active) {
        return clientX;
    }

    return (clientX - mobileFitState.offsetX) / mobileFitState.scale;
}

function toDesktopY(clientY) {
    if (!mobileFitState.active) {
        return clientY;
    }

    return (clientY - mobileFitState.offsetY) / mobileFitState.scale;
}

function applyMobileUiFit() {
    if (!uiShell) {
        return;
    }

    const viewportWidth = getViewportWidth();
    const viewportHeight = getViewportHeight();
    const shouldFit = isMobileLikeViewport();

    if (!shouldFit) {
        mobileFitState.active = false;
        mobileFitState.scale = 1;
        mobileFitState.offsetX = 0;
        mobileFitState.offsetY = 0;
        mobileFitState.width = window.innerWidth;
        mobileFitState.height = window.innerHeight;
        mobileFitState.windowScale = 1;

        document.body.classList.remove("mobile-fit");
        delete document.body.dataset.mobileDevice;
        delete document.body.dataset.mobileOrientation;
        uiShell.style.width = "100%";
        uiShell.style.height = "100%";
        uiShell.style.transform = "none";
        document.documentElement.style.setProperty("--mobile-fit-scale", "1");
        document.documentElement.style.setProperty("--mobile-window-scale", "1");
        renderVirtualCursor();
        return;
    }

    const deviceClass = detectMobileDeviceClass();
    const isPortrait = viewportHeight >= viewportWidth;
    let baseWidth = MOBILE_FIT_BASE_WIDTH;
    if (isPortrait) {
        baseWidth = viewportWidth <= 420 ? 1120 : viewportWidth <= 520 ? 1240 : 1366;
    } else {
        baseWidth = viewportWidth <= 900 ? 1240 : 1366;
    }

    const ratioBasedHeight = Math.round(baseWidth * (viewportHeight / Math.max(1, viewportWidth)));
    const baseHeight = Math.max(MOBILE_FIT_MIN_HEIGHT, ratioBasedHeight);
    const fitScale = Math.max(0.2, viewportWidth / baseWidth);
    const offsetX = 0;
    const offsetY = 0;
    const windowScale = isPortrait ? 0.72 : 0.82;

    mobileFitState.active = true;
    mobileFitState.scale = fitScale;
    mobileFitState.offsetX = offsetX;
    mobileFitState.offsetY = offsetY;
    mobileFitState.width = baseWidth;
    mobileFitState.height = baseHeight;
    mobileFitState.windowScale = windowScale;

    document.body.classList.add("mobile-fit");
    document.body.dataset.mobileDevice = deviceClass;
    document.body.dataset.mobileOrientation = isPortrait ? "portrait" : "landscape";
    uiShell.style.width = `${baseWidth}px`;
    uiShell.style.height = `${baseHeight}px`;
    uiShell.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${fitScale})`;
    document.documentElement.style.setProperty("--mobile-fit-scale", String(fitScale));
    document.documentElement.style.setProperty("--mobile-window-scale", String(windowScale));
    document.documentElement.style.setProperty("--mobile-base-width", String(baseWidth));
    document.documentElement.style.setProperty("--mobile-base-height", String(baseHeight));
    renderVirtualCursor();
}

function toggleStart(event) {
    if (event) {
        event.stopPropagation();
    }

    hideQuickSettings();
    hideNetworkInfoPanel();
    hideCalendarPanel();
    hideDesktopThemePanel();
    hideDesktopMenu();
    startMenu.classList.toggle("open");
}

function closeStart(event) {
    if (event.target.classList.contains("desktop")) {
        startMenu.classList.remove("open");
    }
}

function getDesktopWallpaperById(wallpaperId) {
    return desktopWallpapers.find((wallpaper) => wallpaper.id === wallpaperId) || desktopWallpapers[0];
}

function updateWallpaperSelectionUI() {
    document.querySelectorAll(".wallpaper-option[data-wallpaper]").forEach((button) => {
        const isActive = button.dataset.wallpaper === activeWallpaperId;
        button.classList.toggle("is-active", isActive);
    });
}

function applyDesktopWallpaper(wallpaperId, persist = true) {
    const wallpaper = getDesktopWallpaperById(wallpaperId);
    activeWallpaperId = wallpaper.id;
    document.body.style.backgroundImage = `url("${wallpaper.path}")`;
    document.documentElement.style.setProperty("--lock-screen-wallpaper", `url("${wallpaper.path}")`);
    updateWallpaperSelectionUI();

    if (!persist) {
        return;
    }

    try {
        localStorage.setItem(DESKTOP_WALLPAPER_KEY, wallpaper.id);
    } catch (error) {
        // Ignore storage failures and keep the current session wallpaper.
    }
}

function loadDesktopWallpaperPreference() {
    try {
        const savedWallpaperId = localStorage.getItem(DESKTOP_WALLPAPER_KEY);
        if (savedWallpaperId) {
            applyDesktopWallpaper(savedWallpaperId, false);
            return;
        }
    } catch (error) {
        // Ignore storage failures and use the default wallpaper.
    }

    applyDesktopWallpaper(activeWallpaperId, false);
}

function cycleDesktopWallpaper() {
    const currentIndex = desktopWallpapers.findIndex((wallpaper) => wallpaper.id === activeWallpaperId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % desktopWallpapers.length : 0;
    applyDesktopWallpaper(desktopWallpapers[nextIndex].id);
}

function scheduleSaveDesktopState() {
    if (desktopStateRestoreInProgress) {
        return;
    }

    window.clearTimeout(desktopStateSaveTimer);
    desktopStateSaveTimer = window.setTimeout(() => {
        const windows = Array.from(openAppMap.values()).map((appState) => ({
            appId: appState.appId,
            rect: appState.restoreRect || captureRect(appState.windowEl),
            maximized: Boolean(appState.maximized),
            minimized: appState.windowEl.classList.contains("minimized"),
            zIndex: Number(appState.windowEl.style.zIndex) || 0
        }));

        const desktopState = {
            wallpaperId: activeWallpaperId,
            activeAppId,
            windows
        };

        try {
            localStorage.setItem(DESKTOP_STATE_KEY, JSON.stringify(desktopState));
        } catch (error) {
            // Ignore storage failures and keep desktop functional.
        }
    }, 120);
}

function restoreDesktopState() {
    let savedState = null;
    try {
        savedState = JSON.parse(localStorage.getItem(DESKTOP_STATE_KEY) || "null");
    } catch (error) {
        savedState = null;
    }

    if (!savedState || !Array.isArray(savedState.windows)) {
        return;
    }

    desktopStateRestoreInProgress = true;
    const windowsToRestore = [...savedState.windows]
        .filter((item) => item && item.appId && getAppInfo(item.appId))
        .sort((left, right) => (left.zIndex || 0) - (right.zIndex || 0));

    windowsToRestore.forEach((windowState) => {
        openApp(windowState.appId, {
            skipFocus: true,
            restoreState: windowState
        });
    });

    if (savedState.activeAppId && openAppMap.has(savedState.activeAppId)) {
        focusApp(savedState.activeAppId);
    } else if (windowsToRestore.length > 0) {
        const lastWindow = windowsToRestore[windowsToRestore.length - 1];
        if (lastWindow?.appId && openAppMap.has(lastWindow.appId)) {
            focusApp(lastWindow.appId);
        }
    }

    desktopStateRestoreInProgress = false;
    scheduleSaveDesktopState();
}

function showLoginPanel() {
    if (!lockScreen || lockScreenDismissed || !initialSetupComplete) {
        return;
    }

    lockScreen.classList.remove("show-setup");
    lockScreen.classList.add("show-login");
    loginPanel?.setAttribute("aria-hidden", "false");
}

function dismissLockScreen() {
    if (lockScreenDismissed) {
        return;
    }

    lockScreenDismissed = true;
    loginPanel?.setAttribute("aria-hidden", "true");
    lockScreen?.setAttribute("hidden", "");
    document.body.classList.remove("is-locked");
}

function showSetupPanel() {
    if (!lockScreen || lockScreenDismissed) {
        return;
    }

    lockScreen.classList.remove("show-login");
    lockScreen.classList.add("show-setup");
    setupPanel?.setAttribute("aria-hidden", "false");
    loginPanel?.setAttribute("aria-hidden", "true");
    if (setupDesktopNameInput && !setupDesktopNameInput.value.trim()) {
        setupDesktopNameInput.value = getCurrentDesktopUser().desktopName;
    }
    if (setupLimoreNameInput && !setupLimoreNameInput.value.trim()) {
        setupLimoreNameInput.value = getCurrentDesktopUser().limoreName;
    }
}

function completeInitialSetup() {
    const desktopName = setupDesktopNameInput?.value.trim();
    const limoreName = setupLimoreNameInput?.value.trim();
    if (!desktopName) {
        setupDesktopNameInput?.focus();
        return;
    }

    const existingUsers = sanitizeDesktopUsers(loadLimoreAdminData().users);
    const nextUserId = getStoredDesktopUserId() || buildDesktopUserId(desktopName);
    const nextUser = {
        id: nextUserId,
        desktopName,
        limoreName: limoreName || "Anonymous",
        balance: 0,
        activePackageId: ""
    };
    const existingUserIndex = existingUsers.findIndex((user) => user.id === nextUserId);
    const nextUsers = existingUserIndex >= 0
        ? existingUsers.map((user) => user.id === nextUserId ? {
            ...user,
            desktopName: nextUser.desktopName,
            limoreName: nextUser.limoreName
        } : user)
        : [...existingUsers, nextUser];

    currentDesktopUserId = nextUserId;
    initialSetupComplete = true;
    storeDesktopUserId(currentDesktopUserId);
    setupDesktopNameInput?.blur();
    setupLimoreNameInput?.blur();
    persistLimoreAdminData({
        users: nextUsers
    });
    applyLimoreAdminData();
    sendClientHeartbeat();
    setupPanel?.setAttribute("aria-hidden", "true");
    window.scrollTo(0, 0);
    dismissLockScreen();
}

function startBootSequence() {
    if (bootSequenceComplete) {
        return;
    }

    bootSequenceComplete = true;
    bootScreen?.removeAttribute("hidden");
    lockScreen?.removeAttribute("hidden");

    window.setTimeout(() => {
        bootScreen?.setAttribute("hidden", "");
        document.body.classList.remove("is-booting");
        if (!initialSetupComplete) {
            showSetupPanel();
        }
        sendClientHeartbeat();
    }, 1550);
}

function initializeLockScreen() {
    if (!lockScreen) {
        return;
    }

    const revealLogin = () => {
        if (!document.body.classList.contains("is-locked")) {
            return;
        }
        if (!initialSetupComplete) {
            showSetupPanel();
            return;
        }
        showLoginPanel();
    };

    lockScreen.addEventListener("click", revealLogin);
    lockScreen.addEventListener("pointerdown", revealLogin);
    document.addEventListener("keydown", (event) => {
        if (!document.body.classList.contains("is-locked") || event.repeat) {
            return;
        }

        if (lockScreen.classList.contains("show-login") && event.key === "Enter") {
            dismissLockScreen();
            return;
        }

        revealLogin();
    });

    unlockButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        dismissLockScreen();
    });
    createAccountButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        completeInitialSetup();
    });
}

function relockDesktop() {
    lockScreenDismissed = false;
    lockScreen?.removeAttribute("hidden");
    lockScreen?.classList.remove("show-login");
    lockScreen?.classList.remove("show-setup");
    setupPanel?.setAttribute("aria-hidden", "true");
    loginPanel?.setAttribute("aria-hidden", "true");
    document.body.classList.add("is-locked");
}

function hideCalendarPanel() {
    calendarPanel?.classList.remove("open");
}

function hideDesktopThemePanel() {
    desktopThemePanel?.classList.remove("open");
}

function openDesktopThemePanel() {
    startMenu.classList.remove("open");
    hideQuickSettings();
    hideNetworkInfoPanel();
    hideDesktopMenu();
    hideCalendarPanel();
    updateWallpaperSelectionUI();
    desktopThemePanel?.classList.add("open");
}

function toggleCalendarPanel(event) {
    event?.stopPropagation();
    startMenu.classList.remove("open");
    hideDesktopMenu();
    hideQuickSettings();
    hideNetworkInfoPanel();
    hideDesktopThemePanel();
    const shouldOpen = !calendarPanel?.classList.contains("open");
    calendarPanel?.classList.toggle("open", shouldOpen);
}

function renderCalendar(viewDate = calendarViewDate) {
    if (!calendarGrid || !calendarMonthLabel) {
        return;
    }

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();

    calendarMonthLabel.textContent = viewDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric"
    });

    const cells = [];
    for (let index = 0; index < 42; index += 1) {
        let dayNumber = 0;
        let cellMonth = month;
        let cellYear = year;
        let isMuted = false;

        if (index < firstDayOfMonth) {
            dayNumber = daysInPrevMonth - firstDayOfMonth + index + 1;
            cellMonth = month - 1;
            isMuted = true;
        } else if (index >= firstDayOfMonth + daysInMonth) {
            dayNumber = index - firstDayOfMonth - daysInMonth + 1;
            cellMonth = month + 1;
            isMuted = true;
        } else {
            dayNumber = index - firstDayOfMonth + 1;
        }

        const cellDate = new Date(cellYear, cellMonth, dayNumber);
        const isToday = cellDate.getFullYear() === today.getFullYear()
            && cellDate.getMonth() === today.getMonth()
            && cellDate.getDate() === today.getDate();

        cells.push(`
            <div class="calendar-day${isMuted ? " is-muted" : ""}${isToday ? " is-today" : ""}">
                <span>${dayNumber}</span>
            </div>
        `);
    }

    calendarGrid.innerHTML = cells.join("");
}

function updateClock() {
    const now = new Date();
    const timeText = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    const dateText = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    document.getElementById("time").textContent = timeText;
    document.getElementById("date").textContent = dateText;
    if (lockTime) {
        lockTime.textContent = now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: false
        });
    }
    if (lockDate) {
        lockDate.textContent = now.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }

    if (calendarTodayLabel) {
        calendarTodayLabel.textContent = now.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }

    if (calendarTimeLabel) {
        calendarTimeLabel.textContent = timeText;
    }
}

function getVolumeIconClass(value) {
    const numericValue = Number(value);
    if (numericValue <= 0) {
        return "fas fa-volume-xmark";
    }

    if (numericValue <= 40) {
        return "fas fa-volume-low";
    }

    return "fas fa-volume-high";
}

function syncVolumeUI(value) {
    const iconClass = getVolumeIconClass(value);
    volumeIcon.className = iconClass;
    quickVolumeIcon.className = iconClass;
    volumeValue.textContent = `${value}`;
}

function hideQuickSettings() {
    quickSettings.classList.remove("open");
}

function hideNetworkInfoPanel() {
    networkInfoPanel?.classList.remove("open");
}

function toggleQuickSettings(event) {
    event.stopPropagation();
    startMenu.classList.remove("open");
    hideDesktopMenu();
    hideNetworkInfoPanel();
    hideCalendarPanel();
    hideDesktopThemePanel();
    quickSettings.classList.toggle("open");
}

async function loadNetworkInfo() {
    if (!networkCurrentLink || !networkLanLinks) {
        return;
    }

    networkCurrentLink.textContent = window.location.origin;
    networkLanLinks.textContent = "Loading...";

    try {
        const response = await fetch("/network-info", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        networkCurrentLink.textContent = data.currentOrigin || window.location.origin;

        const lanUrls = Array.isArray(data.lanUrls) ? data.lanUrls : [];
        if (lanUrls.length === 0) {
            networkLanLinks.textContent = "Khong tim thay IPv4 LAN.";
            return;
        }

        networkLanLinks.innerHTML = lanUrls
            .map((url) => `<button class="network-info-copy" type="button" data-url="${url}">${url}</button>`)
            .join("");

        networkLanLinks.querySelectorAll(".network-info-copy").forEach((button) => {
            button.addEventListener("click", async () => {
                const url = button.dataset.url || "";
                if (!url) {
                    return;
                }

                try {
                    await navigator.clipboard.writeText(url);
                    button.textContent = "Da copy";
                    setTimeout(() => {
                        button.textContent = url;
                    }, 1200);
                } catch (error) {
                    button.textContent = url;
                }
            });
        });
    } catch (error) {
        networkLanLinks.textContent = "Khong tai duoc link LAN.";
    }
}

function toggleNetworkInfoPanel(event) {
    event.stopPropagation();
    startMenu.classList.remove("open");
    hideDesktopMenu();
    hideQuickSettings();
    hideCalendarPanel();
    hideDesktopThemePanel();
    const shouldOpen = !networkInfoPanel?.classList.contains("open");
    if (shouldOpen) {
        loadNetworkInfo();
    }
    networkInfoPanel?.classList.toggle("open", shouldOpen);
}

function getDesktopBounds() {
    const width = Math.max(320, desktop?.clientWidth || getDesktopViewportWidth());
    const height = Math.max(220, desktop?.clientHeight || (getDesktopViewportHeight() - 48));
    return {
        left: 0,
        top: 0,
        width,
        height
    };
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getAppInfo(appId) {
    if (appCatalog[appId]) {
        return appCatalog[appId];
    }

    return {
        name: appId,
        icon: "https://img.icons8.com/fluency/48/application-window.png",
        description: "Ung dung dang chay."
    };
}

function getTaskbarAppId(appId) {
    return appId === "thispc" ? "files" : appId;
}

function getAppStatesByTaskbar(taskbarAppId) {
    const states = [];
    openAppMap.forEach((appState, appId) => {
        if (getTaskbarAppId(appId) === taskbarAppId) {
            states.push(appState);
        }
    });
    return states;
}

function isPinnedOnTaskbar(taskbarAppId) {
    return !!document.querySelector(`.taskbar-app[data-app="${taskbarAppId}"]`);
}

function captureRect(windowEl) {
    return {
        left: windowEl.offsetLeft,
        top: windowEl.offsetTop,
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight
    };
}

function applyRect(windowEl, rect) {
    windowEl.style.left = `${Math.round(rect.left)}px`;
    windowEl.style.top = `${Math.round(rect.top)}px`;
    windowEl.style.width = `${Math.round(rect.width)}px`;
    windowEl.style.height = `${Math.round(rect.height)}px`;
}

function syncMaximizeButtons(windowEl, isMaximized) {
    windowEl.querySelectorAll(".window-btn.maximize").forEach((button) => {
        button.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");
        button.setAttribute("title", isMaximized ? "Restore" : "Maximize");
        const icon = button.querySelector("i");
        if (!icon) {
            return;
        }

        icon.className = isMaximized ? "far fa-clone" : "far fa-square";
    });
}

function refreshTaskbarIndicators() {
    document.querySelectorAll(".taskbar-app, .running-task-icon").forEach((iconButton) => {
        const taskbarAppId = iconButton.dataset.app;
        const relatedStates = getAppStatesByTaskbar(taskbarAppId);
        const isOpen = relatedStates.length > 0;
        const isActive = isOpen
            && getTaskbarAppId(activeAppId) === taskbarAppId
            && relatedStates.some((appState) => appState.appId === activeAppId && !appState.windowEl.classList.contains("minimized"));

        iconButton.classList.toggle("is-open", isOpen);
        iconButton.classList.toggle("is-active", isActive);
    });
}

function focusApp(appId) {
    const appState = openAppMap.get(appId);
    if (!appState) {
        return;
    }

    appState.windowEl.classList.remove("minimized");
    zCounter += 1;
    appState.windowEl.style.zIndex = zCounter;
    activeAppId = appId;
    refreshTaskbarIndicators();
    scheduleSaveDesktopState();
}

function applyMaximizedGeometry(appState) {
    const bounds = getDesktopBounds();
    applyRect(appState.windowEl, {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height
    });
}

function maximizeApp(appId) {
    const appState = openAppMap.get(appId);
    if (!appState || appState.maximized) {
        return;
    }

    appState.restoreRect = captureRect(appState.windowEl);
    appState.maximized = true;
    appState.windowEl.classList.add("maximized");
    applyMaximizedGeometry(appState);
    syncMaximizeButtons(appState.windowEl, true);
    focusApp(appId);
    scheduleSaveDesktopState();
}

function restoreApp(appId) {
    const appState = openAppMap.get(appId);
    if (!appState || !appState.maximized) {
        return;
    }

    const bounds = getDesktopBounds();
    const restoreRect = appState.restoreRect || {
        left: 120,
        top: 80,
        width: 900,
        height: 560
    };

    const nextWidth = clamp(restoreRect.width, WINDOW_MIN_WIDTH, bounds.width);
    const nextHeight = clamp(restoreRect.height, WINDOW_MIN_HEIGHT, bounds.height);
    const nextLeft = clamp(restoreRect.left, bounds.left, bounds.left + bounds.width - nextWidth);
    const nextTop = clamp(restoreRect.top, bounds.top, bounds.top + bounds.height - nextHeight);

    appState.maximized = false;
    appState.windowEl.classList.remove("maximized");
    applyRect(appState.windowEl, {
        left: nextLeft,
        top: nextTop,
        width: nextWidth,
        height: nextHeight
    });
    syncMaximizeButtons(appState.windowEl, false);
    focusApp(appId);
    scheduleSaveDesktopState();
}

function toggleMaximize(appId) {
    const appState = openAppMap.get(appId);
    if (!appState) {
        return;
    }

    if (appState.maximized) {
        restoreApp(appId);
    } else {
        maximizeApp(appId);
    }
}

function minimizeApp(appId) {
    const appState = openAppMap.get(appId);
    if (!appState) {
        return;
    }

    appState.windowEl.classList.add("minimized");
    if (activeAppId === appId) {
        activeAppId = "";
    }
    refreshTaskbarIndicators();
    scheduleSaveDesktopState();
}

function closeApp(appId) {
    const appState = openAppMap.get(appId);
    if (!appState) {
        return;
    }

    appState.windowEl.remove();
    if (appState.runningEl) {
        appState.runningEl.remove();
    }

    openAppMap.delete(appId);
    if (activeAppId === appId) {
        activeAppId = "";
    }
    refreshTaskbarIndicators();
    scheduleSaveDesktopState();
}

function buildChromeWindowMarkup(app) {
    return `
        <div class="chrome-ui">
            <div class="chrome-top">
                <div class="chrome-tab-strip chrome-drag-region">
                    <button class="chrome-icon-btn round" type="button" aria-label="Tab options">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="chrome-tab active">
                        <img src="${app.icon}" alt="${app.name}">
                        <span>The moi</span>
                        <button class="chrome-tab-close" type="button" aria-label="Close tab">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                    <button class="chrome-icon-btn chrome-new-tab" type="button" aria-label="New tab">
                        <i class="fas fa-plus"></i>
                    </button>
                    <div class="chrome-spacer"></div>
                    <div class="window-actions chrome-window-actions">
                        <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                        <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                        <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                    </div>
                </div>
                <div class="chrome-toolbar">
                    <div class="chrome-nav">
                        <button class="chrome-icon-btn round" type="button" aria-label="Back"><i class="fas fa-arrow-left"></i></button>
                        <button class="chrome-icon-btn round" type="button" aria-label="Forward"><i class="fas fa-arrow-right"></i></button>
                        <button class="chrome-icon-btn round" type="button" aria-label="Reload"><i class="fas fa-rotate-right"></i></button>
                    </div>
                    <div class="chrome-omnibox">
                        <img src="${app.icon}" alt="${app.name}">
                        <input class="chrome-url-input" type="text" placeholder="Hoi Google hoac nhap mot URL">
                    </div>
                    <button class="chrome-guest-chip" type="button" aria-label="Guest profile">
                        <i class="far fa-user-circle"></i>
                        <span>Khach</span>
                    </button>
                    <button class="chrome-icon-btn round" type="button" aria-label="Menu">
                        <i class="fas fa-ellipsis-vertical"></i>
                    </button>
                </div>
            </div>
            <div class="chrome-page">
                <iframe class="chrome-webview" title="Chrome Web View" src="about:blank" tabindex="0" referrerpolicy="no-referrer-when-downgrade"></iframe>
                <div class="chrome-guest-screen">
                    <h2>Ban dang duyet web voi tu cach Khach</h2>
                    <p>Nhung trang ban xem trong cua so nay se khong xuat hien trong lich su trinh duyet.</p>
                    <a class="chrome-external-link" href="#" target="_blank" rel="noopener noreferrer" tabindex="0">Mo bang Chrome that</a>
                </div>
            </div>
        </div>
    `;
}

function normalizeChromeUrl(rawValue) {
    const value = (rawValue || "").trim();
    if (!value) {
        return "";
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    if (value.includes(" ")) {
        return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
    }

    if (value.includes(".")) {
        return `https://${value}`;
    }

    return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function getChromeTabTitle(url, fallbackTitle = "The moi") {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, "") || fallbackTitle;
    } catch (error) {
        return fallbackTitle;
    }
}

function canRenderChromeUrlInline(url) {
    try {
        const parsed = new URL(url);
        return parsed.origin === window.location.origin;
    } catch (error) {
        return false;
    }
}

function showChromeGuestScreen(windowEl, show) {
    const guestScreen = windowEl.querySelector(".chrome-guest-screen");
    const webview = windowEl.querySelector(".chrome-webview");
    if (!guestScreen || !webview) {
        return;
    }

    guestScreen.classList.toggle("hidden", !show);
    webview.classList.toggle("visible", !show);
}

function navigateChromeWindow(windowEl, rawValue, forcedTitle = "") {
    const urlInput = windowEl.querySelector(".chrome-url-input");
    const pageTitle = windowEl.querySelector(".chrome-guest-screen h2");
    const pageDesc = windowEl.querySelector(".chrome-guest-screen p");
    const activeTabLabel = windowEl.querySelector(".chrome-tab.active span");
    const webview = windowEl.querySelector(".chrome-webview");
    const externalLink = windowEl.querySelector(".chrome-external-link");
    const targetUrl = normalizeChromeUrl(rawValue);

    if (!targetUrl) {
        if (urlInput) {
            urlInput.value = "";
        }
        if (pageTitle) {
            pageTitle.textContent = "Ban dang duyet web voi tu cach Khach";
        }
        if (pageDesc) {
            pageDesc.textContent = "Nhung trang ban xem trong cua so nay se khong xuat hien trong lich su trinh duyet.";
        }
        if (activeTabLabel) {
            activeTabLabel.textContent = "The moi";
        }
        if (webview) {
            webview.src = "about:blank";
        }
        if (externalLink) {
            externalLink.href = "#";
            externalLink.textContent = "Mo bang Chrome that";
        }
        showChromeGuestScreen(windowEl, true);
        return;
    }

    if (urlInput) {
        urlInput.value = targetUrl;
    }
    if (activeTabLabel) {
        activeTabLabel.textContent = forcedTitle || getChromeTabTitle(targetUrl, "The moi");
    }

    if (!canRenderChromeUrlInline(targetUrl)) {
        let openedExternally = false;
        try {
            openedExternally = Boolean(window.open(targetUrl, "_blank", "noopener,noreferrer"));
        } catch (error) {
            openedExternally = false;
        }

        if (pageTitle) {
            pageTitle.textContent = "Da chuyen sang Chrome that";
        }
        if (pageDesc) {
            pageDesc.textContent = openedExternally
                ? "Website nay da duoc mo trong tab/browser that de tranh bi chan iframe."
                : "Website nay khong the hien thi trong khung mo phong. Bam nut duoi day de mo bang browser that.";
        }
        if (externalLink) {
            externalLink.href = targetUrl;
            externalLink.textContent = "Mo bang Chrome that";
        }
        if (webview) {
            webview.src = "about:blank";
        }

        showChromeGuestScreen(windowEl, true);
        return;
    }

    if (pageTitle) {
        pageTitle.textContent = `Dang mo: ${targetUrl}`;
    }
    if (pageDesc) {
        pageDesc.textContent = "Neu trang chan iframe, hay mo bang trinh duyet ngoai.";
    }
    if (webview) {
        webview.src = targetUrl;
    }
    if (externalLink) {
        externalLink.href = targetUrl;
        externalLink.textContent = "Mo bang Chrome that";
    }

    showChromeGuestScreen(windowEl, false);
}

function wireChromeWindow(windowEl, app) {
    const tabStrip = windowEl.querySelector(".chrome-tab-strip");
    const newTabButton = windowEl.querySelector(".chrome-new-tab");
    const urlInput = windowEl.querySelector(".chrome-url-input");
    let tabIndex = 1;

    newTabButton.addEventListener("click", () => {
        tabIndex += 1;
        const tabEl = document.createElement("div");
        tabEl.className = "chrome-tab";
        tabEl.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span>The moi ${tabIndex}</span>
            <button class="chrome-tab-close" type="button" aria-label="Close tab">
                <i class="fas fa-xmark"></i>
            </button>
        `;
        const spacer = tabStrip.querySelector(".chrome-spacer");
        tabStrip.insertBefore(tabEl, spacer);
        tabEl.click();
        navigateChromeWindow(windowEl, "", `The moi ${tabIndex}`);
    });

    tabStrip.addEventListener("click", (event) => {
        const closeButton = event.target.closest(".chrome-tab-close");
        if (closeButton) {
            event.stopPropagation();
            const currentTab = closeButton.closest(".chrome-tab");
            const siblingTab = currentTab.previousElementSibling?.classList.contains("chrome-tab")
                ? currentTab.previousElementSibling
                : currentTab.nextElementSibling?.classList.contains("chrome-tab")
                    ? currentTab.nextElementSibling
                    : null;
            currentTab.remove();

            const allTabs = tabStrip.querySelectorAll(".chrome-tab");
            if (allTabs.length === 0) {
                newTabButton.click();
            } else if (siblingTab) {
                siblingTab.classList.add("active");
            }
            return;
        }

        const tab = event.target.closest(".chrome-tab");
        if (!tab) {
            return;
        }

        tabStrip.querySelectorAll(".chrome-tab").forEach((tabEl) => tabEl.classList.remove("active"));
        tab.classList.add("active");
    });

    urlInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        navigateChromeWindow(windowEl, urlInput.value);
    });
}

function openUrlInsideDesktopChrome(url, title = "Website") {
    openApp("chrome");
    const chromeState = openAppMap.get("chrome");
    if (!chromeState) {
        return;
    }

    const chromeWindow = chromeState.windowEl;
    navigateChromeWindow(chromeWindow, url, title);
    const webview = chromeWindow.querySelector(".chrome-webview");
    if (webview) {
        setTimeout(() => {
            try {
                webview.focus();
            } catch (error) {
                // Ignore focus errors caused by browser restrictions.
            }
        }, 120);
    }
}

function buildImageFallbackAttr(fallbackUrl) {
    if (!fallbackUrl) {
        return "";
    }
    return ` onerror="this.onerror=null;this.src='${fallbackUrl}'"`;
}

function buildLimoreCloudGameCardMarkup(game) {
    return `
        <button
            class="limore-game-card"
            type="button"
            title="${game.title}"
            data-name="${game.title.toLowerCase()}"
            data-store-url="${game.storeUrl}"
            data-sections="${game.sections}">
            <span class="limore-game-rank">#${game.rank}</span>
            <span class="limore-game-cover-wrap">
                <img class="limore-game-cover" src="${game.image}" alt="${game.title}" loading="lazy"${buildImageFallbackAttr(appCatalog.gamecloud.icon)}>
            </span>
            <span class="limore-game-name">${game.title}</span>
            <span class="limore-game-meta">${game.genre} • ${game.release}</span>
        </button>
    `;
}

function buildLimoreCloudPackageCardMarkup(pkg) {
    const specsMarkup = (Array.isArray(pkg.specs) ? pkg.specs : []).map((spec) => `<li>${spec}</li>`).join("");
    return `
        <article class="limore-package-card${pkg.featured ? " is-featured" : ""}" data-package-id="${pkg.id}" data-package-price="${pkg.price}">
            <div class="limore-package-badge">${pkg.badge}</div>
            <h3>${pkg.title}</h3>
            <div class="limore-package-prices">
                <div class="limore-price-chip is-vn">
                    <span>VN</span>
                    <strong>${pkg.vnPriceLabel}</strong>
                </div>
                <div class="limore-price-chip is-global">
                    <span>Global</span>
                    <strong>${pkg.globalPriceLabel}</strong>
                </div>
            </div>
            <p>${pkg.description}</p>
            <ul class="limore-package-specs">
                ${specsMarkup}
            </ul>
            <button class="limore-package-buy-btn" type="button">Mua goi</button>
        </article>
    `;
}

function buildLimoreCloudWindowMarkup(app, options = {}) {
    const gameCardsMarkup = limoreCloudLibrary.map((game) => buildLimoreCloudGameCardMarkup(game)).join("");
    const packageCardsMarkup = limoreCloudPackages.map((pkg) => buildLimoreCloudPackageCardMarkup(pkg)).join("");
    const currentUser = getCurrentDesktopUser();
    const limoreViewState = options.restoreState?.limore || {};
    const activeSection = limoreViewState.activeSection || "games";
    const searchValue = limoreViewState.searchValue || "";
    const sectionMeta = limoreCloudSections[activeSection] || limoreCloudSections.games;
    const expandedTopupSections = Array.isArray(limoreViewState.expandedTopupSections) ? limoreViewState.expandedTopupSections : [];
    const isBankExpanded = expandedTopupSections.includes(0);
    const isHistoryExpanded = expandedTopupSections.includes(1);

    return `
        <div class="window-titlebar limore-cloud-header">
            <div class="limore-cloud-brand">
                <img src="${app.icon}" alt="${app.name}">
                <div class="limore-cloud-brand-copy">
                    <strong>Cloud</strong>
                    <span>Update</span>
                </div>
            </div>
            <label class="limore-cloud-search" aria-label="Search games">
                <input class="limore-cloud-search-input" type="text" placeholder="Please input game name" value="${searchValue.replace(/"/g, "&quot;")}">
                <button class="limore-search-btn" type="button" aria-label="Search">
                    <i class="fas fa-magnifying-glass"></i>
                </button>
            </label>
            <div class="limore-cloud-toolbar">
                <button class="limore-profile-btn" type="button" aria-label="Anonymous account">
                    <i class="fas fa-circle-user"></i>
                    <span>${currentUser.limoreName}</span>
                    <i class="fas fa-caret-down"></i>
                </button>
                <button class="limore-header-btn" type="button" aria-label="App menu">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="window-actions limore-window-actions">
                    <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                    <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
        </div>
        <div class="window-body limore-cloud-body">
            <aside class="limore-sidebar">
                <div class="limore-sidebar-group">
                    <span class="limore-sidebar-label">Hot</span>
                    <button class="limore-nav-item${activeSection === "home" ? " active" : ""}" type="button" data-section="home">
                        <i class="fas fa-house"></i>
                        <span>Home</span>
                    </button>
                    <button class="limore-nav-item${activeSection === "games" ? " active" : ""}" type="button" data-section="games">
                        <i class="fas fa-gamepad"></i>
                        <span>Games</span>
                    </button>
                    <button class="limore-nav-item${activeSection === "packages" ? " active" : ""}" type="button" data-section="packages">
                        <span class="limore-cloud-nav-icon" aria-hidden="true">
                            <span class="limore-cloud-nav-screen"></span>
                            <span class="limore-cloud-nav-dot"></span>
                        </span>
                        <span>Cloud</span>
                    </button>
                    <button class="limore-nav-item${activeSection === "topup" ? " active" : ""}" type="button" data-section="topup">
                        <i class="fas fa-wallet"></i>
                        <span>Nap tien</span>
                    </button>
                </div>
                <div class="limore-sidebar-group">
                    <span class="limore-sidebar-label">My Apps</span>
                    <button class="limore-nav-item${activeSection === "played" ? " active" : ""}" type="button" data-section="played">
                        <i class="far fa-heart"></i>
                        <span>Played Games</span>
                    </button>
                    <button class="limore-nav-item${activeSection === "saves" ? " active" : ""}" type="button" data-section="saves">
                        <i class="far fa-folder-open"></i>
                        <span>My Game Saves</span>
                    </button>
                    <button class="limore-nav-item${activeSection === "settings" ? " active" : ""}" type="button" data-section="settings">
                        <i class="fas fa-sliders"></i>
                        <span>My Game Settings</span>
                    </button>
                </div>
                <div class="limore-sidebar-footer">
                    <button class="limore-footer-btn" type="button" aria-label="Battery">
                        <i class="fas fa-battery-half"></i>
                    </button>
                    <button class="limore-footer-btn" type="button" aria-label="Volume">
                        <i class="fas fa-volume-low"></i>
                    </button>
                    <button class="limore-footer-btn" type="button" aria-label="Security">
                        <i class="fas fa-shield-halved"></i>
                    </button>
                </div>
            </aside>

            <main class="limore-main">
                <div class="limore-main-hero">
                    <div>
                        <h2 class="limore-section-title" data-limore-title>${sectionMeta.title}</h2>
                        <p class="limore-section-subtitle" data-limore-subtitle>${sectionMeta.subtitle || ""}</p>
                    </div>
                    <div class="limore-hero-status">
                        <div class="limore-library-pill" data-limore-count></div>
                        <div class="limore-balance-pill" data-limore-balance hidden>
                            <i class="fas fa-wallet"></i>
                            <span>0d</span>
                        </div>
                    </div>
                </div>

                <div class="limore-game-grid" data-limore-grid>
                    ${gameCardsMarkup}
                </div>

                <div class="limore-blank-panel" data-limore-blank hidden>
                    <div class="limore-package-panel" data-limore-packages hidden>
                        ${packageCardsMarkup}
                    </div>

                    <div class="limore-topup-accordion" data-limore-topup hidden>
                        <section class="limore-topup-item${isBankExpanded ? " is-open" : ""}">
                            <button class="limore-topup-toggle" type="button" aria-expanded="${isBankExpanded ? "true" : "false"}">
                                <span>Nap tien tai khoan - ngan hang</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="limore-topup-content limore-topup-content-bank"${isBankExpanded ? "" : " hidden"}>
                                <div class="limore-bank-panel">
                                    <div class="limore-bank-card">
                                        <div class="limore-bank-qr-card">
                                            <img class="limore-qr-image" src="assets/qr-bank.png" alt="QR nap tien ngan hang" loading="lazy">
                                        </div>
                                    </div>
                                    <div class="limore-bank-copy">
                                        <strong>Toi thieu nap tien vao tai khoan: 10.000d</strong>
                                        <strong>(Co the nap duoi 10.000d. Neu khong hien so du tai khoan vui long lien he qua Discord de duoc kiem tra)</strong>
                                        <p>Sau khi da thanh toan, so du se duoc cong vao theo so tien tuong ung da nap. (Sau 2-5 phut neu so du khong duoc cong vui long lien he Discord gap de cong kip thoi) (Thoi gian cho xu li khong qua 10 phut)</p>
                                        <p>Khong hoan tra tien da nap duoi moi hinh thuc.(Vui long xem xet ki truoc khi nap)</p>
                                        <p>Vui long F5 / Refresh / "Lam moi" lai trang sau khi da hoan thanh thanh toan.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section class="limore-topup-item${isHistoryExpanded ? " is-open" : ""}">
                            <button class="limore-topup-toggle" type="button" aria-expanded="${isHistoryExpanded ? "true" : "false"}">
                                <span>Lich su nap tien</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="limore-topup-content"${isHistoryExpanded ? "" : " hidden"}></div>
                        </section>
                    </div>
                </div>

                <div class="limore-empty-state" data-limore-empty hidden>
                    <strong>No games found</strong>
                    <p>Try another keyword or switch to a different section.</p>
                </div>
            </main>

            <div class="limore-dialog-overlay" data-limore-dialog hidden>
                <div class="limore-dialog-window">
                    <div class="limore-dialog-icon">
                        <i class="fas fa-circle-exclamation"></i>
                    </div>
                    <div class="limore-dialog-copy">
                        <h3 data-limore-dialog-title></h3>
                        <p data-limore-dialog-message hidden></p>
                    </div>
                    <div class="limore-dialog-actions">
                        <button class="limore-dialog-btn is-secondary" data-limore-dialog-cancel type="button" hidden>Khong</button>
                        <button class="limore-dialog-btn is-primary" data-limore-dialog-confirm type="button">Dong</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateLimoreCloudWindow(windowEl) {
    const activeButton = windowEl.querySelector(".limore-nav-item.active");
    const searchInput = windowEl.querySelector(".limore-cloud-search-input");
    const titleEl = windowEl.querySelector("[data-limore-title]");
    const subtitleEl = windowEl.querySelector("[data-limore-subtitle]");
    const countEl = windowEl.querySelector("[data-limore-count]");
    const balanceEl = windowEl.querySelector("[data-limore-balance]");
    const gridEl = windowEl.querySelector("[data-limore-grid]");
    const blankEl = windowEl.querySelector("[data-limore-blank]");
    const packagePanelEl = windowEl.querySelector("[data-limore-packages]");
    const topupPanelEl = windowEl.querySelector("[data-limore-topup]");
    const emptyEl = windowEl.querySelector("[data-limore-empty]");
    const cards = Array.from(windowEl.querySelectorAll(".limore-game-card"));
    const activeSection = activeButton?.dataset.section || "games";
    const sectionMeta = limoreCloudSections[activeSection] || limoreCloudSections.games;
    const searchValue = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    if (activeSection === "topup" || activeSection === "packages") {
        cards.forEach((card) => {
            card.hidden = true;
        });
        if (titleEl) {
            titleEl.textContent = sectionMeta.title;
        }
        if (subtitleEl) {
            subtitleEl.textContent = sectionMeta.subtitle || "";
        }
        if (countEl) {
            countEl.textContent = "";
        }
        if (balanceEl) {
            balanceEl.hidden = activeSection !== "topup";
        }
        if (gridEl) {
            gridEl.hidden = true;
        }
        if (blankEl) {
            blankEl.hidden = false;
        }
        if (packagePanelEl) {
            packagePanelEl.hidden = false;
            packagePanelEl.classList.toggle("is-active-panel", activeSection === "packages");
        }
        if (topupPanelEl) {
            topupPanelEl.hidden = false;
            topupPanelEl.classList.toggle("is-active-panel", activeSection === "topup");
        }
        if (emptyEl) {
            emptyEl.hidden = true;
        }
        return;
    }

    if (gridEl) {
        gridEl.hidden = false;
    }
    if (balanceEl) {
        balanceEl.hidden = true;
    }
    if (blankEl) {
        blankEl.hidden = true;
    }
    if (packagePanelEl) {
        packagePanelEl.hidden = false;
        packagePanelEl.classList.remove("is-active-panel");
    }
    if (topupPanelEl) {
        topupPanelEl.hidden = false;
        topupPanelEl.classList.remove("is-active-panel");
    }

    cards.forEach((card) => {
        const sectionList = (card.dataset.sections || "").split(/\s+/).filter(Boolean);
        const matchesSection = activeSection === "games" || sectionList.includes(activeSection);
        const matchesSearch = !searchValue || (card.dataset.name || "").includes(searchValue);
        const shouldShow = matchesSection && matchesSearch;
        card.hidden = !shouldShow;
        if (shouldShow) {
            visibleCount += 1;
        }
    });

    if (titleEl) {
        titleEl.textContent = sectionMeta.title;
    }
    if (subtitleEl) {
        subtitleEl.textContent = sectionMeta.subtitle;
    }
    if (countEl) {
        countEl.textContent = `${visibleCount} games`;
    }
    if (emptyEl) {
        emptyEl.hidden = visibleCount > 0;
    }
}

function formatLimoreBalance(value) {
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

function refreshLimoreBalance(windowEl) {
    const balanceValueEl = windowEl.querySelector("[data-limore-balance] span");
    if (balanceValueEl) {
        balanceValueEl.textContent = formatLimoreBalance(limoreCloudState.balance);
    }
}

function refreshLimorePackages(windowEl) {
    const packageCards = windowEl.querySelectorAll(".limore-package-card[data-package-id]");
    packageCards.forEach((card) => {
        const packageId = card.dataset.packageId || "";
        const isOwned = packageId === limoreCloudState.activePackageId;
        const buyButton = card.querySelector(".limore-package-buy-btn");

        card.classList.toggle("is-owned", isOwned);
        if (buyButton) {
            buyButton.disabled = isOwned;
            buyButton.textContent = isOwned ? "Da so huu" : "Mua goi";
        }
    });
}

function closeLimoreDialog(windowEl) {
    const overlay = windowEl.querySelector("[data-limore-dialog]");
    if (!overlay) {
        return;
    }

    overlay.hidden = true;
    overlay.classList.remove("open");
    windowEl._limoreDialogConfirm = null;
}

function showLimoreDialog(windowEl, {
    title,
    message,
    confirmText = "Dong",
    cancelText = "",
    tone = "error",
    onConfirm = null
}) {
    const overlay = windowEl.querySelector("[data-limore-dialog]");
    const titleEl = windowEl.querySelector("[data-limore-dialog-title]");
    const messageEl = windowEl.querySelector("[data-limore-dialog-message]");
    const confirmButton = windowEl.querySelector("[data-limore-dialog-confirm]");
    const cancelButton = windowEl.querySelector("[data-limore-dialog-cancel]");
    if (!overlay || !titleEl || !messageEl || !confirmButton || !cancelButton) {
        return;
    }

    titleEl.textContent = title || "Thong bao";
    messageEl.textContent = message || "";
    messageEl.hidden = !message;
    confirmButton.textContent = confirmText;
    cancelButton.textContent = cancelText || "Khong";
    cancelButton.hidden = !cancelText;
    overlay.dataset.tone = tone;
    overlay.hidden = false;
    overlay.classList.add("open");
    windowEl._limoreDialogConfirm = typeof onConfirm === "function" ? onConfirm : null;
}

function wireLimoreCloudWindow(windowEl) {
    const navButtons = windowEl.querySelectorAll(".limore-nav-item");
    const searchInput = windowEl.querySelector(".limore-cloud-search-input");
    const searchButton = windowEl.querySelector(".limore-search-btn");
    const cards = windowEl.querySelectorAll(".limore-game-card");
    const packageCards = windowEl.querySelectorAll(".limore-package-card[data-package-id]");
    const packageBuyButtons = windowEl.querySelectorAll(".limore-package-buy-btn");
    const topupToggles = windowEl.querySelectorAll(".limore-topup-toggle");
    const dialogOverlay = windowEl.querySelector("[data-limore-dialog]");
    const dialogConfirmButton = windowEl.querySelector("[data-limore-dialog-confirm]");
    const dialogCancelButton = windowEl.querySelector("[data-limore-dialog-cancel]");

    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            navButtons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            updateLimoreCloudWindow(windowEl);
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => updateLimoreCloudWindow(windowEl));
    }

    if (searchButton) {
        searchButton.addEventListener("click", () => {
            searchInput?.focus();
            updateLimoreCloudWindow(windowEl);
        });
    }

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            cards.forEach((item) => item.classList.remove("is-selected"));
            card.classList.add("is-selected");
        });

        card.addEventListener("dblclick", () => {
            if (!limoreCloudState.activePackageId) {
                showLimoreDialog(windowEl, {
                    title: "Chua mua goi",
                    message: "Ban can mua goi Cloud truoc khi choi game nay.",
                    confirmText: "Dong",
                    tone: "error"
                });
                return;
            }

            const targetUrl = card.dataset.storeUrl;
            const targetTitle = card.title || "Steam";
            if (targetUrl) {
                openUrlInsideDesktopChrome(targetUrl, targetTitle);
            }
        });
    });

    packageBuyButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".limore-package-card");
            if (!card) {
                return;
            }

            const packageName = card.querySelector("h3")?.textContent?.trim() || "Goi Cloud";
            const packagePrice = Number(card.dataset.packagePrice || 0);
            const packageId = card.dataset.packageId || "";

            showLimoreDialog(windowEl, {
                title: "Xac nhan mua goi",
                message: `Ban co muon mua ${packageName} voi gia ${formatLimoreBalance(packagePrice)} khong?`,
                confirmText: "Co",
                cancelText: "Khong",
                tone: "question",
                onConfirm: () => {
                    if (limoreCloudState.balance < packagePrice) {
                        showLimoreDialog(windowEl, {
                            title: "Khong du so du",
                            message: "So du hien tai khong du de mua goi nay. Vui long nap them tien.",
                            confirmText: "Dong",
                            tone: "error"
                        });
                        return;
                    }

                    limoreCloudState.balance -= packagePrice;
                    limoreCloudState.activePackageId = packageId;
                    persistLimoreCloudState();
                    refreshLimoreBalance(windowEl);
                    refreshLimorePackages(windowEl);
                    showLimoreDialog(windowEl, {
                        title: "Mua goi thanh cong",
                        message: `Ban da kich hoat ${packageName}. Bay gio ban co the mo game.`,
                        confirmText: "Dong",
                        tone: "success"
                    });
                }
            });
        });
    });

    packageCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest(".limore-package-buy-btn")) {
                return;
            }

            const buyButton = card.querySelector(".limore-package-buy-btn");
            if (buyButton && !buyButton.disabled) {
                buyButton.click();
            }
        });
    });

    topupToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const parent = toggle.closest(".limore-topup-item");
            const content = parent?.querySelector(".limore-topup-content");
            const isExpanded = toggle.getAttribute("aria-expanded") === "true";

            toggle.setAttribute("aria-expanded", String(!isExpanded));
            parent?.classList.toggle("is-open", !isExpanded);
            if (content) {
                content.hidden = isExpanded;
            }
        });
    });

    if (dialogOverlay) {
        dialogOverlay.addEventListener("click", (event) => {
            if (event.target === dialogOverlay) {
                closeLimoreDialog(windowEl);
            }
        });
    }

    dialogConfirmButton?.addEventListener("click", () => {
        const confirmHandler = windowEl._limoreDialogConfirm;
        closeLimoreDialog(windowEl);
        if (typeof confirmHandler === "function") {
            confirmHandler();
        }
    });

    dialogCancelButton?.addEventListener("click", () => {
        closeLimoreDialog(windowEl);
    });

    refreshLimoreBalance(windowEl);
    refreshLimorePackages(windowEl);
    updateLimoreCloudWindow(windowEl);
}

function buildGameShowcaseWindowMarkup(app) {
    const safeGallery = Array.isArray(app.gallery) ? app.gallery : [];
    const safeTags = Array.isArray(app.tags) ? app.tags : [];
    const iconFallback = app.fallbackIcon || "";
    const heroFallback = app.fallbackHero || iconFallback || app.icon || "";
    const galleryFallback = heroFallback || iconFallback || app.icon || "";
    const coverImage = app.coverImage || app.icon || "";
    const coverFallback = app.fallbackCover || iconFallback || coverImage;
    const galleryMarkup = safeGallery.map((imageUrl, index) => `
        <div class="game-gallery-card">
            <img src="${imageUrl}" alt="${app.name} screenshot ${index + 1}" loading="lazy"${buildImageFallbackAttr(galleryFallback)}>
        </div>
    `).join("");
    const tagsMarkup = safeTags.map((tagText) => `<span>${tagText}</span>`).join("");

    return `
        <div class="window-titlebar game-window-titlebar">
            <div class="window-title">
                <img src="${app.icon}" alt="${app.name}"${buildImageFallbackAttr(iconFallback)}>
                <span>${app.name}</span>
            </div>
            <div class="window-actions">
                <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
            </div>
        </div>
        <div class="window-body game-window-body">
            <section class="game-showcase">
                <img class="game-hero-image" src="${app.heroImage || app.icon}" alt="${app.name} hero image"${buildImageFallbackAttr(heroFallback)}>
                <div class="game-meta">
                    <img class="game-cover-image" src="${coverImage}" alt="${app.name} cover art"${buildImageFallbackAttr(coverFallback)}>
                    <div class="game-meta-copy">
                        <h2>${app.name}</h2>
                        <p>${app.description || ""}</p>
                        <div class="game-tags">${tagsMarkup}</div>
                    </div>
                </div>
                <div class="game-gallery">${galleryMarkup}</div>
            </section>
        </div>
    `;
}

function buildThisPcWindowMarkup(app) {
    return `
        <div class="window-titlebar explorer-titlebar">
            <div class="window-title">
                <img src="${app.icon}" alt="${app.name}">
                <span>This PC</span>
            </div>
            <div class="window-actions">
                <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
            </div>
        </div>
        <div class="window-body explorer-window-body">
            <div class="explorer-shell">
                <div class="explorer-topbar">
                    <div class="explorer-nav-controls">
                        <button type="button" class="explorer-nav-btn" aria-label="Back"><i class="fas fa-arrow-left"></i></button>
                        <button type="button" class="explorer-nav-btn disabled" aria-label="Forward"><i class="fas fa-arrow-right"></i></button>
                        <button type="button" class="explorer-nav-btn" aria-label="Up"><i class="fas fa-arrow-up"></i></button>
                        <button type="button" class="explorer-nav-btn" aria-label="Refresh"><i class="fas fa-rotate-right"></i></button>
                    </div>
                    <div class="explorer-path" data-explorer-path></div>
                    <div class="explorer-search" data-explorer-search>Search Home</div>
                </div>
                <div class="explorer-toolbar">
                    <div class="explorer-toolbar-left">
                        <button type="button"><i class="fas fa-plus"></i> New <i class="fas fa-chevron-down btn-caret"></i></button>
                        <button type="button" class="icon-only" aria-label="Cut"><i class="fas fa-scissors"></i></button>
                        <button type="button" class="icon-only" aria-label="Copy"><i class="far fa-copy"></i></button>
                        <button type="button" class="icon-only" aria-label="Paste"><i class="far fa-clipboard"></i></button>
                        <button type="button" class="icon-only" aria-label="Share"><i class="fas fa-share-from-square"></i></button>
                        <button type="button" class="icon-only disabled" aria-label="Delete"><i class="far fa-trash-can"></i></button>
                        <span class="explorer-toolbar-sep"></span>
                        <button type="button"><i class="fas fa-arrow-down-wide-short"></i> Sort <i class="fas fa-chevron-down btn-caret"></i></button>
                        <button type="button"><i class="fas fa-bars"></i> View <i class="fas fa-chevron-down btn-caret"></i></button>
                        <button type="button" class="icon-only" aria-label="More"><i class="fas fa-ellipsis"></i></button>
                    </div>
                    <div class="explorer-toolbar-right">
                        <button type="button" class="details-btn"><i class="far fa-rectangle-list"></i> Details</button>
                    </div>
                </div>
                <div class="explorer-main">
                    <aside class="explorer-sidebar">
                        <div class="explorer-sidebar-group">
                            <button type="button" class="explorer-nav-item active" data-explorer-view="home">
                                <i class="fas fa-house icon-home"></i>
                                <span>Home</span>
                            </button>
                            <button type="button" class="explorer-nav-item" data-explorer-view="gallery">
                                <i class="fas fa-image icon-gallery"></i>
                                <span>Gallery</span>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-chevron-right tree-caret"></i>
                                <i class="fas fa-cloud icon-cloud"></i>
                                <span>Dz - Personal</span>
                            </button>
                        </div>
                        <div class="explorer-sidebar-divider"></div>
                        <div class="explorer-sidebar-group">
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-desktop icon-desktop"></i>
                                <span>Desktop</span>
                                <i class="fas fa-thumbtack nav-pin"></i>
                            </button>
                            <button type="button" class="explorer-nav-item" data-explorer-view="downloads">
                                <i class="fas fa-download icon-downloads"></i>
                                <span>Downloads</span>
                                <i class="fas fa-thumbtack nav-pin"></i>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-file-lines icon-documents"></i>
                                <span>Documents</span>
                                <i class="fas fa-thumbtack nav-pin"></i>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-image icon-pictures"></i>
                                <span>Pictures</span>
                                <i class="fas fa-thumbtack nav-pin"></i>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-music icon-music"></i>
                                <span>Music</span>
                                <i class="fas fa-thumbtack nav-pin"></i>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-video icon-videos"></i>
                                <span>Videos</span>
                                <i class="fas fa-thumbtack nav-pin"></i>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-folder icon-terabox"></i>
                                <span>TeraBoxDownload</span>
                            </button>
                        </div>
                        <div class="explorer-sidebar-divider"></div>
                        <div class="explorer-sidebar-group">
                            <button type="button" class="explorer-nav-item" data-explorer-view="thispc">
                                <i class="fas fa-chevron-right tree-caret"></i>
                                <i class="fas fa-computer icon-thispc"></i>
                                <span>This PC</span>
                            </button>
                            <button type="button" class="explorer-nav-item explorer-sub-item">
                                <i class="fas fa-chevron-right tree-caret"></i>
                                <i class="fas fa-hard-drive icon-drive"></i>
                                <span>Local Disk (C:)</span>
                            </button>
                            <button type="button" class="explorer-nav-item explorer-sub-item">
                                <i class="fas fa-chevron-right tree-caret"></i>
                                <i class="fas fa-hard-drive icon-drive"></i>
                                <span>New Volume (D:)</span>
                            </button>
                            <button type="button" class="explorer-nav-item">
                                <i class="fas fa-network-wired icon-network"></i>
                                <span>Network</span>
                            </button>
                        </div>
                    </aside>
                    <section class="explorer-content">
                        <div class="explorer-view active" data-explorer-panel="home">
                            <div class="explorer-section-header">
                                <div>
                                    <h3>Home</h3>
                                    <p>Quick access va recent files</p>
                                </div>
                            </div>
                            <div class="explorer-folder-grid">
                                <button type="button" class="explorer-folder-card" data-explorer-view-target="downloads">
                                    <i class="fas fa-download"></i>
                                    <strong>Downloads</strong>
                                    <span>4 tep gan day</span>
                                </button>
                                <button type="button" class="explorer-folder-card">
                                    <i class="fas fa-image"></i>
                                    <strong>Pictures</strong>
                                    <span>Wukong, GTA V, wallpapers</span>
                                </button>
                                <button type="button" class="explorer-folder-card">
                                    <i class="fas fa-folder"></i>
                                    <strong>Projects</strong>
                                    <span>Windows 11 Dark Edition</span>
                                </button>
                                <button type="button" class="explorer-folder-card" data-explorer-view-target="thispc">
                                    <i class="fas fa-computer"></i>
                                    <strong>This PC</strong>
                                    <span>2 drives available</span>
                                </button>
                            </div>
                            <div class="explorer-section-header is-secondary">
                                <div>
                                    <h3>Recent</h3>
                                    <p>Mo nhanh cac muc vua dung</p>
                                </div>
                            </div>
                            <div class="explorer-list">
                                <div class="explorer-row header">
                                    <span>Name</span><span>Date modified</span><span>Type</span><span>Location</span>
                                </div>
                                <div class="explorer-row"><span>wukong-hero.jpg</span><span>4/1/2026 3:41 PM</span><span>JPG File</span><span>Pictures</span></div>
                                <div class="explorer-row"><span>qr-bank.png</span><span>4/1/2026 2:08 PM</span><span>PNG File</span><span>Downloads</span></div>
                                <div class="explorer-row"><span>game-cloud.webp</span><span>4/1/2026 12:41 PM</span><span>WEBP File</span><span>Projects</span></div>
                            </div>
                        </div>
                        <div class="explorer-view" data-explorer-panel="gallery">
                            <div class="explorer-section-header">
                                <div>
                                    <h3>Gallery</h3>
                                    <p>Preview cac anh noi bat trong may</p>
                                </div>
                            </div>
                            <div class="explorer-gallery-grid">
                                <div class="explorer-gallery-card"><img src="assets/windows-11-black-wallpaper-2400x1350_50.jpg" alt="Windows wallpaper"><span>Windows Dark</span></div>
                                <div class="explorer-gallery-card"><img src="assets/wukong-hero.jpg" alt="Wukong hero"><span>Wukong Hero</span></div>
                                <div class="explorer-gallery-card"><img src="assets/gta5-hero.jpg" alt="GTA V hero"><span>GTA V Hero</span></div>
                                <div class="explorer-gallery-card"><img src="assets/gta5-shot-1.jpg" alt="GTA V shot 1"><span>GTA V Shot</span></div>
                            </div>
                        </div>
                        <div class="explorer-view" data-explorer-panel="downloads">
                            <div class="explorer-section-header">
                                <div>
                                    <h3>Downloads</h3>
                                    <p>Recent setup files va assets</p>
                                </div>
                            </div>
                            <div class="explorer-list">
                                <div class="explorer-row header">
                                    <span>Name</span><span>Date modified</span><span>Type</span><span>Size</span>
                                </div>
                                <div class="explorer-row"><span>Limore Cloud Game_1.1.8_APKPure</span><span>3/26/2026 5:51 PM</span><span>MSI App</span><span>56,350 KB</span></div>
                                <div class="explorer-row"><span>unnamed</span><span>3/26/2026 5:50 PM</span><span>WEBP File</span><span>29 KB</span></div>
                                <div class="explorer-row"><span>windows-11-black-wallpaper</span><span>3/26/2026 5:44 PM</span><span>JPG File</span><span>130 KB</span></div>
                                <div class="explorer-row"><span>cococ127</span><span>3/26/2026 5:44 PM</span><span>HTML File</span><span>101 KB</span></div>
                            </div>
                        </div>
                        <div class="explorer-view" data-explorer-panel="thispc">
                            <div class="explorer-section-header">
                                <div>
                                    <h3>This PC</h3>
                                    <p>Devices, drives va storage summary</p>
                                </div>
                            </div>
                            <div class="explorer-storage-overview">
                                <div class="explorer-storage-card">
                                    <span>System storage</span>
                                    <strong>2.0 TB</strong>
                                    <small>Gan nhu trong toan bo</small>
                                </div>
                                <div class="explorer-storage-card">
                                    <span>Devices</span>
                                    <strong>2 drives</strong>
                                    <small>Local Disk C va Volume D</small>
                                </div>
                                <div class="explorer-storage-card">
                                    <span>Cloud status</span>
                                    <strong>Ready</strong>
                                    <small>OneDrive va LAN share san sang</small>
                                </div>
                            </div>
                            <h3 class="explorer-subheading">Devices and drives</h3>
                            <div class="thispc-drives">
                                <div class="drive-item">
                                    <img class="drive-icon drive-icon-c" src="assets/drive-c-icon-new.png" alt="Local Disk (C:)">
                                    <div class="drive-details">
                                        <div class="drive-name">Local Disk (C:)</div>
                                        <div class="drive-progress">
                                            <span style="width: 0%;"></span>
                                        </div>
                                        <div class="drive-capacity">1.0 TB free of 1 TB</div>
                                    </div>
                                </div>
                                <div class="drive-item">
                                    <img class="drive-icon drive-icon-d" src="assets/drive-d-icon-new.png" alt="New Volume (D:)">
                                    <div class="drive-details">
                                        <div class="drive-name">New Volume (D:)</div>
                                        <div class="drive-progress">
                                            <span style="width: 0%;"></span>
                                        </div>
                                        <div class="drive-capacity">1.0 TB free of 1 TB</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;
}

function wireThisPcWindow(windowEl) {
    const navButtons = windowEl.querySelectorAll(".explorer-nav-item[data-explorer-view]");
    const panels = windowEl.querySelectorAll(".explorer-view");
    const pathContainer = windowEl.querySelector("[data-explorer-path]");
    const searchLabel = windowEl.querySelector("[data-explorer-search]");
    const quickLinks = windowEl.querySelectorAll("[data-explorer-view-target]");
    const explorerViewMeta = {
        home: {
            search: "Search Home",
            crumbs: [
                { icon: "fas fa-house", label: "Home" }
            ]
        },
        gallery: {
            search: "Search Gallery",
            crumbs: [
                { icon: "fas fa-house", label: "Home" },
                { icon: "fas fa-image", label: "Gallery" }
            ]
        },
        downloads: {
            search: "Search Downloads",
            crumbs: [
                { icon: "fas fa-house", label: "Home" },
                { icon: "fas fa-download", label: "Downloads" }
            ]
        },
        thispc: {
            search: "Search This PC",
            crumbs: [
                { icon: "fas fa-house", label: "Home" },
                { icon: "fas fa-computer", label: "This PC" }
            ]
        }
    };

    const setExplorerView = (targetView) => {
        const meta = explorerViewMeta[targetView];
        if (!meta) {
            return;
        }

        navButtons.forEach((item) => item.classList.toggle("active", item.dataset.explorerView === targetView));
        panels.forEach((panel) => {
            panel.classList.toggle("active", panel.dataset.explorerPanel === targetView);
        });

        if (searchLabel) {
            searchLabel.textContent = meta.search;
        }

        if (pathContainer) {
            pathContainer.innerHTML = meta.crumbs.map((crumb, index) => `
                <button type="button" class="explorer-breadcrumb${index === meta.crumbs.length - 1 ? " is-current" : ""}">
                    <i class="${crumb.icon}"></i>
                    <span>${crumb.label}</span>
                </button>
            `).join(`<i class="fas fa-chevron-right path-sep"></i>`);
        }
    };

    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetView = button.dataset.explorerView;
            if (targetView) {
                setExplorerView(targetView);
            }
        });
    });

    quickLinks.forEach((button) => {
        button.addEventListener("click", () => {
            const targetView = button.dataset.explorerViewTarget;
            if (targetView) {
                setExplorerView(targetView);
            }
        });
    });

    setExplorerView("home");
}

function isInteractiveTitleTarget(target) {
    return Boolean(target.closest("button, input, textarea, a, .chrome-tab, .chrome-omnibox, .chrome-guest-chip, .limore-cloud-search"));
}

function isPrimaryPointerEvent(event) {
    if (!event) {
        return false;
    }

    if ("isPrimary" in event && event.isPrimary === false) {
        return false;
    }

    if (typeof event.button === "number" && event.button !== 0) {
        return false;
    }

    return true;
}

function startWindowDrag(event, windowEl, appId) {
    if (!isPrimaryPointerEvent(event) || isInteractiveTitleTarget(event.target)) {
        return;
    }

    const appState = openAppMap.get(appId);
    if (!appState) {
        return;
    }

    event.preventDefault();
    focusApp(appId);

    if (appState.maximized) {
        const bounds = getDesktopBounds();
        const pointerX = toDesktopX(event.clientX);
        const pointerY = toDesktopY(event.clientY);
        const pointerRatio = (pointerX - bounds.left) / Math.max(1, bounds.width);
        restoreApp(appId);

        const restoredRect = captureRect(windowEl);
        const nextLeft = clamp(
            pointerX - restoredRect.width * pointerRatio,
            bounds.left,
            bounds.left + bounds.width - restoredRect.width
        );
        const nextTop = clamp(pointerY - 20, bounds.top, bounds.top + bounds.height - restoredRect.height);
        applyRect(windowEl, {
            left: nextLeft,
            top: nextTop,
            width: restoredRect.width,
            height: restoredRect.height
        });
    }

    const startRect = captureRect(windowEl);
    const startPointerX = toDesktopX(event.clientX);
    const startPointerY = toDesktopY(event.clientY);
    const offsetX = startPointerX - startRect.left;
    const offsetY = startPointerY - startRect.top;
    const activePointerId = "pointerId" in event ? event.pointerId : null;

    document.body.classList.add("dragging-window");

    const onMove = (moveEvent) => {
        if (activePointerId !== null && moveEvent.pointerId !== activePointerId) {
            return;
        }

        const bounds = getDesktopBounds();
        const rectNow = captureRect(windowEl);
        const maxLeft = bounds.left + bounds.width - rectNow.width;
        const maxTop = bounds.top + bounds.height - rectNow.height;
        const pointerX = toDesktopX(moveEvent.clientX);
        const pointerY = toDesktopY(moveEvent.clientY);

        const nextLeft = clamp(pointerX - offsetX, bounds.left, maxLeft);
        const nextTop = clamp(pointerY - offsetY, bounds.top, maxTop);

        windowEl.style.left = `${nextLeft}px`;
        windowEl.style.top = `${nextTop}px`;
    };

    const onUp = (upEvent) => {
        if (activePointerId !== null && upEvent.pointerId !== activePointerId) {
            return;
        }

        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        document.body.classList.remove("dragging-window");

        if (toDesktopY(upEvent.clientY) <= 6) {
            maximizeApp(appId);
            return;
        }

        scheduleSaveDesktopState();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
}

function addResizeHandles(windowEl, appId) {
    const directions = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

    directions.forEach((direction) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle ${direction}`;
        handle.dataset.dir = direction;
        handle.addEventListener("pointerdown", (event) => startWindowResize(event, windowEl, appId, direction));
        windowEl.appendChild(handle);
    });
}

function startWindowResize(event, windowEl, appId, direction) {
    if (!isPrimaryPointerEvent(event)) {
        return;
    }

    const appState = openAppMap.get(appId);
    if (!appState || appState.maximized) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    focusApp(appId);

    const bounds = getDesktopBounds();
    const startRect = captureRect(windowEl);
    const startX = toDesktopX(event.clientX);
    const startY = toDesktopY(event.clientY);
    const activePointerId = "pointerId" in event ? event.pointerId : null;

    document.body.classList.add("resizing-window");

    const onMove = (moveEvent) => {
        if (activePointerId !== null && moveEvent.pointerId !== activePointerId) {
            return;
        }

        const pointerX = toDesktopX(moveEvent.clientX);
        const pointerY = toDesktopY(moveEvent.clientY);
        const deltaX = pointerX - startX;
        const deltaY = pointerY - startY;

        let nextLeft = startRect.left;
        let nextTop = startRect.top;
        let nextWidth = startRect.width;
        let nextHeight = startRect.height;

        if (direction.includes("e")) {
            nextWidth = Math.max(WINDOW_MIN_WIDTH, startRect.width + deltaX);
        }

        if (direction.includes("s")) {
            nextHeight = Math.max(WINDOW_MIN_HEIGHT, startRect.height + deltaY);
        }

        if (direction.includes("w")) {
            nextWidth = Math.max(WINDOW_MIN_WIDTH, startRect.width - deltaX);
            nextLeft = startRect.left + (startRect.width - nextWidth);
        }

        if (direction.includes("n")) {
            nextHeight = Math.max(WINDOW_MIN_HEIGHT, startRect.height - deltaY);
            nextTop = startRect.top + (startRect.height - nextHeight);
        }

        nextWidth = Math.min(nextWidth, bounds.width);
        nextHeight = Math.min(nextHeight, bounds.height);
        nextLeft = clamp(nextLeft, bounds.left, bounds.left + bounds.width - nextWidth);
        nextTop = clamp(nextTop, bounds.top, bounds.top + bounds.height - nextHeight);

        applyRect(windowEl, {
            left: nextLeft,
            top: nextTop,
            width: nextWidth,
            height: nextHeight
        });
    };

    const onUp = (upEvent) => {
        if (activePointerId !== null && upEvent.pointerId !== activePointerId) {
            return;
        }

        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        document.body.classList.remove("resizing-window");
        scheduleSaveDesktopState();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
}

function applySnapLayout(appId, layout) {
    const appState = openAppMap.get(appId);
    if (!appState) {
        return;
    }

    const bounds = getDesktopBounds();
    const gap = 8;
    const halfWidth = Math.max(WINDOW_MIN_WIDTH, Math.round((bounds.width - gap * 3) / 2));
    const halfHeight = Math.max(WINDOW_MIN_HEIGHT, Math.round((bounds.height - gap * 3) / 2));
    const fullWidth = bounds.width - gap * 2;
    const fullHeight = bounds.height - gap * 2;

    const layouts = {
        left: { left: gap, top: gap, width: halfWidth, height: fullHeight },
        right: { left: bounds.width - halfWidth - gap, top: gap, width: halfWidth, height: fullHeight },
        topLeft: { left: gap, top: gap, width: halfWidth, height: halfHeight },
        topRight: { left: bounds.width - halfWidth - gap, top: gap, width: halfWidth, height: halfHeight },
        bottomLeft: { left: gap, top: bounds.height - halfHeight - gap, width: halfWidth, height: halfHeight },
        bottomRight: { left: bounds.width - halfWidth - gap, top: bounds.height - halfHeight - gap, width: halfWidth, height: halfHeight }
    };

    const nextRect = layouts[layout];
    if (!nextRect) {
        return;
    }

    if (!appState.maximized) {
        appState.restoreRect = captureRect(appState.windowEl);
    }
    appState.maximized = false;
    appState.windowEl.classList.remove("maximized");
    syncMaximizeButtons(appState.windowEl, false);
    applyRect(appState.windowEl, nextRect);
    focusApp(appId);
    scheduleSaveDesktopState();
}

function wireSnapLayoutMenu(windowEl, appId, maxButton) {
    if (!maxButton) {
        return;
    }

    const snapMenu = document.createElement("div");
    snapMenu.className = "snap-layout-menu";
    snapMenu.innerHTML = `
        <button type="button" class="snap-layout-option is-tall-left" data-layout="left" aria-label="Snap left"></button>
        <button type="button" class="snap-layout-option is-tall-right" data-layout="right" aria-label="Snap right"></button>
        <button type="button" class="snap-layout-option" data-layout="topLeft" aria-label="Top left"></button>
        <button type="button" class="snap-layout-option" data-layout="topRight" aria-label="Top right"></button>
        <button type="button" class="snap-layout-option" data-layout="bottomLeft" aria-label="Bottom left"></button>
        <button type="button" class="snap-layout-option" data-layout="bottomRight" aria-label="Bottom right"></button>
    `;
    windowEl.appendChild(snapMenu);

    let openTimer = null;
    let closeTimer = null;
    const prefersHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const openMenu = () => {
        window.clearTimeout(closeTimer);
        snapMenu.classList.add("open");
    };

    const scheduleOpen = () => {
        if (!prefersHover) {
            return;
        }
        window.clearTimeout(openTimer);
        openTimer = window.setTimeout(openMenu, 180);
    };

    const scheduleClose = () => {
        window.clearTimeout(openTimer);
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
            snapMenu.classList.remove("open");
        }, 120);
    };

    maxButton.addEventListener("mouseenter", scheduleOpen);
    maxButton.addEventListener("mouseleave", scheduleClose);
    snapMenu.addEventListener("mouseenter", openMenu);
    snapMenu.addEventListener("mouseleave", scheduleClose);

    snapMenu.addEventListener("click", (event) => {
        event.stopPropagation();
        const targetButton = event.target.closest(".snap-layout-option[data-layout]");
        if (!targetButton) {
            return;
        }

        applySnapLayout(appId, targetButton.dataset.layout || "");
        snapMenu.classList.remove("open");
    });

    windowEl.addEventListener("pointerdown", (event) => {
        if (!event.target.closest(".snap-layout-menu") && !event.target.closest(".window-btn.maximize")) {
            snapMenu.classList.remove("open");
        }
    });
}

function attachWindowInteractions(windowEl, appId) {
    const dragRegions = windowEl.querySelectorAll(".window-titlebar, .chrome-drag-region");

    dragRegions.forEach((region) => {
        region.addEventListener("pointerdown", (event) => startWindowDrag(event, windowEl, appId));
        region.addEventListener("dblclick", (event) => {
            if (isInteractiveTitleTarget(event.target)) {
                return;
            }
            toggleMaximize(appId);
        });
    });

    windowEl.addEventListener("pointerdown", () => focusApp(appId));

    const minButton = windowEl.querySelector(".window-btn.minimize");
    const maxButton = windowEl.querySelector(".window-btn.maximize");
    const closeButton = windowEl.querySelector(".window-btn.close");

    minButton.addEventListener("click", (event) => {
        event.stopPropagation();
        minimizeApp(appId);
    });

    maxButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMaximize(appId);
    });

    closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        closeApp(appId);
    });

    wireSnapLayoutMenu(windowEl, appId, maxButton);
    addResizeHandles(windowEl, appId);
}

function buildWindow(appId, options = {}) {
    const app = getAppInfo(appId);
    const offset = openAppMap.size * 30;
    const bounds = getDesktopBounds();
    const isChrome = appId === "chrome";
    const isExplorerApp = appId === "thispc" || appId === "files";
    const isThisPc = appId === "thispc";
    const isLimoreCloud = app.layout === "limore-cloud";
    const isGameShowcase = app.layout === "game-showcase";
    const maxUsableWidth = Math.max(WINDOW_MIN_WIDTH, bounds.width - 20);
    const maxUsableHeight = Math.max(WINDOW_MIN_HEIGHT, bounds.height - 20);
    let defaultWidth = isChrome
        ? Math.min(1120, Math.round(bounds.width * 0.82), maxUsableWidth)
        : isExplorerApp
            ? Math.min(980, Math.round(bounds.width * 0.72), maxUsableWidth)
            : isLimoreCloud
                ? Math.min(1180, Math.round(bounds.width * 0.94), maxUsableWidth)
            : isGameShowcase
                ? Math.min(1100, Math.round(bounds.width * 0.84), maxUsableWidth)
                : Math.min(760, Math.round(bounds.width * 0.6), maxUsableWidth);
    let defaultHeight = isChrome
        ? Math.min(700, Math.round(bounds.height * 0.82), maxUsableHeight)
        : isExplorerApp
            ? Math.min(620, Math.round(bounds.height * 0.72), maxUsableHeight)
            : isLimoreCloud
                ? Math.min(700, Math.round(bounds.height * 0.92), maxUsableHeight)
            : isGameShowcase
                ? Math.min(700, Math.round(bounds.height * 0.84), maxUsableHeight)
                : Math.min(500, Math.round(bounds.height * 0.62), maxUsableHeight);

    defaultWidth = Math.max(WINDOW_MIN_WIDTH, defaultWidth);
    defaultHeight = Math.max(WINDOW_MIN_HEIGHT, defaultHeight);

    if (mobileFitState.active) {
        const windowScale = mobileFitState.windowScale || 0.9;
        defaultWidth = Math.max(WINDOW_MIN_WIDTH, Math.round(defaultWidth * windowScale));
        defaultHeight = Math.max(WINDOW_MIN_HEIGHT, Math.round(defaultHeight * windowScale));

        if (isLimoreCloud) {
            const isPortraitMobile = getDesktopViewportHeight() >= getDesktopViewportWidth();
            const limoreScale = isPortraitMobile ? 0.72 : 0.84;
            const limoreHeightScale = isPortraitMobile ? 0.68 : 0.8;
            defaultWidth = Math.max(WINDOW_MIN_WIDTH, Math.round(defaultWidth * limoreScale));
            defaultHeight = Math.max(WINDOW_MIN_HEIGHT, Math.round(defaultHeight * limoreHeightScale));
        }
    }

    defaultWidth = Math.min(defaultWidth, maxUsableWidth);
    defaultHeight = Math.min(defaultHeight, maxUsableHeight);
    const left = isChrome
        ? 18
        : isLimoreCloud
            ? clamp(Math.round((bounds.width - defaultWidth) / 2), 8, bounds.width - defaultWidth - 8)
        : clamp(120 + offset, 8, bounds.width - defaultWidth - 8);
    const top = isChrome
        ? 12
        : isLimoreCloud
            ? clamp(16, 8, bounds.height - defaultHeight - 8)
        : clamp(72 + offset, 8, bounds.height - defaultHeight - 8);

    const windowEl = document.createElement("div");
    windowEl.className = isChrome
        ? "app-window chrome-window"
        : isExplorerApp
            ? "app-window thispc-window"
            : isLimoreCloud
                ? "app-window limore-cloud-window"
            : isGameShowcase
                ? "app-window game-window"
                : "app-window";
    windowEl.dataset.app = appId;
    windowEl.innerHTML = isChrome
        ? buildChromeWindowMarkup(app)
        : isExplorerApp
            ? buildThisPcWindowMarkup(app)
            : isLimoreCloud
                ? buildLimoreCloudWindowMarkup(app, options)
            : isGameShowcase
                ? buildGameShowcaseWindowMarkup(app)
                : `
            <div class="window-titlebar">
                <div class="window-title">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>${app.name}</span>
                </div>
                <div class="window-actions">
                    <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                    <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="window-body">
                <div class="app-screen">
                    <img src="${app.icon}" alt="${app.name}">
                    <h2>${app.name}</h2>
                    <p>${app.description}</p>
                </div>
            </div>
        `;

    const restoredRect = options.restoreState?.rect;
    applyRect(windowEl, restoredRect ? {
        left: clamp(restoredRect.left, bounds.left, bounds.left + bounds.width - Math.min(restoredRect.width, bounds.width)),
        top: clamp(restoredRect.top, bounds.top, bounds.top + bounds.height - Math.min(restoredRect.height, bounds.height)),
        width: clamp(restoredRect.width, WINDOW_MIN_WIDTH, bounds.width),
        height: clamp(restoredRect.height, WINDOW_MIN_HEIGHT, bounds.height)
    } : {
        left,
        top,
        width: defaultWidth,
        height: defaultHeight
    });

    if (isChrome) {
        wireChromeWindow(windowEl, app);
    }

    if (isExplorerApp) {
        wireThisPcWindow(windowEl);
    }

    if (isLimoreCloud) {
        wireLimoreCloudWindow(windowEl);
    }

    attachWindowInteractions(windowEl, appId);
    syncMaximizeButtons(windowEl, false);

    return windowEl;
}

function createRunningIconIfNeeded(appId) {
    const taskbarAppId = getTaskbarAppId(appId);
    if (isPinnedOnTaskbar(taskbarAppId)) {
        return null;
    }

    const app = getAppInfo(appId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "t-icon running-task-icon";
    button.dataset.app = taskbarAppId;
    button.title = app.name;
    button.innerHTML = `<img src="${app.icon}" alt="${app.name}">`;
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleAppFromTaskbar(taskbarAppId);
    });

    runningApps.appendChild(button);
    return button;
}

function openApp(appId, options = {}) {
    if (!appId) {
        return;
    }

    const app = getAppInfo(appId);
    if (app.launchInApp === "chrome" && app.launchUrl) {
        openUrlInsideDesktopChrome(app.launchUrl, app.name);
        startMenu.classList.remove("open");
        return;
    }

    if (openAppMap.has(appId)) {
        focusApp(appId);
        return;
    }

    const windowEl = buildWindow(appId, options);
    const runningEl = createRunningIconIfNeeded(appId);
    const restoreState = options.restoreState || null;

    windowLayer.appendChild(windowEl);
    const appState = {
        appId,
        windowEl,
        runningEl,
        maximized: false,
        restoreRect: restoreState?.rect || null
    };
    openAppMap.set(appId, appState);

    if (restoreState?.maximized) {
        appState.maximized = true;
        appState.windowEl.classList.add("maximized");
        applyMaximizedGeometry(appState);
        syncMaximizeButtons(appState.windowEl, true);
    }

    if (restoreState?.zIndex) {
        windowEl.style.zIndex = String(restoreState.zIndex);
        zCounter = Math.max(zCounter, restoreState.zIndex);
    }

    if (restoreState?.minimized) {
        windowEl.classList.add("minimized");
    }

    requestAnimationFrame(() => windowEl.classList.add("show"));
    if (!options.skipFocus && !restoreState?.minimized) {
        focusApp(appId);
    } else {
        refreshTaskbarIndicators();
    }
    normalizeOpenWindowsForViewport();
    startMenu.classList.remove("open");
    scheduleSaveDesktopState();
}

function toggleAppFromTaskbar(appId) {
    const relatedStates = getAppStatesByTaskbar(appId);
    if (relatedStates.length === 0) {
        const launchAppId = appId === "files" ? "thispc" : appId;
        openApp(launchAppId);
        return;
    }

    const appState = relatedStates.find((state) => state.appId === activeAppId)
        || relatedStates.find((state) => !state.windowEl.classList.contains("minimized"))
        || relatedStates[0];
    const isActive = activeAppId === appState.appId && !appState.windowEl.classList.contains("minimized");
    if (isActive) {
        minimizeApp(appState.appId);
    } else {
        focusApp(appState.appId);
    }
}

function clearShortcutSelection() {
    document.querySelectorAll(".desktop-icons .shortcut.is-selected").forEach((icon) => {
        icon.classList.remove("is-selected");
    });
}

function openExternalPage(pagePath) {
    if (!pagePath) {
        return;
    }

    try {
        window.open(pagePath, "_blank", "noopener,noreferrer");
    } catch (error) {
        window.location.href = pagePath;
    }
}

function selectShortcut(shortcutEl) {
    clearShortcutSelection();
    shortcutEl.classList.add("is-selected");
}

function wireDesktopShortcuts() {
    document.querySelectorAll(".desktop-icons .shortcut.app-launcher").forEach((shortcut) => {
        shortcut.addEventListener("click", (event) => {
            event.stopPropagation();
            selectShortcut(shortcut);
        });

        shortcut.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            const appId = shortcut.dataset.app;
            if (appId) {
                openApp(appId);
            }
        });
    });

    document.querySelectorAll(".desktop-icons .shortcut.external-page").forEach((shortcut) => {
        shortcut.addEventListener("click", (event) => {
            event.stopPropagation();
            selectShortcut(shortcut);
        });

        shortcut.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            openExternalPage(shortcut.dataset.page || "");
        });
    });

    desktop.addEventListener("click", (event) => {
        if (!event.target.closest(".shortcut")) {
            clearShortcutSelection();
        }
    });
}

function wireLaunchers() {
    document.querySelectorAll("#start-menu .app-launcher, .taskbar .app-launcher").forEach((launcher) => {
        launcher.addEventListener("click", (event) => {
            event.stopPropagation();
            const appId = launcher.dataset.app;
            if (!appId) {
                return;
            }

            if (launcher.closest(".taskbar")) {
                toggleAppFromTaskbar(appId);
                return;
            }

            openApp(appId);
        });
    });

    document.querySelectorAll("#start-menu .external-page").forEach((launcher) => {
        launcher.addEventListener("click", (event) => {
            event.stopPropagation();
            openExternalPage(launcher.dataset.page || "");
            startMenu.classList.remove("open");
        });
    });
}

function createDesktopMenu() {
    const menu = document.createElement("div");
    menu.className = "desktop-context-menu";
    menu.innerHTML = `
        <button type="button" data-action="refresh"><i class="fas fa-rotate"></i><span>Refresh</span></button>
        <button type="button" data-action="next_wallpaper"><i class="fas fa-image"></i><span>Next wallpaper</span></button>
        <button type="button" data-action="personalize"><i class="fas fa-palette"></i><span>Personalize</span></button>
        <button type="button" data-action="open_chrome"><i class="fab fa-chrome"></i><span>Open Chrome</span></button>
        <button type="button" data-action="close_windows"><i class="fas fa-window-close"></i><span>Close All Windows</span></button>
        <button type="button" data-action="toggle_start"><i class="fab fa-windows"></i><span>Open Start</span></button>
    `;
    document.body.appendChild(menu);
    return menu;
}

function hideDesktopMenu() {
    if (!desktopMenuEl) {
        return;
    }

    desktopMenuEl.classList.remove("open");
}

function showDesktopMenu(x, y) {
    if (!desktopMenuEl) {
        return;
    }

    desktopMenuEl.classList.add("open");
    const menuWidth = desktopMenuEl.offsetWidth;
    const menuHeight = desktopMenuEl.offsetHeight;

    const left = clamp(x, 6, getViewportWidth() - menuWidth - 6);
    const top = clamp(y, 6, getViewportHeight() - menuHeight - 6);

    desktopMenuEl.style.left = `${left}px`;
    desktopMenuEl.style.top = `${top}px`;
}

function performDesktopAction(action) {
    if (action === "refresh") {
        desktop.classList.add("refresh-flash");
        setTimeout(() => desktop.classList.remove("refresh-flash"), 220);
    }

    if (action === "next_wallpaper") {
        cycleDesktopWallpaper();
    }

    if (action === "personalize") {
        openDesktopThemePanel();
    }

    if (action === "open_chrome") {
        openApp("chrome");
    }

    if (action === "close_windows") {
        Array.from(openAppMap.keys()).forEach((appId) => closeApp(appId));
    }

    if (action === "toggle_start") {
        startMenu.classList.toggle("open");
    }
}

function wireDesktopMenu() {
    desktopMenuEl = createDesktopMenu();

    desktop.addEventListener("contextmenu", (event) => {
        if (event.target.closest(".app-window") || event.target.closest("input, textarea")) {
            return;
        }

        event.preventDefault();
        clearShortcutSelection();
        showDesktopMenu(event.clientX, event.clientY);
    });

    desktopMenuEl.addEventListener("click", (event) => {
        event.stopPropagation();
        const button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        performDesktopAction(button.dataset.action);
        hideDesktopMenu();
    });
}

function keepWindowsInsideViewport() {
    const bounds = getDesktopBounds();

    openAppMap.forEach((appState) => {
        if (appState.maximized) {
            applyMaximizedGeometry(appState);
            return;
        }

        const rect = captureRect(appState.windowEl);
        const width = Math.min(rect.width, bounds.width);
        const height = Math.min(rect.height, bounds.height);
        const left = clamp(rect.left, bounds.left, bounds.left + bounds.width - width);
        const top = clamp(rect.top, bounds.top, bounds.top + bounds.height - height);
        applyRect(appState.windowEl, { left, top, width, height });
    });
}

function normalizeOpenWindowsForViewport() {
    if (!mobileFitState.active) {
        return;
    }

    const bounds = getDesktopBounds();
    const windowScale = mobileFitState.windowScale || 0.9;

    openAppMap.forEach((appState) => {
        if (appState.maximized) {
            applyMaximizedGeometry(appState);
            return;
        }

        const rect = captureRect(appState.windowEl);
        const targetMaxWidth = Math.max(WINDOW_MIN_WIDTH, Math.round((bounds.width - 20) * windowScale));
        const targetMaxHeight = Math.max(WINDOW_MIN_HEIGHT, Math.round((bounds.height - 24) * windowScale));
        const width = Math.min(rect.width, targetMaxWidth, bounds.width);
        const height = Math.min(rect.height, targetMaxHeight, bounds.height);
        const left = clamp(rect.left, bounds.left, bounds.left + bounds.width - width);
        const top = clamp(rect.top, bounds.top, bounds.top + bounds.height - height);
        applyRect(appState.windowEl, { left, top, width, height });
    });
}

function emitVirtualGamepadEvent(type, payload = {}) {
    document.dispatchEvent(new CustomEvent("virtual-gamepad-input", {
        detail: {
            type,
            ...payload,
            timestamp: Date.now()
        }
    }));
}

function formatControllerDuration(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function updateControllerUptime() {
    if (!controllerUptime) {
        return;
    }

    const totalSeconds = Math.floor((Date.now() - controllerSessionStart) / 1000);
    controllerUptime.textContent = formatControllerDuration(totalSeconds);
}

function setControllerMenuOpen(open) {
    if (!controllerMenu || !controllerMenuToggle) {
        return;
    }

    controllerMenu.classList.toggle("open", open);
    controllerMenuToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
}

function setVirtualGamepadVisible(visible) {
    if (!virtualGamepad || !toggleVirtualGamepadButton) {
        return;
    }

    virtualGamepad.classList.toggle("hidden", !visible);
    virtualGamepad.setAttribute("aria-hidden", String(!visible));
    toggleVirtualGamepadButton.textContent = visible ? "Tat tay cam ao" : "Bat tay cam ao";
    renderVirtualCursor();
}

function setPhysicalGamepadMode(enabled) {
    physicalGamepadMode = enabled;
    if (togglePhysicalGamepadButton) {
        togglePhysicalGamepadButton.classList.toggle("is-primary", enabled);
        togglePhysicalGamepadButton.textContent = enabled
            ? "Dung tay cam PC (dang bat)"
            : "Dung tay cam PC";
    }
    renderVirtualCursor();
}

function setTouchMouseMode(enabled) {
    touchMouseMode = Boolean(enabled);
    document.body.classList.toggle("touch-mouse-mode", touchMouseMode);
    if (!touchMouseMode) {
        releaseTouchLeftHold();
    }
    if (toggleTouchMouseButton) {
        toggleTouchMouseButton.classList.toggle("is-primary", touchMouseMode);
        toggleTouchMouseButton.textContent = touchMouseMode
            ? "Mouse mode (dang bat)"
            : "Mouse mode";
    }

    if (touchMouseMode) {
        desktopVirtualPointerState.x = clamp(desktopVirtualPointerState.x || getViewportWidth() * 0.5, 2, getViewportWidth() - 2);
        desktopVirtualPointerState.y = clamp(desktopVirtualPointerState.y || getViewportHeight() * 0.5, 2, getViewportHeight() - 2);
    }

    renderVirtualCursor();
}

function setEditLayoutMode(enabled) {
    if (!virtualGamepad || !toggleLayoutEditButton) {
        return;
    }

    virtualGamepad.classList.toggle("edit-mode", enabled);
    toggleLayoutEditButton.classList.toggle("is-primary", enabled);
    toggleLayoutEditButton.textContent = enabled ? "Tat chinh vi tri" : "Chinh vi tri";
    renderVirtualCursor();
}

function getNumericStyleValue(styleValue) {
    const parsed = Number.parseFloat(styleValue);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeVirtualControlAnchors(control) {
    const style = getComputedStyle(control);
    const width = control.offsetWidth;
    const height = control.offsetHeight;
    const desktopWidth = getDesktopViewportWidth();
    const desktopHeight = getDesktopViewportHeight();

    let left = style.left === "auto"
        ? desktopWidth - getNumericStyleValue(style.right) - width
        : getNumericStyleValue(style.left);
    let top = style.top === "auto"
        ? desktopHeight - getNumericStyleValue(style.bottom) - height
        : getNumericStyleValue(style.top);

    if (!Number.isFinite(left)) {
        left = control.offsetLeft;
    }
    if (!Number.isFinite(top)) {
        top = control.offsetTop;
    }

    control.style.left = `${left}px`;
    control.style.top = `${top}px`;
    control.style.right = "auto";
    control.style.bottom = "auto";

    if (!control.dataset.defaultLeft) {
        control.dataset.defaultLeft = String(left);
    }
    if (!control.dataset.defaultTop) {
        control.dataset.defaultTop = String(top);
    }
    if (!control.dataset.defaultScale) {
        control.dataset.defaultScale = "1";
    }
}

function getVirtualControlScale(control) {
    const scaleRaw = control.style.getPropertyValue("--vg-scale");
    const parsed = Number.parseFloat(scaleRaw);
    return Number.isFinite(parsed) ? parsed : 1;
}

function getVirtualControllerScale(control) {
    const scope = control || virtualGamepad || document.documentElement;
    const scaleRaw = getComputedStyle(scope).getPropertyValue("--controller-scale");
    const parsed = Number.parseFloat(scaleRaw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getVirtualControlTotalScale(control) {
    return getVirtualControlScale(control) * getVirtualControllerScale(control);
}

function selectVirtualControl(control) {
    if (!virtualGamepad) {
        return;
    }

    virtualGamepad.querySelectorAll(".vg-control.selected").forEach((item) => {
        item.classList.remove("selected");
    });

    if (control) {
        control.classList.add("selected");
    }
}

function saveVirtualControllerLayout() {
    if (!virtualGamepad) {
        return;
    }

    const layout = {};
    virtualGamepad.querySelectorAll(".vg-control[data-control]").forEach((control) => {
        const controlName = control.dataset.control;
        if (!controlName) {
            return;
        }

        layout[controlName] = {
            left: getNumericStyleValue(control.style.left),
            top: getNumericStyleValue(control.style.top),
            scale: getVirtualControlScale(control)
        };
    });

    localStorage.setItem(CONTROLLER_LAYOUT_KEY, JSON.stringify(layout));
}

function loadVirtualControllerLayout() {
    if (!virtualGamepad) {
        return;
    }

    const raw = localStorage.getItem(CONTROLLER_LAYOUT_KEY);
    if (!raw) {
        return;
    }

    let layout = null;
    try {
        layout = JSON.parse(raw);
    } catch (error) {
        return;
    }

    if (!layout || typeof layout !== "object") {
        return;
    }

    virtualGamepad.querySelectorAll(".vg-control[data-control]").forEach((control) => {
        const controlName = control.dataset.control;
        const saved = controlName ? layout[controlName] : null;
        if (!saved) {
            return;
        }

        if (typeof saved.left === "number") {
            control.style.left = `${saved.left}px`;
        }
        if (typeof saved.top === "number") {
            control.style.top = `${saved.top}px`;
        }
        if (typeof saved.scale === "number") {
            control.style.setProperty("--vg-scale", String(saved.scale));
        }
    });
}

function resetVirtualControllerLayout() {
    if (!virtualGamepad) {
        return;
    }

    virtualGamepad.querySelectorAll(".vg-control[data-control]").forEach((control) => {
        control.style.left = `${getNumericStyleValue(control.dataset.defaultLeft)}px`;
        control.style.top = `${getNumericStyleValue(control.dataset.defaultTop)}px`;
        control.style.setProperty("--vg-scale", control.dataset.defaultScale || "1");
    });

    saveVirtualControllerLayout();
}

function setVirtualControlPosition(control, nextLeft, nextTop) {
    const desktopWidth = getDesktopViewportWidth();
    const desktopHeight = getDesktopViewportHeight();
    const baseWidth = control.offsetWidth;
    const baseHeight = control.offsetHeight;
    const totalScale = getVirtualControlTotalScale(control);
    const scaledWidth = baseWidth * totalScale;
    const scaledHeight = baseHeight * totalScale;
    const halfExtraWidth = Math.max(0, (scaledWidth - baseWidth) / 2);
    const halfExtraHeight = Math.max(0, (scaledHeight - baseHeight) / 2);
    const bottomReserved = 50;
    const minLeft = halfExtraWidth;
    const maxLeft = Math.max(minLeft, desktopWidth - baseWidth - halfExtraWidth);
    const minTop = halfExtraHeight;
    const maxTop = Math.max(minTop, desktopHeight - bottomReserved - baseHeight - halfExtraHeight);
    const clampedLeft = clamp(nextLeft, minLeft, maxLeft);
    const clampedTop = clamp(nextTop, minTop, maxTop);
    control.style.left = `${clampedLeft}px`;
    control.style.top = `${clampedTop}px`;
}

function clampVirtualControlsToViewport() {
    if (!virtualGamepad) {
        return;
    }

    virtualGamepad.querySelectorAll(".vg-control[data-control]").forEach((control) => {
        normalizeVirtualControlAnchors(control);
        const currentLeft = getNumericStyleValue(control.style.left);
        const currentTop = getNumericStyleValue(control.style.top);
        setVirtualControlPosition(control, currentLeft, currentTop);
    });
}

function startVirtualControlDrag(event) {
    if (!virtualGamepad || !virtualGamepad.classList.contains("edit-mode")) {
        return;
    }

    const control = event.currentTarget;
    if (!control || !control.classList.contains("vg-control")) {
        return;
    }

    event.preventDefault();
    selectVirtualControl(control);
    activeControllerDrag = {
        pointerId: event.pointerId,
        control,
        offsetX: toDesktopX(event.clientX) - getNumericStyleValue(control.style.left),
        offsetY: toDesktopY(event.clientY) - getNumericStyleValue(control.style.top)
    };
}

function handleVirtualControlDragMove(event) {
    if (!activeControllerDrag || event.pointerId !== activeControllerDrag.pointerId) {
        return;
    }

    const nextLeft = toDesktopX(event.clientX) - activeControllerDrag.offsetX;
    const nextTop = toDesktopY(event.clientY) - activeControllerDrag.offsetY;
    setVirtualControlPosition(activeControllerDrag.control, nextLeft, nextTop);
}

function handleVirtualControlDragEnd(event) {
    if (!activeControllerDrag || event.pointerId !== activeControllerDrag.pointerId) {
        return;
    }

    saveVirtualControllerLayout();
    activeControllerDrag = null;
}

function resizeSelectedVirtualControl(step) {
    if (!virtualGamepad) {
        return;
    }

    const selected = virtualGamepad.querySelector(".vg-control.selected");
    if (!selected) {
        return;
    }

    const currentScale = getVirtualControlScale(selected);
    const nextScale = clamp(currentScale + step, 0.6, 2.2);
    selected.style.setProperty("--vg-scale", String(nextScale));
    setVirtualControlPosition(
        selected,
        getNumericStyleValue(selected.style.left),
        getNumericStyleValue(selected.style.top)
    );
    saveVirtualControllerLayout();
}

function setVirtualButtonState(controlName, pressed, source = "virtual") {
    if (!virtualGamepad) {
        return;
    }

    const currentPressed = virtualButtonStates.get(controlName) || false;
    if (currentPressed === pressed) {
        return;
    }

    virtualButtonStates.set(controlName, pressed);
    virtualGamepad.querySelectorAll(`[data-control="${controlName}"]`).forEach((controlEl) => {
        controlEl.classList.toggle("active", pressed);
    });
    emitVirtualGamepadEvent("button", { control: controlName, pressed, source });
}

function bindVirtualButton(buttonEl, controlName) {
    let pressedPointerId = null;

    buttonEl.addEventListener("pointerdown", (event) => {
        if (virtualGamepad?.classList.contains("edit-mode")) {
            return;
        }

        event.preventDefault();
        pressedPointerId = event.pointerId;
        if (buttonEl.setPointerCapture) {
            buttonEl.setPointerCapture(event.pointerId);
        }
        setVirtualButtonState(controlName, true, "touch");
    });

    const release = (event) => {
        if (pressedPointerId === null) {
            return;
        }
        if (event && typeof event.pointerId === "number" && event.pointerId !== pressedPointerId) {
            return;
        }

        if (buttonEl.releasePointerCapture && event && typeof event.pointerId === "number") {
            try {
                buttonEl.releasePointerCapture(event.pointerId);
            } catch (error) {
                // Ignore capture release errors from browsers that already released capture.
            }
        }
        pressedPointerId = null;
        setVirtualButtonState(controlName, false, "touch");
    };

    buttonEl.addEventListener("pointerup", release);
    buttonEl.addEventListener("pointercancel", release);
    buttonEl.addEventListener("lostpointercapture", release);
}

function setVirtualStickState(stickName, x, y, source = "virtual") {
    if (!virtualGamepad) {
        return;
    }

    const stickWrap = virtualGamepad.querySelector(`.vg-stick-wrap[data-control="${stickName}"]`);
    if (!stickWrap) {
        return;
    }

    const ring = stickWrap.querySelector(".vg-stick-ring");
    const thumb = stickWrap.querySelector(".vg-stick-thumb");
    if (!ring || !thumb) {
        return;
    }

    const nx = clamp(x, -1, 1);
    const ny = clamp(y, -1, 1);
    const radius = ring.clientWidth * 0.27;
    thumb.style.transform = `translate(${Math.round(nx * radius)}px, ${Math.round(ny * radius)}px)`;

    const isActive = Math.abs(nx) > 0.08 || Math.abs(ny) > 0.08;
    thumb.classList.toggle("active", isActive);
    stickWrap.classList.toggle("active", isActive);
    emitVirtualGamepadEvent("axis", { control: stickName, x: nx, y: ny, source });
}

function bindVirtualStick(stickWrap, stickName) {
    const ring = stickWrap.querySelector(".vg-stick-ring");
    if (!ring) {
        return;
    }

    let pointerId = null;
    const handleMove = (clientX, clientY, source) => {
        const rect = ring.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const maxDistance = rect.width * 0.34;

        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const distance = Math.hypot(dx, dy);
        if (distance > maxDistance && distance > 0) {
            const ratio = maxDistance / distance;
            dx *= ratio;
            dy *= ratio;
        }

        setVirtualStickState(stickName, dx / maxDistance, dy / maxDistance, source);
    };

    stickWrap.addEventListener("pointerdown", (event) => {
        if (virtualGamepad?.classList.contains("edit-mode")) {
            return;
        }

        event.preventDefault();
        pointerId = event.pointerId;
        if (stickWrap.setPointerCapture) {
            stickWrap.setPointerCapture(event.pointerId);
        }
        handleMove(event.clientX, event.clientY, "touch");
    });

    stickWrap.addEventListener("pointermove", (event) => {
        if (pointerId === null || event.pointerId !== pointerId) {
            return;
        }
        handleMove(event.clientX, event.clientY, "touch");
    });

    const release = (event) => {
        if (pointerId === null) {
            return;
        }
        if (event && typeof event.pointerId === "number" && event.pointerId !== pointerId) {
            return;
        }

        if (stickWrap.releasePointerCapture && event && typeof event.pointerId === "number") {
            try {
                stickWrap.releasePointerCapture(event.pointerId);
            } catch (error) {
                // Ignore capture release errors from browsers that already released capture.
            }
        }
        pointerId = null;
        setVirtualStickState(stickName, 0, 0, "touch");
        updateKeyboardVirtualSticks();
    };

    stickWrap.addEventListener("pointerup", release);
    stickWrap.addEventListener("pointercancel", release);
    stickWrap.addEventListener("lostpointercapture", release);
    window.addEventListener("blur", () => release());
}

function updateKeyboardVirtualSticks() {
    const leftX = (controllerPressedKeys.has("ArrowRight") ? 1 : 0) - (controllerPressedKeys.has("ArrowLeft") ? 1 : 0);
    const leftY = (controllerPressedKeys.has("ArrowDown") ? 1 : 0) - (controllerPressedKeys.has("ArrowUp") ? 1 : 0);
    const rightX = (controllerPressedKeys.has("KeyL") ? 1 : 0) - (controllerPressedKeys.has("KeyJ") ? 1 : 0);
    const rightY = (controllerPressedKeys.has("KeyK") ? 1 : 0) - (controllerPressedKeys.has("KeyI") ? 1 : 0);

    setVirtualStickState("leftStick", leftX, leftY, "keyboard");
    setVirtualStickState("rightStick", rightX, rightY, "keyboard");
}

function handleVirtualControllerKeyDown(event) {
    const target = event.target;
    if (target && target.closest("input, textarea")) {
        return;
    }

    const keyMap = {
        KeyQ: "lt",
        KeyE: "rt",
        KeyZ: "lb",
        KeyC: "rb",
        Enter: "start",
        Escape: "pause",
        KeyF: "a",
        KeyG: "b",
        KeyR: "x",
        KeyT: "y",
        Digit1: "ls",
        Digit3: "rs",
        KeyW: "dpadUp",
        KeyA: "dpadLeft",
        KeyS: "dpadDown",
        KeyD: "dpadRight"
    };

    controllerPressedKeys.add(event.code);

    const mappedControl = keyMap[event.code];
    if (mappedControl) {
        setVirtualButtonState(mappedControl, true, "keyboard");
    }
    updateKeyboardVirtualSticks();
}

function handleVirtualControllerKeyUp(event) {
    const keyMap = {
        KeyQ: "lt",
        KeyE: "rt",
        KeyZ: "lb",
        KeyC: "rb",
        Enter: "start",
        Escape: "pause",
        KeyF: "a",
        KeyG: "b",
        KeyR: "x",
        KeyT: "y",
        Digit1: "ls",
        Digit3: "rs",
        KeyW: "dpadUp",
        KeyA: "dpadLeft",
        KeyS: "dpadDown",
        KeyD: "dpadRight"
    };

    controllerPressedKeys.delete(event.code);

    const mappedControl = keyMap[event.code];
    if (mappedControl) {
        setVirtualButtonState(mappedControl, false, "keyboard");
    }
    updateKeyboardVirtualSticks();
}

function pollPhysicalGamepad() {
    const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    const gamepad = gamepads[0];

    if (gamepad) {
        const buttonMap = [
            ["a", 0], ["b", 1], ["x", 2], ["y", 3],
            ["lb", 4], ["rb", 5], ["lt", 6], ["rt", 7],
            ["pause", 8], ["start", 9], ["ls", 10], ["rs", 11],
            ["dpadUp", 12], ["dpadDown", 13], ["dpadLeft", 14], ["dpadRight", 15]
        ];

        buttonMap.forEach(([name, index]) => {
            const button = gamepad.buttons[index];
            const pressed = Boolean(button?.pressed || (button?.value || 0) > 0.55);
            setVirtualButtonState(name, pressed, "gamepad");
        });

        setVirtualStickState("leftStick", gamepad.axes[0] || 0, gamepad.axes[1] || 0, "gamepad");
        setVirtualStickState("rightStick", gamepad.axes[2] || 0, gamepad.axes[3] || 0, "gamepad");
    }

    requestAnimationFrame(pollPhysicalGamepad);
}

function isVirtualDesktopControlEnabled() {
    // Disable controlling the local fake desktop with virtual-controller input.
    // User wants controller to be used for cloud desktop inside web content instead.
    return false;
}

function ensureVirtualCursorElement() {
    if (desktopVirtualCursorEl) {
        return desktopVirtualCursorEl;
    }

    const cursorEl = document.createElement("div");
    cursorEl.className = "virtual-cursor";
    cursorEl.innerHTML = '<span class="virtual-cursor-dot"></span>';
    document.body.appendChild(cursorEl);
    desktopVirtualCursorEl = cursorEl;
    return cursorEl;
}

function renderVirtualCursor() {
    const cursorEl = ensureVirtualCursorElement();
    const enabled = isVirtualDesktopControlEnabled() || isTouchMouseModeEnabled();
    cursorEl.classList.toggle("visible", enabled);
    if (!enabled) {
        return;
    }

    cursorEl.style.left = `${Math.round(desktopVirtualPointerState.x)}px`;
    cursorEl.style.top = `${Math.round(desktopVirtualPointerState.y)}px`;
}

function dispatchCursorMouseEvent(target, eventName, options = {}) {
    const event = new MouseEvent(eventName, {
        bubbles: true,
        cancelable: true,
        clientX: desktopVirtualPointerState.x,
        clientY: desktopVirtualPointerState.y,
        button: options.button ?? 0,
        buttons: options.buttons ?? 0
    });
    target.dispatchEvent(event);
}

function dispatchCursorWheelEvent(target, deltaY) {
    const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        clientX: desktopVirtualPointerState.x,
        clientY: desktopVirtualPointerState.y,
        deltaX: 0,
        deltaY
    });
    target.dispatchEvent(event);
}

function dispatchCursorMoveEvent(target, buttons = 0) {
    const event = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: desktopVirtualPointerState.x,
        clientY: desktopVirtualPointerState.y,
        button: 0,
        buttons
    });
    target.dispatchEvent(event);
}

function getCursorEventTarget() {
    const target = document.elementFromPoint(desktopVirtualPointerState.x, desktopVirtualPointerState.y);
    if (!target) {
        return null;
    }

    if (target.closest(".virtual-gamepad, .controller-menu, .controller-menu-toggle")) {
        return null;
    }

    return target;
}

function releaseTouchLeftHold() {
    if (!touchMouseLeftHold) {
        return;
    }

    const target = touchMouseState.leftHoldTarget || getCursorEventTarget() || document.body;
    dispatchCursorMouseEvent(target, "mouseup", { button: 0, buttons: 0 });
    touchMouseLeftHold = false;
    touchMouseState.leftHoldTarget = null;
    if (toggleTouchLeftHoldButton) {
        toggleTouchLeftHoldButton.classList.remove("is-primary");
        toggleTouchLeftHoldButton.textContent = "Giu chuot trai";
    }
}

function setTouchLeftHold(enabled) {
    if (enabled === touchMouseLeftHold) {
        return;
    }

    if (!enabled) {
        releaseTouchLeftHold();
        return;
    }

    const target = getCursorEventTarget() || document.body;
    touchMouseLeftHold = true;
    touchMouseState.leftHoldTarget = target;
    dispatchCursorMouseEvent(target, "mousedown", { button: 0, buttons: 1 });
    if (toggleTouchLeftHoldButton) {
        toggleTouchLeftHoldButton.classList.add("is-primary");
        toggleTouchLeftHoldButton.textContent = "Nha chuot trai";
    }
}

function triggerDesktopCursorAction(action) {
    const target = getCursorEventTarget();
    if (!target) {
        return;
    }

    if (action === "click") {
        dispatchCursorMouseEvent(target, "mousedown", { button: 0, buttons: 1 });
        dispatchCursorMouseEvent(target, "mouseup", { button: 0, buttons: 0 });
        dispatchCursorMouseEvent(target, "click", { button: 0 });
    }

    if (action === "doubleClick") {
        dispatchCursorMouseEvent(target, "dblclick", { button: 0 });
    }

    if (action === "rightClick") {
        dispatchCursorMouseEvent(target, "mousedown", { button: 2, buttons: 2 });
        dispatchCursorMouseEvent(target, "mouseup", { button: 2, buttons: 0 });
        dispatchCursorMouseEvent(target, "contextmenu", { button: 2 });
    }
}

function clearTouchMouseLongPressTimer() {
    if (touchMouseState.longPressTimer) {
        clearTimeout(touchMouseState.longPressTimer);
        touchMouseState.longPressTimer = null;
    }
}

function getTouchByIdentifier(touchList, identifier) {
    for (let index = 0; index < touchList.length; index += 1) {
        if (touchList[index].identifier === identifier) {
            return touchList[index];
        }
    }
    return null;
}

function getAverageTouchY(touchList) {
    if (!touchList.length) {
        return 0;
    }

    let sum = 0;
    for (let index = 0; index < touchList.length; index += 1) {
        sum += touchList[index].clientY;
    }
    return sum / touchList.length;
}

function shouldIgnoreTouchMouseTarget(target) {
    return Boolean(target.closest(".controller-menu, .controller-menu-toggle, .virtual-gamepad"));
}

function handleTouchMouseStart(event) {
    if (!isTouchMouseModeEnabled()) {
        return;
    }

    if (shouldIgnoreTouchMouseTarget(event.target)) {
        return;
    }

    if (event.touches.length >= 2) {
        touchMouseState.tracking = true;
        touchMouseState.pointerId = null;
        touchMouseState.scrolling = true;
        touchMouseState.moved = true;
        touchMouseState.lastScrollY = getAverageTouchY(event.touches);
        clearTouchMouseLongPressTimer();
        event.preventDefault();
        return;
    }

    const primaryTouch = event.touches[0];
    if (!primaryTouch) {
        return;
    }

    touchMouseState.tracking = true;
    touchMouseState.pointerId = primaryTouch.identifier;
    touchMouseState.lastX = primaryTouch.clientX;
    touchMouseState.lastY = primaryTouch.clientY;
    touchMouseState.scrolling = false;
    touchMouseState.moved = false;
    touchMouseState.longPressFired = false;
    clearTouchMouseLongPressTimer();
    touchMouseState.longPressTimer = setTimeout(() => {
        if (!touchMouseState.tracking || touchMouseState.moved || touchMouseState.scrolling) {
            return;
        }
        touchMouseState.longPressFired = true;
        triggerDesktopCursorAction("rightClick");
    }, 520);
    event.preventDefault();
}

function handleTouchMouseMove(event) {
    if (!isTouchMouseModeEnabled() || !touchMouseState.tracking) {
        return;
    }

    if (touchMouseState.scrolling || event.touches.length >= 2) {
        if (!touchMouseState.scrolling) {
            touchMouseState.scrolling = true;
            touchMouseState.lastScrollY = getAverageTouchY(event.touches);
            clearTouchMouseLongPressTimer();
            event.preventDefault();
            return;
        }

        const nextScrollY = getAverageTouchY(event.touches);
        const deltaY = nextScrollY - touchMouseState.lastScrollY;
        if (Math.abs(deltaY) > 0.1) {
            const target = getCursorEventTarget();
            if (target) {
                dispatchCursorWheelEvent(target, deltaY * 1.8);
            }
            touchMouseState.lastScrollY = nextScrollY;
        }
        touchMouseState.moved = true;
        clearTouchMouseLongPressTimer();
        event.preventDefault();
        return;
    }

    const activeTouch = getTouchByIdentifier(event.touches, touchMouseState.pointerId);
    if (!activeTouch) {
        return;
    }

    const deltaX = activeTouch.clientX - touchMouseState.lastX;
    const deltaY = activeTouch.clientY - touchMouseState.lastY;
    touchMouseState.lastX = activeTouch.clientX;
    touchMouseState.lastY = activeTouch.clientY;

    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        const sensitivity = 1.12;
        desktopVirtualPointerState.x = clamp(desktopVirtualPointerState.x + deltaX * sensitivity, 2, getViewportWidth() - 2);
        desktopVirtualPointerState.y = clamp(desktopVirtualPointerState.y + deltaY * sensitivity, 2, getViewportHeight() - 2);
        touchMouseState.moved = true;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 8) {
            clearTouchMouseLongPressTimer();
        }
        if (touchMouseLeftHold) {
            const target = getCursorEventTarget() || document.body;
            touchMouseState.leftHoldTarget = target;
            dispatchCursorMoveEvent(target, 1);
        }
        renderVirtualCursor();
    }

    event.preventDefault();
}

function handleTouchMouseEnd(event) {
    if (!isTouchMouseModeEnabled() || !touchMouseState.tracking) {
        return;
    }

    if (event.touches.length >= 1) {
        if (event.touches.length >= 2) {
            touchMouseState.scrolling = true;
            touchMouseState.lastScrollY = getAverageTouchY(event.touches);
            clearTouchMouseLongPressTimer();
            event.preventDefault();
            return;
        }

        const remainingTouch = event.touches[0];
        touchMouseState.pointerId = remainingTouch.identifier;
        touchMouseState.lastX = remainingTouch.clientX;
        touchMouseState.lastY = remainingTouch.clientY;
        touchMouseState.scrolling = false;
        touchMouseState.moved = false;
        touchMouseState.longPressFired = false;
        clearTouchMouseLongPressTimer();
        touchMouseState.longPressTimer = setTimeout(() => {
            if (!touchMouseState.tracking || touchMouseState.moved || touchMouseState.scrolling) {
                return;
            }
            touchMouseState.longPressFired = true;
            triggerDesktopCursorAction("rightClick");
        }, 520);
        event.preventDefault();
        return;
    }

    clearTouchMouseLongPressTimer();

    if (touchMouseLeftHold) {
        touchMouseState.tracking = false;
        touchMouseState.pointerId = null;
        touchMouseState.scrolling = false;
        touchMouseState.moved = false;
        touchMouseState.longPressFired = false;
        event.preventDefault();
        return;
    }

    if (!touchMouseState.scrolling && !touchMouseState.moved && !touchMouseState.longPressFired) {
        const now = Date.now();
        const distance = Math.hypot(
            desktopVirtualPointerState.x - touchMouseState.lastTapX,
            desktopVirtualPointerState.y - touchMouseState.lastTapY
        );
        if (now - touchMouseState.lastTapAt < 260 && distance < 20) {
            triggerDesktopCursorAction("doubleClick");
            touchMouseState.lastTapAt = 0;
        } else {
            triggerDesktopCursorAction("click");
            touchMouseState.lastTapAt = now;
            touchMouseState.lastTapX = desktopVirtualPointerState.x;
            touchMouseState.lastTapY = desktopVirtualPointerState.y;
        }
    }

    touchMouseState.tracking = false;
    touchMouseState.pointerId = null;
    touchMouseState.scrolling = false;
    touchMouseState.moved = false;
    touchMouseState.longPressFired = false;
    event.preventDefault();
}

function handleTouchMouseCancel() {
    clearTouchMouseLongPressTimer();
    releaseTouchLeftHold();
    touchMouseState.tracking = false;
    touchMouseState.pointerId = null;
    touchMouseState.scrolling = false;
    touchMouseState.moved = false;
    touchMouseState.longPressFired = false;
}

function initializeTouchMouseInput() {
    document.addEventListener("touchstart", handleTouchMouseStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMouseMove, { passive: false });
    document.addEventListener("touchend", handleTouchMouseEnd, { passive: false });
    document.addEventListener("touchcancel", handleTouchMouseCancel, { passive: false });
    window.addEventListener("blur", () => {
        releaseTouchLeftHold();
        handleTouchMouseCancel();
    });
}

function handleVirtualDesktopInput(event) {
    if (!isVirtualDesktopControlEnabled()) {
        return;
    }

    const { type, control, pressed, x, y } = event.detail || {};
    if (type === "axis" && control === "leftStick") {
        desktopVirtualPointerState.axisX = Number(x) || 0;
        desktopVirtualPointerState.axisY = Number(y) || 0;
    }

    if (type === "button") {
        if (control === "dpadLeft") {
            desktopVirtualPointerState.dpadX = pressed ? -1 : desktopVirtualPointerState.dpadX === -1 ? 0 : desktopVirtualPointerState.dpadX;
        }
        if (control === "dpadRight") {
            desktopVirtualPointerState.dpadX = pressed ? 1 : desktopVirtualPointerState.dpadX === 1 ? 0 : desktopVirtualPointerState.dpadX;
        }
        if (control === "dpadUp") {
            desktopVirtualPointerState.dpadY = pressed ? -1 : desktopVirtualPointerState.dpadY === -1 ? 0 : desktopVirtualPointerState.dpadY;
        }
        if (control === "dpadDown") {
            desktopVirtualPointerState.dpadY = pressed ? 1 : desktopVirtualPointerState.dpadY === 1 ? 0 : desktopVirtualPointerState.dpadY;
        }
        if (pressed && control === "a") {
            triggerDesktopCursorAction("click");
        }
        if (pressed && control === "b") {
            triggerDesktopCursorAction("rightClick");
        }
        if (pressed && control === "x") {
            triggerDesktopCursorAction("doubleClick");
        }
    }
}

function runVirtualDesktopCursorLoop() {
    const enabled = isVirtualDesktopControlEnabled();
    if (enabled) {
        const velocityX = desktopVirtualPointerState.axisX * 12 + desktopVirtualPointerState.dpadX * 7;
        const velocityY = desktopVirtualPointerState.axisY * 12 + desktopVirtualPointerState.dpadY * 7;
        desktopVirtualPointerState.x = clamp(desktopVirtualPointerState.x + velocityX, 2, getViewportWidth() - 2);
        desktopVirtualPointerState.y = clamp(desktopVirtualPointerState.y + velocityY, 2, getViewportHeight() - 2);
    }

    renderVirtualCursor();
    requestAnimationFrame(runVirtualDesktopCursorLoop);
}

function initializeVirtualController() {
    if (!controllerMenu || !virtualGamepad || !controllerMenuToggle) {
        return;
    }

    setControllerMenuOpen(false);
    setVirtualGamepadVisible(false);
    setPhysicalGamepadMode(true);
    setEditLayoutMode(false);
    updateControllerUptime();

    if (controllerPing) {
        setInterval(() => {
            const latency = 38 + Math.floor(Math.random() * 15);
            controllerPing.textContent = `${latency}ms`;
        }, 2500);
    }

    setInterval(updateControllerUptime, 1000);

    const controls = Array.from(virtualGamepad.querySelectorAll(".vg-control[data-control]"));
    controls.forEach((control) => {
        normalizeVirtualControlAnchors(control);
        control.addEventListener("pointerdown", startVirtualControlDrag);
    });

    loadVirtualControllerLayout();
    clampVirtualControlsToViewport();

    virtualGamepad.querySelectorAll(".vg-control.vg-round[data-control], .vg-control.vg-shoulder[data-control]").forEach((button) => {
        bindVirtualButton(button, button.dataset.control);
    });
    virtualGamepad.querySelectorAll(".vg-dpad-btn[data-control]").forEach((button) => {
        bindVirtualButton(button, button.dataset.control);
    });

    virtualGamepad.querySelectorAll(".vg-stick-wrap[data-control]").forEach((stickWrap) => {
        bindVirtualStick(stickWrap, stickWrap.dataset.control);
    });

    controllerMenuToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setControllerMenuOpen(!controllerMenu.classList.contains("open"));
    });

    togglePhysicalGamepadButton?.addEventListener("click", () => {
        const shouldEnable = !physicalGamepadMode;
        setPhysicalGamepadMode(shouldEnable);
        if (shouldEnable) {
            setVirtualGamepadVisible(false);
            setEditLayoutMode(false);
        }
    });

    toggleTouchMouseButton?.addEventListener("click", () => {
        setTouchMouseMode(!touchMouseMode);
    });

    toggleTouchLeftHoldButton?.addEventListener("click", () => {
        if (!isTouchMouseModeEnabled()) {
            setTouchMouseMode(true);
        }
        setTouchLeftHold(!touchMouseLeftHold);
    });

    toggleVirtualGamepadButton?.addEventListener("click", () => {
        const shouldShow = virtualGamepad.classList.contains("hidden");
        setVirtualGamepadVisible(shouldShow);
    });

    toggleLayoutEditButton?.addEventListener("click", () => {
        const shouldEnable = !virtualGamepad.classList.contains("edit-mode");
        setEditLayoutMode(shouldEnable);
    });

    controllerSizeDownButton?.addEventListener("click", () => resizeSelectedVirtualControl(-0.1));
    controllerSizeUpButton?.addEventListener("click", () => resizeSelectedVirtualControl(0.1));
    controllerResetLayoutButton?.addEventListener("click", resetVirtualControllerLayout);

    document.addEventListener("pointermove", handleVirtualControlDragMove);
    document.addEventListener("pointerup", handleVirtualControlDragEnd);
    document.addEventListener("pointercancel", handleVirtualControlDragEnd);
    document.addEventListener("virtual-gamepad-input", handleVirtualDesktopInput);

    document.addEventListener("keydown", handleVirtualControllerKeyDown);
    document.addEventListener("keyup", handleVirtualControllerKeyUp);

    ensureVirtualCursorElement();
    initializeTouchMouseInput();
    requestAnimationFrame(runVirtualDesktopCursorLoop);
    requestAnimationFrame(pollPhysicalGamepad);
}

document.addEventListener("click", (event) => {
    const clickedInsideStart = startMenu.contains(event.target);
    const clickedStartButton = startButton.contains(event.target);
    const clickedDesktopMenu = desktopMenuEl && desktopMenuEl.contains(event.target);
    const clickedQuickSettings = quickSettings.contains(event.target);
    const clickedVolumeButton = volumeButton.contains(event.target);
    const clickedControllerMenu = controllerMenu && controllerMenu.contains(event.target);
    const clickedControllerToggle = controllerMenuToggle && controllerMenuToggle.contains(event.target);
    const clickedClockButton = clockButton && clockButton.contains(event.target);
    const clickedCalendarPanel = calendarPanel && calendarPanel.contains(event.target);
    const clickedThemePanel = desktopThemePanel && desktopThemePanel.contains(event.target);

    if (!clickedInsideStart && !clickedStartButton) {
        startMenu.classList.remove("open");
    }

    if (!clickedDesktopMenu) {
        hideDesktopMenu();
    }

    if (!clickedQuickSettings && !clickedVolumeButton) {
        hideQuickSettings();
    }

    if (!networkInfoPanel?.contains(event.target) && !networkInfoButton?.contains(event.target)) {
        hideNetworkInfoPanel();
    }

    if (!clickedClockButton && !clickedCalendarPanel) {
        hideCalendarPanel();
    }

    if (!clickedThemePanel) {
        hideDesktopThemePanel();
    }

    if (!clickedControllerMenu && !clickedControllerToggle) {
        setControllerMenuOpen(false);
    }
});

window.addEventListener("resize", () => {
    const previousOrientation = document.body.dataset.mobileOrientation || "";
    applyMobileUiFit();
    if (!isTouchMouseModeEnabled()) {
        releaseTouchLeftHold();
    }
    clampVirtualControlsToViewport();
    const orientationChanged = mobileFitState.active
        && previousOrientation
        && previousOrientation !== (document.body.dataset.mobileOrientation || "");
    if (!mobileFitState.active) {
        keepWindowsInsideViewport();
    } else if (orientationChanged) {
        normalizeOpenWindowsForViewport();
    }
    hideDesktopMenu();
    hideQuickSettings();
    hideNetworkInfoPanel();
    hideCalendarPanel();
    hideDesktopThemePanel();
    desktopVirtualPointerState.x = clamp(desktopVirtualPointerState.x, 2, getViewportWidth() - 2);
    desktopVirtualPointerState.y = clamp(desktopVirtualPointerState.y, 2, getViewportHeight() - 2);
    renderVirtualCursor();
});

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
        const previousOrientation = document.body.dataset.mobileOrientation || "";
        applyMobileUiFit();
        if (!isTouchMouseModeEnabled()) {
            releaseTouchLeftHold();
        }
        clampVirtualControlsToViewport();
        const orientationChanged = mobileFitState.active
            && previousOrientation
            && previousOrientation !== (document.body.dataset.mobileOrientation || "");
        if (!mobileFitState.active) {
            keepWindowsInsideViewport();
        } else if (orientationChanged) {
            normalizeOpenWindowsForViewport();
        }
        hideNetworkInfoPanel();
        hideCalendarPanel();
        hideDesktopThemePanel();
    });
}

async function bootstrapApp() {
    applyMobileUiFit();
    clampVirtualControlsToViewport();
    normalizeOpenWindowsForViewport();
    applyLimoreAdminData(await fetchLimoreAdminDataFromServer());
    loadDesktopWallpaperPreference();
    renderCalendar(calendarViewDate);
    initializeScreenWakeLock();
    initializeLockScreen();
    startBootSequence();
    wireLaunchers();
    wireDesktopShortcuts();
    wireDesktopMenu();
    restoreDesktopState();
    initializeVirtualController();
    networkInfoButton?.addEventListener("click", toggleNetworkInfoPanel);
    clockButton?.addEventListener("click", toggleCalendarPanel);
    calendarPrevMonthButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1);
        renderCalendar(calendarViewDate);
    });
    calendarNextMonthButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1);
        renderCalendar(calendarViewDate);
    });
    openWallpaperPanelButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        openDesktopThemePanel();
    });
    closeWallpaperPanelButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        hideDesktopThemePanel();
    });
    blockedRefreshButton?.addEventListener("click", () => {
        refreshLimoreAdminDataFromServer();
        sendClientHeartbeat();
    });
    document.querySelectorAll(".wallpaper-option[data-wallpaper]").forEach((button) => {
        button.addEventListener("click", () => {
            applyDesktopWallpaper(button.dataset.wallpaper || activeWallpaperId);
        });
    });
    powerButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        startMenu.classList.remove("open");
        relockDesktop();
    });
    window.addEventListener("storage", (event) => {
        if (event.key !== LIMORE_ADMIN_DATA_KEY) {
            return;
        }

        applyLimoreAdminData();
        const limoreState = openAppMap.get("gamecloud");
        if (limoreState) {
            refreshLimoreBalance(limoreState.windowEl);
            refreshLimorePackages(limoreState.windowEl);
            updateLimoreCloudWindow(limoreState.windowEl);
        }
        sendClientHeartbeat();
    });
    window.addEventListener("focus", sendClientHeartbeat);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            refreshLimoreAdminDataFromServer();
            sendClientHeartbeat();
        }
    });
    setInterval(refreshLimoreAdminDataFromServer, 15000);
    setInterval(sendClientHeartbeat, 30000);
    volumeButton.addEventListener("click", toggleQuickSettings);
    quickSettings.addEventListener("click", (event) => event.stopPropagation());
    volumeSlider.addEventListener("input", () => syncVolumeUI(volumeSlider.value));
    document.querySelectorAll(".qs-tile").forEach((tile) => {
        tile.addEventListener("click", () => tile.classList.toggle("active"));
    });
    syncVolumeUI(volumeSlider.value);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideQuickSettings();
        }
    });

    setInterval(updateClock, 1000);
    updateClock();
    sendClientHeartbeat();
}

bootstrapApp();

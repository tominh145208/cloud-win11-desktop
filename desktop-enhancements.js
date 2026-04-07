(() => {
    const ROLLOUT_ASSIGNMENT_KEY = "win11_rollout_assignment_v1";
    const rolloutState = (() => {
        if (window.__LIMORE_ROLLOUT && typeof window.__LIMORE_ROLLOUT === "object") {
            return window.__LIMORE_ROLLOUT;
        }
        try {
            const raw = localStorage.getItem(ROLLOUT_ASSIGNMENT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    })();
    const rolloutChannel = String(rolloutState?.channel || "latest").trim().toLowerCase();
    if (rolloutChannel && rolloutChannel !== "latest") {
        return;
    }

    const desktopIconsEl = document.getElementById("desktop-icons");
    const desktopSelectionBoxEl = document.getElementById("desktop-selection-box");
    const shortcutContextMenuEl = document.getElementById("shortcut-context-menu");
    const searchPanelEl = document.getElementById("search-panel");
    const searchPanelInputEl = document.getElementById("search-panel-input");
    const searchPanelResultsEl = document.getElementById("search-panel-results");
    const widgetsBoardEl = document.getElementById("widgets-board");
    const taskViewPanelEl = document.getElementById("task-view-panel");
    const taskViewGridEl = document.getElementById("task-view-grid");
    const virtualDesktopsEl = document.getElementById("virtual-desktops");
    const notificationCenterEl = document.getElementById("notification-center");
    const notificationHistoryEl = document.getElementById("notification-history");
    const notificationCenterDateEl = document.getElementById("notification-center-date");
    const clearNotificationsButtonEl = document.getElementById("clear-notifications-button");
    const runDialogEl = document.getElementById("run-dialog");
    const runDialogInputEl = document.getElementById("run-dialog-input");
    const runDialogOkButtonEl = document.getElementById("run-dialog-ok");
    const runDialogCancelButtonEl = document.getElementById("run-dialog-cancel");
    const powerMenuEl = document.getElementById("power-menu");
    const winxMenuEl = document.getElementById("winx-menu");
    const taskbarPreviewEl = document.getElementById("taskbar-preview");
    const toastContainerEl = document.getElementById("toast-container");
    const snapAssistOverlayEl = document.getElementById("snap-assist-overlay");
    const altTabOverlayEl = document.getElementById("alt-tab-overlay");
    const taskbarSearchButtonEl = document.getElementById("taskbar-search-button");
    const widgetsButtonEl = document.getElementById("widgets-button");
    const taskViewButtonEl = document.getElementById("task-view-button");
    const trayFlyoutButtonEl = document.getElementById("tray-flyout-button");
    const startPinnedGridEl = document.getElementById("start-pinned-grid");
    const brightnessSliderEl = document.getElementById("brightness-slider");
    const brightnessValueEl = document.getElementById("brightness-value");
    const brightnessStatusBadgeEl = document.getElementById("brightness-status-badge");
    const batteryStatusBadgeEl = document.getElementById("battery-status-badge");
    const openTaskmanagerButtonEl = document.getElementById("open-taskmanager-button");
    const openSysteminfoButtonEl = document.getElementById("open-systeminfo-button");
    const widgetOpenAppsEl = document.getElementById("widget-open-apps");
    const powerButtonEl = document.querySelector(".start-footer .fa-power-off");

    const ICONS_KEY = "win11_desktop_icons_enhanced_v1";
    const RECYCLE_KEY = "win11_recycle_bin_enhanced_v1";
    const NOTIFY_KEY = "win11_notifications_enhanced_v1";
    const PINS_KEY = "win11_start_pins_enhanced_v1";
    const SETTINGS_KEY = "win11_system_settings_enhanced_v1";
    const VIRTUAL_DESKTOP_KEY = "win11_virtual_desktop_enhanced_v1";
    const SYSTEM_SOUNDS_ENABLED = false;

    const desktopDefaults = [
        { id: "desktop-thispc", appId: "thispc", title: "This PC", icon: "assets/this-pc-custom-v3.png", system: true, hidden: false, x: 20, y: 20 },
        { id: "desktop-recycle", appId: "recycle", title: "Recycle Bin", icon: "assets/recycle-bin-custom-v3.png", system: true, hidden: false, x: 20, y: 128 },
        { id: "desktop-chrome", appId: "chrome", title: "Chrome", icon: "https://img.icons8.com/color/48/chrome--v1.png", system: false, hidden: false, x: 20, y: 236 },
        { id: "desktop-gamecloud", appId: "gamecloud", title: "Limore Cloud", icon: "assets/game-cloud.webp", system: false, hidden: false, x: 20, y: 344 }
    ];

    let desktopIconsState = loadJson(ICONS_KEY, desktopDefaults);
    let recycleBinItems = loadJson(RECYCLE_KEY, []);
    let notificationItems = loadJson(NOTIFY_KEY, []);
    let pinnedStartApps = loadJson(PINS_KEY, ["edge", "word", "settings", "files", "chrome", "gamecloud"]);
    let systemSettings = loadJson(SETTINGS_KEY, {
        wifi: true,
        bluetooth: true,
        airplane: false,
        nightlight: true,
        accessibility: false,
        battery: true,
        brightness: 80
    });
    let currentVirtualDesktopId = loadJson(VIRTUAL_DESKTOP_KEY, "desktop-1");
    let selectedDesktopItemIds = [];
    let altTabIndex = 0;
    let altTabVisible = false;

    function loadJson(key, fallbackValue) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallbackValue;
        } catch (error) {
            return fallbackValue;
        }
    }

    function saveJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            // Ignore storage failures.
        }
    }

    function hideExtraPanels() {
        searchPanelEl?.classList.remove("open");
        widgetsBoardEl?.classList.remove("open");
        taskViewPanelEl?.classList.remove("open");
        notificationCenterEl?.classList.remove("open");
        shortcutContextMenuEl?.classList.remove("open");
        taskbarPreviewEl?.classList.remove("open");
        snapAssistOverlayEl?.classList.remove("open");
        setRunDialogVisibility(false);
        powerMenuEl?.classList.remove("open");
        winxMenuEl?.classList.remove("open");
    }

    function setRunDialogVisibility(isOpen) {
        if (!runDialogEl) {
            return;
        }

        runDialogEl.classList.toggle("is-open", isOpen);
        runDialogEl.setAttribute("aria-hidden", isOpen ? "false" : "true");
        runDialogEl.style.display = isOpen ? "grid" : "none";

        if (isOpen) {
            runDialogEl.removeAttribute("hidden");
            if (runDialogInputEl) {
                runDialogInputEl.value = "";
                window.requestAnimationFrame(() => runDialogInputEl.focus());
            }
            return;
        }

        runDialogEl.setAttribute("hidden", "");
        if (runDialogInputEl) {
            runDialogInputEl.value = "";
            runDialogInputEl.blur();
        }
    }

    function playSound(kind = "notify") {
        if (!SYSTEM_SOUNDS_ENABLED) {
            return;
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }
        try {
            if (!playSound.ctx) {
                playSound.ctx = new AudioContextClass();
            }
            const ctx = playSound.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const profile = {
                notify: [820, 1040],
                open: [620, 780],
                delete: [460, 260],
                error: [320, 220],
                lock: [520, 300]
            }[kind] || [620, 780];
            const now = ctx.currentTime;
            osc.type = kind === "error" ? "square" : "sine";
            osc.frequency.setValueAtTime(profile[0], now);
            osc.frequency.linearRampToValueAtTime(profile[1], now + 0.12);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (error) {
            // Ignore audio failures.
        }
    }

    function pushNotification(title, message, tone = "notify") {
        const item = {
            id: `notify-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            title,
            message,
            time: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };
        notificationItems = [item, ...notificationItems].slice(0, 40);
        saveJson(NOTIFY_KEY, notificationItems);
        renderNotifications();
        renderToast(item);
        playSound(tone);
    }

    function renderToast(item) {
        if (!toastContainerEl) {
            return;
        }
        const toast = document.createElement("article");
        toast.className = "toast-card";
        toast.innerHTML = `<strong>${item.title}</strong><p>${item.message}</p><span>${item.time}</span>`;
        toastContainerEl.prepend(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        window.setTimeout(() => {
            toast.classList.remove("show");
            window.setTimeout(() => toast.remove(), 220);
        }, 3200);
    }

    function renderNotifications() {
        if (!notificationHistoryEl) {
            return;
        }
        if (notificationCenterDateEl) {
            notificationCenterDateEl.textContent = new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long"
            });
        }
        notificationHistoryEl.innerHTML = notificationItems.map((item) => `
            <article class="notification-card">
                <div class="notification-card-header">
                    <strong>${item.title}</strong>
                    <span>${item.time}</span>
                </div>
                <p>${item.message}</p>
            </article>
        `).join("") || `<div class="notification-empty"><strong>Khong co thong bao</strong><span>Lich su thong bao se hien o day.</span></div>`;
    }

    function saveDesktopIcons() {
        saveJson(ICONS_KEY, desktopIconsState);
    }

    function saveRecycleBin() {
        saveJson(RECYCLE_KEY, recycleBinItems);
    }

    function savePins() {
        saveJson(PINS_KEY, pinnedStartApps);
    }

    function saveSettings() {
        saveJson(SETTINGS_KEY, systemSettings);
    }

    function getDesktopItem(itemId) {
        return desktopIconsState.find((item) => item.id === itemId) || null;
    }

    function arrangeDesktopIcons() {
        const desktopHeight = Math.max(560, desktop?.clientHeight || 720);
        let x = 20;
        let y = 20;
        desktopIconsState.filter((item) => !item.hidden).forEach((item) => {
            item.x = x;
            item.y = y;
            y += 108;
            if (y > desktopHeight - 120) {
                y = 20;
                x += 104;
            }
        });
    }

    function renderDesktopIcons() {
        if (!desktopIconsEl) {
            return;
        }

        desktopIconsEl.innerHTML = desktopIconsState.filter((item) => !item.hidden).map((item) => `
            <button
                type="button"
                class="shortcut app-launcher${selectedDesktopItemIds.includes(item.id) ? " is-selected" : ""}"
                data-app="${item.appId}"
                data-item-id="${item.id}"
                style="left:${Math.round(item.x)}px;top:${Math.round(item.y)}px;"
            >
                <img src="${item.appId === "recycle" && recycleBinItems.length ? "assets/recycle-bin-custom-v2.png" : item.icon}" alt="${item.title}">
                <span>${item.title}</span>
            </button>
        `).join("");

        bindDesktopShortcuts();
    }

    function renderPinnedStartApps() {
        if (!startPinnedGridEl) {
            return;
        }

        startPinnedGridEl.innerHTML = pinnedStartApps.filter((appId) => appCatalog[appId]).map((appId) => {
            const app = getAppInfo(appId);
            return `
                <div class="item app-launcher" data-app="${appId}">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>${app.name}</span>
                </div>
            `;
        }).join("");

        if (typeof wireLaunchers === "function") {
            wireLaunchers();
        }
    }

    function setDesktopSelection(itemIds = []) {
        selectedDesktopItemIds = itemIds;
        desktopIconsEl?.querySelectorAll(".shortcut[data-item-id]").forEach((shortcut) => {
            shortcut.classList.toggle("is-selected", selectedDesktopItemIds.includes(shortcut.dataset.itemId || ""));
        });
    }

    function clearDesktopSelection() {
        setDesktopSelection([]);
    }

    function renameDesktopShortcut(itemId) {
        const item = getDesktopItem(itemId);
        if (!item) {
            return;
        }

        const nextName = window.prompt("Doi ten shortcut", item.title);
        if (!nextName) {
            return;
        }

        item.title = String(nextName).trim() || item.title;
        saveDesktopIcons();
        renderDesktopIcons();
        pushNotification("Desktop", `Da doi ten shortcut thanh ${item.title}.`);
    }

    function moveShortcutToRecycleBin(itemId) {
        const item = getDesktopItem(itemId);
        if (!item || item.appId === "recycle") {
            return;
        }

        item.hidden = true;
        recycleBinItems.unshift({
            id: `rb-${Date.now().toString(36)}`,
            desktopItemId: item.id,
            title: item.title,
            icon: item.icon,
            appId: item.appId,
            deletedAt: new Date().toISOString()
        });
        saveDesktopIcons();
        saveRecycleBin();
        renderDesktopIcons();
        refreshRecycleBinWindows();
        clearDesktopSelection();
        pushNotification("Recycle Bin", `${item.title} da duoc chuyen vao thung rac.`, "delete");
    }

    function restoreRecycleItem(recycleId) {
        const recycleIndex = recycleBinItems.findIndex((item) => item.id === recycleId);
        if (recycleIndex < 0) {
            return;
        }

        const [recycleItem] = recycleBinItems.splice(recycleIndex, 1);
        const desktopItem = getDesktopItem(recycleItem.desktopItemId);
        if (desktopItem) {
            desktopItem.hidden = false;
            arrangeDesktopIcons();
            saveDesktopIcons();
            renderDesktopIcons();
        }
        saveRecycleBin();
        refreshRecycleBinWindows();
        pushNotification("Recycle Bin", `${recycleItem.title} da duoc khoi phuc.`);
    }

    function emptyRecycleBin() {
        recycleBinItems = [];
        saveRecycleBin();
        refreshRecycleBinWindows();
        renderDesktopIcons();
        pushNotification("Recycle Bin", "Thung rac da duoc lam trong.");
    }

    function pinAppToStart(appId) {
        if (!appCatalog[appId] || pinnedStartApps.includes(appId)) {
            return;
        }
        pinnedStartApps.push(appId);
        savePins();
        renderPinnedStartApps();
        pushNotification("Start", `${getAppInfo(appId).name} da duoc ghim vao Start.`);
    }

    function unpinAppFromStart(appId) {
        pinnedStartApps = pinnedStartApps.filter((value) => value !== appId);
        savePins();
        renderPinnedStartApps();
        pushNotification("Start", `${getAppInfo(appId).name} da duoc bo ghim khoi Start.`);
    }

    function renderSearchResults(query = "") {
        if (!searchPanelResultsEl) {
            return;
        }

        const normalized = String(query || "").trim().toLowerCase();
        const results = [
            ...Object.keys(appCatalog).filter((appId) => !normalized || appCatalog[appId].name.toLowerCase().includes(normalized)).map((appId) => ({
                kind: "app",
                id: appId,
                icon: getAppInfo(appId).icon,
                title: getAppInfo(appId).name,
                subtitle: "Desktop app"
            })),
            ...desktopIconsState.filter((item) => !item.hidden && (!normalized || item.title.toLowerCase().includes(normalized))).map((item) => ({
                kind: "desktop",
                id: item.id,
                icon: item.icon,
                title: item.title,
                subtitle: "Desktop shortcut"
            })),
            ...["chrome", "explorer", "taskmgr", "photos"].filter((entry) => !normalized || entry.includes(normalized)).map((entry) => ({
                kind: "run",
                id: entry,
                icon: "https://img.icons8.com/fluency/48/run-command.png",
                title: entry,
                subtitle: "Run command"
            }))
        ].slice(0, 12);

        searchPanelResultsEl.innerHTML = results.map((item) => `
            <button type="button" class="search-result" data-result-kind="${item.kind}" data-result-id="${item.id}">
                <img src="${item.icon}" alt="${item.title}">
                <span><strong>${item.title}</strong><small>${item.subtitle}</small></span>
            </button>
        `).join("") || `<div class="notification-empty"><strong>Khong tim thay ket qua</strong><span>Thu tim bang tu khoa khac.</span></div>`;
    }

    function openRunDialog() {
        hideExtraPanels();
        setRunDialogVisibility(true);
    }

    function runCommand(commandText = "") {
        const command = String(commandText || "").trim().toLowerCase();
        const handlers = {
            chrome: () => openApp("chrome"),
            explorer: () => openApp("thispc"),
            taskmgr: () => openApp("taskmanager"),
            photos: () => openApp("photos"),
            settings: () => openApp("settings")
        };
        const handler = handlers[command];
        if (!handler) {
            pushNotification("Run", `Khong tim thay lenh ${commandText}.`, "error");
            return;
        }
        handler();
        setRunDialogVisibility(false);
    }

    function syncQuickSettingsUi() {
        document.querySelectorAll(".qs-tile[data-toggle-setting]").forEach((tile) => {
            const key = tile.dataset.toggleSetting;
            tile.classList.toggle("active", Boolean(systemSettings[key]));
        });
        if (brightnessSliderEl) {
            brightnessSliderEl.value = String(systemSettings.brightness || 80);
        }
        if (brightnessValueEl) {
            brightnessValueEl.textContent = String(systemSettings.brightness || 80);
        }
        if (brightnessStatusBadgeEl) {
            brightnessStatusBadgeEl.textContent = `${systemSettings.brightness || 80}%`;
        }
        if (batteryStatusBadgeEl) {
            batteryStatusBadgeEl.textContent = systemSettings.battery ? "Saver" : "97%";
        }
        document.documentElement.style.setProperty("--desktop-brightness", String((systemSettings.brightness || 80) / 100));
    }

    function refreshRecycleBinWindows() {
        document.querySelectorAll(".recycle-bin-list").forEach((listEl) => {
            listEl.innerHTML = recycleBinItems.map((item) => `
                <div class="recycle-row">
                    <div class="recycle-row-main">
                        <img src="${item.icon}" alt="${item.title}">
                        <span><strong>${item.title}</strong><small>${new Date(item.deletedAt).toLocaleString("vi-VN")}</small></span>
                    </div>
                    <button type="button" data-restore-item="${item.id}">Restore</button>
                </div>
            `).join("") || `<div class="notification-empty"><strong>Recycle Bin trong</strong><span>Shortcut bi xoa se hien tai day.</span></div>`;
        });

        document.querySelectorAll("[data-restore-item]").forEach((button) => {
            button.onclick = () => restoreRecycleItem(button.dataset.restoreItem || "");
        });
    }

    function buildRecycleMarkup(app) {
        return `
            <div class="window-titlebar">
                <div class="window-title">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>Recycle Bin</span>
                </div>
                <div class="window-actions">
                    <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                    <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="window-body recycle-window-body">
                <div class="recycle-toolbar">
                    <button type="button" class="recycle-action" data-recycle-empty="1">Empty Recycle Bin</button>
                </div>
                <div class="recycle-bin-list"></div>
            </div>
        `;
    }

    function buildPhotosMarkup(app) {
        const photos = [
            { src: "assets/windows-11-black-wallpaper-2400x1350_50.jpg", label: "Windows Dark" },
            { src: "assets/wukong-hero.jpg", label: "Wukong Hero" },
            { src: "assets/gta5-hero.jpg", label: "GTA V Hero" },
            { src: "assets/gta5-shot-1.jpg", label: "GTA V Shot 1" },
            { src: "assets/wukong-shot-1.jpg", label: "Wukong Shot 1" }
        ];
        return `
            <div class="window-titlebar">
                <div class="window-title">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>Photos</span>
                </div>
                <div class="window-actions">
                    <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                    <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="window-body photos-window-body">
                <div class="photos-hero">
                    <img class="photos-main-image" src="${photos[0].src}" alt="${photos[0].label}">
                    <div class="photos-hero-copy">
                        <strong class="photos-main-title">${photos[0].label}</strong>
                        <span>Gallery tu thu muc assets</span>
                    </div>
                </div>
                <div class="photos-grid">
                    ${photos.map((photo) => `
                        <button type="button" class="photos-thumb" data-photo-src="${photo.src}" data-photo-title="${photo.label}">
                            <img src="${photo.src}" alt="${photo.label}">
                            <span>${photo.label}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function buildTaskManagerMarkup(app) {
        return `
            <div class="window-titlebar">
                <div class="window-title">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>Task Manager</span>
                </div>
                <div class="window-actions">
                    <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                    <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="window-body task-manager-body">
                <div class="task-manager-summary">
                    <div class="task-manager-stat"><span>CPU</span><strong>34%</strong></div>
                    <div class="task-manager-stat"><span>Memory</span><strong>4.8 GB</strong></div>
                    <div class="task-manager-stat"><span>GPU</span><strong>21%</strong></div>
                    <div class="task-manager-stat"><span>Network</span><strong>18 Mbps</strong></div>
                </div>
                <div class="task-manager-table">
                    <div class="task-manager-row header">
                        <span>Name</span><span>Status</span><span>Desktop</span><span>Memory</span><span>Action</span>
                    </div>
                    <div class="task-manager-process-list"></div>
                </div>
            </div>
        `;
    }

    function buildSystemInfoMarkup(app, options = {}) {
        const item = options.customState?.item || null;
        const propertiesMode = options.customState?.mode === "properties";
        return `
            <div class="window-titlebar">
                <div class="window-title">
                    <img src="${app.icon}" alt="${app.name}">
                    <span>${propertiesMode ? "Properties" : "About This PC"}</span>
                </div>
                <div class="window-actions">
                    <button class="window-btn minimize" type="button" aria-label="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="window-btn maximize" type="button" aria-label="Maximize"><i class="far fa-square"></i></button>
                    <button class="window-btn close" type="button" aria-label="Close"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="window-body system-info-body">
                <div class="system-panel-card">
                    <h2>${propertiesMode ? item?.title || "Shortcut" : "Windows 11 Dark Edition"}</h2>
                    <p>${propertiesMode ? "Thuoc tinh shortcut tren desktop." : "Thong tin he thong gia lap theo phong cach Windows 11."}</p>
                    <div class="system-info-list">
                        <div><span>Device name</span><strong>${getCurrentDesktopUser().desktopName}-PC</strong></div>
                        <div><span>Processor</span><strong>AMD Ryzen 9 7950X3D</strong></div>
                        <div><span>Installed RAM</span><strong>64.0 GB</strong></div>
                        <div><span>System type</span><strong>64-bit operating system</strong></div>
                        <div><span>Target</span><strong>${propertiesMode ? item?.appId || "-" : "Windows mock desktop"}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }

    function wireCustomWindow(appId, windowEl) {
        if (appId === "photos") {
            windowEl.querySelectorAll(".photos-thumb[data-photo-src]").forEach((button) => {
                button.addEventListener("click", () => {
                    const mainImage = windowEl.querySelector(".photos-main-image");
                    const mainTitle = windowEl.querySelector(".photos-main-title");
                    const titleText = button.dataset.photoTitle || "Photo";
                    if (mainImage) {
                        mainImage.src = button.dataset.photoSrc || "";
                        mainImage.alt = titleText;
                    }
                    if (mainTitle) {
                        mainTitle.textContent = titleText;
                    }
                    const titleLabel = windowEl.querySelector(".window-title span");
                    if (titleLabel) {
                        titleLabel.textContent = `Photos - ${titleText}`;
                    }
                });
            });
        }
        if (appId === "recycle") {
            windowEl.querySelector("[data-recycle-empty]")?.addEventListener("click", emptyRecycleBin);
            refreshRecycleBinWindows();
        }
    }

    function refreshTaskManagerWindows() {
        document.querySelectorAll(".task-manager-process-list").forEach((listEl) => {
            listEl.innerHTML = Array.from(openAppMap.values()).map((state, index) => `
                <div class="task-manager-row">
                    <span>${getAppInfo(state.appId).name}</span>
                    <span>${state.windowEl.classList.contains("minimized") ? "Background" : "Running"}</span>
                    <span>${(state.desktopId || "desktop-1").replace("-", " ")}</span>
                    <span>${180 + index * 96} MB</span>
                    <button type="button" data-end-task="${state.appId}">End task</button>
                </div>
            `).join("") || `<div class="task-manager-row"><span>Khong co app nao</span><span>-</span><span>-</span><span>0 MB</span><span>-</span></div>`;
            listEl.querySelectorAll("[data-end-task]").forEach((button) => {
                button.onclick = () => closeApp(button.dataset.endTask || "");
            });
        });

        if (widgetOpenAppsEl) {
            const count = Array.from(openAppMap.values()).filter((state) => (state.desktopId || "desktop-1") === currentVirtualDesktopId).length;
            widgetOpenAppsEl.textContent = `${count} apps`;
        }
    }

    function applyVirtualDesktopVisibility() {
        openAppMap.forEach((state) => {
            const visible = (state.desktopId || "desktop-1") === currentVirtualDesktopId;
            state.windowEl.classList.toggle("virtual-hidden", !visible);
            if (state.runningEl) {
                state.runningEl.classList.toggle("virtual-hidden", !visible);
            }
        });
        refreshTaskManagerWindows();
    }

    function renderTaskView() {
        if (!taskViewGridEl || !virtualDesktopsEl) {
            return;
        }
        const visibleStates = Array.from(openAppMap.values()).filter((state) => (state.desktopId || "desktop-1") === currentVirtualDesktopId);
        taskViewGridEl.innerHTML = visibleStates.map((state) => `
            <button type="button" class="task-view-card" data-focus-app="${state.appId}">
                <div class="task-view-card-top">
                    <img src="${getAppInfo(state.appId).icon}" alt="${getAppInfo(state.appId).name}">
                    <span>${getAppInfo(state.appId).name}</span>
                </div>
                <div class="task-view-card-preview">${getAppInfo(state.appId).description}</div>
            </button>
        `).join("") || `<div class="notification-empty"><strong>Desktop nay chua co app nao</strong><span>Mo them cua so de hien trong Task View.</span></div>`;

        virtualDesktopsEl.innerHTML = ["desktop-1", "desktop-2"].map((desktopId, index) => `
            <button type="button" class="virtual-desktop-chip${desktopId === currentVirtualDesktopId ? " active" : ""}" data-switch-desktop="${desktopId}">
                Desktop ${index + 1}
            </button>
        `).join("");

        taskViewGridEl.querySelectorAll("[data-focus-app]").forEach((button) => {
            button.onclick = () => {
                focusApp(button.dataset.focusApp || "");
                taskViewPanelEl?.classList.remove("open");
            };
        });
        virtualDesktopsEl.querySelectorAll("[data-switch-desktop]").forEach((button) => {
            button.onclick = () => {
                currentVirtualDesktopId = button.dataset.switchDesktop || "desktop-1";
                saveJson(VIRTUAL_DESKTOP_KEY, currentVirtualDesktopId);
                applyVirtualDesktopVisibility();
                renderTaskView();
                pushNotification("Desktop", `Da chuyen sang ${button.textContent.trim()}.`);
            };
        });
    }

    function showShortcutMenu(x, y, itemId) {
        const item = getDesktopItem(itemId);
        if (!item || !shortcutContextMenuEl) {
            return;
        }
        const pinned = pinnedStartApps.includes(item.appId);
        shortcutContextMenuEl.innerHTML = `
            <button type="button" data-shortcut-action="open" data-item-id="${item.id}"><i class="fas fa-folder-open"></i><span>Open</span></button>
            <button type="button" data-shortcut-action="rename" data-item-id="${item.id}"><i class="fas fa-i-cursor"></i><span>Rename</span></button>
            <button type="button" data-shortcut-action="${pinned ? "unpin" : "pin"}" data-item-id="${item.id}"><i class="fas fa-thumbtack"></i><span>${pinned ? "Unpin from Start" : "Pin to Start"}</span></button>
            <button type="button" data-shortcut-action="properties" data-item-id="${item.id}"><i class="fas fa-circle-info"></i><span>Properties</span></button>
            ${item.appId !== "recycle" ? `<button type="button" data-shortcut-action="delete" data-item-id="${item.id}"><i class="far fa-trash-can"></i><span>Delete</span></button>` : ""}
        `;
        shortcutContextMenuEl.classList.add("open");
        shortcutContextMenuEl.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
        shortcutContextMenuEl.style.top = `${Math.min(y, window.innerHeight - 260)}px`;
    }

    function bindDesktopShortcuts() {
        desktopIconsEl?.querySelectorAll(".shortcut[data-item-id]").forEach((shortcut) => {
            shortcut.addEventListener("click", (event) => {
                event.stopPropagation();
                const itemId = shortcut.dataset.itemId || "";
                if (event.ctrlKey || event.metaKey) {
                    const nextSet = new Set(selectedDesktopItemIds);
                    if (nextSet.has(itemId)) {
                        nextSet.delete(itemId);
                    } else {
                        nextSet.add(itemId);
                    }
                    setDesktopSelection([...nextSet]);
                    return;
                }
                setDesktopSelection([itemId]);
            });
            shortcut.addEventListener("dblclick", (event) => {
                event.stopPropagation();
                const appId = shortcut.dataset.app || "";
                if (appId) {
                    openApp(appId);
                }
            });
            shortcut.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                event.stopPropagation();
                setDesktopSelection([shortcut.dataset.itemId || ""]);
                showShortcutMenu(event.clientX, event.clientY, shortcut.dataset.itemId || "");
            });
        });
    }

    function bindDesktopSelectionMarquee() {
        if (!desktop || !desktopSelectionBoxEl) {
            return;
        }
        desktop.addEventListener("pointerdown", (event) => {
            if (document.body.classList.contains("mobile-fit")) {
                desktopSelectionBoxEl.hidden = true;
                return;
            }
            if (event.pointerType && event.pointerType !== "mouse") {
                desktopSelectionBoxEl.hidden = true;
                return;
            }
            if (event.target.closest(".shortcut, .app-window, .desktop-context-menu, .shortcut-context-menu")) {
                return;
            }
            const startX = event.clientX;
            const startY = event.clientY;
            desktopSelectionBoxEl.hidden = false;
            desktopSelectionBoxEl.style.left = `${startX}px`;
            desktopSelectionBoxEl.style.top = `${startY}px`;
            desktopSelectionBoxEl.style.width = "0px";
            desktopSelectionBoxEl.style.height = "0px";

            const onMove = (moveEvent) => {
                const x = Math.min(startX, moveEvent.clientX);
                const y = Math.min(startY, moveEvent.clientY);
                const width = Math.abs(moveEvent.clientX - startX);
                const height = Math.abs(moveEvent.clientY - startY);
                desktopSelectionBoxEl.style.left = `${x}px`;
                desktopSelectionBoxEl.style.top = `${y}px`;
                desktopSelectionBoxEl.style.width = `${width}px`;
                desktopSelectionBoxEl.style.height = `${height}px`;
                const selectedIds = [];
                desktopIconsEl?.querySelectorAll(".shortcut[data-item-id]").forEach((shortcut) => {
                    const rect = shortcut.getBoundingClientRect();
                    const intersects = rect.left < x + width && rect.right > x && rect.top < y + height && rect.bottom > y;
                    if (intersects) {
                        selectedIds.push(shortcut.dataset.itemId || "");
                    }
                });
                setDesktopSelection(selectedIds);
            };

            const onUp = () => {
                desktopSelectionBoxEl.hidden = true;
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
                document.removeEventListener("pointercancel", onUp);
            };

            document.addEventListener("pointermove", onMove);
            document.addEventListener("pointerup", onUp);
            document.addEventListener("pointercancel", onUp);
        });
    }

    function getTaskbarPreviewImage(state) {
        if (state.appId === "gamecloud") {
            return {
                type: "icon",
                value: getAppInfo(state.appId).icon
            };
        }

        const imageSelectors = [
            ".game-hero-image",
            ".photos-main-image",
            ".photos-grid img",
            ".game-cover-image",
            ".window-body img",
            ".chrome-webview",
            ".window-title img"
        ];

        for (const selector of imageSelectors) {
            const candidate = state.windowEl.querySelector(selector);
            if (!candidate) {
                continue;
            }

            if (candidate.tagName === "IMG" && candidate.getAttribute("src")) {
                return {
                    type: "image",
                    value: candidate.getAttribute("src")
                };
            }
        }

        return {
            type: "icon",
            value: getAppInfo(state.appId).icon
        };
    }

    function setupPreviewTooltips() {
        const supportsHoverPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!supportsHoverPreview) {
            if (taskbarPreviewEl) {
                taskbarPreviewEl.classList.remove("open");
            }
            return;
        }

        let previewCloseTimer = 0;

        const schedulePreviewClose = (delayMs = 420) => {
            if (!taskbarPreviewEl) {
                return;
            }
            if (previewCloseTimer) {
                window.clearTimeout(previewCloseTimer);
            }
            previewCloseTimer = window.setTimeout(() => {
                taskbarPreviewEl.classList.remove("open");
            }, delayMs);
        };

        const keepPreviewOpen = () => {
            if (previewCloseTimer) {
                window.clearTimeout(previewCloseTimer);
                previewCloseTimer = 0;
            }
        };

        document.addEventListener("mouseover", (event) => {
            const button = event.target.closest(".taskbar-app, .running-task-icon");
            if (!button || !taskbarPreviewEl) {
                return;
            }
            keepPreviewOpen();
            const appId = button.dataset.app || "";
            const states = Array.from(openAppMap.values()).filter((state) => getTaskbarAppId(state.appId) === appId);
            if (!states.length) {
                return;
            }
            taskbarPreviewEl.innerHTML = states.map((state) => {
                const previewAsset = getTaskbarPreviewImage(state);
                return `
                    <button type="button" class="taskbar-preview-card" data-preview-focus="${state.appId}">
                        <div class="taskbar-preview-thumb${previewAsset.type === "image" ? " has-image" : ""}"${previewAsset.type === "image" ? ` style="background-image:url('${previewAsset.value}')"` : ""}>
                            ${previewAsset.type === "icon" ? `<img src="${previewAsset.value}" alt="${getAppInfo(state.appId).name}">` : ""}
                        </div>
                        <div class="taskbar-preview-copy">
                            <strong>${getAppInfo(state.appId).name}</strong>
                            <span>${state.windowEl.classList.contains("minimized") ? "Minimized" : "Running"}</span>
                        </div>
                    </button>
                `;
            }).join("");
            const rect = button.getBoundingClientRect();
            const previewWidth = taskbarPreviewEl.offsetWidth || 260;
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            const targetLeft = rect.left + rect.width / 2 - previewWidth / 2;
            const clampedLeft = Math.max(10, Math.min(targetLeft, viewportWidth - previewWidth - 10));
            taskbarPreviewEl.style.left = `${clampedLeft}px`;
            taskbarPreviewEl.style.bottom = "40px";
            taskbarPreviewEl.classList.add("open");
            taskbarPreviewEl.querySelectorAll("[data-preview-focus]").forEach((previewButton) => {
                previewButton.onclick = () => focusApp(previewButton.dataset.previewFocus || "");
            });
        });

        document.addEventListener("mouseout", (event) => {
            if (!event.relatedTarget || !event.target.closest(".taskbar-app, .running-task-icon")) {
                return;
            }
            if (!event.relatedTarget.closest(".taskbar-preview")) {
                schedulePreviewClose();
            }
        });

        taskbarPreviewEl?.addEventListener("mouseenter", keepPreviewOpen);
        taskbarPreviewEl?.addEventListener("mouseleave", () => schedulePreviewClose(300));
    }

    const originalBuildWindow = buildWindow;
    buildWindow = function enhancedBuildWindow(appId, options = {}) {
        if (appId === "recycle" || appId === "photos" || appId === "taskmanager" || appId === "systeminfo") {
            const app = getAppInfo(appId);
            const bounds = getDesktopBounds();
            const windowEl = document.createElement("div");
            windowEl.className = "app-window";
            windowEl.dataset.app = appId;
            windowEl.style.left = "120px";
            windowEl.style.top = "80px";
            windowEl.style.width = "860px";
            windowEl.style.height = appId === "photos" ? "620px" : "560px";
            windowEl.innerHTML = appId === "recycle"
                ? buildRecycleMarkup(app)
                : appId === "photos"
                    ? buildPhotosMarkup(app)
                    : appId === "taskmanager"
                        ? buildTaskManagerMarkup(app)
                        : buildSystemInfoMarkup(app, options);
            if (options.restoreState?.rect) {
                const rect = options.restoreState.rect;
                windowEl.style.left = `${Math.min(Math.max(rect.left, 8), bounds.width - rect.width - 8)}px`;
                windowEl.style.top = `${Math.min(Math.max(rect.top, 8), bounds.height - rect.height - 8)}px`;
                windowEl.style.width = `${Math.min(rect.width, bounds.width)}px`;
                windowEl.style.height = `${Math.min(rect.height, bounds.height)}px`;
            }
            attachWindowInteractions(windowEl, appId);
            syncMaximizeButtons(windowEl, false);
            wireCustomWindow(appId, windowEl);
            return windowEl;
        }
        return originalBuildWindow(appId, options);
    };

    const originalOpenApp = openApp;
    openApp = function enhancedOpenApp(appId, options = {}) {
        if (options.customState && openAppMap.has(appId)) {
            originalCloseApp(appId);
        }
        originalOpenApp(appId, options);
        const state = openAppMap.get(appId);
        if (state) {
            if (!state.desktopId) {
                state.desktopId = currentVirtualDesktopId;
            }
            state.customState = options.customState || state.customState || null;
        }
        applyVirtualDesktopVisibility();
        refreshTaskManagerWindows();
        playSound("open");
    };

    const originalCloseApp = closeApp;
    closeApp = function enhancedCloseApp(appId) {
        originalCloseApp(appId);
        refreshTaskManagerWindows();
        renderTaskView();
    };

    const originalApplySnapLayout = applySnapLayout;
    applySnapLayout = function enhancedSnapLayout(appId, layout) {
        originalApplySnapLayout(appId, layout);
        renderTaskView();
        const remaining = Array.from(openAppMap.values()).filter((state) => state.appId !== appId && (state.desktopId || "desktop-1") === currentVirtualDesktopId);
        if (!remaining.length || !snapAssistOverlayEl) {
            return;
        }
        snapAssistOverlayEl.innerHTML = remaining.map((state) => `
            <button type="button" class="snap-assist-card" data-assist-app="${state.appId}">
                <img src="${getAppInfo(state.appId).icon}" alt="${getAppInfo(state.appId).name}">
                <strong>${getAppInfo(state.appId).name}</strong>
                <span>Snap vao khung con lai</span>
            </button>
        `).join("");
        snapAssistOverlayEl.classList.add("open");
        const targetLayout = layout === "left" ? "right" : layout === "right" ? "left" : layout === "topLeft" ? "topRight" : layout === "topRight" ? "topLeft" : layout === "bottomLeft" ? "bottomRight" : "bottomLeft";
        snapAssistOverlayEl.querySelectorAll("[data-assist-app]").forEach((button) => {
            button.onclick = () => {
                originalApplySnapLayout(button.dataset.assistApp || "", targetLayout);
                snapAssistOverlayEl.classList.remove("open");
            };
        });
    };

    function initializeEnhancements() {
        setRunDialogVisibility(false);
        arrangeDesktopIcons();
        renderDesktopIcons();
        renderPinnedStartApps();
        renderNotifications();
        syncQuickSettingsUi();
        bindDesktopSelectionMarquee();
        refreshTaskManagerWindows();
        renderTaskView();
        applyVirtualDesktopVisibility();
        setupPreviewTooltips();

        if (desktopMenuEl) {
            desktopMenuEl.insertAdjacentHTML("beforeend", `
                <button type="button" data-enhanced-desktop-action="run"><i class="fas fa-terminal"></i><span>Run</span></button>
                <button type="button" data-enhanced-desktop-action="taskmanager"><i class="fas fa-gauge-high"></i><span>Task Manager</span></button>
                <button type="button" data-enhanced-desktop-action="toggle_thispc"><i class="fas fa-computer"></i><span>Toggle This PC icon</span></button>
                <button type="button" data-enhanced-desktop-action="toggle_recycle"><i class="far fa-trash-can"></i><span>Toggle Recycle Bin icon</span></button>
            `);
            desktopMenuEl.addEventListener("click", (event) => {
                const button = event.target.closest("[data-enhanced-desktop-action]");
                if (!button) {
                    return;
                }
                const thisPcIcon = desktopIconsState.find((item) => item.appId === "thispc");
                const recycleIcon = desktopIconsState.find((item) => item.appId === "recycle");
                if (button.dataset.enhancedDesktopAction === "run") {
                    openRunDialog();
                }
                if (button.dataset.enhancedDesktopAction === "taskmanager") {
                    openApp("taskmanager");
                }
                if (button.dataset.enhancedDesktopAction === "toggle_thispc" && thisPcIcon) {
                    thisPcIcon.hidden = !thisPcIcon.hidden;
                    saveDesktopIcons();
                    renderDesktopIcons();
                }
                if (button.dataset.enhancedDesktopAction === "toggle_recycle" && recycleIcon) {
                    recycleIcon.hidden = !recycleIcon.hidden;
                    saveDesktopIcons();
                    renderDesktopIcons();
                }
            });
        }

        if (searchPanelInputEl) {
            renderSearchResults("");
            searchPanelInputEl.addEventListener("input", () => renderSearchResults(searchPanelInputEl.value));
        }

        searchPanelResultsEl?.addEventListener("click", (event) => {
            const button = event.target.closest(".search-result");
            if (!button) {
                return;
            }
            const resultKind = button.dataset.resultKind || "";
            const resultId = button.dataset.resultId || "";
            if (resultKind === "app") {
                openApp(resultId);
            } else if (resultKind === "desktop") {
                const item = getDesktopItem(resultId);
                if (item) {
                    openApp(item.appId);
                }
            } else if (resultKind === "run") {
                runCommand(resultId);
            }
            searchPanelEl?.classList.remove("open");
        });

        shortcutContextMenuEl?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-shortcut-action]");
            if (!button) {
                return;
            }
            const action = button.dataset.shortcutAction || "";
            const itemId = button.dataset.itemId || "";
            const item = getDesktopItem(itemId);
            if (!item) {
                return;
            }
            if (action === "open") {
                openApp(item.appId);
            }
            if (action === "rename") {
                renameDesktopShortcut(itemId);
            }
            if (action === "delete") {
                moveShortcutToRecycleBin(itemId);
            }
            if (action === "pin") {
                pinAppToStart(item.appId);
            }
            if (action === "unpin") {
                unpinAppFromStart(item.appId);
            }
            if (action === "properties") {
                openApp("systeminfo", { customState: { mode: "properties", item } });
            }
            shortcutContextMenuEl.classList.remove("open");
        });

        clearNotificationsButtonEl?.addEventListener("click", () => {
            notificationItems = [];
            saveJson(NOTIFY_KEY, notificationItems);
            renderNotifications();
        });

        taskbarSearchButtonEl?.addEventListener("click", (event) => {
            event.stopPropagation();
            hideExtraPanels();
            searchPanelEl?.classList.add("open");
            renderSearchResults(searchPanelInputEl?.value || "");
            searchPanelInputEl?.focus();
        });
        widgetsButtonEl?.addEventListener("click", (event) => {
            event.stopPropagation();
            hideExtraPanels();
            widgetsBoardEl?.classList.toggle("open");
        });
        taskViewButtonEl?.addEventListener("click", (event) => {
            event.stopPropagation();
            hideExtraPanels();
            renderTaskView();
            taskViewPanelEl?.classList.toggle("open");
        });
        trayFlyoutButtonEl?.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleQuickSettings(event);
        });

        clockButton?.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            hideExtraPanels();
            notificationCenterEl?.classList.toggle("open");
            renderNotifications();
        });

        powerButtonEl?.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            event.preventDefault();
            powerMenuEl?.classList.toggle("open");
        }, true);

        startButton?.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            hideExtraPanels();
            winxMenuEl?.classList.add("open");
            winxMenuEl.style.left = "12px";
            winxMenuEl.style.bottom = "60px";
        });

        winxMenuEl?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-winx-action]");
            if (!button) {
                return;
            }
            const action = button.dataset.winxAction || "";
            if (action === "taskmanager") openApp("taskmanager");
            if (action === "thispc") openApp("thispc");
            if (action === "settings") openApp("settings");
            if (action === "systeminfo") openApp("systeminfo");
            if (action === "run") openRunDialog();
            winxMenuEl.classList.remove("open");
        });

        powerMenuEl?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-power-action]");
            if (!button) {
                return;
            }
            const action = button.dataset.powerAction || "";
            if (action === "lock" || action === "sleep") {
                relockDesktop();
                playSound("lock");
            }
            if (action === "restart") {
                location.reload();
            }
            if (action === "shutdown") {
                relockDesktop();
                pushNotification("Power", "He thong da chuyen sang trang thai tat may gia lap.");
            }
            powerMenuEl.classList.remove("open");
        });

        runDialogOkButtonEl?.addEventListener("click", () => runCommand(runDialogInputEl?.value || ""));
        runDialogCancelButtonEl?.addEventListener("click", () => setRunDialogVisibility(false));
        runDialogInputEl?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                runCommand(runDialogInputEl.value);
            }
        });
        runDialogEl?.addEventListener("click", (event) => {
            if (!event.target.closest(".run-dialog-card")) {
                setRunDialogVisibility(false);
            }
        });

        window.addEventListener("pageshow", () => {
            setRunDialogVisibility(false);
        });

        openTaskmanagerButtonEl?.addEventListener("click", () => openApp("taskmanager"));
        openSysteminfoButtonEl?.addEventListener("click", () => openApp("systeminfo"));

        document.querySelectorAll(".qs-tile[data-toggle-setting]").forEach((tile) => {
            tile.addEventListener("click", () => {
                const key = tile.dataset.toggleSetting;
                if (!key) {
                    return;
                }
                systemSettings[key] = !systemSettings[key];
                if (key === "airplane" && systemSettings.airplane) {
                    systemSettings.wifi = false;
                    systemSettings.bluetooth = false;
                }
                if (key === "wifi" && systemSettings.wifi) {
                    systemSettings.airplane = false;
                }
                saveSettings();
                syncQuickSettingsUi();
            });
        });

        brightnessSliderEl?.addEventListener("input", () => {
            systemSettings.brightness = Number(brightnessSliderEl.value);
            saveSettings();
            syncQuickSettingsUi();
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".shortcut-context-menu")) {
                shortcutContextMenuEl?.classList.remove("open");
            }
            if (!event.target.closest(".search-panel") && !event.target.closest("#taskbar-search-button")) {
                searchPanelEl?.classList.remove("open");
            }
            if (!event.target.closest(".widgets-board") && !event.target.closest("#widgets-button")) {
                widgetsBoardEl?.classList.remove("open");
            }
            if (!event.target.closest(".task-view-panel") && !event.target.closest("#task-view-button")) {
                taskViewPanelEl?.classList.remove("open");
            }
            if (!event.target.closest(".notification-center") && !event.target.closest("#clock-button")) {
                notificationCenterEl?.classList.remove("open");
            }
            if (!event.target.closest(".power-menu") && !event.target.closest(".start-footer .fa-power-off")) {
                powerMenuEl?.classList.remove("open");
            }
            if (!event.target.closest(".winx-menu")) {
                winxMenuEl?.classList.remove("open");
            }
        });

        document.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a" && document.activeElement === document.body) {
                event.preventDefault();
                setDesktopSelection(desktopIconsState.filter((item) => !item.hidden).map((item) => item.id));
            }
            if (event.key.toLowerCase() === "f3") {
                openApp("photos");
            }
            if (event.altKey && event.key.toLowerCase() === "a") {
                event.preventDefault();
                arrangeDesktopIcons();
                saveDesktopIcons();
                renderDesktopIcons();
                pushNotification("Desktop", "Da auto arrange icon desktop.");
            }
            if (event.key === "Escape") {
                hideExtraPanels();
            }
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") {
                event.preventDefault();
                relockDesktop();
            }
            if (event.altKey && event.key === "Tab") {
                event.preventDefault();
                const states = Array.from(openAppMap.values()).filter((state) => (state.desktopId || "desktop-1") === currentVirtualDesktopId);
                if (!states.length || !altTabOverlayEl) {
                    return;
                }
                altTabVisible = true;
                altTabIndex = (altTabIndex + 1) % states.length;
                altTabOverlayEl.removeAttribute("hidden");
                altTabOverlayEl.classList.add("open");
                altTabOverlayEl.innerHTML = states.map((state, index) => `
                    <div class="alt-tab-card${index === altTabIndex ? " active" : ""}">
                        <img src="${getAppInfo(state.appId).icon}" alt="${getAppInfo(state.appId).name}">
                        <span>${getAppInfo(state.appId).name}</span>
                    </div>
                `).join("");
            }
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === "Alt" && altTabVisible) {
                const states = Array.from(openAppMap.values()).filter((state) => (state.desktopId || "desktop-1") === currentVirtualDesktopId);
                const target = states[altTabIndex];
                if (target) {
                    focusApp(target.appId);
                }
                altTabVisible = false;
                altTabOverlayEl?.classList.remove("open");
                altTabOverlayEl?.setAttribute("hidden", "");
            }
        });

        setInterval(() => {
            lockScreenWallpaperIndex = (lockScreenWallpaperIndex + 1) % desktopWallpapers.length;
            const wallpaper = desktopWallpapers[lockScreenWallpaperIndex];
            document.documentElement.style.setProperty("--lock-screen-wallpaper", `url("${wallpaper.path}")`);
        }, 15000);
    }

    initializeEnhancements();
})();

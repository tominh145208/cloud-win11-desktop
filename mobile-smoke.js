const { chromium, devices } = require("playwright");

async function run() {
  const results = [];
  const errors = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    locale: "vi-VN",
  });
  const page = await context.newPage();

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console.${msg.type()}: ${msg.text()}`);
    }
  });
  page.on("requestfailed", (req) => {
    const failure = req.failure();
    errors.push(`requestfailed: ${req.method()} ${req.url()} ${failure ? failure.errorText : ""}`.trim());
  });

  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2300);

  const locked = await page.evaluate(() => document.body.classList.contains("is-locked"));
  if (locked) {
    await page.locator("#lock-screen").click({ force: true });
    await page.waitForTimeout(200);

    const setupVisible = await page.evaluate(() => {
      const panel = document.getElementById("setup-panel");
      if (!panel || panel.hasAttribute("hidden")) return false;
      const style = window.getComputedStyle(panel);
      const visible = style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      return visible && panel.getAttribute("aria-hidden") !== "true";
    });

    if (setupVisible) {
      await page.fill("#setup-desktop-name", "Mobile User");
      await page.fill("#setup-limore-name", "Anonymous");
      await page.click("#create-account-button");
      results.push("setup-complete");
    } else {
      const loginVisible = await page.evaluate(() => {
        const panel = document.getElementById("login-panel");
        if (!panel || panel.hasAttribute("hidden")) return false;
        const style = window.getComputedStyle(panel);
        const visible = style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
        return visible && panel.getAttribute("aria-hidden") !== "true";
      });
      if (loginVisible) {
        await page.click("#unlock-button");
        results.push("unlock-complete");
      }
    }
  }

  await page.waitForTimeout(500);

  async function resetFloatingUi() {
    await page.evaluate(() => {
      document.getElementById("start-menu")?.classList.remove("open");
      document.getElementById("search-panel")?.classList.remove("open");
      document.getElementById("quick-settings")?.classList.remove("open");
      document.getElementById("calendar-panel")?.classList.remove("open");
      document.getElementById("controller-menu")?.classList.remove("open");
    });
    await page.waitForTimeout(120);
  }

  async function assertOpen(buttonSelector, panelSelector, panelClass = "open", label = panelSelector) {
    await resetFloatingUi();
    await page.click(buttonSelector);
    await page.waitForTimeout(180);
    const open = await page.evaluate(({ panelSelector, panelClass }) => {
      const panel = document.querySelector(panelSelector);
      if (!panel) return false;
      return panel.classList.contains(panelClass);
    }, { panelSelector, panelClass });
    if (!open) {
      errors.push(`panel-not-open: ${label}`);
    } else {
      results.push(`open-ok: ${label}`);
    }
  }

  await assertOpen("#start-button", "#start-menu", "open", "start-menu");
  await assertOpen("#taskbar-search-button", "#search-panel", "open", "search-panel");
  await assertOpen("#clock-button", "#calendar-panel", "open", "calendar-panel");
  await assertOpen("#volume-button", "#quick-settings", "open", "quick-settings");
  await assertOpen("#controller-menu-toggle", "#controller-menu", "open", "controller-menu");

  await resetFloatingUi();
  const beforeFilesByTaskbar = await page.evaluate(() => document.querySelectorAll(".app-window").length);
  await page.click(".taskbar .app-launcher[data-app='files']");
  await page.waitForTimeout(220);
  const afterFilesByTaskbar = await page.evaluate(() => ({
    count: document.querySelectorAll(".app-window").length,
    hasExplorer: Boolean(document.querySelector(".app-window.thispc-window"))
  }));
  if (afterFilesByTaskbar.count <= beforeFilesByTaskbar || !afterFilesByTaskbar.hasExplorer) {
    errors.push("files-taskbar-not-open");
  } else {
    results.push("open-ok: files-from-taskbar");
  }

  await page.evaluate(() => {
    const windowEl = document.querySelector(".app-window.thispc-window");
    if (windowEl) {
      windowEl.remove();
    }
  });
  await page.waitForTimeout(120);

  await resetFloatingUi();
  await page.click("#start-button");
  await page.waitForTimeout(120);
  const beforeFilesByStart = await page.evaluate(() => document.querySelectorAll(".app-window").length);
  await page.click("#start-menu .app-launcher[data-app='files']");
  await page.waitForTimeout(220);
  const afterFilesByStart = await page.evaluate(() => ({
    count: document.querySelectorAll(".app-window").length,
    hasExplorer: Boolean(document.querySelector(".app-window.thispc-window"))
  }));
  if (afterFilesByStart.count <= beforeFilesByStart || !afterFilesByStart.hasExplorer) {
    errors.push("files-start-not-open");
  } else {
    results.push("open-ok: files-from-start");
  }

  let gamepadVisible = await page.evaluate(() => {
    const panel = document.getElementById("virtual-gamepad");
    return Boolean(panel) && !panel.classList.contains("hidden");
  });
  if (!gamepadVisible) {
    await page.click("#toggle-virtual-gamepad");
    await page.waitForTimeout(180);
    gamepadVisible = await page.evaluate(() => {
      const panel = document.getElementById("virtual-gamepad");
      return Boolean(panel) && !panel.classList.contains("hidden");
    });
  }
  if (!gamepadVisible) {
    errors.push("virtual-gamepad-not-visible-after-toggle");
  } else {
    results.push("open-ok: virtual-gamepad");
  }

  await assertOpen("#controller-menu-toggle", "#controller-menu", "open", "controller-menu-toggle-touch");
  await page.click("#toggle-touch-mouse");
  await page.waitForTimeout(150);
  const touchMouseEnabled = await page.evaluate(() => document.body.classList.contains("touch-mouse-mode"));
  if (!touchMouseEnabled) {
    errors.push("touch-mouse-mode-not-enabled");
  } else {
    results.push("toggle-ok: touch-mouse-mode");
  }

  await page.touchscreen.tap(200, 300);
  await page.waitForTimeout(100);

  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(400);
  results.push("layout-ok: landscape-rotation");

  await browser.close();

  const payload = { ok: errors.length === 0, results, errors };
  console.log(JSON.stringify(payload, null, 2));
  process.exit(payload.ok ? 0 : 1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

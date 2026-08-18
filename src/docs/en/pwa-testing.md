# PWA tests on real devices

Run these tests against the production build served over HTTPS. The development
source does not register a service worker.

## Preparation

1. Run `npm ci` and `npm run build`.
2. Publish all of `build/` to an HTTPS staging URL with the cache headers from
   [deployment.md](deployment.md).
3. Remove previous installations and site data.
4. Prepare builds A and B, with a visible change in B, and deploy B atomically
   over A when testing updates.

## Android

Test Chrome and Firefox, plus Samsung Internet when available:

1. Load build A and verify the **Install Argenmap** button.
2. Confirm that Chromium opens the native prompt and browsers without that API
   show browser-menu installation instructions.
3. Install and launch from its icon. Verify name, icon, standalone display and
   portrait/landscape layouts.
4. Visit once online, restart in airplane mode and verify that the interface and
   local configuration load while remote features fail without blocking the UI.
5. Reconnect, leave A open, deploy B and return to the app. Verify that B waits
   for the **Update** action and is applied after the automatic reload.
6. Verify that the install button is hidden in the installed application.

Record device model, Android version, browser/version and every result.

## iPhone and iPad

Test Safari on the oldest supported iOS/iPadOS release and the latest stable
release:

1. Verify that **Install Argenmap** shows **Share → Add to Home Screen** guidance;
   iOS does not implement `beforeinstallprompt`.
2. Install from Share and verify icon, name, standalone display and both
   orientations.
3. Repeat the online/airplane-mode and A-to-B update cases above.
4. Verify that the install button is hidden in standalone mode.

Fully close and reopen the installed app after each update because WebKit's
process lifecycle differs from a regular browser tab.

## Acceptance

Release approval requires every case to pass on at least one physical Android
device and one physical iPhone or iPad. Viewport emulation and headless tests are
useful but do not replace physical installation.

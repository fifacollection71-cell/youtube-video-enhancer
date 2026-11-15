# YouTube Video Vibrance & Brightness Enhancer Extension

A lightweight browser extension designed to brighten dark YouTube videos and boost color vibrancy in real-time.

---

## 🔒 YouTube-Exclusive & Privacy Scoped

This extension is strictly sandboxed to run **only** on YouTube:
- **Zero External Permissions:** Host permissions are strictly restricted to `*://*.youtube.com/*`. It cannot inspect, access, or run on any other website or tab.
- **Smart Toolbar State:** The toolbar icon automatically disables and greys out on non-YouTube tabs.
- **Popup Adaptive UI:** Opening the popup on non-YouTube tabs shows an "Inactive" status with an "Open YouTube" shortcut; controls are locked until on YouTube.
- **Player-Targeted Filters:** Styles apply only to YouTube video player elements (`#movie_player`, `.html5-video-player`, etc.), never generic video tags or embedded third-party iframes.

---

## 🚀 How to Install / Load in Your Browser

### Zen Browser & Firefox

Zen Browser is built directly on Firefox (Gecko engine) and supports this extension natively.

#### Option A: Quick Load (Fastest, works immediately)
1. Open Zen Browser or Firefox.
2. In the address bar, go to:
   ```text
   about:debugging#/runtime/this-firefox
   ```
3. Click the **"Load Temporary Add-on..."** button.
4. Select either:
   - [`/home/sugata/youtube-video-enhancer/manifest.json`](file:///home/sugata/youtube-video-enhancer/manifest.json)
   - Or the packaged [`/home/sugata/youtube-video-enhancer/youtube-video-enhancer.xpi`](file:///home/sugata/youtube-video-enhancer/youtube-video-enhancer.xpi)
5. Done! The icon will appear in your Zen/Firefox toolbar.

#### Option B: Permanent Install in Zen Browser (Keeps it after restarting browser)
1. In Zen Browser address bar, open: `about:config`
2. Click "Accept the Risk and Continue".
3. Search for: `xpinstall.signatures.required` and toggle it to **`false`**.
4. Now open: `about:addons`
5. Click the gear icon ⚙️ (top-right) and select **"Install Add-on From File..."**.
6. Choose:
   ```text
   /home/sugata/youtube-video-enhancer/youtube-video-enhancer.xpi
   ```
7. Click **Add** to confirm.

---

### Brave / Chrome / Chromium / Edge
1. Open `brave://extensions` or `chrome://extensions`.
2. Turn **ON** the **Developer mode** toggle (top-right).
3. Click **"Load unpacked"** (top-left).
4. Select the directory:
   ```text
   /home/sugata/youtube-video-enhancer
   ```

---

## 🎛 Features
- **YouTube-Exclusive:** Inactive and dormant on all non-YouTube websites.
- **Real-Time Sliders:** Brightness (50% – 250%), Contrast (50% – 200%), Vibrance / Saturation (50% – 250%).
- **1-Click Presets:** Vibrant & Bright, Dark Boost, Rich & Punchy, Standard.
- **YouTube SPA Navigation:** Settings remain active when clicking different videos without reloading the page.

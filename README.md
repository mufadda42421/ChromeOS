# ChromeOS — The Next-Generation Chrome Experience

> A futuristic, intelligent browser operating system running inside Google Chrome. Built with React 19, TypeScript, Tailwind CSS, Manifest V3, and Gemini 3.8 Flash.

---

## 🌟 Key Features

### 1. The Signature Robot Mascot System
- **6 Distinct Robot Themes**:
  1. **Cyber Robot**: Angular armor, ocular scanner, and sub-thruster chassis.
  2. **Cute Robot**: Rounded bubble head, blushing LED cheeks, and digital eyes.
  3. **Minimal Robot**: Bauhaus floating orb, spinning precision ring, and central aperture.
  4. **Neon Robot**: Synthwave wireframe contours with high-contrast audio frequency bars.
  5. **Retro Robot**: Cathode tube CRT monitor screen, phosphor scanlines, and dials.
  6. **Professional Robot**: Titanium executive finish with optical camera lens.
- **Dynamic Category Morphing**: The mascot automatically morphs its visual appearance, HUD overlays, and expressions based on the active tab (e.g. AI neural halo on ChatGPT, terminal brackets on GitHub, headphones on YouTube, creative stylus on Figma).
- **Procedural Web Audio Synthesizer**: Zero-latency sci-fi robotic chirps, morph sweeps, and click feedback generated directly via the browser's Web Audio API.

### 2. Intelligent Tab Classification
- **Multi-Tier Hybrid Engine**:
  - Domain-based matching against 120+ popular services with instant zero-latency categorization.
  - Semantic title & pathname keyword analysis.
  - User-defined domain overrides and wildcard patterns (e.g. `*.openai.com`).
  - Optional server-side **Gemini 3.8 Flash** classification for unrecognized websites.
- **Visual Tab Manager**:
  - Stacked category cards and unified grid views.
  - Native Chrome Tab Group synchronization (colored by category).
  - Pinning, muting, duplicating, and batch category closures.
  - Instant session snapshots and 1-click restore.

### 3. Workspaces & Complete Customization
- **Context-Isolated Workspaces**: Separate spaces for Development, Personal, Research, and Work.
- **Custom New Tab Dashboard**: Futuristic tabular clock, live weather telemetry via Open-Meteo, unified search bar with engine picker (Google, DuckDuckGo, Perplexity, YouTube, GitHub, Bing), quick shortcuts, and persistent scratchpad.
- **Theme Studio**: Dynamic gradients, glassmorphism blur and opacity controls, accent lighting, and dual dark/light modes.
- **100% Local Privacy**: Stored in `chrome.storage.local`. Browsing data is never collected or sold.

---

## 📦 How to Build and Run

### Running in Development / Web Workspace
```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# The workspace is now live on http://localhost:3000
```

### Building the Chrome Extension
```bash
# Build the production bundle
npm run build
```

---

## 🚀 Loading the Extension in Google Chrome (Manifest V3)

1. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions
   ```
2. In the top-right corner, toggle on **Developer mode**.
3. In the top-left corner, click **Load unpacked**.
4. Select the project directory (or the exported `.zip` after unzipping).
5. Open a new tab in Chrome or click the ChromeOS extension icon to experience the next-generation browser operating system!

---

## 🛠️ Technology Stack
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Glassmorphism
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Extension Platform**: Chrome Extensions API (Manifest V3)
  - `chrome.tabs`, `chrome.tabGroups`, `chrome.storage`, `chrome.sidePanel`, `chrome.bookmarks`, `chrome.sessions`
- **Audio**: Web Audio API Procedural Synthesizer
- **Backend / AI**: Node.js, Express, `@google/genai` (Gemini 3.8 Flash)

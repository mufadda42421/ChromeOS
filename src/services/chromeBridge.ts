import { TabItem, Category, CategoryId } from '../types';
import JSZip from 'jszip';

declare const chrome: any;

export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.tabs && !!chrome.runtime;
};

/**
 * Real Chrome Extension API Adapter with graceful simulated fallback
 */
export class ChromeBridge {
  /**
   * Fetch live tabs from Chrome or simulate
   */
  public static async getTabs(fallbackTabs: TabItem[]): Promise<TabItem[]> {
    if (isChromeExtension()) {
      try {
        const queryOptions = { currentWindow: true };
        const chromeTabs = await chrome.tabs.query(queryOptions);
        return chromeTabs.map((t: any) => ({
          id: String(t.id),
          url: t.url || 'about:blank',
          title: t.title || 'New Tab',
          favicon: t.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(t.url || 'https://google.com').hostname}&sz=64`,
          categoryId: 'development', // Categorized by caller
          pinned: !!t.pinned,
          muted: !!t.mutedInfo?.muted,
          active: !!t.active,
          workspaceId: 'ws-main',
          lastAccessed: Date.now(),
        }));
      } catch (e) {
        console.warn('Chrome tabs query failed, using local store:', e);
      }
    }
    return fallbackTabs;
  }

  /**
   * Activate a specific tab
   */
  public static async activateTab(tabId: string): Promise<void> {
    if (isChromeExtension()) {
      try {
        const numericId = parseInt(tabId, 10);
        if (!isNaN(numericId)) {
          await chrome.tabs.update(numericId, { active: true });
        }
      } catch (e) {
        console.warn('Chrome activateTab failed:', e);
      }
    }
  }

  /**
   * Open a new tab
   */
  public static async createTab(url: string = 'https://google.com'): Promise<string> {
    if (isChromeExtension()) {
      try {
        const created = await chrome.tabs.create({ url, active: true });
        return String(created.id);
      } catch (e) {
        console.warn('Chrome createTab failed:', e);
      }
    } else {
      // In sandbox preview, open real browser window or return new id
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        // Popups might be blocked
      }
    }
    return 'tab-' + Date.now();
  }

  /**
   * Close a tab
   */
  public static async closeTab(tabId: string): Promise<void> {
    if (isChromeExtension()) {
      try {
        const numericId = parseInt(tabId, 10);
        if (!isNaN(numericId)) {
          await chrome.tabs.remove(numericId);
        }
      } catch (e) {
        console.warn('Chrome closeTab failed:', e);
      }
    }
  }

  /**
   * Pin or unpin a tab
   */
  public static async togglePinTab(tabId: string, pinned: boolean): Promise<void> {
    if (isChromeExtension()) {
      try {
        const numericId = parseInt(tabId, 10);
        if (!isNaN(numericId)) {
          await chrome.tabs.update(numericId, { pinned });
        }
      } catch (e) {
        console.warn('Chrome togglePinTab failed:', e);
      }
    }
  }

  /**
   * Sync tabs into native Chrome Tab Groups
   */
  public static async syncTabGroups(tabs: TabItem[], categories: Category[]): Promise<void> {
    if (!isChromeExtension() || !chrome.tabGroups) return;

    try {
      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const tabsByCategory = new Map<CategoryId, number[]>();

      tabs.forEach((t) => {
        const idNum = parseInt(t.id, 10);
        if (!isNaN(idNum)) {
          const list = tabsByCategory.get(t.categoryId) || [];
          list.push(idNum);
          tabsByCategory.set(t.categoryId, list);
        }
      });

      for (const [catId, tabIds] of tabsByCategory.entries()) {
        if (tabIds.length > 0) {
          const group = await chrome.tabs.group({ tabIds });
          const cat = categoryMap.get(catId);
          if (cat) {
            // Map hex color to nearest Chrome tab group color
            const chromeColor = mapHexToChromeGroupColor(cat.color);
            await chrome.tabGroups.update(group, {
              title: cat.name,
              color: chromeColor,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Native tab groups sync notice:', e);
    }
  }

  /**
   * Generate downloadable Chrome Extension (.zip) package for Manifest V3
   */
  public static async generateExtensionPackage(): Promise<Blob> {
    try {
      const serverZipRes = await fetch('/api/download-extension-zip');
      if (serverZipRes.ok) {
        return await serverZipRes.blob();
      }
    } catch {
      // Fallback to client-side packaging
    }

    const zip = new JSZip();

    const manifestJson = {
      manifest_version: 3,
      name: 'ChromeOS — Intelligent Browser Workspace',
      version: '1.0.0',
      description: 'Futuristic browser operating system with intelligent tab classification, dynamic robot mascots, and custom visual workspaces.',
      permissions: [
        'tabs',
        'tabGroups',
        'storage',
        'sidePanel',
        'bookmarks',
        'history',
        'sessions',
      ],
      host_permissions: ['<all_urls>'],
      action: {
        default_title: 'ChromeOS Workspace',
        default_popup: 'index.html',
      },
      chrome_url_overrides: {
        newtab: 'index.html',
      },
      side_panel: {
        default_path: 'index.html',
      },
      background: {
        service_worker: 'background.js',
        type: 'module',
      },
      icons: {
        16: 'icon16.png',
        48: 'icon48.png',
        128: 'icon128.png',
      },
    };

    const backgroundJs = `// ChromeOS Manifest V3 Background Service Worker
console.log('ChromeOS Service Worker activated');

// Tab created listener
chrome.tabs?.onCreated?.addListener((tab) => {
  console.log('New tab created:', tab.id, tab.url);
});

// Tab updated listener (URL or title changed)
chrome.tabs?.onUpdated?.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.storage?.local?.get(['categories', 'overrides'], (result) => {
      chrome.runtime?.sendMessage?.({
        type: 'TAB_UPDATED',
        tabId,
        url: tab.url,
        title: tab.title
      }).catch(() => {});
    });
  }
});

// Side panel activation
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true }).catch(() => {});
`;

    const readmeMd = `# ChromeOS — The Next-Generation Chrome Experience

Production-quality Manifest V3 Chrome Extension.

## Features
- **Intelligent Tab Categorization**: Automatic domain and metadata classification.
- **Dynamic Robot Mascot**: Signature companion that morphs according to active category.
- **Visual Tab Manager**: Full drag-and-drop, category grouping, and pin/duplicate controls.
- **Workspaces**: Dedicated spaces for Dev, Research, Creative, and Personal workflows.
- **Futuristic New Tab Dashboard**: Glassmorphism clock, weather, unified search, and shortcuts.

## How to Install in Google Chrome:
1. Unzip this package into a local directory.
2. Open Google Chrome and navigate to: \`chrome://extensions/\`
3. Toggle on **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the unzipped folder containing \`manifest.json\`.
6. Open a new tab or click the ChromeOS extension icon to experience the future of browsing!
`;

    // Binary PNG Icons
    const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAXElEQVR4nGNgoDXojvn2nyxNuDDRmkUkFDEwQUPwaSZoCDGa8RqCrJlt2xUwRtaELobTAJhCXAbAxFEMIMX5OL1BjgE4w4BsAyiKBYrTAVVSIrohZOUFbIbhkwcAYKkfKreLDUIAAAAASUVORK5CYII=';
    const icon48Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA/UlEQVR4nO3XsRHCMAyF4VRMQEHLXmzEPpmEWWihBuxIfn72kw/pTiXm/xLCXbYtJyfm3G/P1/eqmw6nFGytuhmKDoHxBJ0v158NAWkJtnY6ghXugQyPZ4RbkKXihyFmxtMRingaQhlPQajjS4ilrn7XXYgSD98FD+C0Pz4WCfOe0QRA4hFE6xluhAWofXELAjkjAUsAen7/rGeg6znw/n32xqPn0ACqTYB6aQ9y2PgEJIAAiIj47/cBNQJ+L44IcMdHuQvw1Y+A6I5XImjxCgQ9fiZiWHwNwYKUzqXHHyFQSO2sYfEWwgJ5Pjc8vhXi3anhLIy6+XCWC84B5w0gDMt47dD3FAAAAABJRU5ErkJggg==';
    const icon128Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAC8UlEQVR4nO2ZMY7cMBAEFfkFDpz6X/6R/3Mv8Vuc2hGBA7HSSVxyuodTBUx8o6naBXR7HAAAAAAAAAAAG/L7199/d0e9KwzyRPLoqJ8ROiKkE4MRo7K+//h5ewjCkBWinw4hCFAKfzcI9e1S4yp9JAb1LVORSfrTGNS3tWYH8YQwwI7iCeEmFeQTwQlVxN8JQe0ilKriCQH5tSNAfuEIEP88BLWzaSC/cATILxwB8gtHgPzCESC/cATILx4B8tdHoHZ8Cp/+mAAsI0B+4QiQXzwC5OsiULvn0y8OQB4B8vURWMgnAF0AsgiQ7xMB8ouOLAIC8BhJAMj3mvAICMBrQgNAvueERRAVwLePP6ejPrbj3iEBRLz3Xx3QOQT13iH/F3CS7xSBy96pAxg5okMETnunDeCdIyojcNt7aQDO8hURuO69LAICyLE3ARDA/ABWvf7NPGJkBM57L3kdzPDpJ4CF3wIEkGtvAiCAmgFEyM+we5oAZh8yawCzdyMAApgXQMTPv45HzL73tAgIIOfeqQJ495gK+e57pwtg9JhK+c57pwzgyUHV0t33Th0AQwAMATAEwBAAQwCMMgAiyDepfgxiCIAhAIYAGAJgEgRABN7Tu5oSQB+B+iGZewFMk08AeYYAis+yAIjAf5bKJwD/IYDiExoAEXjNste/qwjUD828DmCZfALwnbAAiMBvQuUTgN+EB0AEPiORTwA+IwuACPQjld8HQAQ6+bIA+gjUR6k0FvL7AIggXr48gD4C9XEqjJX8g28BmXybAA4iqC2/QQSF5TcIYH0AaseX8C2wVr59AAcR1JbfIILC8htEUFh+gwgKy28QQWH5DSIoLL/RPyAhvBa/pfwGERSW3yCCwvI/UzWE8uI/8+oYu4Zw9qxqB3IqRID8G+wYAuIH2CEExE/g7IiuMVztq75laq4Oq47hq93Ut9uKr44dEcTdHdS32pq7Et4JY/RvqG9TklFZM0b97NCBdDgFyQAAAAAAAFCc/+tPAO9ZXwBoAAAAAElFTkSuQmCC';

    zip.file('icon16.png', icon16Base64, { base64: true });
    zip.file('icon48.png', icon48Base64, { base64: true });
    zip.file('icon128.png', icon128Base64, { base64: true });
    zip.file('manifest.json', JSON.stringify(manifestJson, null, 2));
    zip.file('background.js', backgroundJs);
    zip.file('README.md', readmeMd);

    // Fetch and include the real compiled index.html
    try {
      const indexRes = await fetch('./index.html');
      if (indexRes.ok) {
        const indexHtml = await indexRes.text();
        zip.file('index.html', indexHtml);
      }
    } catch {
      // Fallback
    }

    return await zip.generateAsync({ type: 'blob' });
  }
}

function mapHexToChromeGroupColor(
  hex: string
): 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' {
  const clean = hex.toLowerCase();
  if (clean.includes('10b981') || clean.includes('green') || clean.includes('84cc16')) return 'green';
  if (clean.includes('ec4899') || clean.includes('pink') || clean.includes('f43f5e')) return 'pink';
  if (clean.includes('06b6d4') || clean.includes('cyan') || clean.includes('14b8a6')) return 'cyan';
  if (clean.includes('f59e0b') || clean.includes('yellow') || clean.includes('orange')) return 'yellow';
  if (clean.includes('6366f1') || clean.includes('blue')) return 'blue';
  if (clean.includes('f43f5e') || clean.includes('red')) return 'red';
  if (clean.includes('8b5cf6') || clean.includes('purple')) return 'purple';
  return 'purple';
}

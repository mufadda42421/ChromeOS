/**
 * ChromeOS Manifest V3 Service Worker (background.js)
 * Automatically categorizes open tabs, communicates with UI, and groups tabs natively
 */

console.log('[ChromeOS] Service worker loaded');

// Built-in rule map for immediate zero-latency classification in background
const DOMAIN_RULES = {
  'chatgpt.com': { id: 'ai', name: 'AI & Productivity', color: 'purple' },
  'claude.ai': { id: 'ai', name: 'AI & Productivity', color: 'purple' },
  'gemini.google.com': { id: 'ai', name: 'AI & Productivity', color: 'purple' },
  'notion.so': { id: 'ai', name: 'AI & Productivity', color: 'purple' },
  'github.com': { id: 'development', name: 'Development', color: 'green' },
  'gitlab.com': { id: 'development', name: 'Development', color: 'green' },
  'stackoverflow.com': { id: 'development', name: 'Development', color: 'green' },
  'figma.com': { id: 'design', name: 'Design & Creativity', color: 'pink' },
  'youtube.com': { id: 'entertainment', name: 'Entertainment', color: 'red' },
  'spotify.com': { id: 'entertainment', name: 'Entertainment', color: 'red' },
  'mail.google.com': { id: 'communication', name: 'Communication', color: 'cyan' },
  'amazon.com': { id: 'shopping', name: 'Shopping', color: 'yellow' },
  'arxiv.org': { id: 'research', name: 'Research', color: 'blue' },
};

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Listen to tab updates (when user navigates)
chrome.tabs?.onUpdated?.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    const domain = extractDomain(tab.url);
    const rule = DOMAIN_RULES[domain];

    if (rule && chrome.tabGroups) {
      try {
        const group = await chrome.tabs.group({ tabIds: [tabId] });
        await chrome.tabGroups.update(group, {
          title: rule.name,
          color: rule.color,
        });
      } catch (err) {
        console.log('[ChromeOS] Tab grouping notice:', err);
      }
    }

    // Broadcast tab update to any open ChromeOS views (new tab, popup, side panel)
    chrome.runtime?.sendMessage?.({
      type: 'TAB_UPDATED',
      tabId,
      url: tab.url,
      title: tab.title,
      category: rule ? rule.id : 'general',
    }).catch(() => {});
  }
});

// Configure side panel behavior to open on action click
if (chrome.sidePanel?.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}

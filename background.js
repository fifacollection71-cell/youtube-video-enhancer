// Background event script for YouTube Video Enhancer
// Ensures the extension action is ONLY active when viewing YouTube

function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host === 'youtube.com' || host.endsWith('.youtube.com');
  } catch (e) {
    return false;
  }
}

function getActionAPI() {
  if (typeof browser !== 'undefined' && browser.action) {
    return browser.action;
  }
  if (typeof chrome !== 'undefined' && chrome.action) {
    return chrome.action;
  }
  return null;
}

function safeCall(fn) {
  try {
    const res = fn();
    if (res && typeof res.catch === 'function') {
      res.catch(() => {});
    }
  } catch (e) {}
}

function updateTabState(tabId, url) {
  if (!tabId || tabId < 0) return;
  const action = getActionAPI();
  if (!action) return;

  const isYT = isYouTubeUrl(url);

  if (isYT) {
    safeCall(() => action.enable(tabId));
    safeCall(() => action.setTitle({
      tabId: tabId,
      title: 'YouTube Video Enhancer (Active)'
    }));
  } else {
    safeCall(() => action.disable(tabId));
    safeCall(() => action.setTitle({
      tabId: tabId,
      title: 'YouTube Video Enhancer (Inactive - Only works on YouTube)'
    }));
  }
}

// Disable action globally by default, then inspect open tabs
function initializeActionState() {
  const action = getActionAPI();
  if (action && typeof action.disable === 'function') {
    safeCall(() => action.disable());
  }

  const tabsAPI = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : ((typeof chrome !== 'undefined' && chrome.tabs) ? chrome.tabs : null);
  if (tabsAPI && tabsAPI.query) {
    try {
      const res = tabsAPI.query({}, (tabs) => {
        if (chrome && chrome.runtime && chrome.runtime.lastError) return;
        if (Array.isArray(tabs)) {
          for (const tab of tabs) {
            if (tab && tab.id) {
              updateTabState(tab.id, tab.url);
            }
          }
        }
      });
      if (res && typeof res.then === 'function') {
        res.then((tabs) => {
          if (Array.isArray(tabs)) {
            for (const tab of tabs) {
              if (tab && tab.id) {
                updateTabState(tab.id, tab.url);
              }
            }
          }
        }).catch(() => {});
      }
    } catch (e) {}
  }
}

const runtimeAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : ((typeof chrome !== 'undefined' && chrome.runtime) ? chrome.runtime : null);

if (runtimeAPI) {
  if (runtimeAPI.onInstalled) {
    runtimeAPI.onInstalled.addListener(() => {
      initializeActionState();
    });
  }
  if (runtimeAPI.onStartup) {
    runtimeAPI.onStartup.addListener(() => {
      initializeActionState();
    });
  }
}

// Initial execution
initializeActionState();

// Update state when active tab changes
const tabsAPI = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : ((typeof chrome !== 'undefined' && chrome.tabs) ? chrome.tabs : null);

if (tabsAPI) {
  if (tabsAPI.onActivated) {
    tabsAPI.onActivated.addListener((activeInfo) => {
      if (!activeInfo || !activeInfo.tabId) return;
      try {
        const res = tabsAPI.get(activeInfo.tabId, (tab) => {
          if (chrome && chrome.runtime && chrome.runtime.lastError) return;
          if (tab) {
            updateTabState(tab.id, tab.url);
          }
        });
        if (res && typeof res.then === 'function') {
          res.then((tab) => {
            if (tab) {
              updateTabState(tab.id, tab.url);
            }
          }).catch(() => {});
        }
      } catch (e) {}
    });
  }

  // Update state when tab URL or loading state changes
  if (tabsAPI.onUpdated) {
    tabsAPI.onUpdated.addListener((tabId, changeInfo, tab) => {
      const url = changeInfo.url || (tab && tab.url);
      updateTabState(tabId, url);
    });
  }
}

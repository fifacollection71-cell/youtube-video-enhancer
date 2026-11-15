(() => {
  // 1. Strict domain verification: must be youtube.com or *.youtube.com
  const hostname = window.location.hostname.toLowerCase();
  const isYouTube = hostname === 'youtube.com' || hostname.endsWith('.youtube.com');
  if (!isYouTube) {
    return;
  }

  // 2. Strict frame verification: must not run inside cross-origin / third-party embedded frames
  if (window.top !== window.self) {
    try {
      const topHost = window.top.location.hostname.toLowerCase();
      if (topHost !== 'youtube.com' && !topHost.endsWith('.youtube.com')) {
        return;
      }
    } catch (e) {
      // Cross-origin iframe on a non-YouTube site - do NOT run
      return;
    }
  }

  const STYLE_ID = 'yt-video-enhancer-style';
  const YOUTUBE_VIDEO_SELECTORS = [
    '#movie_player video',
    '.html5-video-player video',
    'video.html5-main-video',
    'video.video-stream',
    'ytd-player video'
  ].join(', ');

  function getTargetVideos() {
    const videos = document.querySelectorAll(YOUTUBE_VIDEO_SELECTORS);
    if (videos && videos.length > 0) return videos;

    const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    if (player) {
      return player.querySelectorAll('video');
    }
    return [];
  }

  function applyFilter(settings) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleEl);
    }

    if (!settings || !settings.enabled) {
      styleEl.textContent = '';
      getTargetVideos().forEach((v) => {
        v.style.removeProperty('filter');
      });
      return;
    }

    const { brightness = 100, contrast = 100, saturation = 100 } = settings;
    const filterRule = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    styleEl.textContent = `
      #movie_player video,
      .html5-video-player video,
      video.html5-main-video,
      video.video-stream,
      ytd-player video {
        filter: ${filterRule} !important;
      }
    `;

    getTargetVideos().forEach((v) => {
      v.style.setProperty('filter', filterRule, 'important');
    });
  }

  // Load initial settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['enhancerSettings'], (result) => {
      if (result && result.enhancerSettings) {
        applyFilter(result.enhancerSettings);
      }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.enhancerSettings) {
        applyFilter(changes.enhancerSettings.newValue);
      }
    });

    // Listen for direct messages from popup
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === 'UPDATE_FILTER') {
        applyFilter(msg.settings);
        sendResponse({ success: true });
      }
    });
  }

  // Observer to re-apply on dynamic YouTube navigation
  const observer = new MutationObserver(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['enhancerSettings'], (result) => {
        if (result && result.enhancerSettings && result.enhancerSettings.enabled) {
          const { brightness = 100, contrast = 100, saturation = 100 } = result.enhancerSettings;
          const filterRule = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
          getTargetVideos().forEach((v) => {
            v.style.setProperty('filter', filterRule, 'important');
          });
        }
      });
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('yt-navigate-finish', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['enhancerSettings'], (result) => {
        if (result && result.enhancerSettings) {
          applyFilter(result.enhancerSettings);
        }
      });
    }
  });
})();

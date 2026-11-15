const DEFAULT_SETTINGS = {
  enabled: true,
  brightness: 125,
  contrast: 115,
  saturation: 135
};

const PRESETS = {
  vibrant: { brightness: 125, contrast: 115, saturation: 135 },
  darkboost: { brightness: 145, contrast: 125, saturation: 115 },
  rich: { brightness: 110, contrast: 125, saturation: 150 },
  standard: { brightness: 100, contrast: 100, saturation: 100 }
};

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

// Elements
const viewActive = document.getElementById('view-active');
const viewInactive = document.getElementById('view-inactive');
const statusPill = document.getElementById('status-pill');
const headerToggleContainer = document.getElementById('header-toggle-container');
const btnOpenYouTube = document.getElementById('btn-open-youtube');

const toggleEnable = document.getElementById('toggle-enable');
const sliderBrightness = document.getElementById('slider-brightness');
const sliderContrast = document.getElementById('slider-contrast');
const sliderSaturation = document.getElementById('slider-saturation');

const valBrightness = document.getElementById('val-brightness');
const valContrast = document.getElementById('val-contrast');
const valSaturation = document.getElementById('val-saturation');

const btnVibrant = document.getElementById('preset-vibrant');
const btnDarkBoost = document.getElementById('preset-darkboost');
const btnRich = document.getElementById('preset-rich');
const btnStandard = document.getElementById('preset-standard');
const btnReset = document.getElementById('btn-reset');

let currentActiveTabId = null;

function getSettings() {
  return {
    enabled: toggleEnable.checked,
    brightness: parseInt(sliderBrightness.value, 10),
    contrast: parseInt(sliderContrast.value, 10),
    saturation: parseInt(sliderSaturation.value, 10)
  };
}

function updateBadges() {
  valBrightness.textContent = `${sliderBrightness.value}%`;
  valContrast.textContent = `${sliderContrast.value}%`;
  valSaturation.textContent = `${sliderSaturation.value}%`;
}

function updatePresetHighlight() {
  const current = getSettings();
  document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));

  for (const [key, p] of Object.entries(PRESETS)) {
    if (
      current.brightness === p.brightness &&
      current.contrast === p.contrast &&
      current.saturation === p.saturation
    ) {
      const matchBtn = document.getElementById(`preset-${key}`);
      if (matchBtn) matchBtn.classList.add('active');
    }
  }
}

function applyAndSave() {
  const settings = getSettings();
  updateBadges();
  updatePresetHighlight();

  // Save to storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ enhancerSettings: settings });
  }

  // Send message ONLY to verified YouTube tab
  if (currentActiveTabId && typeof chrome !== 'undefined' && chrome.tabs) {
    try {
      const res = chrome.tabs.sendMessage(currentActiveTabId, {
        type: 'UPDATE_FILTER',
        settings: settings
      });
      if (res && typeof res.catch === 'function') {
        res.catch(() => {});
      }
    } catch (e) {
      // Ignore if tab is not accepting messages
    }
  }
}

function setValues(settings) {
  toggleEnable.checked = settings.enabled ?? true;
  sliderBrightness.value = settings.brightness ?? 100;
  sliderContrast.value = settings.contrast ?? 100;
  sliderSaturation.value = settings.saturation ?? 100;
  applyAndSave();
}

function initActiveMode(tabId) {
  currentActiveTabId = tabId;

  viewActive.style.display = 'block';
  viewInactive.style.display = 'none';
  headerToggleContainer.style.display = 'block';

  statusPill.textContent = 'Active';
  statusPill.className = 'status-pill status-active';

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['enhancerSettings'], (result) => {
      if (result && result.enhancerSettings) {
        const s = result.enhancerSettings;
        toggleEnable.checked = s.enabled ?? true;
        sliderBrightness.value = s.brightness ?? DEFAULT_SETTINGS.brightness;
        sliderContrast.value = s.contrast ?? DEFAULT_SETTINGS.contrast;
        sliderSaturation.value = s.saturation ?? DEFAULT_SETTINGS.saturation;
      } else {
        setValues(DEFAULT_SETTINGS);
      }
      updateBadges();
      updatePresetHighlight();
    });
  } else {
    setValues(DEFAULT_SETTINGS);
  }

  // Event listeners for sliders and controls
  [sliderBrightness, sliderContrast, sliderSaturation].forEach((input) => {
    input.addEventListener('input', applyAndSave);
  });

  toggleEnable.addEventListener('change', applyAndSave);

  btnVibrant.addEventListener('click', () => {
    setValues({ ...PRESETS.vibrant, enabled: true });
  });

  btnDarkBoost.addEventListener('click', () => {
    setValues({ ...PRESETS.darkboost, enabled: true });
  });

  btnRich.addEventListener('click', () => {
    setValues({ ...PRESETS.rich, enabled: true });
  });

  btnStandard.addEventListener('click', () => {
    setValues({ ...PRESETS.standard, enabled: true });
  });

  btnReset.addEventListener('click', () => {
    setValues(DEFAULT_SETTINGS);
  });
}

function initInactiveMode() {
  currentActiveTabId = null;

  viewActive.style.display = 'none';
  viewInactive.style.display = 'flex';
  headerToggleContainer.style.display = 'none';

  statusPill.textContent = 'Inactive';
  statusPill.className = 'status-pill status-inactive';

  if (btnOpenYouTube) {
    btnOpenYouTube.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: 'https://www.youtube.com' });
        window.close();
      }
    });
  }
}

// Detect active tab state
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    const isYT = tab && isYouTubeUrl(tab.url);

    if (isYT && tab.id) {
      initActiveMode(tab.id);
    } else {
      initInactiveMode();
    }
  });
} else {
  initInactiveMode();
}

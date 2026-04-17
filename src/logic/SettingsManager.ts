export interface AppSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  timerEnabled: boolean;
  darkMode: boolean;
}

export const defaultSettings: AppSettings = {
  soundEnabled: true,
  voiceEnabled: true,
  timerEnabled: true,
  darkMode: false,
};

export const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return defaultSettings;
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

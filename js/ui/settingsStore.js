'use strict';

/** Merkt sich Einstellungen und Hölzer im Browser. Reiner Komfort – die App funktioniert auch ohne. */
class SettingsStore {
  static KEY = 'holztisch-planer';

  loadSettings() {
    return new Settings(this.load().settings);
  }

  loadWoods() {
    const saved = this.load().woods;
    if (!Array.isArray(saved) || saved.length !== DEFAULT_WOODS.length) return DEFAULT_WOODS;
    return saved.map(({ code, name, hex }) => new WoodType(code, name, hex));
  }

  save(settings, woods) {
    const data = { settings: settings.toJSON(), woods: woods.map(({ code, name, hex }) => ({ code, name, hex })) };
    try {
      localStorage.setItem(SettingsStore.KEY, JSON.stringify(data));
    } catch {
      // Speicher nicht verfügbar (z. B. privates Fenster) – dann eben ohne Merken.
    }
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(SettingsStore.KEY)) ?? {};
    } catch {
      return {};
    }
  }
}

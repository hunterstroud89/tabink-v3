/* ========================================
   SETTINGS MANAGER
   Centralized settings using SQLite
   ======================================== */

const AppSettings = {
  _settings: {
    theme: 'light',
    font: 'sans',
    caps: false,
    autosave: true
  },
  
  _loaded: false,
  
  // Load settings from database
  async load() {
    if (typeof db === 'undefined' || !db.db) {
      console.warn('Database not available yet');
      return this._settings;
    }
    
    try {
      // Load each setting
      const theme = await db.getSetting('theme');
      const font = await db.getSetting('font');
      const caps = await db.getSetting('caps');
      const autosave = await db.getSetting('autosave');
      
      if (theme !== null) this._settings.theme = theme;
      if (font !== null) this._settings.font = font;
      if (caps !== null) this._settings.caps = caps;
      if (autosave !== null) this._settings.autosave = autosave;
      
      this._loaded = true;
      this.apply();
      return this._settings;
    } catch (err) {
      console.log('Error loading settings, using defaults:', err);
      this._loaded = true;
      return this._settings;
    }
  },
  
  // Save settings to database
  async save() {
    if (typeof db === 'undefined' || !db.db) {
      console.warn('Database not available');
      return;
    }
    
    try {
      await db.setSetting('theme', this._settings.theme);
      await db.setSetting('font', this._settings.font);
      await db.setSetting('caps', this._settings.caps);
      await db.setSetting('autosave', this._settings.autosave);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  },
  
  // Get a setting value
  get(key) {
    return this._settings[key];
  },
  
  // Set a setting value and save
  async set(key, value) {
    this._settings[key] = value;
    this.apply();
    await this.save();
  },
  
  // Apply settings to the page
  apply() {
    // Apply theme
    const theme = this._settings.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply font
    document.documentElement.setAttribute('data-font', this._settings.font);
    
    // Apply text transform (no caps mode)
    if (this._settings.caps === true) {
      document.documentElement.classList.add('no-caps');
    } else {
      document.documentElement.classList.remove('no-caps');
    }
  },
  
  // Toggle theme
  async toggleTheme() {
    const newTheme = this._settings.theme === 'dark' ? 'light' : 'dark';
    await this.set('theme', newTheme);
  },
  
  // Toggle font
  async toggleFont() {
    // Cycle through: sans -> serif -> mono -> sans
    const fontCycle = { 'sans': 'serif', 'serif': 'mono', 'mono': 'sans' };
    const newFont = fontCycle[this._settings.font] || 'sans';
    await this.set('font', newFont);
  }
};

// Auto-load settings when both DOM and DB are ready
let dbInitialized = false;
let domReady = false;

function tryLoadSettings() {
  if (dbInitialized && domReady) {
    AppSettings.load();
  }
}

// Wait for DB to be ready
if (typeof window !== 'undefined') {
  const checkDB = setInterval(() => {
    if (typeof db !== 'undefined' && db.db) {
      dbInitialized = true;
      clearInterval(checkDB);
      tryLoadSettings();
    }
  }, 50);
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    domReady = true;
    tryLoadSettings();
  });
} else {
  domReady = true;
  tryLoadSettings();
}

/* ========================================
   GLOBAL CONFIGURATION
   Offline-first configuration
   ======================================== */

const CONFIG = {
  // Storage base path
  STORAGE_PATH: '/storage',
  
  // App version
  VERSION: '2.0',
  
  // Helper to get storage path for an app
  getStoragePath: function(appName) {
    return `${this.STORAGE_PATH}/${appName}`;
  }
};

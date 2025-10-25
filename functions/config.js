/* ========================================
   GLOBAL CONFIGURATION
   Offline-first configuration
   ======================================== */

const CONFIG = {
  // Storage base path
  STORAGE_PATH: '/storage',
  
  // App version
  VERSION: '3.0',
  
  // Server configuration (set to null to use direct RSS fetching)
  SERVER_URL: 'https://www.hunter-stroud.com/tabink-server',
  
  // Enable server-side feed fetching
  USE_SERVER_FEEDS: true, // Set to true when SERVER_URL is configured
  
  // Enable automatic database backups
  AUTO_BACKUP: false, // Set to true if you want automatic backups
  
  // Backup interval (in hours)
  BACKUP_INTERVAL: 24,
  
  // Helper to get storage path for an app
  getStoragePath: function(appName) {
    return `${this.STORAGE_PATH}/${appName}`;
  },
  
  // Get feed URL (use server proxy if configured)
  getFeedURL: function(rssFeedUrl) {
    if (this.USE_SERVER_FEEDS && this.SERVER_URL) {
      return `${this.SERVER_URL}/feed.php?url=${encodeURIComponent(rssFeedUrl)}`;
    }
    return rssFeedUrl;
  },
  
  // Get backup endpoint
  getBackupURL: function() {
    if (this.SERVER_URL) {
      return `${this.SERVER_URL}/backup.php`;
    }
    return null;
  }
};

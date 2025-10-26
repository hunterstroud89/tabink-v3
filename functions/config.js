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
  
  // Maximum number of unsaved articles to keep (saved articles are never deleted)
  MAX_ARTICLES: 500,
  
  // Auto-delete articles older than X days (except saved ones)
  MAX_ARTICLE_AGE_DAYS: 30,
  
  // Helper to get storage path for an app
  getStoragePath: function(appName) {
    return `${this.STORAGE_PATH}/${appName}`;
  },
  
  // Get feed URL (use server proxy if configured)
  getFeedURL: function(rssFeedUrl) {
    if (this.USE_SERVER_FEEDS && this.SERVER_URL) {
      return `${this.SERVER_URL}/server.php?action=feed&url=${encodeURIComponent(rssFeedUrl)}`;
    }
    return rssFeedUrl;
  },
  
  // Get backup endpoint
  getBackupURL: function() {
    if (this.SERVER_URL) {
      return `${this.SERVER_URL}/server.php?action=backup`;
    }
    return null;
  }
};

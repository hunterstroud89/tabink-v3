# Server Configuration Guide

This guide explains how to configure Tabink to use your server for RSS feed fetching and database backups.

## Quick Setup

1. **Deploy the server files** to your web server (see tabink-server/README.md)

2. **Update config.js** in your Tabink app:

```javascript
// In /Applications/MAMP/htdocs/tabink-v3/functions/config.js

const CONFIG = {
  // ... existing config ...
  
  // Set your server URL
  SERVER_URL: 'https://your-domain.com/tabink-server',
  
  // Enable server-side features
  USE_SERVER_FEEDS: true,  // Use server to fetch RSS feeds (avoids CORS)
  AUTO_BACKUP: false,      // Enable automatic backups (optional)
  BACKUP_INTERVAL: 24,     // Backup every 24 hours
};
```

3. **Test the connection:**
   - Open Tabink Settings
   - Try "Upload to Server" button
   - Should see success message

## Features

### 1. Server-Side RSS Fetching

**Problem Solved:** Many RSS feeds block direct browser requests (CORS errors)

**How it works:**
- Instead of fetching feeds directly, Tabink sends requests to your server
- Server fetches the RSS feed and returns clean JSON
- No more CORS errors!

**To enable:**
```javascript
SERVER_URL: 'https://your-domain.com/tabink-server',
USE_SERVER_FEEDS: true
```

### 2. Cloud Database Backups

**Features:**
- Manual backup upload from Settings
- Automatic backups (optional)
- Keep last 10 backups
- Download/restore from server dashboard

**Manual Upload:**
1. Open Settings
2. Click "Upload to Server"
3. Database is uploaded with timestamp

**Automatic Backups (optional):**
```javascript
AUTO_BACKUP: true,
BACKUP_INTERVAL: 24  // hours
```

### 3. Server Dashboard

Access your server dashboard at:
```
https://your-domain.com/tabink-server/
```

**Features:**
- View all backups
- Download backups
- Delete old backups
- Quick links to Tabink apps
- Server status monitoring

## Security Notes

### Production Deployment

1. **Use HTTPS only** - Required for secure file uploads

2. **Restrict CORS** (optional):
```apache
# In .htaccess, change from:
Header always set Access-Control-Allow-Origin "*"

# To:
Header always set Access-Control-Allow-Origin "https://your-tabink-domain.com"
```

3. **Add authentication** (optional):
```apache
# In .htaccess
AuthType Basic
AuthName "Tabink Server"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

4. **Monitor storage:**
   - Server keeps last 10 backups automatically
   - Each backup ~500KB - 5MB depending on data
   - ~50MB max total storage

## Troubleshooting

### "Upload to Server" button not showing
- Check CONFIG.SERVER_URL is set in config.js
- Reload the app

### Upload fails
- Verify server URL is correct
- Check server is accessible (try opening in browser)
- Check server logs for errors
- Ensure PHP upload limits are sufficient (50MB)

### Feed fetching still has CORS errors
- Verify USE_SERVER_FEEDS is true
- Check feed.php is working (test directly in browser)
- Clear browser cache

### Server not receiving uploads
- Check .htaccess is being read
- Verify Apache mod_headers is enabled
- Check file permissions on /backups directory

## Testing Checklist

After configuration:

- [ ] Can access server dashboard (index.html)
- [ ] API status shows "Online" (green indicator)
- [ ] Can upload database from Settings
- [ ] Backup appears in dashboard list
- [ ] Can download backup from dashboard
- [ ] Can delete backup from dashboard
- [ ] RSS feeds load without CORS errors (if USE_SERVER_FEEDS enabled)

## Advanced Configuration

### Change Backup Retention

Edit `backup.php`:
```php
define('MAX_BACKUPS', 20);  // Keep 20 instead of 10
```

### Increase Upload Size

Edit `.htaccess`:
```apache
php_value upload_max_filesize 100M
php_value post_max_size 100M
```

Or edit `php.ini`:
```ini
upload_max_filesize = 100M
post_max_size = 100M
```

### Custom Backup Schedule

Implement auto-backup in Tabink:
```javascript
// In your app initialization
if (CONFIG.AUTO_BACKUP) {
  setInterval(() => {
    uploadToServer();
  }, CONFIG.BACKUP_INTERVAL * 60 * 60 * 1000);
}
```

## Getting Help

- Check tabink-server/README.md for server setup
- Check browser console for errors
- Check server PHP error logs
- Verify network requests in browser DevTools

## Local Development

For local testing with MAMP:

```javascript
// Use local MAMP server
SERVER_URL: 'http://localhost:8888/tabink-server',
USE_SERVER_FEEDS: true
```

**Note:** CORS might be restricted on localhost. Add to .htaccess:
```apache
Header always set Access-Control-Allow-Origin "http://localhost:8888"
```

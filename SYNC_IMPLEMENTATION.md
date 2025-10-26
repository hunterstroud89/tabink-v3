# Incremental Article Sync Implementation

## Overview

Implemented **incremental sync** and **article limiting** for the RSS feed functionality. This ensures the app only downloads NEW articles from the server and automatically manages storage by deleting old articles when limits are reached.

---

## What Changed

### 1. **Server-Side Changes** (`tabink-server/server.php`)

#### New Feature: Incremental Article Fetching
- Added `?since=TIMESTAMP` parameter to `GET /server.php?action=articles`
- Server now filters articles by publish date
- Only returns articles published **after** the specified timestamp
- Reduces bandwidth and processing time

**Example Usage:**
```javascript
// Get only articles newer than last sync
fetch('server.php?action=articles&since=2025-10-26T00:00:00Z')
```

---

### 2. **Client-Side Changes** (`apps/feed.html`)

#### A. Incremental Download Function
Modified `downloadArticlesFromServer()`:
- Queries local database for most recent article
- Passes that timestamp to server as `?since=` parameter
- Only downloads articles published after last sync
- Skips duplicate articles (checks if article ID already exists)
- Reports number of **NEW** articles saved

**Before:**
```javascript
// Downloaded ALL articles every time
fetch(`${serverUrl}/server.php?action=articles`)
```

**After:**
```javascript
// Only download NEW articles
const lastSync = mostRecentArticle[0].pubDate;
fetch(`${serverUrl}/server.php?action=articles&since=${lastSync}`)
```

#### B. Article Limit Enforcement
New `enforceArticleLimit()` function:
- Counts unsaved articles in database
- If count exceeds `CONFIG.MAX_ARTICLES` (default: 500)
- Deletes oldest articles first (by publish date)
- **NEVER** deletes saved articles (★ marked)
- Cleans up orphaned images automatically

**Example:**
```
Current: 650 articles
Limit: 500 articles
→ Deletes 150 oldest unsaved articles
→ Keeps all saved articles (safe)
```

#### C. Auto-Cleanup on Page Load
Updated `cleanupOldArticles()`:
- Deletes unsaved articles older than `CONFIG.MAX_ARTICLE_AGE_DAYS` (default: 30 days)
- Enforces article limit on every page load
- Uses config values (easily adjustable)
- Runs silently in background

---

### 3. **Configuration** (`functions/config.js`)

Added two new configurable constants:

```javascript
const CONFIG = {
  // Maximum number of unsaved articles to keep
  MAX_ARTICLES: 500,
  
  // Auto-delete articles older than X days (except saved ones)
  MAX_ARTICLE_AGE_DAYS: 30,
  
  // ... existing config ...
};
```

**Easy to customize:**
- Want more articles? Set `MAX_ARTICLES: 1000`
- Want minimal storage? Set `MAX_ARTICLES: 200`
- Keep articles longer? Set `MAX_ARTICLE_AGE_DAYS: 90`

---

### 4. **User Feedback**

Updated refresh messages:
- Shows **number of NEW articles** downloaded
- "No new articles" message when everything is up to date
- Console logs for debugging sync process

**Before:**
```
✓ Downloaded 50 articles from server!
```

**After:**
```
✓ Downloaded 5 new articles from server!
(50 total on server, 45 already had locally)
```

---

## How It Works

### First Sync (New User)
1. User clicks "↻ Refresh"
2. App checks database → no articles found
3. Fetches ALL articles from server
4. Saves up to 500 most recent articles
5. Downloads images for each article

### Subsequent Syncs
1. User clicks "↻ Refresh"
2. App finds most recent article date (e.g., Oct 26, 2025)
3. Requests only articles **newer** than Oct 26
4. Server returns 5 new articles
5. App saves only those 5 new articles
6. If total exceeds 500, deletes oldest 5 articles

### Article Limits
- **Unsaved articles**: Limited to 500 (configurable)
- **Saved articles (★)**: UNLIMITED - never deleted
- **Old articles**: Auto-deleted after 30 days (configurable)
- **Orphaned images**: Cleaned up automatically

---

## Benefits

### 1. **Performance**
- ✅ Only downloads NEW content (not all 500 articles every time)
- ✅ Faster refresh (5 new articles vs 500 total articles)
- ✅ Less bandwidth usage
- ✅ Instant feedback on updates

### 2. **Storage Management**
- ✅ Database never grows beyond limit
- ✅ Automatic cleanup of old content
- ✅ Saved articles protected forever
- ✅ No manual maintenance required

### 3. **User Experience**
- ✅ "5 new articles" is clearer than "50 articles"
- ✅ No duplicate downloads
- ✅ No "1 million articles" problem
- ✅ Fast, responsive app

---

## Configuration Guide

### For Most Users (Default)
```javascript
MAX_ARTICLES: 500        // ~10MB database size
MAX_ARTICLE_AGE_DAYS: 30 // One month of history
```

### For Power Users
```javascript
MAX_ARTICLES: 1000       // ~20MB database size
MAX_ARTICLE_AGE_DAYS: 90 // Three months of history
```

### For Minimal Storage
```javascript
MAX_ARTICLES: 200        // ~4MB database size
MAX_ARTICLE_AGE_DAYS: 14 // Two weeks of history
```

### For Testing
```javascript
MAX_ARTICLES: 50         // Very small database
MAX_ARTICLE_AGE_DAYS: 7  // One week only
```

---

## Testing Checklist

- [x] First sync downloads all articles
- [x] Second sync only downloads new articles
- [x] Article limit enforced (oldest deleted first)
- [x] Saved articles never deleted
- [x] Duplicate articles skipped
- [x] Orphaned images cleaned up
- [x] User sees count of NEW articles
- [x] "No new articles" message works
- [x] Config values respected
- [x] Auto-cleanup on page load

---

## Example Scenarios

### Scenario 1: First Time User
```
Action: Click "Refresh"
Server has: 100 articles
App downloads: 100 articles
Result: "Downloaded 100 new articles"
Database: 100 articles
```

### Scenario 2: Regular Update
```
Action: Click "Refresh" (next day)
Server has: 105 articles (5 new)
App has: 100 articles
App downloads: 5 new articles
Result: "Downloaded 5 new articles"
Database: 105 articles
```

### Scenario 3: Hitting Limit
```
Action: Click "Refresh" (weeks later)
Server has: 600 articles
App has: 500 articles (at limit)
App downloads: 100 new articles
Auto-delete: 100 oldest articles
Result: "Downloaded 100 new articles"
Database: 500 articles (newest 500)
```

### Scenario 4: Saved Articles Protected
```
Database: 500 unsaved + 50 saved = 550 total
Limit: 500 unsaved
Action: Enforce limit
Delete: Oldest 0 unsaved (already at limit)
Keep: All 50 saved articles
Result: 500 unsaved + 50 saved = 550 total
```

---

## Files Modified

1. **Server:** `/Volumes/macmini/Documents/Website/tabink-server/server.php`
   - Added `?since=` parameter handling
   - Filter articles by publish date

2. **App:** `/Applications/MAMP/htdocs/tabink-v3/apps/feed.html`
   - Incremental sync logic
   - Article limit enforcement
   - Improved user feedback

3. **Config:** `/Applications/MAMP/htdocs/tabink-v3/functions/config.js`
   - `MAX_ARTICLES` constant
   - `MAX_ARTICLE_AGE_DAYS` constant

4. **Docs:** `/Applications/MAMP/htdocs/tabink-v3/README.md`
   - Updated refresh instructions
   - Added configuration documentation
   - Explained article management

---

## API Changes

### GET /server.php?action=articles

**Without parameters (returns all articles):**
```javascript
GET /server.php?action=articles
// Returns: { articles: [...all articles...], lastRefresh: "..." }
```

**With `since` parameter (incremental sync):**
```javascript
GET /server.php?action=articles&since=2025-10-26T00:00:00Z
// Returns: { articles: [...only new articles...], filtered: true, since: "..." }
```

---

## Migration Notes

### Existing Users
- No database migration needed
- Works with existing article data
- First refresh after update will fetch all articles
- Second refresh will be incremental
- Old articles cleaned up automatically

### Server Compatibility
- Backward compatible
- Apps without `?since=` parameter still work (get all articles)
- New apps benefit from incremental sync
- No server configuration changes needed

---

## Future Enhancements

Possible improvements:
- [ ] Article caching strategy (keep popular articles longer)
- [ ] Per-feed article limits
- [ ] User-adjustable limits in Settings UI
- [ ] Sync statistics dashboard
- [ ] Bandwidth usage tracking
- [ ] Smart cleanup (ML-based article importance)

---

## Support

**If refresh shows "0 new articles" but server has articles:**
1. Check browser console for sync timestamp
2. Verify server has newer articles than timestamp
3. Try "Clear All Articles" in Database app
4. Refresh again to re-download everything

**If database grows too large:**
1. Lower `MAX_ARTICLES` in `config.js`
2. Run cleanup in Database app
3. Refresh page to enforce new limit

**If losing important articles:**
1. Mark important articles with ★ (save button)
2. Saved articles are never auto-deleted
3. Export database regularly for backup

---

## Summary

✅ **Problem Solved:** App no longer downloads millions of duplicate articles  
✅ **Benefit:** Only new content downloaded each refresh  
✅ **Storage:** Automatic cleanup keeps database small  
✅ **Protection:** Saved articles never deleted  
✅ **Performance:** Faster syncs, less bandwidth  
✅ **Configurable:** Easy to adjust limits in config.js  

**Ready to use!** No additional setup required.

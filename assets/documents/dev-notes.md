# Tabink Developer Documentation

**Technical reference for Tabink development**

Last updated: October 27, 2025

---

## Table of Contents

- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Storage System](#storage-system)
- [Project Structure](#project-structure)
- [Widget System](#widget-system)
- [Timer Implementation](#timer-implementation)
- [Smart Article Management](#smart-article-management)
- [APK Build Process](#apk-build-process)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Performance Metrics](#performance-metrics)

---

## Architecture

### Tech Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Database**: SQL.js (SQLite compiled to WebAssembly)
- **Storage**: IndexedDB (1-10 GB capacity)
- **UI Framework**: Custom ePaperCSS (Newton MessagePad-inspired)
- **Offline Support**: Service Worker with asset caching
- **PWA**: Manifest.json for installable app

### Design Philosophy

**E-Ink Optimized:**
- No anti-aliasing (`-webkit-font-smoothing: none`)
- High contrast, minimal color palette
- Stippled backgrounds (Newton MessagePad style)
- 2px borders for clear visual separation

**Mobile-First:**
- Touch-friendly targets (minimum 44x44px)
- Responsive grid layouts
- No hover dependencies
- Optimized for 7-10" tablets

**Offline-First:**
- All data stored locally
- No cloud dependencies
- Service worker caching
- Works without internet (except RSS fetch)

---

## Database Schema

### Tables

**settings**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**tasks**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  dueDate TEXT,
  createdAt TEXT NOT NULL
);
```

**notes**
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  createdAt TEXT NOT NULL,
  lastModified TEXT NOT NULL
);
```

**sketches**
```sql
CREATE TABLE sketches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  imageData TEXT NOT NULL,  -- Base64 encoded PNG
  createdAt TEXT NOT NULL,
  lastModified TEXT NOT NULL
);
```

**feed_articles**
```sql
CREATE TABLE feed_articles (
  id TEXT PRIMARY KEY,           -- Hash-based on guid/link
  title TEXT NOT NULL,
  link TEXT,
  content TEXT,
  preview TEXT,
  pubDate TEXT,
  feedUrl TEXT,
  feedName TEXT,
  savedAt TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  saved INTEGER DEFAULT 0
);
```

**feed_images**
```sql
CREATE TABLE feed_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  articleId TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  FOREIGN KEY (articleId) REFERENCES feed_articles(id)
);
```

**rss_feeds**
```sql
CREATE TABLE rss_feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  addedAt TEXT NOT NULL
);
```

---

## Storage System

### Storage Layers

1. **IndexedDB** (Primary Storage)
   - Database name: `tabink`
   - Object store: `database`
   - Key: `sqliteDb`
   - Stores: Serialized SQLite database as Uint8Array
   - Capacity: ~1 GB (Safari), 1-10 GB (Chrome/Android), 200-500 MB (Fire tablets)

2. **Service Worker Cache** (Asset Storage)
   - Cache name: `tabink-v1`
   - Stores: HTML, CSS, JS, WASM, SVG icons
   - Purpose: Offline functionality

### Storage Monitoring

Real-time storage tracking in Settings app:
```javascript
// Get database size
const dbSize = await getDbSize();

// Get total quota (with fallbacks for Safari/Fire tablets)
let quota = 1024 * 1024 * 1024; // Default 1GB
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  quota = estimate.quota || quota;
}
```

**Fallback Strategy:**
- Chrome/Android: StorageManager API (accurate quota)
- Safari: Assume 1GB (conservative estimate)
- Fire Tablets: Assume 1GB (may be 200-500MB actual)

---

## Project Structure

```
tabink-v3/
├── index.html                    # Home page with widget dashboard
├── manifest.json                 # PWA configuration (for GitHub Pages)
│
├── apps/                         # Individual app pages
│   ├── files.html               # Files browser (notes & sketches)
│   ├── tasks.html               # Task manager
│   ├── feed.html                # RSS feed reader
│   ├── timer.html               # Timer app
│   ├── readme.html              # Documentation viewer
│   ├── settings.html            # App settings
│   ├── database.html            # Database tools & browser
│   └── widgets/                 # Widget JavaScript modules
│       ├── files-widget.js      # Recent files widget
│       ├── tasks-widget.js      # Today's tasks widget
│       ├── feed-widget.js       # Recent articles widget
│       └── timer-widget.js      # Timer topbar widget
│
├── assets/                      # Static assets
│   ├── style.css               # Main CSS framework
│   ├── screenshots/            # App screenshots for README
│   ├── documents/              # Developer documentation
│   │   ├── dev-notes.md        # Technical documentation
│   │   ├── SERVER_SETUP.md     # Server configuration guide
│   │   └── SYNC_IMPLEMENTATION.md  # Sync feature docs
│   └── icons/                  # SVG icon sprite & PWA icons
│       ├── icons.svg           # Feather icons sprite
│       ├── icon-192.png        # PWA icon (192x192)
│       └── icon-512.png        # PWA icon (512x512)
│
├── functions/                   # Core JavaScript modules
│   ├── db.js                   # SQLite database wrapper
│   ├── config.js               # App configuration
│   ├── ui.js                   # UI utilities
│   ├── settings.js             # Settings management
│   └── service-worker.js       # Offline support & caching
│
├── lib/                        # Third-party libraries
│   ├── sql-wasm.js            # SQL.js loader
│   ├── sql-wasm.wasm          # SQLite WebAssembly binary (~1 MB)
│   └── marked.min.js          # Markdown parser
│
└── cordova-build/              # APK build environment
    ├── config.xml              # Cordova configuration
    ├── package.json            # Node dependencies
    ├── res/                    # App resources
    │   ├── app-icon.png        # Android app icon
    │   └── splash-screen.png   # Launch splash screen
    ├── www/                    # Project files (copy before build)
    └── platforms/
        └── android/            # Generated Android project
```

**Important:** The `www/` folder should be manually synced before builds:
```bash
cd cordova-build
rm -rf www && mkdir www
cp -R ../index.html ../manifest.json ../apps ../assets ../functions ../lib www/
```

---

## Widget System

### Home Screen Layout

**Row 1: App Icons + Tasks Widget**
```html
<div class="grid" style="grid-template-columns: auto 1fr; gap: 1rem;">
  <!-- App icons column (100px squares) -->
  <div class="grid grid-3">
    <button onclick="location.href='apps/files.html'">Files</button>
    <button onclick="location.href='apps/tasks.html'">Tasks</button>
    <button onclick="location.href='apps/feed.html'">Feed</button>
  </div>
  <!-- Tasks widget (flex 1) -->
  <div id="tasks-widget"></div>
</div>
```

**Row 2: Files Widget + Timer Widget**
```html
<div class="grid" style="grid-template-columns: 2fr 1fr; gap: 1rem;">
  <div id="files-widget"></div>
  <div id="timer-widget"></div>
</div>
```

**Bottom Sections:**
- More Apps: Docs, Settings, Database (grid-3)
- Links: GitHub Repository, Server Page (centered buttons)

### Widget Modules

**tasks-widget.js:**
- Shows 5 upcoming tasks with due dates
- Checkboxes for completion
- Tap task text to edit
- No counter for additional tasks

**files-widget.js:**
- Shows 3 most recent files
- Content preview (first 30 chars) on same line as date
- Creation date aligned right
- Icon indicates note vs sketch

**timer-widget.js:**
- Properties: `interval`, `endTime`, `isRunning`, `pausedRemaining`
- Preset buttons: 15m, 25m, 45m (auto-start)
- Start/Stop/Reset controls
- Topbar widget shows countdown in header
- State saved to localStorage

**feed-widget.js:**
- Shows 5 most recent articles
- Tap to open article popup
- Mark as read/saved from widget

---

## Timer Implementation

### State Management

**Properties:**
```javascript
{
  interval: null,           // setInterval ID
  endTime: null,           // Timestamp when timer ends
  isRunning: false,        // Current state
  pausedRemaining: 1500    // Seconds remaining when paused (default 25:00)
}
```

**localStorage Schema:**
```javascript
{
  timerState: {
    isRunning: boolean,
    pausedRemaining: number,  // Seconds (when paused)
    endTime: number          // Timestamp (when running)
  }
}
```

### Key Functions

**init():**
- Clears any existing intervals
- Restores state from localStorage
- Restarts timer if it was running
- Called on page load and visibility change

**saveState():**
- Saves `pausedRemaining` when paused
- Saves `endTime` when running
- Stores to localStorage immediately

**setTimer(minutes):**
- Converts minutes to seconds
- Auto-starts timer
- Called by preset buttons (15, 25, 45)

**toggle():**
- Start: Calculates endTime, starts interval
- Pause: Calculates pausedRemaining, stops interval
- Updates display and topbar

**updateDisplay():**
- Calculates remaining time from endTime (if running)
- Updates widget and topbar displays
- Plays alarm when time expires

### Persistence Strategy

**Visibility API:**
```javascript
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    timerWidget.init(); // Restart timer if it was running
  }
});

window.addEventListener('focus', () => {
  timerWidget.init();
});
```

**Why this works:**
1. When user navigates away, timer state saved to localStorage
2. When page becomes visible again, `init()` checks localStorage
3. If timer was running, it recalculates time remaining from `endTime`
4. Timer continues from correct time, even if page was unloaded

**Critical:** Always use `pausedRemaining` when paused, `endTime` when running. Never rely on countdown display value alone.

---

## Smart Article Management

### Duplicate Prevention

**Hash-based Article IDs:**
```javascript
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const guid = item.querySelector('guid')?.textContent || 
             link || 
             (title + feedUrl);
const hash = simpleHash(guid);
const articleId = 'article_' + Math.abs(hash).toString(36);
```

**Why this works:**
- Same article always generates same ID
- Refresh won't create duplicates
- Multiple feeds can have same article (different feed URL = different hash)

### Auto-cleanup

**Old Article Removal:**
```javascript
// Delete articles older than 30 days (except saved)
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 30);
db.run(`
  DELETE FROM feed_articles 
  WHERE saved = 0 
    AND savedAt < ?
`, [cutoffDate.toISOString()]);
```

**Article Limits:**
```javascript
// Keep only MAX_ARTICLES most recent unsaved articles
const maxArticles = 500; // Configurable in config.js
db.run(`
  DELETE FROM feed_articles 
  WHERE id NOT IN (
    SELECT id FROM feed_articles 
    WHERE saved = 1
    UNION
    SELECT id FROM feed_articles 
    WHERE saved = 0 
    ORDER BY savedAt DESC 
    LIMIT ?
  )
`, [maxArticles]);
```

**Saved Article Protection:**
- Articles with `saved = 1` never auto-delete
- Star icon in UI marks article as saved
- Saved articles excluded from limits and cleanup

---

## APK Build Process

### Prerequisites

**Environment Variables:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

**Required Tools:**
- Node.js (for Cordova)
- Apache Cordova (`npm install -g cordova`)
- Android SDK Build Tools 35.0.0
- Java 17 (OpenJDK)

### Build Steps

**1. Sync www folder:**
```bash
cd /Applications/MAMP/htdocs/tabink-v3/cordova-build
rm -rf www && mkdir www
cp -R ../index.html ../manifest.json ../apps ../assets ../functions ../lib www/
```

**2. Build APK:**
```bash
cordova build android
```

**3. Copy APK to desktop:**
```bash
cp platforms/android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/tabink.apk
```

### Customization

**App Icon & Splash Screen:**
1. Replace `res/app-icon.png` (512x512 recommended)
2. Replace `res/splash-screen.png` (1920x1920 recommended)
3. Rebuild APK

**Config.xml:**
```xml
<widget id="com.tabink.app" version="3.0.0">
  <name>Tabink</name>
  <description>Offline productivity app</description>
  <preference name="Fullscreen" value="true" />
  <preference name="SplashScreenDelay" value="2000" />
</widget>
```

### Troubleshooting

**Build Errors:**

1. **ANDROID_HOME not found:**
   ```bash
   echo $ANDROID_HOME
   # Add to ~/.zshrc if empty
   ```

2. **JAVA_HOME not found:**
   ```bash
   echo $JAVA_HOME
   # Add to ~/.zshrc if empty
   ```

3. **Build tools not found:**
   ```bash
   sdkmanager --sdk_root=$ANDROID_HOME "build-tools;35.0.0"
   ```

4. **Gradle build failed:**
   ```bash
   cd cordova-build
   rm -rf platforms/android
   cordova platform add android
   cordova build android
   ```

**APK Issues:**

1. **Won't install on Fire Tablet:**
   - Settings → Security → Enable "Apps from Unknown Sources"
   - Or enable for specific app (Files, Silk Browser, etc.)

2. **Shows system bars:**
   - Fire OS may override fullscreen preference
   - This is a Fire OS limitation

3. **Old version installed:**
   - Uninstall old version first
   - Or increase version number in config.xml

---

## Configuration

### functions/config.js

```javascript
const CONFIG = {
  // Server configuration
  SERVER_URL: 'https://www.hunter-stroud.com/tabink-server',
  USE_SERVER_FEEDS: true,
  
  // Article management
  MAX_ARTICLES: 500,           // Maximum unsaved articles to keep
  MAX_ARTICLE_AGE_DAYS: 30,    // Auto-delete articles older than this
  
  // Backup settings
  AUTO_BACKUP: false,
  BACKUP_INTERVAL: 24          // Hours between auto-backups
};
```

**Tuning Article Limits:**
- `MAX_ARTICLES: 500` - Good for tablets with 1GB+ storage
- `MAX_ARTICLES: 200` - Better for Fire tablets (limited storage)
- `MAX_ARTICLES: 1000` - If you want more history

### manifest.json

```json
{
  "name": "Tabink",
  "short_name": "Tabink",
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#e8e8e8",
  "background_color": "#e8e8e8",
  "icons": [
    {
      "src": "./assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "./assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (functions/service-worker.js)

**Cache Strategy:**
```javascript
const CACHE_NAME = 'tabink-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/style.css',
  '/lib/sql-wasm.js',
  '/lib/sql-wasm.wasm',
  // ... add new assets here
];
```

**Update Cache Version:**
Change `CACHE_NAME` to force cache refresh:
```javascript
const CACHE_NAME = 'tabink-v2'; // Increment version
```

---

## Troubleshooting

### Database Issues

**Corruption:**
1. Export database from Settings
2. Clear IndexedDB:
   ```javascript
   indexedDB.deleteDatabase('tabink');
   ```
3. Reload app
4. Import backed up database

**Slow Queries:**
1. Go to Database app
2. Run "Optimize Database" (VACUUM command)
3. Check database size in Settings
4. Consider clearing old articles/sketches

### Service Worker

**Not Updating:**
```javascript
// Force update in browser console
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
});
// Reload page
```

**Cache Issues:**
1. Increment CACHE_NAME version in service-worker.js
2. Clear browser cache
3. Reload page

### RSS Feeds

**CORS Errors:**
Feed.html uses 4 fallback proxies:
1. Direct fetch (may fail on Android)
2. AllOrigins proxy
3. ThingProxy
4. RSS2JSON converter

**Feed Not Loading:**
1. Check feed URL is valid
2. Test in browser: `view-source:FEED_URL`
3. Try adding via server (bypasses CORS)
4. Some feeds may require API keys

### Storage

**Quota Exceeded:**
1. Database app → "Cleanup Old Articles"
2. Delete old notes/sketches
3. Clear completed tasks
4. Run "Optimize Database"

**Storage Monitor Wrong:**
- Safari/Fire tablets may show estimate, not actual quota
- Check browser settings for actual storage usage
- Use "Export Database" to see exact DB file size

---

## Performance Metrics

### App Size
- **HTML/CSS/JS**: ~100 KB
- **SQL.js WASM**: ~1 MB
- **Marked.js**: ~50 KB
- **Total APK**: ~5.3 MB (including Cordova overhead)

### Load Times
- **Cold start**: ~500ms (from service worker cache)
- **Warm start**: ~100ms (already in memory)
- **Database init**: 50-200ms (depends on DB size)
- **Query execution**: <50ms (typical)

### Storage Usage
- **Empty database**: ~50 KB
- **100 notes**: ~200 KB
- **100 tasks**: ~50 KB
- **100 articles**: ~500 KB
- **10 sketches**: 2-5 MB (depends on complexity)
- **500 articles**: ~2.5 MB

### Optimization Tips

**Database:**
- Run VACUUM regularly (Database app → "Optimize Database")
- Clear old articles/sketches
- Keep MAX_ARTICLES at 500 or lower
- Use auto-cleanup (enabled by default)

**Assets:**
- Minimize images in sketches
- Use SVG icons (icons.svg sprite)
- Lazy load images in feed articles
- Service worker caches all assets

**Code:**
- No frameworks = faster load
- Vanilla JS = smaller bundle
- SQL.js compiled to WASM = fast queries
- IndexedDB = large storage capacity

---

## Code Style Guide

### JavaScript

**Naming:**
- Functions: `camelCase`
- Constructors: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_prefixWithUnderscore`

**Indentation:**
- 2 spaces (no tabs)
- No trailing whitespace

**Comments:**
- Document complex logic only
- Use JSDoc for public APIs
- Remove console.logs before commit

**Example:**
```javascript
/**
 * Fetch RSS feed articles from server
 * @param {string} feedUrl - RSS feed URL
 * @returns {Promise<Array>} Array of article objects
 */
async function fetchFeed(feedUrl) {
  try {
    const response = await fetch(feedUrl);
    const xml = await response.text();
    return parseXML(xml);
  } catch (error) {
    console.error('Feed fetch failed:', error);
    return [];
  }
}
```

### CSS

**Selectors:**
- Use classes, not IDs (except for app containers)
- Prefix widget classes with `.widget-`
- Keep specificity low

**Properties:**
- Group related properties
- Use shorthand where possible
- Add comments for non-obvious values

**Example:**
```css
.widget-tasks {
  /* Layout */
  padding: 1rem;
  margin-bottom: 1rem;
  
  /* Visual */
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  
  /* Typography */
  font-family: inherit;
  font-size: 0.9rem;
}
```

### HTML

**Structure:**
- Semantic elements where possible
- Accessibility attributes (aria-label, role)
- No inline styles (use classes)

**Example:**
```html
<div class="widget-tasks" role="region" aria-label="Today's Tasks">
  <h3>Today's Tasks</h3>
  <ul class="task-list">
    <li class="task-item">
      <input type="checkbox" class="task-checkbox" id="task-1">
      <label for="task-1">Example task</label>
    </li>
  </ul>
</div>
```

---

## Git Workflow

### Commit Messages

**Format:**
```
<type>: <subject>

<body>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, CSS changes
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

**Example:**
```
feat: Add timer widget to home screen

- Created timer-widget.js with localStorage persistence
- Added preset buttons (15m, 25m, 45m)
- Integrated with topbar widget
- Timer continues across page navigation
```

### Branch Strategy

**Main branch:**
- Always deployable
- Protected from force push
- All features merged via pull request

**Feature branches:**
```bash
git checkout -b feat/timer-widget
# Make changes
git add .
git commit -m "feat: Add timer widget"
git push origin feat/timer-widget
```

### Deployment

**GitHub Pages:**
```bash
git add .
git commit -m "Release v3.0"
git push origin main
# Auto-deploys to https://hunterstroud89.github.io/tabink-v3/
```

**APK Release:**
```bash
# Sync www folder
cd cordova-build
rm -rf www && mkdir www
cp -R ../index.html ../manifest.json ../apps ../assets ../functions ../lib www/

# Build
cordova build android --release

# Sign APK (if configured)
# Copy to releases folder
cp platforms/android/app/build/outputs/apk/release/app-release.apk ~/Desktop/tabink-v3.0.apk
```

---

## Testing Checklist

### Before Release

**Functionality:**
- [ ] All apps load without errors
- [ ] Database creates on first run
- [ ] Service worker registers
- [ ] Widgets display correctly
- [ ] Timer persists across navigation
- [ ] RSS feeds refresh
- [ ] Export/import database works
- [ ] Sketches save and load
- [ ] Tasks complete/delete
- [ ] Notes auto-save

**Performance:**
- [ ] App loads in <500ms
- [ ] Database queries <50ms
- [ ] No memory leaks (check DevTools)
- [ ] Service worker caches all assets
- [ ] IndexedDB storage works

**Compatibility:**
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (Android)
- [ ] Firefox (desktop)
- [ ] Fire Tablet (Silk browser)
- [ ] APK installs on Android

**Edge Cases:**
- [ ] Empty database
- [ ] Full database (500+ articles)
- [ ] Offline mode (service worker)
- [ ] Low storage warning
- [ ] Corrupt database recovery
- [ ] Timer expires while app closed

### Manual Testing

**Files App:**
1. Create new note
2. Edit note (check auto-save)
3. Delete note
4. Create sketch
5. Save sketch
6. Delete sketch
7. View from widget
8. Edit from widget

**Tasks App:**
1. Add task
2. Set due date
3. Complete task
4. Edit task
5. Delete task
6. Clear completed
7. View in widget
8. Complete from widget

**Feed App:**
1. Add RSS feed
2. Refresh feeds
3. Read article
4. Save article
5. Mark as read
6. Delete article
7. Remove feed
8. View in widget

**Timer:**
1. Set custom time
2. Use preset (15m, 25m, 45m)
3. Start/pause/reset
4. Navigate to different app
5. Return (check timer continued)
6. Let timer expire
7. Check alarm plays

**Settings:**
1. Toggle dark mode
2. Check storage display
3. Export database
4. Import database
5. Clear all data

**Database App:**
1. View all tables
2. Add example data
3. Cleanup old articles
4. Optimize database
5. Clear specific data types

---

## Future Improvements

### Planned Features
- [ ] End-to-end encryption option
- [ ] Optional cloud sync (self-hosted)
- [ ] Rich text editor for notes
- [ ] Task categories and projects
- [ ] Calendar integration
- [ ] Search across all apps
- [ ] Data export to multiple formats (JSON, CSV, Markdown)

### Technical Debt
- [ ] Add unit tests (Jest or similar)
- [ ] Add E2E tests (Playwright)
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Better offline detection
- [ ] Accessibility audit (WCAG compliance)

### Performance Optimizations
- [ ] Lazy load feed images
- [ ] Virtual scrolling for long lists
- [ ] Web Worker for database queries
- [ ] IndexedDB caching layer
- [ ] Compress sketch data

---

## Resources

### Documentation
- [SQL.js Documentation](https://github.com/sql-js/sql.js)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cordova Documentation](https://cordova.apache.org/docs/en/latest/)

### Tools
- [Feather Icons](https://feathericons.com/)
- [ePaperCSS](https://github.com/marcomattes/ePaperCSS)
- [Marked.js](https://marked.js.org/)

### Testing
- Chrome DevTools
- Firefox Developer Tools
- Android Studio (for APK testing)
- BrowserStack (cross-browser testing)

---

**End of Developer Documentation**

*For user-facing documentation, see [README.md](../../README.md)*

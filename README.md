# Tabink

**Offline-first productivity app for Android tablets and mobile devices**

A Newton MessagePad-inspired PWA featuring notes, sketches, tasks, RSS feed reader, and timer—all stored locally with SQLite and IndexedDB.

![Version](https://img.shields.io/badge/version-3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA Ready](https://img.shields.io/badge/PWA-ready-orange)

---

## 📑 Table of Contents

### Quick Start
- [Developer Quick Reference](#-developer-quick-reference) - Build, deploy, and common tasks
- [Getting Started](#-getting-started) - First run and local development
- [User Guide](#-user-guide) - How to use all app features

### Development
- [APK Deployment](#-apk-deployment) - Build Android APK with Cordova
- [Architecture](#️-architecture) - Tech stack and project structure
- [Database Schema](#-database-schema) - SQLite tables and structure
- [Storage System](#️-storage-system) - IndexedDB and caching

### Reference
- [Features](#-features) - Complete feature list
- [Configuration](#-configuration) - Manifest, service worker, RSS feeds
- [Database Tools](#️-database-tools) - Cleanup and optimization
- [Troubleshooting](#-troubleshooting) - Common issues and solutions
- [Performance](#-performance) - App size and load times
- [Privacy & Security](#-privacy--security) - Data handling
- [Roadmap](#️-roadmap) - Planned features
- [Support](#-support) - Getting help

---

## 🚀 Developer Quick Reference

### Build APK
```bash
cd /Applications/MAMP/htdocs/tabink-v3/cordova-build
cordova build android
cp platforms/android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/tabink.apk
```

### Update App Icon or Splash Screen
1. Replace files in `cordova-build/res/`:
   - `app-icon.png` (512x512 recommended)
   - `splash-screen.png` (1920x1920 recommended)
2. Run build command above

### Push Changes to GitHub
```bash
cd /Applications/MAMP/htdocs/tabink-v3
git add .
git commit -m "Your commit message"
git push
```

### Test Locally
```bash
cd /Applications/MAMP/htdocs/tabink-v3
python3 -m http.server 8000
# Open http://localhost:8000
```

### View Live Website
```
https://hunterstroud89.github.io/tabink-v3/
```

### Important Paths
- **Main project**: `/Applications/MAMP/htdocs/tabink-v3/`
- **Build folder**: `/Applications/MAMP/htdocs/tabink-v3/cordova-build/`
- **APK output**: `cordova-build/platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- **Config file**: `cordova-build/config.xml`

### Environment Variables (already set)
```bash
ANDROID_HOME=$HOME/Library/Android/sdk
JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

### Common Tasks

**Rebuild Android platform:**
```bash
cd cordova-build
cordova platform remove android
cordova platform add android
cordova build android
```

**Update Cordova:**
```bash
npm update -g cordova
```

**Clean build cache:**
```bash
cd cordova-build
rm -rf platforms/android/app/build
cordova build android
```

**Check for errors:**
```bash
cd cordova-build
cordova requirements
```

---

## 📖 User Guide

### Getting Started

**First Launch:**
1. App automatically creates database and adds 9 default RSS feeds
2. Home screen shows 4 widgets: Files, Tasks, Feed, Timer
3. Tap any widget to open that app
4. Timer widget stays in top bar (accessible from any screen)

### Files App (Notes & Sketches)

The Files app is a **unified browser** for both notes and sketches. You don't need separate apps - everything is in one place!

**Creating a Note:**
1. Tap **Files** widget or app icon
2. Tap **"+ New Note"**
3. Start typing - first line becomes the title
4. Auto-saves after you stop typing (500ms delay)
5. Tap **"← Back"** to return to file browser

**Creating a Sketch:**
1. Open Files app
2. Tap **"+ New Sketch"**
3. Draw with your finger/stylus
4. Tap **"Save"** when done
5. Enter a title or keep auto-generated name

**Opening from Widget:**
- Tap any file in the Files widget to open it directly
- Edit and it auto-saves
- Tap "Open in Files ↗" to see full file browser

**Organizing Files:**
- Files shown in unified grid view (newest first)
- Notes show text icon, sketches show pencil icon
- Click file icon to open/edit
- Delete button (trash icon) on each file
- All files stored locally - no cloud sync

### Tasks App

**Adding Tasks:**
1. Open Tasks app
2. Type task in the text box
3. Press Enter or tap **"+ Add Task"**
4. Task appears in list with checkbox

**Setting Due Dates:**
1. Tap the calendar icon next to any task
2. Select date from picker
3. Date shows as "Today", "Tomorrow", or "3d" format
4. No due date = checkbox only

**Completing Tasks:**
- Tap checkbox to mark complete
- Completed tasks show with strikethrough
- Tap **"Clear Completed"** to remove all done tasks

**Widget Shortcuts:**
- Home screen Tasks widget shows today's tasks only
- Tap checkbox in widget to complete without opening app
- Overdue tasks stay in widget until completed

### Feed App (RSS Reader)

**Adding Feeds:**
1. Open Feed app
2. Tap **"Manage Feeds"**
3. Tap **"+ Add Feed"**
4. Paste RSS feed URL (e.g., `https://example.com/feed.xml`)
5. Tap **"Add"**

**Reading Articles:**
1. Feed widget shows latest 5 articles
2. Tap article to open in popup
3. Tap article title in popup to open full webpage
4. Mark as read automatically when opened

**Managing Articles:**
- **Save**: Star icon saves article permanently (won't auto-delete)
- **Mark as Read**: Eye icon marks without opening
- **Delete**: Trash icon removes article
- Auto-cleanup: Deletes read articles older than 30 days (saved articles protected)

**Refreshing Feeds:**
1. Open Feed app
2. Tap **"↻ Refresh All Feeds"**
3. Wait for success message
4. New articles appear at top

**Removing Feeds:**
1. Tap **"Manage Feeds"**
2. Tap **"Delete"** next to feed name
3. Confirm deletion
4. All articles from that feed are removed

### Timer

**Setting Timer:**
1. Timer widget always visible in top bar
2. Tap timer widget
3. Enter minutes (e.g., "25" for 25 minutes)
4. Tap **"Start"**
5. Timer counts down in top bar

**Using Timer:**
- Works on any screen (stays in top bar)
- Shows "5:00" format while running
- Alarm sound plays when complete
- Tap **"Stop"** to cancel early
- Tap **"Reset"** to clear and start over

### Settings

**Theme Toggle:**
- Tap **"Toggle Dark Mode"** to switch themes
- Changes apply immediately
- Setting saved to database

**Storage Monitor:**
- Shows database size (e.g., "0.44 MB")
- Shows total storage available (e.g., "~1 GB")
- Updates in real-time as you add/delete data

**Export Database:**
1. Tap **"Export Database"**
2. File downloads as `tabink-backup-YYYY-MM-DD.db`
3. Save to safe location (Dropbox, Google Drive, etc.)
4. Use for backup or transferring to another device

**Import Database:**
1. Tap **"Import Database"**
2. Select `.db` file from previous export
3. Confirm replacement
4. **Warning**: Overwrites all current data!
5. Reload page to see imported data

**Clear All Data:**
- Deletes entire database
- Cannot be undone
- Use Export first if you want backup

### Database App (Advanced)

**Viewing Data:**
- See all tables (tasks, notes, sketches, feeds, articles, settings)
- Browse raw database content
- Check database size and structure

**Cleanup Tools:**
1. **Add Example Data**: Populate with sample content for testing
2. **Cleanup Old Articles**: Remove feed articles >30 days old
3. **Clear All Articles**: Delete all RSS articles (keeps feeds)
4. **Clear All Notes**: Delete all notes
5. **Clear All Sketches**: Delete all sketches
6. **Clear Completed Tasks**: Remove finished tasks only
7. **Reset All Tasks**: Mark all tasks as incomplete
8. **Optimize Database**: Run VACUUM to reclaim space

**When to Use:**
- Database feeling slow? Run "Optimize Database"
- Too much storage used? Clear old articles
- Testing? Add example data
- Fresh start? Use individual clear buttons (safer than "Clear All Data")

### Tips & Tricks

**Offline Usage:**
- All data stored locally - works without internet
- RSS feeds require internet to refresh (but articles stay cached)
- Install as APK for true offline app experience

**Storage Management:**
- Check Settings regularly to monitor storage
- Sketches use most space (2-5 MB each)
- Articles accumulate quickly (cleanup old ones)
- Export database before major cleanup

**Widgets:**
- Home screen widgets update automatically
- Tap widget items for quick actions (complete tasks, open notes)
- Timer widget accessible from any app screen

**Data Safety:**
- Export database weekly if actively using
- No cloud backup = device loss = data loss
- Keep exports in multiple locations
- Consider manual file exports for important notes

**Performance:**
- App loads in ~500ms from cache
- Database queries typically <50ms
- Sketches may lag on older tablets
- Optimize database if queries slow down

---

## ✨ Features

### 📝 Files App (Unified Notes & Sketches)
- **Rich Text Notes**: Write and organize notes with auto-save
- **Sketching Canvas**: Draw and save sketches with touch support
- **Unified Browser**: View all files (notes + sketches) in one grid-based interface
- **Quick Edit**: Edit files from home screen widgets
- **Smart Icons**: Notes show text icon, sketches show pencil icon
- **Export/Import**: Back up individual files or entire database

### ✅ Tasks App
- **Simple Task Management**: Add, complete, and delete tasks
- **Due Dates**: Visual date picker with relative date display (Today, Tomorrow, 3d, etc.)
- **Quick Actions**: Complete, edit due date, or delete tasks inline
- **Clear Completed**: One-click cleanup of finished tasks
- **Persistent Storage**: All tasks saved to SQLite database

### 📰 Feed App (RSS Reader)
- **Multiple RSS Feeds**: Subscribe to any RSS/Atom feed
- **Article Management**: Mark as read, save favorites, delete articles
- **Smart Cleanup**: Auto-delete articles older than 30 days (except saved)
- **Article Limits**: Keep only 100 most recent unsaved articles
- **Duplicate Prevention**: Hash-based article IDs prevent duplicates on refresh
- **Feed Management**: Add, remove, and organize RSS sources

### ⏱️ Timer
- **Simple Countdown**: Set custom timer duration
- **Topbar Widget**: Always accessible from any screen
- **Visual & Audio**: Progress display with alarm notification

### ⚙️ Settings
- **Theme Toggle**: Light/dark mode support
- **Storage Monitor**: Real-time database size and quota tracking
- **Export/Import**: Full database backup and restore
- **Database Tools**: Access via separate Database app

---

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Database**: SQL.js (SQLite compiled to WebAssembly)
- **Storage**: IndexedDB (1-10 GB capacity)
- **UI Framework**: Custom ePaperCSS (Newton MessagePad-inspired)
- **Offline Support**: Service Worker with asset caching
- **PWA**: Manifest.json for installable app

### Project Structure

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
│   └── sql-wasm.wasm          # SQLite WebAssembly binary (~1 MB)
│
└── cordova-build/              # APK build environment
    ├── config.xml              # Cordova configuration
    ├── res/                    # App resources
    │   ├── app-icon.png        # Android app icon
    │   └── splash-screen.png   # Launch splash screen
    ├── www/                    # Symlinked project files
    └── platforms/
        └── android/            # Generated Android project
```

---

## 💾 Database Schema

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

## 🗄️ Storage System

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
- **Database Size**: Actual IndexedDB usage
- **Storage Quota**: Total available storage
- **Storage Used**: Usage with remaining space

Supports StorageManager API (Chrome/Android) with intelligent fallbacks for Safari and Fire tablets.

---

## 🎨 Design Philosophy

### E-Ink Optimized
- No anti-aliasing (`-webkit-font-smoothing: none`)
- High contrast, minimal color palette
- Stippled backgrounds (Newton MessagePad style)
- 2px borders for clear visual separation

### Mobile-First
- Touch-friendly targets (minimum 44x44px)
- Responsive grid layouts
- No hover dependencies
- Optimized for 7-10" tablets

### Offline-First
- All data stored locally
- No cloud dependencies
- Service worker caching
- Works without internet (except RSS fetch)

---

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tabink-v3
   ```

2. **Serve locally** (HTTPS required for service worker)
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### First Run

The app will:
1. Initialize IndexedDB storage
2. Create SQLite database with schema
3. Add default RSS feeds (optional)
4. Register service worker for offline support

---

## 📱 APK Deployment

### Build APK with Cordova

This project uses Apache Cordova to build native Android APKs with full offline support.

**Quick Build:**
```bash
cd cordova-build
cordova build android
cp platforms/android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/tabink.apk
```

### Customize App Icon & Splash Screen

Replace these files in `cordova-build/res/`:
- **app-icon.png** - App launcher icon (512x512 recommended)
- **splash-screen.png** - Launch screen (1920x1920 recommended)

Changes take effect on next build - no code changes needed!

### Configuration

Edit `cordova-build/config.xml` to customize:
- App name and version
- Package ID (com.tabink.app)
- Fullscreen mode
- Splash screen duration
- Android permissions

### Install on Device

**Method 1: USB Transfer**
1. Copy `app-debug.apk` to device
2. Open file and tap "Install"
3. Enable "Install from Unknown Sources" if prompted

**Method 2: ADB**
```bash
adb install ~/Desktop/tabink.apk
```

### Project Structure
```
cordova-build/
├── config.xml          # Cordova configuration
├── res/
│   ├── app-icon.png    # Replace for custom icon
│   └── splash-screen.png  # Replace for custom splash
├── www/                # Symlinked to main project files
│   ├── apps/          → ../../apps
│   ├── assets/        → ../../assets
│   ├── functions/     → ../../functions
│   ├── lib/           → ../../lib
│   ├── index.html     → ../../index.html
│   └── manifest.json  → ../../manifest.json
└── platforms/
    └── android/        # Generated Android project
```

**Note:** The `www/` folder uses symlinks, so any changes to your main project files are automatically included in the next build!

---

## 🔧 Configuration

### Manifest.json

Customize app metadata:
```json
{
  "name": "Tabink",
  "short_name": "Tabink",
  "start_url": "./index.html",
  "display": "standalone",
  "theme_color": "#e8e8e8",
  "background_color": "#e8e8e8"
}
```

### Service Worker

Update cached assets in `service-worker.js`:
```javascript
const CACHE_NAME = 'tabink-v1';
const ASSETS_TO_CACHE = [
  // Add new assets here
];
```

### Default RSS Feeds

Edit in `/apps/feed.html`:
```javascript
async function addDefaultFeeds() {
  const defaultFeeds = [
    { name: 'Your Feed', url: 'https://example.com/feed' }
  ];
  // ...
}
```

---

## 🛠️ Database Tools

Access via **Database** app (database.html):

1. **Add Example Data** - Populate with sample tasks, notes, sketches
2. **Cleanup Old Articles** - Remove feed articles older than 30 days
3. **Clear All Articles** - Delete all RSS feed articles
4. **Clear All Notes** - Delete all notes
5. **Clear All Sketches** - Delete all sketches
6. **Clear Completed Tasks** - Remove finished tasks
7. **Reset All Tasks** - Mark all tasks as incomplete
8. **Optimize Database** - Run VACUUM to reclaim space

### Export/Import

**Export Database:**
- Settings → Export Database
- Downloads: `tabink-backup-YYYY-MM-DD.db`

**Import Database:**
- Settings → Import Database
- Select `.db` file
- Replaces current database

---

## 🎯 Feature Highlights

### Widget System

Home screen widgets provide quick access:
- **Files Widget**: Recent 3 files with preview
- **Tasks Widget**: Today's tasks with quick complete
- **Feed Widget**: Latest 5 articles
- **Timer Widget**: Topbar countdown (accessible everywhere)

### Smart Article Management

- **Hash-based IDs**: Prevents duplicates on refresh
  ```javascript
  const guid = item.querySelector('guid')?.textContent || link || (title + feedUrl);
  const hash = simpleHash(guid);
  const articleId = 'article_' + Math.abs(hash).toString(36);
  ```

- **Auto-cleanup**: Removes articles older than 30 days
- **Article Limits**: Keeps only 100 most recent unsaved articles
- **Saved Protection**: Saved articles never auto-delete

### File Management

- **Auto-save**: Notes save 500ms after typing stops
- **Title Extraction**: First line becomes note title
- **Grid Browser**: Visual file grid with icons and dates
- **Quick Preview**: View files from home without opening app

---

## 🐛 Troubleshooting

### APK Build Errors

**"ANDROID_HOME not found"**
```bash
echo $ANDROID_HOME
# Should show: /Users/hunter/Library/Android/sdk
# If empty, add to ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
source ~/.zshrc
```

**"JAVA_HOME not found"**
```bash
echo $JAVA_HOME
# Should show: /opt/homebrew/opt/openjdk@17
# If empty:
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
source ~/.zshrc
```

**"Build tools not found"**
```bash
sdkmanager --sdk_root=$ANDROID_HOME "build-tools;35.0.0"
```

**"Gradle build failed"**
```bash
cd cordova-build
rm -rf platforms/android
cordova platform add android
cordova build android
```

### APK Won't Install on Fire Tablet

1. Go to Settings → Security
2. Enable "Apps from Unknown Sources"
3. Or enable for specific app (Silk Browser, Files, etc.)
4. Make sure you're installing the **signed** APK, not unsigned

### Symlinks Not Working

**Check if symlinks exist:**
```bash
ls -la /Applications/MAMP/htdocs/tabink-v3/cordova-build/www/
```

**Recreate symlinks:**
```bash
cd /Applications/MAMP/htdocs/tabink-v3/cordova-build
rm -rf www && mkdir www && cd www
ln -s ../../apps ../../assets ../../functions ../../lib ../../index.html ../../manifest.json .
```

### Service Worker Not Updating

```javascript
// Force update
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
});
// Reload page
```

### Database Corruption

1. Export database from Settings
2. Clear browser storage:
   ```javascript
   indexedDB.deleteDatabase('tabink');
   ```
3. Reload app
4. Import backed up database

### RSS Feeds Not Loading (Android)

**Issue**: CORS restrictions

**Solution**: Already implemented with 4 fallback methods in feed.html
- Direct fetch
- AllOrigins proxy
- ThingProxy
- RSS2JSON converter

If still failing, feed URL may be dead - check default feeds in `apps/feed.html` line 120

### Storage Quota Exceeded

1. Go to Database app
2. Use "Cleanup Old Articles"
3. Clear completed tasks
4. Delete old notes/sketches
5. Run "Optimize Database"

### App Shows System Bars on Fire Tablet

**Issue**: Android status bar and navigation bar visible

**Solution**: Already enabled in config.xml:
```xml
<preference name="Fullscreen" value="true" />
```

If still showing, Fire OS may override. Try:
- Swipe down from top to hide status bar
- Or accept it as Fire OS limitation

---

## 📊 Performance

### App Size
- **HTML/CSS/JS**: ~100 KB
- **SQL.js WASM**: ~1 MB
- **Total APK**: ~1.5-2 MB

### Load Times
- **Cold start**: ~500ms
- **Warm start**: ~100ms (cached)
- **Database init**: ~50-200ms

### Storage Usage
- **Empty database**: ~50 KB
- **100 notes**: ~200 KB
- **100 tasks**: ~50 KB
- **100 articles**: ~500 KB
- **10 sketches**: ~2-5 MB (depends on complexity)

---

## 🔐 Privacy & Security

- ✅ **100% Offline**: All data stored locally
- ✅ **No Analytics**: No tracking or telemetry
- ✅ **No Cloud**: No external servers or sync
- ✅ **No Accounts**: No login or registration
- ⚠️ **RSS Feeds**: Fetched from original sources (potential privacy leak)
- ⚠️ **No Encryption**: Database stored in plaintext

### Security Considerations

1. **Device Storage**: Anyone with device access can read data
2. **Browser Storage**: Clearing browser data deletes everything
3. **Backup Important**: No cloud backup means data loss if device fails

---

## 🗺️ Roadmap

### Planned Features
- [ ] End-to-end encryption option
- [ ] Optional cloud sync (self-hosted)
- [ ] Rich text editor for notes
- [ ] Task categories and projects
- [ ] Calendar integration
- [ ] Search across all apps
- [ ] Data export to multiple formats (JSON, CSV, Markdown)

### Potential Enhancements
- [ ] Tagging system
- [ ] Note linking (wiki-style)
- [ ] Pomodoro timer integration
- [ ] Voice notes
- [ ] PDF reader
- [ ] Weather widget

---

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

### Reporting Issues
1. Check existing issues
2. Provide device/browser info
3. Include steps to reproduce
4. Add screenshots if applicable

### Code Style
- No build tools (vanilla JS)
- Indent: 2 spaces
- Naming: camelCase for functions, PascalCase for constructors
- Comments: Document complex logic only
- Console logs: Wrap in DEBUG flag

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **ePaperCSS**: Base CSS framework by marcomattes
- **Feather Icons**: Icon set by Cole Bemis
- **SQL.js**: SQLite for JavaScript by kripken
- **Newton MessagePad**: Design inspiration

---

## 📞 Support

For questions or issues:
- Check the **Developer Quick Reference** section for common tasks
- Review **User Guide** for app usage instructions
- Check inline code comments for technical details
- All documentation is in this README - no separate docs needed

---

**Built with ❤️ for offline productivity on tablets**

*Last updated: October 24, 2025*

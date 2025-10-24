# Tabink

**Offline-first productivity app for Android tablets and mobile devices**

A Newton MessagePad-inspired PWA featuring notes, sketches, tasks, RSS feed reader, and timer—all stored locally with SQLite and IndexedDB.

![Version](https://img.shields.io/badge/version-3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA Ready](https://img.shields.io/badge/PWA-ready-orange)

---

## ✨ Features

### 📝 Files App (Notes & Sketches)
- **Rich Text Notes**: Write and organize notes with auto-save
- **Sketching Canvas**: Draw and save sketches with touch support
- **Unified Browser**: View all files in one grid-based interface
- **Quick Edit**: Edit notes/sketches from home screen widgets
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
├── manifest.json                 # PWA configuration
├── service-worker.js             # Offline support & caching
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
│   ├── style.css               # Main CSS framework (1352 lines)
│   └── icons/                  # SVG icon sprite & app icons
│       ├── icons.svg           # Feather icons sprite
│       ├── icon-192.png        # PWA icon (192x192) [CREATE]
│       └── icon-512.png        # PWA icon (512x512) [CREATE]
│
├── functions/                   # Core JavaScript modules
│   ├── db.js                   # SQLite database wrapper (502 lines)
│   ├── config.js               # App configuration
│   ├── ui.js                   # UI utilities
│   └── settings.js             # Settings management
│
└── lib/                        # Third-party libraries
    ├── sql-wasm.js            # SQL.js loader
    └── sql-wasm.wasm          # SQLite WebAssembly binary (~1 MB)
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

### Prerequisites

1. **Create App Icons** (Required)
   - 192x192 PNG: `/assets/icons/icon-192.png`
   - 512x512 PNG: `/assets/icons/icon-512.png`
   - See: `ICON_CREATION_GUIDE.md`

2. **Test on HTTPS** (Required for PWA features)
   - Service worker requires secure context
   - Use localhost or deploy to HTTPS server

### Build APK Using PWA Builder

1. **Visit PWA Builder**
   ```
   https://www.pwabuilder.com/
   ```

2. **Upload or Enter URL**
   - Option A: Enter hosted URL
   - Option B: Upload project as ZIP

3. **Configure Android Package**
   - Package ID: `com.yourname.tabink`
   - App name: `Tabink`
   - Version: `1.0.0`
   - Icon: Automatically detected from manifest

4. **Download APK**
   - Click "Build My PWA"
   - Select "Android Package"
   - Download signed APK

5. **Install on Device**
   ```bash
   adb install tabink.apk
   ```

### Alternative: Capacitor

```bash
npm install -g @capacitor/cli
capacitor init Tabink com.yourname.tabink
capacitor add android
capacitor copy android
capacitor open android
# Build in Android Studio
```

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

**Solution**: Use CORS proxy
```javascript
const proxyUrl = 'https://corsproxy.io/?';
const feedUrl = proxyUrl + encodeURIComponent(feed.url);
```

### Storage Quota Exceeded

1. Go to Database app
2. Use "Cleanup Old Articles"
3. Clear completed tasks
4. Delete old notes/sketches
5. Run "Optimize Database"

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
- Check `APK_DEPLOYMENT_CHECKLIST.md` for deployment help
- Check `ICON_CREATION_GUIDE.md` for icon creation
- Review inline code comments for technical details

---

**Built with ❤️ for offline productivity on tablets**

*Last updated: October 24, 2025*

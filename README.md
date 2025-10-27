# Tabink

**Offline-first productivity app for Android tablets**

A Newton MessagePad-inspired PWA featuring notes, sketches, tasks, RSS feed reader, and timer—all stored locally with SQLite and IndexedDB.

![Version](https://img.shields.io/badge/version-3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA Ready](https://img.shields.io/badge/PWA-ready-orange)

> 📚 **For detailed technical documentation, see [Developer Notes](./assets/documents/dev-notes.md)**

---

## 📸 Screenshots

![Home Screen](./assets/screenshots/home-screen.png)
*Widget dashboard with app icons, tasks, files, and timer*

![App Interface](./assets/screenshots/app-interface.png)
*Files and tasks interface*

---

## 🚀 Quick Start

### Try It Online
**Live Demo:** [https://hunterstroud89.github.io/tabink-v3/](https://hunterstroud89.github.io/tabink-v3/)

### Install APK (Android)
1. Download latest APK from [releases](https://github.com/hunterstroud89/tabink-v3/releases)
2. Enable "Install from Unknown Sources" in Android settings
3. Open APK file and install
4. Launch Tabink app

### Local Development
```bash
git clone https://github.com/hunterstroud89/tabink-v3.git
cd tabink-v3
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## ✨ Features

### 📝 Files App
- **Rich Text Notes** - Write and organize notes with auto-save
- **Sketching Canvas** - Draw with touch/stylus support
- **Unified Browser** - View all files in one place
- **Quick Edit** - Edit from home screen widgets

### ✅ Tasks App
- **Simple Task Management** - Add, complete, and delete tasks
- **Due Dates** - Visual date picker with relative display
- **Quick Actions** - Complete from widget without opening app
- **Clear Completed** - One-click cleanup

### 📰 Feed App (RSS Reader)
- **Multiple RSS Feeds** - Subscribe to any RSS/Atom feed
- **Article Management** - Mark as read, save favorites
- **Smart Cleanup** - Auto-delete old articles (saved articles protected)
- **Duplicate Prevention** - Hash-based IDs prevent duplicates

### ⏱️ Timer
- **Simple Countdown** - Custom duration or presets (15m, 25m, 45m)
- **Topbar Widget** - Always accessible from any screen
- **Persistent State** - Continues running across navigation
- **Visual & Audio** - Progress display with alarm

### ⚙️ Settings
- **Theme Toggle** - Light/dark mode support
- **Storage Monitor** - Real-time database size tracking
- **Export/Import** - Full database backup and restore
- **Database Tools** - Cleanup and optimization

---

## 📖 User Guide

### First Launch
1. App automatically creates database and adds default RSS feeds
2. Home screen shows widget dashboard:
   - **App Icons** (Files, Tasks, Feed)
   - **Today's Tasks** widget (5 upcoming tasks)
   - **Recent Files** widget (3 recent notes/sketches)
   - **Timer** widget (countdown with presets)
   - **More Apps** section (Docs, Settings, Database)
   - **Links** section (GitHub, Server)
3. Tap any widget or icon to open that app
4. Timer stays in top bar (accessible from any screen)

### Files App
**Create Note:** Tap "Files" → "+ New Note" → Type (auto-saves)  
**Create Sketch:** Tap "Files" → "+ New Sketch" → Draw → Save  
**Edit:** Tap file from widget or Files app  
**Delete:** Tap trash icon on any file

### Tasks App
**Add Task:** Type in text box → Press Enter or "+ Add Task"  
**Set Due Date:** Tap calendar icon → Select date  
**Complete:** Tap checkbox (from app or widget)  
**Delete:** Tap trash icon

### Feed App
**Add Feed:** "Manage Feeds" → "+ Add Feed" → Paste URL → "Add"  
**Read Article:** Tap article title in widget or Feed app  
**Save Article:** Star icon (saved articles never auto-delete)  
**Refresh:** Tap "↻ Refresh" (fetches only new articles)

### Timer
**Set Timer:** Tap timer widget → Enter minutes → "Start"  
**Presets:** Tap 15m, 25m, or 45m button (auto-starts)  
**Controls:** Start/Stop/Reset buttons  
**Topbar:** Shows countdown while running (works on any screen)

### Settings
**Export Database:** "Export Database" → Save file  
**Import Database:** "Import Database" → Select .db file (replaces all data!)  
**Toggle Dark Mode:** "Toggle Dark Mode" (instant apply)  
**Check Storage:** View database size and available space

---

## 🛠️ Developer Quick Reference

### Build APK
```bash
cd /Applications/MAMP/htdocs/tabink-v3/cordova-build

# Sync www folder first (critical!)
rm -rf www && mkdir www
cp -R ../index.html ../manifest.json ../apps ../assets ../functions ../lib www/

# Build
cordova build android

# Copy to desktop
cp platforms/android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/tabink.apk
```

### Update App Icon/Splash
1. Replace `cordova-build/res/app-icon.png` (512x512)
2. Replace `cordova-build/res/splash-screen.png` (1920x1920)
3. Run build command above

### Push to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Important Paths
- **Main project:** `/Applications/MAMP/htdocs/tabink-v3/`
- **Build folder:** `cordova-build/`
- **APK output:** `cordova-build/platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Common Issues
**APK doesn't have updates?** → Sync www folder before build (see above)  
**Build errors?** → Check `ANDROID_HOME` and `JAVA_HOME` environment variables  
**Won't install?** → Enable "Install from Unknown Sources" in Android settings

> 📚 **For detailed build instructions, troubleshooting, and architecture docs, see [Developer Notes](./assets/documents/dev-notes.md)**

---

## 🏗️ Tech Stack

- **Frontend:** Vanilla JavaScript (no frameworks)
- **Database:** SQL.js (SQLite via WebAssembly)
- **Storage:** IndexedDB (1-10 GB capacity)
- **UI:** Custom ePaperCSS (Newton MessagePad-inspired)
- **Offline:** Service Worker with asset caching
- **PWA:** Manifest.json for installable app

---

## 🔐 Privacy & Security

- ✅ **100% Offline** - All data stored locally
- ✅ **No Analytics** - No tracking or telemetry
- ✅ **No Cloud** - No external servers (except RSS feeds)
- ✅ **No Accounts** - No login required
- ⚠️ **No Encryption** - Database stored in plaintext
- ⚠️ **No Cloud Backup** - Device loss = data loss (export regularly!)

---

## 📊 Performance

- **App Size:** ~5.3 MB APK
- **Load Time:** ~500ms from cache
- **Database:** <50ms queries
- **Storage:** 50 KB (empty) to 5+ MB (with sketches)

---

## 🗺️ Roadmap

- [ ] End-to-end encryption
- [ ] Optional cloud sync (self-hosted)
- [ ] Rich text editor
- [ ] Task categories
- [ ] Search across all apps
- [ ] Calendar integration

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

## 📚 Documentation

- **[Developer Notes](./assets/documents/dev-notes.md)** - Complete technical documentation
- **[Server Setup](./assets/documents/SERVER_SETUP.md)** - RSS feed server configuration
- **[Sync Implementation](./assets/documents/SYNC_IMPLEMENTATION.md)** - Feed sync architecture

---

## 🙏 Acknowledgments

- **ePaperCSS** by marcomattes - Base CSS framework
- **Feather Icons** by Cole Bemis - Icon set
- **SQL.js** by kripken - SQLite for JavaScript
- **Newton MessagePad** - Design inspiration

---

**Built with ❤️ for offline productivity on tablets**

*Last updated: October 27, 2025*

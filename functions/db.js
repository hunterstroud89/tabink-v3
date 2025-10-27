/* ========================================
   SQLite Database Manager using SQL.js
   Replaces file-storage.js with SQLite
   ======================================== */

class TabinkDB {
  constructor() {
    this.db = null;
    this.SQL = null;
  }

  // Initialize SQL.js and database
  async init() {
    if (this.db) return; // Already initialized

    // Load SQL.js from local library
    const initSqlJs = window.initSqlJs;
    const scriptPath = document.currentScript?.src || window.location.href;
    const basePath = scriptPath.includes('/functions/') 
      ? '../lib/' 
      : scriptPath.includes('/apps/') 
      ? '../lib/'
      : 'lib/';
    
    this.SQL = await initSqlJs({
      locateFile: file => basePath + file
    });

    // Try to load existing database from IndexedDB
    try {
      const savedDb = await this.loadFromIndexedDB();
      if (savedDb) {
        this.db = new this.SQL.Database(savedDb);
        console.log('Loaded existing database from IndexedDB');
        // Ensure all tables exist (for migrations)
        this.createTables();
      } else {
        // Create new database
        this.db = new this.SQL.Database();
        this.createTables();
        console.log('Created new database');
      }
    } catch (err) {
      console.error('Error loading database:', err);
      // Create new database on error
      this.db = new this.SQL.Database();
      this.createTables();
    }
  }

  // Load database from IndexedDB
  loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('tabink', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('database')) {
          db.createObjectStore('database');
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['database'], 'readonly');
        const store = transaction.objectStore('database');
        const getRequest = store.get('sqliteDb');
        
        getRequest.onsuccess = () => {
          db.close();
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = (err) => {
          db.close();
          reject(err);
        };
      };
      
      request.onerror = (err) => {
        reject(err);
      };
    });
  }

  // Create tables
  createTables() {
    // Settings table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Tasks table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        dueDate TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // Notes table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        createdAt TEXT NOT NULL,
        lastModified TEXT NOT NULL
      )
    `);

    // Feed articles table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS feed_articles (
        id TEXT PRIMARY KEY,
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
      )
    `);

    // Feed images table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS feed_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        articleId TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        FOREIGN KEY (articleId) REFERENCES feed_articles(id)
      )
    `);

    // RSS feeds table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS rss_feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        addedAt TEXT NOT NULL
      )
    `);

    // Sketches table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sketches (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        imageData TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        lastModified TEXT NOT NULL
      )
    `);

    this.save();
  }

  // Save database to IndexedDB instead of localStorage
  save() {
    return new Promise((resolve, reject) => {
      const data = this.db.export();
      const request = indexedDB.open('tabink', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('database')) {
          db.createObjectStore('database');
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['database'], 'readwrite');
        const store = transaction.objectStore('database');
        store.put(data, 'sqliteDb');
        
        transaction.oncomplete = () => {
          db.close();
          console.log('Database saved to IndexedDB successfully');
          resolve();
        };
        
        transaction.onerror = (err) => {
          console.error('Error saving to IndexedDB:', err);
          db.close();
          reject(err);
        };
      };
      
      request.onerror = (err) => {
        console.error('Error opening IndexedDB:', err);
        reject(err);
      };
    });
  }

  // Execute SQL query
  exec(sql, params = []) {
    return this.db.exec(sql, params);
  }

  // Run SQL statement (for INSERT, UPDATE, DELETE)
  run(sql, params = []) {
    this.db.run(sql, params);
    this.save();
  }

  // Get all results from a query
  all(sql, params = []) {
    const results = this.db.exec(sql, params);
    if (results.length === 0) return [];
    
    const columns = results[0].columns;
    const values = results[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  // Get single result
  get(sql, params = []) {
    const results = this.all(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  // TASKS Methods
  async getTasks() {
    return this.all('SELECT * FROM tasks ORDER BY createdAt DESC');
  }

  async addTask(text, dueDate = null) {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    this.run(
      'INSERT INTO tasks (id, text, completed, dueDate, createdAt) VALUES (?, ?, 0, ?, ?)',
      [id, text, dueDate, createdAt]
    );
    return id;
  }

  async updateTask(id, updates) {
    const sets = [];
    const values = [];
    
    if (updates.text !== undefined) {
      sets.push('text = ?');
      values.push(updates.text);
    }
    if (updates.completed !== undefined) {
      sets.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }
    if (updates.dueDate !== undefined) {
      sets.push('dueDate = ?');
      values.push(updates.dueDate);
    }
    
    values.push(id);
    this.run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values);
  }

  async deleteTask(id) {
    this.run('DELETE FROM tasks WHERE id = ?', [id]);
  }

  // NOTES Methods
  async getNotes() {
    return this.all('SELECT * FROM notes ORDER BY lastModified DESC');
  }

  async getNote(id) {
    return this.get('SELECT * FROM notes WHERE id = ?', [id]);
  }

  async saveNote(id, title, content) {
    const existing = this.get('SELECT id FROM notes WHERE id = ?', [id]);
    const now = new Date().toISOString();
    
    if (existing) {
      this.run(
        'UPDATE notes SET title = ?, content = ?, lastModified = ? WHERE id = ?',
        [title, content, now, id]
      );
    } else {
      this.run(
        'INSERT INTO notes (id, title, content, createdAt, lastModified) VALUES (?, ?, ?, ?, ?)',
        [id, title, content, now, now]
      );
    }
  }

  async deleteNote(id) {
    this.run('DELETE FROM notes WHERE id = ?', [id]);
  }

  // SKETCHES Methods
  async getSketches() {
    return this.all('SELECT * FROM sketches ORDER BY lastModified DESC');
  }

  async getSketch(id) {
    return this.get('SELECT * FROM sketches WHERE id = ?', [id]);
  }

  async saveSketch(id, title, imageData) {
    const existing = this.get('SELECT id FROM sketches WHERE id = ?', [id]);
    const now = new Date().toISOString();
    
    if (existing) {
      this.run(
        'UPDATE sketches SET title = ?, imageData = ?, lastModified = ? WHERE id = ?',
        [title, imageData, now, id]
      );
    } else {
      this.run(
        'INSERT INTO sketches (id, title, imageData, createdAt, lastModified) VALUES (?, ?, ?, ?, ?)',
        [id, title, imageData, now, now]
      );
    }
  }

  async deleteSketch(id) {
    this.run('DELETE FROM sketches WHERE id = ?', [id]);
  }

  // Get all files (notes + sketches) for file browser
  async getAllFiles() {
    const notes = await this.getNotes();
    
    // Try to get sketches, but handle if table doesn't exist yet
    let sketches = [];
    try {
      sketches = await this.getSketches();
    } catch (error) {
      console.log('Sketches table not found, will be created on next init');
    }
    
    const files = [
      ...notes.map(note => ({
        ...note,
        type: 'note',
        icon: 'file-text'
      })),
      ...sketches.map(sketch => ({
        ...sketch,
        type: 'sketch',
        icon: 'edit'
      }))
    ];
    
    // Sort by lastModified
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    return files;
  }

  // SETTINGS Methods
  async getSetting(key) {
    const result = this.get('SELECT value FROM settings WHERE key = ?', [key]);
    return result ? JSON.parse(result.value) : null;
  }

  async setSetting(key, value) {
    const existing = this.get('SELECT key FROM settings WHERE key = ?', [key]);
    const jsonValue = JSON.stringify(value);
    
    if (existing) {
      this.run('UPDATE settings SET value = ? WHERE key = ?', [jsonValue, key]);
    } else {
      this.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, jsonValue]);
    }
  }

  // FEED Methods
  async getArticles() {
    // Sort by pubDate in descending order (newest first)
    // Remove datetime() wrapper as it may not parse ISO dates correctly in Safari
    const articles = this.all('SELECT * FROM feed_articles ORDER BY pubDate DESC');
    
    console.log('Debug: First 3 articles from DB:', articles.slice(0, 3).map(a => ({
      title: a.title.substring(0, 50),
      pubDate: a.pubDate,
      feedName: a.feedName
    })));
    
    // Add images to each article
    for (const article of articles) {
      const images = this.all('SELECT imageUrl FROM feed_images WHERE articleId = ?', [article.id]);
      article.images = images.map(img => img.imageUrl);
      article.read = Boolean(article.read);
      article.saved = Boolean(article.saved);
    }
    
    return articles;
  }

  async saveArticle(article) {
    // Insert article
    this.run(`
      INSERT OR REPLACE INTO feed_articles 
      (id, title, link, content, preview, pubDate, feedUrl, feedName, savedAt, read, saved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      article.id,
      article.title,
      article.link || '',
      article.content || '',
      article.preview || '',
      article.pubDate,
      article.feedUrl || '',
      article.feedName || '',
      article.savedAt,
      article.read ? 1 : 0,
      article.saved ? 1 : 0
    ]);

    // Insert images
    if (article.images && article.images.length > 0) {
      this.run('DELETE FROM feed_images WHERE articleId = ?', [article.id]);
      for (const imageUrl of article.images) {
        this.run(
          'INSERT INTO feed_images (articleId, imageUrl) VALUES (?, ?)',
          [article.id, imageUrl]
        );
      }
    }
    
    this.save();
  }

  async updateArticle(id, updates) {
    const sets = [];
    const values = [];
    
    if (updates.read !== undefined) {
      sets.push('read = ?');
      values.push(updates.read ? 1 : 0);
    }
    if (updates.saved !== undefined) {
      sets.push('saved = ?');
      values.push(updates.saved ? 1 : 0);
    }
    
    values.push(id);
    this.run(`UPDATE feed_articles SET ${sets.join(', ')} WHERE id = ?`, values);
  }

  async deleteArticle(id) {
    this.run('DELETE FROM feed_articles WHERE id = ?', [id]);
    this.run('DELETE FROM feed_images WHERE articleId = ?', [id]);
  }

  async clearAllArticles() {
    this.run('DELETE FROM feed_articles');
    this.run('DELETE FROM feed_images');
    this.save();
  }

  async getFeeds() {
    return this.all('SELECT * FROM rss_feeds ORDER BY addedAt DESC');
  }

  async addFeed(name, url) {
    const addedAt = new Date().toISOString();
    this.run('INSERT INTO rss_feeds (name, url, addedAt) VALUES (?, ?, ?)', [name, url, addedAt]);
    this.save();
  }

  async deleteFeed(url) {
    this.run('DELETE FROM rss_feeds WHERE url = ?', [url]);
    this.save();
  }

  // Export database as file
  exportDB() {
    const data = this.db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabink-backup-${new Date().toISOString()}.db`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import database from file
  async importDB(file) {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    this.db = new this.SQL.Database(uint8Array);
    this.save();
  }
}

// Create global instance
const db = new TabinkDB();

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
  await db.init();
});

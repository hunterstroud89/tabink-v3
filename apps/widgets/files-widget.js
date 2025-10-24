/* ========================================
   FILES WIDGET
   ======================================== */

window.FilesWidget = {
  // Load recent files (notes and sketches)
  async load() {
    const files = await db.getAllFiles();
    const widget = document.getElementById('notesWidget');
    
    if (!files || files.length === 0) {
      widget.innerHTML = '<p class="muted text-sm">No files yet.</p>';
      return;
    }
    
    // Show all file types, limit to 3
    const recentFiles = files.slice(0, 3);
    
    widget.innerHTML = recentFiles.map(file => {
      const icon = file.type === 'note' ? 'file-text' : 'edit';
      const preview = file.type === 'note' ? (file.content || '').substring(0, 60) : '';
      
      return `
        <div onclick="FilesWidget.openFile('${file.id}', '${file.type}')" style="cursor: pointer; padding: var(--space-xs) 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: var(--space-xs);">
          <svg class="icon" style="width: 16px; height: 16px; flex-shrink: 0;">
            <use href="#icon-${icon}"></use>
          </svg>
          <div style="flex: 1; min-width: 0;">
            <strong>${this.escapeHtml(file.title)}</strong>
            ${preview ? `<div class="text-sm muted" style="margin-top: 2px;">${this.escapeHtml(preview)}${file.content && file.content.length > 60 ? '...' : ''}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  // Open file in popup on home page
  async openFile(fileId, fileType) {
    if (fileType === 'note') {
      await this.openNotePopup(fileId);
    } else if (fileType === 'sketch') {
      await this.openSketchPopup(fileId);
    }
  },

  // Open note in popup
  async openNotePopup(noteId) {
    const note = await db.getNote(noteId);
    if (!note) return;
    
    const dateStr = this.formatDate(note.lastModified);
    
    const popupHTML = `
      <div class="popup active" style="max-width: 700px;">
        <div class="popup-header" style="align-items: flex-start; padding: var(--space-sm) var(--space-md); min-height: auto;">
          <h3 class="popup-title" style="margin: 0; font-size: 1rem; overflow: visible; white-space: normal; word-wrap: break-word; max-width: calc(100% - 50px);">${this.escapeHtml(note.title)}</h3>
          <button class="close-btn" onclick="hidePopup()" style="flex-shrink: 0;"></button>
        </div>
        <div class="popup-content" style="max-height: 60vh; overflow-y: auto;">
          <textarea id="fileEditorTextarea" style="width: 100%; min-height: 400px; border: none; outline: none; font-family: inherit; font-size: 16px; line-height: 1.6; background: var(--bg-primary); color: var(--text-primary); resize: vertical; padding: var(--space-md);">${this.escapeHtml(note.content || '')}</textarea>
        </div>
        <div class="popup-footer" style="flex-wrap: wrap; gap: var(--space-xs);">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1; min-width: 0;">${dateStr}</span>
          <span style="flex-shrink: 0; white-space: nowrap;">
            <button onclick="FilesWidget.deleteFile('${noteId}', 'note')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Delete</button>
            • <a href="apps/files.html" onclick="localStorage.setItem('files:openNote', '${noteId}')" style="font-family: var(--font-sans); color: inherit; text-decoration: none;">Open in Files ↗</a>
            • <button onclick="FilesWidget.saveAndCloseNote('${noteId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0; font-weight: bold;">Save & Close</button>
          </span>
        </div>
      </div>
      <div class="popup-overlay active" onclick="hidePopup()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Auto-save on input
    const textarea = document.getElementById('fileEditorTextarea');
    let saveTimeout = null;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.saveNote(noteId, textarea.value);
      }, 500);
    });
  },

  // Open sketch in popup
  async openSketchPopup(sketchId) {
    const sketch = await db.getSketch(sketchId);
    if (!sketch) return;
    
    const dateStr = this.formatDate(sketch.lastModified);
    
    const popupHTML = `
      <div class="popup active" style="max-width: 800px;">
        <div class="popup-header" style="align-items: flex-start; padding: var(--space-sm) var(--space-md); min-height: auto;">
          <h3 class="popup-title" style="margin: 0; font-size: 1rem; overflow: visible; white-space: normal; word-wrap: break-word; max-width: calc(100% - 50px);">${this.escapeHtml(sketch.title)}</h3>
          <button class="close-btn" onclick="hidePopup()" style="flex-shrink: 0;"></button>
        </div>
        <div class="popup-content" style="padding: var(--space-md); text-align: center;">
          <img src="${sketch.imageData}" style="max-width: 100%; height: auto; border: 2px solid var(--border-color);" />
        </div>
        <div class="popup-footer" style="flex-wrap: wrap; gap: var(--space-xs);">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1; min-width: 0;">${dateStr}</span>
          <span style="flex-shrink: 0; white-space: nowrap;">
            <button onclick="FilesWidget.deleteFile('${sketchId}', 'sketch')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Delete</button>
            • <a href="apps/files.html" onclick="localStorage.setItem('files:openSketch', '${sketchId}')" style="font-family: var(--font-sans); color: inherit; text-decoration: none;">Open in Files ↗</a>
            • <button onclick="hidePopup()" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0; font-weight: bold;">Close</button>
          </span>
        </div>
      </div>
      <div class="popup-overlay active" onclick="hidePopup()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  },

  // Save note
  async saveNote(noteId, content) {
    const title = content.split('\n')[0].trim() || 'Untitled';
    await db.saveNote(noteId, title, content);
  },

  // Save and close note popup
  async saveAndCloseNote(noteId) {
    const textarea = document.getElementById('fileEditorTextarea');
    if (textarea) {
      await this.saveNote(noteId, textarea.value);
    }
    hidePopup();
    await this.load(); // Reload widget
  },

  // Delete file
  async deleteFile(fileId, fileType) {
    if (confirm('Delete this file?')) {
      if (fileType === 'note') {
        await db.deleteNote(fileId);
      } else if (fileType === 'sketch') {
        await db.deleteSketch(fileId);
      }
      hidePopup();
      await this.load(); // Reload widget
    }
  },

  // Escape HTML helper
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Format date helper
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

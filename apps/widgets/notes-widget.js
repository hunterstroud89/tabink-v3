/* ========================================
   NOTES WIDGET (now shows all files)
   ======================================== */

window.NotesWidget = {
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
        <div onclick="NotesWidget.openFile('${file.id}', '${file.type}')" style="cursor: pointer; padding: var(--space-xs) 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: var(--space-xs);">
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

  // Open file (note or sketch)
  openFile(fileId, fileType) {
    localStorage.setItem(`files:open${fileType === 'note' ? 'Note' : 'Sketch'}`, fileId);
    window.location.href = 'apps/files.html';
  },

  // Open specific note
  openNote(noteId) {
    this.showNoteEditor(noteId);
  },

  // Show note editor popup
  async showNoteEditor(noteId) {
    const note = await db.getNote(noteId);
    if (!note) return;

    const popupHTML = `
      <div class="popup popup-file active" style="max-width: 700px;">
        <div class="popup-header" style="padding: var(--space-sm) var(--space-md); min-height: auto;">
          <h3 class="popup-title" style="font-size: 1rem; margin: 0;">${this.escapeHtml(note.title || 'Untitled')}</h3>
          <button class="close-btn" onclick="NotesWidget.closeNoteEditor('${noteId}')"></button>
        </div>
        <div class="popup-content" style="padding: 0;">
          <textarea id="noteEditorTextarea" 
                    style="width: 100%; height: 60vh; border: none; padding: var(--space-md); font-size: 18px; font-weight: normal; line-height: 1.6; font-family: var(--font-sans); resize: none; outline: none;"
                    placeholder="Start typing...">${this.escapeHtml(note.content || '')}</textarea>
        </div>
        <div class="popup-footer" style="flex-wrap: wrap; gap: var(--space-xs);">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1; min-width: 0;">${this.formatDate(note.lastModified || note.createdAt)}</span>
          <span style="flex-shrink: 0; white-space: nowrap;">
            <button onclick="NotesWidget.deleteNote('${noteId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Delete</button>
             • <a href="apps/files.html" onclick="localStorage.setItem('files:openNote', '${noteId}')" style="font-family: var(--font-sans); color: inherit; text-decoration: none;">Open in Files ↗</a>
             • <button onclick="NotesWidget.closeNoteEditor('${noteId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Save & Close</button>
          </span>
        </div>
      </div>
      <div class="popup-overlay active" onclick="NotesWidget.closeNoteEditor('${noteId}')"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Auto-save on input
    const textarea = document.getElementById('noteEditorTextarea');
    let saveTimeout = null;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.saveNote(noteId, textarea.value);
      }, 500);
    });
  },

  // Save note
  async saveNote(noteId, content) {
    const title = content.split('\n')[0].trim() || 'Untitled';
    await db.saveNote(noteId, title, content);
  },

  // Close note editor
  async closeNoteEditor(noteId) {
    const textarea = document.getElementById('noteEditorTextarea');
    if (textarea) {
      await this.saveNote(noteId, textarea.value);
    }
    hidePopup();
    await this.load(); // Reload widget
  },

  // Delete note
  async deleteNote(noteId) {
    if (confirm('Delete this note?')) {
      await db.deleteNote(noteId);
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

/* ========================================
   FEED WIDGET
   ======================================== */

window.FeedWidget = {
  // Load feed widget with e-ink style images
  async load() {
    try {
      const articles = await db.getArticles();
      if (!articles || articles.length === 0) return;
      
      // Get 3 most recent articles
      const recentArticles = articles.slice(0, 3);
      
      const feedHTML = recentArticles.map((article, index) => {
        const isLast = index === recentArticles.length - 1;
        const preview = article.preview ? article.preview.substring(0, 150) : '';
        const pubDate = article.pubDate ? this.formatTimeAgo(new Date(article.pubDate)) : '';
        
        // Get first image if available
        let imageHTML = '';
        const images = db.all('SELECT imageUrl FROM feed_images WHERE articleId = ? LIMIT 1', [article.id]);
        if (images && images.length > 0) {
          imageHTML = `
            <img src="${images[0].imageUrl}" 
                 alt="" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); border: 2px solid var(--border-color); filter: grayscale(100%) contrast(1.2) brightness(1.1);"
                 onerror="this.style.display='none'">
          `;
        }
        
        return `
          <div style="padding: var(--space-sm) 0; ${!isLast ? 'border-bottom: 2px dashed var(--border-color);' : ''} cursor: pointer;" onclick="FeedWidget.openArticle('${article.id}')">
            <div style="display: flex; gap: var(--space-sm); align-items: start;">
              ${imageHTML}
              <div style="flex: 1; min-width: 0;">
                <div class="bold" style="margin-bottom: var(--space-xs);">${this.escapeHtml(article.title)}</div>
                <div class="text-sm muted" style="margin-bottom: var(--space-xs); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${this.escapeHtml(preview)}</div>
                <div class="text-xs muted">${this.escapeHtml(article.feedName)} • ${pubDate}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      if (feedHTML) {
        document.getElementById('feedWidget').innerHTML = feedHTML;
      }
    } catch (e) {
      console.error('Error loading feed widget:', e);
    }
  },

  // Open article in popup (on home page) or navigate to feed app
  async openArticle(articleId) {
    const articles = await db.getArticles();
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    // Mark as read
    if (!article.read) {
      await db.updateArticle(articleId, { read: true });
    }
    
    const dateStr = new Date(article.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const saveIcon = article.saved ? '★' : '☆';
    
    // Get images for this article
    let imagesHTML = '';
    const images = db.all('SELECT imageUrl FROM feed_images WHERE articleId = ?', [article.id]);
    if (images && images.length > 0) {
      imagesHTML = '<div style="margin-bottom: var(--space-md);">';
      images.forEach(img => {
        imagesHTML += `<img src="${this.escapeHtml(img.imageUrl)}" style="max-width: 100%; height: auto; margin-bottom: var(--space-sm); border: 2px solid var(--border-color); filter: grayscale(100%) contrast(1.2) brightness(1.1);" onerror="this.style.display='none'" />`;
      });
      imagesHTML += '</div>';
    }
    
    // Format content with proper paragraphs
    const decodedContent = this.decodeHtml(article.content || article.preview || 'No content available');
    const formattedContent = decodedContent
      .split('\n\n')
      .map(para => `<p style="margin-bottom: var(--space-md);">${this.escapeHtml(para)}</p>`)
      .join('');
    
    let popupHTML = `
      <div class="popup popup-file active">
        <div class="popup-header" style="align-items: flex-start; padding: var(--space-sm) var(--space-md); min-height: auto;">
          <h3 class="popup-title" style="margin: 0; font-size: 1rem; overflow: visible; white-space: normal; word-wrap: break-word; max-width: calc(100% - 50px);">${this.escapeHtml(article.title)}</h3>
          <button class="close-btn" onclick="hidePopup()" style="flex-shrink: 0;"></button>
        </div>
        <div class="popup-content" style="max-height: 70vh; overflow-y: auto;">
          <div style="padding: var(--space-md); line-height: 1.8; font-size: 16px;">
            ${imagesHTML}
            ${formattedContent}
          </div>
        </div>
        <div class="popup-footer" style="flex-wrap: wrap; gap: var(--space-xs);">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1; min-width: 0;">${this.escapeHtml(article.feedName || 'Unknown')} • ${dateStr}</span>
          <span style="flex-shrink: 0; white-space: nowrap;">
            <button onclick="FeedWidget.toggleSave('${articleId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; padding: 0; font-size: 18px;">${saveIcon}</button>
            <button onclick="FeedWidget.deleteArticle('${articleId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0; margin-left: 8px;">Delete</button>
            ${article.link ? ` • <a href="${this.escapeHtml(article.link)}" target="_blank" style="font-family: var(--font-sans); color: inherit; text-decoration: none;">View online ↗</a>` : ''}
          </span>
        </div>
      </div>
      <div class="popup-overlay active" onclick="hidePopup()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  },

  // Toggle save status
  async toggleSave(articleId) {
    event.stopPropagation();
    const articles = await db.getArticles();
    const article = articles.find(a => a.id === articleId);
    if (article) {
      await db.updateArticle(articleId, { saved: !article.saved });
      hidePopup();
      await this.load(); // Reload widget
    }
  },

  // Delete article
  async deleteArticle(articleId) {
    if (confirm('Delete this article?')) {
      await db.deleteArticle(articleId);
      hidePopup();
      await this.load(); // Reload widget
    }
  },

  // Decode HTML entities
  decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  },

  // Format time ago
  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  // Escape HTML helper
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

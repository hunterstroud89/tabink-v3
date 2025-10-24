/* ========================================
   UI FUNCTIONS
   Simple functions for topbar, popups, and notifications
   ======================================== */

// ========================================
// SETUP
// ========================================

// Call this once when your app loads
// Example: setupUI('notes', {text: 'New', callback: createNote})
// Example with multiple buttons: setupUI('sketches', [{text: 'Save', callback: save}, {text: 'New', callback: create}])
function setupUI(appName, actionButton, popupCallback) {
  createTopbar(appName, actionButton, popupCallback);
  createNotificationArea();
  createPopupArea();
}

// ========================================
// TOPBAR
// ========================================

function createTopbar(appName, actionButton, popupCallback) {
  // Create topbar HTML
  const topbar = document.createElement('header');
  topbar.id = 'topbar';
  
  // Build action buttons HTML
  let actionButtonsHtml = '';
  if (actionButton) {
    const buttons = Array.isArray(actionButton) ? actionButton : [actionButton];
    const buttonsHtml = buttons.map((btn, index) => {
      const attrs = btn.attrs || '';
      const text = btn.text || '';
      return `<button id="topbarActionBtn${index}" class="topbar-action-btn" ${attrs}>${text}</button>`;
    }).join('');
    
    // Wrap multiple buttons in a flex container
    if (buttons.length > 1) {
      actionButtonsHtml = `<div style="display: flex; gap: var(--space-sm);">${buttonsHtml}</div>`;
    } else {
      actionButtonsHtml = buttonsHtml;
    }
  }
  
  topbar.innerHTML = `
    <div class="topbar-breadcrumb">
      <span class="breadcrumb-link" onclick="goHome()">/home</span>
      ${appName && popupCallback ? `<span> / </span><span class="breadcrumb-link" onclick="window.showAppMenu && window.showAppMenu()">${appName}</span>` : appName ? ` / ${appName}` : ''}
    </div>
    ${actionButtonsHtml}
  `;
  
  // Insert at top of page
  document.body.insertBefore(topbar, document.body.firstChild);
  
  // Add click handlers for action buttons
  if (actionButton) {
    const buttons = Array.isArray(actionButton) ? actionButton : [actionButton];
    buttons.forEach((btn, index) => {
      const element = document.getElementById(`topbarActionBtn${index}`);
      if (element && btn.callback) {
        element.onclick = btn.callback;
      }
    });
  }
  
  // Store popup callback globally so breadcrumb can access it
  if (popupCallback) {
    window.showAppMenu = popupCallback;
  }
}

// Go back to home (always one level up from apps folder)
function goHome() {
  window.location.href = '../index.html';
}

// Add a clickable item to the breadcrumb (like "notes ▼")
function addBreadcrumbButton(text, onClick) {
  const breadcrumb = document.querySelector('.topbar-breadcrumb');
  if (!breadcrumb) return;
  
  // Remove the app name part
  const parts = breadcrumb.innerHTML.split(' / ');
  if (parts.length > 1) parts.pop();
  
  // Add the new clickable button
  breadcrumb.innerHTML = parts.join(' / ') + ` / <span class="breadcrumb-button">${text}</span>`;
  
  // Add click handler
  const button = breadcrumb.querySelector('.breadcrumb-button');
  if (button) {
    button.onclick = onClick;
    button.style.cursor = 'pointer';
    button.style.userSelect = 'none';
  }
}

// ========================================
// NOTIFICATIONS
// ========================================

function createNotificationArea() {
  const notification = document.createElement('div');
  notification.id = 'topbarNotification';
  notification.className = 'topbar-notification';
  notification.innerHTML = `
    <div id="notificationMessage" class="notification-message"></div>
    <div id="notificationActions" class="notification-actions"></div>
  `;
  document.body.appendChild(notification);
}

// Show a notification with action buttons
// Example: notify('Delete this?', [
//   {text: 'Cancel', callback: () => {}},
//   {text: 'Delete', style: 'danger', callback: () => deleteItem()}
// ])
function notify(message, buttons = [], duration = 0) {
  console.log('notify() called:', message, buttons);
  
  const notification = document.getElementById('topbarNotification');
  const messageEl = document.getElementById('notificationMessage');
  const actionsEl = document.getElementById('notificationActions');
  
  if (!notification) {
    console.error('topbarNotification element not found!');
    return;
  }
  
  // Set message
  messageEl.textContent = message;
  
  // Create buttons
  actionsEl.innerHTML = '';
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = 'notification-btn' + (btn.style ? ' ' + btn.style : '');
    button.textContent = btn.text;
    button.onclick = () => {
      console.log('Button clicked:', btn.text);
      if (btn.callback) btn.callback();
      hideNotification();
    };
    actionsEl.appendChild(button);
  });
  
  // Show
  console.log('Showing notification');
  notification.classList.add('show');
  
  // Auto-hide
  if (duration > 0) {
    setTimeout(hideNotification, duration);
  }
}

function hideNotification() {
  const notification = document.getElementById('topbarNotification');
  if (notification) {
    notification.classList.remove('show');
  }
}

// ========================================
// POPUP MENU
// ========================================

function createPopupArea() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'popupOverlay';
  overlay.className = 'popup-overlay';
  overlay.onclick = hidePopup;
  document.body.appendChild(overlay);
  
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'popup';
  popup.className = 'popup';
  popup.innerHTML = `
    <div class="popup-header">
      <div id="popupTitle" class="popup-title"></div>
      <button id="popupHeaderBtn" class="popup-btn" style="display: none;"></button>
    </div>
    <div id="popupContent" class="popup-content"></div>
  `;
  document.body.appendChild(popup);
}

// Show a popup menu
// Example: showPopup({
//   title: 'All Notes',
//   headerButton: {text: '+ New', callback: createNote},
//   content: '<div>List of notes...</div>'
// })
function showPopup(options) {
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('popupOverlay');
  const title = document.getElementById('popupTitle');
  const headerBtn = document.getElementById('popupHeaderBtn');
  const content = document.getElementById('popupContent');
  
  if (!popup) return;
  
  // Set title
  title.textContent = options.title || '';
  
  // Set header button
  if (options.headerButton) {
    headerBtn.textContent = options.headerButton.text;
    headerBtn.style.display = 'block';
    headerBtn.onclick = options.headerButton.callback;
  } else {
    headerBtn.style.display = 'none';
  }
  
  // Set content (can be HTML string or function)
  if (typeof options.content === 'function') {
    content.innerHTML = options.content();
  } else {
    content.innerHTML = options.content || '';
  }
  
  // Prevent background scrolling
  document.body.classList.add('no-scroll');
  
  // Show
  popup.classList.add('open');
  overlay.classList.add('active');
}

function hidePopup() {
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('popupOverlay');
  
  if (popup) popup.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  
  // Restore background scrolling
  document.body.classList.remove('no-scroll');
}

// Update popup content without closing it
function updatePopup(content) {
  const contentEl = document.getElementById('popupContent');
  if (contentEl) {
    if (typeof content === 'function') {
      contentEl.innerHTML = content();
    } else {
      contentEl.innerHTML = content || '';
    }
  }
}

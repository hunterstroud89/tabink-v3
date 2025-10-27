/* ========================================
   SIDEBAR WIDGET
   ======================================== */

window.SidebarWidget = {
  // Initialize - restore state from localStorage
  init() {
    // Sidebar doesn't manage timer state anymore, TimerWidget handles it
    this.updateDisplay();
  },
  
  // Toggle sidebar
  toggle() {
    const existing = document.querySelector('.sidebar');
    if (existing) {
      this.close();
    } else {
      this.open();
    }
  },
  
  // Open sidebar
  open() {
    const sidebarHTML = `
      <div class="sidebar" style="position: fixed; top: 0; right: 0; bottom: 0; width: 280px; background: var(--bg-primary); border-left: 2px solid var(--border-color); z-index: 1000; display: flex; flex-direction: column; box-shadow: -4px 0 8px rgba(0,0,0,0.1); overflow-y: auto;">
        <div style="display: flex; justify-content: flex-end; align-items: center; padding: var(--space-md);">
          <button onclick="SidebarWidget.close()" style="padding: var(--space-xs) var(--space-sm); min-height: auto; font-size: 1.2rem; line-height: 1;">✕</button>
        </div>
        
        <div style="padding: var(--space-lg);">
          <!-- Timer Section -->
          <div style="margin-bottom: var(--space-lg);">
            <!-- Display -->
            <div id="timerDisplay" style="font-size: 48px; font-weight: bold; text-align: center; font-family: var(--font-mono); padding: var(--space-md) 0; margin-bottom: var(--space-md);">25:00</div>
            
            <!-- Quick Presets -->
            <div style="margin-bottom: var(--space-md);">
              <label class="bold" style="display: block; margin-bottom: var(--space-sm); font-size: 0.9rem;">Quick Start</label>
              <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                <button onclick="TimerWidget.setTimer(15)">15 minutes</button>
                <button onclick="TimerWidget.setTimer(25)">25 minutes</button>
                <button onclick="TimerWidget.setTimer(45)">45 minutes</button>
              </div>
            </div>
            
            <!-- Controls -->
            <div style="display: flex; gap: var(--space-sm);">
              <button id="startStopBtn" onclick="TimerWidget.toggle()" style="flex: 1;">Start</button>
              <button onclick="TimerWidget.reset()">Reset</button>
            </div>
          </div>
          
          <!-- App Icons -->
          <div style="border-top: 2px solid var(--border-color); padding-top: var(--space-md);">
            <label class="bold" style="display: block; margin-bottom: var(--space-sm);">Apps</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
              <div onclick="SidebarWidget.navigate('files')" style="cursor: pointer; text-align: center; padding: var(--space-md); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised);">
                <svg class="icon icon-lg" style="display: block; margin: 0 auto var(--space-xs);">
                  <use href="#icon-folder"></use>
                </svg>
                <div style="font-size: 0.85rem; font-weight: bold;">Files</div>
              </div>
              
              <div onclick="SidebarWidget.navigate('tasks')" style="cursor: pointer; text-align: center; padding: var(--space-md); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised);">
                <svg class="icon icon-lg" style="display: block; margin: 0 auto var(--space-xs);">
                  <use href="#icon-checkbox"></use>
                </svg>
                <div style="font-size: 0.85rem; font-weight: bold;">Tasks</div>
              </div>
              
              <div onclick="SidebarWidget.navigate('feed')" style="cursor: pointer; text-align: center; padding: var(--space-md); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised);">
                <svg class="icon icon-lg" style="display: block; margin: 0 auto var(--space-xs);">
                  <use href="#icon-file"></use>
                </svg>
                <div style="font-size: 0.85rem; font-weight: bold;">Feed</div>
              </div>
              
              <div onclick="SidebarWidget.navigate('readme')" style="cursor: pointer; text-align: center; padding: var(--space-md); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised);">
                <svg class="icon icon-lg" style="display: block; margin: 0 auto var(--space-xs);">
                  <use href="#icon-file-text"></use>
                </svg>
                <div style="font-size: 0.85rem; font-weight: bold;">Docs</div>
              </div>
              
              <div onclick="SidebarWidget.navigate('settings')" style="cursor: pointer; text-align: center; padding: var(--space-md); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised);">
                <svg class="icon icon-lg" style="display: block; margin: 0 auto var(--space-xs);">
                  <use href="#icon-settings"></use>
                </svg>
                <div style="font-size: 0.85rem; font-weight: bold;">Settings</div>
              </div>
              
              <div onclick="SidebarWidget.navigate('database')" style="cursor: pointer; text-align: center; padding: var(--space-md); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised);">
                <svg class="icon icon-lg" style="display: block; margin: 0 auto var(--space-xs);">
                  <use href="#icon-settings"></use>
                </svg>
                <div style="font-size: 0.85rem; font-weight: bold;">Database</div>
              </div>
            </div>
          </div>
          
          <!-- Links -->
          <div style="border-top: 2px solid var(--border-color); padding-top: var(--space-md); margin-top: var(--space-md);">
            <div style="display: flex; flex-direction: column; gap: var(--space-xs); font-size: 0.85rem;">
              <a href="https://github.com/hunterstroud89/tabink-v3" target="_blank" style="color: inherit; text-decoration: none; padding: var(--space-xs); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised); display: flex; align-items: center; gap: var(--space-xs);">
                <svg class="icon" style="width: 16px; height: 16px;">
                  <use href="#icon-github"></use>
                </svg>
                <span>GitHub Repository</span>
              </a>
              <a href="https://www.hunter-stroud.com/tabink-server/" target="_blank" style="color: inherit; text-decoration: none; padding: var(--space-xs); border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-raised); display: flex; align-items: center; gap: var(--space-xs);">
                <svg class="icon" style="width: 16px; height: 16px;">
                  <use href="#icon-settings"></use>
                </svg>
                <span>Server Page</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="sidebar-overlay" onclick="SidebarWidget.close()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 999;"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    this.updateDisplay();
  },
  
  // Close sidebar
  close() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.remove();
    if (overlay) overlay.remove();
  },
  
  // Navigate to app page (works from any page)
  navigate(appName) {
    // Check if we're on index.html or in apps/ folder
    const currentPath = window.location.pathname;
    if (currentPath.includes('/apps/')) {
      // Already in apps folder
      window.location.href = appName + '.html';
    } else {
      // On index page
      window.location.href = 'apps/' + appName + '.html';
    }
  },
  
  // Update display - reads from TimerWidget
  updateDisplay() {
    const display = document.querySelector('.sidebar #timerDisplay');
    const btn = document.querySelector('.sidebar #startStopBtn');
    
    if (!display || !btn) return;
    
    // Get state from TimerWidget
    if (!TimerWidget.endTime) {
      display.textContent = '25:00';
      btn.textContent = 'Start';
      return;
    }

    const remaining = Math.max(0, TimerWidget.endTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    btn.textContent = TimerWidget.isRunning ? 'Pause' : 'Start';
  }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  SidebarWidget.init();
});

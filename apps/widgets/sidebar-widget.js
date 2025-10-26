/* ========================================
   SIDEBAR WIDGET
   ======================================== */

window.SidebarWidget = {
  timerInterval: null,
  endTime: null,
  isRunning: false,
  
  // Initialize - restore state from localStorage
  init() {
    const saved = localStorage.getItem('timer:state');
    if (saved) {
      const state = JSON.parse(saved);
      this.endTime = state.endTime;
      this.isRunning = state.isRunning;
      
      // If timer was running and hasn't expired, restart the interval
      if (this.isRunning && this.endTime > Date.now()) {
        this.startInterval();
      } else if (this.endTime <= Date.now()) {
        // Timer expired while on another page
        this.isRunning = false;
        this.saveState();
      }
    }
    this.updateDisplay();
  },
  
  // Save state to localStorage
  saveState() {
    localStorage.setItem('timer:state', JSON.stringify({
      endTime: this.endTime,
      isRunning: this.isRunning
    }));
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
                <button onclick="SidebarWidget.setAndStart(15)">15 minutes</button>
                <button onclick="SidebarWidget.setAndStart(25)">25 minutes</button>
                <button onclick="SidebarWidget.setAndStart(45)">45 minutes</button>
              </div>
            </div>
            
            <!-- Controls -->
            <div style="display: flex; gap: var(--space-sm);">
              <button id="startStopBtn" onclick="SidebarWidget.startStop()" style="flex: 1;">Start</button>
              <button onclick="SidebarWidget.reset()">Reset</button>
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
  
  // Set timer to specific minutes
  setTimer(minutes) {
    this.reset();
    this.endTime = Date.now() + (minutes * 60 * 1000);
    this.saveState();
    this.updateDisplay();
  },
  
  // Set timer and start it
  setAndStart(minutes) {
    this.setTimer(minutes);
    if (!this.isRunning) {
      this.startStop();
    }
  },
  
  // Start the interval (internal helper)
  startInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      this.updateDisplay();
      
      const remaining = this.endTime - Date.now();
      if (remaining <= 0) {
        this.timerComplete();
      }
    }, 100);
  },
  
  // Start/Stop timer
  startStop() {
    if (this.isRunning) {
      // Stop
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.isRunning = false;
      this.saveState();
      
      const btn = document.getElementById('startStopBtn');
      if (btn) btn.textContent = 'Start';
    } else {
      // Start
      if (!this.endTime || this.endTime <= Date.now()) {
        this.setTimer(25); // Default 25 minutes
      }
      
      this.isRunning = true;
      this.saveState();
      
      const btn = document.getElementById('startStopBtn');
      if (btn) btn.textContent = 'Stop';
      
      this.startInterval();
    }
  },
  
  // Reset timer
  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    this.endTime = null;
    this.saveState();
    
    const btn = document.getElementById('startStopBtn');
    if (btn) btn.textContent = 'Start';
    
    this.updateDisplay();
  },
  
  // Timer complete
  timerComplete() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    this.saveState();
    
    const btn = document.getElementById('startStopBtn');
    if (btn) btn.textContent = 'Start';
    
    // Alert
    alert('Timer Complete! ⏰');
    
    this.updateDisplay();
  },
  
  // Update display
  updateDisplay() {
    const display = document.getElementById('timerDisplay');
    const button = document.getElementById('timerButton');
    
    // If timer hasn't been set, show default 25:00
    if (!this.endTime && !this.isRunning) {
      if (display) {
        display.textContent = '25:00';
      }
      if (button) {
        button.innerHTML = `<svg class="icon" style="vertical-align: middle;"><use href="#icon-clock"></use></svg>`;
      }
      return;
    }
    
    if (!this.endTime) {
      this.endTime = Date.now() + (25 * 60 * 1000);
    }
    
    const remaining = Math.max(0, this.endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (display) {
      display.textContent = timeStr;
    }
    
    // Update topbar button
    if (button) {
      if (this.isRunning && remaining > 0) {
        button.innerHTML = `<span style="font-family: var(--font-mono); font-size: 0.85rem;">${timeStr}</span>`;
      } else {
        button.innerHTML = `<svg class="icon" style="vertical-align: middle;"><use href="#icon-clock"></use></svg>`;
      }
    }
  }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  SidebarWidget.init();
});

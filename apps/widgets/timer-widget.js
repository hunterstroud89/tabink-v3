/* ========================================
   TIMER WIDGET
   ======================================== */

window.TimerWidget = {
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
  
  // Toggle timer sidebar
  toggle() {
    const existing = document.querySelector('.timer-sidebar');
    if (existing) {
      this.close();
    } else {
      this.open();
    }
  },
  
  // Open timer sidebar
  open() {
    const sidebarHTML = `
      <div class="timer-sidebar" style="position: fixed; top: 0; right: 0; bottom: 0; width: 280px; background: var(--bg-primary); border-left: 2px solid var(--border-color); z-index: 1000; display: flex; flex-direction: column; box-shadow: -4px 0 8px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-md); border-bottom: 2px solid var(--border-color);">
          <h2 style="margin: 0; font-size: 1rem; font-weight: bold;">Timer</h2>
          <button onclick="TimerWidget.close()" style="padding: var(--space-xs) var(--space-sm); min-height: auto; font-size: 1.2rem; line-height: 1;">✕</button>
        </div>
        
        <div style="padding: var(--space-lg);">
          <!-- Display -->
          <div id="timerDisplay" style="font-size: 48px; font-weight: bold; text-align: center; font-family: var(--font-mono); padding: var(--space-lg) 0; margin-bottom: var(--space-lg);">25:00</div>
          
          <!-- Quick Presets -->
          <div style="margin-bottom: var(--space-md);">
            <label class="bold" style="display: block; margin-bottom: var(--space-sm);">Quick Start</label>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <button onclick="TimerWidget.setAndStart(15)">15 minutes</button>
              <button onclick="TimerWidget.setAndStart(25)">25 minutes</button>
              <button onclick="TimerWidget.setAndStart(45)">45 minutes</button>
            </div>
          </div>
          
          <!-- Controls -->
          <div style="display: flex; gap: var(--space-sm);">
            <button id="startStopBtn" onclick="TimerWidget.startStop()" style="flex: 1;">Start</button>
            <button onclick="TimerWidget.reset()">Reset</button>
          </div>
        </div>
      </div>
      <div class="timer-overlay" onclick="TimerWidget.close()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 999;"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    this.updateDisplay();
  },
  
  // Close timer sidebar
  close() {
    const sidebar = document.querySelector('.timer-sidebar');
    const overlay = document.querySelector('.timer-overlay');
    if (sidebar) sidebar.remove();
    if (overlay) overlay.remove();
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
  TimerWidget.init();
});

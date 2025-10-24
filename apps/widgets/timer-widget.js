/* ========================================
   TIMER WIDGET
   ======================================== */

window.TimerWidget = {
  timerInterval: null,
  endTime: null,
  isRunning: false,
  
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
      <div class="timer-sidebar" style="position: fixed; top: 0; right: 0; bottom: 0; width: 320px; background: var(--bg-primary); border-left: 2px solid var(--border-color); z-index: 1000; display: flex; flex-direction: column; box-shadow: -4px 0 8px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-md); border-bottom: 2px solid var(--border-color);">
          <h2 style="margin: 0; font-size: 1rem; font-weight: bold;">Timer</h2>
          <button onclick="TimerWidget.close()" style="padding: var(--space-xs) var(--space-sm); min-height: auto; font-size: 1.2rem; line-height: 1;">✕</button>
        </div>
        
        <div style="flex: 1; padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-lg); overflow-y: auto;">
          <!-- Display -->
          <div id="timerDisplay" style="font-size: 48px; font-weight: bold; text-align: center; font-family: var(--font-mono); padding: var(--space-lg) 0;">25:00</div>
          
          <!-- Quick Presets -->
          <div>
            <label class="bold" style="display: block; margin-bottom: var(--space-sm);">Quick Start</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
              <button onclick="TimerWidget.setTimer(5)">5 min</button>
              <button onclick="TimerWidget.setTimer(10)">10 min</button>
              <button onclick="TimerWidget.setTimer(15)">15 min</button>
              <button onclick="TimerWidget.setTimer(20)">20 min</button>
              <button onclick="TimerWidget.setTimer(25)">25 min</button>
              <button onclick="TimerWidget.setTimer(30)">30 min</button>
            </div>
          </div>
          
          <!-- Custom Time -->
          <div>
            <label class="bold" style="display: block; margin-bottom: var(--space-sm);">Custom Time</label>
            <div style="display: flex; gap: var(--space-sm); align-items: center;">
              <input type="number" id="customMinutes" min="1" max="999" placeholder="Minutes" style="flex: 1; padding: var(--space-sm); border: 2px solid var(--border-color); border-radius: var(--radius-sm);">
              <button onclick="TimerWidget.setCustomTimer()">Set</button>
            </div>
          </div>
          
          <!-- Controls -->
          <div style="display: flex; gap: var(--space-sm); margin-top: auto;">
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
    this.updateDisplay();
  },
  
  // Set custom timer
  setCustomTimer() {
    const input = document.getElementById('customMinutes');
    const minutes = parseInt(input.value);
    if (minutes && minutes > 0) {
      this.setTimer(minutes);
      input.value = '';
    }
  },
  
  // Start/Stop timer
  startStop() {
    if (this.isRunning) {
      // Stop
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.isRunning = false;
      document.getElementById('startStopBtn').textContent = 'Start';
    } else {
      // Start
      if (!this.endTime || this.endTime <= Date.now()) {
        this.setTimer(25); // Default 25 minutes
      }
      
      this.isRunning = true;
      document.getElementById('startStopBtn').textContent = 'Stop';
      
      this.timerInterval = setInterval(() => {
        this.updateDisplay();
        
        const remaining = this.endTime - Date.now();
        if (remaining <= 0) {
          this.timerComplete();
        }
      }, 100);
    }
  },
  
  // Reset timer
  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    this.endTime = Date.now() + (25 * 60 * 1000); // Default 25 minutes
    
    const btn = document.getElementById('startStopBtn');
    if (btn) btn.textContent = 'Start';
    
    this.updateDisplay();
  },
  
  // Timer complete
  timerComplete() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    
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
    
    if (!this.endTime) {
      this.endTime = Date.now() + (25 * 60 * 1000);
    }
    
    const remaining = Math.max(0, this.endTime - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
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
  TimerWidget.updateDisplay();
});

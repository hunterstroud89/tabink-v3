/* ========================================
   TIMER WIDGET
   ======================================== */

window.TimerWidget = {
  interval: null,
  endTime: null,
  isRunning: false,
  pausedRemaining: null, // Store remaining time when paused
  
  // Initialize - restore state from localStorage
  init() {
    // Clear any existing interval to avoid duplicates
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    const saved = localStorage.getItem('timer:state');
    if (saved) {
      const state = JSON.parse(saved);
      this.isRunning = state.isRunning;
      this.pausedRemaining = state.pausedRemaining;
      
      if (this.isRunning && state.endTime) {
        this.endTime = state.endTime;
        // If timer was running and hasn't expired, restart the interval
        if (this.endTime > Date.now()) {
          this.startInterval();
        } else {
          // Timer expired while on another page
          this.isRunning = false;
          this.endTime = Date.now() + (25 * 60 * 1000);
          this.pausedRemaining = 25 * 60 * 1000;
          this.saveState();
        }
      } else if (this.pausedRemaining) {
        // Restore paused state - calculate endTime for display
        this.endTime = Date.now() + this.pausedRemaining;
      } else {
        // Default to 25 minutes
        this.endTime = Date.now() + (25 * 60 * 1000);
        this.pausedRemaining = 25 * 60 * 1000;
      }
    } else {
      // Default to 25 minutes on first load
      this.endTime = Date.now() + (25 * 60 * 1000);
      this.pausedRemaining = 25 * 60 * 1000;
      this.saveState();
    }
    this.updateDisplay();
  },
  
  // Save state to localStorage
  saveState() {
    const state = {
      isRunning: this.isRunning,
      pausedRemaining: this.pausedRemaining
    };
    
    if (this.isRunning) {
      state.endTime = this.endTime;
    }
    
    localStorage.setItem('timer:state', JSON.stringify(state));
  },
  
  // Set timer to specific minutes
  setTimer(minutes) {
    this.endTime = Date.now() + (minutes * 60 * 1000);
    this.pausedRemaining = minutes * 60 * 1000;
    this.isRunning = true; // Auto-start
    this.saveState();
    this.startInterval();
    this.updateDisplay();
  },
  
  // Toggle timer start/stop
  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  },
  
  // Start timer
  start() {
    if (!this.endTime || !this.pausedRemaining) {
      this.endTime = Date.now() + (25 * 60 * 1000);
      this.pausedRemaining = 25 * 60 * 1000;
    } else {
      // Resume from paused state
      this.endTime = Date.now() + this.pausedRemaining;
    }
    this.isRunning = true;
    this.saveState();
    this.startInterval();
    this.updateDisplay();
  },
  
  // Stop timer
  stop() {
    this.isRunning = false;
    // Save the remaining time when pausing
    if (this.endTime) {
      this.pausedRemaining = Math.max(0, this.endTime - Date.now());
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.saveState();
    this.updateDisplay();
  },
  
  // Reset timer
  reset() {
    this.stop();
    this.endTime = Date.now() + (25 * 60 * 1000);
    this.pausedRemaining = 25 * 60 * 1000;
    this.saveState();
    this.updateDisplay();
  },
  
  // Start update interval
  startInterval() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.updateDisplay();
      if (this.endTime && Date.now() >= this.endTime) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  },
  
  // Timer complete callback
  onComplete() {
    alert('Timer finished!');
  },
  
  // Update display
  updateDisplay() {
    const display = document.getElementById('timerDisplay');
    const btn = document.getElementById('timerBtn');
    
    if (!this.endTime) {
      if (display) display.textContent = '25:00';
      if (btn) btn.textContent = 'Start';
      this.updateTopbarButton('25:00');
      return;
    }

    const remaining = Math.max(0, this.endTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (display) display.textContent = timeStr;
    if (btn) btn.textContent = this.isRunning ? 'Pause' : 'Start';
    this.updateTopbarButton(timeStr);
  },
  
  // Update topbar timer button
  updateTopbarButton(timeStr) {
    const topbarBtn = document.getElementById('timerButton');
    if (topbarBtn) {
      if (this.isRunning) {
        topbarBtn.innerHTML = `
          <svg class="icon" style="vertical-align: middle;">
            <use href="#icon-clock"></use>
          </svg> ${timeStr}
        `;
        topbarBtn.style.fontWeight = 'bold';
      } else {
        topbarBtn.innerHTML = `
          <svg class="icon" style="vertical-align: middle;">
            <use href="#icon-clock"></use>
          </svg>
        `;
        topbarBtn.style.fontWeight = 'bold';
      }
    }
  }
};

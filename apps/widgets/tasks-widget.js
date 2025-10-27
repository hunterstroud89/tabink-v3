/* ========================================
   TASKS WIDGET
   ======================================== */

window.TasksWidget = {
  // Load tasks widget
  async load() {
    try {
      const tasks = await db.getTasks();
      if (!tasks || tasks.length === 0) return;
      
      const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);
      
      if (incompleteTasks.length === 0) {
        document.getElementById('tasksWidget').innerHTML = 
          '<p class="muted text-sm">All done! ✓</p>';
        return;
      }
      
      const tasksHTML = '<ul class="task-list">' + 
        incompleteTasks.map(task => {
          let dueDateText = '';
          if (task.dueDate) {
            const dateStr = this.formatDate(task.dueDate);
            dueDateText = `<span class="date-badge" style="cursor: pointer; margin-left: auto;" onclick="TasksWidget.editTaskDate('${task.id}', event)">${dateStr}</span>`;
          } else {
            dueDateText = `<span class="date-badge" style="cursor: pointer; margin-left: auto; opacity: 0.4;" onclick="TasksWidget.editTaskDate('${task.id}', event)">+ date</span>`;
          }
          return `<li style="padding: var(--space-sm) 0; border-bottom: 2px dashed var(--border-color); display: flex; align-items: flex-start; gap: var(--space-sm);">
            <input type="checkbox" class="task-checkbox" id="widget-task-${task.id}" ${task.completed ? 'checked' : ''} onchange="TasksWidget.toggleTask('${task.id}')" style="margin-top: 0.1em;" />
            <span style="flex: 1; font-weight: 600; min-width: 0; cursor: pointer;" onclick="TasksWidget.editTaskText('${task.id}', event)">${this.escapeHtml(task.text)}</span>
            ${dueDateText}
          </li>`;
        }).join('') + 
        '</ul>';
      
      document.getElementById('tasksWidget').innerHTML = tasksHTML;
    } catch (e) {
      console.error('Error loading tasks widget:', e);
    }
  },

  // Show add task popup
  showAddTaskPopup() {
    const popupHTML = `
      <div class="popup active" style="max-width: 500px;">
        <div class="popup-header" style="padding: var(--space-sm) var(--space-md); min-height: auto;">
          <h3 class="popup-title" style="font-size: 1rem; margin: 0;">Add Task</h3>
          <button class="close-btn" onclick="hidePopup()"></button>
        </div>
        <div class="popup-content" style="padding: var(--space-md);">
          <input type="text" 
                 id="newTaskInput" 
                 placeholder="What needs to be done?"
                 style="width: 100%; padding: var(--space-sm); font-size: 16px; border: 2px solid var(--border-color); border-radius: var(--radius-sm); font-family: var(--font-sans);"
                 onkeypress="if(event.key==='Enter') TasksWidget.addTask()">
        </div>
        <div class="popup-footer" style="flex-wrap: wrap; gap: var(--space-xs);">
          <span style="flex: 1;"></span>
          <span style="flex-shrink: 0; white-space: nowrap;">
            <button onclick="hidePopup()" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Cancel</button>
             • <button onclick="TasksWidget.addTask()" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0; font-weight: bold;">Add Task</button>
          </span>
        </div>
      </div>
      <div class="popup-overlay active" onclick="hidePopup()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Focus the input
    setTimeout(() => {
      document.getElementById('newTaskInput').focus();
    }, 100);
  },

  // Add new task
  async addTask() {
    const input = document.getElementById('newTaskInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    await db.addTask(text);
    hidePopup();
    await this.load();
  },

  // Toggle task completion
  async toggleTask(id) {
    const tasks = await db.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      await db.updateTask(id, { completed: !task.completed });
      this.load();
    }
  },

  // Edit task text
  async editTaskText(taskId, event) {
    event.stopPropagation();
    
    const tasks = await db.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const popupHTML = `
      <div class="popup active" style="max-width: 500px;">
        <div class="popup-header" style="padding: var(--space-sm) var(--space-md); min-height: auto;">
          <h3 class="popup-title" style="font-size: 1rem; margin: 0;">Edit Task</h3>
          <button class="close-btn" onclick="hidePopup()"></button>
        </div>
        <div class="popup-content" style="padding: var(--space-md);">
          <input type="text" 
                 id="editTaskInput" 
                 value="${this.escapeHtml(task.text)}"
                 style="width: 100%; padding: var(--space-sm); font-size: 16px; border: 2px solid var(--border-color); border-radius: var(--radius-sm); font-family: var(--font-sans);"
                 onkeypress="if(event.key==='Enter') TasksWidget.saveTaskText('${taskId}')">
        </div>
        <div class="popup-footer" style="flex-wrap: wrap; gap: var(--space-xs);">
          <button onclick="TasksWidget.deleteTask('${taskId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Delete</button>
          <span style="flex: 1;"></span>
          <span style="flex-shrink: 0; white-space: nowrap;">
            <button onclick="hidePopup()" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0;">Cancel</button>
             • <button onclick="TasksWidget.saveTaskText('${taskId}')" style="background: none; border: none; cursor: pointer; font-family: var(--font-sans) !important; color: inherit; text-decoration: underline; padding: 0; font-weight: bold;">Save</button>
          </span>
        </div>
      </div>
      <div class="popup-overlay active" onclick="hidePopup()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Focus and select the input
    setTimeout(() => {
      const input = document.getElementById('editTaskInput');
      input.focus();
      input.select();
    }, 100);
  },

  // Save task text
  async saveTaskText(taskId) {
    const input = document.getElementById('editTaskInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    await db.updateTask(taskId, { text });
    hidePopup();
    await this.load();
  },

  // Delete task
  async deleteTask(taskId) {
    if (confirm('Delete this task?')) {
      await db.deleteTask(taskId);
      hidePopup();
      await this.load();
    }
  },

  // Edit task date
  async editTaskDate(taskId, event, viewYear, viewMonth) {
    event.stopPropagation();
    
    const tasks = await db.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Get current date or today
    const currentDate = task.dueDate ? new Date(task.dueDate) : new Date();
    const year = viewYear !== undefined ? viewYear : currentDate.getFullYear();
    const month = viewMonth !== undefined ? viewMonth : currentDate.getMonth();
    
    // Generate calendar
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendarHTML = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: var(--space-sm);">';
    
    // Day headers
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(day => {
      calendarHTML += `<div style="text-align: center; font-weight: bold; padding: var(--space-xs); font-size: 0.75rem;">${day}</div>`;
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      calendarHTML += '<div></div>';
    }
    
    // Days
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const selectedStr = task.dueDate || '';
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedStr;
      
      let style = 'text-align: center; padding: var(--space-xs); cursor: pointer; border: 2px solid transparent; border-radius: 3px;';
      if (isSelected) {
        style += 'background: var(--bg-stippled) var(--bg-secondary); background-size: var(--bg-stippled-size); border-color: var(--border-color); font-weight: bold;';
      } else if (isToday) {
        style += 'border-color: var(--border-color);';
      }
      
      calendarHTML += `<div style="${style}" onclick="TasksWidget.selectDate('${taskId}', '${dateStr}')">${day}</div>`;
    }
    
    calendarHTML += '</div>';
    
    let popupHTML = `
      <div class="popup active">
        <div class="popup-header">
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <button onclick="TasksWidget.changeMonth('${taskId}', ${year}, ${month}, -1)" style="padding: var(--space-xs) var(--space-sm); border: 2px solid var(--border-color); background: var(--bg-inset); cursor: pointer; border-radius: 3px; font-size: 1em; line-height: 1;">‹</button>
            <h3 class="popup-title" style="margin: 0;">${monthNames[month]} ${year}</h3>
            <button onclick="TasksWidget.changeMonth('${taskId}', ${year}, ${month}, 1)" style="padding: var(--space-xs) var(--space-sm); border: 2px solid var(--border-color); background: var(--bg-inset); cursor: pointer; border-radius: 3px; font-size: 1em; line-height: 1;">›</button>
          </div>
          <button class="close-btn" onclick="hidePopup()"></button>
        </div>
        <div class="popup-content" style="padding: var(--space-md);">
          ${calendarHTML}
          <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
            ${task.dueDate ? '<button onclick="TasksWidget.clearDate(\'' + taskId + '\')">Clear Date</button>' : ''}
            <button onclick="hidePopup()" style="margin-left: auto;">Cancel</button>
          </div>
        </div>
      </div>
      <div class="popup-overlay active" onclick="hidePopup()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  },

  // Change month in calendar
  changeMonth(taskId, year, month, direction) {
    hidePopup();
    let newMonth = month + direction;
    let newYear = year;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    const fakeEvent = { stopPropagation: () => {} };
    this.editTaskDate(taskId, fakeEvent, newYear, newMonth);
  },

  // Select date from calendar
  async selectDate(taskId, dateStr) {
    await db.updateTask(taskId, { dueDate: dateStr });
    this.load();
    hidePopup();
  },

  // Clear task date
  async clearDate(taskId) {
    await db.updateTask(taskId, { dueDate: null });
    this.load();
    hidePopup();
  },

  // Format date helper
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  // Escape HTML helper
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

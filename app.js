// TaskFlow Application - JavaScript Logic

const STORAGE_KEY = 'taskflow_tasks';

// Initialize sample data if empty
function initializeData() {
  let tasks = getTasks();
  if (tasks.length === 0) {
    const sampleTasks = [
      {
        id: 1,
        title: 'Prepare DevOps Assignment',
        description: 'Complete CI/CD pipeline integration assignment using GitHub Actions, Docker Hub, and Render.',
        dueDate: '2026-06-20',
        priority: 'High',
        status: 'Pending'
      },
      {
        id: 2,
        title: 'Create Dockerfile',
        description: 'Create a Dockerfile for containerizing the TaskFlow application.',
        dueDate: '2026-06-18',
        priority: 'Medium',
        status: 'Completed'
      },
      {
        id: 3,
        title: 'Verify Render Deployment',
        description: 'Verify that the application is deployed correctly on Render.',
        dueDate: '2026-06-21',
        priority: 'Low',
        status: 'Pending'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
  }
}

// Get all tasks
function getTasks() {
  const tasks = localStorage.getItem(STORAGE_KEY);
  return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add new task
function addTask(title, description, dueDate, priority) {
  const tasks = getTasks();
  const newTask = {
    id: Date.now(),
    title,
    description,
    dueDate,
    priority,
    status: 'Pending'
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

// Update task status
function updateTaskStatus(taskId, status) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    saveTasks(tasks);
  }
}

// Delete task
function deleteTask(taskId) {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks(tasks);
}

// Get task statistics
function getStats() {
  const tasks = getTasks();
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    completed: tasks.filter(t => t.status === 'Completed').length
  };
}

// Update dashboard stats
function updateDashboardStats() {
  const stats = getStats();
  const totalElement = document.querySelector('[data-stat="total"]');
  const pendingElement = document.querySelector('[data-stat="pending"]');
  const completedElement = document.querySelector('[data-stat="completed"]');
  
  if (totalElement) totalElement.textContent = stats.total;
  if (pendingElement) pendingElement.textContent = stats.pending;
  if (completedElement) completedElement.textContent = stats.completed;
}

// Render task table
function renderTaskTable(filter = 'All') {
  let tasks = getTasks();
  
  // Filter tasks
  if (filter === 'Pending') {
    tasks = tasks.filter(t => t.status === 'Pending');
  } else if (filter === 'Completed') {
    tasks = tasks.filter(t => t.status === 'Completed');
  }
  
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  tasks.forEach(task => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <a href="javascript:void(0)" onclick="selectTask(${task.id})" style="cursor: pointer; color: #174ea6; text-decoration: none;">
          ${task.title}
        </a>
      </td>
      <td>${task.dueDate}</td>
      <td><span class="badge ${task.priority.toLowerCase()}">${task.priority}</span></td>
      <td><span class="badge ${task.status.toLowerCase()}">${task.status}</span></td>
    `;
    tbody.appendChild(row);
  });
  
  if (tasks.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" style="text-align: center; padding: 20px;">No tasks found</td>';
    tbody.appendChild(row);
  }
}

// Select task and display detail
function selectTask(taskId) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    sessionStorage.setItem('selectedTaskId', taskId);
    window.location.href = 'task-detail.html';
  }
}

// Load and display task detail
function loadTaskDetail() {
  const taskId = parseInt(sessionStorage.getItem('selectedTaskId'));
  if (!taskId) {
    const tasks = getTasks();
    if (tasks.length > 0) {
      displayTaskDetail(tasks[0]);
    }
    return;
  }
  
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    displayTaskDetail(task);
  }
}

// Display task detail on page
function displayTaskDetail(task) {
  const detailSection = document.querySelector('main .card');
  if (detailSection) {
    detailSection.innerHTML = `
      <h2>${task.title}</h2>
      <p><strong>Description:</strong> ${task.description}</p>
      <p><strong>Due Date:</strong> ${task.dueDate}</p>
      <p><strong>Priority:</strong> <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span></p>
      <p><strong>Status:</strong> <span class="badge ${task.status.toLowerCase()}">${task.status}</span></p>
      <button class="btn-success" type="button" onclick="completeTask(${task.id})">Mark as Complete</button>
      <button class="btn-danger" type="button" onclick="removeTask(${task.id})">Delete Task</button>
    `;
  }
}

// Mark task as complete
function completeTask(taskId) {
  updateTaskStatus(taskId, 'Completed');
  alert('Task marked as completed!');
  loadTaskDetail();
}

// Remove task
function removeTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    deleteTask(taskId);
    alert('Task deleted!');
    window.location.href = 'task-list.html';
  }
}

// Setup Add Task form
function setupAddTaskForm() {
  const saveBtn = document.querySelector('button[type="button"]');
  if (saveBtn && saveBtn.textContent.includes('Save Task')) {
    saveBtn.onclick = function(e) {
      e.preventDefault();
      
      const title = document.querySelector('#title').value.trim();
      const description = document.querySelector('#description').value.trim();
      const dueDate = document.querySelector('#due-date').value;
      const priority = document.querySelector('#priority').value;
      
      if (!title || !description || !dueDate) {
        alert('Please fill in all fields!');
        return;
      }
      
      addTask(title, description, dueDate, priority);
      alert('Task saved successfully!');
      document.querySelector('form').reset();
      window.location.href = 'task-list.html';
    };
  }
}

// Setup task list filters
function setupTaskListFilters() {
  const buttons = document.querySelectorAll('.filters button');
  buttons.forEach(btn => {
    btn.onclick = function() {
      // Remove active state from all buttons
      buttons.forEach(b => {
        b.style.background = 'rgba(23, 78, 166, 0.2)';
        b.style.color = '#174ea6';
      });
      // Add active state to clicked button
      this.style.background = '#174ea6';
      this.style.color = 'white';
      
      // Render table with filter
      const filter = this.textContent;
      renderTaskTable(filter);
    };
  });
  
  // Set initial state
  if (buttons.length > 0) {
    buttons[0].style.background = '#174ea6';
    buttons[0].style.color = 'white';
    renderTaskTable('All');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  
  // Check which page we're on and initialize accordingly
  const pathname = window.location.pathname;
  
  if (pathname.includes('add-task.html')) {
    setupAddTaskForm();
  } else if (pathname.includes('task-list.html')) {
    setupTaskListFilters();
  } else if (pathname.includes('task-detail.html')) {
    loadTaskDetail();
  } else if (pathname.includes('index.html') || pathname === '/' || pathname.endsWith('/')) {
    updateDashboardStats();
  }
});

class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // Add todo
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text === '') {
            this.showMessage('Please enter a task');
            return;
        }

        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
        input.value = '';
        input.focus();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
    }

    saveEdit(id, newText) {
        const text = newText.trim();
        if (text === '') {
            this.showMessage('Task cannot be empty');
            return;
        }

        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = text;
            this.editingId = null;
            this.saveTodos();
            this.render();
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showMessage('No completed tasks to clear');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    updateStats() {
        const activeCount = this.todos.filter(t => !t.completed).length;
        const countElement = document.getElementById('todoCount');
        const clearBtn = document.getElementById('clearCompleted');
        
        countElement.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
        
        const completedCount = this.todos.filter(t => t.completed).length;
        clearBtn.disabled = completedCount === 0;
        clearBtn.textContent = `Clear Completed (${completedCount})`;
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => {
            if (this.editingId === todo.id) {
                return this.getEditTodoHTML(todo);
            }
            return this.getTodoHTML(todo);
        }).join('');

        // Bind events to new elements
        this.bindTodoEvents();
    }

    getTodoHTML(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="todoApp.toggleTodo('${todo.id}')"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="todoApp.startEdit('${todo.id}')">Edit</button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo('${todo.id}')">Delete</button>
                </div>
            </li>
        `;
    }

    getEditTodoHTML(todo) {
        return `
            <li class="todo-item" data-id="${todo.id}">
                <input 
                    type="text" 
                    class="edit-input" 
                    value="${this.escapeHtml(todo.text)}"
                    maxlength="100"
                    onkeypress="if(event.key === 'Enter') todoApp.saveEdit('${todo.id}', this.value)"
                    onblur="todoApp.saveEdit('${todo.id}', this.value)"
                >
                <div class="todo-actions">
                    <button class="save-btn" onclick="todoApp.saveEdit('${todo.id}', this.parentElement.previousElementSibling.value)">Save</button>
                    <button class="cancel-btn" onclick="todoApp.cancelEdit()">Cancel</button>
                </div>
            </li>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: {
                icon: '📝',
                text: 'No tasks yet. Add your first task above!'
            },
            active: {
                icon: '🎉',
                text: 'All tasks completed! Great job!'
            },
            completed: {
                icon: '📋',
                text: 'No completed tasks yet'
            }
        };

        const message = messages[this.currentFilter];
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${message.icon}</div>
                <div class="empty-state-text">${message.text}</div>
            </div>
        `;
    }

    bindTodoEvents() {
        // Focus on edit input if editing
        if (this.editingId) {
            const editInput = document.querySelector('.edit-input');
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading todos:', e);
            return [];
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const todoApp = new TodoApp();
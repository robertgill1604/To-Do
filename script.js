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
            this.showMessage('Please enter a task', 'error');
            input.style.animation = 'shake 0.3s ease-in-out';
            setTimeout(() => {
                input.style.animation = '';
            }, 300);
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
        
        // Add success animation to the add button
        const addBtn = document.getElementById('addBtn');
        addBtn.style.animation = 'success 0.4s ease-out';
        setTimeout(() => {
            addBtn.style.animation = '';
        }, 400);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            
            // Animate the toggle before re-rendering
            const todoElement = document.querySelector(`[data-id="${id}"]`);
            if (todoElement) {
                const checkbox = todoElement.querySelector('.todo-checkbox');
                const text = todoElement.querySelector('.todo-text');
                
                if (todo.completed) {
                    todoElement.classList.add('completed');
                    text.style.animation = 'strikethrough 0.3s ease-out forwards';
                } else {
                    todoElement.classList.remove('completed');
                    text.style.animation = 'none';
                    text.style.textDecoration = 'none';
                }
            }
            
            setTimeout(() => {
                this.render();
                this.updateStats();
            }, 300);
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const todoElement = document.querySelector(`[data-id="${id}"]`);
            if (todoElement) {
                todoElement.classList.add('removing');
                setTimeout(() => {
                    this.todos = this.todos.filter(t => t.id !== id);
                    this.saveTodos();
                    this.render();
                    this.updateStats();
                }, 400);
            } else {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
                this.updateStats();
            }
        }
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
    }

    saveEdit(id, newText) {
        const text = newText.trim();
        if (text === '') {
            this.showMessage('Task cannot be empty', 'error');
            const editInput = document.querySelector('.edit-input');
            if (editInput) {
                editInput.style.animation = 'shake 0.3s ease-in-out';
                setTimeout(() => {
                    editInput.style.animation = '';
                }, 300);
            }
            return;
        }

        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = text;
            this.editingId = null;
            this.saveTodos();
            this.render();
            this.showMessage('Task updated successfully', 'success');
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Animate filter change
        const todoList = document.getElementById('todoList');
        const items = todoList.querySelectorAll('.todo-item');
        
        // Fade out current items
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px) scale(0.95)';
            }, index * 50);
        });
        
        setTimeout(() => {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
            
            this.render();
        }, items.length * 50 + 200);
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
            this.showMessage('No completed tasks to clear', 'error');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            // Animate completed items removal
            const completedItems = document.querySelectorAll('.todo-item.completed');
            completedItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('removing');
                }, index * 100);
            });

            setTimeout(() => {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveTodos();
                this.render();
                this.updateStats();
                this.showMessage(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'success');
            }, completedItems.length * 100 + 400);
        }
    }

    updateStats() {
        const activeCount = this.todos.filter(t => !t.completed).length;
        const countElement = document.getElementById('todoCount');
        const clearBtn = document.getElementById('clearCompleted');
        
        // Add animation class
        countElement.classList.add('updating');
        
        setTimeout(() => {
            countElement.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
            countElement.classList.remove('updating');
        }, 150);
        
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

    showMessage(message, type = 'error') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        const bgColor = type === 'error' ? '#dc3545' : '#28a745';
        const icon = type === 'error' ? '⚠️' : '✅';
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: messageSlide 0.4s ease-out;
            max-width: 300px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        messageEl.innerHTML = `<span style="font-size: 16px;">${icon}</span> ${message}`;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'messageSlideOut 0.4s ease-in forwards';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 400);
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
    @keyframes messageSlide {
        from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }
    
    @keyframes messageSlideOut {
        from {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const todoApp = new TodoApp();
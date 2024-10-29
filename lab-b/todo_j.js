document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

document.getElementById('add-task').addEventListener('click', addTask);

document.getElementById('search-task').addEventListener('input', filterTasks);

function addTask() {
    const taskInput = document.getElementById('new-task');
    const dateInput = document.getElementById('task-date');
    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value;

    const currentDate = new Date().toISOString().split('T')[0]; // Formatowanie do YYYY-MM-DD

    if (taskText.length < 3 || taskText.length > 255 || (taskDate && taskDate < currentDate)) {
        alert('Wpisz poprawne zadanie i datę (bieżąca lub przyszła).');
        return;
    }

    const task = {
        text: taskText,
        date: taskDate
    };
    createTaskElement(task);
    saveTaskToLocalStorage(task);

    taskInput.value = '';
    dateInput.value = '';
}


function createTaskElement(task) {
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox">
        <span>${task.text}</span>
        ${task.date ? `<span>${task.date}</span>` : ''}
        <button class="delete">🗑️</button>
    `;

    li.addEventListener('click', (e) => {
        if (e.target.tagName === 'SPAN' && e.target === li.children[2]) {
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = task.date;
            dateInput.min = new Date().toISOString().split('T')[0]; // Data bieżąca lub późniejsza

            li.replaceChild(dateInput, li.children[2]);

            dateInput.addEventListener('change', () => {
                if (dateInput.value >= dateInput.min) {
                    task.date = dateInput.value;
                    dateInput.replaceWith(document.createTextNode(task.date));
                    updateLocalStorage();
                } else {
                    alert('Data musi być bieżąca lub przyszła.');
                }
            });

            dateInput.addEventListener('blur', () => {
                dateInput.replaceWith(document.createTextNode(task.date));
            });

            dateInput.focus();
        } else if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            const newText = prompt('Edytuj zadanie:', task.text);
            if (newText && newText.length >= 3 && newText.length <= 255) {
                li.children[1].textContent = newText;
                updateLocalStorage();
            }
        }
    });



    li.querySelector('.delete').addEventListener('click', () => {
        li.remove();
        updateLocalStorage();
    });

    document.getElementById('task-list').appendChild(li);
}

function saveTaskToLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => createTaskElement(task));
}

function updateLocalStorage() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(li => {
        tasks.push({
            text: li.children[1].textContent,
            date: li.children[2] ? li.children[2].textContent : ''
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function filterTasks() {
    const query = this.value.toLowerCase();
    document.querySelectorAll('#task-list li').forEach(li => {
        const taskText = li.children[1].textContent.toLowerCase();

        if (taskText.includes(query)) {
            li.style.display = '';
            li.classList.add('highlight');

            const originalText = li.children[1].textContent;
            const highlightedText = originalText.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
            li.children[1].innerHTML = highlightedText;
        } else {
            li.style.display = 'none';
            li.classList.remove('highlight');

            li.children[1].textContent = li.children[1].textContent;
        }
    });
}


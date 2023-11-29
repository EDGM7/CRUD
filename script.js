document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('crud-form');
    const taskList = document.getElementById('task-list');
    const editForm = document.getElementById('edit-form');
    
    const clearStorageBtn = document.getElementById('clearDataBtn');
    let saveEditBtn; // Declaración global para el botón de guardar editar
    const homeLink = document.getElementById('home-link');
    const crudLink = document.getElementById('crud-link');
    const html5Link = document.getElementById('html5-link');

    const homeContent = document.getElementById('home-content');
    const crudContent = document.getElementById('crud-content');
    const html5Content = document.getElementById('html5-content');

    homeLink.addEventListener('click', function () {
        showContent('home');
    });

    crudLink.addEventListener('click', function () {
        showContent('crud');
    });

    html5Link.addEventListener('click', function () {
        showContent('html5');
    });

    function showContent(contentId) {
        // Ocultar todos los contenidos
        homeContent.style.display = 'none';
        crudContent.style.display = 'none';
        html5Content.style.display = 'none';

        // Mostrar el contenido específico
        const selectedContent = document.getElementById(`${contentId}-content`);
        selectedContent.style.display = 'block';

        // Actualizar la clase 'selected' en los enlaces del menú
        [homeLink, crudLink, html5Link].forEach(link => link.classList.remove('selected'));
        document.getElementById(`${contentId}-link`).classList.add('selected');
    }

   
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        addTask();
    });

    clearStorageBtn.addEventListener('click', function () {
        clearLocalStorage();
        location.reload(); // Recargar la página
    });

    // Agrega el botón "Limpiar Datos" al contenedor de botones dentro del formulario
    document.querySelector('.buttons-container').appendChild(clearStorageBtn);

    // Añade un event listener al formulario de edición
    editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveEditTask();
    });

    saveEditBtn = document.getElementById('saveEditBtn'); // Asignación global del botón de guardar editar

function isTaskDuplicate(newTaskData) {
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    return tasks.some(function (existingTask) {
        return (
            existingTask.task === newTaskData.task &&
            existingTask.description === newTaskData.description &&
            existingTask.dueDate === newTaskData.dueDate
        );
    });
}


function addTask() {
    const taskInput = document.getElementById('task');
    const descriptionInput = document.getElementById('description');
    const dueDateInput = document.getElementById('dueDate');

    const taskValue = taskInput.value.trim();
    const descriptionValue = descriptionInput.value.trim();
    const dueDateValue = dueDateInput.value;

    if (taskValue !== '') {
        const newTaskData = {
            task: taskValue,
            description: descriptionValue,
            dueDate: dueDateValue,
        };

        if (!isTaskDuplicate(newTaskData)) {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');

            const taskText = document.createElement('span');
            taskText.textContent = taskValue;

            const descriptionText = document.createElement('p');
            descriptionText.textContent = descriptionValue;

            const dueDateText = document.createElement('p');
            dueDateText.textContent = dueDateValue ? `Fecha de Vencimiento: ${dueDateValue}` : ''; // Verificar si hay fecha de vencimiento

            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Editar';

            // Establecer el atributo data-original-task
            editBtn.setAttribute('data-original-task', taskValue);

            editBtn.addEventListener('click', function () {
                editTask(taskText, descriptionText, dueDateText, taskValue);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Eliminar';

            deleteBtn.addEventListener('click', function () {
                deleteTask(taskItem);
            });

            taskItem.appendChild(taskText);
            taskItem.appendChild(descriptionText);
            taskItem.appendChild(dueDateText);
            taskItem.appendChild(editBtn);
            taskItem.appendChild(deleteBtn);

            taskList.appendChild(taskItem);

            saveTask(newTaskData);
            taskInput.value = '';
            descriptionInput.value = '';
            dueDateInput.value = '';
        } else {
            alert('La tarea ya existe. Introduce una tarea diferente.');
        }
    }
}

let isEditing = false;

  function editTask(taskText, descriptionText, dueDateText, originalTask) {
    if (isEditing) {
        return; // Evitar abrir múltiples formularios de edición
    }

    isEditing = true;

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const form = document.createElement('form');
    form.innerHTML = `
        <label for="editedTask">Tarea:</label>
        <input type="text" id="editedTask" value="${originalTask}" required>

        <label for="editedDescription">Descripción:</label>
        <textarea id="editedDescription">${descriptionText.textContent}</textarea>

        <label for="editedDueDate">Fecha de Vencimiento:</label>
        <input type="date" id="editedDueDate" value="${dueDateText.textContent.replace('Fecha de Vencimiento: ', '')}">

        <button type="button" id="saveEditBtn">Guardar</button>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    const saveEditBtn = document.getElementById('saveEditBtn');

    // Configura el atributo data-original-task en el botón saveEditBtn
    saveEditBtn.setAttribute('data-original-task', originalTask);

    saveEditBtn.addEventListener('click', function () {
        const editedTask = document.getElementById('editedTask').value.trim();
        const editedDescription = document.getElementById('editedDescription').value.trim();
        const editedDueDate = document.getElementById('editedDueDate').value;

        if (editedTask !== '') {
            const tasks = JSON.parse(localStorage.getItem('tasks'));

            const editedTasks = tasks.map(function (taskData) {
                if (taskData.task === originalTask) {
                    return {
                        task: editedTask,
                        description: editedDescription,
                        dueDate: editedDueDate,
                    };
                } else {
                    return taskData;
                }
            });

            localStorage.setItem('tasks', JSON.stringify(editedTasks));

            taskText.textContent = editedTask;
            descriptionText.textContent = editedDescription;
            dueDateText.textContent = `Fecha de Vencimiento: ${editedDueDate}`;

            // Después de llenar el formulario de edición, muestra el formulario de edición y oculta el de agregar
            editForm.style.display = 'flex';
            form.style.display = 'none';
            modal.remove();

            isEditing = false; // Restablecer el estado de edición
        }
    });
}


function deleteTask(taskItem) {
    const taskText = taskItem.firstChild.textContent;
    let tasks = JSON.parse(localStorage.getItem('tasks'));

    tasks = tasks.filter(function (task) {
        return task.task !== taskText;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Eliminar la tarea del DOM
    taskList.removeChild(taskItem);

    // Recargar las tareas restantes
    loadTasks();
}



    // Función para guardar tarea en LocalStorage con más datos
    function saveTask(taskData) {
        let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
        tasks.push(taskData);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }


// Función para cargar tareas almacenadas en LocalStorage con más datos
function loadTasks() {
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];

    // Limpiar el contenido actual del contenedor de tareas
    taskList.innerHTML = '';

    tasks.forEach(function (taskData) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');

        const taskText = document.createElement('span');
        taskText.textContent = taskData.task;

        const descriptionText = document.createElement('p');
        descriptionText.textContent = taskData.description;

        const dueDateText = document.createElement('p');
        dueDateText.textContent = taskData.dueDate ? `Fecha de Vencimiento: ${taskData.dueDate}` : '';

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'Editar';

        // Establecer el atributo data-original-task
        editBtn.setAttribute('data-original-task', taskData.task);

        editBtn.addEventListener('click', function () {
            editTask(taskText, descriptionText, dueDateText, taskData.task);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Eliminar';

        deleteBtn.addEventListener('click', function () {
            deleteTask(taskItem);
        });

        taskItem.appendChild(taskText);
        taskItem.appendChild(descriptionText);
        taskItem.appendChild(dueDateText);
        taskItem.appendChild(editBtn);
        taskItem.appendChild(deleteBtn);

        taskList.appendChild(taskItem);
    });
}

function clearLocalStorage() {
        localStorage.clear();
}

function editTask(taskText, descriptionText, dueDateText, originalTask) {
    // Obtener referencias a los elementos relevantes
    const editedTaskInput = document.getElementById('editedTask');
    const editedDescriptionInput = document.getElementById('editedDescription');
    const editedDueDateInput = document.getElementById('editedDueDate');
    const saveEditBtn = document.getElementById('saveEditBtn');

    // Llenar el formulario de edición con los datos actuales
    editedTaskInput.value = originalTask;
    editedDescriptionInput.value = descriptionText.textContent;
    editedDueDateInput.value = dueDateText.textContent.replace('Fecha de Vencimiento: ', '');

    // Mostrar el formulario de edición y ocultar el de agregar
    editForm.style.display = 'flex';
    document.getElementById('crud-form').style.display = 'none'; // Ocultar el formulario de agregar

    // Configurar el atributo data-original-task en el botón saveEditBtn
    saveEditBtn.setAttribute('data-original-task', originalTask);

    // Quitar el oyente de eventos anterior para evitar duplicados
    saveEditBtn.removeEventListener('click', saveEditTask);

    // Vincular el evento de guardar con la función saveEditTask
    saveEditBtn.addEventListener('click', function () {
        saveEditTask(originalTask, taskText, descriptionText, dueDateText);

        // Restaurar la visibilidad del formulario de agregar y ocultar el de edición
        document.getElementById('crud-form').style.display = 'flex';
        editForm.style.display = 'none';
    });
}

function saveEditTask(originalTask, taskText, descriptionText, dueDateText) {
    console.log('Guardar Editar tarea');
    const editedTask = document.getElementById('editedTask').value.trim();
    const editedDescription = document.getElementById('editedDescription').value.trim();
    const editedDueDate = document.getElementById('editedDueDate').value;

    console.log('Datos editados:', editedTask, editedDescription, editedDueDate);

    if (editedTask !== '') {
        let tasks = JSON.parse(localStorage.getItem('tasks'));

        const updatedTasks = tasks.map(function (taskData) {
            if (taskData.task === originalTask) {
                return {
                    task: editedTask,
                    description: editedDescription,
                    dueDate: editedDueDate,
                };
            } else {
                return taskData;
            }
        });

        localStorage.setItem('tasks', JSON.stringify(updatedTasks));

        // Recargar las tareas después de la edición
        loadTasks();

        // Restaurar la visibilidad del formulario de agregar y ocultar el de edición
        document.getElementById('crud-form').style.display = 'flex';
        editForm.style.display = 'none';

        // Restablecer el estado de edición
        isEditing = false;
    }
}



// Llama a la función loadTasks después de cargar el contenido del documento
loadTasks();


});




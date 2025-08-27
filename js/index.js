// Исходный массив задач
let toDo = JSON.parse(localStorage.getItem('todoList')) || [
    {
        id: 1,
        name: "Сделать проект",
        completed: false,
        prioritet: "high"
    },
    {
        id: 2,
        name: "Выучить JavaScript",
        completed: true,
        prioritet: "medium"
    }
];

let nextId = 3;

function saveTodos() {
    localStorage.setItem('todoList', JSON.stringify(toDo));
}

// Вспомогательные функции для управления задачами
const getAllTodos = () => [...toDo];

const addTodo = (name, prioritet) => {
    if (!name || !prioritet) {
        throw new Error("Все поля должны быть заполнены!");
    }

    if (!["low", "medium", "high"].includes(prioritet.toLowerCase())) {
        throw new Error("Приоритет должен быть: low, medium, high");
    }

    const newTask = {
        id: nextId,
        name: name.trim(),
        completed: false,
        prioritet: prioritet.toLowerCase()
    };

    toDo.push(newTask);
    nextId++;
    saveTodos();
    return newTask;
};

const deleteTodo = (id) => {
    const index = toDo.findIndex((task) => task.id === id);
    if (index === -1) {
        throw new Error("Нет такого дела");
    }

    const deletedTask = toDo.splice(index, 1)[0];
    saveTodos();
    return deletedTask;
};

const completeTodo = (id) => {
    const index = toDo.findIndex((task) => task.id === id);
    if (index === -1) {
        throw new Error("Нет такого дела");
    }

    toDo[index].completed = !toDo[index].completed;
    saveTodos();
    return toDo[index];
};

const getCompletedTodos = () => {
    return toDo.filter(task => task.completed === true);
}

const getIncompleteTodos = () => {
    return toDo.filter(task => task.completed === false);
}

const getTodosByPriority = (priority) => {
    return toDo.filter(task => task.prioritet === priority.toLowerCase());
}

// Рендеринг задач
function renderTodos() {
    const todosContainer = document.getElementById("todosContainer");
    if (!todosContainer) return;

    todosContainer.innerHTML = "";

    const todos = getAllTodos();

    todos.forEach((todo) => {
        const todoElement = createTodoElement(todo);
        todosContainer.appendChild(todoElement);
    });
}

// Создание отдельного элемента для задачи
function createTodoElement(todo) {
    const delaDiv = document.createElement("div");
    delaDiv.className = "dela";
    delaDiv.dataset.id = todo.id;

    const deloDiv = document.createElement("div");
    deloDiv.className = "delo";
    deloDiv.textContent = todo.name;

    // Красная кнопка для выполнения задачи
    const redyDivOuter = document.createElement("div");
    redyDivOuter.className = "redy-div-outer";

    const redyDivInner = document.createElement("div");
    redyDivInner.className = "redy-div-inner";

    if (todo.completed) {
        redyDivInner.style.backgroundColor = "var(--baseColor)";
    } else {
        redyDivInner.style.backgroundColor = "";
    }

    redyDivOuter.addEventListener("click", () => {
        try {
            const updatedTask = completeTodo(todo.id);
            renderTodos();
        } catch (err) {
            alert(err.message);
        }
    });

    redyDivOuter.appendChild(redyDivInner);

    // Индикатор приоритета
    const importanceDiv = document.createElement("div");
    importanceDiv.className = "importance";
    switch (todo.prioritet) {
        case "high":
            importanceDiv.classList.add("high");
            break;
        case "medium":
            importanceDiv.classList.add("medium");
            break;
        default:
            importanceDiv.classList.add("low");
    }

    // Кнопка удаления
    const deleteDiv = document.createElement("div");
    deleteDiv.className = "delete";
    const deleteImg = document.createElement("img");
    deleteImg.src = "/src/crestick.png";
    deleteImg.alt = "Удалить";
    deleteDiv.appendChild(deleteImg);

    deleteDiv.addEventListener("click", () => {
        try {
            const deletedTask = deleteTodo(todo.id);
            renderTodos();
        } catch (err) {
            alert(err.message);
        }
    });

    delaDiv.appendChild(deloDiv);
    delaDiv.appendChild(redyDivOuter);
    delaDiv.appendChild(importanceDiv);
    delaDiv.appendChild(deleteDiv);

    return delaDiv;
}

// Работа с фильтром
const filterButton = document.getElementById("filtrMenu");
const dropMenu = document.querySelector(".filtrDropMenu");
const filtrItems = document.querySelectorAll('.filtrDropItem');

filterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropMenu.classList.toggle("show");
    filterButton.classList.toggle("active");
});

document.addEventListener("click", (e) => {
    if (
        !filterButton.contains(e.target) &&
        !dropMenu.contains(e.target)
    ) {
        dropMenu.classList.remove("show");
        filterButton.classList.remove("active");
    }
});

filtrItems.forEach(item => item.addEventListener('click', handleFilterClick));

function handleFilterClick(event) {
    event.preventDefault();
    const filterType = event.currentTarget.getAttribute('data-type');
    applyFilter(filterType);
}

function applyFilter(type) {
    let filteredTasks;

    switch (type) {
        case 'all':
            filteredTasks = getAllTodos();
            break;
        case 'done':
            filteredTasks = getCompletedTodos();
            break;
        case 'undone':
            filteredTasks = getIncompleteTodos();
            break;
        case 'low':
        case 'medium':
        case 'high':
            filteredTasks = getTodosByPriority(type);
            break;
        default:
            filteredTasks = getAllTodos();
    }

    renderFiltered(filteredTasks);
}

function renderFiltered(tasks) {
    const todosContainer = document.getElementById('todosContainer');
    if (!todosContainer) return;

    todosContainer.innerHTML = '';

    tasks.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todosContainer.appendChild(todoElement);
    });
}

// Управление окном добавления задач
const addButton = document.querySelector(".addButton");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.querySelector(".modalClose");
const cancelBtn = document.querySelector(".cancelBtn");
const addTaskBtn = document.querySelector(".addTaskBtn");
const priorityButtons = document.querySelectorAll(".priorityBtn");

let selectedPriority = null;

addButton.addEventListener("click", () => {
    modalOverlay.classList.add("show");
});

priorityButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
        priorityButtons.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        selectedPriority = btn.getAttribute("data-priority");
    })
);

addTaskBtn.addEventListener("click", () => {
    const taskName = document.getElementById("taskName").value.trim();

    if (!taskName || !selectedPriority) {
        alert("Пожалуйста, заполните все поля!");
        return;
    }

    try {
        const addedTask = addTodo(taskName, selectedPriority);
        renderTodos();
        closeModal();
    } catch (err) {
        alert(err.message);
    }
});

function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove("show");
    }
    selectedPriority = null;
    const taskNameInput = document.getElementById("taskName");
    if (taskNameInput) {
        taskNameInput.value = "";
    }
    if (priorityButtons) {
        priorityButtons.forEach((btn) => btn.classList.remove("active"));
    }
}

if (modalClose) {
    modalClose.addEventListener("click", closeModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Основной рендеринг задач
document.addEventListener("DOMContentLoaded", () => {
    renderTodos();
});
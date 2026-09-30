// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const currentDate = document.getElementById("currentDate");

const filterButtons = document.querySelectorAll("[data-filter]");

// Store tasks
let tasks = [];

// Current filter
let currentFilter = "all";


// ========================================
// DISPLAY CURRENT DATE
// ========================================

function displayDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDate.textContent = today.toLocaleDateString(
        "en-US",
        options
    );
}


// ========================================
// SAVE TASKS TO LOCAL STORAGE
// ========================================

function saveTasks() {

    localStorage.setItem(
        "dailyTasks",
        JSON.stringify(tasks)
    );
}


// ========================================
// LOAD TASKS FROM LOCAL STORAGE
// ========================================

function loadTasks() {

    const savedTasks = localStorage.getItem("dailyTasks");

    if (savedTasks) {

        try {

            tasks = JSON.parse(savedTasks);

            if (!Array.isArray(tasks)) {
                tasks = [];
            }

        } catch (error) {

            tasks = [];
        }
    }

    renderTasks();
}


// ========================================
// ADD TASK
// ========================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskInput.value.trim();

    // Validate empty task
    if (title === "") {

        alert("Please enter a task.");

        taskInput.focus();

        return;
    }

    // Create task object
    const newTask = {
        id: Date.now(),
        title: title,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    renderTasks();

    // Clear input
    taskInput.value = "";

    taskInput.focus();
});


// ========================================
// RENDER TASKS
// ========================================

function renderTasks() {

    taskList.innerHTML = "";

    // Filter tasks
    let filteredTasks = tasks;

    if (currentFilter === "pending") {

        filteredTasks = tasks.filter(
            task => !task.completed
        );

    } else if (currentFilter === "completed") {

        filteredTasks = tasks.filter(
            task => task.completed
        );
    }

    // Show empty message
    if (filteredTasks.length === 0) {

        emptyMessage.style.display = "block";

        if (tasks.length === 0) {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        } else {
            emptyMessage.textContent =
                "No tasks found for this filter.";
        }

        return;

    } else {

        emptyMessage.style.display = "none";
    }

    // Create task elements
    filteredTasks.forEach(task => {

        const taskElement = createTaskElement(task);

        taskList.appendChild(taskElement);
    });
}


// ========================================
// CREATE TASK ELEMENT
// ========================================

function createTaskElement(task) {

    const taskItem = document.createElement("div");

    taskItem.className = "task-item";

    // Task left section
    const taskLeft = document.createElement("div");

    taskLeft.className = "task-left";

    // Checkbox
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";

    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function () {

        toggleTask(task.id);

    });


    // Task title
    const title = document.createElement("span");

    title.className = "task-title";

    if (task.completed) {
        title.classList.add("completed");
    }

    title.textContent = task.title;


    taskLeft.appendChild(checkbox);
    taskLeft.appendChild(title);


    // Task actions
    const actions = document.createElement("div");

    actions.className = "task-actions";


    // Edit button
    const editButton = document.createElement("button");

    editButton.className = "btn btn-sm btn-outline-primary";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        editTask(task.id);

    });


    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.className = "btn btn-sm btn-outline-danger";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {

        deleteTask(task.id);

    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    taskItem.appendChild(taskLeft);
    taskItem.appendChild(actions);


    return taskItem;
}


// ========================================
// TOGGLE TASK
// ========================================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// ========================================
// EDIT TASK
// ========================================

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    const taskItems = document.querySelectorAll(".task-item");

    taskItems.forEach(taskItem => {

        const checkbox = taskItem.querySelector(
            'input[type="checkbox"]'
        );

        const titleElement = taskItem.querySelector(
            ".task-title"
        );

        if (
            titleElement &&
            titleElement.textContent === task.title
        ) {

            // Remove old content
            titleElement.remove();

            // Create edit input
            const editInput = document.createElement("input");

            editInput.type = "text";

            editInput.className =
                "form-control edit-input";

            editInput.value = task.title;

            // Find task-left
            const taskLeft =
                taskItem.querySelector(".task-left");

            taskLeft.appendChild(editInput);


            // Change actions
            const actions =
                taskItem.querySelector(".task-actions");

            actions.innerHTML = "";


            // Save button
            const saveButton =
                document.createElement("button");

            saveButton.className =
                "btn btn-sm btn-success";

            saveButton.textContent = "Save";


            // Cancel button
            const cancelButton =
                document.createElement("button");

            cancelButton.className =
                "btn btn-sm btn-secondary";

            cancelButton.textContent = "Cancel";


            saveButton.addEventListener(
                "click",
                function () {

                    saveEditedTask(
                        task.id,
                        editInput.value
                    );

                }
            );


            cancelButton.addEventListener(
                "click",
                function () {

                    renderTasks();

                }
            );


            actions.appendChild(saveButton);
            actions.appendChild(cancelButton);


            editInput.focus();


            // Save using Enter
            editInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        saveEditedTask(
                            task.id,
                            editInput.value
                        );
                    }

                    if (event.key === "Escape") {

                        renderTasks();

                    }
                }
            );
        }

    });
}


// ========================================
// SAVE EDITED TASK
// ========================================

function saveEditedTask(id, newTitle) {

    newTitle = newTitle.trim();

    if (newTitle === "") {

        alert("Task cannot be empty.");

        return;
    }

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                title: newTitle
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// ========================================
// DELETE TASK
// ========================================

function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();
}


// ========================================
// FILTER TASKS
// ========================================

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Remove active class
        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        // Add active class
        this.classList.add("active");

        // Set current filter
        currentFilter = this.dataset.filter;

        renderTasks();
    });
});


// ========================================
// INITIALIZE APPLICATION
// ========================================

displayDate();

loadTasks();
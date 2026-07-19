const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addTaskButton = document.getElementById("addTaskButton");
const clearTasksButton = document.getElementById("clearTasksButton");
const currentDateElement = document.getElementById("currentDate");
const taskDateInput = document.getElementById("taskDate");

// Nome usado para salvar e recuperar as tarefas
const STORAGE_KEY = "boaDoDiaTasks";

// Recupera as tarefas salvas.
// Caso não exista nenhuma, começa com um array vazio.
let tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || [];

// Salva o array de tarefas no navegador
function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}

// Data atual do computador
const today = new Date();

// Formata a data atual como ano-mês-dia
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayFormatted = `${year}-${month}-${day}`;

// Deixa o calendário selecionado no dia atual
taskDateInput.value = todayFormatted;

// Configura a data mostrada no canto do cartão
const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit"
};

currentDateElement.textContent = today.toLocaleDateString(
    "pt-BR",
    options
);

// Mostra somente as tarefas da data selecionada
function renderTasks() {
    taskList.innerHTML = "";

    const selectedDate = taskDateInput.value;

    const tasksForDate = tasks.filter(function (task) {
        return task.date === selectedDate;
    });

    tasksForDate.forEach(function (task) {
        const newTask = document.createElement("li");

        if (task.completed) {
            newTask.classList.add("completed");
        }

        const taskTextElement = document.createElement("span");
        taskTextElement.textContent = task.text;
        taskTextElement.classList.add("task-text");

        const taskCharacter = document.createElement("span");
        taskCharacter.classList.add("task-character");

        newTask.appendChild(taskTextElement);
        newTask.appendChild(taskCharacter);

        newTask.addEventListener("click", function () {
            task.completed = !task.completed;

            // Salva o estado concluído ou não concluído
            saveTasks();

            newTask.classList.toggle(
                "completed",
                task.completed
            );

            if (task.completed) {
                taskCharacter.textContent = "🔨";
            } else {
                taskCharacter.textContent = "↩️";
            }

            taskCharacter.classList.add(
                "character-animation"
            );

            setTimeout(function () {
                taskCharacter.classList.remove(
                    "character-animation"
                );

                taskCharacter.textContent = "";
            }, 600);
        });

        taskList.appendChild(newTask);
    });
}

// Adiciona uma nova tarefa
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Por favor, adicione uma tarefa.");
        return;
    }

    if (taskDateInput.value === "") {
        alert("Por favor, selecione uma data.");
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        date: taskDateInput.value,
        completed: false
    };

    // Coloca a tarefa no array
    tasks.push(task);

    // Salva o array atualizado no navegador
    saveTasks();

    // Atualiza a tela
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

// Adicionar clicando no botão
addTaskButton.addEventListener("click", addTask);

// Adicionar pressionando Enter
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// Mostrar as tarefas quando a data mudar
taskDateInput.addEventListener("change", function () {
    renderTasks();
});

// Apagar as tarefas da data selecionada
clearTasksButton.addEventListener("click", function () {
    const selectedDate = taskDateInput.value;

    tasks = tasks.filter(function (task) {
        return task.date !== selectedDate;
    });

    saveTasks();
    renderTasks();
});

// Mostra as tarefas salvas quando a página abrir
renderTasks();

s
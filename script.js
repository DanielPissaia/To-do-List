const supabaseUrl =
    "https://kyuthnwxvinqryppzudn.supabase.co";

const supabaseKey =
    "sb_publishable_P1vA8rELChIgt1UNN8yS1w_0atxa0se";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

// Elementos da agenda
const taskInput =
    document.getElementById("taskInput");

const taskList =
    document.getElementById("taskList");

const addTaskButton =
    document.getElementById("addTaskButton");

const clearTasksButton =
    document.getElementById("clearTasksButton");

const currentDateElement =
    document.getElementById("currentDate");

const taskDateInput =
    document.getElementById("taskDate");

// Elementos da tela de login
const loginSection =
    document.getElementById("loginSection");

const appSection =
    document.getElementById("appSection");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

// Cópia temporária das tarefas carregadas do Supabase
let tasks = [];

// Data atual do computador
const today = new Date();

const year = today.getFullYear();

const month = String(
    today.getMonth() + 1
).padStart(2, "0");

const day = String(
    today.getDate()
).padStart(2, "0");

const todayFormatted =
    `${year}-${month}-${day}`;

// Deixa o calendário selecionado na data atual
taskDateInput.value = todayFormatted;

// Configura a aparência da data
const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit"
};

// Mostra a data atual no cartão
currentDateElement.textContent =
    today.toLocaleDateString(
        "pt-BR",
        options
    );

// Mostra somente as tarefas da data selecionada
function renderTasks() {
    taskList.innerHTML = "";

    const selectedDate =
        taskDateInput.value;

    const tasksForDate = tasks.filter(
        function (task) {
            return task.date === selectedDate;
        }
    );

    tasksForDate.forEach(function (task) {
        const newTask =
            document.createElement("li");

        if (task.completed) {
            newTask.classList.add("completed");
        }

        const taskTextElement =
            document.createElement("span");

        taskTextElement.textContent =
            task.text;

        taskTextElement.classList.add(
            "task-text"
        );

        const taskCharacter =
            document.createElement("span");

        taskCharacter.classList.add(
            "task-character"
        );

        newTask.appendChild(
            taskTextElement
        );

        newTask.appendChild(
            taskCharacter
        );

        // Concluir ou desfazer uma tarefa
        newTask.addEventListener(
            "click",
            async function () {
                const newCompletedState =
                    !task.completed;

                const { error } =
                    await supabaseClient
                        .from("tasks")
                        .update({
                            completed:
                                newCompletedState
                        })
                        .eq("id", task.id);

                if (error) {
                    console.error(
                        "Erro ao atualizar tarefa:",
                        error
                    );

                    alert(
                        "Não foi possível atualizar a tarefa."
                    );

                    return;
                }

                task.completed =
                    newCompletedState;

                newTask.classList.toggle(
                    "completed",
                    task.completed
                );

                if (task.completed) {
                    taskCharacter.textContent =
                        "🔨";
                } else {
                    taskCharacter.textContent =
                        "↩️";
                }

                taskCharacter.classList.add(
                    "character-animation"
                );

                setTimeout(function () {
                    taskCharacter.classList.remove(
                        "character-animation"
                    );

                    taskCharacter.textContent =
                        "";
                }, 600);
            }
        );

        taskList.appendChild(newTask);
    });
}

// Busca as tarefas salvas no Supabase
async function loadTasks() {
    const { data, error } =
        await supabaseClient
            .from("tasks")
            .select("*")
            .order("created_at", {
                ascending: true
            });

    if (error) {
        console.error(
            "Erro ao carregar tarefas:",
            error
        );

        alert(
            "Não foi possível carregar as tarefas."
        );

        return;
    }

    tasks = data.map(function (task) {
        return {
            id: task.id,
            text: task.text,
            date: task.task_date,
            completed: task.completed
        };
    });

    renderTasks();
}

// Realiza o login
async function login() {
    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;

    if (
        email === "" ||
        password === ""
    ) {
        loginMessage.textContent =
            "Preencha o e-mail e a senha.";

        return;
    }

    loginMessage.textContent =
        "Entrando...";

    const { data, error } =
        await supabaseClient.auth
            .signInWithPassword({
                email: email,
                password: password
            });

    if (error) {
        console.error(
            "Erro no login:",
            error
        );

        loginMessage.textContent =
            "E-mail ou senha incorretos.";

        return;
    }

    console.log(
        "Login realizado:",
        data.user
    );

    loginMessage.textContent = "";
    loginSection.hidden = true;
    appSection.hidden = false;
    loginPassword.value = "";

    await loadTasks();
}

// Verifica se já existe uma sessão
async function checkSession() {
    const { data, error } =
        await supabaseClient.auth
            .getSession();

    if (error) {
        console.error(
            "Erro ao verificar sessão:",
            error
        );

        loginSection.hidden = false;
        appSection.hidden = true;

        return;
    }

    if (data.session) {
        loginSection.hidden = true;
        appSection.hidden = false;

        await loadTasks();
    } else {
        loginSection.hidden = false;
        appSection.hidden = true;
    }
}

// Adiciona uma nova tarefa no Supabase
async function addTask() {
    const taskText =
        taskInput.value.trim();

    const selectedDate =
        taskDateInput.value;

    if (taskText === "") {
        alert(
            "Por favor, adicione uma tarefa."
        );

        return;
    }

    if (selectedDate === "") {
        alert(
            "Por favor, selecione uma data."
        );

        return;
    }

    const { data, error } =
        await supabaseClient
            .from("tasks")
            .insert({
                text: taskText,
                task_date: selectedDate,
                completed: false
            })
            .select()
            .single();

    if (error) {
        console.error(
            "Erro ao adicionar tarefa:",
            error
        );

        alert(
            "Não foi possível salvar a tarefa."
        );

        return;
    }

    const newTask = {
        id: data.id,
        text: data.text,
        date: data.task_date,
        completed: data.completed
    };

    tasks.push(newTask);

    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

// Adicionar clicando no botão
addTaskButton.addEventListener(
    "click",
    addTask
);

// Adicionar pressionando Enter
taskInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            addTask();
        }
    }
);

// Entrar clicando no botão
loginButton.addEventListener(
    "click",
    login
);

// Entrar pressionando Enter no campo de senha
loginPassword.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            login();
        }
    }
);

// Mostrar as tarefas quando a data mudar
taskDateInput.addEventListener(
    "change",
    function () {
        renderTasks();
    }
);

// Apagar as tarefas da data selecionada
clearTasksButton.addEventListener(
    "click",
    async function () {
        const selectedDate =
            taskDateInput.value;

        const confirmDelete = confirm(
            "Deseja apagar todas as tarefas desta data?"
        );

        if (!confirmDelete) {
            return;
        }

        const { error } =
            await supabaseClient
                .from("tasks")
                .delete()
                .eq(
                    "task_date",
                    selectedDate
                );

        if (error) {
            console.error(
                "Erro ao apagar tarefas:",
                error
            );

            alert(
                "Não foi possível apagar as tarefas."
            );

            return;
        }

        tasks = tasks.filter(
            function (task) {
                return (
                    task.date !==
                    selectedDate
                );
            }
        );

        renderTasks();
    }
);

// Verifica o login quando a página abrir
checkSession();
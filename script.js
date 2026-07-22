const supabaseUrl =
    "https://kyuthnwxvinqryppzudn.supabase.co";

const supabaseKey =
    "sb_publishable_P1vA8rELChIgt1UNN8yS1w_0atxa0se";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            persistSession: true,
            storage: window.sessionStorage,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

// ================================
// ELEMENTOS DA TELA DE LOGIN
// ================================

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

const logoutButton =
    document.getElementById("logoutButton");

// ================================
// ELEMENTOS DO QUADRO
// ================================

const taskInput =
    document.getElementById("taskInput");

const taskCategory =
    document.getElementById("taskCategory");

const addTaskButton =
    document.getElementById("addTaskButton");

const importantList =
    document.getElementById("importantList");

const requiredList =
    document.getElementById("requiredList");

const wheneverList =
    document.getElementById("wheneverList");

const importantCount =
    document.getElementById("importantCount");

const requiredCount =
    document.getElementById("requiredCount");

const wheneverCount =
    document.getElementById("wheneverCount");

const dropZones =
    document.querySelectorAll(".task-drop-zone");

// Tarefas carregadas do Supabase
let tasks = [];

// Tarefa que está sendo arrastada
let draggedTaskId = null;

// Canal usado para atualização em tempo real
let tasksRealtimeChannel = null;

// Relaciona cada categoria com sua coluna
const categoryLists = {
    important: importantList,
    required: requiredList,
    whenever: wheneverList
};

// ================================
// MOSTRAR E ESCONDER TELAS
// ================================

function showLogin() {
    loginSection.hidden = false;
    appSection.hidden = true;
}

function showApp() {
    loginSection.hidden = true;
    appSection.hidden = false;
}

// ================================
// CRIAR CARTÃO DA TAREFA
// ================================

function createTaskCard(task) {
    const taskCard =
        document.createElement("article");

    taskCard.classList.add("task-card");

    // Permite que o cartão seja arrastado
    taskCard.draggable = true;

    taskCard.dataset.taskId =
        String(task.id);

    const taskContent =
        document.createElement("div");

    taskContent.classList.add(
        "task-content"
    );

    const taskText =
        document.createElement("span");

    taskText.classList.add("task-text");
    taskText.textContent = task.text;

    const taskMeta =
        document.createElement("span");

    taskMeta.classList.add("task-meta");
    taskMeta.textContent =
        "Arraste para mudar a prioridade";

    taskContent.appendChild(taskText);
    taskContent.appendChild(taskMeta);

    const taskActions =
        document.createElement("div");

    taskActions.classList.add(
        "task-actions"
    );

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "🗑";
    deleteButton.title = "Excluir tarefa";

    deleteButton.classList.add(
        "task-action-button",
        "delete-task-button"
    );

    deleteButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            deleteTask(task.id);
        }
    );

    taskActions.appendChild(deleteButton);

    taskCard.appendChild(taskContent);
    taskCard.appendChild(taskActions);

    // Quando começa a arrastar
    taskCard.addEventListener(
        "dragstart",
        function (event) {
            draggedTaskId =
                String(task.id);

            taskCard.classList.add(
                "dragging"
            );

            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "text/plain",
                draggedTaskId
            );
        }
    );

    // Quando termina de arrastar
    taskCard.addEventListener(
        "dragend",
        function () {
            draggedTaskId = null;

            taskCard.classList.remove(
                "dragging"
            );

            dropZones.forEach(
                function (dropZone) {
                    dropZone.classList.remove(
                        "drag-over"
                    );
                }
            );
        }
    );

    return taskCard;
}

// ================================
// MENSAGEM DE COLUNA VAZIA
// ================================

function createEmptyMessage() {
    const message =
        document.createElement("p");

    message.classList.add(
        "empty-column-message"
    );

    message.textContent =
        "Nenhuma tarefa nesta prioridade.";

    return message;
}

// ================================
// MOSTRAR AS TAREFAS
// ================================

function renderTasks() {
    importantList.innerHTML = "";
    requiredList.innerHTML = "";
    wheneverList.innerHTML = "";

    const categoryCounts = {
        important: 0,
        required: 0,
        whenever: 0
    };

    tasks.forEach(function (task) {
        const category =
            task.category || "required";

        const categoryList =
            categoryLists[category];

        if (!categoryList) {
            return;
        }

        const taskCard =
            createTaskCard(task);

        categoryList.appendChild(
            taskCard
        );

        categoryCounts[category]++;
    });

    importantCount.textContent =
        categoryCounts.important;

    requiredCount.textContent =
        categoryCounts.required;

    wheneverCount.textContent =
        categoryCounts.whenever;

    Object.keys(categoryLists).forEach(
        function (category) {
            const list =
                categoryLists[category];

            if (list.children.length === 0) {
                list.appendChild(
                    createEmptyMessage()
                );
            }
        }
    );
}

// ================================
// BUSCAR TAREFAS NO SUPABASE
// ================================

async function loadTasks() {
    const { data, error } =
        await supabaseClient
            .from("tasks")
            .select(
                "id, text, category, completed, created_at"
            )
            .eq("completed", false)
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
            category:
                task.category || "required",
            completed: task.completed,
            createdAt: task.created_at
        };
    });

    renderTasks();
}

// ================================
// ADICIONAR TAREFA
// ================================

async function addTask() {
    const taskText =
        taskInput.value.trim();

    const selectedCategory =
        taskCategory.value;

    if (taskText === "") {
        alert(
            "Digite uma tarefa antes de adicionar."
        );

        taskInput.focus();
        return;
    }

    addTaskButton.disabled = true;
    addTaskButton.textContent =
        "Adicionando...";

    const { error } =
        await supabaseClient
            .from("tasks")
            .insert({
                text: taskText,
                category: selectedCategory,
                completed: false
            });

    addTaskButton.disabled = false;
    addTaskButton.textContent =
        "Adicionar tarefa";

    if (error) {
        console.error(
            "Erro ao adicionar tarefa:",
            error
        );

        alert(
            "Não foi possível adicionar a tarefa."
        );

        return;
    }

    taskInput.value = "";
    taskCategory.value = "required";
    taskInput.focus();

    await loadTasks();
}

// ================================
// MOVER TAREFA DE PRIORIDADE
// ================================

async function moveTaskToCategory(
    taskId,
    newCategory
) {
    const task = tasks.find(
        function (currentTask) {
            return (
                String(currentTask.id) ===
                String(taskId)
            );
        }
    );

    if (!task) {
        return;
    }

    if (task.category === newCategory) {
        return;
    }

    const previousCategory =
        task.category;

    // Move imediatamente na tela
    task.category = newCategory;
    renderTasks();

    const { error } =
        await supabaseClient
            .from("tasks")
            .update({
                category: newCategory
            })
            .eq("id", task.id);

    if (error) {
        console.error(
            "Erro ao mudar prioridade:",
            error
        );

        // Volta para a categoria anterior
        task.category =
            previousCategory;

        renderTasks();

        alert(
            "Não foi possível mudar a prioridade."
        );
    }
}

// ================================
// EXCLUIR UMA TAREFA
// ================================

async function deleteTask(taskId) {
    const confirmDelete = confirm(
        "Deseja realmente excluir esta tarefa?"
    );

    if (!confirmDelete) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", taskId);

    if (error) {
        console.error(
            "Erro ao excluir tarefa:",
            error
        );

        alert(
            "Não foi possível excluir a tarefa."
        );

        return;
    }

    tasks = tasks.filter(
        function (task) {
            return (
                String(task.id) !==
                String(taskId)
            );
        }
    );

    renderTasks();
}

// ================================
// ARRASTAR E SOLTAR
// ================================

dropZones.forEach(function (dropZone) {
    dropZone.addEventListener(
        "dragover",
        function (event) {
            // Necessário para permitir o drop
            event.preventDefault();

            event.dataTransfer.dropEffect =
                "move";

            dropZone.classList.add(
                "drag-over"
            );
        }
    );

    dropZone.addEventListener(
        "dragleave",
        function (event) {
            if (
                !dropZone.contains(
                    event.relatedTarget
                )
            ) {
                dropZone.classList.remove(
                    "drag-over"
                );
            }
        }
    );

    dropZone.addEventListener(
        "drop",
        async function (event) {
            event.preventDefault();

            dropZone.classList.remove(
                "drag-over"
            );

            const taskId =
                event.dataTransfer.getData(
                    "text/plain"
                ) || draggedTaskId;

            const newCategory =
                dropZone.dataset.category;

            await moveTaskToCategory(
                taskId,
                newCategory
            );
        }
    );
});

// ================================
// REALTIME
// ================================

function startRealtime() {
    if (tasksRealtimeChannel) {
        return;
    }

    tasksRealtimeChannel =
        supabaseClient
            .channel("tasks-priority-board")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks"
                },
                function () {
                    loadTasks();
                }
            )
            .subscribe();
}

async function stopRealtime() {
    if (!tasksRealtimeChannel) {
        return;
    }

    await supabaseClient.removeChannel(
        tasksRealtimeChannel
    );

    tasksRealtimeChannel = null;
}

// O canal Realtime escuta INSERT, UPDATE e DELETE na
// tabela. Assim, alterações feitas em outro computador
// chamam loadTasks() automaticamente. :contentReference[oaicite:0]{index=0}

// ================================
// LOGIN
// ================================

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

    const { error } =
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

    loginMessage.textContent = "";
    loginPassword.value = "";

    showApp();

    await loadTasks();
    startRealtime();
}

// ================================
// LOGOUT
// ================================

async function logout() {
    await stopRealtime();

    const { error } =
        await supabaseClient.auth.signOut({
            scope: "local"
        });

    if (error) {
        console.error(
            "Erro ao sair:",
            error
        );

        alert(
            "Não foi possível encerrar a sessão."
        );

        return;
    }

    tasks = [];

    importantList.innerHTML = "";
    requiredList.innerHTML = "";
    wheneverList.innerHTML = "";

    loginEmail.value = "";
    loginPassword.value = "";
    loginMessage.textContent = "";

    showLogin();
    loginEmail.focus();
}

// ================================
// VERIFICAR SESSÃO
// ================================

async function checkSession() {
    const { data, error } =
        await supabaseClient.auth
            .getSession();

    if (error) {
        console.error(
            "Erro ao verificar sessão:",
            error
        );

        showLogin();
        return;
    }

    if (data.session) {
        showApp();

        await loadTasks();
        startRealtime();
    } else {
        showLogin();
    }
}

// ================================
// EVENTOS DOS BOTÕES E TECLADO
// ================================

addTaskButton.addEventListener(
    "click",
    addTask
);

taskInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            addTask();
        }
    }
);

loginButton.addEventListener(
    "click",
    login
);

loginPassword.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            login();
        }
    }
);

logoutButton.addEventListener(
    "click",
    logout
);

// Verifica a sessão quando a página abre
checkSession();
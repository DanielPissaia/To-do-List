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

// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

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

const pendingTabButton =
    document.getElementById("pendingTabButton");

const historyTabButton =
    document.getElementById("historyTabButton");

const pendingView =
    document.getElementById("pendingView");

const historyView =
    document.getElementById("historyView");

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

const historySearch =
    document.getElementById("historySearch");

const historyPeriod =
    document.getElementById("historyPeriod");

const historyList =
    document.getElementById("historyList");

const completedTodayCount =
    document.getElementById("completedTodayCount");

const completedWeekCount =
    document.getElementById("completedWeekCount");

const completedTotalCount =
    document.getElementById("completedTotalCount");

// ========================================
// ELEMENTOS DO MODAL DE EDIÇÃO
// ========================================

const editTaskModal =
    document.getElementById("editTaskModal");

const editModalBackdrop =
    document.getElementById("editModalBackdrop");

const closeEditModalButton =
    document.getElementById(
        "closeEditModalButton"
    );

const cancelEditButton =
    document.getElementById("cancelEditButton");

const editTaskForm =
    document.getElementById("editTaskForm");

const editTaskId =
    document.getElementById("editTaskId");

const editTaskText =
    document.getElementById("editTaskText");

const editTaskCategory =
    document.getElementById(
        "editTaskCategory"
    );

const editTaskNotes =
    document.getElementById("editTaskNotes");

const editNotesCount =
    document.getElementById("editNotesCount");

const saveEditButton =
    document.getElementById("saveEditButton");

// ========================================
// VARIÁVEIS DO SISTEMA
// ========================================

let tasks = [];

let draggedTaskId = null;

let tasksRealtimeChannel = null;

const openNotesTaskIds = new Set();

const categoryLists = {
    important: importantList,
    required: requiredList,
    whenever: wheneverList
};

const categoryLabels = {
    important: "Mais importante",
    required: "Precisa ser feito",
    whenever: "Fazer quando tiver tempo"
};

// ========================================
// CONTROLE DAS TELAS
// ========================================

function showLogin() {
    loginSection.hidden = false;
    appSection.hidden = true;
}

function showApp() {
    loginSection.hidden = true;
    appSection.hidden = false;
}

function showPendingView() {
    pendingView.hidden = false;
    historyView.hidden = true;

    pendingTabButton.classList.add("active");

    historyTabButton.classList.remove(
        "active"
    );
}

function showHistoryView() {
    pendingView.hidden = true;
    historyView.hidden = false;

    pendingTabButton.classList.remove(
        "active"
    );

    historyTabButton.classList.add(
        "active"
    );

    renderHistory();
}

// ========================================
// MENSAGEM DE COLUNA VAZIA
// ========================================

function createEmptyColumnMessage() {
    const message =
        document.createElement("p");

    message.classList.add(
        "empty-column-message"
    );

    message.textContent =
        "Nenhuma tarefa nesta prioridade.";

    return message;
}

// ========================================
// CRIAR BOTÃO DE AÇÃO
// ========================================

function createActionButton({
    text,
    title,
    className,
    onClick
}) {
    const button =
        document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.title = title;

    button.classList.add(
        "task-action-button",
        className
    );

    button.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            onClick();
        }
    );

    return button;
}

// ========================================
// CRIAR CARTÃO DA TAREFA
// ========================================

function createTaskCard(task) {
    const taskId =
        String(task.id);

    const hasNotes =
        typeof task.notes === "string" &&
        task.notes.trim() !== "";

    const taskCard =
        document.createElement("article");

    taskCard.classList.add("task-card");

    taskCard.draggable = true;

    taskCard.dataset.taskId =
        taskId;

    if (
        openNotesTaskIds.has(taskId)
    ) {
        taskCard.classList.add(
            "notes-open"
        );
    }

    const taskMain =
        document.createElement("div");

    taskMain.classList.add(
        "task-card-main"
    );

    const taskHeader =
        document.createElement("div");

    taskHeader.classList.add(
        "task-card-header"
    );

    const taskBody =
        document.createElement("div");

    taskBody.classList.add(
        "task-card-body"
    );

    const taskText =
        document.createElement("span");

    taskText.classList.add("task-text");

    taskText.textContent =
        task.text;

    const taskMeta =
        document.createElement("span");

    taskMeta.classList.add("task-meta");

    taskMeta.textContent =
        "Arraste para mudar a prioridade";

    taskBody.appendChild(taskText);
    taskBody.appendChild(taskMeta);

    const taskActions =
        document.createElement("div");

    taskActions.classList.add(
        "task-actions"
    );

    // Botão editar
    const editButton =
        createActionButton({
            text: "✏️",
            title: "Editar tarefa",
            className:
                "edit-task-button",

            onClick: function () {
                openEditTaskModal(
                    task.id
                );
            }
        });

    // Botão observação
    const notesButton =
        createActionButton({
            text: "💬",

            title: hasNotes
                ? "Mostrar ou esconder observação"
                : "Adicionar observação",

            className:
                "toggle-notes-button",

            onClick: function () {
                if (!hasNotes) {
                    openEditTaskModal(
                        task.id,
                        true
                    );

                    return;
                }

                if (
                    openNotesTaskIds.has(
                        taskId
                    )
                ) {
                    openNotesTaskIds.delete(
                        taskId
                    );
                } else {
                    openNotesTaskIds.add(
                        taskId
                    );
                }

                renderPendingTasks();
            }
        });

    if (hasNotes) {
        notesButton.classList.add(
            "has-notes"
        );

        notesButton.setAttribute(
            "aria-expanded",
            String(
                openNotesTaskIds.has(
                    taskId
                )
            )
        );
    }

    // Botão concluir
    const completeButton =
        createActionButton({
            text: "✓",

            title:
                "Marcar como concluída",

            className:
                "complete-task-button",

            onClick: function () {
                completeTask(task.id);
            }
        });

    // Botão excluir
    const deleteButton =
        createActionButton({
            text: "🗑",

            title:
                "Excluir tarefa",

            className:
                "delete-task-button",

            onClick: function () {
                deleteTask(task.id);
            }
        });

    taskActions.appendChild(
        editButton
    );

    taskActions.appendChild(
        notesButton
    );

    taskActions.appendChild(
        completeButton
    );

    taskActions.appendChild(
        deleteButton
    );

    taskHeader.appendChild(
        taskBody
    );

    taskHeader.appendChild(
        taskActions
    );

    taskMain.appendChild(
        taskHeader
    );

    // Área da observação
    if (hasNotes) {
        const notesArea =
            document.createElement("div");

        notesArea.classList.add(
            "task-notes"
        );

        notesArea.hidden =
            !openNotesTaskIds.has(
                taskId
            );

        const notesLabel =
            document.createElement("span");

        notesLabel.classList.add(
            "task-notes-label"
        );

        notesLabel.textContent =
            "Observação:";

        const notesText =
            document.createElement("p");

        notesText.classList.add(
            "task-notes-text"
        );

        notesText.textContent =
            task.notes;

        notesArea.appendChild(
            notesLabel
        );

        notesArea.appendChild(
            notesText
        );

        taskMain.appendChild(
            notesArea
        );
    }

    taskCard.appendChild(
        taskMain
    );

    // Início do arrastar
    taskCard.addEventListener(
        "dragstart",
        function (event) {
            draggedTaskId =
                taskId;

            taskCard.classList.add(
                "dragging"
            );

            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "text/plain",
                taskId
            );
        }
    );

    // Final do arrastar
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

// ========================================
// MOSTRAR TAREFAS PENDENTES
// ========================================

function renderPendingTasks() {
    importantList.innerHTML = "";
    requiredList.innerHTML = "";
    wheneverList.innerHTML = "";

    const categoryCounts = {
        important: 0,
        required: 0,
        whenever: 0
    };

    const pendingTasks =
        tasks.filter(
            function (task) {
                return !task.completed;
            }
        );

    pendingTasks.forEach(
        function (task) {
            const category =
                task.category ||
                "required";

            const categoryList =
                categoryLists[
                    category
                ];

            if (!categoryList) {
                return;
            }

            categoryList.appendChild(
                createTaskCard(task)
            );

            categoryCounts[
                category
            ] += 1;
        }
    );

    importantCount.textContent =
        categoryCounts.important;

    requiredCount.textContent =
        categoryCounts.required;

    wheneverCount.textContent =
        categoryCounts.whenever;

    Object.values(
        categoryLists
    ).forEach(
        function (list) {
            if (
                list.children.length ===
                0
            ) {
                list.appendChild(
                    createEmptyColumnMessage()
                );
            }
        }
    );
}

// ========================================
// FORMATAR DATA
// ========================================

function formatCompletedDate(
    dateValue
) {
    if (!dateValue) {
        return "Data não registrada";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Data inválida";
    }

    return date.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// ========================================
// DATAS DOS FILTROS
// ========================================

function getStartOfToday() {
    const date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}

function getStartOfTomorrow() {
    const date =
        getStartOfToday();

    date.setDate(
        date.getDate() + 1
    );

    return date;
}

function getStartOfWeek() {
    const date =
        getStartOfToday();

    const currentDay =
        date.getDay();

    const difference =
        currentDay === 0
            ? -6
            : 1 - currentDay;

    date.setDate(
        date.getDate() +
            difference
    );

    return date;
}

function getStartOfMonth() {
    const today =
        new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );
}

// ========================================
// FILTRAR HISTÓRICO
// ========================================

function getFilteredHistoryTasks() {
    const searchText =
        historySearch.value
            .trim()
            .toLowerCase();

    const selectedPeriod =
        historyPeriod.value;

    let startDate = null;

    if (
        selectedPeriod ===
        "today"
    ) {
        startDate =
            getStartOfToday();
    } else if (
        selectedPeriod ===
        "week"
    ) {
        startDate =
            getStartOfWeek();
    } else if (
        selectedPeriod ===
        "month"
    ) {
        startDate =
            getStartOfMonth();
    }

    return tasks
        .filter(
            function (task) {
                return task.completed;
            }
        )
        .filter(
            function (task) {
                const searchableText =
                    `${task.text} ${task.notes || ""}`
                        .toLowerCase();

                return searchableText.includes(
                    searchText
                );
            }
        )
        .filter(
            function (task) {
                if (!startDate) {
                    return true;
                }

                if (
                    !task.completedAt
                ) {
                    return false;
                }

                return (
                    new Date(
                        task.completedAt
                    ) >= startDate
                );
            }
        )
        .sort(
            function (
                firstTask,
                secondTask
            ) {
                const firstDate =
                    firstTask.completedAt
                        ? new Date(
                            firstTask.completedAt
                        ).getTime()
                        : 0;

                const secondDate =
                    secondTask.completedAt
                        ? new Date(
                            secondTask.completedAt
                        ).getTime()
                        : 0;

                return (
                    secondDate -
                    firstDate
                );
            }
        );
}

// ========================================
// CRIAR LINHA DO HISTÓRICO
// ========================================

function createHistoryRow(task) {
    const historyRow =
        document.createElement("div");

    historyRow.classList.add(
        "history-row"
    );

    const taskColumn =
        document.createElement("div");

    taskColumn.classList.add(
        "history-task"
    );

    const checkIcon =
        document.createElement("span");

    checkIcon.classList.add(
        "history-check-icon"
    );

    checkIcon.textContent = "✓";

    const taskText =
        document.createElement("span");

    taskText.classList.add(
        "history-task-text"
    );

    taskText.textContent =
        task.text;

    taskColumn.appendChild(
        checkIcon
    );

    taskColumn.appendChild(
        taskText
    );

    const category =
        task.category ||
        "required";

    const priorityBadge =
        document.createElement("span");

    priorityBadge.classList.add(
        "priority-badge",
        category
    );

    priorityBadge.textContent =
        categoryLabels[
            category
        ] || "Sem prioridade";

    const completedDate =
        document.createElement("span");

    completedDate.classList.add(
        "history-date"
    );

    completedDate.textContent =
        formatCompletedDate(
            task.completedAt
        );

    historyRow.appendChild(
        taskColumn
    );

    historyRow.appendChild(
        priorityBadge
    );

    historyRow.appendChild(
        completedDate
    );

    return historyRow;
}

// ========================================
// CONTADORES DO HISTÓRICO
// ========================================

function updateHistorySummary() {
    const completedTasks =
        tasks.filter(
            function (task) {
                return task.completed;
            }
        );

    const todayStart =
        getStartOfToday();

    const tomorrowStart =
        getStartOfTomorrow();

    const weekStart =
        getStartOfWeek();

    const todayTasks =
        completedTasks.filter(
            function (task) {
                if (
                    !task.completedAt
                ) {
                    return false;
                }

                const completedDate =
                    new Date(
                        task.completedAt
                    );

                return (
                    completedDate >=
                        todayStart &&
                    completedDate <
                        tomorrowStart
                );
            }
        );

    const weekTasks =
        completedTasks.filter(
            function (task) {
                if (
                    !task.completedAt
                ) {
                    return false;
                }

                return (
                    new Date(
                        task.completedAt
                    ) >= weekStart
                );
            }
        );

    completedTodayCount.textContent =
        todayTasks.length;

    completedWeekCount.textContent =
        weekTasks.length;

    completedTotalCount.textContent =
        completedTasks.length;
}

// ========================================
// MOSTRAR HISTÓRICO
// ========================================

function renderHistory() {
    historyList.innerHTML = "";

    const filteredTasks =
        getFilteredHistoryTasks();

    if (
        filteredTasks.length === 0
    ) {
        const emptyMessage =
            document.createElement("p");

        emptyMessage.classList.add(
            "empty-history-message"
        );

        emptyMessage.textContent =
            "Nenhuma tarefa encontrada no histórico.";

        historyList.appendChild(
            emptyMessage
        );
    } else {
        filteredTasks.forEach(
            function (task) {
                historyList.appendChild(
                    createHistoryRow(
                        task
                    )
                );
            }
        );
    }

    updateHistorySummary();
}

function renderAll() {
    renderPendingTasks();
    renderHistory();
}

// ========================================
// CARREGAR TAREFAS DO SUPABASE
// ========================================

async function loadTasks() {
    const { data, error } =
        await supabaseClient
            .from("tasks")
            .select(
                `
                id,
                text,
                notes,
                category,
                completed,
                created_at,
                completed_at
                `
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );

    if (error) {
        console.error(
            "Erro ao carregar tarefas:",
            error
        );

        alert(
            `Não foi possível carregar as tarefas: ${error.message}`
        );

        return;
    }

    tasks = (data || []).map(
        function (task) {
            return {
                id: task.id,

                text:
                    task.text,

                notes:
                    task.notes || "",

                category:
                    task.category ||
                    "required",

                completed:
                    Boolean(
                        task.completed
                    ),

                createdAt:
                    task.created_at,

                completedAt:
                    task.completed_at
            };
        }
    );

    renderAll();
}

// ========================================
// ADICIONAR TAREFA
// ========================================

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

    addTaskButton.disabled =
        true;

    addTaskButton.textContent =
        "Adicionando...";

    try {
        const { error } =
            await supabaseClient
                .from("tasks")
                .insert({
                    text:
                        taskText,

                    notes:
                        null,

                    category:
                        selectedCategory,

                    completed:
                        false,

                    completed_at:
                        null
                });

        if (error) {
            console.error(
                "Erro ao adicionar tarefa:",
                error
            );

            alert(
                `Não foi possível adicionar a tarefa: ${error.message}`
            );

            return;
        }

        taskInput.value = "";

        taskCategory.value =
            "required";

        taskInput.focus();

        await loadTasks();
    } catch (error) {
        console.error(
            "Erro inesperado ao adicionar tarefa:",
            error
        );

        alert(
            "Ocorreu um erro inesperado ao adicionar a tarefa."
        );
    } finally {
        addTaskButton.disabled =
            false;

        addTaskButton.textContent =
            "Adicionar tarefa";
    }
}

// ========================================
// ABRIR MODAL DE EDIÇÃO
// ========================================

function openEditTaskModal(
    taskId,
    focusNotes = false
) {
    const task =
        tasks.find(
            function (currentTask) {
                return (
                    String(
                        currentTask.id
                    ) ===
                    String(taskId)
                );
            }
        );

    if (
        !task ||
        !editTaskModal
    ) {
        return;
    }

    editTaskId.value =
        String(task.id);

    editTaskText.value =
        task.text;

    editTaskCategory.value =
        task.category ||
        "required";

    editTaskNotes.value =
        task.notes || "";

    updateEditNotesCount();

    editTaskModal.hidden =
        false;

    document.body.classList.add(
        "modal-open"
    );

    requestAnimationFrame(
        function () {
            if (focusNotes) {
                editTaskNotes.focus();
            } else {
                editTaskText.focus();

                editTaskText.select();
            }
        }
    );
}

// ========================================
// FECHAR MODAL DE EDIÇÃO
// ========================================

function closeEditTaskModal() {
    if (!editTaskModal) {
        return;
    }

    editTaskModal.hidden =
        true;

    document.body.classList.remove(
        "modal-open"
    );

    editTaskForm.reset();

    editTaskId.value = "";

    updateEditNotesCount();
}

// ========================================
// CONTADOR DE CARACTERES
// ========================================

function updateEditNotesCount() {
    if (
        !editTaskNotes ||
        !editNotesCount
    ) {
        return;
    }

    editNotesCount.textContent =
        `${editTaskNotes.value.length}/1000`;
}

// ========================================
// SALVAR EDIÇÃO
// ========================================

async function saveTaskEdits(
    event
) {
    event.preventDefault();

    const taskId =
        editTaskId.value;

    const newText =
        editTaskText.value.trim();

    const newCategory =
        editTaskCategory.value;

    const newNotes =
        editTaskNotes.value.trim();

    if (newText === "") {
        alert(
            "A descrição da tarefa não pode ficar vazia."
        );

        editTaskText.focus();

        return;
    }

    saveEditButton.disabled =
        true;

    saveEditButton.textContent =
        "Salvando...";

    try {
        const { error } =
            await supabaseClient
                .from("tasks")
                .update({
                    text:
                        newText,

                    category:
                        newCategory,

                    notes:
                        newNotes === ""
                            ? null
                            : newNotes
                })
                .eq(
                    "id",
                    taskId
                );

        if (error) {
            console.error(
                "Erro ao editar tarefa:",
                error
            );

            alert(
                `Não foi possível salvar as alterações: ${error.message}`
            );

            return;
        }

        if (newNotes === "") {
            openNotesTaskIds.delete(
                String(taskId)
            );
        } else {
            openNotesTaskIds.add(
                String(taskId)
            );
        }

        closeEditTaskModal();

        await loadTasks();
    } catch (error) {
        console.error(
            "Erro inesperado ao editar tarefa:",
            error
        );

        alert(
            "Ocorreu um erro inesperado ao salvar as alterações."
        );
    } finally {
        saveEditButton.disabled =
            false;

        saveEditButton.textContent =
            "Salvar alterações";
    }
}

// ========================================
// CONCLUIR TAREFA
// ========================================

async function completeTask(
    taskId
) {
    const task =
        tasks.find(
            function (currentTask) {
                return (
                    String(
                        currentTask.id
                    ) ===
                    String(taskId)
                );
            }
        );

    if (!task) {
        return;
    }

    const confirmComplete =
        confirm(
            `Marcar como concluída?\n\n${task.text}`
        );

    if (!confirmComplete) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("tasks")
            .update({
                completed:
                    true,

                completed_at:
                    new Date()
                        .toISOString()
            })
            .eq(
                "id",
                task.id
            );

    if (error) {
        console.error(
            "Erro ao concluir tarefa:",
            error
        );

        alert(
            `Não foi possível concluir a tarefa: ${error.message}`
        );

        return;
    }

    openNotesTaskIds.delete(
        String(task.id)
    );

    await loadTasks();
}

// ========================================
// MOVER TAREFA DE PRIORIDADE
// ========================================

async function moveTaskToCategory(
    taskId,
    newCategory
) {
    const validCategories = [
        "important",
        "required",
        "whenever"
    ];

    if (
        !validCategories.includes(
            newCategory
        )
    ) {
        return;
    }

    const task =
        tasks.find(
            function (currentTask) {
                return (
                    String(
                        currentTask.id
                    ) ===
                    String(taskId)
                );
            }
        );

    if (
        !task ||
        task.completed ||
        task.category ===
            newCategory
    ) {
        return;
    }

    const previousCategory =
        task.category;

    task.category =
        newCategory;

    renderPendingTasks();

    const { error } =
        await supabaseClient
            .from("tasks")
            .update({
                category:
                    newCategory
            })
            .eq(
                "id",
                task.id
            );

    if (error) {
        console.error(
            "Erro ao mudar prioridade:",
            error
        );

        task.category =
            previousCategory;

        renderPendingTasks();

        alert(
            `Não foi possível mudar a prioridade: ${error.message}`
        );
    }
}

// ========================================
// EXCLUIR TAREFA
// ========================================

async function deleteTask(
    taskId
) {
    const task =
        tasks.find(
            function (currentTask) {
                return (
                    String(
                        currentTask.id
                    ) ===
                    String(taskId)
                );
            }
        );

    if (!task) {
        return;
    }

    const confirmDelete =
        confirm(
            `Excluir definitivamente?\n\n${task.text}`
        );

    if (!confirmDelete) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq(
                "id",
                task.id
            );

    if (error) {
        console.error(
            "Erro ao excluir tarefa:",
            error
        );

        alert(
            `Não foi possível excluir a tarefa: ${error.message}`
        );

        return;
    }

    openNotesTaskIds.delete(
        String(task.id)
    );

    tasks =
        tasks.filter(
            function (currentTask) {
                return (
                    String(
                        currentTask.id
                    ) !==
                    String(task.id)
                );
            }
        );

    renderAll();
}

// ========================================
// ARRASTAR E SOLTAR
// ========================================

dropZones.forEach(
    function (dropZone) {
        dropZone.addEventListener(
            "dragover",
            function (event) {
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
                    event.dataTransfer
                        .getData(
                            "text/plain"
                        ) ||
                    draggedTaskId;

                const newCategory =
                    dropZone.dataset
                        .category;

                await moveTaskToCategory(
                    taskId,
                    newCategory
                );
            }
        );
    }
);

// ========================================
// REALTIME
// ========================================

function startRealtime() {
    if (
        tasksRealtimeChannel
    ) {
        return;
    }

    tasksRealtimeChannel =
        supabaseClient
            .channel(
                "organizer-tasks-changes"
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks"
                },
                async function () {
                    await loadTasks();
                }
            )
            .subscribe();
}

async function stopRealtime() {
    if (
        !tasksRealtimeChannel
    ) {
        return;
    }

    await supabaseClient.removeChannel(
        tasksRealtimeChannel
    );

    tasksRealtimeChannel =
        null;
}

// ========================================
// LOGIN
// ========================================

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

    loginButton.disabled =
        true;

    loginMessage.textContent =
        "Entrando...";

    try {
        const { error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email:
                        email,

                    password:
                        password
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

        loginMessage.textContent =
            "";

        loginPassword.value =
            "";

        showApp();

        showPendingView();

        await loadTasks();

        startRealtime();
    } catch (error) {
        console.error(
            "Erro inesperado no login:",
            error
        );

        loginMessage.textContent =
            "Não foi possível entrar agora.";
    } finally {
        loginButton.disabled =
            false;
    }
}

// ========================================
// LOGOUT
// ========================================

async function logout() {
    await stopRealtime();

    const { error } =
        await supabaseClient.auth
            .signOut({
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

    openNotesTaskIds.clear();

    importantList.innerHTML =
        "";

    requiredList.innerHTML =
        "";

    wheneverList.innerHTML =
        "";

    historyList.innerHTML =
        "";

    if (
        editTaskModal &&
        !editTaskModal.hidden
    ) {
        closeEditTaskModal();
    }

    loginEmail.value = "";

    loginPassword.value =
        "";

    loginMessage.textContent =
        "";

    showLogin();

    loginEmail.focus();
}

// ========================================
// VERIFICAR SESSÃO
// ========================================

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

        showPendingView();

        await loadTasks();

        startRealtime();
    } else {
        showLogin();
    }
}

// ========================================
// EVENTOS
// ========================================

addTaskButton.addEventListener(
    "click",
    addTask
);

taskInput.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key ===
            "Enter"
        ) {
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
        if (
            event.key ===
            "Enter"
        ) {
            login();
        }
    }
);

logoutButton.addEventListener(
    "click",
    logout
);

pendingTabButton.addEventListener(
    "click",
    showPendingView
);

historyTabButton.addEventListener(
    "click",
    showHistoryView
);

historySearch.addEventListener(
    "input",
    renderHistory
);

historyPeriod.addEventListener(
    "change",
    renderHistory
);

// Os eventos do modal são verificados
// para não bloquear o login caso algum
// elemento do HTML esteja faltando.

if (editTaskForm) {
    editTaskForm.addEventListener(
        "submit",
        saveTaskEdits
    );
}

if (closeEditModalButton) {
    closeEditModalButton.addEventListener(
        "click",
        closeEditTaskModal
    );
}

if (cancelEditButton) {
    cancelEditButton.addEventListener(
        "click",
        closeEditTaskModal
    );
}

if (editModalBackdrop) {
    editModalBackdrop.addEventListener(
        "click",
        closeEditTaskModal
    );
}

if (editTaskNotes) {
    editTaskNotes.addEventListener(
        "input",
        updateEditNotesCount
    );
}

document.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key ===
                "Escape" &&
            editTaskModal &&
            !editTaskModal.hidden
        ) {
            closeEditTaskModal();
        }
    }
);

// Inicia o sistema
checkSession();
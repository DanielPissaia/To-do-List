// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://iwhczvimugtureydwohf.supabase.co";

const SUPABASE_PUBLIC_KEY =
    "sb_publishable_K_L5ockr9tjD1BJQmUuzrQ_k7Py7QG_";

if (!window.supabase) {
    alert(
        "A biblioteca do Supabase não carregou. Verifique o index.html."
    );

    throw new Error(
        "A biblioteca window.supabase não foi encontrada."
    );
}

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLIC_KEY
    );


// ========================================
// CONFIGURAÇÕES
// ========================================

const STORAGE_KEY = "controleContasTi";

let accounts = loadAccounts();
let currentView = "overview";


// ========================================
// ELEMENTOS DO HTML
// ========================================

const sopalAccountsElement =
    document.querySelector("#sopalAccounts");

const gramadoAccountsElement =
    document.querySelector("#gramadoAccounts");

const sopalSection =
    document.querySelector("#sopalSection");

const gramadoSection =
    document.querySelector("#gramadoSection");

const totalAccountsElement =
    document.querySelector("#totalAccounts");

const pendingAccountsElement =
    document.querySelector("#pendingAccounts");

const deliveredAccountsElement =
    document.querySelector("#deliveredAccounts");

const weeklyAccountsElement =
    document.querySelector("#weeklyAccounts");

const openAccountFormButton =
    document.querySelector("#openAccountFormButton");

const closeAccountFormButton =
    document.querySelector("#closeAccountFormButton");

const cancelAccountFormButton =
    document.querySelector("#cancelAccountFormButton");

const accountModal =
    document.querySelector("#accountModal");

const accountForm =
    document.querySelector("#accountForm");

const accountCompanyInput =
    document.querySelector("#accountCompany");

const accountSupplierInput =
    document.querySelector("#accountSupplier");

const accountDescriptionInput =
    document.querySelector("#accountDescription");

const accountDueDateInput =
    document.querySelector("#accountDueDate");

const menuButtons =
    document.querySelectorAll(".menu-item");

const loginScreen =
    document.querySelector("#loginScreen");

const loginForm =
    document.querySelector("#loginForm");

const loginEmailInput =
    document.querySelector("#loginEmail");

const loginPasswordInput =
    document.querySelector("#loginPassword");

const loginMessage =
    document.querySelector("#loginMessage");

const loginButton =
    document.querySelector("#loginButton");

const logoutButton =
    document.querySelector("#logoutButton");

const loggedUserEmail =
    document.querySelector("#loggedUserEmail");

const sidebar =
    document.querySelector("#sidebar");

const mainContent =
    document.querySelector("#mainContent");


// ========================================
// VERIFICAÇÃO DOS ELEMENTOS
// ========================================

function checkRequiredElements() {
    const requiredElements = [
        {
            name: "Tela de login",
            element: loginScreen
        },
        {
            name: "Formulário de login",
            element: loginForm
        },
        {
            name: "Campo de e-mail",
            element: loginEmailInput
        },
        {
            name: "Campo de senha",
            element: loginPasswordInput
        },
        {
            name: "Mensagem do login",
            element: loginMessage
        },
        {
            name: "Botão entrar",
            element: loginButton
        },
        {
            name: "Botão sair",
            element: logoutButton
        },
        {
            name: "Menu lateral",
            element: sidebar
        },
        {
            name: "Conteúdo principal",
            element: mainContent
        },
        {
            name: "Tabela da Sopal",
            element: sopalAccountsElement
        },
        {
            name: "Tabela de Gramado",
            element: gramadoAccountsElement
        },
        {
            name: "Seção da Sopal",
            element: sopalSection
        },
        {
            name: "Seção de Gramado",
            element: gramadoSection
        },
        {
            name: "Botão Nova Conta",
            element: openAccountFormButton
        },
        {
            name: "Formulário Nova Conta",
            element: accountForm
        },
        {
            name: "Modal Nova Conta",
            element: accountModal
        }
    ];

    const missingElements =
        requiredElements.filter(
            item => !item.element
        );

    if (missingElements.length > 0) {
        const missingNames =
            missingElements
                .map(item => item.name)
                .join(", ");

        console.error(
            "Elementos não encontrados no HTML:",
            missingNames
        );

        alert(
            `Alguns elementos não foram encontrados no HTML: ${missingNames}`
        );

        return false;
    }

    return true;
}


// ========================================
// ARMAZENAMENTO LOCAL
// ========================================

function loadAccounts() {
    try {
        const savedAccounts =
            localStorage.getItem(STORAGE_KEY);

        if (!savedAccounts) {
            return [];
        }

        const parsedAccounts =
            JSON.parse(savedAccounts);

        if (!Array.isArray(parsedAccounts)) {
            return [];
        }

        return parsedAccounts;
    } catch (error) {
        console.error(
            "Não foi possível carregar as contas:",
            error
        );

        return [];
    }
}


function saveAccounts() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(accounts)
        );
    } catch (error) {
        console.error(
            "Não foi possível salvar as contas:",
            error
        );

        alert(
            "O navegador não conseguiu salvar as informações."
        );
    }
}


// ========================================
// SEGURANÇA DOS TEXTOS
// ========================================

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ========================================
// FORMATAÇÃO DAS DATAS
// ========================================

function formatDate(dateString) {
    const [year, month, day] =
        dateString.split("-");

    return `${day}/${month}/${year}`;
}


function formatMonth(dateString) {
    const [year, month] =
        dateString.split("-");

    const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    return `${monthNames[Number(month) - 1]}/${year}`;
}


// ========================================
// VENCIMENTOS
// ========================================

function getDaysUntilDueDate(dateString) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate =
        new Date(`${dateString}T00:00:00`);

    const difference =
        dueDate.getTime() - today.getTime();

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.round(
        difference / millisecondsPerDay
    );
}


function getDueDateClass(account) {
    if (account.status === "delivered") {
        return "";
    }

    const daysUntilDueDate =
        getDaysUntilDueDate(account.dueDate);

    if (daysUntilDueDate < 0) {
        return "overdue";
    }

    if (daysUntilDueDate <= 7) {
        return "due-soon";
    }

    return "";
}


// ========================================
// STATUS
// ========================================

function getStatusInformation(account) {
    if (account.status === "delivered") {
        return {
            text: "Entregue",
            className: "status-delivered"
        };
    }

    const daysUntilDueDate =
        getDaysUntilDueDate(account.dueDate);

    if (daysUntilDueDate < 0) {
        return {
            text: "Vencida",
            className: "status-overdue"
        };
    }

    return {
        text: "Pendente",
        className: "status-pending"
    };
}


// ========================================
// CRIAÇÃO DAS LINHAS
// ========================================

function createAccountRow(account) {
    const statusInformation =
        getStatusInformation(account);

    const actionText =
        account.status === "delivered"
            ? "Marcar pendente"
            : "Marcar entregue";

    return `
        <tr class="${getDueDateClass(account)}">

            <td>
                ${escapeHTML(account.supplier)}
            </td>

            <td>
                ${escapeHTML(account.description)}
            </td>

            <td>
                ${formatDate(account.dueDate)}
            </td>

            <td>
                ${formatMonth(account.dueDate)}
            </td>

            <td>
                <span
                    class="status ${statusInformation.className}"
                >
                    ${statusInformation.text}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="action-button"
                    data-action="toggle-status"
                    data-account-id="${account.id}"
                >
                    ${actionText}
                </button>
            </td>

        </tr>
    `;
}


// ========================================
// FILTROS DO MENU
// ========================================

function getFilteredAccounts(company) {
    let filteredAccounts =
        accounts.filter(
            account => account.company === company
        );

    if (currentView === "history") {
        filteredAccounts =
            filteredAccounts.filter(
                account =>
                    account.status === "delivered"
            );
    }

    return filteredAccounts.sort(
        (firstAccount, secondAccount) =>
            firstAccount.dueDate.localeCompare(
                secondAccount.dueDate
            )
    );
}


function updateVisibleSections() {
    if (currentView === "sopal") {
        sopalSection.style.display = "block";
        gramadoSection.style.display = "none";

        return;
    }

    if (currentView === "gramado") {
        sopalSection.style.display = "none";
        gramadoSection.style.display = "block";

        return;
    }

    sopalSection.style.display = "block";
    gramadoSection.style.display = "block";
}


// ========================================
// EXIBIÇÃO DAS CONTAS
// ========================================

function renderCompanyAccounts(
    companyAccounts,
    element,
    companyName
) {
    if (companyAccounts.length === 0) {
        const message =
            currentView === "history"
                ? `Nenhuma conta entregue da ${companyName}.`
                : `Nenhuma conta da ${companyName} cadastrada.`;

        element.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-message"
                >
                    ${message}
                </td>
            </tr>
        `;

        return;
    }

    element.innerHTML =
        companyAccounts
            .map(createAccountRow)
            .join("");
}


function renderAccounts() {
    const sopalAccounts =
        getFilteredAccounts("Sopal");

    const gramadoAccounts =
        getFilteredAccounts("Gramado");

    renderCompanyAccounts(
        sopalAccounts,
        sopalAccountsElement,
        "Sopal"
    );

    renderCompanyAccounts(
        gramadoAccounts,
        gramadoAccountsElement,
        "Gramado"
    );

    updateVisibleSections();
    updateSummary();
}


// ========================================
// RESUMO
// ========================================

function updateSummary() {
    const pendingAccounts =
        accounts.filter(
            account =>
                account.status === "pending"
        );

    const deliveredAccounts =
        accounts.filter(
            account =>
                account.status === "delivered"
        );

    const weeklyAccounts =
        accounts.filter(account => {
            if (account.status === "delivered") {
                return false;
            }

            const daysUntilDueDate =
                getDaysUntilDueDate(account.dueDate);

            return (
                daysUntilDueDate >= 0 &&
                daysUntilDueDate <= 7
            );
        });

    totalAccountsElement.textContent =
        accounts.length;

    pendingAccountsElement.textContent =
        pendingAccounts.length;

    deliveredAccountsElement.textContent =
        deliveredAccounts.length;

    weeklyAccountsElement.textContent =
        weeklyAccounts.length;
}


// ========================================
// MODAL DE NOVA CONTA
// ========================================

function openAccountModal() {
    accountForm.reset();

    accountModal.classList.add("open");
    document.body.classList.add("modal-open");

    setTimeout(() => {
        accountCompanyInput.focus();
    }, 100);
}


function closeAccountModal() {
    accountModal.classList.remove("open");
    document.body.classList.remove("modal-open");

    accountForm.reset();
}


// ========================================
// AUTENTICAÇÃO
// ========================================

function showLoginScreen() {
    loginScreen.classList.remove("hidden");

    sidebar.classList.remove("visible");
    mainContent.classList.remove("visible");

    loginForm.reset();

    loginMessage.textContent = "";
    loginMessage.className = "login-message";
}


function showPrivateSystem(user) {
    loginScreen.classList.add("hidden");

    sidebar.classList.add("visible");
    mainContent.classList.add("visible");

    loggedUserEmail.textContent =
        user?.email || "Usuário da TI";
}


function setLoginLoading(isLoading) {
    loginButton.disabled = isLoading;

    loginButton.textContent =
        isLoading
            ? "Entrando..."
            : "Entrar";
}


function translateLoginError(error) {
    const message =
        error?.message?.toLowerCase() || "";

    if (
        message.includes(
            "invalid login credentials"
        )
    ) {
        return "E-mail ou senha incorretos.";
    }

    if (
        message.includes("email not confirmed")
    ) {
        return "O e-mail ainda não foi confirmado.";
    }

    if (
        message.includes("failed to fetch") ||
        message.includes("network")
    ) {
        return "Não foi possível conectar ao Supabase.";
    }

    if (
        message.includes("too many requests")
    ) {
        return "Muitas tentativas. Aguarde e tente novamente.";
    }

    return (
        error?.message ||
        "Não foi possível entrar. Verifique os dados."
    );
}


async function handleLogin(event) {
    event.preventDefault();

    const email =
        loginEmailInput.value.trim();

    const password =
        loginPasswordInput.value;

    if (!email || !password) {
        loginMessage.textContent =
            "Informe o e-mail e a senha.";

        loginMessage.className =
            "login-message error";

        return;
    }

    setLoginLoading(true);

    loginMessage.textContent =
        "Verificando acesso...";

    loginMessage.className =
        "login-message";

    try {
        const { data, error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error(
                "O usuário não foi retornado pelo Supabase."
            );
        }

        loginMessage.textContent =
            "Login realizado com sucesso.";

        loginMessage.className =
            "login-message success";

        showPrivateSystem(data.user);
        renderAccounts();

    } catch (error) {
        console.error(
            "Erro completo no login:",
            error
        );

        loginMessage.textContent =
            translateLoginError(error);

        loginMessage.className =
            "login-message error";

    } finally {
        setLoginLoading(false);
    }
}


async function handleLogout() {
    try {
        const { error } =
            await supabaseClient.auth.signOut({
                scope: "local"
            });

        if (error) {
            throw error;
        }

        showLoginScreen();

    } catch (error) {
        console.error(
            "Erro ao sair:",
            error
        );

        alert(
            "Não foi possível sair do sistema."
        );
    }
}


async function checkAuthentication() {
    try {
        const {
            data: { session },
            error
        } =
            await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (!session) {
            showLoginScreen();
            return;
        }

        showPrivateSystem(session.user);
        renderAccounts();

    } catch (error) {
        console.error(
            "Erro ao verificar a sessão:",
            error
        );

        showLoginScreen();

        loginMessage.textContent =
            "Não foi possível verificar o acesso.";

        loginMessage.className =
            "login-message error";
    }
}


// ========================================
// CADASTRO DE CONTAS
// ========================================

function createAccount(event) {
    event.preventDefault();

    const company =
        accountCompanyInput.value;

    const supplier =
        accountSupplierInput.value.trim();

    const description =
        accountDescriptionInput.value.trim();

    const dueDate =
        accountDueDateInput.value;

    if (
        !company ||
        !supplier ||
        !description ||
        !dueDate
    ) {
        alert(
            "Preencha todos os campos da conta."
        );

        return;
    }

    const newAccount = {
        id: Date.now(),
        company,
        supplier,
        description,
        dueDate,
        status: "pending",
        createdAt: new Date().toISOString(),
        deliveredAt: null
    };

    accounts.push(newAccount);

    saveAccounts();
    renderAccounts();
    closeAccountModal();
}


// ========================================
// ALTERAÇÃO DE STATUS
// ========================================

function toggleAccountStatus(accountId) {
    const account =
        accounts.find(
            currentAccount =>
                currentAccount.id === accountId
        );

    if (!account) {
        return;
    }

    if (account.status === "delivered") {
        account.status = "pending";
        account.deliveredAt = null;
    } else {
        account.status = "delivered";
        account.deliveredAt =
            new Date().toISOString();
    }

    saveAccounts();
    renderAccounts();
}


// ========================================
// MENU LATERAL
// ========================================

function changeView(clickedButton) {
    menuButtons.forEach(button => {
        button.classList.remove("active");
    });

    clickedButton.classList.add("active");

    currentView =
        clickedButton.dataset.view;

    renderAccounts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// EVENTOS DE LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    handleLogin
);

logoutButton.addEventListener(
    "click",
    handleLogout
);


// ========================================
// EVENTOS DO MODAL
// ========================================

openAccountFormButton.addEventListener(
    "click",
    openAccountModal
);

closeAccountFormButton.addEventListener(
    "click",
    closeAccountModal
);

cancelAccountFormButton.addEventListener(
    "click",
    closeAccountModal
);

accountForm.addEventListener(
    "submit",
    createAccount
);

accountModal.addEventListener(
    "click",
    event => {
        if (event.target === accountModal) {
            closeAccountModal();
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape" &&
            accountModal.classList.contains("open")
        ) {
            closeAccountModal();
        }
    }
);


// ========================================
// EVENTOS DAS CONTAS
// ========================================

document.addEventListener(
    "click",
    event => {
        const actionButton =
            event.target.closest(
                '[data-action="toggle-status"]'
            );

        if (!actionButton) {
            return;
        }

        const accountId =
            Number(
                actionButton.dataset.accountId
            );

        toggleAccountStatus(accountId);
    }
);


// ========================================
// EVENTOS DO MENU
// ========================================

menuButtons.forEach(button => {
    button.addEventListener(
        "click",
        () => changeView(button)
    );
});


// ========================================
// INICIALIZAÇÃO
// ========================================

if (checkRequiredElements()) {
    checkAuthentication();
}
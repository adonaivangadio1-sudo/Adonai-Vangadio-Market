/* ============================================================
   AV MARKET
   ADMINISTRADOR PREMIUM
   admin.js
============================================================ */

document.addEventListener("DOMContentLoaded", function () {


    /* ========================================================
       ELEMENTOS PRINCIPAIS
    ======================================================== */

    const accountButton =
        document.getElementById("adminAccountButton");

    const accountMenu =
        document.getElementById("adminAccountMenu");

    const logoutButton =
        document.getElementById("adminLogoutButton");

    const sidebarLogout =
        document.getElementById("adminSidebarLogout");

    const headerName =
        document.getElementById("adminHeaderName");

    const menuName =
        document.getElementById("adminMenuName");

    const currentDate =
        document.getElementById("adminCurrentDate");


    /* ========================================================
       CONFIGURAÇÃO
    ======================================================== */

    const ADMIN_ROLE = "administrador";

    const SESSION_KEYS = [
        "avMarketSession",
        "authSession",
        "currentUser",
        "userSession",
        "loggedUser"
    ];


    /* ========================================================
       FUNÇÕES AUXILIARES
    ======================================================== */

    function safeJSON(value) {

        if (!value) {
            return null;
        }

        try {

            return JSON.parse(value);

        } catch (error) {

            return null;

        }

    }


    function getStoredSession() {

        for (const key of SESSION_KEYS) {

            const localValue =
                localStorage.getItem(key);

            if (localValue) {

                const parsed =
                    safeJSON(localValue);

                if (parsed) {
                    return parsed;
                }

            }


            const sessionValue =
                sessionStorage.getItem(key);

            if (sessionValue) {

                const parsed =
                    safeJSON(sessionValue);

                if (parsed) {
                    return parsed;
                }

            }

        }

        return null;

    }


    function getUserRole(session) {

        if (!session) {
            return null;
        }

        return (
            session.role ||
            session.tipo ||
            session.userType ||
            session.accountType ||
            session.type ||
            (
                session.user
                    ? (
                        session.user.role ||
                        session.user.tipo ||
                        session.user.userType ||
                        session.user.accountType ||
                        session.user.type
                    )
                    : null
            )
        );

    }


    function getUserName(session) {

        if (!session) {
            return "Administrador";
        }

        const user =
            session.user || session;

        return (
            user.name ||
            user.nome ||
            user.displayName ||
            user.fullName ||
            "Administrador"
        );

    }


    /* ========================================================
       PROTEÇÃO DO PAINEL
    ======================================================== */

    function verifyAdminAccess() {

        const session =
            getStoredSession();

        if (!session) {

            console.warn(
                "Nenhuma sessão administrativa encontrada."
            );

            /*
             * Não fazemos redirecionamento imediato
             * nesta fase caso o Auth.js/Firebase ainda
             * esteja a restaurar a sessão.
             */

            return;

        }


        const role =
            String(
                getUserRole(session) || ""
            ).toLowerCase();


        if (
            role &&
            role !== ADMIN_ROLE &&
            role !== "admin" &&
            role !== "administrador premium"
        ) {

            console.warn(
                "Acesso recusado. Tipo de conta:",
                role
            );

            window.location.href =
                "../../index.html";

            return;

        }


        const name =
            getUserName(session);

        if (headerName) {
            headerName.textContent = name;
        }

        if (menuName) {
            menuName.textContent = name;
        }

    }


    /* ========================================================
       DATA ATUAL
    ======================================================== */

    function updateCurrentDate() {

        if (!currentDate) {
            return;
        }

        const now =
            new Date();

        const formatted =
            now.toLocaleDateString(
                "pt-AO",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

        currentDate.textContent =
            formatted;

    }


    /* ========================================================
       ACCOUNT MENU
    ======================================================== */

    function openAccountMenu() {

        if (!accountMenu || !accountButton) {
            return;
        }

        accountMenu.classList.add("open");

        accountButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function closeAccountMenu() {

        if (!accountMenu || !accountButton) {
            return;
        }

        accountMenu.classList.remove("open");

        accountButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    function toggleAccountMenu() {

        if (!accountMenu) {
            return;
        }

        if (
            accountMenu.classList.contains("open")
        ) {

            closeAccountMenu();

        } else {

            openAccountMenu();

        }

    }


    if (accountButton) {

        accountButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleAccountMenu();

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                accountMenu &&
                !accountMenu.contains(event.target) &&
                accountButton &&
                !accountButton.contains(event.target)
            ) {

                closeAccountMenu();

            }

        }
    );


    /* ========================================================
       NAVEGAÇÃO
    ======================================================== */

    const navLinks =
        document.querySelectorAll(
            ".admin-nav-link"
        );


    function setActiveNavigation(id) {

        navLinks.forEach(function (link) {

            const section =
                link.dataset.section;

            link.classList.toggle(
                "active",
                section === id
            );

        });

    }


    function scrollToSection(id) {

        const section =
            document.getElementById(id);

        if (!section) {
            return;
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setActiveNavigation(id);

    }


    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                const section =
                    this.dataset.section;

                if (section) {
                    setActiveNavigation(section);
                }

            }
        );

    });


    /* ========================================================
       HASH INICIAL
    ======================================================== */

    function loadHashSection() {

        const hash =
            window.location.hash;

        if (!hash) {
            return;
        }

        const id =
            hash.substring(1);

        if (
            document.getElementById(id)
        ) {

            setTimeout(
                function () {

                    scrollToSection(id);

                },
                100
            );

        }

    }


    window.addEventListener(
        "hashchange",
        function () {

            const id =
                window.location.hash.substring(1);

            if (id) {
                setActiveNavigation(id);
            }

        }
    );


    /* ========================================================
       LOGOUT
    ======================================================== */

    function logoutAdmin() {

        const confirmed =
            window.confirm(
                "Tem a certeza que deseja sair da conta administrativa?"
            );

        if (!confirmed) {
            return;
        }


        /*
         * Primeiro tenta utilizar o Auth global,
         * caso exista.
         */

        try {

            if (
                typeof Auth !== "undefined" &&
                typeof Auth.logout === "function"
            ) {

                Auth.logout();

            }

        } catch (error) {

            console.warn(
                "Auth.logout() não pôde ser executado.",
                error
            );

        }


        /*
         * Limpeza das sessões locais.
         */

        SESSION_KEYS.forEach(
            function (key) {

                try {
                    localStorage.removeItem(key);
                } catch (error) {}

                try {
                    sessionStorage.removeItem(key);
                } catch (error) {}

            }
        );


        /*
         * Limpeza de possíveis chaves
         * utilizadas pelo AV Market.
         */

        const extraKeys = [
            "avMarketUser",
            "av_market_user",
            "avMarketAuth",
            "avMarketCurrentUser",
            "loggedInUser"
        ];


        extraKeys.forEach(
            function (key) {

                try {
                    localStorage.removeItem(key);
                } catch (error) {}

                try {
                    sessionStorage.removeItem(key);
                } catch (error) {}

            }
        );


        window.location.href =
            "../../index.html";

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutAdmin
        );

    }


    if (sidebarLogout) {

        sidebarLogout.addEventListener(
            "click",
            logoutAdmin
        );

    }


    /* ========================================================
       BADGES
    ======================================================== */

    function setBadge(id, value) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        const numericValue =
            Number(value) || 0;

        element.textContent =
            numericValue;

        element.style.display =
            numericValue > 0
                ? "flex"
                : "none";

    }


    function updateBadges() {

        const pending =
            Number(
                localStorage.getItem(
                    "avMarketPendingProducts"
                )
            ) || 0;

        const messages =
            Number(
                localStorage.getItem(
                    "avMarketMessages"
                )
            ) || 0;

        const notifications =
            Number(
                localStorage.getItem(
                    "avMarketNotifications"
                )
            ) || 0;


        setBadge(
            "adminPendingProductsCount",
            pending
        );

        setBadge(
            "adminSidebarMessages",
            messages
        );

        setBadge(
            "adminMessageBadge",
            messages
        );

        setBadge(
            "adminNotificationBadge",
            notifications
        );


        const totalPending =
            document.getElementById(
                "adminTotalPending"
            );

        if (totalPending) {
            totalPending.textContent =
                pending;
        }


        const reviewPending =
            document.getElementById(
                "adminReviewPending"
            );

        if (reviewPending) {
            reviewPending.textContent =
                pending;
        }


        const alertText =
            document.getElementById(
                "adminPendingAlertText"
            );

        if (alertText) {

            if (pending > 0) {

                alertText.textContent =
                    pending +
                    (
                        pending === 1
                            ? " mercadoria aguarda"
                            : " mercadorias aguardam"
                    ) +
                    " análise administrativa.";

            } else {

                alertText.textContent =
                    "Não existem mercadorias pendentes neste momento.";

            }

        }

    }


    /* ========================================================
       ESTATÍSTICAS LOCAIS
    ======================================================== */

    function updateLocalStatistics() {

        const values = {

            sales:
                localStorage.getItem(
                    "avMarketTotalSales"
                ),

            orders:
                localStorage.getItem(
                    "avMarketTotalOrders"
                ),

            products:
                localStorage.getItem(
                    "avMarketTotalProducts"
                ),

            sellers:
                localStorage.getItem(
                    "avMarketTotalSellers"
                ),

            buyers:
                localStorage.getItem(
                    "avMarketTotalBuyers"
                ),

            revenue:
                localStorage.getItem(
                    "avMarketPlatformRevenue"
                ),

            pendingPayments:
                localStorage.getItem(
                    "avMarketPendingPayments"
                )

        };


        const map = {

            adminTotalSales:
                values.sales
                    ? values.sales + " Kz"
                    : "0 Kz",

            adminTotalOrders:
                values.orders || "0",

            adminTotalProducts:
                values.products || "0",

            adminTotalSellers:
                values.sellers || "0",

            adminTotalBuyers:
                values.buyers || "0",

            adminPlatformRevenue:
                values.revenue
                    ? values.revenue + " Kz"
                    : "0 Kz",

            adminPendingPayments:
                values.pendingPayments
                    ? values.pendingPayments + " Kz"
                    : "0 Kz"

        };


        Object.keys(map).forEach(
            function (id) {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.textContent =
                        map[id];

                }

            }
        );

    }


    /* ========================================================
       NOTIFICAÇÕES
    ======================================================== */

    const notificationButton =
        document.getElementById(
            "adminNotificationButton"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                const count =
                    Number(
                        localStorage.getItem(
                            "avMarketNotifications"
                        )
                    ) || 0;


                if (count === 0) {

                    showAdminToast(
                        "Não existem novas notificações."
                    );

                    return;

                }


                showAdminToast(
                    "Existem " +
                    count +
                    (
                        count === 1
                            ? " notificação pendente."
                            : " notificações pendentes."
                    )
                );

            }
        );

    }


    /* ========================================================
       MENSAGENS
    ======================================================== */

    const messagesButton =
        document.getElementById(
            "adminMessagesButton"
        );


    if (messagesButton) {

        messagesButton.addEventListener(
            "click",
            function () {

                scrollToSection(
                    "mensagens"
                );

                window.history.replaceState(
                    null,
                    "",
                    "#mensagens"
                );

            }
        );

    }


    /* ========================================================
       PESQUISA GLOBAL
    ======================================================== */

    const globalSearchButton =
        document.getElementById(
            "adminGlobalSearchButton"
        );


    if (globalSearchButton) {

        globalSearchButton.addEventListener(
            "click",
            function () {

                const search =
                    document.getElementById(
                        "adminProductSearch"
                    );

                if (search) {

                    scrollToSection(
                        "mercadorias"
                    );

                    setTimeout(
                        function () {

                            search.focus();

                        },
                        400
                    );

                }

            }
        );

    }


    /* ========================================================
       FILTRO DE MERCADORIAS
    ======================================================== */

    const productSearch =
        document.getElementById(
            "adminProductSearch"
        );

    const productStatusFilter =
        document.getElementById(
            "adminProductStatusFilter"
        );

    const productBusinessFilter =
        document.getElementById(
            "adminProductBusinessFilter"
        );


    function filterProducts() {

        const searchTerm =
            productSearch
                ? productSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const status =
            productStatusFilter
                ? productStatusFilter.value
                : "all";

        const business =
            productBusinessFilter
                ? productBusinessFilter.value
                : "all";


        const cards =
            document.querySelectorAll(
                "[data-product-name]"
            );


        cards.forEach(
            function (card) {

                const name =
                    (
                        card.dataset.productName ||
                        ""
                    ).toLowerCase();

                const cardStatus =
                    card.dataset.productStatus ||
                    "all";

                const cardBusiness =
                    card.dataset.productBusiness ||
                    "all";


                const matchesSearch =
                    !searchTerm ||
                    name.includes(searchTerm);


                const matchesStatus =
                    status === "all" ||
                    cardStatus === status;


                const matchesBusiness =
                    business === "all" ||
                    cardBusiness === business;


                card.style.display =
                    (
                        matchesSearch &&
                        matchesStatus &&
                        matchesBusiness
                    )
                        ? ""
                        : "none";

            }
        );

    }


    if (productSearch) {

        productSearch.addEventListener(
            "input",
            filterProducts
        );

    }


    if (productStatusFilter) {

        productStatusFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    if (productBusinessFilter) {

        productBusinessFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    /* ========================================================
       MODAL DE PRODUTO
    ======================================================== */

    const productModal =
        document.getElementById(
            "adminProductModal"
        );

    const productModalClose =
        document.getElementById(
            "adminProductModalClose"
        );


    function openProductModal(product) {

        if (!productModal) {
            return;
        }


        const name =
            document.getElementById(
                "adminModalProductName"
            );

        const body =
            document.getElementById(
                "adminProductModalBody"
            );


        if (name) {
            name.textContent =
                product.name ||
                "Mercadoria";
        }


        if (body) {

            body.innerHTML = `

                <div style="
                    display:flex;
                    flex-direction:column;
                    gap:12px;
                ">

                    <div style="
                        padding:14px;
                        border:1px solid rgba(255,255,255,.08);
                        border-radius:12px;
                        background:#0c0c0c;
                    ">

                        <strong style="
                            display:block;
                            color:#fff;
                            font-size:11px;
                            margin-bottom:6px;
                        ">
                            Dados da mercadoria
                        </strong>

                        <span style="
                            color:#777;
                            font-size:9px;
                            line-height:1.7;
                        ">
                            Esta área está preparada para receber
                            os dados completos da mercadoria,
                            revendedor, preço, modalidade,
                            imagens e estado de aprovação.
                        </span>

                    </div>

                </div>

            `;

        }


        productModal.classList.add("open");

        productModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeProductModal() {

        if (!productModal) {
            return;
        }

        productModal.classList.remove("open");

        productModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (productModalClose) {

        productModalClose.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (productModal) {

        const overlay =
            productModal.querySelector(
                ".admin-modal-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeProductModal
            );

        }

    }


    /* ========================================================
       CONFIRMAÇÃO
    ======================================================== */

    const confirmModal =
        document.getElementById(
            "adminConfirmModal"
        );

    const confirmCancel =
        document.getElementById(
            "adminConfirmCancel"
        );

    const confirmAccept =
        document.getElementById(
            "adminConfirmAccept"
        );

    let confirmCallback =
        null;


    function openConfirm(
        title,
        message,
        callback
    ) {

        if (!confirmModal) {
            return;
        }


        const titleElement =
            document.getElementById(
                "adminConfirmTitle"
            );

        const messageElement =
            document.getElementById(
                "adminConfirmMessage"
            );


        if (titleElement) {
            titleElement.textContent =
                title;
        }


        if (messageElement) {
            messageElement.textContent =
                message;
        }


        confirmCallback =
            typeof callback === "function"
                ? callback
                : null;


        confirmModal.classList.add(
            "open"
        );

        confirmModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeConfirm() {

        if (!confirmModal) {
            return;
        }

        confirmModal.classList.remove(
            "open"
        );

        confirmModal.setAttribute(
            "aria-hidden",
            "true"
        );

        confirmCallback =
            null;

    }


    if (confirmCancel) {

        confirmCancel.addEventListener(
            "click",
            closeConfirm
        );

    }


    if (confirmAccept) {

        confirmAccept.addEventListener(
            "click",
            function () {

                if (confirmCallback) {

                    confirmCallback();

                }

                closeConfirm();

            }
        );

    }


    /* ========================================================
       REPORTS
    ======================================================== */

    const reportButtons =
        document.querySelectorAll(
            "[data-report]"
        );

    const reportOutput =
        document.getElementById(
            "adminReportOutput"
        );


    function generateReport(type) {

        if (!reportOutput) {
            return;
        }


        const titles = {

            sales:
                "Relatório de vendas",

            sellers:
                "Relatório de revendedores",

            products:
                "Relatório de produtos",

            financial:
                "Relatório financeiro"

        };


        const descriptions = {

            sales:
                "Análise do volume de vendas e pedidos da plataforma.",

            sellers:
                "Análise de atividade, contas e desempenho dos revendedores.",

            products:
                "Análise de produtos publicados, pendentes e rejeitados.",

            financial:
                "Análise de receita, comissão AV Market e pagamentos."

        };


        reportOutput.innerHTML = `

            <div style="
                padding:25px;
            ">

                <span style="
                    display:block;
                    color:#C79A3B;
                    font-size:8px;
                    font-weight:700;
                    letter-spacing:1.5px;
                    margin-bottom:8px;
                ">
                    RELATÓRIO PREMIUM
                </span>

                <h3 style="
                    margin:0;
                    color:#fff;
                    font-size:18px;
                ">
                    ${titles[type] || "Relatório"}
                </h3>

                <p style="
                    margin:8px 0 20px;
                    color:#666;
                    font-size:9px;
                ">
                    ${descriptions[type] || ""}
                </p>

                <div style="
                    display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:10px;
                ">

                    <div style="
                        padding:15px;
                        border:1px solid rgba(255,255,255,.07);
                        border-radius:12px;
                        background:#0c0c0c;
                    ">

                        <span style="
                            color:#666;
                            font-size:8px;
                        ">
                            Estado
                        </span>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            color:#35C978;
                            font-size:11px;
                        ">
                            Preparado
                        </strong>

                    </div>


                    <div style="
                        padding:15px;
                        border:1px solid rgba(255,255,255,.07);
                        border-radius:12px;
                        background:#0c0c0c;
                    ">

                        <span style="
                            color:#666;
                            font-size:8px;
                        ">
                            Plataforma
                        </span>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            color:#fff;
                            font-size:11px;
                        ">
                            AV Market
                        </strong>

                    </div>


                    <div style="
                        padding:15px;
                        border:1px solid rgba(255,255,255,.07);
                        border-radius:12px;
                        background:#0c0c0c;
                    ">

                        <span style="
                            color:#666;
                            font-size:8px;
                        ">
                            Acesso
                        </span>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            color:#E2BC6A;
                            font-size:11px;
                        ">
                            Premium
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }


    reportButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    generateReport(
                        this.dataset.report
                    );

                }
            );

        }
    );


    const generateReportButton =
        document.getElementById(
            "adminGenerateReport"
        );


    if (generateReportButton) {

        generateReportButton.addEventListener(
            "click",
            function () {

                generateReport(
                    "financial"
                );

                scrollToSection(
                    "relatorios"
                );

            }
        );

    }


    /* ========================================================
       DEFINIÇÕES
    ======================================================== */

    const settingCards =
        document.querySelectorAll(
            ".admin-setting-card"
        );


    settingCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const setting =
                        this.dataset.setting;

                    const labels = {

                        account:
                            "Conta administrativa",

                        platform:
                            "Definições da plataforma",

                        commission:
                            "Gestão de comissões",

                        notifications:
                            "Definições de notificações",

                        security:
                            "Definições de segurança",

                        firebase:
                            "Integração Firebase",

                        approvals:
                            "Regras de aprovação",

                        permissions:
                            "Permissões administrativas"

                    };


                    showAdminToast(
                        labels[setting] ||
                        "Definição selecionada."
                    );

                }
            );

        }
    );


    /* ========================================================
       TOAST
    ======================================================== */

    function showAdminToast(message) {

        let toast =
            document.getElementById(
                "adminToast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "adminToast";

            toast.style.position =
                "fixed";

            toast.style.right =
                "22px";

            toast.style.bottom =
                "22px";

            toast.style.zIndex =
                "3000";

            toast.style.maxWidth =
                "320px";

            toast.style.padding =
                "13px 16px";

            toast.style.border =
                "1px solid rgba(199,154,59,.25)";

            toast.style.borderRadius =
                "12px";

            toast.style.background =
                "#151515";

            toast.style.color =
                "#ddd";

            toast.style.fontSize =
                "10px";

            toast.style.boxShadow =
                "0 20px 50px rgba(0,0,0,.5)";

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(10px)";

            toast.style.transition =
                "all .25s ease";

            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            message;

        requestAnimationFrame(
            function () {

                toast.style.opacity =
                    "1";

                toast.style.transform =
                    "translateY(0)";

            }
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                function () {

                    toast.style.opacity =
                        "0";

                    toast.style.transform =
                        "translateY(10px)";

                },
                2800
            );

    }


    /* ========================================================
       BOTÃO ATUALIZAR ATIVIDADE
    ======================================================== */

    const refreshActivity =
        document.getElementById(
            "adminRefreshActivity"
        );


    if (refreshActivity) {

        refreshActivity.addEventListener(
            "click",
            function () {

                this.disabled =
                    true;

                const icon =
                    this.querySelector(
                        "i"
                    );

                if (icon) {

                    icon.style.animation =
                        "adminSpin .8s linear infinite";

                }


                setTimeout(
                    function () {

                        refreshActivity.disabled =
                            false;

                        if (icon) {

                            icon.style.animation =
                                "";

                        }

                        showAdminToast(
                            "Painel atualizado."
                        );

                        updateBadges();

                        updateLocalStatistics();

                    },
                    700
                );

            }
        );

    }


    /* ========================================================
       BOTÕES DE APROVAÇÃO
    ======================================================== */

    const approveButton =
        document.getElementById(
            "adminModalApproveButton"
        );

    const rejectButton =
        document.getElementById(
            "adminModalRejectButton"
        );

    const reviewButton =
        document.getElementById(
            "adminModalReviewButton"
        );


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            function () {

                openConfirm(
                    "Aprovar mercadoria",
                    "Tem a certeza que deseja aprovar esta mercadoria?",
                    function () {

                        showAdminToast(
                            "Mercadoria aprovada."
                        );

                        closeProductModal();

                    }
                );

            }
        );

    }


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            function () {

                openConfirm(
                    "Rejeitar mercadoria",
                    "Tem a certeza que deseja rejeitar esta mercadoria?",
                    function () {

                        showAdminToast(
                            "Mercadoria rejeitada."
                        );

                        closeProductModal();

                    }
                );

            }
        );

    }


    if (reviewButton) {

        reviewButton.addEventListener(
            "click",
            function () {

                showAdminToast(
                    "Mercadoria colocada em avaliação."
                );

            }
        );

    }


    /* ========================================================
       PRODUTOS / MERCADORIAS DINÂMICOS
    ======================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-open-admin-product]"
                );


            if (!button) {
                return;
            }


            const product = {

                name:
                    button.dataset.productName ||
                    "Mercadoria"

            };


            openProductModal(
                product
            );

        }
    );


    /* ========================================================
       ADICIONAR PRODUTO
    ======================================================== */

    const addProductButton =
        document.getElementById(
            "adminAddProductButton"
        );


    if (addProductButton) {

        addProductButton.addEventListener(
            "click",
            function () {

                showAdminToast(
                    "Área de criação de produto preparada."
                );

            }
        );

    }


    /* ========================================================
       NOVA CATEGORIA
    ======================================================== */

    const addCategoryButton =
        document.getElementById(
            "adminAddCategoryButton"
        );


    if (addCategoryButton) {

        addCategoryButton.addEventListener(
            "click",
            function () {

                showAdminToast(
                    "Área de criação de categoria preparada."
                );

            }
        );

    }


    /* ========================================================
       NOVA MENSAGEM
    ======================================================== */

    const newMessageButton =
        document.getElementById(
            "adminNewMessageButton"
        );


    if (newMessageButton) {

        newMessageButton.addEventListener(
            "click",
            function () {

                showAdminToast(
                    "Área de nova mensagem preparada."
                );

            }
        );

    }


    /* ========================================================
       SCROLLSPY
    ======================================================== */

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                setActiveNavigation(
                                    entry.target.id
                                );

                            }

                        }
                    );

                },
                {
                    root: null,
                    rootMargin:
                        "-25% 0px -60% 0px",
                    threshold: 0
                }
            );


        sections.forEach(
            function (section) {

                observer.observe(
                    section
                );

            }
        );

    }


    /* ========================================================
       INICIALIZAÇÃO
    ======================================================== */

    updateCurrentDate();

    verifyAdminAccess();

    updateBadges();

    updateLocalStatistics();

    loadHashSection();


    /*
     * Atualização periódica.
     */

    setInterval(
        function () {

            updateBadges();

            updateLocalStatistics();

        },
        5000
    );


});

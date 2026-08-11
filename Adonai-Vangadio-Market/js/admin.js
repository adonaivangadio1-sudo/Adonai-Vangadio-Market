/* ============================================================
   AV MARKET — ADMIN PREMIUM
   admin.js
   Sistema completo de interação do painel administrativo
   Compatível com o HTML Admin Premium fornecido
============================================================ */

(function () {
    "use strict";

    /* ========================================================
       CONFIGURAÇÃO
    ======================================================== */

    const ADMIN_CONFIG = {
        storagePrefix: "avmarket_admin_",
        defaultSection: "dashboard",

        sections: [
            "dashboard",
            "mensagens",
            "mercadorias",
            "produtos",
            "avaliacoes",
            "revendedores",
            "compradores",
            "pedidos",
            "pagamentos",
            "relatorios",
            "categorias",
            "definicoes"
        ],

        currency: "Kz"
    };


    /* ========================================================
       ESTADO GLOBAL
    ======================================================== */

    const state = {
        currentSection: "dashboard",
        currentProduct: null,
        pendingConfirmAction: null,

        accountMenuOpen: false,
        notificationPanelOpen: false,
        searchPanelOpen: false,

        notifications: [],
        messages: [],

        products: [],
        sellers: [],
        buyers: [],
        orders: [],
        payments: [],
        reviews: [],
        categories: [],
        activities: [],

        connectedToFirebase: false,

        filters: {
            productSearch: "",
            productStatus: "all",
            productBusiness: "all"
        }
    };


    /* ========================================================
       HELPERS DOM
    ======================================================== */

    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    function getElement(id) {
        return document.getElementById(id);
    }


    function exists(element) {
        return element !== null && element !== undefined;
    }


    /* ========================================================
       HELPERS GERAIS
    ======================================================== */

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatCurrency(value) {
        const number = Number(value) || 0;

        return (
            new Intl.NumberFormat("pt-AO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(number) +
            " " +
            ADMIN_CONFIG.currency
        );
    }


    function formatNumber(value) {
        return new Intl.NumberFormat("pt-AO").format(
            Number(value) || 0
        );
    }


    function formatDate(dateValue) {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat("pt-AO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    }


    function formatDateTime(dateValue) {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat("pt-AO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }


    function generateId(prefix) {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).substring(2, 8)
        );
    }


    function showToast(message, type = "info") {
        let container = getElement("adminToastContainer");

        if (!container) {
            container = document.createElement("div");
            container.id = "adminToastContainer";

            container.style.position = "fixed";
            container.style.top = "24px";
            container.style.right = "24px";
            container.style.zIndex = "99999";
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.gap = "12px";
            container.style.maxWidth = "360px";

            document.body.appendChild(container);
        }

        const toast = document.createElement("div");

        toast.style.padding = "15px 18px";
        toast.style.borderRadius = "14px";
        toast.style.background = "#111";
        toast.style.color = "#fff";
        toast.style.border = "1px solid rgba(255,255,255,.12)";
        toast.style.boxShadow = "0 15px 40px rgba(0,0,0,.25)";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "500";
        toast.style.display = "flex";
        toast.style.alignItems = "center";
        toast.style.gap = "10px";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all .25s ease";

        let icon = "fa-circle-info";

        if (type === "success") {
            icon = "fa-circle-check";
        }

        if (type === "error") {
            icon = "fa-circle-xmark";
        }

        if (type === "warning") {
            icon = "fa-triangle-exclamation";
        }

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${escapeHTML(message)}</span>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-10px)";

            setTimeout(() => {
                toast.remove();

                if (!container.children.length) {
                    container.remove();
                }
            }, 300);
        }, 3500);
    }


    /* ========================================================
       STORAGE
    ======================================================== */

    function storageKey(key) {
        return ADMIN_CONFIG.storagePrefix + key;
    }


    function saveStorage(key, value) {
        try {
            localStorage.setItem(
                storageKey(key),
                JSON.stringify(value)
            );
        } catch (error) {
            console.warn(
                "Não foi possível guardar dados:",
                error
            );
        }
    }


    function loadStorage(key, fallback) {
        try {
            const value = localStorage.getItem(
                storageKey(key)
            );

            if (!value) {
                return fallback;
            }

            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }


    /* ========================================================
       DATA MOCK / FALLBACK
    ======================================================== */

    function loadLocalData() {
        state.notifications = loadStorage(
            "notifications",
            []
        );

        state.messages = loadStorage(
            "messages",
            []
        );

        state.products = loadStorage(
            "products",
            []
        );

        state.sellers = loadStorage(
            "sellers",
            []
        );

        state.buyers = loadStorage(
            "buyers",
            []
        );

        state.orders = loadStorage(
            "orders",
            []
        );

        state.payments = loadStorage(
            "payments",
            []
        );

        state.reviews = loadStorage(
            "reviews",
            []
        );

        state.categories = loadStorage(
            "categories",
            []
        );

        state.activities = loadStorage(
            "activities",
            []
        );
    }


    function saveAllData() {
        saveStorage(
            "notifications",
            state.notifications
        );

        saveStorage(
            "messages",
            state.messages
        );

        saveStorage(
            "products",
            state.products
        );

        saveStorage(
            "sellers",
            state.sellers
        );

        saveStorage(
            "buyers",
            state.buyers
        );

        saveStorage(
            "orders",
            state.orders
        );

        saveStorage(
            "payments",
            state.payments
        );

        saveStorage(
            "reviews",
            state.reviews
        );

        saveStorage(
            "categories",
            state.categories
        );

        saveStorage(
            "activities",
            state.activities
        );
    }


    /* ========================================================
       ADMIN ACCOUNT
    ======================================================== */

    function loadAdminName() {
        const name =
            localStorage.getItem("avmarket_admin_name") ||
            localStorage.getItem("adminName") ||
            "Administrador";

        const headerName = getElement(
            "adminHeaderName"
        );

        const menuName = getElement(
            "adminMenuName"
        );

        if (exists(headerName)) {
            headerName.textContent = name;
        }

        if (exists(menuName)) {
            menuName.textContent = name;
        }
    }


    /* ========================================================
       DATA INITIALIZATION
    ======================================================== */

    function initializeDefaultData() {
        if (!state.categories.length) {
            state.categories = [
                {
                    id: "cat-electronica",
                    name: "Eletrónica",
                    icon: "fa-mobile-screen-button",
                    products: 0
                },
                {
                    id: "cat-moda",
                    name: "Moda",
                    icon: "fa-shirt",
                    products: 0
                },
                {
                    id: "cat-casa",
                    name: "Casa",
                    icon: "fa-house",
                    products: 0
                },
                {
                    id: "cat-automovel",
                    name: "Automóvel",
                    icon: "fa-car",
                    products: 0
                }
            ];
        }

        saveAllData();
    }


    /* ========================================================
       NAVIGATION
    ======================================================== */

    function navigateToSection(section, updateHash = true) {
        if (!ADMIN_CONFIG.sections.includes(section)) {
            section = ADMIN_CONFIG.defaultSection;
        }

        state.currentSection = section;

        $$(".admin-section").forEach((sectionElement) => {
            const isActive =
                sectionElement.id === section;

            sectionElement.classList.toggle(
                "active",
                isActive
            );

            sectionElement.hidden = !isActive;
        });

        $$(".admin-nav-link").forEach((link) => {
            const isActive =
                link.dataset.section === section;

            link.classList.toggle(
                "active",
                isActive
            );

            if (isActive) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                link.removeAttribute(
                    "aria-current"
                );
            }
        });

        closeAccountMenu();
        closeNotificationPanel();
        closeSearchPanel();

        if (updateHash) {
            history.replaceState(
                null,
                "",
                "#" + section
            );
        }

        if (window.innerWidth <= 1100) {
            closeSidebar();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        renderSectionData(section);
    }


    function renderSectionData(section) {
        switch (section) {
            case "dashboard":
                updateDashboard();
                break;

            case "mensagens":
                renderMessages();
                break;

            case "mercadorias":
                renderProductsApproval();
                break;

            case "produtos":
                renderProductsTable();
                break;

            case "revendedores":
                renderSellersTable();
                break;

            case "compradores":
                renderBuyersTable();
                break;

            case "pedidos":
                renderOrdersTable();
                break;

            case "pagamentos":
                renderPaymentsTable();
                break;

            case "avaliacoes":
                renderReviews();
                break;

            case "categorias":
                renderCategories();
                break;

            case "relatorios":
                updateReportSummary();
                break;

            case "definicoes":
                updateSettingsStatus();
                break;
        }
    }


    function initializeNavigation() {
        $$(".admin-nav-link").forEach((link) => {
            link.addEventListener("click", function (event) {
                event.preventDefault();

                const section =
                    this.dataset.section;

                navigateToSection(section);
            });
        });


        $$("[data-admin-section]").forEach((element) => {
            element.addEventListener("click", function () {
                const section =
                    this.dataset.adminSection;

                if (section) {
                    navigateToSection(section);
                }
            });
        });


        window.addEventListener("hashchange", () => {
            const hash =
                window.location.hash
                    .replace("#", "")
                    .trim();

            if (hash) {
                navigateToSection(
                    hash,
                    false
                );
            }
        });
    }


    /* ========================================================
       SIDEBAR
    ======================================================== */

    function openSidebar() {
        const sidebar =
            getElement("adminSidebar");

        if (!sidebar) {
            return;
        }

        sidebar.classList.add("open");

        document.body.classList.add(
            "admin-sidebar-open"
        );
    }


    function closeSidebar() {
        const sidebar =
            getElement("adminSidebar");

        if (!sidebar) {
            return;
        }

        sidebar.classList.remove("open");

        document.body.classList.remove(
            "admin-sidebar-open"
        );
    }


    function toggleSidebar() {
        const sidebar =
            getElement("adminSidebar");

        if (!sidebar) {
            return;
        }

        sidebar.classList.toggle("open");

        document.body.classList.toggle(
            "admin-sidebar-open",
            sidebar.classList.contains("open")
        );
    }


    function createMobileMenuButton() {
        if (getElement("adminMobileMenuButton")) {
            return;
        }

        const headerContainer =
            $(".admin-header-container");

        if (!headerContainer) {
            return;
        }

        const button =
            document.createElement("button");

        button.type = "button";
        button.id = "adminMobileMenuButton";
        button.className =
            "admin-mobile-menu-button";
        button.setAttribute(
            "aria-label",
            "Abrir menu"
        );

        button.innerHTML = `
            <i class="fa-solid fa-bars"></i>
        `;

        button.addEventListener(
            "click",
            toggleSidebar
        );

        headerContainer.insertBefore(
            button,
            headerContainer.firstChild
        );
    }


    /* ========================================================
       ACCOUNT MENU
    ======================================================== */

    function openAccountMenu() {
        const button =
            getElement("adminAccountButton");

        const menu =
            getElement("adminAccountMenu");

        if (!button || !menu) {
            return;
        }

        state.accountMenuOpen = true;

        menu.classList.add("open");

        button.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    function closeAccountMenu() {
        const button =
            getElement("adminAccountButton");

        const menu =
            getElement("adminAccountMenu");

        if (!button || !menu) {
            return;
        }

        state.accountMenuOpen = false;

        menu.classList.remove("open");

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    function toggleAccountMenu() {
        if (state.accountMenuOpen) {
            closeAccountMenu();
        } else {
            closeNotificationPanel();
            closeSearchPanel();
            openAccountMenu();
        }
    }


    function initializeAccountMenu() {
        const button =
            getElement("adminAccountButton");

        if (button) {
            button.addEventListener(
                "click",
                function (event) {
                    event.stopPropagation();
                    toggleAccountMenu();
                }
            );
        }


        const menu =
            getElement("adminAccountMenu");

        if (menu) {
            menu.addEventListener(
                "click",
                function (event) {
                    event.stopPropagation();
                }
            );
        }


        document.addEventListener(
            "click",
            function (event) {
                if (
                    state.accountMenuOpen &&
                    !event.target.closest(
                        ".admin-account-wrapper"
                    )
                ) {
                    closeAccountMenu();
                }
            }
        );
    }


    /* ========================================================
       NOTIFICAÇÕES
    ======================================================== */

    function getUnreadNotifications() {
        return state.notifications.filter(
            notification =>
                !notification.read
        );
    }


    function updateNotificationBadge() {
        const count =
            getUnreadNotifications().length;

        const badge =
            getElement(
                "adminNotificationBadge"
            );

        if (badge) {
            badge.textContent = count;
            badge.style.display =
                count > 0
                    ? "inline-flex"
                    : "none";
        }
    }


    function createNotificationPanel() {
        if (
            getElement(
                "adminNotificationPanel"
            )
        ) {
            return;
        }

        const button =
            getElement(
                "adminNotificationButton"
            );

        if (!button) {
            return;
        }

        const panel =
            document.createElement("div");

        panel.id =
            "adminNotificationPanel";

        panel.className =
            "admin-notification-panel";

        panel.innerHTML = `
            <div class="admin-notification-panel-header">
                <div>
                    <span>AV MARKET</span>
                    <strong>Notificações</strong>
                </div>

                <button
                    type="button"
                    id="adminMarkNotificationsRead"
                    title="Marcar todas como lidas"
                >
                    <i class="fa-solid fa-check-double"></i>
                </button>
            </div>

            <div
                class="admin-notification-list"
                id="adminNotificationList"
            ></div>
        `;

        button.parentElement.style.position =
            "relative";

        button.parentElement.appendChild(
            panel
        );

        const markButton =
            getElement(
                "adminMarkNotificationsRead"
            );

        if (markButton) {
            markButton.addEventListener(
                "click",
                markAllNotificationsRead
            );
        }

        renderNotifications();
    }


    function renderNotifications() {
        const list =
            getElement(
                "adminNotificationList"
            );

        if (!list) {
            return;
        }

        if (!state.notifications.length) {
            list.innerHTML = `
                <div class="admin-notification-empty">
                    <i class="fa-regular fa-bell-slash"></i>
                    <strong>Nenhuma notificação</strong>
                    <span>Não existem novos alertas administrativos.</span>
                </div>
            `;

            return;
        }

        const notifications =
            [...state.notifications]
                .sort(
                    (a, b) =>
                        Number(
                            b.createdAt || 0
                        ) -
                        Number(
                            a.createdAt || 0
                        )
                )
                .slice(0, 20);

        list.innerHTML =
            notifications
                .map(notification => `
                    <button
                        type="button"
                        class="admin-notification-item ${
                            notification.read
                                ? ""
                                : "unread"
                        }"
                        data-notification-id="${escapeHTML(
                            notification.id
                        )}"
                    >

                        <span class="admin-notification-icon">
                            <i class="fa-solid ${
                                notification.icon ||
                                "fa-bell"
                            }"></i>
                        </span>

                        <span class="admin-notification-content">
                            <strong>
                                ${escapeHTML(
                                    notification.title ||
                                    "Notificação"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    notification.message ||
                                    ""
                                )}
                            </span>

                            <small>
                                ${formatDateTime(
                                    notification.createdAt
                                )}
                            </small>
                        </span>

                    </button>
                `)
                .join("");

        $$(".admin-notification-item").forEach(
            item => {
                item.addEventListener(
                    "click",
                    () => {
                        const id =
                            item.dataset
                                .notificationId;

                        markNotificationRead(id);

                        const notification =
                            state.notifications.find(
                                item =>
                                    item.id ===
                                    id
                            );

                        if (
                            notification &&
                            notification.section
                        ) {
                            navigateToSection(
                                notification.section
                            );
                        }
                    }
                );
            }
        );
    }


    function markNotificationRead(id) {
        const notification =
            state.notifications.find(
                item => item.id === id
            );

        if (!notification) {
            return;
        }

        notification.read = true;

        saveStorage(
            "notifications",
            state.notifications
        );

        updateNotificationBadge();
        renderNotifications();
    }


    function markAllNotificationsRead() {
        state.notifications.forEach(
            notification => {
                notification.read = true;
            }
        );

        saveStorage(
            "notifications",
            state.notifications
        );

        updateNotificationBadge();
        renderNotifications();

        showToast(
            "Todas as notificações foram marcadas como lidas.",
            "success"
        );
    }


    function openNotificationPanel() {
        createNotificationPanel();

        const panel =
            getElement(
                "adminNotificationPanel"
            );

        if (!panel) {
            return;
        }

        closeAccountMenu();
        closeSearchPanel();

        state.notificationPanelOpen = true;

        panel.classList.add("open");

        renderNotifications();
    }


    function closeNotificationPanel() {
        const panel =
            getElement(
                "adminNotificationPanel"
            );

        if (!panel) {
            return;
        }

        state.notificationPanelOpen = false;

        panel.classList.remove("open");
    }


    function toggleNotificationPanel() {
        if (
            state.notificationPanelOpen
        ) {
            closeNotificationPanel();
        } else {
            openNotificationPanel();
        }
    }


    function initializeNotifications() {
        const button =
            getElement(
                "adminNotificationButton"
            );

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();
                toggleNotificationPanel();
            }
        );

        updateNotificationBadge();
    }


    /* ========================================================
       MENSAGENS
    ======================================================== */

    function getUnreadMessages() {
        return state.messages.filter(
            message =>
                !message.read &&
                (message.receiver === "admin" ||
                    !message.receiver)
        );
    }


    function updateMessageBadge() {
        const count =
            getUnreadMessages().length;

        const badge =
            getElement(
                "adminMessageBadge"
            );

        const sidebarCount =
            getElement(
                "adminSidebarMessages"
            );

        if (badge) {
            badge.textContent = count;
            badge.style.display =
                count > 0
                    ? "inline-flex"
                    : "none";
        }

        if (sidebarCount) {
            sidebarCount.textContent =
                count;

            sidebarCount.style.display =
                count > 0
                    ? "inline-flex"
                    : "none";
        }
    }


    function initializeMessagesButton() {
        const button =
            getElement(
                "adminMessagesButton"
            );

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            function () {
                navigateToSection(
                    "mensagens"
                );
            }
        );

        updateMessageBadge();
    }


    function renderMessages() {
        const container =
            getElement(
                "adminMessageList"
            );

        if (!container) {
            return;
        }

        if (!state.messages.length) {
            container.innerHTML = `
                <div class="admin-empty-state large">
                    <i class="fa-regular fa-envelope"></i>
                    <strong>Nenhuma mensagem</strong>
                    <span>As mensagens administrativas aparecerão aqui.</span>
                </div>
            `;

            return;
        }

        const messages =
            [...state.messages]
                .sort(
                    (a, b) =>
                        Number(
                            b.createdAt || 0
                        ) -
                        Number(
                            a.createdAt || 0
                        )
                );

        container.innerHTML =
            messages
                .map(message => `
                    <article
                        class="admin-message-item ${
                            message.read
                                ? ""
                                : "unread"
                        }"
                        data-message-id="${escapeHTML(
                            message.id
                        )}"
                    >

                        <div class="admin-message-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>

                        <div class="admin-message-content">

                            <div class="admin-message-top">

                                <strong>
                                    ${escapeHTML(
                                        message.sender ||
                                        "Utilizador"
                                    )}
                                </strong>

                                <span>
                                    ${formatDateTime(
                                        message.createdAt
                                    )}
                                </span>

                            </div>

                            <strong>
                                ${escapeHTML(
                                    message.subject ||
                                    "Mensagem"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    message.message ||
                                    ""
                                )}
                            </p>

                            <div class="admin-message-actions">

                                <button
                                    type="button"
                                    class="admin-panel-button"
                                    data-message-read="${escapeHTML(
                                        message.id
                                    )}"
                                >
                                    ${
                                        message.read
                                            ? "Marcar como não lida"
                                            : "Marcar como lida"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="admin-panel-button"
                                    data-message-delete="${escapeHTML(
                                        message.id
                                    )}"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </div>

                    </article>
                `)
                .join("");

        $$("[data-message-read]").forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        toggleMessageRead(
                            button.dataset
                                .messageRead
                        );
                    }
                );
            }
        );

        $$("[data-message-delete]").forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        deleteMessage(
                            button.dataset
                                .messageDelete
                        );
                    }
                );
            }
        );
    }


    function toggleMessageRead(id) {
        const message =
            state.messages.find(
                item => item.id === id
            );

        if (!message) {
            return;
        }

        message.read = !message.read;

        saveStorage(
            "messages",
            state.messages
        );

        updateMessageBadge();
        renderMessages();

        showToast(
            message.read
                ? "Mensagem marcada como lida."
                : "Mensagem marcada como não lida.",
            "success"
        );
    }


    function deleteMessage(id) {
        const index =
            state.messages.findIndex(
                message =>
                    message.id === id
            );

        if (index === -1) {
            return;
        }

        state.messages.splice(
            index,
            1
        );

        saveStorage(
            "messages",
            state.messages
        );

        updateMessageBadge();
        renderMessages();

        showToast(
            "Mensagem eliminada.",
            "success"
        );
    }


    function createNewMessage() {
        const recipient =
            window.prompt(
                "Para quem deseja enviar a mensagem?"
            );

        if (!recipient) {
            return;
        }

        const subject =
            window.prompt(
                "Assunto da mensagem:"
            );

        if (!subject) {
            return;
        }

        const messageText =
            window.prompt(
                "Escreva a mensagem:"
            );

        if (!messageText) {
            return;
        }

        state.messages.unshift({
            id: generateId("msg"),
            sender: "Administrador",
            receiver: recipient,
            subject,
            message: messageText,
            read: true,
            createdAt: Date.now()
        });

        saveStorage(
            "messages",
            state.messages
        );

        addActivity(
            "Mensagem enviada",
            `Nova mensagem enviada para ${recipient}.`,
            "fa-envelope"
        );

        renderMessages();
        updateMessageBadge();

        showToast(
            "Mensagem criada com sucesso.",
            "success"
        );
    }


    /* ========================================================
       PESQUISA GLOBAL
    ======================================================== */

    function createSearchPanel() {
        if (
            getElement(
                "adminGlobalSearchPanel"
            )
        ) {
            return;
        }

        const header =
            $(".admin-header");

        if (!header) {
            return;
        }

        const panel =
            document.createElement("div");

        panel.id =
            "adminGlobalSearchPanel";

        panel.className =
            "admin-global-search-panel";

        panel.innerHTML = `
            <div class="admin-global-search-inner">

                <div class="admin-global-search-input">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="search"
                        id="adminGlobalSearchInput"
                        placeholder="Pesquisar no painel..."
                        autocomplete="off"
                    >

                    <button
                        type="button"
                        id="adminGlobalSearchClose"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </div>

                <div
                    class="admin-global-search-results"
                    id="adminGlobalSearchResults"
                ></div>

            </div>
        `;

        header.appendChild(panel);

        const input =
            getElement(
                "adminGlobalSearchInput"
            );

        if (input) {
            input.addEventListener(
                "input",
                () => {
                    performGlobalSearch(
                        input.value
                    );
                }
            );
        }

        const close =
            getElement(
                "adminGlobalSearchClose"
            );

        if (close) {
            close.addEventListener(
                "click",
                closeSearchPanel
            );
        }
    }


    function openSearchPanel() {
        createSearchPanel();

        const panel =
            getElement(
                "adminGlobalSearchPanel"
            );

        const input =
            getElement(
                "adminGlobalSearchInput"
            );

        if (!panel) {
            return;
        }

        closeAccountMenu();
        closeNotificationPanel();

        state.searchPanelOpen = true;

        panel.classList.add("open");

        if (input) {
            setTimeout(() => {
                input.focus();
            }, 50);
        }
    }


    function closeSearchPanel() {
        const panel =
            getElement(
                "adminGlobalSearchPanel"
            );

        if (!panel) {
            return;
        }

        state.searchPanelOpen = false;

        panel.classList.remove("open");
    }


    function initializeGlobalSearch() {
        const button =
            getElement(
                "adminGlobalSearchButton"
            );

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            openSearchPanel
        );
    }


    function performGlobalSearch(query) {
        const results =
            getElement(
                "adminGlobalSearchResults"
            );

        if (!results) {
            return;
        }

        query =
            String(query || "")
                .trim()
                .toLowerCase();

        if (!query) {
            results.innerHTML = `
                <div class="admin-search-empty">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <span>Comece a pesquisar...</span>
                </div>
            `;

            return;
        }

        const matches = [];

        state.products.forEach(
            product => {
                const text =
                    `${product.name || ""} ${
                        product.category || ""
                    }`.toLowerCase();

                if (
                    text.includes(query)
                ) {
                    matches.push({
                        type: "Produto",
                        title:
                            product.name ||
                            "Produto",
                        subtitle:
                            product.category ||
                            "Sem categoria",
                        section:
                            "produtos"
                    });
                }
            }
        );

        state.sellers.forEach(
            seller => {
                const text =
                    `${seller.name || ""} ${
                        seller.email || ""
                    }`.toLowerCase();

                if (
                    text.includes(query)
                ) {
                    matches.push({
                        type: "Revendedor",
                        title:
                            seller.name ||
                            "Revendedor",
                        subtitle:
                            seller.email ||
                            "",
                        section:
                            "revendedores"
                    });
                }
            }
        );

        state.buyers.forEach(
            buyer => {
                const text =
                    `${buyer.name || ""} ${
                        buyer.email || ""
                    }`.toLowerCase();

                if (
                    text.includes(query)
                ) {
                    matches.push({
                        type: "Comprador",
                        title:
                            buyer.name ||
                            "Comprador",
                        subtitle:
                            buyer.email ||
                            "",
                        section:
                            "compradores"
                    });
                }
            }
        );

        const sections = [
            {
                name: "Dashboard",
                section: "dashboard"
            },
            {
                name: "Mensagens",
                section: "mensagens"
            },
            {
                name: "Aprovações",
                section: "mercadorias"
            },
            {
                name: "Produtos",
                section: "produtos"
            },
            {
                name: "Avaliações",
                section: "avaliacoes"
            },
            {
                name: "Revendedores",
                section: "revendedores"
            },
            {
                name: "Compradores",
                section: "compradores"
            },
            {
                name: "Pedidos",
                section: "pedidos"
            },
            {
                name: "Pagamentos",
                section: "pagamentos"
            },
            {
                name: "Relatórios",
                section: "relatorios"
            },
            {
                name: "Categorias",
                section: "categorias"
            },
            {
                name: "Definições",
                section: "definicoes"
            }
        ];

        sections.forEach(item => {
            if (
                item.name
                    .toLowerCase()
                    .includes(query)
            ) {
                matches.push({
                    type: "Secção",
                    title: item.name,
                    subtitle:
                        "Abrir secção administrativa",
                    section:
                        item.section
                });
            }
        });

        if (!matches.length) {
            results.innerHTML = `
                <div class="admin-search-empty">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <strong>Nenhum resultado</strong>
                    <span>Tente outro termo de pesquisa.</span>
                </div>
            `;

            return;
        }

        results.innerHTML =
            matches
                .slice(0, 20)
                .map(
                    (match, index) => `
                        <button
                            type="button"
                            class="admin-global-search-result"
                            data-search-section="${escapeHTML(
                                match.section
                            )}"
                        >

                            <span class="admin-search-result-icon">
                                <i class="fa-solid ${
                                    match.type ===
                                    "Produto"
                                        ? "fa-box"
                                        : match.type ===
                                          "Revendedor"
                                        ? "fa-store"
                                        : match.type ===
                                          "Comprador"
                                        ? "fa-user"
                                        : match.type ===
                                          "Secção"
                                        ? "fa-layer-group"
                                        : "fa-circle"
                                }"></i>
                            </span>

                            <span>
                                <strong>
                                    ${escapeHTML(
                                        match.title
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        match.type
                                    )}
                                    ${
                                        match.subtitle
                                            ? " • " +
                                              escapeHTML(
                                                  match.subtitle
                                              )
                                            : ""
                                    }
                                </small>
                            </span>

                        </button>
                    `
                )
                .join("");

        $$(
            "[data-search-section]"
        ).forEach(item => {
            item.addEventListener(
                "click",
                () => {
                    navigateToSection(
                        item.dataset
                            .searchSection
                    );

                    closeSearchPanel();
                }
            );
        });
    }


    /* ========================================================
       DATA / DASHBOARD
    ======================================================== */

    function calculateDashboardData() {
        const approvedProducts =
            state.products.filter(
                product =>
                    product.status ===
                    "approved"
            );

        const pendingProducts =
            state.products.filter(
                product =>
                    product.status ===
                        "pending" ||
                    product.status ===
                        "review"
            );

        const sales =
            state.orders.reduce(
                (total, order) =>
                    total +
                    Number(
                        order.total || 0
                    ),
                0
            );

        const commission =
            sales * 0.20;

        const sellerPayments =
            sales * 0.80;

        const pendingPayments =
            state.payments
                .filter(
                    payment =>
                        payment.status ===
                        "pending"
                )
                .reduce(
                    (total, payment) =>
                        total +
                        Number(
                            payment.amount ||
                                0
                        ),
                    0
                );

        return {
            sales,
            orders:
                state.orders.length,
            products:
                approvedProducts.length,
            pending:
                pendingProducts.length,
            sellers:
                state.sellers.length,
            buyers:
                state.buyers.length,
            commission,
            sellerPayments,
            pendingPayments
        };
    }


    function updateDashboard() {
        const data =
            calculateDashboardData();

        setText(
            "adminTotalSales",
            formatCurrency(
                data.sales
            )
        );

        setText(
            "adminTotalOrders",
            formatNumber(
                data.orders
            )
        );

        setText(
            "adminTotalProducts",
            formatNumber(
                data.products
            )
        );

        setText(
            "adminTotalPending",
            formatNumber(
                data.pending
            )
        );

        setText(
            "adminTotalSellers",
            formatNumber(
                data.sellers
            )
        );

        setText(
            "adminTotalBuyers",
            formatNumber(
                data.buyers
            )
        );

        setText(
            "adminPlatformRevenue",
            formatCurrency(
                data.commission
            )
        );

        setText(
            "adminPendingPayments",
            formatCurrency(
                data.pendingPayments
            )
        );

        setText(
            "adminReviewPending",
            state.products.filter(
                product =>
                    product.status ===
                    "pending"
            ).length
        );

        setText(
            "adminReviewInProgress",
            state.products.filter(
                product =>
                    product.status ===
                    "review"
            ).length
        );

        setText(
            "adminReviewApproved",
            state.products.filter(
                product =>
                    product.status ===
                    "approved"
            ).length
        );

        setText(
            "adminReviewRejected",
            state.products.filter(
                product =>
                    product.status ===
                    "rejected"
            ).length
        );

        setText(
            "adminPublishedProducts",
            state.products.filter(
                product =>
                    product.status ===
                    "approved"
            ).length
        );

        setText(
            "adminProductsInReview",
            state.products.filter(
                product =>
                    product.status ===
                    "review"
            ).length
        );

        setText(
            "adminRejectedProducts",
            state.products.filter(
                product =>
                    product.status ===
                    "rejected"
            ).length
        );

        setText(
            "adminCategoryTotal",
            state.categories.length
        );

        setText(
            "adminSellerTotal",
            state.sellers.length
        );

        setText(
            "adminSellerActive",
            state.sellers.filter(
                seller =>
                    seller.status ===
                    "active"
            ).length
        );

        setText(
            "adminSellerPending",
            state.sellers.filter(
                seller =>
                    seller.status ===
                    "pending"
            ).length
        );

        setText(
            "adminBuyerTotal",
            state.buyers.length
        );

        setText(
            "adminBuyerActive",
            state.buyers.filter(
                buyer =>
                    buyer.status ===
                    "active"
            ).length
        );

        setText(
            "adminBuyerPurchases",
            state.orders.filter(
                order =>
                    order.buyerId
            ).length
        );

        setText(
            "adminOrdersTotal",
            state.orders.length
        );

        setText(
            "adminOrdersPending",
            state.orders.filter(
                order =>
                    order.status ===
                    "pending"
            ).length
        );

        setText(
            "adminOrdersProcessed",
            state.orders.filter(
                order =>
                    order.status ===
                    "processed"
            ).length
        );

        setText(
            "adminOrdersCompleted",
            state.orders.filter(
                order =>
                    order.status ===
                    "completed"
            ).length
        );

        setText(
            "adminFinancialRevenue",
            formatCurrency(
                data.sales
            )
        );

        setText(
            "adminFinancialCommission",
            formatCurrency(
                data.commission
            )
        );

        setText(
            "adminFinancialSellerPayments",
            formatCurrency(
                data.sellerPayments
            )
        );

        setText(
            "adminFinancialPending",
            formatCurrency(
                data.pendingPayments
            )
        );

        updatePendingAlert(
            data.pending
        );

        renderActivities();

        updateNotificationBadge();
        updateMessageBadge();
    }


    function updatePendingAlert(count) {
        const alert =
            getElement(
                "adminPendingAlert"
            );

        const text =
            getElement(
                "adminPendingAlertText"
            );

        if (!alert || !text) {
            return;
        }

        if (count > 0) {
            alert.style.display = "";

            text.textContent =
                `${formatNumber(
                    count
                )} mercadoria(s) aguardam análise da administração.`;
        } else {
            text.textContent =
                "Não existem mercadorias pendentes de aprovação.";
        }

        setText(
            "adminPendingProductsCount",
            count
        );
    }


    function setText(id, value) {
        const element =
            getElement(id);

        if (element) {
            element.textContent =
                value;
        }
    }


    /* ========================================================
       ATIVIDADE
    ======================================================== */

    function addActivity(
        title,
        description,
        icon = "fa-circle-info"
    ) {
        state.activities.unshift({
            id: generateId("activity"),
            title,
            description,
            icon,
            createdAt: Date.now()
        });

        state.activities =
            state.activities.slice(
                0,
                30
            );

        saveStorage(
            "activities",
            state.activities
        );

        renderActivities();
    }


    function renderActivities() {
        const list =
            getElement(
                "adminActivityList"
            );

        if (!list) {
            return;
        }

        if (!state.activities.length) {
            list.innerHTML = `
                <div class="admin-empty-state">
                    <i class="fa-solid fa-chart-line"></i>
                    <strong>Nenhuma atividade recente</strong>
                    <span>As atividades administrativas aparecerão aqui.</span>
                </div>
            `;

            return;
        }

        list.innerHTML =
            state.activities
                .slice(0, 12)
                .map(activity => `
                    <div class="admin-activity-item">

                        <div class="admin-activity-icon">
                            <i class="fa-solid ${
                                activity.icon ||
                                "fa-circle-info"
                            }"></i>
                        </div>

                        <div class="admin-activity-content">

                            <strong>
                                ${escapeHTML(
                                    activity.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    activity.description
                                )}
                            </span>

                            <small>
                                ${formatDateTime(
                                    activity.createdAt
                                )}
                            </small>

                        </div>

                    </div>
                `)
                .join("");
    }


    function refreshActivity() {
        const button =
            getElement(
                "adminRefreshActivity"
            );

        if (button) {
            button.disabled = true;

            const icon =
                button.querySelector(
                    "i"
                );

            if (icon) {
                icon.classList.add(
                    "fa-spin"
                );
            }

            setTimeout(() => {
                updateDashboard();

                button.disabled =
                    false;

                if (icon) {
                    icon.classList.remove(
                        "fa-spin"
                    );
                }

                showToast(
                    "Atividade atualizada.",
                    "success"
                );
            }, 700);
        }
    }


    /* ========================================================
       MERCADORIAS / APROVAÇÕES
    ======================================================== */

    function getFilteredProducts() {
        let products =
            [...state.products];

        const search =
            state.filters.productSearch
                .toLowerCase()
                .trim();

        const status =
            state.filters.productStatus;

        const business =
            state.filters.productBusiness;

        if (search) {
            products =
                products.filter(
                    product => {
                        const text =
                            `${product.name || ""} ${
                                product.category ||
                                ""
                            } ${
                                product.sellerName ||
                                ""
                            }`.toLowerCase();

                        return text.includes(
                            search
                        );
                    }
                );
        }

        if (status !== "all") {
            products =
                products.filter(
                    product =>
                        product.status ===
                        status
                );
        }

        if (business !== "all") {
            products =
                products.filter(
                    product =>
                        product.businessType ===
                        business
                );
        }

        return products;
    }


    function initializeProductFilters() {
        const search =
            getElement(
                "adminProductSearch"
            );

        const status =
            getElement(
                "adminProductStatusFilter"
            );

        const business =
            getElement(
                "adminProductBusinessFilter"
            );

        if (search) {
            search.addEventListener(
                "input",
                function () {
                    state.filters.productSearch =
                        this.value;

                    renderProductsApproval();
                }
            );
        }

        if (status) {
            status.addEventListener(
                "change",
                function () {
                    state.filters.productStatus =
                        this.value;

                    renderProductsApproval();
                }
            );
        }

        if (business) {
            business.addEventListener(
                "change",
                function () {
                    state.filters.productBusiness =
                        this.value;

                    renderProductsApproval();
                }
            );
        }
    }


    function productStatusLabel(status) {
        const labels = {
            pending: "Aguardando análise",
            review: "Em avaliação",
            approved: "Aprovado",
            rejected: "Rejeitado"
        };

        return (
            labels[status] ||
            "Sem estado"
        );
    }


    function productStatusClass(status) {
        const classes = {
            pending: "warning",
            review: "info",
            approved: "success",
            rejected: "danger"
        };

        return (
            classes[status] ||
            ""
        );
    }


    function renderProductsApproval() {
        const list =
            getElement(
                "adminProductList"
            );

        if (!list) {
            return;
        }

        const products =
            getFilteredProducts();

        if (!products.length) {
            list.innerHTML = `
                <div class="admin-empty-state large">
                    <i class="fa-solid fa-box-open"></i>
                    <strong>Nenhuma mercadoria encontrada</strong>
                    <span>Não existem produtos correspondentes aos filtros.</span>
                </div>
            `;

            updateDashboard();
            return;
        }

        list.innerHTML =
            products
                .map(product => `
                    <article
                        class="admin-product-item"
                        data-product-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <div class="admin-product-item-main">

                            <div class="admin-product-image">

                                ${
                                    product.image
                                        ? `<img src="${escapeHTML(
                                              product.image
                                          )}" alt="${escapeHTML(
                                              product.name ||
                                                  "Produto"
                                          )}">`
                                        : `<i class="fa-solid fa-box"></i>`
                                }

                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        product.name ||
                                            "Produto sem nome"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        product.category ||
                                            "Sem categoria"
                                    )}
                                </span>

                                <small>
                                    Revendedor:
                                    ${escapeHTML(
                                        product.sellerName ||
                                            "Não identificado"
                                    )}
                                </small>

                            </div>

                        </div>

                        <div class="admin-product-item-price">

                            <strong>
                                ${formatCurrency(
                                    product.price
                                )}
                            </strong>

                            <span>
                                ${
                                    product.businessType ===
                                    "direct"
                                        ? "Venda direta"
                                        : "20% / 80%"
                                }
                            </span>

                        </div>

                        <div class="admin-product-status ${productStatusClass(
                            product.status
                        )}">

                            ${escapeHTML(
                                productStatusLabel(
                                    product.status
                                )
                            )}

                        </div>

                        <div class="admin-product-actions">

                            <button
                                type="button"
                                class="admin-panel-button"
                                data-review-product="${escapeHTML(
                                    product.id
                                )}"
                            >
                                <i class="fa-solid fa-eye"></i>
                                Analisar
                            </button>

                        </div>

                    </article>
                `)
                .join("");

        $$(
            "[data-review-product]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    openProductModal(
                        button.dataset
                            .reviewProduct
                    );
                }
            );
        });

        updateDashboard();
    }


    /* ========================================================
       PRODUTOS — TABELA
    ======================================================== */

    function renderProductsTable() {
        const tbody =
            getElement(
                "adminProductsTable"
            );

        if (!tbody) {
            return;
        }

        if (!state.products.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="admin-table-empty">
                            <i class="fa-solid fa-box"></i>
                            <span>Nenhum produto registado.</span>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML =
            state.products
                .map(product => `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    product.name ||
                                        "Produto"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                product.category ||
                                    "—"
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                product.price
                            )}
                        </td>

                        <td>
                            <span class="admin-status-badge ${productStatusClass(
                                product.status
                            )}">
                                ${escapeHTML(
                                    productStatusLabel(
                                        product.status
                                    )
                                )}
                            </span>
                        </td>

                        <td>

                            <div class="admin-table-actions">

                                <button
                                    type="button"
                                    class="admin-panel-button"
                                    data-table-product="${escapeHTML(
                                        product.id
                                    )}"
                                >
                                    Ver
                                </button>

                                <button
                                    type="button"
                                    class="admin-panel-button"
                                    data-delete-product="${escapeHTML(
                                        product.id
                                    )}"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </td>

                    </tr>
                `)
                .join("");

        $$(
            "[data-table-product]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    openProductModal(
                        button.dataset
                            .tableProduct
                    );
                }
            );
        });

        $$(
            "[data-delete-product]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    confirmAction(
                        "Eliminar produto",
                        "Tem a certeza que deseja eliminar este produto?",
                        () => {
                            deleteProduct(
                                button.dataset
                                    .deleteProduct
                            );
                        }
                    );
                }
            );
        });
    }


    function addProduct() {
        const name =
            window.prompt(
                "Nome do produto:"
            );

        if (!name) {
            return;
        }

        const category =
            window.prompt(
                "Categoria:"
            ) || "Sem categoria";

        const price =
            Number(
                window.prompt(
                    "Preço em Kz:"
                )
            ) || 0;

        const product = {
            id: generateId("product"),
            name,
            category,
            price,
            status: "pending",
            businessType: "platform",
            sellerName: "Administrador",
            createdAt: Date.now()
        };

        state.products.unshift(
            product
        );

        saveStorage(
            "products",
            state.products
        );

        addActivity(
            "Novo produto",
            `${name} foi adicionado ao catálogo.`,
            "fa-box-open"
        );

        renderProductsTable();
        renderProductsApproval();
        updateDashboard();

        showToast(
            "Produto adicionado e enviado para aprovação.",
            "success"
        );
    }


    function deleteProduct(id) {
        const index =
            state.products.findIndex(
                product =>
                    product.id === id
            );

        if (index === -1) {
            return;
        }

        const product =
            state.products[index];

        state.products.splice(
            index,
            1
        );

        saveStorage(
            "products",
            state.products
        );

        addActivity(
            "Produto eliminado",
            `${product.name || "Produto"} foi removido.`,
            "fa-trash"
        );

        renderProductsTable();
        renderProductsApproval();
        updateDashboard();

        showToast(
            "Produto eliminado.",
            "success"
        );
    }


    /* ========================================================
       MODAL DE PRODUTO
    ======================================================== */

    function openProductModal(productId) {
        const product =
            state.products.find(
                item =>
                    item.id === productId
            );

        if (!product) {
            showToast(
                "Produto não encontrado.",
                "error"
            );

            return;
        }

        state.currentProduct =
            product;

        const modal =
            getElement(
                "adminProductModal"
            );

        if (!modal) {
            return;
        }

        setText(
            "adminModalProductName",
            product.name ||
                "Produto"
        );

        const body =
            getElement(
                "adminProductModalBody"
            );

        if (body) {
            body.innerHTML = `
                <div class="admin-modal-product">

                    <div class="admin-modal-product-preview">

                        ${
                            product.image
                                ? `<img src="${escapeHTML(
                                      product.image
                                  )}" alt="${escapeHTML(
                                      product.name
                                  )}">`
                                : `<i class="fa-solid fa-box-open"></i>`
                        }

                    </div>

                    <div class="admin-modal-product-details">

                        <div>
                            <span>Produto</span>
                            <strong>
                                ${escapeHTML(
                                    product.name ||
                                        "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Categoria</span>
                            <strong>
                                ${escapeHTML(
                                    product.category ||
                                        "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Preço</span>
                            <strong>
                                ${formatCurrency(
                                    product.price
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Revendedor</span>
                            <strong>
                                ${escapeHTML(
                                    product.sellerName ||
                                        "—"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Modelo</span>
                            <strong>
                                ${
                                    product.businessType ===
                                    "direct"
                                        ? "Venda direta"
                                        : "Plataforma 20% / 80%"
                                }
                            </strong>
                        </div>

                        <div>
                            <span>Estado</span>
                            <strong>
                                ${escapeHTML(
                                    productStatusLabel(
                                        product.status
                                    )
                                )}
                            </strong>
                        </div>

                        <div class="admin-modal-description">

                            <span>Descrição</span>

                            <p>
                                ${escapeHTML(
                                    product.description ||
                                        "Este produto não possui uma descrição registada."
                                )}
                            </p>

                        </div>

                    </div>

                </div>
            `;
        }

        updateProductModalButtons();

        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "admin-modal-open"
        );
    }


    function updateProductModalButtons() {
        const product =
            state.currentProduct;

        if (!product) {
            return;
        }

        const reviewButton =
            getElement(
                "adminModalReviewButton"
            );

        const rejectButton =
            getElement(
                "adminModalRejectButton"
            );

        const approveButton =
            getElement(
                "adminModalApproveButton"
            );

        if (reviewButton) {
            reviewButton.disabled =
                product.status ===
                "review";
        }

        if (approveButton) {
            approveButton.disabled =
                product.status ===
                "approved";
        }

        if (rejectButton) {
            rejectButton.disabled =
                product.status ===
                "rejected";
        }
    }


    function closeProductModal() {
        const modal =
            getElement(
                "adminProductModal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "open"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "admin-modal-open"
        );

        state.currentProduct =
            null;
    }


    function changeProductStatus(status) {
        if (!state.currentProduct) {
            return;
        }

        const product =
            state.products.find(
                item =>
                    item.id ===
                    state.currentProduct.id
            );

        if (!product) {
            return;
        }

        product.status =
            status;

        product.updatedAt =
            Date.now();

        saveStorage(
            "products",
            state.products
        );

        const labels = {
            review: "colocado em avaliação",
            approved: "aprovado",
            rejected: "rejeitado"
        };

        addActivity(
            `Produto ${labels[status] || status}`,
            `${product.name || "Produto"} foi ${labels[status] || status}.`,
            status === "approved"
                ? "fa-check"
                : status === "rejected"
                ? "fa-xmark"
                : "fa-magnifying-glass"
        );

        state.notifications.unshift({
            id: generateId("notification"),
            title:
                "Atualização de mercadoria",
            message:
                `${product.name || "Produto"} foi ${labels[status] || status}.`,
            icon:
                status === "approved"
                    ? "fa-check"
                    : status === "rejected"
                    ? "fa-xmark"
                    : "fa-magnifying-glass",
            section:
                "mercadorias",
            read: false,
            createdAt: Date.now()
        });

        saveStorage(
            "notifications",
            state.notifications
        );

        updateNotificationBadge();

        renderProductsApproval();
        renderProductsTable();
        updateDashboard();

        updateProductModalButtons();

        showToast(
            `Produto ${labels[status] || status}.`,
            status === "rejected"
                ? "warning"
                : "success"
        );
    }


    function initializeProductModal() {
        const close =
            getElement(
                "adminProductModalClose"
            );

        const overlay =
            document.querySelector(
                "#adminProductModal .admin-modal-overlay"
            );

        if (close) {
            close.addEventListener(
                "click",
                closeProductModal
            );
        }

        if (overlay) {
            overlay.addEventListener(
                "click",
                closeProductModal
            );
        }

        const review =
            getElement(
                "adminModalReviewButton"
            );

        if (review) {
            review.addEventListener(
                "click",
                () => {
                    changeProductStatus(
                        "review"
                    );
                }
            );
        }

        const reject =
            getElement(
                "adminModalRejectButton"
            );

        if (reject) {
            reject.addEventListener(
                "click",
                () => {
                    confirmAction(
                        "Rejeitar mercadoria",
                        "Tem a certeza que deseja rejeitar esta mercadoria?",
                        () => {
                            changeProductStatus(
                                "rejected"
                            );
                        }
                    );
                }
            );
        }

        const approve =
            getElement(
                "adminModalApproveButton"
            );

        if (approve) {
            approve.addEventListener(
                "click",
                () => {
                    confirmAction(
                        "Aprovar mercadoria",
                        "Confirmar a aprovação desta mercadoria?",
                        () => {
                            changeProductStatus(
                                "approved"
                            );
                        }
                    );
                }
            );
        }
    }


    /* ========================================================
       CONFIRMAÇÃO
    ======================================================== */

    function confirmAction(
        title,
        message,
        action
    ) {
        const modal =
            getElement(
                "adminConfirmModal"
            );

        if (!modal) {
            if (
                window.confirm(
                    message
                )
            ) {
                action();
            }

            return;
        }

        setText(
            "adminConfirmTitle",
            title
        );

        setText(
            "adminConfirmMessage",
            message
        );

        state.pendingConfirmAction =
            action;

        modal.classList.add(
            "open"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeConfirmModal() {
        const modal =
            getElement(
                "adminConfirmModal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "open"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        state.pendingConfirmAction =
            null;
    }


    function initializeConfirmModal() {
        const cancel =
            getElement(
                "adminConfirmCancel"
            );

        const accept =
            getElement(
                "adminConfirmAccept"
            );

        const overlay =
            document.querySelector(
                "#adminConfirmModal .admin-confirm-overlay"
            );

        if (cancel) {
            cancel.addEventListener(
                "click",
                closeConfirmModal
            );
        }

        if (overlay) {
            overlay.addEventListener(
                "click",
                closeConfirmModal
            );
        }

        if (accept) {
            accept.addEventListener(
                "click",
                () => {
                    const action =
                        state.pendingConfirmAction;

                    closeConfirmModal();

                    if (
                        typeof action ===
                        "function"
                    ) {
                        action();
                    }
                }
            );
        }
    }


    /* ========================================================
       REVENDEDORES
    ======================================================== */

    function renderSellersTable() {
        const tbody =
            getElement(
                "adminSellersTable"
            );

        if (!tbody) {
            return;
        }

        if (!state.sellers.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="admin-table-empty">
                            <i class="fa-solid fa-store"></i>
                            <span>Nenhum revendedor registado.</span>
                        </div>
                    </td>
                </tr>
            `;

            updateSellerStats();
            return;
        }

        tbody.innerHTML =
            state.sellers
                .map(seller => `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    seller.name ||
                                        "Revendedor"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                seller.email ||
                                    "—"
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                seller.products ||
                                    state.products.filter(
                                        product =>
                                            product.sellerId ===
                                            seller.id
                                    ).length
                            )}
                        </td>

                        <td>
                            <span class="admin-status-badge ${
                                seller.status ===
                                "active"
                                    ? "success"
                                    : "warning"
                            }">
                                ${
                                    seller.status ===
                                    "active"
                                        ? "Ativo"
                                        : "Pendente"
                                }
                            </span>
                        </td>

                        <td>

                            <div class="admin-table-actions">

                                <button
                                    type="button"
                                    class="admin-panel-button"
                                    data-seller-toggle="${escapeHTML(
                                        seller.id
                                    )}"
                                >
                                    ${
                                        seller.status ===
                                        "active"
                                            ? "Suspender"
                                            : "Ativar"
                                    }
                                </button>

                            </div>

                        </td>

                    </tr>
                `)
                .join("");

        $$(
            "[data-seller-toggle]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    toggleSellerStatus(
                        button.dataset
                            .sellerToggle
                    );
                }
            );
        });

        updateSellerStats();
    }


    function updateSellerStats() {
        setText(
            "adminSellerTotal",
            state.sellers.length
        );

        setText(
            "adminSellerActive",
            state.sellers.filter(
                seller =>
                    seller.status ===
                    "active"
            ).length
        );

        setText(
            "adminSellerPending",
            state.sellers.filter(
                seller =>
                    seller.status !==
                    "active"
            ).length
        );
    }


    function toggleSellerStatus(id) {
        const seller =
            state.sellers.find(
                item =>
                    item.id === id
            );

        if (!seller) {
            return;
        }

        seller.status =
            seller.status ===
            "active"
                ? "pending"
                : "active";

        saveStorage(
            "sellers",
            state.sellers
        );

        renderSellersTable();
        updateDashboard();

        showToast(
            seller.status === "active"
                ? "Revendedor ativado."
                : "Revendedor suspenso.",
            "success"
        );
    }


    function addSeller() {
        const name =
            window.prompt(
                "Nome do revendedor:"
            );

        if (!name) {
            return;
        }

        const email =
            window.prompt(
                "E-mail do revendedor:"
            );

        if (!email) {
            return;
        }

        state.sellers.unshift({
            id: generateId("seller"),
            name,
            email,
            status: "active",
            products: 0,
            createdAt: Date.now()
        });

        saveStorage(
            "sellers",
            state.sellers
        );

        addActivity(
            "Novo revendedor",
            `${name} foi adicionado à plataforma.`,
            "fa-store"
        );

        renderSellersTable();
        updateDashboard();

        showToast(
            "Revendedor adicionado.",
            "success"
        );
    }


    /* ========================================================
       COMPRADORES
    ======================================================== */

    function renderBuyersTable() {
        const tbody =
            getElement(
                "adminBuyersTable"
            );

        if (!tbody) {
            return;
        }

        if (!state.buyers.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="admin-table-empty">
                            <i class="fa-solid fa-users"></i>
                            <span>Nenhum comprador registado.</span>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML =
            state.buyers
                .map(buyer => {
                    const orders =
                        state.orders.filter(
                            order =>
                                order.buyerId ===
                                buyer.id
                        ).length;

                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        buyer.name ||
                                            "Comprador"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    buyer.email ||
                                        "—"
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    orders
                                )}
                            </td>

                            <td>
                                <span class="admin-status-badge ${
                                    buyer.status ===
                                    "active"
                                        ? "success"
                                        : "warning"
                                }">
                                    ${
                                        buyer.status ===
                                        "active"
                                            ? "Ativo"
                                            : "Pendente"
                                    }
                                </span>
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="admin-panel-button"
                                    data-buyer-toggle="${escapeHTML(
                                        buyer.id
                                    )}"
                                >
                                    ${
                                        buyer.status ===
                                        "active"
                                            ? "Suspender"
                                            : "Ativar"
                                    }
                                </button>

                            </td>

                        </tr>
                    `;
                })
                .join("");

        $$(
            "[data-buyer-toggle]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    toggleBuyerStatus(
                        button.dataset
                            .buyerToggle
                    );
                }
            );
        });

        updateBuyerStats();
    }


    function updateBuyerStats() {
        setText(
            "adminBuyerTotal",
            state.buyers.length
        );

        setText(
            "adminBuyerActive",
            state.buyers.filter(
                buyer =>
                    buyer.status ===
                    "active"
            ).length
        );

        setText(
            "adminBuyerPurchases",
            state.orders.filter(
                order =>
                    order.buyerId
            ).length
        );
    }


    function toggleBuyerStatus(id) {
        const buyer =
            state.buyers.find(
                item =>
                    item.id === id
            );

        if (!buyer) {
            return;
        }

        buyer.status =
            buyer.status ===
            "active"
                ? "pending"
                : "active";

        saveStorage(
            "buyers",
            state.buyers
        );

        renderBuyersTable();
        updateDashboard();

        showToast(
            "Estado do comprador atualizado.",
            "success"
        );
    }


    /* ========================================================
       PEDIDOS
    ======================================================== */

    function renderOrdersTable() {
        const tbody =
            getElement(
                "adminOrdersTable"
            );

        if (!tbody) {
            return;
        }

        if (!state.orders.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="admin-table-empty">
                            <i class="fa-solid fa-receipt"></i>
                            <span>Nenhum pedido registado.</span>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML =
            state.orders
                .map(order => `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    order.id ||
                                        "Pedido"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                order.customerName ||
                                    order.buyerName ||
                                    "—"
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                order.total
                            )}
                        </td>

                        <td>
                            <span class="admin-status-badge">
                                ${escapeHTML(
                                    order.status ||
                                        "pending"
                                )}
                            </span>
                        </td>

                        <td>
                            ${formatDate(
                                order.createdAt
                            )}
                        </td>

                    </tr>
                `)
                .join("");

        updateOrderStats();
    }


    function updateOrderStats() {
        setText(
            "adminOrdersTotal",
            state.orders.length
        );

        setText(
            "adminOrdersPending",
            state.orders.filter(
                order =>
                    order.status ===
                    "pending"
            ).length
        );

        setText(
            "adminOrdersProcessed",
            state.orders.filter(
                order =>
                    order.status ===
                    "processed"
            ).length
        );

        setText(
            "adminOrdersCompleted",
            state.orders.filter(
                order =>
                    order.status ===
                    "completed"
            ).length
        );
    }


    /* ========================================================
       PAGAMENTOS
    ======================================================== */

    function renderPaymentsTable() {
        const tbody =
            getElement(
                "adminPaymentsTable"
            );

        if (!tbody) {
            return;
        }

        if (!state.payments.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="admin-table-empty">
                            <i class="fa-solid fa-wallet"></i>
                            <span>Nenhum pagamento registado.</span>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML =
            state.payments
                .map(payment => `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    payment.reference ||
                                        payment.id ||
                                        "—"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                payment.userName ||
                                    "—"
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                payment.amount
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                payment.type ||
                                    "—"
                            )}
                        </td>

                        <td>
                            <span class="admin-status-badge ${
                                payment.status ===
                                "completed"
                                    ? "success"
                                    : "warning"
                            }">
                                ${escapeHTML(
                                    payment.status ||
                                        "pending"
                                )}
                            </span>
                        </td>

                    </tr>
                `)
                .join("");
    }


    /* ========================================================
       AVALIAÇÕES
    ======================================================== */

    function renderReviews() {
        const list =
            getElement(
                "adminReviewList"
            );

        const total =
            state.reviews.length;

        const pending =
            state.reviews.filter(
                review =>
                    review.status ===
                    "pending"
            ).length;

        const average =
            total
                ? state.reviews.reduce(
                      (sum, review) =>
                          sum +
                          Number(
                              review.rating ||
                                  0
                          ),
                      0
                  ) / total
                : 0;

        setText(
            "adminRatingTotal",
            total
        );

        setText(
            "adminRatingPending",
            pending
        );

        setText(
            "adminAverageRating",
            average.toFixed(1)
        );

        if (!list) {
            return;
        }

        if (!state.reviews.length) {
            list.innerHTML = `
                <div class="admin-empty-state large">
                    <i class="fa-solid fa-star"></i>
                    <strong>Nenhuma avaliação</strong>
                    <span>As avaliações recebidas aparecerão aqui.</span>
                </div>
            `;

            return;
        }

        list.innerHTML =
            state.reviews
                .map(review => `
                    <article class="admin-review-item">

                        <div>
                            <strong>
                                ${escapeHTML(
                                    review.productName ||
                                        "Produto"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    review.userName ||
                                        "Utilizador"
                                )}
                            </span>
                        </div>

                        <div class="admin-review-stars">

                            ${[1, 2, 3, 4, 5]
                                .map(
                                    star =>
                                        `<i class="fa-solid fa-star ${
                                            star <=
                                            Number(
                                                review.rating ||
                                                    0
                                            )
                                                ? "active"
                                                : ""
                                        }"></i>`
                                )
                                .join("")}

                        </div>

                        <p>
                            ${escapeHTML(
                                review.comment ||
                                    ""
                            )}
                        </p>

                    </article>
                `)
                .join("");
    }


    /* ========================================================
       CATEGORIAS
    ======================================================== */

    function renderCategories() {
        const grid =
            getElement(
                "adminCategoryGrid"
            );

        if (!grid) {
            return;
        }

        if (!state.categories.length) {
            grid.innerHTML = `
                <div class="admin-empty-state large">
                    <i class="fa-solid fa-layer-group"></i>
                    <strong>Nenhuma categoria</strong>
                    <span>Crie a primeira categoria do catálogo.</span>
                </div>
            `;

            return;
        }

        grid.innerHTML =
            state.categories
                .map(category => {
                    const productCount =
                        state.products.filter(
                            product =>
                                product.category ===
                                category.name
                        ).length;

                    return `
                        <article class="admin-category-card">

                            <div class="admin-category-icon">
                                <i class="fa-solid ${
                                    category.icon ||
                                    "fa-layer-group"
                                }"></i>
                            </div>

                            <div>
                                <strong>
                                    ${escapeHTML(
                                        category.name
                                    )}
                                </strong>

                                <span>
                                    ${formatNumber(
                                        productCount
                                    )} produto(s)
                                </span>
                            </div>

                            <button
                                type="button"
                                class="admin-panel-button"
                                data-delete-category="${escapeHTML(
                                    category.id
                                )}"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </article>
                    `;
                })
                .join("");

        $$(
            "[data-delete-category]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    confirmAction(
                        "Eliminar categoria",
                        "Tem a certeza que deseja eliminar esta categoria?",
                        () => {
                            deleteCategory(
                                button.dataset
                                    .deleteCategory
                            );
                        }
                    );
                }
            );
        });

        setText(
            "adminCategoryTotal",
            state.categories.length
        );
    }


    function addCategory() {
        const name =
            window.prompt(
                "Nome da nova categoria:"
            );

        if (!name) {
            return;
        }

        const exists =
            state.categories.some(
                category =>
                    category.name
                        .toLowerCase() ===
                    name
                        .trim()
                        .toLowerCase()
            );

        if (exists) {
            showToast(
                "Essa categoria já existe.",
                "warning"
            );

            return;
        }

        state.categories.push({
            id: generateId("category"),
            name:
                name.trim(),
            icon: "fa-layer-group",
            createdAt: Date.now()
        });

        saveStorage(
            "categories",
            state.categories
        );

        addActivity(
            "Nova categoria",
            `${name.trim()} foi criada.`,
            "fa-layer-group"
        );

        renderCategories();
        updateDashboard();

        showToast(
            "Categoria criada com sucesso.",
            "success"
        );
    }


    function deleteCategory(id) {
        const index =
            state.categories.findIndex(
                category =>
                    category.id === id
            );

        if (index === -1) {
            return;
        }

        state.categories.splice(
            index,
            1
        );

        saveStorage(
            "categories",
            state.categories
        );

        renderCategories();
        updateDashboard();

        showToast(
            "Categoria eliminada.",
            "success"
        );
    }


    /* ========================================================
       RELATÓRIOS
    ======================================================== */

    function openReport(type) {
        const output =
            getElement(
                "adminReportOutput"
            );

        if (!output) {
            return;
        }

        let title = "";
        let icon = "";
        let content = "";

        const data =
            calculateDashboardData();

        switch (type) {
            case "sales":
                title = "Relatório de vendas";
                icon = "fa-chart-column";

                content = `
                    <div class="admin-report-result">

                        <div>
                            <span>Volume total</span>
                            <strong>
                                ${formatCurrency(
                                    data.sales
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Pedidos</span>
                            <strong>
                                ${formatNumber(
                                    data.orders
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Ticket médio</span>
                            <strong>
                                ${formatCurrency(
                                    data.orders
                                        ? data.sales /
                                              data.orders
                                        : 0
                                )}
                            </strong>
                        </div>

                    </div>
                `;

                break;

            case "sellers":
                title =
                    "Relatório de revendedores";
                icon = "fa-store";

                content = `
                    <div class="admin-report-result">

                        <div>
                            <span>Total</span>
                            <strong>
                                ${formatNumber(
                                    state.sellers.length
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Ativos</span>
                            <strong>
                                ${formatNumber(
                                    state.sellers.filter(
                                        seller =>
                                            seller.status ===
                                            "active"
                                    ).length
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Pendentes</span>
                            <strong>
                                ${formatNumber(
                                    state.sellers.filter(
                                        seller =>
                                            seller.status !==
                                            "active"
                                    ).length
                                )}
                            </strong>
                        </div>

                    </div>
                `;

                break;

            case "products":
                title =
                    "Relatório de produtos";
                icon = "fa-box";

                content = `
                    <div class="admin-report-result">

                        <div>
                            <span>Total</span>
                            <strong>
                                ${formatNumber(
                                    state.products.length
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Aprovados</span>
                            <strong>
                                ${formatNumber(
                                    state.products.filter(
                                        product =>
                                            product.status ===
                                            "approved"
                                    ).length
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Pendentes</span>
                            <strong>
                                ${formatNumber(
                                    state.products.filter(
                                        product =>
                                            product.status ===
                                                "pending" ||
                                            product.status ===
                                                "review"
                                    ).length
                                )}
                            </strong>
                        </div>

                    </div>
                `;

                break;

            case "financial":
                title =
                    "Relatório financeiro";
                icon = "fa-wallet";

                content = `
                    <div class="admin-report-result">

                        <div>
                            <span>Receita total</span>
                            <strong>
                                ${formatCurrency(
                                    data.sales
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Comissão AV Market</span>
                            <strong>
                                ${formatCurrency(
                                    data.commission
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>A pagar aos revendedores</span>
                            <strong>
                                ${formatCurrency(
                                    data.sellerPayments
                                )}
                            </strong>
                        </div>

                    </div>
                `;

                break;

            default:
                title =
                    "Relatório";
                icon =
                    "fa-file-chart-column";

                content = `
                    <p>
                        Não foi possível identificar o relatório.
                    </p>
                `;
        }

        output.innerHTML = `
            <div class="admin-report-result-wrapper">

                <div class="admin-report-result-header">

                    <span>
                        <i class="fa-solid ${icon}"></i>
                    </span>

                    <div>
                        <strong>
                            ${escapeHTML(
                                title
                            )}
                        </strong>

                        <small>
                            Gerado em
                            ${formatDateTime(
                                Date.now()
                            )}
                        </small>
                    </div>

                </div>

                ${content}

            </div>
        `;
    }


    function generateReport() {
        const type =
            window.prompt(
                "Tipo de relatório: sales, sellers, products ou financial"
            );

        if (!type) {
            return;
        }

        const normalized =
            type
                .trim()
                .toLowerCase();

        if (
            ![
                "sales",
                "sellers",
                "products",
                "financial"
            ].includes(normalized)
        ) {
            showToast(
                "Tipo de relatório inválido.",
                "warning"
            );

            return;
        }

        openReport(
            normalized
        );

        showToast(
            "Relatório gerado.",
            "success"
        );
    }


    function updateReportSummary() {
        const output =
            getElement(
                "adminReportOutput"
            );

        if (!output) {
            return;
        }
    }


    /* ========================================================
       DEFINIÇÕES
    ======================================================== */

    function updateSettingsStatus() {
        setText(
            "adminSystemMode",
            state.connectedToFirebase
                ? "Firebase conectado"
                : "Modo local"
        );

        setText(
            "adminDatabaseStatus",
            state.connectedToFirebase
                ? "Ligação ativa"
                : "Modo local ativo"
        );

        setText(
            "adminSyncStatus",
            state.connectedToFirebase
                ? "Ativa"
                : "Local"
        );

        setText(
            "adminSystemStatus",
            state.connectedToFirebase
                ? "AV Market operacional"
                : "AV Market em modo local"
        );
    }


    function handleSetting(setting) {
        const messages = {
            account:
                "Conta administrativa: gestão do perfil e segurança.",
            platform:
                "Plataforma: configurações gerais do AV Market.",
            commission:
                "Comissões: atualmente configuradas para 20% AV Market / 80% revendedor.",
            notifications:
                "Notificações administrativas: utilize o sino do cabeçalho para visualizar e gerir os alertas.",
            security:
                "Segurança: área preparada para gestão de sessões e permissões.",
            firebase:
                state.connectedToFirebase
                    ? "Firebase está conectado."
                    : "Firebase ainda não está conectado neste ficheiro.",
            approvals:
                "Regras de aprovação: produtos podem passar por pendente, avaliação, aprovado ou rejeitado.",
            permissions:
                "Permissões: painel preparado para controlo de níveis administrativos."
        };

        showToast(
            messages[setting] ||
                "Definição selecionada.",
            "info"
        );
    }


    /* ========================================================
       LOGOUT
    ======================================================== */

    function performLogout() {
        confirmAction(
            "Sair da conta",
            "Tem a certeza que deseja sair da conta administrativa?",
            () => {
                try {
                    localStorage.removeItem(
                        "avmarket_admin_logged"
                    );

                    localStorage.removeItem(
                        "adminLogged"
                    );

                    sessionStorage.clear();
                } catch (error) {
                    console.warn(
                        "Erro ao limpar sessão:",
                        error
                    );
                }

                showToast(
                    "Sessão encerrada.",
                    "success"
                );

                setTimeout(() => {
                    window.location.href =
                        "../../index.html";
                }, 700);
            }
        );
    }


    /* ========================================================
       DATA / EVENT LISTENERS
    ======================================================== */

    function initializeButtons() {
        const refresh =
            getElement(
                "adminRefreshActivity"
            );

        if (refresh) {
            refresh.addEventListener(
                "click",
                refreshActivity
            );
        }


        const newMessage =
            getElement(
                "adminNewMessageButton"
            );

        if (newMessage) {
            newMessage.addEventListener(
                "click",
                createNewMessage
            );
        }


        const addProduct =
            getElement(
                "adminAddProductButton"
            );

        if (addProduct) {
            addProduct.addEventListener(
                "click",
                addProduct
            );
        }


        const addSeller =
            getElement(
                "adminAddSellerButton"
            );

        if (addSeller) {
            addSeller.addEventListener(
                "click",
                addSeller
            );
        }


        const addCategory =
            getElement(
                "adminAddCategoryButton"
            );

        if (addCategory) {
            addCategory.addEventListener(
                "click",
                addCategory
            );
        }


        const generateReportButton =
            getElement(
                "adminGenerateReport"
            );

        if (generateReportButton) {
            generateReportButton.addEventListener(
                "click",
                generateReport
            );
        }


        $$(".admin-report-card button[data-report]").forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        openReport(
                            button.dataset
                                .report
                        );
                    }
                );
            }
        );


        $$(".admin-setting-card[data-setting]").forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        handleSetting(
                            button.dataset
                                .setting
                        );
                    }
                );
            }
        );


        const logout =
            getElement(
                "adminLogoutButton"
            );

        if (logout) {
            logout.addEventListener(
                "click",
                performLogout
            );
        }


        const sidebarLogout =
            getElement(
                "adminSidebarLogout"
            );

        if (sidebarLogout) {
            sidebarLogout.addEventListener(
                "click",
                performLogout
            );
        }
    }


    /* ========================================================
       DATA INICIAL
    ======================================================== */

    function updateCurrentDate() {
        const element =
            getElement(
                "adminCurrentDate"
            );

        if (!element) {
            return;
        }

        element.textContent =
            new Intl.DateTimeFormat(
                "pt-AO",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            ).format(
                new Date()
            );
    }


    /* ========================================================
       KEYBOARD
    ======================================================== */

    function initializeKeyboard() {
        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    closeAccountMenu();
                    closeNotificationPanel();
                    closeSearchPanel();
                    closeProductModal();
                    closeConfirmModal();
                    closeSidebar();
                }

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "k"
                ) {
                    event.preventDefault();

                    openSearchPanel();
                }
            }
        );
    }


    /* ========================================================
       CLICK OUTSIDE
    ======================================================== */

    function initializeOutsideClick() {
        document.addEventListener(
            "click",
            event => {
                const panel =
                    getElement(
                        "adminNotificationPanel"
                    );

                if (
                    state.notificationPanelOpen &&
                    panel &&
                    !panel.contains(
                        event.target
                    ) &&
                    !event.target.closest(
                        "#adminNotificationButton"
                    )
                ) {
                    closeNotificationPanel();
                }


                const searchPanel =
                    getElement(
                        "adminGlobalSearchPanel"
                    );

                if (
                    state.searchPanelOpen &&
                    searchPanel &&
                    !searchPanel.contains(
                        event.target
                    ) &&
                    !event.target.closest(
                        "#adminGlobalSearchButton"
                    )
                ) {
                    closeSearchPanel();
                }
            }
        );
    }


    /* ========================================================
       FIREBASE DETECTION
    ======================================================== */

    function detectFirebase() {
        state.connectedToFirebase =
            Boolean(
                window.firebase ||
                window.db ||
                window.firebaseApp
            );

        updateSettingsStatus();
    }


    /* ========================================================
       RELOAD COMPLETO
    ======================================================== */

    function refreshAll() {
        renderProductsApproval();
        renderProductsTable();
        renderMessages();
        renderSellersTable();
        renderBuyersTable();
        renderOrdersTable();
        renderPaymentsTable();
        renderReviews();
        renderCategories();
        updateDashboard();
        updateSettingsStatus();

        renderNotifications();
        updateNotificationBadge();
        updateMessageBadge();
    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    function initializeAdmin() {
        loadLocalData();

        initializeDefaultData();

        loadAdminName();

        updateCurrentDate();

        createMobileMenuButton();

        initializeNavigation();

        initializeAccountMenu();

        initializeNotifications();

        initializeMessagesButton();

        initializeGlobalSearch();

        initializeProductFilters();

        initializeProductModal();

        initializeConfirmModal();

        initializeButtons();

        initializeKeyboard();

        initializeOutsideClick();

        detectFirebase();

        refreshAll();

        const hash =
            window.location.hash
                .replace("#", "")
                .trim();

        if (
            hash &&
            ADMIN_CONFIG.sections.includes(
                hash
            )
        ) {
            navigateToSection(
                hash,
                false
            );
        } else {
            navigateToSection(
                ADMIN_CONFIG.defaultSection,
                false
            );
        }

        console.log(
            "AV Market Admin Premium inicializado."
        );
    }


    /* ========================================================
       START
    ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeAdmin
        );
    } else {
        initializeAdmin();
    }


    /* ========================================================
       API GLOBAL
       Permite outros ficheiros controlarem o Admin
    ======================================================== */

    window.AVMarketAdmin = {
        navigate:
            navigateToSection,

        refresh:
            refreshAll,

        openMessages:
            () =>
                navigateToSection(
                    "mensagens"
                ),

        openNotifications:
            openNotificationPanel,

        openSearch:
            openSearchPanel,

        openProduct:
            openProductModal,

        notify:
            function (
                title,
                message,
                section = "dashboard"
            ) {
                state.notifications.unshift({
                    id:
                        generateId(
                            "notification"
                        ),
                    title,
                    message,
                    section,
                    read: false,
                    createdAt:
                        Date.now()
                });

                saveStorage(
                    "notifications",
                    state.notifications
                );

                updateNotificationBadge();
                renderNotifications();
            }
    };

})();

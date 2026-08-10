/* =========================================================
   AV MARKET
   ADMIN PREMIUM — ADMIN.JS
   VERSÃO MELHORADA / FUNCIONAL
========================================================= */

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================================================
   ESTADO GLOBAL
========================================================= */

const AdminState = {

    currentSection: "dashboard",

    currentProduct: null,

    currentSeller: null,

    currentBuyer: null,

    currentOrder: null,

    currentReport: null,

    currentUser: null,

    products: [],

    sellers: [],

    buyers: [],

    orders: [],

    payments: [],

    messages: [],

    notifications: [],

    reviews: [],

    categories: [],

    activities: [],

    listeners: [],

    initialized: false

};

/* =========================================================
   FIREBASE
========================================================= */

const db =
    window.firebaseDB ||
    window.db ||
    null;

let auth = null;

try {

    auth = getAuth();

} catch (error) {

    console.warn(
        "Firebase Auth ainda não está disponível.",
        error
    );

}

/* =========================================================
   HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function normalize(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}

function formatMoney(value) {

    const number =
        Number(value) || 0;

    return (
        number.toLocaleString(
            "pt-AO"
        ) + " Kz"
    );

}

function formatDate(value) {

    if (!value) {
        return "—";
    }

    let date;

    try {

        if (
            value &&
            typeof value.toDate ===
            "function"
        ) {

            date = value.toDate();

        } else if (
            value &&
            typeof value.seconds ===
            "number"
        ) {

            date =
                new Date(
                    value.seconds * 1000
                );

        } else {

            date =
                new Date(value);

        }

    } catch {

        return "—";

    }

    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }

    return date.toLocaleDateString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}

function getTimestampValue(value) {

    if (!value) {
        return 0;
    }

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value
            .toDate()
            .getTime();

    }

    if (
        typeof value.seconds ===
        "number"
    ) {

        return value.seconds * 1000;

    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? 0
        : date.getTime();

}

function sortNewestFirst(
    array,
    field = "createdAt"
) {

    return [...array].sort(
        (a, b) =>
            getTimestampValue(
                b[field]
            ) -
            getTimestampValue(
                a[field]
            )
    );

}

function setText(
    id,
    value
) {

    const element = $(id);

    if (element) {

        element.textContent =
            value ?? "";

    }

}

function showToast(
    message,
    type = "success"
) {

    let container =
        $("adminToastContainer");

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "adminToastContainer";

        Object.assign(
            container.style,
            {
                position: "fixed",
                right: "20px",
                bottom: "20px",
                zIndex: "999999",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
            }
        );

        document.body.appendChild(
            container
        );

    }

    const toast =
        document.createElement(
            "div"
        );

    Object.assign(
        toast.style,
        {
            padding: "14px 18px",
            borderRadius: "12px",
            background: "#111",
            color: "#fff",
            boxShadow:
                "0 12px 30px rgba(0,0,0,.25)",
            fontSize: "14px",
            maxWidth: "360px"
        }
    );

    if (type === "error") {

        toast.style.borderLeft =
            "4px solid #d32f2f";

    } else if (
        type === "warning"
    ) {

        toast.style.borderLeft =
            "4px solid #f59e0b";

    } else {

        toast.style.borderLeft =
            "4px solid #2e7d32";

    }

    toast.textContent =
        message;

    container.appendChild(
        toast
    );

    setTimeout(
        () => toast.remove(),
        3500
    );

}

function getProductName(
    product
) {

    return (
        product?.name ||
        product?.title ||
        "Produto"
    );

}

function getSellerName(
    seller
) {

    return (
        seller?.businessName ||
        seller?.storeName ||
        seller?.name ||
        seller?.displayName ||
        "Revendedor"
    );

}

function getBuyerName(
    buyer
) {

    return (
        buyer?.name ||
        buyer?.displayName ||
        buyer?.email ||
        "Comprador"
    );

}

function getStatusLabel(
    status
) {

    const labels = {

        pending: "Pendente",

        approved: "Aprovado",

        published: "Publicado",

        rejected: "Rejeitado",

        review: "Em análise",

        active: "Ativo",

        blocked: "Bloqueado",

        suspended: "Suspenso",

        processed: "Processado",

        completed: "Concluído",

        cancelled: "Cancelado",

        canceled: "Cancelado",

        paid: "Pago",

        failed: "Falhou",

        unread: "Não lida",

        read: "Lida"

    };

    return (
        labels[
            normalize(status)
        ] ||
        status ||
        "Pendente"
    );

}

/* =========================================================
   DATABASE STATUS
========================================================= */

function setDatabaseStatus(
    message
) {

    setText(
        "adminDatabaseStatus",
        message
    );

    setText(
        "adminSystemMode",
        message
    );

    setText(
        "adminSyncStatus",
        message ===
            "Ligação ativa"
            ? "Ativa"
            : "Sincronizando"
    );

}

/* =========================================================
   FIRESTORE — CARREGAR COLEÇÃO
========================================================= */

async function loadCollection(
    collectionName
) {

    if (!db) {

        console.warn(
            "Firestore indisponível:",
            collectionName
        );

        return [];

    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    collectionName
                )
            );

        return snapshot.docs.map(
            item => ({
                id: item.id,
                ...item.data()
            })
        );

    } catch (error) {

        console.error(
            `Erro ao carregar ${collectionName}:`,
            error
        );

        return [];

    }

}

/* =========================================================
   CARREGAR TODA A BASE
========================================================= */

async function loadAdminData() {

    if (!db) {

        setDatabaseStatus(
            "Firebase indisponível"
        );

        return;

    }

    setDatabaseStatus(
        "Sincronizando..."
    );

    try {

        const [

            products,
            sellers,
            buyers,
            orders,
            payments,
            messages,
            notifications,
            reviews,
            categories,
            activities

        ] = await Promise.all([

            loadCollection(
                "products"
            ),

            loadCollection(
                "sellers"
            ),

            loadCollection(
                "buyers"
            ),

            loadCollection(
                "orders"
            ),

            loadCollection(
                "payments"
            ),

            loadCollection(
                "messages"
            ),

            loadCollection(
                "notifications"
            ),

            loadCollection(
                "reviews"
            ),

            loadCollection(
                "categories"
            ),

            loadCollection(
                "activities"
            )

        ]);

        AdminState.products =
            products;

        AdminState.sellers =
            sellers;

        AdminState.buyers =
            buyers;

        AdminState.orders =
            orders;

        AdminState.payments =
            payments;

        AdminState.messages =
            messages;

        AdminState.notifications =
            notifications;

        AdminState.reviews =
            reviews;

        AdminState.categories =
            categories;

        AdminState.activities =
            activities;

        refreshAllUI();

        setDatabaseStatus(
            "Ligação ativa"
        );

    } catch (error) {

        console.error(
            "Erro ao carregar painel:",
            error
        );

        setDatabaseStatus(
            "Erro de sincronização"
        );

        showToast(
            "Não foi possível sincronizar o painel.",
            "error"
        );

    }

}

/* =========================================================
   REFRESH UI
========================================================= */

function refreshAllUI() {

    updateDashboard();

    renderProducts();

    renderSellers();

    renderBuyers();

    renderOrders();

    renderPayments();

    renderMessages();

    renderReviews();

    renderCategories();

    renderActivities();

    updateBadges();

}

/* =========================================================
   NAVEGAÇÃO
========================================================= */

function openSection(
    sectionId
) {

    const section =
        document.getElementById(
            sectionId
        );

    if (!section) {

        sectionId =
            "dashboard";

    }

    const target =
        document.getElementById(
            sectionId
        );

    if (!target) {
        return;
    }

    AdminState.currentSection =
        sectionId;

    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(section => {

            section.style.display =
                "none";

        });

    target.style.display =
        "block";

    document
        .querySelectorAll(
            ".admin-nav-link"
        )
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.section ===
                sectionId
            );

        });

    try {

        history.replaceState(
            null,
            "",
            "#" + sectionId
        );

    } catch {}

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function initializeNavigation() {

    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(element => {

            element.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        element.dataset.section;

                    if (section) {

                        openSection(
                            section
                        );

                    }

                }
            );

        });

}

/* =========================================================
   HASH
========================================================= */

function initializeHash() {

    const openFromHash =
        () => {

            const hash =
                window.location.hash
                    .replace(
                        "#",
                        ""
                    );

            if (
                hash &&
                document.getElementById(
                    hash
                )
            ) {

                openSection(
                    hash
                );

            } else {

                openSection(
                    "dashboard"
                );

            }

        };

    openFromHash();

    window.addEventListener(
        "hashchange",
        openFromHash
    );

}

/* =========================================================
   ACCOUNT MENU
========================================================= */

function initializeAccountMenu() {

    const button =
        $("adminAccountButton");

    const menu =
        $("adminAccountMenu");

    if (!button || !menu) {
        return;
    }

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const open =
                menu.classList.contains(
                    "open"
                );

            menu.classList.toggle(
                "open",
                !open
            );

            button.setAttribute(
                "aria-expanded",
                String(!open)
            );

        }
    );

    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                menu.classList.remove(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}

/* =========================================================
   PESQUISA GLOBAL
========================================================= */

function initializeGlobalSearch() {

    $("adminGlobalSearchButton")
        ?.addEventListener(
            "click",
            openGlobalSearch
        );

}

function openGlobalSearch() {

    let overlay =
        $("adminGlobalSearchOverlay");

    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "adminGlobalSearchOverlay";

        Object.assign(
            overlay.style,
            {
                position: "fixed",
                inset: "0",
                background:
                    "rgba(0,0,0,.70)",
                zIndex: "99998",
                display: "flex",
                alignItems:
                    "flex-start",
                justifyContent:
                    "center",
                padding: "80px 20px"
            }
        );

        overlay.innerHTML = `

            <div
                style="
                    width:min(700px,100%);
                    background:#fff;
                    border-radius:18px;
                    padding:25px;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                    "
                >

                    <i
                        class="fa-solid fa-magnifying-glass"
                    ></i>

                    <input
                        id="adminGlobalSearchInput"
                        type="search"
                        placeholder="Pesquisar no AV Market..."
                        autocomplete="off"
                        style="
                            flex:1;
                            border:0;
                            outline:0;
                            font-size:18px;
                        "
                    >

                    <button
                        id="adminGlobalSearchClose"
                        type="button"
                    >

                        <i
                            class="fa-solid fa-xmark"
                        ></i>

                    </button>

                </div>

                <div
                    id="adminGlobalSearchResults"
                    style="margin-top:20px;"
                ></div>

            </div>

        `;

        document.body.appendChild(
            overlay
        );

        $("adminGlobalSearchClose")
            ?.addEventListener(
                "click",
                () =>
                    overlay.remove()
            );

        $("adminGlobalSearchInput")
            ?.addEventListener(
                "input",
                event =>
                    searchEverything(
                        event.target.value
                    )
            );

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    overlay.remove();

                }

            }
        );

    }

    overlay.style.display =
        "flex";

    $("adminGlobalSearchInput")
        ?.focus();

}

function searchEverything(
    term
) {

    const results =
        $("adminGlobalSearchResults");

    if (!results) {
        return;
    }

    const value =
        normalize(term);

    if (!value) {

        results.innerHTML = `

            <div style="padding:20px;">
                Digite o que pretende pesquisar.
            </div>

        `;

        return;

    }

    const data = [

        ...AdminState.products.map(
            item => ({
                ...item,
                type: "Produto",
                section: "produtos"
            })
        ),

        ...AdminState.sellers.map(
            item => ({
                ...item,
                type: "Revendedor",
                section: "revendedores"
            })
        ),

        ...AdminState.buyers.map(
            item => ({
                ...item,
                type: "Comprador",
                section: "compradores"
            })
        ),

        ...AdminState.orders.map(
            item => ({
                ...item,
                type: "Pedido",
                section: "pedidos"
            })
        ),

        ...AdminState.payments.map(
            item => ({
                ...item,
                type: "Pagamento",
                section: "pagamentos"
            })
        )

    ];

    const filtered =
        data.filter(
            item =>
                JSON.stringify(
                    item
                )
                    .toLowerCase()
                    .includes(
                        value
                    )
        );

    if (!filtered.length) {

        results.innerHTML = `

            <div style="padding:20px;">
                Nenhum resultado encontrado.
            </div>

        `;

        return;

    }

    results.innerHTML =
        filtered
            .slice(0, 20)
            .map(
                item => `

                    <button
                        type="button"
                        class="admin-global-result"
                        data-result-section="${escapeHTML(
                            item.section
                        )}"
                        style="
                            width:100%;
                            text-align:left;
                            padding:14px;
                            border:0;
                            border-bottom:1px solid #eee;
                            background:#fff;
                            cursor:pointer;
                        "
                    >

                        <strong>
                            ${escapeHTML(
                                item.name ||
                                item.title ||
                                item.reference ||
                                item.email ||
                                item.id
                            )}
                        </strong>

                        <small
                            style="
                                display:block;
                                margin-top:4px;
                                opacity:.6;
                            "
                        >
                            ${escapeHTML(
                                item.type
                            )}
                        </small>

                    </button>

                `
            )
            .join("");

    results
        .querySelectorAll(
            "[data-result-section]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset
                            .resultSection;

                    overlayClose();

                    openSection(
                        section
                    );

                }
            );

        });

    function overlayClose() {

        $("adminGlobalSearchOverlay")
            ?.remove();

    }

}

/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const approvedProducts =
        AdminState.products.filter(
            product => {

                const status =
                    normalize(
                        product.status
                    );

                return (
                    status ===
                        "approved" ||
                    status ===
                        "published"
                );

            }
        );

    const pendingProducts =
        AdminState.products.filter(
            product =>
                normalize(
                    product.status
                ) ===
                "pending"
        );

    const reviewProducts =
        AdminState.products.filter(
            product =>
                normalize(
                    product.status
                ) ===
                "review"
        );

    const rejectedProducts =
        AdminState.products.filter(
            product =>
                normalize(
                    product.status
                ) ===
                "rejected"
        );

    const completedOrders =
        AdminState.orders.filter(
            order =>
                normalize(
                    order.status
                ) ===
                "completed"
        );

    const totalSales =
        AdminState.orders.reduce(
            (sum, order) =>
                sum +
                Number(
                    order.total ??
                    order.amount ??
                    order.value ??
                    0
                ),
            0
        );

    const platformRevenue =
        AdminState.payments.reduce(
            (sum, payment) =>
                sum +
                Number(
                    payment.commission ??
                    payment.platformRevenue ??
                    0
                ),
            0
        );

    const pendingPaymentValue =
        AdminState.payments
            .filter(
                payment =>
                    normalize(
                        payment.status
                    ) ===
                    "pending"
            )
            .reduce(
                (sum, payment) =>
                    sum +
                    Number(
                        payment.amount || 0
                    ),
                0
            );

    setText(
        "adminTotalSales",
        formatMoney(
            totalSales
        )
    );

    setText(
        "adminTotalOrders",
        AdminState.orders.length
    );

    setText(
        "adminTotalProducts",
        approvedProducts.length
    );

    setText(
        "adminTotalPending",
        pendingProducts.length
    );

    setText(
        "adminTotalSellers",
        AdminState.sellers.length
    );

    setText(
        "adminTotalBuyers",
        AdminState.buyers.length
    );

    setText(
        "adminPlatformRevenue",
        formatMoney(
            platformRevenue
        )
    );

    setText(
        "adminPendingPayments",
        formatMoney(
            pendingPaymentValue
        )
    );

    setText(
        "adminReviewPending",
        pendingProducts.length
    );

    setText(
        "adminReviewInProgress",
        reviewProducts.length
    );

    setText(
        "adminReviewApproved",
        approvedProducts.length
    );

    setText(
        "adminReviewRejected",
        rejectedProducts.length
    );

    setText(
        "adminPublishedProducts",
        approvedProducts.length
    );

    setText(
        "adminProductsInReview",
        reviewProducts.length
    );

    setText(
        "adminRejectedProducts",
        rejectedProducts.length
    );

    setText(
        "adminCategoryTotal",
        AdminState.categories.length
    );

    setText(
        "adminSellerTotal",
        AdminState.sellers.length
    );

    setText(
        "adminSellerActive",
        AdminState.sellers.filter(
            seller =>
                [
                    "active",
                    "approved"
                ].includes(
                    normalize(
                        seller.status
                    )
                )
        ).length
    );

    setText(
        "adminSellerPending",
        AdminState.sellers.filter(
            seller =>
                normalize(
                    seller.status
                ) ===
                "pending"
        ).length
    );

    setText(
        "adminBuyerTotal",
        AdminState.buyers.length
    );

    setText(
        "adminBuyerActive",
        AdminState.buyers.filter(
            buyer =>
                normalize(
                    buyer.status
                ) !==
                "blocked"
        ).length
    );

    setText(
        "adminBuyerPurchases",
        completedOrders.length
    );

    setText(
        "adminOrdersTotal",
        AdminState.orders.length
    );

    setText(
        "adminOrdersPending",
        AdminState.orders.filter(
            order =>
                normalize(
                    order.status
                ) ===
                "pending"
        ).length
    );

    setText(
        "adminOrdersProcessed",
        AdminState.orders.filter(
            order =>
                normalize(
                    order.status
                ) ===
                "processed"
        ).length
    );

    setText(
        "adminOrdersCompleted",
        completedOrders.length
    );

    setText(
        "adminFinancialRevenue",
        formatMoney(
            totalSales
        )
    );

    setText(
        "adminFinancialCommission",
        formatMoney(
            platformRevenue
        )
    );

    setText(
        "adminFinancialPending",
        formatMoney(
            pendingPaymentValue
        )
    );

    setText(
        "adminFinancialSellerPayments",
        formatMoney(
            Math.max(
                0,
                totalSales -
                platformRevenue
            )
        )
    );

    setText(
        "adminPendingProductsCount",
        pendingProducts.length
    );

    const alert =
        $("adminPendingAlertText");

    if (alert) {

        alert.textContent =
            pendingProducts.length
                ? `${pendingProducts.length} mercadoria(s) aguardam análise administrativa.`
                : "Não existem mercadorias pendentes neste momento.";

    }

}

/* =========================================================
   PRODUTOS
========================================================= */

function renderProducts() {

    const table =
        $("adminProductsTable");

    if (table) {

        if (!AdminState.products.length) {

            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        <div class="admin-table-empty">

                            <i class="fa-solid fa-box"></i>

                            <span>
                                Nenhum produto disponível.
                            </span>

                        </div>

                    </td>

                </tr>

            `;

        } else {

            table.innerHTML =
                sortNewestFirst(
                    AdminState.products
                )
                    .map(
                        product => `

                            <tr>

                                <td>
                                    ${escapeHTML(
                                        getProductName(
                                            product
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        product.category ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${formatMoney(
                                        product.price
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        getStatusLabel(
                                            product.status
                                        )
                                    )}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="admin-table-action"
                                        data-product-view="${product.id}"
                                    >
                                        Ver
                                    </button>

                                    <button
                                        type="button"
                                        class="admin-table-action"
                                        data-product-delete="${product.id}"
                                    >
                                        Remover
                                    </button>

                                </td>

                            </tr>

                        `
                    )
                    .join("");

            table
                .querySelectorAll(
                    "[data-product-view]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () =>
                            openProductModal(
                                button.dataset
                                    .productView
                            )
                    );

                });

            table
                .querySelectorAll(
                    "[data-product-delete]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            confirmAction(
                                "Remover produto",
                                "Tem a certeza que deseja remover este produto?",
                                () =>
                                    deleteProduct(
                                        button.dataset
                                            .productDelete
                                    )
                            );

                        }
                    );

                });

        }

    }

    renderFilteredProducts(
        AdminState.products
    );

}

/* =========================================================
   LISTA DE PRODUTOS + FILTROS
========================================================= */

function initializeProductFilters() {

    const search =
        $("adminProductSearch");

    const status =
        $("adminProductStatusFilter");

    const business =
        $("adminProductBusinessFilter");

    const filter =
        () => {

            const term =
                normalize(
                    search?.value
                );

            const statusValue =
                normalize(
                    status?.value ||
                    "all"
                );

            const businessValue =
                normalize(
                    business?.value ||
                    "all"
                );

            const filtered =
                AdminState.products.filter(
                    product => {

                        const text =
                            normalize(
                                JSON.stringify(
                                    product
                                )
                            );

                        const matchesSearch =
                            !term ||
                            text.includes(
                                term
                            );

                        const matchesStatus =
                            statusValue ===
                                "all" ||
                            normalize(
                                product.status
                            ) ===
                            statusValue;

                        const matchesBusiness =
                            businessValue ===
                                "all" ||
                            normalize(
                                product.businessType
                            ) ===
                            businessValue;

                        return (
                            matchesSearch &&
                            matchesStatus &&
                            matchesBusiness
                        );

                    }
                );

            renderFilteredProducts(
                filtered
            );

        };

    search?.addEventListener(
        "input",
        filter
    );

    status?.addEventListener(
        "change",
        filter
    );

    business?.addEventListener(
        "change",
        filter
    );

}

function renderFilteredProducts(
    products
) {

    const list =
        $("adminProductList");

    if (!list) {
        return;
    }

    if (!products.length) {

        list.innerHTML = `

            <div class="admin-empty-state large">

                <i class="fa-solid fa-box-open"></i>

                <strong>
                    Nenhuma mercadoria encontrada
                </strong>

                <span>
                    Experimente alterar os filtros.
                </span>

            </div>

        `;

        return;

    }

    list.innerHTML =
        sortNewestFirst(
            products
        )
            .map(
                product => `

                    <article
                        class="admin-product-item"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getProductName(
                                        product
                                    )
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    ""
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatMoney(
                                    product.price
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    getStatusLabel(
                                        product.status
                                    )
                                )}
                            </span>

                        </div>

                        <button
                            type="button"
                            data-open-product="${product.id}"
                        >
                            Analisar
                        </button>

                    </article>

                `
            )
            .join("");

    list
        .querySelectorAll(
            "[data-open-product]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openProductModal(
                        button.dataset
                            .openProduct
                    )
            );

        });

}

/* =========================================================
   CRIAR PRODUTO
========================================================= */

function initializeProductCreation() {

    $("adminAddProductButton")
        ?.addEventListener(
            "click",
            openProductCreationForm
        );

}

function openProductCreationForm() {

    openDynamicModal(
        "Adicionar produto",
        `

            <form id="adminProductForm">

                <input
                    name="name"
                    placeholder="Nome do produto"
                    required
                >

                <input
                    name="category"
                    placeholder="Categoria"
                    required
                >

                <input
                    name="price"
                    type="number"
                    min="0"
                    placeholder="Preço em Kz"
                    required
                >

                <input
                    name="image"
                    type="url"
                    placeholder="URL da imagem"
                >

                <textarea
                    name="description"
                    placeholder="Descrição do produto"
                ></textarea>

                <select name="status">

                    <option value="approved">
                        Publicado
                    </option>

                    <option value="pending">
                        Aguardando análise
                    </option>

                </select>

                <button
                    type="submit"
                    class="admin-primary-button"
                >
                    Adicionar produto
                </button>

            </form>

        `
    );

    $("adminProductForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const form =
                    event.target;

                const data =
                    Object.fromEntries(
                        new FormData(
                            form
                        )
                    );

                await createProduct(
                    data
                );

            }
        );

}

async function createProduct(
    data
) {

    if (!db) {

        showToast(
            "Firestore não está disponível.",
            "error"
        );

        return;

    }

    try {

        await addDoc(
            collection(
                db,
                "products"
            ),
            {

                name:
                    data.name.trim(),

                category:
                    data.category.trim(),

                price:
                    Number(
                        data.price
                    ),

                image:
                    data.image?.trim() ||
                    "",

                description:
                    data.description?.trim() ||
                    "",

                status:
                    data.status ||
                    "pending",

                createdAt:
                    serverTimestamp(),

                createdBy:
                    AdminState.currentUser
                        ?.uid ||
                    "admin",

                createdByRole:
                    "admin"

            }
        );

        closeDynamicModal();

        showToast(
            "Produto adicionado com sucesso."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Não foi possível adicionar o produto.",
            "error"
        );

    }

}

/* =========================================================
   MODAL DO PRODUTO
========================================================= */

function openProductModal(
    id
) {

    const product =
        AdminState.products.find(
            item =>
                item.id === id
        );

    if (!product) {

        showToast(
            "Produto não encontrado.",
            "error"
        );

        return;

    }

    AdminState.currentProduct =
        product;

    const modal =
        $("adminProductModal");

    if (!modal) {

        openDynamicModal(
            "Analisar mercadoria",
            buildProductModalContent(
                product
            )
        );

        return;

    }

    setText(
        "adminModalProductName",
        getProductName(
            product
        )
    );

    const body =
        $("adminProductModalBody");

    if (body) {

        body.innerHTML =
            buildProductModalContent(
                product
            );

    }

    modal.classList.add(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}

function buildProductModalContent(
    product
) {

    const seller =
        findSellerForProduct(
            product
        );

    return `

        <div>

            ${
                product.image
                    ? `
                        <img
                            src="${escapeHTML(
                                product.image
                            )}"
                            alt="${escapeHTML(
                                getProductName(
                                    product
                                )
                            )}"
                            style="
                                width:100%;
                                max-height:260px;
                                object-fit:cover;
                                border-radius:14px;
                                margin-bottom:18px;
                            "
                        >
                    `
                    : ""
            }

            <strong>
                ${escapeHTML(
                    getProductName(
                        product
                    )
                )}
            </strong>

            <p>
                ${escapeHTML(
                    product.description ||
                    "Sem descrição."
                )}
            </p>

            <p>
                <strong>Categoria:</strong>
                ${escapeHTML(
                    product.category ||
                    "—"
                )}
            </p>

            <p>
                <strong>Preço:</strong>
                ${formatMoney(
                    product.price
                )}
            </p>

            <p>
                <strong>Revendedor:</strong>
                ${escapeHTML(
                    seller
                        ? getSellerName(
                            seller
                        )
                        : product.sellerName ||
                          "—"
                )}
            </p>

            <p>
                <strong>Estado:</strong>
                ${escapeHTML(
                    getStatusLabel(
                        product.status
                    )
                )}
            </p>

            <p>
                <strong>Data:</strong>
                ${formatDate(
                    product.createdAt
                )}
            </p>

        </div>

    `;

}

function findSellerForProduct(
    product
) {

    const sellerId =
        product.sellerId ||
        product.vendorId ||
        product.ownerId ||
        product.userId ||
        product.createdBy;

    if (!sellerId) {
        return null;
    }

    return (
        AdminState.sellers.find(
            seller =>
                seller.id === sellerId ||
                seller.uid === sellerId ||
                seller.userId === sellerId
        ) ||
        null
    );

}

/* =========================================================
   APROVAÇÃO DE PRODUTO
========================================================= */

async function updateProductStatus(
    status
) {

    const product =
        AdminState.currentProduct;

    if (!product || !db) {
        return;
    }

    try {

        await updateDoc(
            doc(
                db,
                "products",
                product.id
            ),
            {

                status,

                reviewedAt:
                    serverTimestamp(),

                reviewedBy:
                    AdminState.currentUser
                        ?.uid ||
                    "admin"

            }
        );

        closeProductModal();

        showToast(
            status === "approved"
                ? "Mercadoria aprovada e publicada."
                : status === "rejected"
                    ? "Mercadoria rejeitada."
                    : "Mercadoria colocada em análise."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao atualizar mercadoria.",
            "error"
        );

    }

}

function closeProductModal() {

    const modal =
        $("adminProductModal");

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

}

/* =========================================================
   REVendedores
========================================================= */

function renderSellers() {

    const table =
        $("adminSellersTable");

    if (!table) {
        return;
    }

    if (!AdminState.sellers.length) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="admin-table-empty">

                        <i class="fa-solid fa-store"></i>

                        <span>
                            Nenhum revendedor registado.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML =
        sortNewestFirst(
            AdminState.sellers
        )
            .map(
                seller => {

                    const productsCount =
                        AdminState.products.filter(
                            product =>
                                product.sellerId ===
                                    seller.id ||
                                product.vendorId ===
                                    seller.id ||
                                product.ownerId ===
                                    seller.id ||
                                product.userId ===
                                    seller.uid
                        ).length;

                    const status =
                        normalize(
                            seller.status
                        );

                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    getSellerName(
                                        seller
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    seller.email ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${productsCount}
                            </td>

                            <td>
                                ${escapeHTML(
                                    getStatusLabel(
                                        seller.status
                                    )
                                )}
                            </td>

                            <td>

                                ${
                                    status !==
                                        "approved" &&
                                    status !==
                                        "active"
                                        ? `
                                            <button
                                                type="button"
                                                data-seller-approve="${seller.id}"
                                            >
                                                Aprovar
                                            </button>
                                        `
                                        : ""
                                }

                                <button
                                    type="button"
                                    data-seller-view="${seller.id}"
                                >
                                    Ver
                                </button>

                                <button
                                    type="button"
                                    data-seller-delete="${seller.id}"
                                >
                                    Remover
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

    table
        .querySelectorAll(
            "[data-seller-approve]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    updateSellerStatus(
                        button.dataset
                            .sellerApprove,
                        "approved"
                    )
            );

        });

    table
        .querySelectorAll(
            "[data-seller-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openSellerModal(
                        button.dataset
                            .sellerView
                    )
            );

        });

    table
        .querySelectorAll(
            "[data-seller-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    confirmAction(
                        "Remover revendedor",
                        "Tem a certeza que deseja remover este revendedor?",
                        () =>
                            deleteSeller(
                                button.dataset
                                    .sellerDelete
                            )
                    );

                }
            );

        });

}

function openSellerModal(
    id
) {

    const seller =
        AdminState.sellers.find(
            item =>
                item.id === id
        );

    if (!seller) {
        return;
    }

    AdminState.currentSeller =
        seller;

    const products =
        AdminState.products.filter(
            product =>
                product.sellerId === seller.id ||
                product.vendorId === seller.id ||
                product.ownerId === seller.id ||
                product.userId === seller.uid
        );

    openDynamicModal(
        getSellerName(
            seller
        ),
        `

            <div>

                <p>
                    <strong>Nome:</strong>
                    ${escapeHTML(
                        getSellerName(
                            seller
                        )
                    )}
                </p>

                <p>
                    <strong>E-mail:</strong>
                    ${escapeHTML(
                        seller.email ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>Telefone:</strong>
                    ${escapeHTML(
                        seller.phone ||
                        seller.telephone ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>Estado:</strong>
                    ${escapeHTML(
                        getStatusLabel(
                            seller.status
                        )
                    )}
                </p>

                <p>
                    <strong>Produtos:</strong>
                    ${products.length}
                </p>

                <p>
                    <strong>Registado em:</strong>
                    ${formatDate(
                        seller.createdAt
                    )}
                </p>

            </div>

        `
    );

}

async function updateSellerStatus(
    id,
    status
) {

    if (!db) {
        return;
    }

    try {

        await updateDoc(
            doc(
                db,
                "sellers",
                id
            ),
            {

                status,

                reviewedAt:
                    serverTimestamp(),

                reviewedBy:
                    AdminState.currentUser
                        ?.uid ||
                    "admin"

            }
        );

        showToast(
            "Estado do revendedor atualizado."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao atualizar revendedor.",
            "error"
        );

    }

}

async function deleteSeller(
    id
) {

    if (!db) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "sellers",
                id
            )
        );

        showToast(
            "Revendedor removido."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao remover revendedor.",
            "error"
        );

    }

}

/* =========================================================
   CRIAR REVENDEDOR
========================================================= */

function initializeSellerCreation() {

    $("adminAddSellerButton")
        ?.addEventListener(
            "click",
            () => {

                openDynamicModal(
                    "Adicionar revendedor",
                    `

                        <form id="adminSellerForm">

                            <input
                                name="name"
                                placeholder="Nome do revendedor"
                                required
                            >

                            <input
                                name="email"
                                type="email"
                                placeholder="E-mail"
                                required
                            >

                            <input
                                name="phone"
                                placeholder="Telefone"
                            >

                            <button
                                type="submit"
                                class="admin-primary-button"
                            >
                                Adicionar revendedor
                            </button>

                        </form>

                    `
                );

                $("adminSellerForm")
                    ?.addEventListener(
                        "submit",
                        async event => {

                            event.preventDefault();

                            const data =
                                Object.fromEntries(
                                    new FormData(
                                        event.target
                                    )
                                );

                            await createSeller(
                                data
                            );

                        }
                    );

            }
        );

}

async function createSeller(
    data
) {

    if (!db) {
        return;
    }

    try {

        await addDoc(
            collection(
                db,
                "sellers"
            ),
            {

                name:
                    data.name.trim(),

                email:
                    data.email.trim(),

                phone:
                    data.phone?.trim() ||
                    "",

                status:
                    "pending",

                createdAt:
                    serverTimestamp(),

                createdBy:
                    AdminState.currentUser
                        ?.uid ||
                    "admin"

            }
        );

        closeDynamicModal();

        showToast(
            "Revendedor adicionado."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao adicionar revendedor.",
            "error"
        );

    }

}

/* =========================================================
   COMPRADORES
========================================================= */

function renderBuyers() {

    const table =
        $("adminBuyersTable");

    if (!table) {
        return;
    }

    if (!AdminState.buyers.length) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="admin-table-empty">

                        <i class="fa-solid fa-users"></i>

                        <span>
                            Nenhum comprador registado.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML =
        sortNewestFirst(
            AdminState.buyers
        )
            .map(
                buyer => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                getBuyerName(
                                    buyer
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                buyer.email ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${Number(
                                buyer.ordersCount ??
                                buyer.orders ??
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getStatusLabel(
                                    buyer.status ||
                                    "active"
                                )
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                data-buyer-view="${buyer.id}"
                            >
                                Ver
                            </button>

                            <button
                                type="button"
                                data-buyer-delete="${buyer.id}"
                            >
                                Remover
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

    table
        .querySelectorAll(
            "[data-buyer-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openBuyerModal(
                        button.dataset
                            .buyerView
                    )
            );

        });

    table
        .querySelectorAll(
            "[data-buyer-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    confirmAction(
                        "Remover comprador",
                        "Tem a certeza que deseja remover este comprador?",
                        () =>
                            deleteBuyer(
                                button.dataset
                                    .buyerDelete
                            )
                    );

                }
            );

        });

}

function openBuyerModal(
    id
) {

    const buyer =
        AdminState.buyers.find(
            item =>
                item.id === id
        );

    if (!buyer) {
        return;
    }

    AdminState.currentBuyer =
        buyer;

    const orders =
        AdminState.orders.filter(
            order =>
                order.buyerId === buyer.id ||
                order.userId === buyer.id ||
                order.customerId === buyer.id
        );

    openDynamicModal(
        getBuyerName(
            buyer
        ),
        `

            <p>
                <strong>Nome:</strong>
                ${escapeHTML(
                    getBuyerName(
                        buyer
                    )
                )}
            </p>

            <p>
                <strong>E-mail:</strong>
                ${escapeHTML(
                    buyer.email ||
                    "—"
                )}
            </p>

            <p>
                <strong>Telefone:</strong>
                ${escapeHTML(
                    buyer.phone ||
                    "—"
                )}
            </p>

            <p>
                <strong>Pedidos:</strong>
                ${orders.length}
            </p>

            <p>
                <strong>Estado:</strong>
                ${escapeHTML(
                    getStatusLabel(
                        buyer.status ||
                        "active"
                    )
                )}
            </p>

        `
    );

}

async function deleteBuyer(
    id
) {

    if (!db) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "buyers",
                id
            )
        );

        showToast(
            "Comprador removido."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao remover comprador.",
            "error"
        );

    }

}

/* =========================================================
   PEDIDOS
========================================================= */

function renderOrders() {

    const table =
        $("adminOrdersTable");

    if (!table) {
        return;
    }

    if (!AdminState.orders.length) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="admin-table-empty">

                        <i class="fa-solid fa-receipt"></i>

                        <span>
                            Nenhum pedido registado.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML =
        sortNewestFirst(
            AdminState.orders
        )
            .map(
                order => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                order.id
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                order.customerName ||
                                order.customer ||
                                order.buyerName ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                order.total ??
                                order.amount ??
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                getStatusLabel(
                                    order.status ||
                                    "pending"
                                )
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                order.createdAt
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}

/* =========================================================
   PAGAMENTOS
========================================================= */

function renderPayments() {

    const table =
        $("adminPaymentsTable");

    if (!table) {
        return;
    }

    if (!AdminState.payments.length) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="admin-table-empty">

                        <i class="fa-solid fa-wallet"></i>

                        <span>
                            Nenhum pagamento registado.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;

    }

    table.innerHTML =
        sortNewestFirst(
            AdminState.payments
        )
            .map(
                payment => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                payment.reference ||
                                payment.id
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                payment.userName ||
                                payment.user ||
                                payment.buyerName ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatMoney(
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
                            ${escapeHTML(
                                getStatusLabel(
                                    payment.status ||
                                    "pending"
                                )
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}

/* =========================================================
   MENSAGENS
========================================================= */

function renderMessages() {

    const list =
        $("adminMessageList");

    if (!list) {
        return;
    }

    if (!AdminState.messages.length) {

        list.innerHTML = `

            <div class="admin-empty-state large">

                <i class="fa-regular fa-envelope"></i>

                <strong>
                    Nenhuma mensagem
                </strong>

                <span>
                    As comunicações aparecerão nesta área.
                </span>

            </div>

        `;

        return;

    }

    list.innerHTML =
        sortNewestFirst(
            AdminState.messages
        )
            .map(
                message => `

                    <article
                        class="admin-message-item"
                    >

                        <strong>
                            ${escapeHTML(
                                message.subject ||
                                message.title ||
                                "Mensagem"
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                message.text ||
                                message.message ||
                                ""
                            )}
                        </p>

                        <small>
                            ${formatDate(
                                message.createdAt
                            )}
                        </small>

                    </article>

                `
            )
            .join("");

}

function initializeMessages() {

    $("adminNewMessageButton")
        ?.addEventListener(
            "click",
            openMessageForm
        );

}

function openMessageForm() {

    openDynamicModal(
        "Nova mensagem",
        `

            <form id="adminMessageForm">

                <input
                    name="recipient"
                    placeholder="Destinatário"
                    required
                >

                <input
                    name="subject"
                    placeholder="Assunto"
                    required
                >

                <textarea
                    name="message"
                    placeholder="Escreva a mensagem..."
                    required
                ></textarea>

                <button
                    type="submit"
                    class="admin-primary-button"
                >
                    Enviar mensagem
                </button>

            </form>

        `
    );

    $("adminMessageForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const data =
                    Object.fromEntries(
                        new FormData(
                            event.target
                        )
                    );

                await sendMessage(
                    data
                );

            }
        );

}

async function sendMessage(
    data
) {

    if (!db) {
        return;
    }

    try {

        await addDoc(
            collection(
                db,
                "messages"
            ),
            {

                recipient:
                    data.recipient.trim(),

                subject:
                    data.subject.trim(),

                message:
                    data.message.trim(),

                createdAt:
                    serverTimestamp(),

                sender:
                    AdminState.currentUser
                        ?.uid ||
                    "admin",

                senderRole:
                    "admin",

                status:
                    "sent",

                read:
                    false

            }
        );

        closeDynamicModal();

        showToast(
            "Mensagem enviada."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao enviar mensagem.",
            "error"
        );

    }

}

/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function initializeNotifications() {

    $("adminNotificationButton")
        ?.addEventListener(
            "click",
            openNotifications
        );

}

function openNotifications() {

    const notifications =
        sortNewestFirst(
            AdminState.notifications
        );

    openDynamicModal(
        "Notificações",
        notifications.length

            ? notifications
                .map(
                    notification => `

                        <div
                            style="
                                padding:15px 0;
                                border-bottom:1px solid #eee;
                            "
                        >

                            <strong>
                                ${escapeHTML(
                                    notification.title ||
                                    "Notificação"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    notification.message ||
                                    ""
                                )}
                            </p>

                            <small>
                                ${formatDate(
                                    notification.createdAt
                                )}
                            </small>

                        </div>

                    `
                )
                .join("")

            : `

                <div class="admin-empty-state">

                    <i class="fa-regular fa-bell"></i>

                    <strong>
                        Nenhuma notificação
                    </strong>

                    <span>
                        Não existem novos alertas.
                    </span>

                </div>

            `
    );

}

/* =========================================================
   AVALIAÇÕES
========================================================= */

function renderReviews() {

    const list =
        $("adminReviewList");

    if (!list) {
        return;
    }

    if (!AdminState.reviews.length) {

        list.innerHTML = `

            <div class="admin-empty-state">

                <i class="fa-regular fa-star"></i>

                <strong>
                    Nenhuma avaliação
                </strong>

                <span>
                    As avaliações dos compradores aparecerão aqui.
                </span>

            </div>

        `;

        setText(
            "adminRatingTotal",
            "0"
        );

        setText(
            "adminAverageRating",
            "0.0"
        );

        setText(
            "adminRatingPending",
            "0"
        );

        return;

    }

    list.innerHTML =
        sortNewestFirst(
            AdminState.reviews
        )
            .map(
                review => {

                    const rating =
                        Math.max(
                            0,
                            Math.min(
                                5,
                                Number(
                                    review.rating ||
                                    0
                                )
                            )
                        );

                    return `

                        <article
                            class="admin-review-item"
                        >

                            <strong>
                                ${escapeHTML(
                                    review.productName ||
                                    "Produto"
                                )}
                            </strong>

                            <div>
                                ${"★".repeat(
                                    rating
                                )}
                                ${"☆".repeat(
                                    5 - rating
                                )}
                            </div>

                            <p>
                                ${escapeHTML(
                                    review.comment ||
                                    ""
                                )}
                            </p>

                            <small>
                                ${formatDate(
                                    review.createdAt
                                )}
                            </small>

                        </article>

                    `;

                }
            )
            .join("");

    const total =
        AdminState.reviews.length;

    const average =
        AdminState.reviews.reduce(
            (sum, review) =>
                sum +
                Number(
                    review.rating ||
                    0
                ),
            0
        ) / total;

    setText(
        "adminRatingTotal",
        total
    );

    setText(
        "adminAverageRating",
        average.toFixed(1)
    );

    setText(
        "adminRatingPending",
        AdminState.reviews.filter(
            review =>
                normalize(
                    review.status
                ) ===
                "pending"
        ).length
    );

}

/* =========================================================
   CATEGORIAS
========================================================= */

function renderCategories() {

    const grid =
        $("adminCategoryGrid");

    if (!grid) {
        return;
    }

    if (!AdminState.categories.length) {

        grid.innerHTML = `

            <div class="admin-empty-state large">

                <i class="fa-solid fa-layer-group"></i>

                <strong>
                    Nenhuma categoria
                </strong>

                <span>
                    Crie a primeira categoria.
                </span>

            </div>

        `;

        return;

    }

    grid.innerHTML =
        AdminState.categories
            .map(
                category => `

                    <div
                        class="admin-category-card"
                    >

                        <div>

                            <i
                                class="fa-solid fa-layer-group"
                            ></i>

                        </div>

                        <strong>
                            ${escapeHTML(
                                category.name ||
                                "Categoria"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                category.description ||
                                ""
                            )}
                        </span>

                        <button
                            type="button"
                            data-category-delete="${category.id}"
                        >
                            Remover
                        </button>

                    </div>

                `
            )
            .join("");

    grid
        .querySelectorAll(
            "[data-category-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    confirmAction(
                        "Remover categoria",
                        "Tem a certeza que deseja remover esta categoria?",
                        () =>
                            deleteCategory(
                                button.dataset
                                    .categoryDelete
                            )
                    );

                }
            );

        });

}

function initializeCategories() {

    $("adminAddCategoryButton")
        ?.addEventListener(
            "click",
            () => {

                openDynamicModal(
                    "Nova categoria",
                    `

                        <form id="adminCategoryForm">

                            <input
                                name="name"
                                placeholder="Nome da categoria"
                                required
                            >

                            <textarea
                                name="description"
                                placeholder="Descrição"
                            ></textarea>

                            <button
                                type="submit"
                                class="admin-primary-button"
                            >
                                Criar categoria
                            </button>

                        </form>

                    `
                );

                $("adminCategoryForm")
                    ?.addEventListener(
                        "submit",
                        async event => {

                            event.preventDefault();

                            const data =
                                Object.fromEntries(
                                    new FormData(
                                        event.target
                                    )
                                );

                            await createCategory(
                                data
                            );

                        }
                    );

            }
        );

}

async function createCategory(
    data
) {

    if (!db) {
        return;
    }

    try {

        await addDoc(
            collection(
                db,
                "categories"
            ),
            {

                name:
                    data.name.trim(),

                description:
                    data.description?.trim() ||
                    "",

                createdAt:
                    serverTimestamp(),

                createdBy:
                    AdminState.currentUser
                        ?.uid ||
                    "admin"

            }
        );

        closeDynamicModal();

        showToast(
            "Categoria criada."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao criar categoria.",
            "error"
        );

    }

}

async function deleteCategory(
    id
) {

    if (!db) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "categories",
                id
            )
        );

        showToast(
            "Categoria removida."
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Erro ao remover categoria.",
            "error"
        );

    }

}

/* =========================================================
   ATIVIDADES
========================================================= */

function renderActivities() {

    const list =
        $("adminActivityList");

    if (!list) {
        return;
    }

    if (!AdminState.activities.length) {

        list.innerHTML = `

            <div class="admin-empty-state">

                <i class="fa-solid fa-chart-line"></i>

                <strong>
                    Nenhuma atividade registada
                </strong>

                <span>
                    As atividades da plataforma aparecerão aqui.
                </span>

            </div>

        `;

        return;

    }

    list.innerHTML =
        sortNewestFirst(
            AdminState.activities
        )
            .slice(0, 20)
            .map(
                activity => `

                    <div
                        class="admin-activity-item"
                    >

                        <strong>
                            ${escapeHTML(
                                activity.title ||
                                activity.action ||
                                "Atividade"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                activity.description ||
                                ""
                            )}
                        </span>

                        <small>
                            ${formatDate(
                                activity.createdAt
                            )}
                        </small>

                    </div>

                `
            )
            .join("");

}

/* =========================================================
   RELATÓRIOS
========================================================= */

function initializeReports() {

    $("adminGenerateReport")
        ?.addEventListener(
            "click",
            () =>
                generateReport(
                    "sales"
                )
        );

    document
        .querySelectorAll(
            "[data-report]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    generateReport(
                        button.dataset.report
                    )
            );

        });

}

function generateReport(
    type = "sales"
) {

    AdminState.currentReport =
        type;

    const output =
        $("adminReportOutput");

    if (!output) {
        return;
    }

    let title =
        "Relatório";

    let rows = [];

    if (type === "sales") {

        title =
            "Relatório de vendas";

        rows = [

            [
                "Pedidos",
                String(
                    AdminState.orders.length
                )
            ],

            [
                "Volume",
                formatMoney(
                    AdminState.orders.reduce(
                        (sum, order) =>
                            sum +
                            Number(
                                order.total ??
                                order.amount ??
                                0
                            ),
                        0
                    )
                )
            ]

        ];

    } else if (
        type === "sellers"
    ) {

        title =
            "Relatório de revendedores";

        rows = [

            [
                "Total",
                String(
                    AdminState.sellers.length
                )
            ],

            [
                "Ativos",
                String(
                    AdminState.sellers.filter(
                        seller =>
                            [
                                "active",
                                "approved"
                            ].includes(
                                normalize(
                                    seller.status
                                )
                            )
                    ).length
                )
            ]

        ];

    } else if (
        type === "products"
    ) {

        title =
            "Relatório de produtos";

        rows = [

            [
                "Total",
                String(
                    AdminState.products.length
                )
            ],

            [
                "Aprovados",
                String(
                    AdminState.products.filter(
                        product =>
                            [
                                "approved",
                                "published"
                            ].includes(
                                normalize(
                                    product.status
                                )
                            )
                    ).length
                )
            ],

            [
                "Pendentes",
                String(
                    AdminState.products.filter(
                        product =>
                            normalize(
                                product.status
                            ) ===
                            "pending"
                    ).length
                )
            ]

        ];

    } else if (
        type === "financial"
    ) {

        title =
            "Relatório financeiro";

        rows = [

            [
                "Pagamentos",
                String(
                    AdminState.payments.length
                )
            ],

            [
                "Receita",
                formatMoney(
                    AdminState.payments.reduce(
                        (sum, payment) =>
                            sum +
                            Number(
                                payment.amount ||
                                0
                            ),
                        0
                    )
                )
            ],

            [
                "Comissões",
                formatMoney(
                    AdminState.payments.reduce(
                        (sum, payment) =>
                            sum +
                            Number(
                                payment.commission ||
                                payment.platformRevenue ||
                                0
                            ),
                        0
                    )
                )
            ]

        ];

    }

    output.innerHTML = `

        <div>

            <h3>
                ${escapeHTML(
                    title
                )}
            </h3>

            ${rows
                .map(
                    row => `

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                padding:15px;
                                border-bottom:1px solid #eee;
                            "
                        >

                            <span>
                                ${escapeHTML(
                                    row[0]
                                )}
                            </span>

                            <strong>
                                ${escapeHTML(
                                    row[1]
                                )}
                            </strong>

                        </div>

                    `
                )
                .join("")}

            <button
                type="button"
                id="adminDownloadReport"
                class="admin-primary-button"
                style="margin-top:20px;"
            >

                <i class="fa-solid fa-download"></i>

                Exportar relatório

            </button>

        </div>

    `;

    $("adminDownloadReport")
        ?.addEventListener(
            "click",
            () =>
                downloadReport(
                    title,
                    rows
                )
        );

}

function downloadReport(
    title,
    rows
) {

    const content =
        [
            "AV MARKET",
            title,
            "",
            ...rows.map(
                row =>
                    `${row[0]}: ${row[1]}`
            )
        ].join("\n");

    const blob =
        new Blob(
            [content],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        `relatorio-av-market-${Date.now()}.txt`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );

}

/* =========================================================
   MODAL DINÂMICO
========================================================= */

function openDynamicModal(
    title,
    content
) {

    let modal =
        $("adminDynamicModal");

    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "adminDynamicModal";

        Object.assign(
            modal.style,
            {
                position: "fixed",
                inset: "0",
                zIndex: "99999",
                background:
                    "rgba(0,0,0,.65)",
                display: "flex",
                alignItems:
                    "center",
                justifyContent:
                    "center",
                padding: "20px"
            }
        );

        modal.innerHTML = `

            <div
                style="
                    width:min(600px,100%);
                    max-height:90vh;
                    overflow:auto;
                    background:#fff;
                    border-radius:20px;
                    padding:25px;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:15px;
                        margin-bottom:20px;
                    "
                >

                    <h3
                        id="adminDynamicModalTitle"
                    ></h3>

                    <button
                        type="button"
                        id="adminDynamicModalClose"
                    >

                        <i
                            class="fa-solid fa-xmark"
                        ></i>

                    </button>

                </div>

                <div
                    id="adminDynamicModalBody"
                ></div>

            </div>

        `;

        document.body.appendChild(
            modal
        );

        $("adminDynamicModalClose")
            ?.addEventListener(
                "click",
                closeDynamicModal
            );

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeDynamicModal();

                }

            }
        );

    }

    setText(
        "adminDynamicModalTitle",
        title
    );

    const body =
        $("adminDynamicModalBody");

    if (body) {

        body.innerHTML =
            content;

    }

    modal.style.display =
        "flex";

}

function closeDynamicModal() {

    $("adminDynamicModal")
        ?.remove();

}

/* =========================================================
   CONFIRMAÇÃO
========================================================= */

let confirmationCallback =
    null;

function confirmAction(
    title,
    message,
    callback
) {

    const modal =
        $("adminConfirmModal");

    if (!modal) {

        if (
            window.confirm(
                `${title}\n\n${message}`
            )
        ) {

            callback?.();

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

    confirmationCallback =
        callback;

    modal.classList.add(
        "open"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}

function closeConfirmation() {

    const modal =
        $("adminConfirmModal");

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

    confirmationCallback =
        null;

}

/* =========================================================
   MODAIS EXISTENTES
========================================================= */

function initializeModals() {

    $("adminProductModalClose")
        ?.addEventListener(
            "click",
            closeProductModal
        );

    document
        .querySelector(
            "#adminProductModal .admin-modal-overlay"
        )
        ?.addEventListener(
            "click",
            closeProductModal
        );

    $("adminModalApproveButton")
        ?.addEventListener(
            "click",
            () =>
                updateProductStatus(
                    "approved"
                )
        );

    $("adminModalRejectButton")
        ?.addEventListener(
            "click",
            () =>
                updateProductStatus(
                    "rejected"
                )
        );

    $("adminModalReviewButton")
        ?.addEventListener(
            "click",
            () =>
                updateProductStatus(
                    "review"
                )
        );

    $("adminConfirmCancel")
        ?.addEventListener(
            "click",
            closeConfirmation
        );

    $("adminConfirmAccept")
        ?.addEventListener(
            "click",
            async () => {

                const callback =
                    confirmationCallback;

                closeConfirmation();

                if (callback) {

                    await callback();

                }

            }
        );

    document
        .querySelector(
            ".admin-confirm-overlay"
        )
        ?.addEventListener(
            "click",
            closeConfirmation
        );

}

/* =========================================================
   SETTINGS
========================================================= */

function initializeSettings() {

    document
        .querySelectorAll(
            "[data-setting]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openSetting(
                        button.dataset
                            .setting
                    )
            );

        });

}

function openSetting(
    setting
) {

    const settings = {

        account: [
            "Conta administrativa",
            "Gestão dos dados e segurança da conta administrativa."
        ],

        platform: [
            "Plataforma",
            "Configurações gerais do AV Market."
        ],

        commission: [
            "Comissões",
            "Configuração da divisão administrativa 20% / 80%."
        ],

        notifications: [
            "Notificações",
            "Configuração dos alertas administrativos."
        ],

        security: [
            "Segurança",
            "Controlo de sessões e acesso administrativo."
        ],

        firebase: [
            "Base de dados",
            "Estado da ligação ao Firebase."
        ],

        approvals: [
            "Regras de aprovação",
            "Gestão do processo de análise das mercadorias."
        ],

        permissions: [
            "Permissões",
            "Gestão dos níveis de acesso administrativo."
        ]

    };

    const selected =
        settings[setting];

    if (!selected) {
        return;
    }

    openDynamicModal(
        selected[0],
        `

            <p>
                ${escapeHTML(
                    selected[1]
                )}
            </p>

            <button
                type="button"
                class="admin-primary-button"
                id="adminSettingCloseButton"
            >
                Fechar
            </button>

        `
    );

    $("adminSettingCloseButton")
        ?.addEventListener(
            "click",
            closeDynamicModal
        );

}

/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    [

        $("adminLogoutButton"),

        $("adminSidebarLogout")

    ].forEach(
        button => {

            button?.addEventListener(
                "click",
                () => {

                    confirmAction(
                        "Sair da conta",
                        "Tem a certeza que deseja terminar a sessão?",
                        logoutAdmin
                    );

                }
            );

        }
    );

}

async function logoutAdmin() {

    try {

        if (auth) {

            await signOut(
                auth
            );

        }

        window.location.href =
            "../../index.html";

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Não foi possível terminar a sessão.",
            "error"
        );

    }

}

/* =========================================================
   AUTENTICAÇÃO
========================================================= */

function initializeAuthentication() {

    if (!auth) {

        console.warn(
            "Firebase Auth não encontrado."
        );

        return;

    }

    onAuthStateChanged(
        auth,
        async user => {

            if (!user) {

                AdminState.currentUser =
                    null;

                console.warn(
                    "Nenhum utilizador autenticado."
                );

                return;

            }

            AdminState.currentUser =
                user;

            const name =
                user.displayName ||
                user.email ||
                "Administrador";

            setText(
                "adminHeaderName",
                name
            );

            setText(
                "adminMenuName",
                name
            );

            /*
             * Mantemos a autenticação do Firebase
             * como base da sessão.
             *
             * Os campos accountType / role /
             * status podem ser utilizados pelo
             * teu documento de utilizador.
             */

            try {

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );

                const userSnapshot =
                    await getDoc(
                        userRef
                    );

                if (
                    userSnapshot.exists()
                ) {

                    const profile =
                        userSnapshot.data();

                    const accountType =
                        normalize(
                            profile.accountType
                        );

                    const role =
                        normalize(
                            profile.role
                        );

                    const status =
                        normalize(
                            profile.status
                        );

                    /*
                     * Não bloqueamos automaticamente
                     * apenas porque os campos não
                     * existem, evitando quebrar
                     * instalações antigas.
                     */

                    if (
                        status ===
                            "blocked" ||
                        status ===
                            "suspended"
                    ) {

                        showToast(
                            "Esta conta administrativa está bloqueada.",
                            "error"
                        );

                        await signOut(
                            auth
                        );

                        window.location.href =
                            "../../index.html";

                        return;

                    }

                    if (
                        accountType ===
                            "admin" ||
                        role ===
                            "admin" ||
                        role ===
                            "administrador"
                    ) {

                        console.log(
                            "Perfil administrativo confirmado."
                        );

                    }

                }

            } catch (error) {

                console.warn(
                    "Não foi possível carregar o perfil administrativo.",
                    error
                );

            }

        }
    );

}

/* =========================================================
   REALTIME FIRESTORE
========================================================= */

function initializeRealtime(
    collectionName,
    callback
) {

    if (!db) {
        return null;
    }

    try {

        const unsubscribe =
            onSnapshot(
                collection(
                    db,
                    collectionName
                ),
                snapshot => {

                    const data =
                        snapshot.docs.map(
                            item => ({
                                id: item.id,
                                ...item.data()
                            })
                        );

                    callback(
                        data
                    );

                },
                error => {

                    console.error(
                        `Realtime ${collectionName}:`,
                        error
                    );

                }
            );

        AdminState.listeners.push(
            unsubscribe
        );

        return unsubscribe;

    } catch (error) {

        console.error(
            error
        );

        return null;

    }

}

function initializeRealtimeSync() {

    if (!db) {
        return;
    }

    initializeRealtime(
        "products",
        data => {

            AdminState.products =
                data;

            updateDashboard();

            renderProducts();

        }
    );

    initializeRealtime(
        "sellers",
        data => {

            AdminState.sellers =
                data;

            updateDashboard();

            renderSellers();

        }
    );

    initializeRealtime(
        "buyers",
        data => {

            AdminState.buyers =
                data;

            updateDashboard();

            renderBuyers();

        }
    );

    initializeRealtime(
        "orders",
        data => {

            AdminState.orders =
                data;

            updateDashboard();

            renderOrders();

        }
    );

    initializeRealtime(
        "payments",
        data => {

            AdminState.payments =
                data;

            updateDashboard();

            renderPayments();

        }
    );

    initializeRealtime(
        "messages",
        data => {

            AdminState.messages =
                data;

            renderMessages();

            updateBadges();

        }
    );

    initializeRealtime(
        "notifications",
        data => {

            AdminState.notifications =
                data;

            updateBadges();

        }
    );

    initializeRealtime(
        "reviews",
        data => {

            AdminState.reviews =
                data;

            renderReviews();

        }
    );

    initializeRealtime(
        "categories",
        data => {

            AdminState.categories =
                data;

            renderCategories();

            updateDashboard();

        }
    );

    initializeRealtime(
        "activities",
        data => {

            AdminState.activities =
                data;

            renderActivities();

        }
    );

}

/* =========================================================
   BADGES
========================================================= */

function updateBadges() {

    const unreadMessages =
        AdminState.messages.filter(
            message =>
                message.read === false ||
                normalize(
                    message.status
                ) ===
                "unread"
        ).length;

    const unreadNotifications =
        AdminState.notifications.filter(
            notification =>
                notification.read === false ||
                normalize(
                    notification.status
                ) ===
                "unread"
        ).length;

    setText(
        "adminMessageBadge",
        unreadMessages
    );

    setText(
        "adminSidebarMessages",
        unreadMessages
    );

    setText(
        "adminNotificationBadge",
        unreadNotifications
    );

}

/* =========================================================
   DATA / DATE
========================================================= */

function initializeDate() {

    setText(
        "adminCurrentDate",
        new Date().toLocaleDateString(
            "pt-AO",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )
    );

}

/* =========================================================
   REFRESH MANUAL
========================================================= */

function initializeRefresh() {

    $("adminRefreshActivity")
        ?.addEventListener(
            "click",
            async () => {

                showToast(
                    "A atualizar dados..."
                );

                await loadAdminData();

                showToast(
                    "Dados atualizados."
                );

            }
        );

}

/* =========================================================
   ESC — FECHAR MODAIS
========================================================= */

function initializeKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            closeDynamicModal();

            closeProductModal();

            closeConfirmation();

            $("adminGlobalSearchOverlay")
                ?.remove();

        }
    );

}

/* =========================================================
   LIMPEZA REALTIME
========================================================= */

function cleanupRealtime() {

    AdminState.listeners
        .forEach(
            unsubscribe => {

                try {

                    unsubscribe();

                } catch {}

            }
        );

    AdminState.listeners =
        [];

}

/* =========================================================
   INICIALIZAÇÃO PRINCIPAL
========================================================= */

async function initializeAdmin() {

    if (
        AdminState.initialized
    ) {

        return;

    }

    AdminState.initialized =
        true;

    console.log(
        "AV Market Admin Premium iniciado."
    );

    initializeDate();

    initializeNavigation();

    initializeAccountMenu();

    initializeGlobalSearch();

    initializeNotifications();

    initializeMessages();

    initializeProductCreation();

    initializeSellerCreation();

    initializeCategories();

    initializeReports();

    initializeSettings();

    initializeLogout();

    initializeModals();

    initializeProductFilters();

    initializeRefresh();

    initializeKeyboard();

    initializeAuthentication();

    initializeHash();

    await loadAdminData();

    initializeRealtimeSync();

    updateBadges();

    openSection(
        window.location.hash
            ?.replace(
                "#",
                ""
            ) ||
        "dashboard"
    );

}

/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAdmin,
        {
            once: true
        }
    );

} else {

    initializeAdmin();

}

/* =========================================================
   FUNÇÕES GLOBAIS
========================================================= */

window.closeDynamicModal =
    closeDynamicModal;

window.openSection =
    openSection;

window.showToast =
    showToast;

window.openProductModal =
    openProductModal;

window.closeProductModal =
    closeProductModal;

window.updateProductStatus =
    updateProductStatus;

window.generateReport =
    generateReport;

window.logoutAdmin =
    logoutAdmin;

window.cleanupAdminRealtime =
    cleanupRealtime;

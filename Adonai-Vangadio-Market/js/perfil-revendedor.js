/* ======================================================
   AV MARKET
   PERFIL DO REVENDEDOR
   PERFIL-REVENDEDOR.JS

   ARQUITETURA PREPARADA PARA FIREBASE

   COMPATÍVEL COM:
   - avMarketSellerProducts
   - avMarketAdminMessages
   - Auth
   - role === "revendedor"
====================================================== */


/* ======================================================
   CONFIGURAÇÕES
====================================================== */

const SELLER_HEADER_HEIGHT =
    70;


const SELLER_PRODUCTS_KEY =
    "avMarketSellerProducts";


const SELLER_MESSAGES_KEY =
    "avMarketAdminMessages";


const SELLER_ACTIVITY_KEY =
    "avMarketSellerActivity";


const SELLER_ROLE =
    "revendedor";


/* ======================================================
   UTILITÁRIOS
====================================================== */

function sellerEscapeHTML(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function sellerFormatCurrency(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "pt-AO"
    ) + " Kz";

}


function sellerFormatDate(
    date
) {

    if (!date) {

        return "—";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "—";

    }


    return parsed.toLocaleDateString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function sellerFormatDateTime(
    date
) {

    if (!date) {

        return "—";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "—";

    }


    return parsed.toLocaleString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ======================================================
   UTILITÁRIO — TEXTO
====================================================== */

function sellerSetText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* ======================================================
   UTILIZADOR ATUAL
====================================================== */

function getCurrentSeller() {

    const possibleKeys = [

        "currentUser",

        "avMarketCurrentUser",

        "loggedUser",

        "user"

    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const saved =
                localStorage.getItem(
                    key
                );


            if (!saved) {

                continue;

            }


            const user =
                JSON.parse(
                    saved
                );


            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        } catch (error) {

            continue;

        }

    }


    const name =
        localStorage.getItem(
            "sellerName"
        ) ||
        localStorage.getItem(
            "userName"
        ) ||
        localStorage.getItem(
            "name"
        );


    const email =
        localStorage.getItem(
            "sellerEmail"
        ) ||
        localStorage.getItem(
            "userEmail"
        ) ||
        localStorage.getItem(
            "email"
        );


    return {

        name:
            name ||
            "Revendedor",

        email:
            email ||
            "",

        role:
            SELLER_ROLE

    };

}


/* ======================================================
   AUTORIZAÇÃO
====================================================== */

async function verifySellerAccess() {

    try {

        if (
            typeof Auth !== "undefined" &&
            typeof Auth.getCurrentUser === "function"
        ) {

            const user =
                await Auth.getCurrentUser();


            if (!user) {

                window.location.href =
                    "login-revendedor.html";

                return false;

            }


            const role =
                user.role ||
                user.accountType ||
                user.userType;


            if (
                role &&
                role !== SELLER_ROLE
            ) {

                window.location.href =
                    "../../index.html";

                return false;

            }

        }

        return true;

    } catch (error) {

        console.warn(
            "Verificação do revendedor aguardando integração Firebase:",
            error
        );

        return true;

    }

}


/* ======================================================
   NOME / DADOS DO REVENDEDOR
====================================================== */

function loadSellerProfile() {

    const user =
        getCurrentSeller();


    const name =
        user.name ||
        user.fullName ||
        user.businessName ||
        user.displayName ||
        "Revendedor";


    const email =
        user.email ||
        "";


    sellerSetText(
        "sellerHeaderName",
        name
    );


    sellerSetText(
        "sellerMenuName",
        name
    );


    sellerSetText(
        "sellerSidebarName",
        name
    );


    sellerSetText(
        "sellerWelcomeName",
        name
    );


    sellerSetText(
        "sellerMenuEmail",
        email || "Conta de revendedor"
    );


    const initials =
        sellerGetInitials(
            name
        );


    [
        "sellerHeaderAvatar",

        "sellerMenuAvatar",

        "sellerSidebarAvatar"

    ]
        .forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.innerHTML =
                        sellerEscapeHTML(
                            initials
                        );

                }

            }
        );

}


/* ======================================================
   INICIAIS
====================================================== */

function sellerGetInitials(
    name
) {

    const parts =
        String(
            name || "AV"
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(Boolean);


    if (!parts.length) {

        return "AV";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* ======================================================
   PRODUTOS
====================================================== */

function getSellerProducts() {

    try {

        const saved =
            localStorage.getItem(
                SELLER_PRODUCTS_KEY
            );


        if (!saved) {

            return [];

        }


        const products =
            JSON.parse(
                saved
            );


        return Array.isArray(
            products
        )
            ? products
            : [];

    } catch (error) {

        console.error(
            "Erro ao obter mercadorias:",
            error
        );

        return [];

    }

}


/* ======================================================
   GUARDAR PRODUTOS
====================================================== */

function saveSellerProducts(
    products
) {

    localStorage.setItem(
        SELLER_PRODUCTS_KEY,
        JSON.stringify(
            products
        )
    );

}


/* ======================================================
   IDENTIFICAÇÃO DO REVENDEDOR
====================================================== */

function getSellerIdentifier() {

    const user =
        getCurrentSeller();


    return (
        user.id ||
        user.uid ||
        user.email ||
        localStorage.getItem(
            "sellerEmail"
        ) ||
        localStorage.getItem(
            "userEmail"
        ) ||
        ""
    );

}


/* ======================================================
   FILTRAR PRODUTOS DO REVENDEDOR
====================================================== */

function getCurrentSellerProducts() {

    const products =
        getSellerProducts();


    const sellerId =
        getSellerIdentifier();


    if (!sellerId) {

        return products;

    }


    const sellerProducts =
        products.filter(
            function (product) {

                const productSeller =
                    product.sellerId ||
                    product.sellerUid ||
                    product.userId ||
                    product.ownerId ||
                    product.email;


                if (!productSeller) {

                    return true;

                }


                return (
                    String(
                        productSeller
                    ) ===
                    String(
                        sellerId
                    )
                );

            }
        );


    return sellerProducts;

}


/* ======================================================
   ESTADOS
====================================================== */

function getSellerStatusInfo(
    status
) {

    const statuses = {

        pending: {

            label:
                "Aguardando análise",

            className:
                "pending",

            icon:
                "fa-clock"

        },


        review: {

            label:
                "Em avaliação",

            className:
                "review",

            icon:
                "fa-magnifying-glass"

        },


        approved: {

            label:
                "Aprovado",

            className:
                "approved",

            icon:
                "fa-circle-check"

        },


        rejected: {

            label:
                "Rejeitado",

            className:
                "rejected",

            icon:
                "fa-circle-xmark"

        }

    };


    return (
        statuses[status] ||
        statuses.pending
    );

}


/* ======================================================
   ATIVIDADE
====================================================== */

function getSellerActivity() {

    try {

        const saved =
            localStorage.getItem(
                SELLER_ACTIVITY_KEY
            );


        if (!saved) {

            return [];

        }


        const activity =
            JSON.parse(
                saved
            );


        return Array.isArray(
            activity
        )
            ? activity
            : [];

    } catch (error) {

        return [];

    }

}


function saveSellerActivity(
    activity
) {

    localStorage.setItem(
        SELLER_ACTIVITY_KEY,
        JSON.stringify(
            activity
        )
    );

}


function addSellerActivity(
    title,
    description,
    icon
) {

    const activities =
        getSellerActivity();


    activities.unshift({

        id:
            Date.now(),

        title:
            title,

        description:
            description,

        icon:
            icon ||
            "fa-circle-info",

        createdAt:
            new Date().toISOString()

    });


    saveSellerActivity(
        activities.slice(
            0,
            30
        )
    );


    renderSellerActivity();

}


/* ======================================================
   RENDER ATIVIDADE
====================================================== */

function renderSellerActivity() {

    const container =
        document.getElementById(
            "sellerActivityList"
        );


    if (!container) {

        return;

    }


    const activities =
        getSellerActivity();


    if (!activities.length) {

        container.innerHTML = `

            <div class="seller-empty-activity">

                <i class="fa-solid fa-chart-line"></i>

                <strong>
                    Nenhuma atividade registada
                </strong>

                <span>
                    As atualizações das suas mercadorias
                    aparecerão aqui.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    activities
        .slice(
            0,
            10
        )
        .forEach(
            function (activity) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "seller-activity-item";


                item.innerHTML = `

                    <div class="seller-activity-icon">

                        <i class="fa-solid ${
                            sellerEscapeHTML(
                                activity.icon
                            )
                        }"></i>

                    </div>


                    <div class="seller-activity-content">

                        <strong>
                            ${sellerEscapeHTML(
                                activity.title
                            )}
                        </strong>

                        <span>
                            ${sellerEscapeHTML(
                                activity.description
                            )}
                        </span>

                    </div>


                    <time>
                        ${sellerFormatDateTime(
                            activity.createdAt
                        )}
                    </time>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


/* ======================================================
   PRODUTOS — RENDER
====================================================== */

function renderSellerProducts() {

    const container =
        document.getElementById(
            "sellerProductList"
        );


    if (!container) {

        return;

    }


    const search =
        document
            .getElementById(
                "sellerProductSearch"
            )
            ?.value
            .trim()
            .toLowerCase() || "";


    const statusFilter =
        document
            .getElementById(
                "sellerProductStatusFilter"
            )
            ?.value ||
        "all";


    let products =
        getCurrentSellerProducts();


    products =
        products.filter(
            function (product) {

                const matchesSearch =
                    !search ||
                    String(
                        product.name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            search
                        ) ||
                    String(
                        product.category ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesStatus =
                    statusFilter ===
                        "all" ||
                    product.status ===
                        statusFilter;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    if (!products.length) {

        container.innerHTML = `

            <div class="seller-empty-products">

                <i class="fa-solid fa-box-open"></i>

                <strong>
                    Nenhuma mercadoria encontrada
                </strong>

                <span>
                    As mercadorias enviadas para o AV Market
                    aparecerão nesta área.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    products.forEach(
        function (product) {

            const status =
                getSellerStatusInfo(
                    product.status
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "seller-product-card";


            card.innerHTML = `

                <div class="seller-product-main">

                    <div class="seller-product-icon">

                        <i class="fa-solid fa-box"></i>

                    </div>


                    <div class="seller-product-info">

                        <div class="seller-product-title-row">

                            <h3>
                                ${sellerEscapeHTML(
                                    product.name ||
                                    "Mercadoria"
                                )}
                            </h3>


                            <span class="seller-status-badge ${status.className}">

                                <i class="fa-solid ${
                                    status.icon
                                }"></i>

                                ${status.label}

                            </span>

                        </div>


                        <p>
                            ${sellerEscapeHTML(
                                product.category ||
                                "Sem categoria"
                            )}
                        </p>


                        <div class="seller-product-meta">

                            <span>

                                <i class="fa-solid fa-tag"></i>

                                ${sellerFormatCurrency(
                                    product.price
                                )}

                            </span>


                            <span>

                                <i class="fa-regular fa-calendar"></i>

                                ${sellerFormatDate(
                                    product.createdAt
                                )}

                            </span>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="seller-product-action"
                    data-product-id="${sellerEscapeHTML(
                        product.id
                    )}"
                    aria-label="Ver mercadoria"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>

            `;


            container.appendChild(
                card
            );

        }
    );


    container
        .querySelectorAll(
            ".seller-product-action"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const productId =
                            this.dataset.productId;


                        const product =
                            getSellerProducts()
                                .find(
                                    item =>
                                        String(
                                            item.id
                                        ) ===
                                        String(
                                            productId
                                        )
                                );


                        if (product) {

                            showSellerProductDetails(
                                product
                            );

                        }

                    }
                );

            }
        );

}


/* ======================================================
   DETALHES DO PRODUTO
====================================================== */

function showSellerProductDetails(
    product
) {

    const status =
        getSellerStatusInfo(
            product.status
        );


    alert(

        `Mercadoria: ${product.name || "Mercadoria"}\n\n` +

        `Estado: ${status.label}\n` +

        `Categoria: ${
            product.category ||
            "Não definida"
        }\n` +

        `Preço: ${
            sellerFormatCurrency(
                product.price
            )
        }\n\n` +

        `Data: ${
            sellerFormatDateTime(
                product.createdAt
            )
        }`

    );

}


/* ======================================================
   ESTATÍSTICAS
====================================================== */

function updateSellerStatistics() {

    const products =
        getCurrentSellerProducts();


    const total =
        products.length;


    const approved =
        products.filter(
            product =>
                product.status ===
                "approved"
        ).length;


    const pending =
        products.filter(
            product =>
                product.status ===
                "pending"
        ).length;


    const review =
        products.filter(
            product =>
                product.status ===
                "review"
        ).length;


    const rejected =
        products.filter(
            product =>
                product.status ===
                "rejected"
        ).length;


    sellerSetText(
        "sellerTotalProducts",
        total
    );


    sellerSetText(
        "sellerApprovedProducts",
        approved
    );


    sellerSetText(
        "sellerPendingProducts",
        pending
    );


    sellerSetText(
        "sellerProductNavBadge",
        total
    );


    const sales =
        getSellerSales();


    sellerSetText(
        "sellerTotalSales",
        sales.length
    );


    const alert =
        document.getElementById(
            "sellerPendingAlert"
        );


    const alertText =
        document.getElementById(
            "sellerPendingAlertText"
        );


    const alertTitle =
        document.getElementById(
            "sellerPendingAlertTitle"
        );


    if (
        alert &&
        alertText &&
        alertTitle
    ) {

        if (
            pending +
            review >
            0
        ) {

            alert.classList.add(
                "visible"
            );


            const totalAnalysis =
                pending +
                review;


            alertTitle.textContent =
                "Mercadorias em análise";


            alertText.textContent =
                totalAnalysis === 1

                    ? "Existe 1 mercadoria a ser analisada."

                    : `Existem ${totalAnalysis} mercadorias em processo de análise.`;

        } else {

            alert.classList.remove(
                "visible"
            );

        }

    }


    updateSellerFinancialStatistics();

}


/* ======================================================
   VENDAS
====================================================== */

function getSellerSales() {

    try {

        const possibleKeys = [

            "avMarketSellerSales",

            "avMarketSales",

            "sellerSales"

        ];


        for (
            const key of possibleKeys
        ) {

            const saved =
                localStorage.getItem(
                    key
                );


            if (!saved) {

                continue;

            }


            const sales =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    sales
                )
            ) {

                return sales;

            }

        }

    } catch (error) {

        return [];

    }


    return [];

}


/* ======================================================
   FINANCEIRO
====================================================== */

function updateSellerFinancialStatistics() {

    const sales =
        getSellerSales();


    const totalSales =
        sales.reduce(
            function (
                total,
                sale
            ) {

                return (
                    total +
                    (
                        Number(
                            sale.total ||
                            sale.amount ||
                            sale.value
                        ) ||
                        0
                    )
                );

            },
            0
        );


    const commission =
        totalSales *
        0.20;


    const sellerValue =
        totalSales -
        commission;


    sellerSetText(
        "sellerFinancialSales",
        sellerFormatCurrency(
            totalSales
        )
    );


    sellerSetText(
        "sellerFinancialCommission",
        sellerFormatCurrency(
            commission
        )
    );


    sellerSetText(
        "sellerFinancialSellerValue",
        sellerFormatCurrency(
            sellerValue
        )
    );

}


/* ======================================================
   MENSAGENS
====================================================== */

function getSellerMessages() {

    try {

        const saved =
            localStorage.getItem(
                SELLER_MESSAGES_KEY
            );


        if (!saved) {

            return [];

        }


        const messages =
            JSON.parse(
                saved
            );


        return Array.isArray(
            messages
        )
            ? messages
            : [];

    } catch (error) {

        return [];

    }

}


/* ======================================================
   MENSAGENS NÃO LIDAS
====================================================== */

function getUnreadSellerMessages() {

    return getSellerMessages()
        .filter(
            function (message) {

                return (
                    message.read !== true
                );

            }
        );

}


/* ======================================================
   CONTADORES
====================================================== */

function updateSellerMessageCounters() {

    const unread =
        getUnreadSellerMessages()
            .length;


    sellerSetText(
        "sellerSidebarMessageBadge",
        unread
    );


    sellerSetText(
        "sellerMenuMessageBadge",
        unread
    );

}


/* ======================================================
   RENDER MENSAGENS
====================================================== */

function renderSellerMessages() {

    const container =
        document.getElementById(
            "sellerMessagesList"
        );


    if (!container) {

        return;

    }


    const messages =
        getSellerMessages();


    if (!messages.length) {

        container.innerHTML = `

            <div class="seller-empty-panel">

                <div class="seller-empty-icon">

                    <i class="fa-regular fa-message"></i>

                </div>

                <h3>
                    Nenhuma mensagem
                </h3>

                <p>
                    As mensagens administrativas
                    aparecerão aqui.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    messages.forEach(
        function (message) {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "seller-message-item";


            if (
                message.read !== true
            ) {

                item.classList.add(
                    "seller-message-unread"
                );

            }


            item.innerHTML = `

                <div class="seller-message-icon">

                    <i class="fa-regular fa-message"></i>

                </div>


                <div class="seller-message-content">

                    <strong>
                        ${sellerEscapeHTML(
                            message.title ||
                            "Mensagem AV Market"
                        )}
                    </strong>


                    <p>
                        ${sellerEscapeHTML(
                            message.message ||
                            message.content ||
                            "Nova comunicação."
                        )}
                    </p>


                    <time>
                        ${sellerFormatDateTime(
                            message.createdAt ||
                            message.date
                        )}
                    </time>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* ======================================================
   NOTIFICAÇÕES
====================================================== */

function buildSellerNotifications() {

    const notifications = [];


    /* ==================================================
       PRODUTOS
    ================================================== */

    const products =
        getCurrentSellerProducts();


    products.forEach(
        function (product) {

            const status =
                product.status;


            if (
                status ===
                "approved"
            ) {

                notifications.push({

                    id:
                        "product-approved-" +
                        product.id,

                    title:
                        "Mercadoria aprovada",

                    description:
                        `${product.name || "A sua mercadoria"} foi aprovada pelo AV Market.`,

                    icon:
                        "fa-circle-check",

                    date:
                        product.updatedAt ||
                        product.createdAt

                });

            }


            if (
                status ===
                "rejected"
            ) {

                notifications.push({

                    id:
                        "product-rejected-" +
                        product.id,

                    title:
                        "Mercadoria rejeitada",

                    description:
                        `${product.name || "A sua mercadoria"} foi rejeitada após análise.`,

                    icon:
                        "fa-circle-xmark",

                    date:
                        product.updatedAt ||
                        product.createdAt

                });

            }


            if (
                status ===
                "review"
            ) {

                notifications.push({

                    id:
                        "product-review-" +
                        product.id,

                    title:
                        "Mercadoria em avaliação",

                    description:
                        `${product.name || "A sua mercadoria"} está atualmente em avaliação.`,

                    icon:
                        "fa-magnifying-glass",

                    date:
                        product.updatedAt ||
                        product.createdAt

                });

            }


            if (
                status ===
                "pending"
            ) {

                notifications.push({

                    id:
                        "product-pending-" +
                        product.id,

                    title:
                        "Mercadoria recebida",

                    description:
                        `${product.name || "A sua mercadoria"} aguarda análise administrativa.`,

                    icon:
                        "fa-clock",

                    date:
                        product.createdAt

                });

            }

        }
    );


    /* ==================================================
       MENSAGENS
    ================================================== */

    getSellerMessages()
        .forEach(
            function (message) {

                notifications.push({

                    id:
                        "message-" +
                        (
                            message.id ||
                            message.createdAt ||
                            Date.now()
                        ),

                    title:
                        message.title ||
                        "Nova mensagem",

                    description:
                        message.message ||
                        message.content ||
                        "Existe uma nova comunicação.",

                    icon:
                        "fa-message",

                    date:
                        message.createdAt ||
                        message.date

                });

            }
        );


    notifications.sort(
        function (
            a,
            b
        ) {

            return (
                new Date(
                    b.date || 0
                ) -
                new Date(
                    a.date || 0
                )
            );

        }
    );


    return notifications.slice(
        0,
        20
    );

}


/* ======================================================
   NOTIFICAÇÕES LIDAS
====================================================== */

function getReadNotifications() {

    try {

        const saved =
            localStorage.getItem(
                "avMarketSellerReadNotifications"
            );


        if (!saved) {

            return [];

        }


        const data =
            JSON.parse(
                saved
            );


        return Array.isArray(
            data
        )
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveReadNotifications(
    notifications
) {

    localStorage.setItem(
        "avMarketSellerReadNotifications",
        JSON.stringify(
            notifications
        )
    );

}


/* ======================================================
   ATUALIZAR BADGE
====================================================== */

function updateSellerNotificationBadge() {

    const notifications =
        buildSellerNotifications();


    const read =
        getReadNotifications();


    const unread =
        notifications.filter(
            function (notification) {

                return !read.includes(
                    notification.id
                );

            }
        );


    const badge =
        document.getElementById(
            "sellerNotificationBadge"
        );


    if (!badge) {

        return;

    }


    if (
        unread.length > 0
    ) {

        badge.textContent =
            unread.length >
            99
                ? "99+"
                : unread.length;


        badge.classList.add(
            "visible"
        );

    } else {

        badge.textContent =
            "0";

        badge.classList.remove(
            "visible"
        );

    }

}


/* ======================================================
   RENDER NOTIFICAÇÕES
====================================================== */

function renderSellerNotifications() {

    const container =
        document.getElementById(
            "sellerNotificationList"
        );


    if (!container) {

        return;

    }


    const notifications =
        buildSellerNotifications();


    if (!notifications.length) {

        container.innerHTML = `

            <div class="seller-notification-empty">

                <i class="fa-regular fa-bell-slash"></i>

                <strong>
                    Nenhuma notificação
                </strong>

                <span>
                    Não existem novas atualizações.
                </span>

            </div>

        `;

        updateSellerNotificationBadge();

        return;

    }


    const read =
        getReadNotifications();


    container.innerHTML = "";


    notifications.forEach(
        function (
            notification
        ) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "seller-notification-item";


            const isRead =
                read.includes(
                    notification.id
                );


            if (!isRead) {

                item.style.background =
                    "#fffdf7";

            }


            item.innerHTML = `

                <div class="seller-notification-icon">

                    <i class="fa-solid ${
                        sellerEscapeHTML(
                            notification.icon
                        )
                    }"></i>

                </div>


                <div class="seller-notification-content">

                    <strong>
                        ${sellerEscapeHTML(
                            notification.title
                        )}
                    </strong>


                    <span>
                        ${sellerEscapeHTML(
                            notification.description
                        )}
                    </span>


                    <time>
                        ${sellerFormatDateTime(
                            notification.date
                        )}
                    </time>

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    markSellerNotificationRead(
                        notification.id
                    );

                    updateSellerNotificationBadge();

                }
            );


            container.appendChild(
                item
            );

        }
    );


    updateSellerNotificationBadge();

}


/* ======================================================
   MARCAR NOTIFICAÇÃO COMO LIDA
====================================================== */

function markSellerNotificationRead(
    id
) {

    const read =
        getReadNotifications();


    if (
        !read.includes(
            id
        )
    ) {

        read.push(
            id
        );

    }


    saveReadNotifications(
        read
    );

}


/* ======================================================
   MARCAR TODAS COMO LIDAS
====================================================== */

function markAllSellerNotificationsRead() {

    const notifications =
        buildSellerNotifications();


    const ids =
        notifications.map(
            notification =>
                notification.id
        );


    saveReadNotifications(
        ids
    );


    renderSellerNotifications();

}


/* ======================================================
   MENU DA CONTA
====================================================== */

function initializeSellerAccountMenu() {

    const button =
        document.getElementById(
            "sellerAccountButton"
        );


    const menu =
        document.getElementById(
            "sellerAccountMenu"
        );


    if (
        !button ||
        !menu
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function (
            event
        ) {

            event.stopPropagation();


            const isOpen =
                menu.classList.contains(
                    "open"
                );


            menu.classList.toggle(
                "open"
            );


            button.setAttribute(
                "aria-expanded",
                String(
                    !isOpen
                )
            );

        }
    );


    document.addEventListener(
        "click",
        function (
            event
        ) {

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


    document
        .querySelectorAll(
            ".seller-account-menu-item"
        )
        .forEach(
            function (
                item
            ) {

                item.addEventListener(
                    "click",
                    function () {

                        menu.classList.remove(
                            "open"
                        );


                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/* ======================================================
   NOTIFICAÇÕES — MENU
====================================================== */

function initializeSellerNotifications() {

    const button =
        document.getElementById(
            "sellerNotificationButton"
        );


    const panel =
        document.getElementById(
            "sellerNotificationPanel"
        );


    if (
        !button ||
        !panel
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function (
            event
        ) {

            event.stopPropagation();


            const isOpen =
                panel.classList.contains(
                    "open"
                );


            panel.classList.toggle(
                "open"
            );


            button.setAttribute(
                "aria-expanded",
                String(
                    !isOpen
                )
            );


            if (
                !isOpen
            ) {

                renderSellerNotifications();

            }

        }
    );


    document.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                !panel.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                panel.classList.remove(
                    "open"
                );


                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    const markButton =
        document.getElementById(
            "sellerMarkNotificationsRead"
        );


    if (markButton) {

        markButton.addEventListener(
            "click",
            function () {

                markAllSellerNotificationsRead();

            }
        );

    }

}


/* ======================================================
   NAVEGAÇÃO SUAVE
====================================================== */

function initializeSellerNavigation() {

    document
        .querySelectorAll(
            '.seller-nav-link[href^="#"], .seller-account-menu-item[href^="#"]'
        )
        .forEach(
            function (
                link
            ) {

                link.addEventListener(
                    "click",
                    function (
                        event
                    ) {

                        const targetID =
                            this.getAttribute(
                                "href"
                            );


                        if (
                            !targetID ||
                            targetID === "#"
                        ) {

                            return;

                        }


                        const target =
                            document.querySelector(
                                targetID
                            );


                        if (!target) {

                            return;

                        }


                        event.preventDefault();


                        const position =
                            target
                                .getBoundingClientRect()
                                .top +
                            window.pageYOffset -
                            SELLER_HEADER_HEIGHT -
                            15;


                        window.scrollTo({

                            top:
                                position,

                            behavior:
                                "smooth"

                        });


                        closeSellerMobileMenu();

                    }
                );

            }
        );

}


/* ======================================================
   MENU LATERAL ATIVO
====================================================== */

function updateSellerActiveNavigation() {

    const sections =
        document.querySelectorAll(
            ".seller-main .seller-section[id]"
        );


    const links =
        document.querySelectorAll(
            ".seller-nav-link"
        );


    let current =
        "dashboard";


    sections.forEach(
        function (
            section
        ) {

            const top =
                section.offsetTop -
                180;


            if (
                window.scrollY >=
                top
            ) {

                current =
                    section.id;

            }

        }
    );


    links.forEach(
        function (
            link
        ) {

            link.classList.remove(
                "active"
            );


            if (
                link.getAttribute(
                    "href"
                ) ===
                "#" +
                current
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );

}


/* ======================================================
   MOBILE MENU
====================================================== */

function initializeSellerMobileMenu() {

    const button =
        document.getElementById(
            "sellerMobileMenuButton"
        );


    const sidebar =
        document.getElementById(
            "sellerSidebar"
        );


    const overlay =
        document.getElementById(
            "sellerSidebarOverlay"
        );


    if (
        !button ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            const isOpen =
                sidebar.classList.contains(
                    "open"
                );


            if (isOpen) {

                closeSellerMobileMenu();

            } else {

                sidebar.classList.add(
                    "open"
                );

                overlay.classList.add(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        }
    );


    overlay.addEventListener(
        "click",
        closeSellerMobileMenu
    );


    document
        .querySelectorAll(
            ".seller-nav-link"
        )
        .forEach(
            function (
                link
            ) {

                link.addEventListener(
                    "click",
                    closeSellerMobileMenu
                );

            }
        );

}


function closeSellerMobileMenu() {

    const sidebar =
        document.getElementById(
            "sellerSidebar"
        );


    const overlay =
        document.getElementById(
            "sellerSidebarOverlay"
        );


    const button =
        document.getElementById(
            "sellerMobileMenuButton"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "open"
        );

    }


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* ======================================================
   DATA
====================================================== */

function updateSellerDate() {

    sellerSetText(
        "sellerCurrentDate",

        new Date()
            .toLocaleDateString(
                "pt-AO",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            )
    );

}


/* ======================================================
   NOVA MERCADORIA
====================================================== */

function openSellerProductModal() {

    const modal =
        document.getElementById(
            "sellerProductModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeSellerProductModal() {

    const modal =
        document.getElementById(
            "sellerProductModal"
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

}


/* ======================================================
   BOTÕES NOVA MERCADORIA
====================================================== */

function initializeSellerProductButtons() {

    [
        "sellerAddProductButton",

        "sellerAddProductButton2"

    ]
        .forEach(
            function (
                id
            ) {

                const button =
                    document.getElementById(
                        id
                    );


                if (button) {

                    button.addEventListener(
                        "click",
                        openSellerProductModal
                    );

                }

            }
        );


    const closeButton =
        document.getElementById(
            "sellerProductModalClose"
        );


    const overlay =
        document.getElementById(
            "sellerProductModalOverlay"
        );


    const confirmButton =
        document.getElementById(
            "sellerProductModalConfirm"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeSellerProductModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSellerProductModal
        );

    }


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            function () {

                closeSellerProductModal();


                alert(
                    "O formulário de criação de mercadorias será ligado ao catálogo do AV Market."
                );

            }
        );

    }

}


/* ======================================================
   REFRESH ATIVIDADE
====================================================== */

function initializeSellerRefresh() {

    const button =
        document.getElementById(
            "sellerRefreshActivity"
        );


    if (button) {

        button.addEventListener(
            "click",
            function () {

                renderSellerActivity();

                updateSellerStatistics();

                renderSellerNotifications();

            }
        );

    }

}


/* ======================================================
   FILTROS
====================================================== */

function initializeSellerFilters() {

    const search =
        document.getElementById(
            "sellerProductSearch"
        );


    const filter =
        document.getElementById(
            "sellerProductStatusFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderSellerProducts
        );

    }


    if (filter) {

        filter.addEventListener(
            "change",
            renderSellerProducts
        );

    }

}


/* ======================================================
   NOVA MENSAGEM
====================================================== */

function initializeSellerMessages() {

    const button =
        document.getElementById(
            "sellerNewMessageButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            function () {

                alert(
                    "O sistema de mensagens será ligado ao Firebase na próxima etapa."
                );

            }
        );

    }

}


/* ======================================================
   DEFINIÇÕES
====================================================== */

function initializeSellerSettings() {

    document
        .querySelectorAll(
            ".seller-setting-card"
        )
        .forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        const setting =
                            this.dataset.setting;


                        const messages = {

                            profile:
                                "A gestão do perfil será ligada ao Firebase.",

                            security:
                                "A gestão da segurança será ligada ao Firebase.",

                            notifications:
                                "As preferências de notificações serão ligadas ao Firebase."

                        };


                        alert(
                            messages[setting] ||
                            "Definição do AV Market."
                        );

                    }
                );

            }
        );

}


/* ======================================================
   LOGOUT
====================================================== */

function sellerLogout() {

    localStorage.removeItem(
        "sellerLoggedIn"
    );


    localStorage.removeItem(
        "sellerName"
    );


    localStorage.removeItem(
        "sellerEmail"
    );


    localStorage.removeItem(
        "userName"
    );


    localStorage.removeItem(
        "userType"
    );


    localStorage.removeItem(
        "accountType"
    );


    try {

        if (
            typeof Auth !== "undefined" &&
            typeof Auth.logout === "function"
        ) {

            Auth.logout();

        }

    } catch (error) {

        console.warn(
            "Logout Firebase será integrado:",
            error
        );

    }


    window.location.href =
        "../../index.html";

}


function initializeSellerLogout() {

    const buttons = [

        "sellerLogoutButton",

        "sellerSidebarLogout"

    ];


    buttons.forEach(
        function (
            id
        ) {

            const button =
                document.getElementById(
                    id
                );


            if (button) {

                button.addEventListener(
                    "click",
                    sellerLogout
                );

            }

        }
    );

}


/* ======================================================
   STORAGE
   COMUNICAÇÃO COM ADMIN
====================================================== */

window.addEventListener(
    "storage",
    function (
        event
    ) {

        if (
            event.key ===
            SELLER_PRODUCTS_KEY
        ) {

            renderSellerProducts();

            updateSellerStatistics();

            renderSellerNotifications();

        }


        if (
            event.key ===
            SELLER_MESSAGES_KEY
        ) {

            renderSellerMessages();

            renderSellerNotifications();

            updateSellerMessageCounters();

        }

    }
);


/* ======================================================
   ESC
====================================================== */

document.addEventListener(
    "keydown",
    function (
        event
    ) {

        if (
            event.key ===
            "Escape"
        ) {

            closeSellerProductModal();

            closeSellerMobileMenu();

        }

    }
);


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

async function initializeSellerPanel() {

    const authorized =
        await verifySellerAccess();


    if (!authorized) {

        return;

    }


    loadSellerProfile();

    updateSellerDate();

    renderSellerActivity();

    renderSellerProducts();

    renderSellerMessages();

    renderSellerNotifications();

    updateSellerMessageCounters();

    updateSellerNotificationBadge();

    updateSellerStatistics();

    initializeSellerAccountMenu();

    initializeSellerNotifications();

    initializeSellerNavigation();

    initializeSellerMobileMenu();

    initializeSellerProductButtons();

    initializeSellerRefresh();

    initializeSellerFilters();

    initializeSellerMessages();

    initializeSellerSettings();

    initializeSellerLogout();

    updateSellerActiveNavigation();

}


/* ======================================================
   SCROLL
====================================================== */

window.addEventListener(
    "scroll",
    updateSellerActiveNavigation
);


/* ======================================================
   EXECUTAR
====================================================== */

initializeSellerPanel();

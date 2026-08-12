/*======================================================
AV MARKET
SISTEMA INTELIGENTE DE PEDIDOS
SUPABASE AUTH + AUTH CENTRAL
======================================================*/

"use strict";


/*======================================================
AUTENTICAÇÃO CENTRAL
======================================================*/

import {
    supabase,
    ROLES,
    getUserProfile,
    normalizeRole
} from "./auth.js";


/*======================================================
ELEMENTOS
======================================================*/

const ordersList =
    document.getElementById("ordersList");

const emptyOrders =
    document.getElementById("emptyOrders");

const ordersCount =
    document.getElementById("ordersCount");

const summaryTotal =
    document.getElementById("summaryTotal");

const summaryPending =
    document.getElementById("summaryPending");

const summaryShipping =
    document.getElementById("summaryShipping");

const summaryDelivered =
    document.getElementById("summaryDelivered");

const filterButtons =
    document.querySelectorAll(".order-filter");


/*======================================================
CONFIGURAÇÃO
======================================================*/

const LOGIN_PAGE =
    "login.html";

const ORDERS_PREFIX =
    "avMarketOrders_";


/*======================================================
ESTADO
======================================================*/

let currentUser = null;

let currentProfile = null;

let currentAccountType = null;

let orders = [];

let currentFilter = "todos";


/*======================================================
OBTER UTILIZADOR AUTENTICADO
======================================================*/

async function getAuthenticatedUserData() {

    try {

        const {
            data,
            error
        } =
            await supabase.auth.getSession();


        if (error) {

            console.error(
                "AV Market — erro ao verificar sessão:",
                error
            );

            return null;

        }


        const session =
            data?.session;


        if (
            !session ||
            !session.user
        ) {

            currentUser = null;
            currentProfile = null;
            currentAccountType = null;

            return null;

        }


        const user =
            session.user;


        currentUser =
            user;


        try {

            const profile =
                await getUserProfile(
                    user.id
                );


            currentProfile =
                profile || null;


            if (profile) {

                currentAccountType =
                    normalizeRole(
                        profile
                    );

            }

            else {

                currentAccountType =
                    "";

            }

        }

        catch (profileError) {

            console.error(
                "AV Market — erro ao carregar perfil:",
                profileError
            );

            currentProfile = null;

            currentAccountType = "";

        }


        return {

            user,

            profile:
                currentProfile,

            role:
                currentAccountType

        };

    }

    catch (error) {

        console.error(
            "AV Market — erro interno de autenticação:",
            error
        );

        return null;

    }

}


/*======================================================
NORMALIZAR TIPO DE CONTA
======================================================*/

function normalizeAccountType(
    type
) {

    const normalized =
        String(
            type || ""
        )
        .toLowerCase()
        .trim();


    if (
        normalized === "vendedor" ||
        normalized === "revendedor" ||
        normalized === "seller" ||
        normalized === "vendor"
    ) {

        return "vendedor";

    }


    if (
        normalized === "admin" ||
        normalized === "administrador"
    ) {

        return "administrador";

    }


    if (
        normalized === "comprador" ||
        normalized === "buyer" ||
        normalized === "cliente"
    ) {

        return "comprador";

    }


    return normalized || "comprador";

}


/*======================================================
CHAVE DOS PEDIDOS
UTILIZADOR + TIPO DE CONTA
======================================================*/

function getOrdersKey(
    uid,
    accountType
) {

    if (!uid) {

        return null;

    }


    const type =
        normalizeAccountType(
            accountType
        );


    return (
        ORDERS_PREFIX +
        type +
        "_" +
        String(uid)
    );

}


/*======================================================
OBTER PEDIDOS DO UTILIZADOR
======================================================*/

function getUserOrders() {

    if (!currentUser) {

        return [];

    }


    const key =
        getOrdersKey(
            currentUser.id,
            currentAccountType
        );


    if (!key) {

        return [];

    }


    try {

        const saved =
            localStorage.getItem(
                key
            );


        if (!saved) {

            return [];

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (!Array.isArray(parsed)) {

            return [];

        }


        return parsed.filter(
            order => {

                if (!order) {

                    return false;

                }


                if (
                    order.uid &&
                    String(
                        order.uid
                    ) !==
                    String(
                        currentUser.id
                    )
                ) {

                    return false;

                }


                if (
                    order.userId &&
                    String(
                        order.userId
                    ) !==
                    String(
                        currentUser.id
                    )
                ) {

                    return false;

                }


                if (
                    order.accountType
                ) {

                    const orderType =
                        normalizeAccountType(
                            order.accountType
                        );


                    if (
                        orderType !==
                        normalizeAccountType(
                            currentAccountType
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );

    }

    catch (error) {

        console.error(
            "AV Market: erro ao carregar pedidos:",
            error
        );

        return [];

    }

}


/*======================================================
GUARDAR PEDIDOS
======================================================*/

function saveUserOrders() {

    if (!currentUser) {

        return;

    }


    const key =
        getOrdersKey(
            currentUser.id,
            currentAccountType
        );


    if (!key) {

        return;

    }


    try {

        localStorage.setItem(
            key,
            JSON.stringify(
                orders
            )
        );

    }

    catch (error) {

        console.error(
            "AV Market: erro ao guardar pedidos:",
            error
        );

    }

}


/*======================================================
FORMATAÇÃO DE PREÇO
======================================================*/

function formatPrice(
    value
) {

    return new Intl.NumberFormat(
        "pt-AO",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    ) + " Kz";

}


/*======================================================
FORMATAÇÃO DE DATA
======================================================*/

function formatDate(
    date
) {

    return new Date(
        date
    ).toLocaleDateString(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/*======================================================
STATUS
======================================================*/

function statusName(
    status
) {

    const names = {

        pendente:
            "Pagamento pendente",

        processando:
            "Em preparação",

        enviado:
            "Enviado",

        entregue:
            "Entregue",

        cancelado:
            "Cancelado"

    };


    return (
        names[status] ||
        "Pendente"
    );

}


/*======================================================
ÍCONES
======================================================*/

function statusIcon(
    status
) {

    const icons = {

        pendente:
            "fa-clock",

        processando:
            "fa-box",

        enviado:
            "fa-truck",

        entregue:
            "fa-circle-check",

        cancelado:
            "fa-circle-xmark"

    };


    return (
        icons[status] ||
        "fa-clock"
    );

}


/*======================================================
RESUMO
======================================================*/

function updateSummary() {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                order.status ===
                "pendente"
        ).length;


    const shipping =
        orders.filter(
            order =>
                order.status ===
                "enviado"
        ).length;


    const delivered =
        orders.filter(
            order =>
                order.status ===
                "entregue"
        ).length;


    if (summaryTotal) {

        summaryTotal.textContent =
            total;

    }


    if (summaryPending) {

        summaryPending.textContent =
            pending;

    }


    if (summaryShipping) {

        summaryShipping.textContent =
            shipping;

    }


    if (summaryDelivered) {

        summaryDelivered.textContent =
            delivered;

    }

}


/*======================================================
RENDERIZAR
======================================================*/

function renderOrders(
    filter = "todos"
) {

    currentFilter =
        filter;


    if (!ordersList) {

        return;

    }


    ordersList.innerHTML =
        "";


    const filtered =
        filter === "todos"
            ? orders
            : orders.filter(
                order =>
                    order.status ===
                    filter
            );


    if (ordersCount) {

        ordersCount.textContent =
            filtered.length === 1
                ? "1 pedido"
                : `${filtered.length} pedidos`;

    }


    if (filtered.length === 0) {

        if (emptyOrders) {

            emptyOrders.classList.add(
                "show"
            );

        }

        return;

    }


    if (emptyOrders) {

        emptyOrders.classList.remove(
            "show"
        );

    }


    filtered.forEach(
        order => {

            ordersList.appendChild(
                createOrderCard(
                    order
                )
            );

        }
    );

}


/*======================================================
CRIAR CARD
======================================================*/

function createOrderCard(
    order
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "order-card";


    const status =
        order.status ||
        "pendente";


    const products =
        Array.isArray(
            order.products
        )
            ? order.products
            : [];


    const itemCount =
        products.reduce(
            (
                total,
                product
            ) => {

                return (
                    total +
                    Number(
                        product.quantity ||
                        product.quantidade ||
                        1
                    )
                );

            },
            0
        );


    const productsHTML =
        products.length
            ?
            products.map(
                product => `

                    <div class="order-product">

                        <div class="order-product-image">

                            <img
                                src="${
                                    product.image ||
                                    product.imagem ||
                                    "../images/login.jpg"
                                }"
                                alt="${
                                    product.name ||
                                    product.nome ||
                                    "Produto"
                                }"
                            >

                        </div>


                        <div class="order-product-info">

                            <h4>
                                ${
                                    product.name ||
                                    product.nome ||
                                    "Produto"
                                }
                            </h4>

                            <span>
                                Quantidade:
                                ${
                                    product.quantity ||
                                    product.quantidade ||
                                    1
                                }
                            </span>

                        </div>

                    </div>

                `
            ).join("")
            :
            `

                <div class="order-product">

                    <div class="order-product-image">

                        <i
                            class="fa-solid fa-box"
                            style="
                                width:100%;
                                height:100%;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                color:#C79A3B;
                            "
                        ></i>

                    </div>


                    <div class="order-product-info">

                        <h4>
                            Pedido AV Market
                        </h4>

                        <span>
                            ${itemCount || 1}
                            item(s)
                        </span>

                    </div>

                </div>

            `;


    card.innerHTML = `

        <div class="order-card-header">

            <div>

                <div class="order-number">

                    <i class="fa-solid fa-receipt"></i>

                    Pedido #${
                        order.id ||
                        "AV0001"
                    }

                </div>


                <div class="order-date">

                    ${
                        formatDate(
                            order.date ||
                            order.createdAt ||
                            Date.now()
                        )
                    }

                </div>

            </div>


            <div
                class="order-status status-${status}"
            >

                <i
                    class="fa-solid ${
                        statusIcon(
                            status
                        )
                    }"
                ></i>

                ${
                    statusName(
                        status
                    )
                }

            </div>

        </div>


        <div class="order-card-body">

            <div class="order-products">

                ${productsHTML}

            </div>


            <div class="order-total">

                <span class="order-total-label">
                    Total da compra
                </span>


                <strong class="order-total-value">

                    ${
                        formatPrice(
                            Number(
                                order.total ||
                                0
                            )
                        )
                    }

                </strong>


                <span class="order-total-items">

                    ${
                        itemCount || 1
                    }
                    item(s)

                </span>

            </div>

        </div>


        <div class="order-card-footer">

            <div class="order-delivery">

                <i class="fa-solid fa-location-dot"></i>

                ${
                    order.delivery ||
                    order.deliveryLocation ||
                    "Entrega ao domicílio"
                }

            </div>


            <div class="order-actions">

                <button
                    type="button"
                    class="order-button order-button-secondary"
                    data-action="details"
                    data-order="${
                        order.id || ""
                    }"
                >

                    <i class="fa-solid fa-eye"></i>

                    Ver pedido

                </button>


                ${
                    status === "enviado"
                        ?
                        `

                            <button
                                type="button"
                                class="order-button order-button-primary"
                                data-action="track"
                                data-order="${
                                    order.id || ""
                                }"
                            >

                                <i class="fa-solid fa-location-crosshairs"></i>

                                Acompanhar

                            </button>

                        `
                        :
                        ""
                }

            </div>

        </div>

    `;


    return card;

}


/*======================================================
FILTROS
======================================================*/

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                renderOrders(
                    this.dataset.filter ||
                    "todos"
                );

            }
        );

    }
);


/*======================================================
AÇÕES
======================================================*/

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {

            return;

        }


        const orderId =
            button.dataset.order;


        const action =
            button.dataset.action;


        const order =
            orders.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        orderId
                    )
            );


        if (!order) {

            return;

        }


        if (action === "details") {

            alert(
                "Detalhes do pedido #" +
                orderId
            );

        }


        if (action === "track") {

            alert(
                "Acompanhamento do pedido #" +
                orderId
            );

        }

    }
);


/*======================================================
UTILIZADOR AUTENTICADO
======================================================*/

async function handleAuthenticatedUser(
    accountData
) {

    currentUser =
        accountData.user;


    currentProfile =
        accountData.profile;


    currentAccountType =
        accountData.role;


    orders =
        getUserOrders();


    updateSummary();


    renderOrders(
        currentFilter
    );


    console.log(
        "AV Market — pedidos carregados."
    );


    console.log(
        "UID:",
        currentUser.id
    );


    console.log(
        "Tipo de conta:",
        currentAccountType
    );


    console.log(
        "Chave:",
        getOrdersKey(
            currentUser.id,
            currentAccountType
        )
    );

}


/*======================================================
UTILIZADOR NÃO AUTENTICADO
======================================================*/

function handleUnauthenticatedUser() {

    currentUser =
        null;

    currentProfile =
        null;

    currentAccountType =
        null;

    orders =
        [];


    updateSummary();

    renderOrders(
        "todos"
    );


    window.location.href =
        LOGIN_PAGE;

}


/*======================================================
SUPABASE AUTH
======================================================*/

supabase.auth.onAuthStateChange(
    async function(
        event,
        session
    ) {

        console.log(
            "AV Market — estado da autenticação:",
            event
        );


        if (
            event ===
            "SIGNED_OUT"
        ) {

            handleUnauthenticatedUser();

            return;

        }


        if (
            session?.user
        ) {

            const accountData =
                await getAuthenticatedUserData();


            if (accountData) {

                await handleAuthenticatedUser(
                    accountData
                );

            }

        }

    }
);


/*======================================================
ATUALIZAÇÃO AUTOMÁTICA
======================================================*/

window.addEventListener(
    "storage",
    function(event) {

        if (!currentUser) {

            return;

        }


        const userOrdersKey =
            getOrdersKey(
                currentUser.id,
                currentAccountType
            );


        if (
            event.key ===
            userOrdersKey
        ) {

            orders =
                getUserOrders();


            updateSummary();


            renderOrders(
                currentFilter
            );

        }

    }
);


/*======================================================
EVENTO DE ALTERAÇÃO DA CONTA
======================================================*/

window.addEventListener(
    "avMarketUserChanged",
    async function() {

        const accountData =
            await getAuthenticatedUserData();


        if (!accountData) {

            handleUnauthenticatedUser();

            return;

        }


        await handleAuthenticatedUser(
            accountData
        );

    }
);


/*======================================================
API GLOBAL
======================================================*/

window.AVOrders = {

    get: function() {

        return [
            ...orders
        ];

    },


    save: function(
        newOrders
    ) {

        if (!currentUser) {

            console.warn(
                "AV Market: utilizador não autenticado."
            );

            return;

        }


        orders =
            Array.isArray(
                newOrders
            )
                ? newOrders.map(
                    order => ({

                        ...order,

                        userId:
                            currentUser.id,

                        uid:
                            currentUser.id,

                        accountType:
                            currentAccountType

                    })
                )
                : [];


        saveUserOrders();

        updateSummary();

        renderOrders(
            currentFilter
        );

    },


    add: function(
        order
    ) {

        if (!currentUser) {

            console.warn(
                "AV Market: utilizador não autenticado."
            );

            return null;

        }


        if (
            !order ||
            typeof order !==
            "object"
        ) {

            return null;

        }


        const newOrder = {

            ...order,

            userId:
                currentUser.id,

            uid:
                currentUser.id,

            accountType:
                currentAccountType,

            date:
                order.date ||
                Date.now()

        };


        orders.push(
            newOrder
        );


        saveUserOrders();

        updateSummary();

        renderOrders(
            currentFilter
        );


        return newOrder;

    },


    getCurrentUser:
        function() {

            return currentUser;

        },


    getProfile:
        function() {

            return currentProfile;

        },


    getAccountType:
        function() {

            return currentAccountType;

        },


    getStorageKey:
        function() {

            if (!currentUser) {

                return null;

            }


            return getOrdersKey(
                currentUser.id,
                currentAccountType
            );

        }

    }

};


/*======================================================
INICIALIZAÇÃO
======================================================*/

async function initializeOrders() {

    console.log(
        "AV Market — inicializando sistema de pedidos..."
    );


    const accountData =
        await getAuthenticatedUserData();


    if (!accountData) {

        handleUnauthenticatedUser();

        return;

    }


    await handleAuthenticatedUser(
        accountData
    );


    console.log(
        "AV Market — Sistema inteligente de pedidos carregado."
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeOrders
    );

}

else {

    initializeOrders();

}


/*======================================================
FIM — ORDERS.JS
======================================================*/

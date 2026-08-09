/*======================================================
AV MARKET — SISTEMA INTELIGENTE DE PEDIDOS
CONTROLO POR UTILIZADOR / TIPO DE CONTA / FIREBASE AUTH
======================================================*/
"use strict";
/*======================================================
FIREBASE
======================================================*/
import {
    auth
} from "./firebase-config.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
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
let currentAccountType = null;
let orders = [];
let currentFilter = "todos";
/*======================================================
OBTER TIPO DE CONTA
======================================================*/
/*
    O tipo de conta pode estar guardado
    no perfil do utilizador através de
    diferentes nomes.
    O sistema aceita:
    comprador
    vendedor
    revendedor
    buyer
    seller
    vendor
*/
function getAccountType(){
    if(!currentUser){
        return "comprador";
    }
    const possibleValues = [
        currentUser.accountType,
        currentUser.account_type,
        currentUser.tipoConta,
        currentUser.tipo_conta,
        currentUser.userType,
        currentUser.user_type,
        currentUser.role,
        currentUser.type
    ];
    for(
        const value
        of possibleValues
    ){
        if(!value){
            continue;
        }
        const normalized =
            String(
                value
            )
            .toLowerCase()
            .trim();
        if(
            normalized === "vendedor" ||
            normalized === "revendedor" ||
            normalized === "seller" ||
            normalized === "vendor" ||
            normalized === "vendedor/revendedor"
        ){
            return "vendedor";
        }
        if(
            normalized === "comprador" ||
            normalized === "buyer" ||
            normalized === "cliente"
        ){
            return "comprador";
        }
    }
    /*
        Se o sistema de login ainda não
        tiver o tipo de conta no objeto
        do Firebase, assumimos comprador
        como comportamento padrão.
    */
    return "comprador";
}
/*======================================================
NORMALIZAR TIPO DE CONTA
======================================================*/
function normalizeAccountType(
    type
){
    const normalized =
        String(
            type || ""
        )
        .toLowerCase()
        .trim();
    if(
        normalized === "vendedor" ||
        normalized === "revendedor" ||
        normalized === "seller" ||
        normalized === "vendor"
    ){
        return "vendedor";
    }
    return "comprador";
}
/*======================================================
CHAVE DOS PEDIDOS
======================================================*/
/*
    ANTES:
    avMarketOrders_UID
    AGORA:
    avMarketOrders_comprador_UID
    ou
    avMarketOrders_vendedor_UID
    Desta forma o sistema separa:
    UTILIZADOR
    +
    TIPO DE CONTA
*/
function getOrdersKey(
    uid,
    accountType
){
    if(!uid){
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
function getUserOrders(){
    if(!currentUser){
        return [];
    }
    const key =
        getOrdersKey(
            currentUser.uid,
            currentAccountType
        );
    if(!key){
        return [];
    }
    try{
        const saved =
            localStorage.getItem(
                key
            );
        if(!saved){
            return [];
        }
        const parsed =
            JSON.parse(
                saved
            );
        if(!Array.isArray(parsed)){
            return [];
        }
        /*
            Segurança adicional:
            Mesmo que existam dados antigos
            ou dados colocados manualmente
            no localStorage, mostramos apenas
            pedidos pertencentes ao utilizador
            e ao tipo de conta atual.
        */
        return parsed.filter(
            order => {
                if(!order){
                    return false;
                }
                if(
                    order.uid &&
                    String(
                        order.uid
                    ) !==
                    String(
                        currentUser.uid
                    )
                ){
                    return false;
                }
                if(
                    order.userId &&
                    String(
                        order.userId
                    ) !==
                    String(
                        currentUser.uid
                    )
                ){
                    return false;
                }
                if(
                    order.accountType
                ){
                    const orderType =
                        normalizeAccountType(
                            order.accountType
                        );
                    if(
                        orderType !==
                        currentAccountType
                    ){
                        return false;
                    }
                }
                return true;
            }
        );
    }
    catch(error){
        console.error(
            "AV Market: erro ao carregar pedidos do utilizador.",
            error
        );
        return [];
    }
}
/*======================================================
GUARDAR PEDIDOS DO UTILIZADOR
======================================================*/
function saveUserOrders(){
    if(!currentUser){
        return;
    }
    const key =
        getOrdersKey(
            currentUser.uid,
            currentAccountType
        );
    if(!key){
        return;
    }
    try{
        localStorage.setItem(
            key,
            JSON.stringify(
                orders
            )
        );
    }
    catch(error){
        console.error(
            "AV Market: erro ao guardar pedidos.",
            error
        );
    }
}
/*======================================================
FORMATAÇÃO DE PREÇO
======================================================*/
function formatPrice(
    value
){
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
){
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
){
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
ÍCONES DOS STATUS
======================================================*/
function statusIcon(
    status
){
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
function updateSummary(){
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
    if(summaryTotal){
        summaryTotal.textContent =
            total;
    }
    if(summaryPending){
        summaryPending.textContent =
            pending;
    }
    if(summaryShipping){
        summaryShipping.textContent =
            shipping;
    }
    if(summaryDelivered){
        summaryDelivered.textContent =
            delivered;
    }
}
/*======================================================
RENDERIZAR PEDIDOS
======================================================*/
function renderOrders(
    filter = "todos"
){
    currentFilter =
        filter;
    if(!ordersList){
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
    if(ordersCount){
        ordersCount.textContent =
            filtered.length === 1
                ? "1 pedido"
                : `${filtered.length} pedidos`;
    }
    if(filtered.length === 0){
        if(emptyOrders){
            emptyOrders.classList.add(
                "show"
            );
        }
        return;
    }
    if(emptyOrders){
        emptyOrders.classList.remove(
            "show"
        );
    }
    filtered.forEach(
        order => {
            const card =
                createOrderCard(
                    order
                );
            ordersList.appendChild(
                card
            );
        }
    );
}
/*======================================================
CRIAR CARD DO PEDIDO
======================================================*/
function createOrderCard(
    order
){
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
            function(){
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
AÇÕES DOS PEDIDOS
======================================================*/
document.addEventListener(
    "click",
    function(event){
        const button =
            event.target.closest(
                "[data-action]"
            );
        if(!button){
            return;
        }
        const orderId =
            button.dataset.order;
        const action =
            button.dataset.action;
        /*
            O pedido é procurado apenas
            dentro da lista já filtrada
            para o utilizador atual.
            Portanto, um utilizador nunca
            consegue abrir um pedido de
            outro utilizador através deste
            sistema.
        */
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
        if(!order){
            return;
        }
        if(action === "details"){
            alert(
                "Detalhes do pedido #" +
                orderId
            );
        }
        if(action === "track"){
            alert(
                "Acompanhamento do pedido #" +
                orderId
            );
        }
    }
);
/*======================================================
VERIFICAR UTILIZADOR AUTENTICADO
======================================================*/
function handleAuthenticatedUser(
    user
){
    currentUser =
        user;
    /*
        IMPORTANTE:
        Primeiro identificamos a conta.
        Depois carregamos apenas os pedidos
        dessa combinação:
        TIPO DE CONTA + UID
    */
    currentAccountType =
        getAccountType();
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
        currentUser.uid
    );
    console.log(
        "Tipo de conta:",
        currentAccountType
    );
    console.log(
        "Chave:",
        getOrdersKey(
            currentUser.uid,
            currentAccountType
        )
    );
}
/*======================================================
UTILIZADOR NÃO AUTENTICADO
======================================================*/
function handleUnauthenticatedUser(){
    currentUser =
        null;
    currentAccountType =
        null;
    orders =
        [];
    updateSummary();
    renderOrders(
        "todos"
    );
    /*
        Página de pedidos exige login.
    */
    window.location.href =
        LOGIN_PAGE;
}
/*======================================================
FIREBASE AUTH
======================================================*/
onAuthStateChanged(
    auth,
    function(user){
        if(!user){
            handleUnauthenticatedUser();
            return;
        }
        handleAuthenticatedUser(
            user
        );
    }
);
/*======================================================
ATUALIZAÇÃO AUTOMÁTICA
======================================================*/
window.addEventListener(
    "storage",
    function(event){
        if(!currentUser){
            return;
        }
        const userOrdersKey =
            getOrdersKey(
                currentUser.uid,
                currentAccountType
            );
        if(
            event.key ===
            userOrdersKey
        ){
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
    function(){
        if(!currentUser){
            return;
        }
        currentAccountType =
            getAccountType();
        orders =
            getUserOrders();
        updateSummary();
        renderOrders(
            currentFilter
        );
    }
);
/*======================================================
API GLOBAL
======================================================*/
window.AVOrders = {
    get: function(){
        return [
            ...orders
        ];
    },
    save: function(
        newOrders
    ){
        if(!currentUser){
            console.warn(
                "AV Market: não é possível guardar pedidos sem utilizador autenticado."
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
                            currentUser.uid,
                        uid:
                            currentUser.uid,
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
    ){
        if(!currentUser){
            console.warn(
                "AV Market: utilizador não autenticado."
            );
            return null;
        }
        if(
            !order ||
            typeof order !==
            "object"
        ){
            return null;
        }
        const newOrder = {
            ...order,
            userId:
                currentUser.uid,
            uid:
                currentUser.uid,
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
    getCurrentUser: function(){
        return currentUser;
    },
    getAccountType: function(){
        return currentAccountType;
    },
    getStorageKey: function(){
        if(!currentUser){
            return null;
        }
        return getOrdersKey(
            currentUser.uid,
            currentAccountType
        );
    }
};
/*======================================================
INICIALIZAÇÃO
======================================================*/
document.addEventListener(
    "DOMContentLoaded",
    function(){
        console.log(
            "AV Market — Sistema inteligente de pedidos carregado."
        );
    }
);

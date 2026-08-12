/* ======================================================
   AV MARKET — SISTEMA PROFISSIONAL DO CARRINHO
   SUPABASE AUTH + AUTH CENTRAL
====================================================== */

"use strict";


/* ======================================================
   AUTENTICAÇÃO CENTRAL
====================================================== */

import {
    supabase,
    getUserProfile,
    normalizeRole
} from "./auth.js";


/* ======================================================
   ELEMENTOS
====================================================== */

const cartItemsContainer =
    document.getElementById("cartItems");

const emptyCart =
    document.getElementById("emptyCart");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const deliveryFee =
    document.getElementById("deliveryFee");

const deliveryLocation =
    document.getElementById("deliveryLocation");

const deliveryMessage =
    document.getElementById("deliveryMessage");

const cartItemCount =
    document.getElementById("cartItemCount");

const clearCartButton =
    document.getElementById("clearCartButton");


/* ======================================================
   AUTENTICAÇÃO — UTILIZADOR ATUAL
====================================================== */

let authenticatedUser = null;

let authenticatedProfile = null;

let authenticatedRole = null;


/* ======================================================
   OBTER SESSÃO REAL DO SUPABASE
====================================================== */

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

            authenticatedUser = null;
            authenticatedProfile = null;
            authenticatedRole = null;

            return null;

        }


        const user =
            session.user;


        authenticatedUser =
            user;


        try {

            const profile =
                await getUserProfile(
                    user.id
                );


            authenticatedProfile =
                profile || null;


            authenticatedRole =
                profile
                    ? normalizeRole(profile)
                    : null;

        }

        catch (profileError) {

            console.error(
                "AV Market — erro ao obter perfil:",
                profileError
            );

            authenticatedProfile =
                null;

            authenticatedRole =
                null;

        }


        return {

            user,
            profile:
                authenticatedProfile,
            role:
                authenticatedRole

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


/* ======================================================
   CHAVE DO CARRINHO
   UTILIZADOR + CONTA
====================================================== */

function getCartKey() {

    if (
        !authenticatedUser
    ) {

        return null;

    }


    const uid =
        authenticatedUser.id;


    const role =
        String(
            authenticatedRole ||
            "comprador"
        )
        .toLowerCase()
        .trim();


    return (
        "avMarketCart_" +
        role +
        "_" +
        uid
    );

}


/* ======================================================
   TABELA DE ENTREGA
   REFERÊNCIA: MORRO BENTO / CAPOLO 2
====================================================== */

const DELIVERY_ZONES = {

    "morro-bento": {
        name: "Morro Bento",
        fee: 1500
    },

    "capolo-2": {
        name: "Capolo 2",
        fee: 1500
    },

    "talatona": {
        name: "Talatona",
        fee: 1800
    },

    "benfica": {
        name: "Benfica",
        fee: 2200
    },

    "nova-vida": {
        name: "Nova Vida",
        fee: 2500
    },

    "kilamba": {
        name: "Kilamba",
        fee: 3000
    },

    "maianga": {
        name: "Maianga",
        fee: 3000
    },

    "alvalade": {
        name: "Alvalade",
        fee: 3000
    },

    "maculusso": {
        name: "Maculusso",
        fee: 3000
    },

    "bairro-operario": {
        name: "Bairro Operário",
        fee: 3200
    },

    "marcal": {
        name: "Marçal",
        fee: 3200
    },

    "sambizanga": {
        name: "Sambizanga",
        fee: 3500
    },

    "ngola-kiluanje": {
        name: "Ngola Kiluanje",
        fee: 3500
    },

    "palanca": {
        name: "Palanca",
        fee: 3200
    },

    "grafanil": {
        name: "Grafanil",
        fee: 3800
    },

    "ingombota": {
        name: "Ingombota",
        fee: 3500
    },

    "mutamba": {
        name: "Mutamba",
        fee: 3800
    },

    "baixa-de-luanda": {
        name: "Baixa de Luanda",
        fee: 3800
    },

    "ilha-de-luanda": {
        name: "Ilha de Luanda",
        fee: 4000
    },

    "morro-da-luz": {
        name: "Morro da Luz",
        fee: 3500
    },

    "kinaxixi": {
        name: "Kinaxixi",
        fee: 3500
    },

    "camama": {
        name: "Camama",
        fee: 3500
    },

    "futungo": {
        name: "Futungo",
        fee: 3800
    },

    "benfica-sul": {
        name: "Benfica Sul",
        fee: 2800
    },

    "patriota": {
        name: "Patriota",
        fee: 3500
    },

    "lar-do-patriota": {
        name: "Lar do Patriota",
        fee: 3500
    },

    "via-expressa": {
        name: "Via Expressa",
        fee: 4000
    },

    "viana": {
        name: "Viana",
        fee: 4500
    },

    "estacio": {
        name: "Estalagem",
        fee: 5000
    },

    "kikuxi": {
        name: "Kikuxi",
        fee: 5200
    },

    "zango-0": {
        name: "Zango 0",
        fee: 5200
    },

    "zango-1": {
        name: "Zango 1",
        fee: 5500
    },

    "zango-2": {
        name: "Zango 2",
        fee: 5800
    },

    "zango-3": {
        name: "Zango 3",
        fee: 6000
    },

    "zango-4": {
        name: "Zango 4",
        fee: 6500
    },

    "zango-5": {
        name: "Zango 5",
        fee: 7000
    },

    "sequele": {
        name: "Sequele",
        fee: 6500
    },

    "cacuaco": {
        name: "Cacuaco",
        fee: 7000
    },

    "mulenvos": {
        name: "Mulenvos",
        fee: 7500
    },

    "funda": {
        name: "Funda",
        fee: 7500
    },

    "calumbo": {
        name: "Calumbo",
        fee: 8000
    },

    "catete": {
        name: "Catete",
        fee: 9000
    },

    "musseque": {
        name: "Outra localidade",
        fee: 0
    }

};


/* ======================================================
   ESTADO
====================================================== */

let deliveryCost = 0;


/* ======================================================
   FORMATAR KWANZA
====================================================== */

function formatKz(value) {

    return new Intl.NumberFormat(
        "pt-AO"
    ).format(value) + " Kz";

}


/* ======================================================
   OBTER CARRINHO
====================================================== */

function getCart() {

    try {

        const key =
            getCartKey();


        /*
         * Sem sessão real:
         * não utilizar carrinho de outra conta.
         */

        if (!key) {

            return [];

        }


        const savedCart =
            localStorage.getItem(
                key
            );


        if (!savedCart) {

            return [];

        }


        const parsed =
            JSON.parse(
                savedCart
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch (error) {

        console.error(
            "Erro ao carregar carrinho:",
            error
        );

        return [];

    }

}


/* ======================================================
   GUARDAR CARRINHO
====================================================== */

function saveCart(cart) {

    const key =
        getCartKey();


    if (!key) {

        console.warn(
            "AV Market — carrinho não guardado: utilizador não autenticado."
        );

        return;

    }


    localStorage.setItem(
        key,
        JSON.stringify(cart)
    );

}


/* ======================================================
   PREÇO
====================================================== */

function getProductPrice(product) {

    return Number(

        product.price ??
        product.preco ??
        product.valor ??
        0

    );

}


/* ======================================================
   QUANTIDADE
====================================================== */

function getProductQuantity(product) {

    const quantity =
        Number(
            product.quantity ??
            product.quantidade ??
            1
        );

    return quantity > 0
        ? quantity
        : 1;

}


/* ======================================================
   SUBTOTAL
====================================================== */

function calculateSubtotal(cart) {

    return cart.reduce(
        function(total, product) {

            return total +
                (
                    getProductPrice(product) *
                    getProductQuantity(product)
                );

        },
        0
    );

}


/* ======================================================
   TOTAIS
====================================================== */

function updateTotals() {

    const cart =
        getCart();

    const subtotal =
        calculateSubtotal(cart);

    const total =
        subtotal + deliveryCost;


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatKz(subtotal);

    }


    if (deliveryFee) {

        deliveryFee.textContent =
            deliveryCost > 0
                ? formatKz(deliveryCost)
                : "0 Kz";

    }


    if (cartTotal) {

        cartTotal.textContent =
            formatKz(total);

    }

}


/* ======================================================
   CONTADOR
====================================================== */

function updateItemCount(cart) {

    const totalItems =
        cart.reduce(
            function(total, product) {

                return total +
                    getProductQuantity(product);

            },
            0
        );


    if (cartItemCount) {

        cartItemCount.textContent =
            totalItems === 1
                ? "1 produto"
                : totalItems + " produtos";

    }

}


/* ======================================================
   IMAGEM
====================================================== */

function getProductImage(product) {

    return (
        product.image ||
        product.imagem ||
        product.foto ||
        "../images/product-placeholder.jpg"
    );

}


/* ======================================================
   NOME
====================================================== */

function getProductName(product) {

    return (
        product.name ||
        product.nome ||
        product.title ||
        product.titulo ||
        "Produto"
    );

}


/* ======================================================
   RENDERIZAR
====================================================== */

function renderCart() {

    const cart =
        getCart();


    if (!cart.length) {

        if (cartItemsContainer) {

            cartItemsContainer.innerHTML =
                "";

        }

        if (emptyCart) {

            emptyCart.hidden =
                false;

        }

        if (clearCartButton) {

            clearCartButton.style.display =
                "none";

        }

        deliveryCost = 0;

        updateItemCount(cart);

        updateTotals();

        return;

    }


    if (emptyCart) {

        emptyCart.hidden =
            true;

    }


    if (clearCartButton) {

        clearCartButton.style.display =
            "block";

    }


    if (!cartItemsContainer) {

        return;

    }


    cartItemsContainer.innerHTML =
        "";


    cart.forEach(
        function(product, index) {

            const price =
                getProductPrice(product);

            const quantity =
                getProductQuantity(product);

            const itemTotal =
                price * quantity;


            const item =
                document.createElement("article");


            item.className =
                "cart-item";


            item.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${getProductImage(product)}"
                        alt="${getProductName(product)}"
                        onerror="this.src='../images/product-placeholder.jpg'"
                    >

                </div>


                <div class="cart-item-info">

                    <h3>
                        ${getProductName(product)}
                    </h3>

                    <p>
                        Produto AV Market
                    </p>

                    <div class="cart-item-price">
                        ${formatKz(itemTotal)}
                    </div>

                </div>


                <div class="cart-item-actions">

                    <div class="quantity-control">

                        <button
                            type="button"
                            class="quantity-minus"
                            data-index="${index}">

                            <i class="fa-solid fa-minus"></i>

                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="quantity-plus"
                            data-index="${index}">

                            <i class="fa-solid fa-plus"></i>

                        </button>

                    </div>


                    <button
                        type="button"
                        class="remove-item"
                        data-index="${index}"
                        aria-label="Remover produto">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;


            cartItemsContainer.appendChild(
                item
            );

        }
    );


    updateItemCount(cart);

    updateTotals();

}


/* ======================================================
   QUANTIDADE / REMOVER
====================================================== */

document.addEventListener(
    "click",
    function(event) {

        const plus =
            event.target.closest(
                ".quantity-plus"
            );

        const minus =
            event.target.closest(
                ".quantity-minus"
            );

        const remove =
            event.target.closest(
                ".remove-item"
            );


        if (
            !plus &&
            !minus &&
            !remove
        ) {

            return;

        }


        const button =
            plus ||
            minus ||
            remove;


        const index =
            Number(
                button.dataset.index
            );


        const cart =
            getCart();


        if (!cart[index]) {

            return;

        }


        let quantity =
            getProductQuantity(
                cart[index]
            );


        if (plus) {

            quantity++;

        }


        if (minus) {

            quantity--;

        }


        if (remove) {

            cart.splice(
                index,
                1
            );

            saveCart(cart);

            renderCart();

            return;

        }


        if (quantity <= 0) {

            cart.splice(
                index,
                1
            );

        }

        else {

            cart[index].quantity =
                quantity;

            cart[index].quantidade =
                quantity;

        }


        saveCart(cart);

        renderCart();

    }
);


/* ======================================================
   LIMPAR
====================================================== */

if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        function() {

            if (!getCart().length) {

                return;

            }


            const confirmed =
                confirm(
                    "Tem certeza que deseja limpar o carrinho?"
                );


            if (!confirmed) {

                return;

            }


            const key =
                getCartKey();


            if (key) {

                localStorage.removeItem(
                    key
                );

            }


            deliveryCost = 0;

            renderCart();

        }
    );

}


/* ======================================================
   CÁLCULO DA ENTREGA
====================================================== */

if (deliveryLocation) {

    deliveryLocation.addEventListener(
        "change",
        function() {

            const location =
                this.value;


            if (!location) {

                deliveryCost = 0;


                if (deliveryMessage) {

                    deliveryMessage.innerHTML = `

                        <i class="fa-solid fa-location-dot"></i>

                        Selecione a localidade para
                        calcular a entrega.

                    `;

                }


                updateTotals();

                return;

            }


            const zone =
                DELIVERY_ZONES[location];


            if (!zone) {

                deliveryCost = 0;

                updateTotals();

                return;

            }


            if (location === "musseque") {

                deliveryCost = 0;


                if (deliveryMessage) {

                    deliveryMessage.innerHTML = `

                        <i class="fa-solid fa-circle-info"></i>

                        A equipa AV Market irá confirmar
                        o valor da entrega para esta localidade.

                    `;

                }


                updateTotals();

                return;

            }


            deliveryCost =
                zone.fee;


            if (deliveryMessage) {

                deliveryMessage.innerHTML = `

                    <i class="fa-solid fa-circle-check"></i>

                    Entrega para
                    <strong>
                        ${zone.name}
                    </strong>
                    :
                    ${formatKz(zone.fee)}

                `;

            }


            updateTotals();

        }
    );

}


/* ======================================================
   CHECKOUT
====================================================== */

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            const accountData =
                await getAuthenticatedUserData();


            if (!accountData) {

                window.location.href =
                    "login.html";

                return;

            }


            const cart =
                getCart();


            if (!cart.length) {

                alert(
                    "O seu carrinho está vazio."
                );

                return;

            }


            const subtotal =
                calculateSubtotal(
                    cart
                );


            const checkoutData = {

                subtotal:
                    subtotal,

                delivery:
                    deliveryCost,

                total:
                    subtotal +
                    deliveryCost,

                location:
                    deliveryLocation
                        ? deliveryLocation.value
                        : "",

                uid:
                    accountData.user.id,

                accountType:
                    accountData.role || ""

            };


            localStorage.setItem(
                "checkoutSummary_" +
                accountData.user.id,
                JSON.stringify(
                    checkoutData
                )
            );


            window.location.href =
                checkoutButton.href ||
                "checkout.html";

        }
    );

}


/* ======================================================
   ALTERAÇÃO REAL DE AUTENTICAÇÃO
====================================================== */

supabase.auth.onAuthStateChange(
    async function(
        event,
        session
    ) {

        if (
            event ===
            "SIGNED_OUT"
        ) {

            authenticatedUser = null;
            authenticatedProfile = null;
            authenticatedRole = null;

            deliveryCost = 0;

            renderCart();

            return;

        }


        if (
            session?.user
        ) {

            await getAuthenticatedUserData();

            renderCart();

        }

    }
);


/* ======================================================
   ATUALIZAÇÃO
====================================================== */

window.addEventListener(
    "storage",
    function() {

        renderCart();

    }
);


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

async function initializeCart() {

    await getAuthenticatedUserData();

    renderCart();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCart
    );

}

else {

    initializeCart();

}


/* ======================================================
   API GLOBAL
====================================================== */

window.AVCart = {

    get:
        getCart,

    save:
        saveCart,

    user:
        function() {
            return authenticatedUser;
        },

    profile:
        function() {
            return authenticatedProfile;
        },

    role:
        function() {
            return authenticatedRole;
        }

};


/* ======================================================
   FIM — CART.JS
====================================================== */

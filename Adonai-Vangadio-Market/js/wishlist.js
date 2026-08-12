/*======================================================
AV MARKET
WISHLIST.JS
SISTEMA INTELIGENTE DE FAVORITOS
SUPABASE AUTH + AUTH CENTRAL
======================================================*/

"use strict";


/*======================================================
AUTENTICAÇÃO CENTRAL
======================================================*/

import {
    supabase,
    getUserProfile,
    normalizeRole
} from "./auth.js";


/*======================================================
CONFIGURAÇÃO
======================================================*/

const AV_WISHLIST_PREFIX =
    "avMarketWishlist_";


/*======================================================
ESTADO DA AUTENTICAÇÃO
======================================================*/

let authenticatedUser = null;

let authenticatedProfile = null;

let authenticatedRole = null;


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


/*======================================================
VERIFICAR LOGIN REAL
======================================================*/

function isUserLoggedIn() {

    return !!authenticatedUser;

}


/*======================================================
IDENTIFICADOR REAL DO UTILIZADOR
======================================================*/

function getUserIdentifier() {

    if (
        !authenticatedUser
    ) {

        return null;

    }


    return String(
        authenticatedUser.id
    );

}


/*======================================================
TIPO REAL DE CONTA
======================================================*/

function getAccountType() {

    if (
        authenticatedRole
    ) {

        return authenticatedRole;

    }


    return null;

}


/*======================================================
CHAVE INDIVIDUAL DOS FAVORITOS
UTILIZADOR + ROLE
======================================================*/

function getWishlistKey() {

    const userId =
        getUserIdentifier();


    if (!userId) {

        return null;

    }


    const role =
        String(
            authenticatedRole ||
            "comprador"
        )
        .toLowerCase()
        .trim();


    return (
        AV_WISHLIST_PREFIX +
        role +
        "_" +
        userId
    );

}


/*======================================================
OBTER FAVORITOS
======================================================*/

function getWishlist() {

    if (
        !isUserLoggedIn()
    ) {

        return [];

    }


    const key =
        getWishlistKey();


    if (!key) {

        return [];

    }


    try {

        const data =
            localStorage.getItem(
                key
            );


        if (!data) {

            return [];

        }


        const wishlist =
            JSON.parse(
                data
            );


        if (
            !Array.isArray(
                wishlist
            )
        ) {

            return [];

        }


        return wishlist;

    }

    catch (error) {

        console.error(
            "Erro ao carregar favoritos:",
            error
        );


        return [];

    }

}


/*======================================================
GUARDAR FAVORITOS
======================================================*/

function saveWishlist(
    items
) {

    if (
        !isUserLoggedIn()
    ) {

        return false;

    }


    const key =
        getWishlistKey();


    if (!key) {

        return false;

    }


    try {

        localStorage.setItem(
            key,
            JSON.stringify(items)
        );


        return true;

    }

    catch (error) {

        console.error(
            "Erro ao guardar favoritos:",
            error
        );


        return false;

    }

}


/*======================================================
REDIRECIONAR PARA LOGIN
======================================================*/

function redirectToLogin() {

    try {

        sessionStorage.setItem(
            "avMarketLoginReturn",
            window.location.href
        );

    }

    catch (error) {

        console.warn(
            "Não foi possível guardar a página de retorno."
        );

    }


    const currentPath =
        window.location.pathname;


    if (
        currentPath.includes(
            "/pages/"
        ) ||
        currentPath.includes(
            "/subpages/"
        )
    ) {

        window.location.href =
            "../login.html";

    }

    else {

        window.location.href =
            "pages/login.html";

    }

}


/*======================================================
GARANTIR LOGIN
======================================================*/

function requireLogin() {

    if (
        isUserLoggedIn()
    ) {

        return true;

    }


    redirectToLogin();

    return false;

}


/*======================================================
VERIFICAR FAVORITO
======================================================*/

function isFavorite(
    productId
) {

    if (
        !isUserLoggedIn()
    ) {

        return false;

    }


    const wishlist =
        getWishlist();


    return wishlist.some(
        product =>
            String(
                product.id
            ) ===
            String(
                productId
            )
    );

}


/*======================================================
ADICIONAR FAVORITO
======================================================*/

function addToWishlist(
    product
) {

    if (
        !requireLogin()
    ) {

        return false;

    }


    if (
        !product ||
        !product.id
    ) {

        return false;

    }


    const wishlist =
        getWishlist();


    const exists =
        wishlist.some(
            item =>
                String(
                    item.id
                ) ===
                String(
                    product.id
                )
        );


    if (exists) {

        return true;

    }


    wishlist.push({

        ...product,

        addedAt:
            new Date().toISOString(),

        uid:
            authenticatedUser.id,

        userId:
            authenticatedUser.id,

        accountType:
            authenticatedRole

    });


    saveWishlist(
        wishlist
    );


    updateWishlistPage();


    showWishlistNotification(
        "Produto adicionado aos favoritos."
    );


    return true;

}


/*======================================================
REMOVER FAVORITO
======================================================*/

function removeFromWishlist(
    productId
) {

    if (
        !requireLogin()
    ) {

        return false;

    }


    let wishlist =
        getWishlist();


    wishlist =
        wishlist.filter(
            item =>
                String(
                    item.id
                ) !==
                String(
                    productId
                )
        );


    saveWishlist(
        wishlist
    );


    updateWishlistPage();


    showWishlistNotification(
        "Produto removido dos favoritos."
    );


    return true;

}


/*======================================================
LIMPAR TODOS
======================================================*/

function clearWishlist() {

    if (
        !requireLogin()
    ) {

        return false;

    }


    const wishlist =
        getWishlist();


    if (
        wishlist.length === 0
    ) {

        return false;

    }


    const confirmed =
        confirm(
            "Tem a certeza de que deseja remover todos os favoritos?"
        );


    if (!confirmed) {

        return false;

    }


    const key =
        getWishlistKey();


    if (key) {

        localStorage.removeItem(
            key
        );

    }


    updateWishlistPage();


    showWishlistNotification(
        "Todos os favoritos foram removidos."
    );


    return true;

}


/*======================================================
CRIAR CARD
======================================================*/

function createWishlistCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "wishlist-card";


    card.dataset.productId =
        product.id;


    const image =
        product.image ||
        product.imagem ||
        product.foto ||
        "../images/product-placeholder.jpg";


    const name =
        product.name ||
        product.nome ||
        product.title ||
        product.titulo ||
        "Produto";


    const category =
        product.category ||
        product.categoria ||
        "Produto";


    const price =
        product.price ??
        product.preco ??
        "Preço não disponível";


    const oldPrice =
        product.oldPrice ||
        product.precoAntigo ||
        "";


    const productLink =
        product.link ||
        product.url ||
        "#";


    card.innerHTML = `

        <div class="wishlist-card-image">

            <img
                src="${image}"
                alt="${name}"
                loading="lazy"
                onerror="this.src='../images/product-placeholder.jpg'"
            >


            <button
                type="button"
                class="wishlist-remove"
                data-remove="${product.id}"
                aria-label="Remover dos favoritos">

                <i class="fa-solid fa-heart"></i>

            </button>

        </div>


        <div class="wishlist-card-content">

            <span class="wishlist-card-category">

                ${category}

            </span>


            <h3 class="wishlist-card-title">

                ${name}

            </h3>


            <div class="wishlist-card-price">

                <span class="wishlist-price">

                    ${price}

                </span>


                ${
                    oldPrice
                    ?
                    `
                    <span class="wishlist-old-price">

                        ${oldPrice}

                    </span>
                    `
                    :
                    ""
                }

            </div>


            <div class="wishlist-card-actions">

                <button
                    type="button"
                    class="wishlist-buy"
                    data-cart-id="${product.id}">

                    <i class="fa-solid fa-cart-plus"></i>

                    Carrinho

                </button>


                <a
                    href="${productLink}"
                    class="wishlist-view"
                    aria-label="Ver produto">

                    <i class="fa-solid fa-eye"></i>

                </a>

            </div>

        </div>

    `;


    return card;

}


/*======================================================
RENDERIZAR FAVORITOS
======================================================*/

function renderWishlist() {

    const container =
        document.getElementById(
            "wishlistProducts"
        );


    const empty =
        document.getElementById(
            "wishlistEmpty"
        );


    if (!container) {

        return;

    }


    if (
        !isUserLoggedIn()
    ) {

        container.innerHTML =
            "";


        if (empty) {

            empty.classList.add(
                "show"
            );

        }


        return;

    }


    const wishlist =
        getWishlist();


    container.innerHTML =
        "";


    if (
        wishlist.length === 0
    ) {

        if (empty) {

            empty.classList.add(
                "show"
            );

        }


        return;

    }


    if (empty) {

        empty.classList.remove(
            "show"
        );

    }


    wishlist.forEach(
        product => {

            const card =
                createWishlistCard(
                    product
                );


            container.appendChild(
                card
            );

        }
    );

}


/*======================================================
ATUALIZAR CONTADORES
======================================================*/

function updateWishlistCounters() {

    const total =
        getWishlist().length;


    const totalElement =
        document.getElementById(
            "wishlistTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    const resultText =
        document.getElementById(
            "wishlistResultText"
        );


    if (resultText) {

        if (
            !isUserLoggedIn()
        ) {

            resultText.textContent =
                "Inicie sessão para ver os seus favoritos";

        }

        else if (
            total === 0
        ) {

            resultText.textContent =
                "Nenhum produto guardado";

        }

        else if (
            total === 1
        ) {

            resultText.textContent =
                "1 produto guardado";

        }

        else {

            resultText.textContent =
                `${total} produtos guardados`;

        }

    }

}


/*======================================================
ATUALIZAR PÁGINA
======================================================*/

function updateWishlistPage() {

    renderWishlist();

    updateWishlistCounters();

}


/*======================================================
ADICIONAR AO CARRINHO
======================================================*/

function addWishlistProductToCart(
    productId
) {

    if (
        !requireLogin()
    ) {

        return;

    }


    const wishlist =
        getWishlist();


    const product =
        wishlist.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );


    if (!product) {

        return;

    }


    if (
        typeof window.addToCart ===
        "function"
    ) {

        window.addToCart(
            product
        );


        showWishlistNotification(
            "Produto adicionado ao carrinho."
        );


        return;

    }


    let cart = [];


    try {

        const cartKey =
            authenticatedUser
                ? (
                    "avMarketCart_" +
                    String(
                        authenticatedRole ||
                        "comprador"
                    )
                    .toLowerCase()
                    .trim() +
                    "_" +
                    authenticatedUser.id
                )
                : null;


        if (!cartKey) {

            return;

        }


        const storedCart =
            localStorage.getItem(
                cartKey
            );


        if (storedCart) {

            cart =
                JSON.parse(
                    storedCart
                );

        }


        if (
            !Array.isArray(cart)
        ) {

            cart = [];

        }


        const existing =
            cart.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        product.id
                    )
            );


        if (existing) {

            existing.quantity =
                Number(
                    existing.quantity || 1
                ) + 1;

        }

        else {

            cart.push({

                ...product,

                quantity: 1,

                uid:
                    authenticatedUser.id,

                userId:
                    authenticatedUser.id,

                accountType:
                    authenticatedRole

            });

        }


        localStorage.setItem(
            cartKey,
            JSON.stringify(
                cart
            )
        );

    }

    catch (error) {

        console.error(
            "AV Market — erro ao adicionar ao carrinho:",
            error
        );

    }


    showWishlistNotification(
        "Produto adicionado ao carrinho."
    );

}


/*======================================================
NOTIFICAÇÃO
======================================================*/

function showWishlistNotification(
    message
) {

    const old =
        document.querySelector(
            ".wishlist-notification"
        );


    if (old) {

        old.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "wishlist-notification";


    notification.innerHTML = `

        <i
            class="fa-solid fa-circle-check"
            style="
                color:#C79A3B;
                margin-right:7px;
            ">
        </i>

        ${message}

    `;


    document.body.appendChild(
        notification
    );


    setTimeout(
        function() {

            if (notification) {

                notification.remove();

            }

        },
        2800
    );

}


/*======================================================
EVENTOS
======================================================*/

document.addEventListener(
    "click",
    function(event) {

        const removeButton =
            event.target.closest(
                "[data-remove]"
            );


        if (removeButton) {

            const productId =
                removeButton.dataset.remove;


            removeFromWishlist(
                productId
            );


            return;

        }


        const cartButton =
            event.target.closest(
                "[data-cart-id]"
            );


        if (cartButton) {

            const productId =
                cartButton.dataset.cartId;


            addWishlistProductToCart(
                productId
            );


            return;

        }


        const clearButton =
            event.target.closest(
                "#clearWishlist"
            );


        if (clearButton) {

            clearWishlist();

        }

    }
);


/*======================================================
ALTERAÇÃO REAL DE AUTENTICAÇÃO
======================================================*/

supabase.auth.onAuthStateChange(
    async function(
        event,
        session
    ) {

        console.log(
            "AV Market — Wishlist — estado da autenticação:",
            event
        );


        if (
            event ===
            "SIGNED_OUT"
        ) {

            authenticatedUser = null;
            authenticatedProfile = null;
            authenticatedRole = null;


            updateWishlistPage();


            return;

        }


        if (
            session?.user
        ) {

            await getAuthenticatedUserData();

            updateWishlistPage();

        }

    }
);


/*======================================================
ATUALIZAÇÃO AUTOMÁTICA
======================================================*/

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key &&
            event.key.startsWith(
                AV_WISHLIST_PREFIX
            )
        ) {

            updateWishlistPage();

        }

    }
);


/*======================================================
API GLOBAL
======================================================*/

window.AVWishlist = {

    get:
        getWishlist,

    add:
        addToWishlist,

    remove:
        removeFromWishlist,

    clear:
        clearWishlist,

    has:
        isFavorite,

    loggedIn:
        isUserLoggedIn,

    userId:
        getUserIdentifier,

    accountType:
        getAccountType,

    profile:
        function() {

            return authenticatedProfile;

        }

};


/*======================================================
INICIALIZAÇÃO
======================================================*/

async function initializeWishlist() {

    console.log(
        "AV Market — inicializando Wishlist..."
    );


    await getAuthenticatedUserData();


    updateWishlistPage();


    console.log(
        "AV Market — Wishlist inteligente carregado."
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeWishlist
    );

}

else {

    initializeWishlist();

}


/*======================================================
FIM — WISHLIST.JS
======================================================*/

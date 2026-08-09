/* ======================================================
   AV MARKET
   FOOTER-AUTH.JS
   SISTEMA INTELIGENTE DO RODAPÉ
   CONTROLO GLOBAL DE AUTENTICAÇÃO
====================================================== */

"use strict";


/* ======================================================
   FIREBASE
====================================================== */

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ======================================================
   ELEMENTOS DO RODAPÉ
====================================================== */

const homeLink =
    document.getElementById(
        "mobileHomeLink"
    );

const cartLink =
    document.getElementById(
        "mobileCartLink"
    );

const wishlistLink =
    document.getElementById(
        "mobileWishlistLink"
    );

const ordersLink =
    document.getElementById(
        "mobileOrdersLink"
    );

const accountLink =
    document.getElementById(
        "mobileAccountLink"
    );


/* ======================================================
   ROTAS
====================================================== */

const ROUTES = {

    login:
        "pages/login.html",

    buyer:
        "pages/perfil-comprador.html",

    seller:
        "pages/perfil-revendedor.html",

    admin:
        "pages/administrador/dashboard.html",

    cart:
        "pages/carrinho.html",

    wishlist:
        "pages/favoritos.html",

    orders:
        "pages/pedidos.html",

    home:
        "index.html"

};


/* ======================================================
   ESTADO
====================================================== */

let currentUser = null;

let currentProfile = null;

let currentRole = null;


/* ======================================================
   NORMALIZAR ROLE
====================================================== */

function normalizeRole(profile) {

    if (!profile) {

        return "";

    }


    return String(

        profile.role ||
        profile.accountType ||
        profile.tipo ||
        profile.userType ||
        profile.type ||
        ""

    )
    .trim()
    .toLowerCase();

}


/* ======================================================
   VERIFICAR TIPOS DE CONTA
====================================================== */

function isBuyer(role) {

    return (

        role === "comprador" ||
        role === "buyer"

    );

}


function isSeller(role) {

    return (

        role === "revendedor" ||
        role === "vendedor" ||
        role === "seller"

    );

}


function isAdmin(role) {

    return (

        role === "admin" ||
        role === "administrador"

    );

}


/* ======================================================
   OBTER ROTA DA CONTA
====================================================== */

function getAccountRoute(role) {

    if (isBuyer(role)) {

        return {

            url:
                ROUTES.buyer,

            text:
                "Conta",

            icon:
                "fa-solid fa-user"

        };

    }


    if (isSeller(role)) {

        return {

            url:
                ROUTES.seller,

            text:
                "Loja",

            icon:
                "fa-solid fa-store"

        };

    }


    if (isAdmin(role)) {

        return {

            url:
                ROUTES.admin,

            text:
                "Admin",

            icon:
                "fa-solid fa-shield-halved"

        };

    }


    return null;

}


/* ======================================================
   REDIRECIONAMENTO
====================================================== */

function redirectToLogin() {

    window.location.href =
        getCorrectRelativePath(
            ROUTES.login
        );

}


/* ======================================================
   CORRIGIR CAMINHO CONFORME A PÁGINA
====================================================== */

function getCorrectRelativePath(route) {

    const path =
        window.location.pathname;


    const isInsidePages =
        /\/pages\//i.test(
            path
        );


    if (isInsidePages) {

        if (
            route.startsWith(
                "pages/"
            )
        ) {

            return route.substring(
                6
            );

        }

    }


    return route;

}


/* ======================================================
   APLICAR LINK
====================================================== */

function applyLink(
    element,
    route
) {

    if (!element) {

        return;

    }


    element.href =
        getCorrectRelativePath(
            route
        );

}


/* ======================================================
   UTILIZADOR NÃO AUTENTICADO
====================================================== */

function setLoggedOut() {

    currentUser =
        null;

    currentProfile =
        null;

    currentRole =
        null;


    /* ==================================================
       MINHA CONTA
    ================================================== */

    if (accountLink) {

        applyLink(
            accountLink,
            ROUTES.login
        );


        accountLink.setAttribute(
            "aria-label",
            "Minha Conta"
        );


        accountLink.title =
            "Entrar na conta";


        const icon =
            accountLink.querySelector(
                "i"
            );


        const span =
            accountLink.querySelector(
                "span"
            );


        if (icon) {

            icon.className =
                "fa-solid fa-user";

        }


        if (span) {

            span.textContent =
                "Conta";

        }

    }


    /* ==================================================
       CARRINHO
    ================================================== */

    applyLink(
        cartLink,
        ROUTES.cart
    );


    /* ==================================================
       FAVORITOS
    ================================================== */

    applyLink(
        wishlistLink,
        ROUTES.wishlist
    );


    /* ==================================================
       PEDIDOS
    ================================================== */

    applyLink(
        ordersLink,
        ROUTES.orders
    );


    /*
     * Os links continuam apontando
     * para as páginas corretas.
     *
     * A proteção real será feita
     * quando essas páginas verificarem
     * a sessão Firebase.
     */


    window.dispatchEvent(
        new CustomEvent(
            "avMarketFooterAuthReady",
            {
                detail: {

                    loggedIn:
                        false,

                    user:
                        null,

                    profile:
                        null,

                    role:
                        null

                }

            }
        )
    );


    console.log(
        "AV Market Footer: utilizador não autenticado."
    );

}


/* ======================================================
   UTILIZADOR AUTENTICADO
====================================================== */

function setLoggedIn(
    user,
    profile
) {

    currentUser =
        user;

    currentProfile =
        profile;

    currentRole =
        normalizeRole(
            profile
        );


    const route =
        getAccountRoute(
            currentRole
        );


    /* ==================================================
       PERFIL SEM ROLE
    ================================================== */

    if (!route) {

        console.warn(
            "AV Market Footer: tipo de conta desconhecido.",
            currentRole
        );


        /*
         * Não escolhemos comprador
         * nem revendedor por engano.
         */

        setLoggedOut();

        return;

    }


    /* ==================================================
       MINHA CONTA
    ================================================== */

    if (accountLink) {

        applyLink(
            accountLink,
            route.url
        );


        const name =
            profile.name ||
            profile.nome ||
            profile.nomeCompleto ||
            "Minha Conta";


        accountLink.setAttribute(
            "aria-label",
            name
        );


        accountLink.title =
            name;


        const icon =
            accountLink.querySelector(
                "i"
            );


        const span =
            accountLink.querySelector(
                "span"
            );


        if (icon) {

            icon.className =
                route.icon;

        }


        if (span) {

            span.textContent =
                route.text;

        }

    }


    /* ==================================================
       CARRINHO
    ================================================== */

    applyLink(
        cartLink,
        ROUTES.cart
    );


    /* ==================================================
       FAVORITOS
    ================================================== */

    applyLink(
        wishlistLink,
        ROUTES.wishlist
    );


    /* ==================================================
       PEDIDOS
    ================================================== */

    applyLink(
        ordersLink,
        ROUTES.orders
    );


    /* ==================================================
       DISPONIBILIZAR SESSÃO
    ================================================== */

    const session = {

        loggedIn:
            true,

        uid:
            user.uid,

        email:
            user.email ||
            profile.email ||
            "",

        nome:
            profile.name ||
            profile.nome ||
            profile.nomeCompleto ||
            "",

        name:
            profile.name ||
            profile.nome ||
            profile.nomeCompleto ||
            "",

        role:
            currentRole,

        tipo:
            currentRole,

        accountType:
            currentRole,

        isBuyer:
            isBuyer(
                currentRole
            ),

        isSeller:
            isSeller(
                currentRole
            ),

        isAdmin:
            isAdmin(
                currentRole
            )

    };


    window.AVMarketUser =
        session;


    window.AVMarketSession =
        session;


    localStorage.setItem(
        "avMarketUser",
        JSON.stringify(
            session
        )
    );


    localStorage.setItem(
        "avMarketUserId",
        user.uid
    );


    localStorage.setItem(
        "avMarketRole",
        currentRole
    );


    localStorage.setItem(
        "avMarketSession",
        JSON.stringify(
            session
        )
    );


    /* ==================================================
       EVENTO GLOBAL
    ================================================== */

    window.dispatchEvent(
        new CustomEvent(
            "avMarketFooterAuthReady",
            {
                detail: {

                    loggedIn:
                        true,

                    user:
                        user,

                    profile:
                        profile,

                    role:
                        currentRole,

                    session:
                        session

                }

            }
        )
    );


    console.log(
        "AV Market Footer: utilizador autenticado.",
        {
            uid:
                user.uid,

            role:
                currentRole
        }
    );

}


/* ======================================================
   PROTEGER LINKS DO RODAPÉ
====================================================== */

function setupProtectedLink(
    element
) {

    if (!element) {

        return;

    }


    if (
        element.dataset.authListener
    ) {

        return;

    }


    element.dataset.authListener =
        "true";


    element.addEventListener(
        "click",
        function(event) {

            if (
                currentUser
            ) {

                return;

            }


            event.preventDefault();


            redirectToLogin();

        }
    );

}


/* ======================================================
   ATIVAR PROTEÇÃO
====================================================== */

setupProtectedLink(
    cartLink
);

setupProtectedLink(
    wishlistLink
);

setupProtectedLink(
    ordersLink
);


/* ======================================================
   MINHA CONTA
====================================================== */

if (accountLink) {

    accountLink.addEventListener(
        "click",
        function(event) {

            /*
             * Se não estiver autenticado,
             * permite ir para o login.
             */

            if (!currentUser) {

                return;

            }


            /*
             * Se estiver autenticado mas
             * ainda não houver perfil válido,
             * impede navegação incorreta.
             */

            if (
                !currentRole
            ) {

                event.preventDefault();

                return;

            }

        }
    );

}


/* ======================================================
   FIREBASE AUTH
====================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        /* ==============================================
           NÃO AUTENTICADO
        ============================================== */

        if (!user) {

            setLoggedOut();

            return;

        }


        /* ==============================================
           BUSCAR PERFIL
        ============================================== */

        try {

            const reference =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const snapshot =
                await getDoc(
                    reference
                );


            /* ==========================================
               PERFIL NÃO EXISTE
            ========================================== */

            if (
                !snapshot.exists()
            ) {

                console.warn(
                    "AV Market Footer: perfil Firestore não encontrado."
                );


                setLoggedOut();

                return;

            }


            /* ==========================================
               MONTAR PERFIL
            ========================================== */

            const profile = {

                uid:
                    user.uid,

                email:
                    user.email ||
                    "",

                ...snapshot.data()

            };


            /* ==========================================
               ATIVAR
            ========================================== */

            setLoggedIn(
                user,
                profile
            );

        }

        catch(error) {

            console.error(
                "AV Market Footer: erro ao verificar autenticação.",
                error
            );


            setLoggedOut();

        }

    }
);


/* ======================================================
   API GLOBAL
====================================================== */

window.AVMarketFooter = {

    isLoggedIn:
        function() {

            return Boolean(
                currentUser
            );

        },


    getUser:
        function() {

            return currentUser;

        },


    getProfile:
        function() {

            return currentProfile;

        },


    getRole:
        function() {

            return currentRole;

        },


    isBuyer:
        function() {

            return isBuyer(
                currentRole
            );

        },


    isSeller:
        function() {

            return isSeller(
                currentRole
            );

        },


    isAdmin:
        function() {

            return isAdmin(
                currentRole
            );

        }

};


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

console.log(
    "AV Market — footer-auth.js carregado."
);

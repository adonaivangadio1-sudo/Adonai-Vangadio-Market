/* ======================================================
   AV MARKET
   INDEX-AUTH.JS
   SISTEMA CENTRAL DE AUTENTICAÇÃO E RODAPÉ
   CONTROLO INTELIGENTE POR UTILIZADOR E TIPO DE CONTA
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

const accountLink =
    document.getElementById(
        "accountLink"
    );

const mobileAccountLink =
    document.getElementById(
        "mobileAccountLink"
    );


/* ======================================================
   ELEMENTOS DO CABEÇALHO
====================================================== */

const headerLink =
    document.getElementById(
        "accountHeaderLink"
    );

const headerPhoto =
    document.getElementById(
        "accountHeaderPhoto"
    );


/* ======================================================
   CONFIGURAÇÃO
====================================================== */

const LOGIN_PAGE =
    "pages/login.html";


const BUYER_PAGE =
    "pages/perfil-comprador.html";


const SELLER_PAGE =
    "pages/perfil-revendedor.html";


const ADMIN_PAGE =
    "pages/administrador/dashboard.html";


/* ======================================================
   PREFIXOS DOS DADOS POR UTILIZADOR
====================================================== */

const STORAGE_PREFIX = {

    cart:
        "avMarketCart_",

    wishlist:
        "avMarketWishlist_",

    orders:
        "avMarketOrders_",

    checkout:
        "avMarketCheckout_"

};


/* ======================================================
   ESTADO GLOBAL
====================================================== */

let currentUser =
    null;

let currentProfile =
    null;

let authReady =
    false;


/* ======================================================
   NORMALIZAR TEXTO
====================================================== */

function normalizeValue(value){

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


/* ======================================================
   NORMALIZAR TIPO DE CONTA
====================================================== */

function normalizeRole(profile){

    if(!profile){

        return "";

    }

    return normalizeValue(

        profile.role ||
        profile.accountType ||
        profile.tipo ||
        profile.userType ||
        profile.type

    );

}


/* ======================================================
   IDENTIFICAR COMPRADOR
====================================================== */

function isBuyerRole(role){

    return (

        role === "comprador" ||
        role === "buyer"

    );

}


/* ======================================================
   IDENTIFICAR REVENDEDOR
====================================================== */

function isSellerRole(role){

    return (

        role === "revendedor" ||
        role === "vendedor" ||
        role === "seller"

    );

}


/* ======================================================
   IDENTIFICAR ADMINISTRADOR
====================================================== */

function isAdminRole(role){

    return (

        role === "admin" ||
        role === "administrador" ||
        role === "administrator"

    );

}


/* ======================================================
   OBTER ROTA DA CONTA
====================================================== */

function getAccountRoute(role){

    role =
        normalizeValue(
            role
        );


    if(
        isBuyerRole(role)
    ){

        return {

            url:
                BUYER_PAGE,

            text:
                "Conta",

            icon:
                "fa-solid fa-user"

        };

    }


    if(
        isSellerRole(role)
    ){

        return {

            url:
                SELLER_PAGE,

            text:
                "Loja",

            icon:
                "fa-solid fa-store"

        };

    }


    if(
        isAdminRole(role)
    ){

        return {

            url:
                ADMIN_PAGE,

            text:
                "Admin",

            icon:
                "fa-solid fa-shield-halved"

        };

    }


    return null;

}


/* ======================================================
   CHAVES DOS DADOS DO UTILIZADOR
====================================================== */

function getUserStorageKeys(uid){

    if(!uid){

        return {

            cart:
                null,

            wishlist:
                null,

            orders:
                null,

            checkout:
                null

        };

    }


    return {

        cart:
            `${STORAGE_PREFIX.cart}${uid}`,

        wishlist:
            `${STORAGE_PREFIX.wishlist}${uid}`,

        orders:
            `${STORAGE_PREFIX.orders}${uid}`,

        checkout:
            `${STORAGE_PREFIX.checkout}${uid}`

    };

}


/* ======================================================
   CRIAR SESSÃO VAZIA
====================================================== */

function createLoggedOutSession(){

    return {

        loggedIn:
            false,

        uid:
            null,

        nome:
            null,

        name:
            null,

        email:
            null,

        telefone:
            null,

        phone:
            null,

        tipo:
            null,

        role:
            null,

        accountType:
            null,

        foto:
            null,

        photoURL:
            null,

        isBuyer:
            false,

        isSeller:
            false,

        isAdmin:
            false,

        keys:
            getUserStorageKeys(null)

    };

}


/* ======================================================
   APLICAR SESSÃO GLOBAL
====================================================== */

function setGlobalSession(session){

    window.AVMarketUser =
        session.loggedIn
            ? session
            : null;


    window.AVMarketSession =
        session;

}


/* ======================================================
   LIMPAR SESSÃO LOCAL
====================================================== */

function clearLocalSession(){

    localStorage.removeItem(
        "avMarketUser"
    );

    localStorage.removeItem(
        "avMarketUserId"
    );

    localStorage.removeItem(
        "avMarketRole"
    );

    localStorage.removeItem(
        "avMarketSession"
    );

}


/* ======================================================
   RODAPÉ — UTILIZADOR NÃO LOGADO
====================================================== */

function updateFooterLoggedOut(){

    if(accountLink){

        accountLink.href =
            LOGIN_PAGE;

        accountLink.title =
            "Entrar na minha conta";

        accountLink.innerHTML = `
            <i class="fa-solid fa-user"></i>
            <span>Minha Conta</span>
        `;

    }


    if(mobileAccountLink){

        mobileAccountLink.href =
            LOGIN_PAGE;

        mobileAccountLink.setAttribute(
            "aria-label",
            "Minha Conta"
        );


        const icon =
            mobileAccountLink.querySelector(
                "i"
            );


        const span =
            mobileAccountLink.querySelector(
                "span"
            );


        if(icon){

            icon.className =
                "fa-solid fa-user";

        }


        if(span){

            span.textContent =
                "Conta";

        }

    }

}


/* ======================================================
   RODAPÉ — UTILIZADOR LOGADO
====================================================== */

function updateFooterLoggedIn(
    profile,
    route
){

    const name =
        profile.name ||
        profile.nome ||
        profile.nomeCompleto ||
        "Minha Conta";


    if(accountLink){

        accountLink.href =
            route.url;

        accountLink.title =
            name;

        accountLink.innerHTML = `

            <i class="${route.icon}"></i>

            <span>
                ${name}
            </span>

        `;

    }


    if(mobileAccountLink){

        mobileAccountLink.href =
            route.url;

        mobileAccountLink.setAttribute(
            "aria-label",
            "Minha Conta"
        );


        const icon =
            mobileAccountLink.querySelector(
                "i"
            );


        const span =
            mobileAccountLink.querySelector(
                "span"
            );


        if(icon){

            icon.className =
                route.icon;

        }


        if(span){

            span.textContent =
                route.text;

        }

    }

}


/* ======================================================
   CABEÇALHO — UTILIZADOR NÃO LOGADO
====================================================== */

function updateHeaderLoggedOut(){

    if(headerLink){

        headerLink.href =
            LOGIN_PAGE;

        headerLink.title =
            "Entrar na minha conta";

    }


    if(headerPhoto){

        headerPhoto.src =
            "assets/images/logo/logo-market.png";

        headerPhoto.alt =
            "Minha Conta";

    }

}


/* ======================================================
   CABEÇALHO — UTILIZADOR LOGADO
====================================================== */

function updateHeaderLoggedIn(
    profile,
    route
){

    const name =
        profile.name ||
        profile.nome ||
        profile.nomeCompleto ||
        "Minha Conta";


    const photo =
        profile.foto ||
        profile.photoURL ||
        "";


    if(headerLink){

        headerLink.href =
            route.url;

        headerLink.title =
            name;

    }


    if(headerPhoto){

        headerPhoto.src =
            photo ||
            "assets/images/logo/logo-market.png";

        headerPhoto.alt =
            name;

    }

}


/* ======================================================
   APLICAR ESTADO DE VISITANTE
====================================================== */

function setLoggedOut(){

    currentUser =
        null;

    currentProfile =
        null;


    clearLocalSession();


    const session =
        createLoggedOutSession();


    setGlobalSession(
        session
    );


    updateFooterLoggedOut();

    updateHeaderLoggedOut();


    console.log(
        "AV Market: utilizador não autenticado."
    );

}


/* ======================================================
   APLICAR ESTADO DE UTILIZADOR LOGADO
====================================================== */

function setLoggedIn(profile){

    if(!profile){

        setLoggedOut();

        return;

    }


    const uid =
        profile.uid;


    if(!uid){

        console.warn(
            "AV Market: perfil sem UID."
        );

        setLoggedOut();

        return;

    }


    const role =
        normalizeRole(
            profile
        );


    const route =
        getAccountRoute(
            role
        );


    if(!route){

        console.warn(
            "AV Market: tipo de conta desconhecido:",
            role
        );


        setLoggedOut();

        return;

    }


    const name =
        profile.name ||
        profile.nome ||
        profile.nomeCompleto ||
        "Minha Conta";


    const email =
        profile.email ||
        "";


    const telefone =
        profile.phone ||
        profile.telefone ||
        "";


    const foto =
        profile.foto ||
        profile.photoURL ||
        "";


    const storageKeys =
        getUserStorageKeys(
            uid
        );


    const session = {

        loggedIn:
            true,

        uid:
            uid,

        nome:
            name,

        name:
            name,

        email:
            email,

        telefone:
            telefone,

        phone:
            telefone,

        tipo:
            role,

        role:
            role,

        accountType:
            role,

        foto:
            foto,

        photoURL:
            foto,

        isBuyer:
            isBuyerRole(
                role
            ),

        isSeller:
            isSellerRole(
                role
            ),

        isAdmin:
            isAdminRole(
                role
            ),

        keys:
            storageKeys

    };


    currentProfile =
        profile;


    localStorage.setItem(
        "avMarketUser",
        JSON.stringify(
            session
        )
    );


    localStorage.setItem(
        "avMarketUserId",
        uid
    );


    localStorage.setItem(
        "avMarketRole",
        role
    );


    localStorage.setItem(
        "avMarketSession",
        JSON.stringify(
            session
        )
    );


    setGlobalSession(
        session
    );


    updateFooterLoggedIn(
        profile,
        route
    );


    updateHeaderLoggedIn(
        profile,
        route
    );


    console.log(
        "AV Market: utilizador autenticado.",
        {
            uid:
                uid,

            nome:
                name,

            tipo:
                role,

            carrinho:
                storageKeys.cart,

            favoritos:
                storageKeys.wishlist,

            pedidos:
                storageKeys.orders,

            checkout:
                storageKeys.checkout

        }
    );

}


/* ======================================================
   API GLOBAL DO AV MARKET
====================================================== */

window.AVMarket = {

    /* ==================================================
       VERIFICAR LOGIN
    ================================================== */

    isLoggedIn:
        function(){

            return Boolean(

                window.AVMarketSession &&
                window.AVMarketSession.loggedIn

            );

        },


    /* ==================================================
       OBTER UTILIZADOR
    ================================================== */

    getUser:
        function(){

            return (
                window.AVMarketUser ||
                null
            );

        },


    /* ==================================================
       OBTER UID
    ================================================== */

    getUserId:
        function(){

            if(
                window.AVMarketSession &&
                window.AVMarketSession.uid
            ){

                return (
                    window.AVMarketSession.uid
                );

            }

            return null;

        },


    /* ==================================================
       OBTER ROLE
    ================================================== */

    getRole:
        function(){

            if(
                window.AVMarketSession &&
                window.AVMarketSession.role
            ){

                return (
                    window.AVMarketSession.role
                );

            }

            return null;

        },


    /* ==================================================
       VERIFICAR COMPRADOR
    ================================================== */

    isBuyer:
        function(){

            return Boolean(

                window.AVMarketSession &&
                window.AVMarketSession.isBuyer

            );

        },


    /* ==================================================
       VERIFICAR REVENDEDOR
    ================================================== */

    isSeller:
        function(){

            return Boolean(

                window.AVMarketSession &&
                window.AVMarketSession.isSeller

            );

        },


    /* ==================================================
       VERIFICAR ADMIN
    ================================================== */

    isAdmin:
        function(){

            return Boolean(

                window.AVMarketSession &&
                window.AVMarketSession.isAdmin

            );

        },


    /* ==================================================
       OBTER CHAVES DE STORAGE
    ================================================== */

    getStorageKeys:
        function(){

            if(
                window.AVMarketSession &&
                window.AVMarketSession.keys
            ){

                return (
                    window.AVMarketSession.keys
                );

            }


            return getUserStorageKeys(
                null
            );

        },


    /* ==================================================
       OBTER CHAVE ESPECÍFICA
    ================================================== */

    getStorageKey:
        function(type){

            const keys =
                this.getStorageKeys();


            if(
                !keys ||
                !Object.prototype.hasOwnProperty.call(
                    keys,
                    type
                )
            ){

                return null;

            }


            return keys[type];

        },


    /* ==================================================
       GARANTIR LOGIN
    ================================================== */

    requireLogin:
        function(
            redirect =
                LOGIN_PAGE
        ){

            if(
                this.isLoggedIn()
            ){

                return true;

            }


            window.location.href =
                redirect;


            return false;

        },


    /* ==================================================
       GARANTIR COMPRADOR
    ================================================== */

    requireBuyer:
        function(
            redirect =
                LOGIN_PAGE
        ){

            if(
                this.isBuyer()
            ){

                return true;

            }


            window.location.href =
                redirect;


            return false;

        },


    /* ==================================================
       GARANTIR REVENDEDOR
    ================================================== */

    requireSeller:
        function(
            redirect =
                LOGIN_PAGE
        ){

            if(
                this.isSeller()
            ){

                return true;

            }


            window.location.href =
                redirect;


            return false;

        }

};


/* ======================================================
   FIREBASE AUTH
====================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        authReady =
            false;


        /* ==============================================
           NÃO AUTENTICADO
        ============================================== */

        if(!user){

            setLoggedOut();

            authReady =
                true;


            window.dispatchEvent(
                new CustomEvent(
                    "avMarketAuthReady",
                    {
                        detail: {
                            loggedIn:
                                false,

                            user:
                                null,

                            session:
                                window.AVMarketSession

                        }
                    }
                )
            );


            return;

        }


        /* ==============================================
           UTILIZADOR AUTENTICADO
        ============================================== */

        try{

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

            if(
                !snapshot.exists()
            ){

                console.warn(
                    "AV Market: utilizador autenticado sem perfil Firestore."
                );


                setLoggedOut();

                authReady =
                    true;


                window.dispatchEvent(
                    new CustomEvent(
                        "avMarketAuthReady",
                        {
                            detail: {
                                loggedIn:
                                    false,

                                user:
                                    user,

                                session:
                                    window.AVMarketSession

                            }
                        }
                    )
                );


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
               ATIVAR SESSÃO
            ========================================== */

            setLoggedIn(
                profile
            );


            authReady =
                true;


            window.dispatchEvent(
                new CustomEvent(
                    "avMarketAuthReady",
                    {
                        detail: {

                            loggedIn:
                                true,

                            user:
                                profile,

                            session:
                                window.AVMarketSession

                        }
                    }
                )
            );

        }

        catch(error){

            console.error(
                "AV Market: erro ao verificar sessão.",
                error
            );


            setLoggedOut();


            authReady =
                true;


            window.dispatchEvent(
                new CustomEvent(
                    "avMarketAuthReady",
                    {
                        detail: {

                            loggedIn:
                                false,

                            user:
                                null,

                            session:
                                window.AVMarketSession

                        }
                    }
                )
            );

        }

    }
);


/* ======================================================
   ALTERAÇÕES DE SESSÃO ENTRE ABAS
====================================================== */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key ===
            "avMarketSession"
        ){

            try{

                const session =
                    JSON.parse(
                        event.newValue
                    );


                if(
                    session &&
                    session.loggedIn
                ){

                    window.AVMarketUser =
                        session;

                    window.AVMarketSession =
                        session;

                }

                else{

                    setLoggedOut();

                }

            }

            catch(error){

                setLoggedOut();

            }

        }

    }
);


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        /*
         * O Firebase será responsável
         * pelo estado definitivo.
         */

        if(
            !window.AVMarketSession
        ){

            setLoggedOut();

        }


        console.log(
            "AV Market — sistema central de autenticação carregado."
        );

    }
);

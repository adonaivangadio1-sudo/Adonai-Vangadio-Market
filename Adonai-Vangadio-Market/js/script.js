/*======================================================
JS/SCRIPT.JS

PRINCIPAL
======================================================*/

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Adonai Vangadio Market iniciado"
        );


        const elements =
            document.querySelectorAll(
                ".fade-up"
            );


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "show"
                            );

                        }

                    });

                }
            );


        elements.forEach(el => {

            observer.observe(el);

        });

    }
);


/*======================================================
SCRIPT.JS
PARTE 1
======================================================*/

"use strict";


/*======================================================
HEADER FIXO
======================================================*/

const header =
    document.querySelector(
        ".market-header"
    );


window.addEventListener(
    "scroll",
    () => {

        if (header) {

            if (window.scrollY > 30) {

                header.classList.add(
                    "sticky"
                );

            } else {

                header.classList.remove(
                    "sticky"
                );

            }

        }

    }
);


/*======================================================
MENU LATERAL ANTIGO
======================================================*/

const menuButton =
    document.querySelector(
        ".menu-mobile"
    );

const sideMenu =
    document.querySelector(
        ".side-menu"
    );

const menuClose =
    document.querySelector(
        ".menu-close"
    );


if (
    menuButton &&
    sideMenu
) {

    menuButton.addEventListener(
        "click",
        () => {

            sideMenu.classList.add(
                "active"
            );

        }
    );

}


if (menuClose) {

    menuClose.addEventListener(
        "click",
        () => {

            if (sideMenu) {

                sideMenu.classList.remove(
                    "active"
                );

            }

        }
    );

}


document.addEventListener(
    "click",
    (e) => {

        if (
            sideMenu &&
            sideMenu.classList.contains("active") &&
            !sideMenu.contains(e.target) &&
            menuButton &&
            !menuButton.contains(e.target)
        ) {

            sideMenu.classList.remove(
                "active"
            );

        }

    }
);


/*======================================================
SCROLL SUAVE
======================================================*/

document
    .querySelectorAll(
        "a[href^='#']"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                (e) => {

                    const target =
                        document.querySelector(
                            link.getAttribute(
                                "href"
                            )
                        );


                    if (target) {

                        e.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        }
    );


/*======================================================
SCRIPT.JS
PARTE 2
======================================================*/


/*======================================================
SLIDER PRODUTOS
======================================================*/

const sliders =
    document.querySelectorAll(
        ".products-row"
    );


sliders.forEach(
    slider => {

        const section =
            slider.closest(
                ".product-slider"
            );


        if (!section) return;


        const left =
            section.querySelector(
                ".slider-btn.left"
            );


        const right =
            section.querySelector(
                ".slider-btn.right"
            );


        if (right) {

            right.addEventListener(
                "click",
                () => {

                    slider.scrollBy({

                        left: 320,

                        behavior: "smooth"

                    });

                }
            );

        }


        if (left) {

            left.addEventListener(
                "click",
                () => {

                    slider.scrollBy({

                        left: -320,

                        behavior: "smooth"

                    });

                }
            );

        }

    }
);


/*======================================================
DRAG HORIZONTAL
======================================================*/

sliders.forEach(
    slider => {

        let pressed = false;

        let startX;

        let scroll;


        slider.addEventListener(
            "mousedown",
            (e) => {

                pressed = true;

                startX = e.pageX;

                scroll = slider.scrollLeft;

            }
        );


        slider.addEventListener(
            "mouseleave",
            () => {

                pressed = false;

            }
        );


        slider.addEventListener(
            "mouseup",
            () => {

                pressed = false;

            }
        );


        slider.addEventListener(
            "mousemove",
            (e) => {

                if (!pressed) return;


                e.preventDefault();


                const move =
                    e.pageX - startX;


                slider.scrollLeft =
                    scroll - move;

            }
        );

    }
);


/*======================================================
SCRIPT.JS
PARTE 3
======================================================*/


/*======================================================
CONTADORES
======================================================*/

let cartCount = 0;

let wishlistCount = 0;


const cartCounter =
    document.getElementById(
        "cartCounter"
    );


const wishlistCounter =
    document.getElementById(
        "favoriteCounter"
    );


function updateCounters() {

    if (cartCounter) {

        cartCounter.textContent =
            cartCount;

    }


    if (wishlistCounter) {

        wishlistCounter.textContent =
            wishlistCount;

    }

}


updateCounters();


/*======================================================
FAVORITOS
======================================================*/

document
    .querySelectorAll(
        ".favorite-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    wishlistCount++;

                    updateCounters();

                }
            );

        }
    );


/*======================================================
CARRINHO
======================================================*/

document
    .querySelectorAll(
        ".add-cart"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    cartCount++;

                    updateCounters();

                }
            );

        }
    );


/*======================================================
SCRIPT.JS
PARTE 4
======================================================*/


/*======================================================
ANIMAÇÃO SCROLL
======================================================*/

const animatedElements =
    document.querySelectorAll(
        ".market-section, .seller-section, .buy-products, .contact-section"
    );


const animationObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "fade-up"
                        );

                    }

                }
            );

        },
        {
            threshold: .15
        }
    );


animatedElements.forEach(
    item => {

        animationObserver.observe(
            item
        );

    }
);


/*======================================================
PESQUISA
======================================================*/

const mainSearchForm =
    document.querySelector(
        ".search-box"
    );


const mainSearchInput =
    document.querySelector(
        "#searchInput"
    );


if (mainSearchForm) {

    mainSearchForm.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();


            const value =
                mainSearchInput
                    ? mainSearchInput.value.trim()
                    : "";


            if (value) {

                window.location.href =
                    "pages/pesquisa.html?q=" +
                    encodeURIComponent(
                        value
                    );

            }

        }
    );

}


/*======================================================
SCRIPT.JS
PARTE 5
======================================================*/


/*======================================================
PESQUISA POR IMAGEM
======================================================*/

const imageSearch =
    document.querySelector(
        ".image-search"
    );


if (imageSearch) {

    imageSearch.addEventListener(
        "click",
        () => {

            console.log(
                "Pesquisa por imagem ativada"
            );

        }
    );

}


/*======================================================
NOTIFICAÇÕES
======================================================*/

function notification(message) {

    const box =
        document.createElement(
            "div"
        );


    box.className =
        "notification";


    box.textContent =
        message;


    document.body.appendChild(
        box
    );


    setTimeout(
        () => {

            box.remove();

        },
        3000
    );

}


/*======================================================
CARREGAMENTO PRODUTOS
======================================================*/

function loadProducts(category) {

    console.log(
        "Categoria carregada:",
        category
    );

}


const categories = [

    "roupas",
    "calcados",
    "eletronicos",
    "computadores",
    "automoveis",
    "casas",
    "motorizadas"

];


categories.forEach(
    loadProducts
);


/*======================================================
SCRIPT.JS
PARTE 6 FINAL
======================================================*/


/*======================================================
LOGIN / CONTA
======================================================*/

const accountButton =
    document.querySelector(
        "[data-account]"
    );


if (accountButton) {

    accountButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "pages/login.html";

        }
    );

}


/*======================================================
TELEFONE / WHATSAPP
======================================================*/

const whatsappLinks =
    document.querySelectorAll(
        "[data-whatsapp]"
    );


whatsappLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                window.open(
                    "https://wa.me/244939663373",
                    "_blank"
                );

            }
        );

    }
);


/*======================================================
FORM CONTACTO
======================================================*/

const contactForm =
    document.querySelector(
        ".contact-form"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();


            notification(
                "Mensagem enviada com sucesso."
            );


            contactForm.reset();

        }
    );

}


/*======================================================
INICIALIZAÇÃO
======================================================*/

console.log(
    "AV Market carregado com sucesso."
);


/* ==================================================
   AV MARKET — SISTEMA DE PESQUISA
================================================== */


/* ==================================================
   ELEMENTOS
================================================== */

const headerSearchInput =
    document.getElementById(
        "searchInput"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


const imageSearchButton =
    document.getElementById(
        "imageSearchButton"
    );


const imageSearchInput =
    document.getElementById(
        "imageSearchInput"
    );


/* ==================================================
   PESQUISA NORMAL
================================================== */

function performSearch() {

    if (!headerSearchInput) return;


    const searchValue =
        headerSearchInput.value.trim();


    if (searchValue === "") {

        headerSearchInput.focus();

        return;

    }


    console.log(
        "Pesquisa realizada:",
        searchValue
    );

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


if (headerSearchInput) {

    headerSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch();

            }

        }
    );

}


/* ==================================================
   PESQUISA POR FOTOGRAFIA
================================================== */

if (
    imageSearchButton &&
    imageSearchInput
) {

    imageSearchButton.addEventListener(
        "click",
        function () {

            imageSearchInput.click();

        }
    );


    imageSearchInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Por favor, selecione uma fotografia válida."
                );


                this.value = "";

                return;

            }


            console.log(
                "Fotografia selecionada:",
                file.name
            );


            alert(
                "Fotografia selecionada com sucesso!"
            );

        }
    );

}


/* ======================================================
   AV MARKET — LOGIN
====================================================== */


/* ======================================================
   MOSTRAR / OCULTAR SENHA
====================================================== */

const loginPassword =
    document.getElementById(
        "password"
    );


const passwordToggle =
    document.getElementById(
        "passwordToggle"
    );


if (
    loginPassword &&
    passwordToggle
) {

    passwordToggle.addEventListener(
        "click",
        function () {

            const isPassword =
                loginPassword.type ===
                "password";


            loginPassword.type =
                isPassword
                    ? "text"
                    : "password";


            passwordToggle.innerHTML =
                isPassword
                    ? '<i class="fa-regular fa-eye-slash"></i>'
                    : '<i class="fa-regular fa-eye"></i>';


            passwordToggle.setAttribute(
                "aria-label",
                isPassword
                    ? "Ocultar palavra-passe"
                    : "Mostrar palavra-passe"
            );

        }
    );

}


/* ======================================================
   LOGIN
====================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const emailElement =
                document.getElementById(
                    "email"
                );


            const passwordElement =
                document.getElementById(
                    "password"
                );


            const email =
                emailElement
                    ? emailElement.value.trim()
                    : "";


            const passwordValue =
                passwordElement
                    ? passwordElement.value
                    : "";


            if (
                !email ||
                !passwordValue
            ) {

                return;

            }


            console.log(
                "Login preparado:",
                email
            );

        }
    );

}


/* ======================================================
   AV MARKET — MINHA CONTA
====================================================== */


/* ======================================================
   ELEMENTOS
====================================================== */

const accountChoice =
    document.querySelector(
        ".account-choice"
    );


const openAccountChoice =
    document.getElementById(
        "openAccountChoice"
    );


const choiceClose =
    document.querySelector(
        ".choice-close"
    );


/* ======================================================
   ABRIR MODAL
====================================================== */

if (
    openAccountChoice &&
    accountChoice
) {

    openAccountChoice.addEventListener(
        "click",
        function () {

            accountChoice.classList.remove(
                "hidden"
            );


            document.body.style.overflow =
                "hidden";

        }
    );

}


/* ======================================================
   FECHAR MODAL
====================================================== */

function closeAccountChoice() {

    if (!accountChoice) return;


    accountChoice.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


if (choiceClose) {

    choiceClose.addEventListener(
        "click",
        closeAccountChoice
    );

}


/* ======================================================
   FECHAR AO CLICAR FORA
====================================================== */

if (accountChoice) {

    accountChoice.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                accountChoice
            ) {

                closeAccountChoice();

            }

        }
    );

}


/* ======================================================
   ESC
====================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeAccountChoice();

        }

    }
);


/* ======================================================
   MOSTRAR / OCULTAR PALAVRA-PASSE
====================================================== */

const accountPassword =
    document.getElementById(
        "password"
    );


const showPassword =
    document.getElementById(
        "showPassword"
    );


if (
    accountPassword &&
    showPassword
) {

    showPassword.addEventListener(
        "click",
        function () {

            const hidden =
                accountPassword.type ===
                "password";


            accountPassword.type =
                hidden
                    ? "text"
                    : "password";


            showPassword.innerHTML =
                hidden
                    ? '<i class="fa-regular fa-eye-slash"></i>'
                    : '<i class="fa-regular fa-eye"></i>';

        }
    );

}


/* ======================================================
   AV MARKET — REGISTRO
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const registerCards =
            document.querySelectorAll(
                ".register-card"
            );


        registerCards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        /*
                         * Permite que o navegador siga
                         * normalmente o href do cartão.
                         */

                    }
                );

            }
        );

    }
);


/* ======================================================
   AV MARKET — COMPRADOR
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const form =
            document.getElementById(
                "buyerForm"
            );


        const password =
            document.getElementById(
                "buyerPassword"
            );


        const confirmPassword =
            document.getElementById(
                "buyerPasswordConfirm"
            );


        const passwordToggle =
            document.getElementById(
                "buyerPasswordToggle"
            );


        const confirmToggle =
            document.getElementById(
                "buyerConfirmToggle"
            );


        /* ==================================================
           MOSTRAR / OCULTAR PALAVRA-PASSE
        ================================================== */

        if (
            passwordToggle &&
            password
        ) {

            passwordToggle.addEventListener(
                "click",
                function () {

                    const isPassword =
                        password.type ===
                        "password";


                    password.type =
                        isPassword
                            ? "text"
                            : "password";


                    passwordToggle.innerHTML =
                        isPassword
                            ? '<i class="fa-regular fa-eye-slash"></i>'
                            : '<i class="fa-regular fa-eye"></i>';

                }
            );

        }


        /* ==================================================
           MOSTRAR / OCULTAR CONFIRMAÇÃO
        ================================================== */

        if (
            confirmToggle &&
            confirmPassword
        ) {

            confirmToggle.addEventListener(
                "click",
                function () {

                    const isPassword =
                        confirmPassword.type ===
                        "password";


                    confirmPassword.type =
                        isPassword
                            ? "text"
                            : "password";


                    confirmToggle.innerHTML =
                        isPassword
                            ? '<i class="fa-regular fa-eye-slash"></i>'
                            : '<i class="fa-regular fa-eye"></i>';

                }
            );

        }


        /* ==================================================
           FORMULÁRIO
        ================================================== */

        if (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();


                    if (
                        !password ||
                        !confirmPassword
                    ) {

                        return;

                    }


                    if (
                        password.value !==
                        confirmPassword.value
                    ) {

                        alert(
                            "As palavras-passe não coincidem."
                        );


                        confirmPassword.focus();

                        return;

                    }


                    alert(
                        "Conta pronta para ser criada."
                    );

                }
            );

        }

    }
);


/* ======================================================
   PERFIL / CONTA
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const accountLink =
            document.getElementById(
                "accountLink"
            );


        const user =
            JSON.parse(
                localStorage.getItem(
                    "user"
                )
            );


        if (
            user &&
            accountLink
        ) {


            if (
                user.tipo ===
                "comprador"
            ) {

                accountLink.href =
                    "pages/perfil-comprador.html";

            }


            else if (
                user.tipo ===
                "revendedor"
            ) {

                accountLink.href =
                    "pages/perfil-revendedor.html";

            }

        }

    }
);


/* ======================================================
   AV MARKET — MENU DO CABEÇALHO
====================================================== */

/*
   ATENÇÃO:
   Esta é a parte corrigida.

   NÃO colocar <script> aqui.
   Este ficheiro já é um .js.
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const menuButton =
            document.getElementById(
                "headerMenuButton"
            );


        const menu =
            document.getElementById(
                "headerMenu"
            );


        const overlay =
            document.getElementById(
                "headerMenuOverlay"
            );


        const closeButton =
            document.getElementById(
                "headerMenuClose"
            );


        /* ==============================================
           VERIFICAR ELEMENTOS
        ============================================== */

        if (
            !menuButton ||
            !menu ||
            !overlay ||
            !closeButton
        ) {

            console.error(
                "Menu do cabeçalho: elementos não encontrados.",
                {
                    menuButton,
                    menu,
                    overlay,
                    closeButton
                }
            );

            return;

        }


        /* ==============================================
           FUNÇÃO ABRIR
        ============================================== */

        function openHeaderMenu() {

            menu.classList.add(
                "active"
            );


            overlay.classList.add(
                "active"
            );


            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );


            menu.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.style.overflow =
                "hidden";

        }


        /* ==============================================
           FUNÇÃO FECHAR
        ============================================== */

        function closeHeaderMenu() {

            menu.classList.remove(
                "active"
            );


            overlay.classList.remove(
                "active"
            );


            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );


            menu.setAttribute(
                "aria-hidden",
                "true"
            );


            document.body.style.overflow =
                "";

        }


        /* ==============================================
           ABRIR
        ============================================== */

        menuButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openHeaderMenu();

            }
        );


        /* ==============================================
           FECHAR
        ============================================== */

        closeButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                closeHeaderMenu();

            }
        );


        /* ==============================================
           CLICAR NO OVERLAY
        ============================================== */

        overlay.addEventListener(
            "click",
            function () {

                closeHeaderMenu();

            }
        );


        /* ==============================================
           CLICAR NUM ITEM
        ============================================== */

        const menuItems =
            document.querySelectorAll(
                ".header-menu-item"
            );


        menuItems.forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        closeHeaderMenu();

                    }
                );

            }
        );


        /* ==============================================
           ESC
        ============================================== */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeHeaderMenu();

                }

            }
        );


    }
);

/* ======================================================
   AV MARKET
   NAVEGAÇÃO INTELIGENTE — RODAPÉ FIXO
   SUPABASE AUTH + AUTH CENTRAL
====================================================== */

"use strict";


/* ======================================================
   IMPORTAR SISTEMA CENTRAL DE AUTENTICAÇÃO
====================================================== */

import {
    supabase,
    ROLES,
    getUserProfile,
    normalizeRole
} from "./auth.js";


/* ======================================================
   ELEMENTOS DO RODAPÉ
====================================================== */

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

/*
 * Todas as páginas abaixo partem da raiz
 * do projeto AV Market.
 *
 * index.html
 * ├── pages/
 * │   ├── login.html
 * │   ├── carrinho.html
 * │   ├── favoritos.html
 * │   ├── pedidos.html
 * │   ├── perfil-comprador.html
 * │   └── perfil-revendedor.html
 *
 * └── administrador/
 *     └── admin.html
 */

const AUTH_ROUTES = Object.freeze({

    LOGIN:
        "pages/login.html",

    CART:
        "pages/carrinho.html",

    WISHLIST:
        "pages/favoritos.html",

    ORDERS:
        "pages/pedidos.html",

    COMPRADOR:
        "pages/perfil-comprador.html",

    REVENDEDOR:
        "pages/perfil-revendedor.html",

    ADMIN:
        "administrador/admin.html"

});


/* ======================================================
   DESCOBRIR RAIZ DO SITE
====================================================== */

/*
 * Esta função evita problemas quando o rodapé
 * estiver em páginas dentro de /pages/ ou
 * /administrador/.
 */

function getSiteRoot() {

    const pathname =
        window.location.pathname;


    /*
     * Se estamos dentro de /pages/
     */
    if (
        pathname.includes("/pages/")
    ) {

        return "../";

    }


    /*
     * Se estamos dentro de /administrador/
     */
    if (
        pathname.includes("/administrador/")
    ) {

        return "../";

    }


    /*
     * Página na raiz
     */
    return "";

}


/* ======================================================
   CRIAR ROTA ABSOLUTA A PARTIR DA RAIZ
====================================================== */

function buildRoute(
    route
) {

    const root =
        getSiteRoot();


    return (
        root +
        route
    );

}


/* ======================================================
   OBTER SESSÃO REAL DO SUPABASE
====================================================== */

async function getAuthenticatedSession() {

    try {

        const {
            data,
            error
        } =
            await supabase.auth.getSession();


        if (
            error
        ) {

            console.error(
                "AV Market — erro ao verificar sessão:",
                error
            );


            return null;

        }


        /*
         * Aqui está a verificação REAL.
         *
         * Se não existir session,
         * ninguém está autenticado.
         */

        return (
            data?.session ||
            null
        );

    }

    catch (error) {

        console.error(
            "AV Market — erro interno ao verificar autenticação:",
            error
        );


        return null;

    }

}


/* ======================================================
   OBTER UTILIZADOR + PERFIL + ROLE
====================================================== */

async function getAuthenticatedUserData() {

    const session =
        await getAuthenticatedSession();


    /*
     * NÃO existe sessão.
     */

    if (
        !session ||
        !session.user
    ) {

        return null;

    }


    const user =
        session.user;


    try {

        /*
         * Buscar perfil no Supabase Database.
         */

        const profile =
            await getUserProfile(
                user.id
            );


        /*
         * O administrador é reconhecido
         * pelo próprio auth.js através do UID.
         */

        if (
            user.id ===
            "f82df114-169b-4c24-8e7e-748555898720"
        ) {

            return {

                user,

                profile:
                    profile || {

                        id:
                            user.id,

                        uid:
                            user.id,

                        email:
                            user.email || "",

                        role:
                            ROLES.ADMIN

                    },

                role:
                    ROLES.ADMIN

            };

        }


        /*
         * Utilizador autenticado,
         * mas sem perfil no banco.
         */

        if (!profile) {

            console.warn(
                "AV Market — utilizador autenticado sem perfil:",
                user.id
            );


            return {

                user,

                profile:
                    null,

                role:
                    ""

            };

        }


        const role =
            normalizeRole(
                profile
            );


        return {

            user,

            profile,

            role

        };

    }

    catch (error) {

        console.error(
            "AV Market — erro ao obter dados da conta:",
            error
        );


        return {

            user,

            profile:
                null,

            role:
                ""

        };

    }

}


/* ======================================================
   REDIRECIONAR PARA LOGIN
====================================================== */

function redirectToLogin() {

    window.location.href =
        buildRoute(
            AUTH_ROUTES.LOGIN
        );

}


/* ======================================================
   DEFINIR DESTINO DE "MINHA CONTA"
====================================================== */

function getAccountRoute(
    role
) {

    const normalizedRole =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    switch (
        normalizedRole
    ) {

        /* ==============================================
           ADMINISTRADOR
        ============================================== */

        case ROLES.ADMIN:

        case "administrador":

            return buildRoute(
                AUTH_ROUTES.ADMIN
            );


        /* ==============================================
           COMPRADOR
        ============================================== */

        case ROLES.COMPRADOR:

        case "buyer":

            return buildRoute(
                AUTH_ROUTES.COMPRADOR
            );


        /* ==============================================
           REVENDEDOR
        ============================================== */

        case ROLES.REVENDEDOR:

        case "vendedor":

        case "seller":

            return buildRoute(
                AUTH_ROUTES.REVENDEDOR
            );


        /* ==============================================
           ROLE DESCONHECIDA
        ============================================== */

        default:

            console.warn(
                "AV Market — role desconhecida:",
                role
            );


            return null;

    }

}


/* ======================================================
   ATUALIZAR "MINHA CONTA"
====================================================== */

async function updateAccountLink() {

    if (
        !accountLink
    ) {

        return;

    }


    /*
     * Enquanto verificamos o Supabase,
     * não deixamos o href antigo apontar
     * automaticamente para login.
     */

    accountLink.dataset.authChecking =
        "true";


    const accountData =
        await getAuthenticatedUserData();


    /*
     * ==============================================
     * NÃO AUTENTICADO
     * ==============================================
     */

    if (
        !accountData
    ) {

        accountLink.href =
            buildRoute(
                AUTH_ROUTES.LOGIN
            );


        accountLink.dataset.authenticated =
            "false";


        accountLink.dataset.authChecking =
            "false";


        return;

    }


    /*
     * ==============================================
     * AUTENTICADO
     * ==============================================
     */

    const accountRoute =
        getAccountRoute(
            accountData.role
        );


    /*
     * Se a role não puder ser identificada,
     * não mandamos para um painel errado.
     */

    if (
        !accountRoute
    ) {

        console.error(
            "AV Market — não foi possível determinar o painel da conta:",
            accountData
        );


        accountLink.href =
            buildRoute(
                AUTH_ROUTES.LOGIN
            );


        accountLink.dataset.authenticated =
            "true";

        accountLink.dataset.authChecking =
            "false";


        return;

    }


    /*
     * DEFINIR DESTINO CORRETO
     */

    accountLink.href =
        accountRoute;


    accountLink.dataset.authenticated =
        "true";


    accountLink.dataset.userId =
        accountData.user.id;


    accountLink.dataset.role =
        accountData.role;


    accountLink.dataset.authChecking =
        "false";


    console.log(
        "AV Market — Minha Conta:",
        accountData.role,
        "→",
        accountRoute
    );

}


/* ======================================================
   CONFIGURAR LINKS QUE EXIGEM AUTENTICAÇÃO
====================================================== */

function setupProtectedLink(
    link,
    route
) {

    if (
        !link
    ) {

        return;

    }


    /*
     * Definir a rota padrão.
     */

    link.href =
        buildRoute(
            route
        );


    link.addEventListener(
        "click",
        async function (event) {

            /*
             * Impedir a navegação imediata.
             *
             * Primeiro verificamos o Supabase.
             */

            event.preventDefault();


            /*
             * Evitar duplo clique enquanto
             * verificamos a sessão.
             */

            if (
                link.dataset.authChecking ===
                "true"
            ) {

                return;

            }


            link.dataset.authChecking =
                "true";


            try {

                const accountData =
                    await getAuthenticatedUserData();


                /*
                 * ==================================
                 * NÃO ESTÁ LOGADO
                 * ==================================
                 */

                if (
                    !accountData
                ) {

                    console.log(
                        "AV Market — acesso protegido sem sessão. Redirecionando para login."
                    );


                    redirectToLogin();


                    return;

                }


                /*
                 * ==================================
                 * ESTÁ LOGADO
                 * ==================================
                 */

                console.log(
                    "AV Market — utilizador autenticado:",
                    accountData.user.id,
                    "role:",
                    accountData.role
                );


                /*
                 * O carrinho, favoritos e pedidos
                 * continuam sendo páginas próprias.
                 *
                 * Elas poderão posteriormente
                 * consultar o UID do utilizador
                 * para mostrar apenas os seus dados.
                 */

                window.location.href =
                    buildRoute(
                        route
                    );

            }

            catch (error) {

                console.error(
                    "AV Market — erro ao processar navegação protegida:",
                    error
                );


                /*
                 * Em caso de erro de autenticação,
                 * não assumimos que existe sessão.
                 */

                redirectToLogin();

            }

            finally {

                link.dataset.authChecking =
                    "false";

            }

        }
    );

}


/* ======================================================
   CONFIGURAR MINHA CONTA
====================================================== */

function setupAccountLink() {

    if (
        !accountLink
    ) {

        return;

    }


    accountLink.addEventListener(
        "click",
        async function (event) {

            /*
             * A rota é decidida dinamicamente.
             */

            event.preventDefault();


            if (
                accountLink.dataset.authChecking ===
                "true"
            ) {

                return;

            }


            accountLink.dataset.authChecking =
                "true";


            try {

                const accountData =
                    await getAuthenticatedUserData();


                /*
                 * ==================================
                 * SEM CONTA LOGADA
                 * ==================================
                 */

                if (
                    !accountData
                ) {

                    console.log(
                        "AV Market — Minha Conta: nenhum utilizador autenticado."
                    );


                    redirectToLogin();


                    return;

                }


                /*
                 * ==================================
                 * CONTA LOGADA
                 * ==================================
                 */

                const route =
                    getAccountRoute(
                        accountData.role
                    );


                if (
                    !route
                ) {

                    console.error(
                        "AV Market — role da conta não reconhecida:",
                        accountData.role
                    );


                    /*
                     * Não enviamos o utilizador
                     * para o painel errado.
                     */

                    alert(
                        "Não foi possível identificar o tipo da sua conta."
                    );


                    return;

                }


                console.log(
                    "AV Market — Minha Conta:",
                    accountData.role,
                    "→",
                    route
                );


                /*
                 * REDIRECIONAMENTO FINAL
                 */

                window.location.href =
                    route;

            }

            catch (error) {

                console.error(
                    "AV Market — erro ao abrir Minha Conta:",
                    error
                );


                redirectToLogin();

            }

            finally {

                accountLink.dataset.authChecking =
                    "false";

            }

        }
    );

}


/* ======================================================
   ESCUTAR ALTERAÇÕES DE AUTENTICAÇÃO
====================================================== */

function watchFooterAuthentication() {

    /*
     * Sempre que houver login, logout ou alteração
     * da sessão no Supabase, atualizamos o link
     * "Minha Conta".
     */

    supabase.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            console.log(
                "AV Market — estado do rodapé:",
                event
            );


            /*
             * LOGOUT
             */

            if (
                event ===
                "SIGNED_OUT"
            ) {

                if (
                    accountLink
                ) {

                    accountLink.href =
                        buildRoute(
                            AUTH_ROUTES.LOGIN
                        );


                    accountLink.dataset.authenticated =
                        "false";


                    accountLink.dataset.role =
                        "";

                }


                return;

            }


            /*
             * LOGIN / RESTAURAÇÃO DA SESSÃO
             */

            if (
                session?.user
            ) {

                await updateAccountLink();

            }

        }
    );

}


/* ======================================================
   INICIALIZAR RODAPÉ INTELIGENTE
====================================================== */

async function initializeFooterNavigation() {

    console.log(
        "AV Market — inicializando navegação inteligente do rodapé..."
    );


    /*
     * ==============================================
     * CARRINHO
     * ==============================================
     */

    setupProtectedLink(
        cartLink,
        AUTH_ROUTES.CART
    );


    /*
     * ==============================================
     * FAVORITOS
     * ==============================================
     */

    setupProtectedLink(
        wishlistLink,
        AUTH_ROUTES.WISHLIST
    );


    /*
     * ==============================================
     * PEDIDOS
     * ==============================================
     */

    setupProtectedLink(
        ordersLink,
        AUTH_ROUTES.ORDERS
    );


    /*
     * ==============================================
     * MINHA CONTA
     * ==============================================
     */

    setupAccountLink();


    /*
     * Descobrir imediatamente se existe
     * uma sessão Supabase.
     */

    await updateAccountLink();


    /*
     * Continuar acompanhando login/logout.
     */

    watchFooterAuthentication();


    console.log(
        "AV Market — navegação inteligente do rodapé carregada."
    );

}


/* ======================================================
   INICIAR
====================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFooterNavigation
    );

}

else {

    initializeFooterNavigation();

}


/* ======================================================
   FIM — NAVEGAÇÃO INTELIGENTE DO RODAPÉ
====================================================== */

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

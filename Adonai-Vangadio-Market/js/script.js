/*======================================================
 ADONAI VANGADIO MARKET
 SCRIPT.JS
 PREMIUM V4
 PARTE 1
======================================================*/

"use strict";

/*======================================================
ELEMENTOS DO SISTEMA
======================================================*/

const loader = document.getElementById("loader");

const header = document.querySelector(".market-header");

const menuButton = document.getElementById("marketMenuButton");

const mobileNavigation = document.querySelector(".mobile-navigation");

const backToTop = document.getElementById("backToTop");

const searchForm = document.getElementById("marketSearchForm");

const searchInput = document.getElementById("marketSearchInput");

const categoryButton = document.getElementById("marketCategoryButton");

const imageSearchButton = document.getElementById("marketImageSearch");

const languageButton = document.getElementById("marketLanguageButton");

const accountButton = document.getElementById("marketAccountButton");

const favoriteCounter = document.getElementById("favoriteCounter");

const cartCounter = document.getElementById("cartCounter");

/*======================================================
ESTADO GLOBAL
======================================================*/

const Market = {

    favorites: 0,

    cart: 0,

    mobileOpen: false

};

/*======================================================
LOADER
======================================================*/

window.addEventListener("load", () => {

    if (!loader) return;

    loader.style.opacity = "0";

    setTimeout(() => {

        loader.style.display = "none";

    }, 400);

});

/*======================================================
HEADER FIXO
======================================================*/

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 25) {

        header.classList.add("sticky");

    } else {

        header.classList.remove("sticky");

    }

});

/*======================================================
BOTÃO VOLTAR AO TOPO
======================================================*/

window.addEventListener("scroll", () => {

    if (!backToTop) return;

    if (window.scrollY > 500) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

});

if (backToTop) {

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*======================================================
MENU MOBILE
======================================================*/

if (menuButton && mobileNavigation) {

    menuButton.addEventListener("click", () => {

        Market.mobileOpen = !Market.mobileOpen;

        mobileNavigation.classList.toggle("active");

        menuButton.classList.toggle("active");

    });

}

/*======================================================
PESQUISA
======================================================*/

if (searchForm) {

    searchForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const value = searchInput.value.trim();

        if (value === "") {

            searchInput.focus();

            return;

        }

        console.log("Pesquisar:", value);

        /*
        Futuramente:

        window.location.href =
        "pages/pesquisa.html?q=" +
        encodeURIComponent(value);

        */

    });

}

/*======================================================
BOTÃO DAS CATEGORIAS
======================================================*/

if (categoryButton) {

    categoryButton.addEventListener("click", () => {

        console.log("Abrir categorias.");

    });

}

/*======================================================
PESQUISA POR IMAGEM
======================================================*/

if (imageSearchButton) {

    imageSearchButton.addEventListener("click", () => {

        console.log("Pesquisa por imagem.");

    });

}

/*======================================================
IDIOMA
======================================================*/

if (languageButton) {

    languageButton.addEventListener("click", () => {

        console.log("Selecionar idioma.");

    });

}

/*======================================================
CONTA
======================================================*/

if (accountButton) {

    accountButton.addEventListener("click", () => {

        console.log("Abrir conta.");

    });

}

/*======================================================
CONTADORES
======================================================*/

function updateCounters() {

    if (favoriteCounter) {

        favoriteCounter.textContent = Market.favorites;

    }

    if (cartCounter) {

        cartCounter.textContent = Market.cart;

    }

}

updateCounters();

/*======================================================
ESC
======================================================*/

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    mobileNavigation?.classList.remove("active");

    menuButton?.classList.remove("active");

});

/*======================================================
INICIALIZAÇÃO
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Adonai Vangadio Market Premium V4");

    console.log("Parte 1 carregada.");

});

/*======================================================
 ADONAI VANGADIO MARKET
 SCRIPT.JS
 PREMIUM V4
 PARTE 2
 SLIDERS DOS PRODUTOS
======================================================*/

"use strict";

/*======================================================
SLIDERS DOS PRODUTOS
======================================================*/

const marketSliders = document.querySelectorAll(".market-slider");

marketSliders.forEach((slider) => {

    const productsRow = slider.querySelector(".market-products-row");

    const previousButton = slider.querySelector(".market-slider-prev");

    const nextButton = slider.querySelector(".market-slider-next");

    if (!productsRow) return;

    const scrollValue = 340;

    /*==================================================
    BOTÃO ANTERIOR
    ==================================================*/

    if (previousButton) {

        previousButton.addEventListener("click", () => {

            productsRow.scrollBy({

                left: -scrollValue,

                behavior: "smooth"

            });

        });

    }

    /*==================================================
    BOTÃO SEGUINTE
    ==================================================*/

    if (nextButton) {

        nextButton.addEventListener("click", () => {

            productsRow.scrollBy({

                left: scrollValue,

                behavior: "smooth"

            });

        });

    }

    /*==================================================
    DESKTOP - ARRASTAR
    ==================================================*/

    let isDragging = false;

    let startX = 0;

    let scrollLeft = 0;

    productsRow.addEventListener("mousedown", (event) => {

        isDragging = true;

        productsRow.classList.add("dragging");

        startX = event.pageX - productsRow.offsetLeft;

        scrollLeft = productsRow.scrollLeft;

    });

    productsRow.addEventListener("mouseleave", () => {

        isDragging = false;

        productsRow.classList.remove("dragging");

    });

    productsRow.addEventListener("mouseup", () => {

        isDragging = false;

        productsRow.classList.remove("dragging");

    });

    productsRow.addEventListener("mousemove", (event) => {

        if (!isDragging) return;

        event.preventDefault();

        const x = event.pageX - productsRow.offsetLeft;

        const walk = (x - startX) * 1.8;

        productsRow.scrollLeft = scrollLeft - walk;

    });

    /*==================================================
    MOBILE - TOUCH
    ==================================================*/

    let touchStart = 0;

    productsRow.addEventListener("touchstart", (event) => {

        touchStart = event.touches[0].clientX;

    }, {

        passive: true

    });

    productsRow.addEventListener("touchmove", (event) => {

        const touchCurrent = event.touches[0].clientX;

        const move = touchStart - touchCurrent;

        productsRow.scrollLeft += move;

        touchStart = touchCurrent;

    }, {

        passive: true

    });

});

/*======================================================
SCROLL COM A RODA DO RATO
======================================================*/

document.querySelectorAll(".market-products-row").forEach((row) => {

    row.addEventListener("wheel", (event) => {

        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {

            event.preventDefault();

            row.scrollLeft += event.deltaY;

        }

    }, {

        passive: false

    });

});

/*======================================================
EFEITO HOVER DOS CARDS
======================================================*/

const productCards = document.querySelectorAll(".market-product-card");

productCards.forEach((card) => {

    card.addEventListener("mouseenter", () => {

        card.classList.add("active");

    });

    card.addEventListener("mouseleave", () => {

        card.classList.remove("active");

    });

});

/*======================================================
PREPARAÇÃO PARA CARREGAMENTO DINÂMICO
======================================================*/

const marketSections = [

    "featuredProducts",

    "clothingProducts",

    "shoesProducts",

    "phonesProducts",

    "computersProducts",

    "carsProducts",

    "motorcyclesProducts",

    "housesProducts",

    "landsProducts"

];

marketSections.forEach((id) => {

    const section = document.getElementById(id);

    if (!section) return;

    console.log("Secção preparada:", id);

    /*
    FUTURO:

    Firebase

    API

    Base de Dados

    Produtos Automáticos

    */

});

/*======================================================
PARTE 2 FINALIZADA
======================================================*/

console.log("Premium V4 - Parte 2 carregada.");

/*======================================================
 ADONAI VANGADIO MARKET
 SCRIPT.JS
 PREMIUM V4
 PARTE 3
 FAVORITOS • CARRINHO • NEWSLETTER
======================================================*/

"use strict";

/*======================================================
FAVORITOS
======================================================*/

const favoriteButtons = document.querySelectorAll(
".market-favorite-button"
);

favoriteButtons.forEach((button)=>{

    button.addEventListener("click",()=>{

        Market.favorites++;

        updateCounters();

        button.classList.toggle("active");

        console.log("Favorito adicionado.");

    });

});

/*======================================================
CARRINHO
======================================================*/

const cartButtons=document.querySelectorAll(
".market-cart-button"
);

cartButtons.forEach((button)=>{

    button.addEventListener("click",()=>{

        Market.cart++;

        updateCounters();

        showNotification(
            "Produto adicionado ao carrinho."
        );

    });

});

/*======================================================
NEWSLETTER
======================================================*/

const newsletterForm=document.querySelector(
".newsletter-form"
);

const newsletterEmail=document.getElementById(
"newsletterEmail"
);

if(newsletterForm && newsletterEmail){

    newsletterForm.addEventListener("submit",(event)=>{

        event.preventDefault();

        const email=newsletterEmail.value.trim();

        if(email===""){

            newsletterEmail.focus();

            return;

        }

        console.log(
            "Newsletter:",
            email
        );

        showNotification(
            "Subscrição realizada."
        );

        newsletterForm.reset();

    });

}

/*======================================================
NOTIFICAÇÕES
======================================================*/

function showNotification(message){

    console.log(message);

    /*
    PREMIUM V5

    Toast

    Popup

    Snackbar

    */

}

/*======================================================
ANIMAÇÃO DOS CONTADORES
======================================================*/

function animateCounter(id,end){

    const element=document.getElementById(id);

    if(!element) return;

    let current=0;

    const increment=Math.max(
        1,
        Math.ceil(end/60)
    );

    const timer=setInterval(()=>{

        current+=increment;

        if(current>=end){

            current=end;

            clearInterval(timer);

        }

        element.textContent=current;

    },20);

}

/*======================================================
CONTADORES DA HOME
======================================================*/

animateCounter("productsCounter",0);

animateCounter("vendorsCounter",0);

animateCounter("customersCounter",0);

animateCounter("ordersCounter",0);

animateCounter("reviewsCounter",0);

animateCounter("categoriesCounter",0);

/*======================================================
VERIFICAÇÃO DOS BOTÕES
======================================================*/

console.log(
"Botões do carrinho:",
cartButtons.length
);

console.log(
"Botões favoritos:",
favoriteButtons.length
);

console.log(
"Newsletter pronta."
);

console.log(
"Premium V4 - Parte 3 carregada."
);

/*======================================================
 ADONAI VANGADIO MARKET
 SCRIPT.JS
 PREMIUM V4
 PARTE 4
 ANIMAÇÕES • OBSERVER • BANNERS
======================================================*/

"use strict";

/*======================================================
ELEMENTOS ANIMADOS
======================================================*/

const animatedSections = document.querySelectorAll(

`
.market-hero,
.market-categories,
.market-featured-products,
.market-products-sections,
.seller-section,
.buy-section,
.market-stats,
.ads-section,
.newsletter-section,
.market-footer
`

);

/*======================================================
INTERSECTION OBSERVER
======================================================*/

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("fade-up");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold:0.15

    });

    animatedSections.forEach((section)=>{

        observer.observe(section);

    });

}

/*======================================================
EFEITO NOS CARDS DAS CATEGORIAS
======================================================*/

const categoryCards=document.querySelectorAll(

".market-category-card"

);

categoryCards.forEach((card)=>{

    card.addEventListener("mouseenter",()=>{

        card.classList.add("active");

    });

    card.addEventListener("mouseleave",()=>{

        card.classList.remove("active");

    });

});

/*======================================================
EFEITO NOS CARDS DE DESTAQUE
======================================================*/

const highlightCards=document.querySelectorAll(

".market-highlight-card"

);

highlightCards.forEach((card)=>{

    card.addEventListener("mouseenter",()=>{

        card.classList.add("active");

    });

    card.addEventListener("mouseleave",()=>{

        card.classList.remove("active");

    });

});

/*======================================================
EFEITO NOS BENEFÍCIOS DO VENDEDOR
======================================================*/

const sellerCards=document.querySelectorAll(

".seller-card"

);

sellerCards.forEach((card)=>{

    card.addEventListener("mouseenter",()=>{

        card.classList.add("active");

    });

    card.addEventListener("mouseleave",()=>{

        card.classList.remove("active");

    });

});

/*======================================================
EFEITO NOS CARDS DAS ESTATÍSTICAS
======================================================*/

const statCards=document.querySelectorAll(

".stat-card"

);

statCards.forEach((card)=>{

    card.addEventListener("mouseenter",()=>{

        card.classList.add("active");

    });

    card.addEventListener("mouseleave",()=>{

        card.classList.remove("active");

    });

});

/*======================================================
EFEITO NOS BANNERS
======================================================*/

const banners=document.querySelectorAll(

".ad-banner"

);

banners.forEach((banner)=>{

    banner.addEventListener("mouseenter",()=>{

        banner.classList.add("active");

    });

    banner.addEventListener("mouseleave",()=>{

        banner.classList.remove("active");

    });

});

/*======================================================
LAZY LOADING (PREPARAÇÃO)
======================================================*/

const lazyImages=document.querySelectorAll(

"img[data-src]"

);

if("IntersectionObserver" in window){

    const imageObserver=new IntersectionObserver((entries)=>{

        entries.forEach((entry)=>{

            if(!entry.isIntersecting) return;

            const image=entry.target;

            image.src=image.dataset.src;

            image.removeAttribute("data-src");

            imageObserver.unobserve(image);

        });

    });

    lazyImages.forEach((image)=>{

        imageObserver.observe(image);

    });

}

/*======================================================
LOG
======================================================*/

console.log(

"Premium V4 - Parte 4 carregada."

);

/*======================================================
NEWSLETTER
======================================================*/

const newsletterForm = document.querySelector(".newsletter-form");
const newsletterEmail = document.getElementById("newsletterEmail");

if (newsletterForm && newsletterEmail) {

    newsletterForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = newsletterEmail.value.trim();

        if (email === "") {

            newsletterEmail.focus();

            return;

        }

        showNotification(
            "Subscrição enviada com sucesso."
        );

        newsletterForm.reset();

    });

}

/*======================================================
BOTÕES "ADICIONAR AO CARRINHO"
======================================================*/

const cartButtons = document.querySelectorAll(".market-cart-button");

cartButtons.forEach((button) => {

    button.addEventListener("click", () => {

        App.cart++;

        updateCounters();

        showNotification("Produto adicionado ao carrinho.");

    });

});

/*======================================================
SCROLL SUAVE
======================================================*/

document.querySelectorAll('a[href^="#"]').forEach((link) => {

    link.addEventListener("click", (event) => {

        const target = document.querySelector(
            link.getAttribute("href")
        );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({

            behavior: "smooth",
            block: "start"

        });

    });

});

/*======================================================
BOTÃO VOLTAR AO TOPO
======================================================*/

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (!backToTop) return;

    if (window.scrollY > 500) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

});

if (backToTop) {

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    });

}

/*======================================================
EFEITO NOS CARDS
======================================================*/

const cards = document.querySelectorAll(

    ".market-product-card,\
     .market-category-card,\
     .seller-card,\
     .stat-card,\
     .market-highlight-card"

);

cards.forEach((card) => {

    card.addEventListener("mouseenter", () => {

        card.classList.add("hover");

    });

    card.addEventListener("mouseleave", () => {

        card.classList.remove("hover");

    });

});

/*======================================================
PRELOAD DAS IMAGENS FUTURAS
======================================================*/

document.querySelectorAll("img").forEach((img) => {

    img.loading = "lazy";

});

/*======================================================
VERIFICAÇÃO FINAL
======================================================*/

window.addEventListener("load", () => {

    console.log("====================================");

    console.log(" ADONAI VANGADIO MARKET ");

    console.log(" PREMIUM V4 ");

    console.log(" HTML ✔");

    console.log(" CSS ✔");

    console.log(" JS ✔");

    console.log(" Sistema iniciado com sucesso.");

    console.log("====================================");

});

/*======================================================
VERSÃO
======================================================*/

const MARKET = {

    version: "Premium V4",

    developer: "Adonai Vangadio",

    status: "Development"

};

console.table(MARKET);




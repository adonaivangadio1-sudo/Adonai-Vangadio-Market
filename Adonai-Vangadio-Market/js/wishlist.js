/*======================================================
AV MARKET
WISHLIST.JS
SISTEMA INTELIGENTE DE FAVORITOS
======================================================*/

"use strict";


/*======================================================
CONFIGURAÇÃO
======================================================*/

const AV_WISHLIST_PREFIX =
    "avMarketWishlist_";


/*======================================================
OBTER UTILIZADOR LOGADO
======================================================*/

function getCurrentUser(){

    try{

        const possibleKeys = [
            "avMarketCurrentUser",
            "avMarketUser",
            "currentUser",
            "loggedUser",
            "avMarketSession",
            "userSession"
        ];


        for(const key of possibleKeys){

            const data =
                localStorage.getItem(key);


            if(!data){
                continue;
            }


            try{

                const parsed =
                    JSON.parse(data);


                if(
                    parsed &&
                    typeof parsed === "object"
                ){

                    return parsed;

                }

            }
            catch(error){

                /*
                 * Caso o sistema guarde
                 * apenas um ID/string.
                 */

                return {
                    id: data
                };

            }

        }

    }
    catch(error){

        console.error(
            "Erro ao verificar utilizador:",
            error
        );

    }


    return null;

}


/*======================================================
VERIFICAR LOGIN
======================================================*/

function isUserLoggedIn(){

    const user =
        getCurrentUser();


    if(!user){
        return false;
    }


    /*
     * Alguns sistemas podem utilizar
     * diferentes propriedades para identificar
     * o utilizador.
     */

    return !!(
        user.id ||
        user.userId ||
        user.uid ||
        user.email ||
        user.username ||
        user.nome ||
        user.name
    );

}


/*======================================================
OBTER IDENTIFICADOR ÚNICO DO UTILIZADOR
======================================================*/

function getUserIdentifier(){

    const user =
        getCurrentUser();


    if(!user){
        return null;
    }


    const identifier =
        user.id ||
        user.userId ||
        user.uid ||
        user.email ||
        user.username ||
        user.telefone ||
        user.phone;


    if(!identifier){
        return null;
    }


    return String(identifier)
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9@._-]/g,
            "_"
        );

}


/*======================================================
TIPO DE CONTA
======================================================*/

function getAccountType(){

    const user =
        getCurrentUser();


    if(!user){
        return null;
    }


    return (
        user.accountType ||
        user.account_type ||
        user.tipo ||
        user.tipoConta ||
        user.userType ||
        user.role ||
        user.perfil ||
        user.type ||
        null
    );

}


/*======================================================
CHAVE INDIVIDUAL DOS FAVORITOS
======================================================*/

function getWishlistKey(){

    const userId =
        getUserIdentifier();


    if(!userId){

        return null;

    }


    return (
        AV_WISHLIST_PREFIX +
        userId
    );

}


/*======================================================
OBTER FAVORITOS
======================================================*/

function getWishlist(){

    /*
     * Visitante não possui favoritos.
     */

    if(!isUserLoggedIn()){

        return [];

    }


    const key =
        getWishlistKey();


    if(!key){

        return [];

    }


    try{

        const data =
            localStorage.getItem(key);


        if(!data){

            return [];

        }


        const wishlist =
            JSON.parse(data);


        if(!Array.isArray(wishlist)){

            return [];

        }


        return wishlist;

    }
    catch(error){

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

function saveWishlist(items){

    if(!isUserLoggedIn()){

        return false;

    }


    const key =
        getWishlistKey();


    if(!key){

        return false;

    }


    try{

        localStorage.setItem(
            key,
            JSON.stringify(items)
        );


        return true;

    }
    catch(error){

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

function redirectToLogin(){

    /*
     * Guarda a página atual para que,
     * depois do login, o sistema possa
     * voltar aos favoritos.
     */

    try{

        sessionStorage.setItem(
            "avMarketLoginReturn",
            window.location.href
        );

    }
    catch(error){

        console.warn(
            "Não foi possível guardar a página de retorno."
        );

    }


    /*
     * Caminho principal do login.
     *
     * Se o teu projeto utilizar outro caminho,
     * podemos alterar apenas esta constante.
     */

    const loginPages = [

        "login.html",
        "../login.html",
        "./login.html"

    ];


    /*
     * Determinar o caminho mais provável
     * conforme a página atual.
     */

    const currentPath =
        window.location.pathname;


    if(
        currentPath.includes("/pages/") ||
        currentPath.includes("/subpages/")
    ){

        window.location.href =
            "../login.html";

    }
    else{

        window.location.href =
            "login.html";

    }

}


/*======================================================
GARANTIR LOGIN
======================================================*/

function requireLogin(){

    if(isUserLoggedIn()){

        return true;

    }


    redirectToLogin();

    return false;

}


/*======================================================
VERIFICAR SE PRODUTO ESTÁ NOS FAVORITOS
======================================================*/

function isFavorite(productId){

    if(!isUserLoggedIn()){

        return false;

    }


    const wishlist =
        getWishlist();


    return wishlist.some(
        product =>
            String(product.id) ===
            String(productId)
    );

}


/*======================================================
ADICIONAR FAVORITO
======================================================*/

function addToWishlist(product){

    /*
     * Visitante precisa fazer login.
     */

    if(!requireLogin()){

        return false;

    }


    if(
        !product ||
        !product.id
    ){

        return false;

    }


    const wishlist =
        getWishlist();


    const exists =
        wishlist.some(
            item =>
                String(item.id) ===
                String(product.id)
        );


    if(exists){

        return true;

    }


    wishlist.push({

        ...product,

        addedAt:
            new Date().toISOString()

    });


    saveWishlist(wishlist);


    updateWishlistPage();


    showWishlistNotification(
        "Produto adicionado aos favoritos."
    );


    return true;

}


/*======================================================
REMOVER FAVORITO
======================================================*/

function removeFromWishlist(productId){

    if(!requireLogin()){

        return false;

    }


    let wishlist =
        getWishlist();


    wishlist =
        wishlist.filter(
            item =>
                String(item.id) !==
                String(productId)
        );


    saveWishlist(wishlist);


    updateWishlistPage();


    showWishlistNotification(
        "Produto removido dos favoritos."
    );


    return true;

}


/*======================================================
LIMPAR TODOS
======================================================*/

function clearWishlist(){

    if(!requireLogin()){

        return false;

    }


    const wishlist =
        getWishlist();


    if(wishlist.length === 0){

        return false;

    }


    const confirmed =
        confirm(
            "Tem a certeza de que deseja remover todos os favoritos?"
        );


    if(!confirmed){

        return false;

    }


    const key =
        getWishlistKey();


    if(key){

        localStorage.removeItem(key);

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

function createWishlistCard(product){

    const card =
        document.createElement("article");


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

function renderWishlist(){

    const container =
        document.getElementById(
            "wishlistProducts"
        );


    const empty =
        document.getElementById(
            "wishlistEmpty"
        );


    if(!container){

        return;

    }


    /*
     * Se não estiver logado,
     * não mostrar favoritos de outra conta.
     */

    if(!isUserLoggedIn()){

        container.innerHTML =
            "";


        if(empty){

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


    if(wishlist.length === 0){

        if(empty){

            empty.classList.add(
                "show"
            );

        }


        return;

    }


    if(empty){

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

function updateWishlistCounters(){

    const total =
        getWishlist().length;


    const totalElement =
        document.getElementById(
            "wishlistTotal"
        );


    if(totalElement){

        totalElement.textContent =
            total;

    }


    const resultText =
        document.getElementById(
            "wishlistResultText"
        );


    if(resultText){

        if(!isUserLoggedIn()){

            resultText.textContent =
                "Inicie sessão para ver os seus favoritos";

        }

        else if(total === 0){

            resultText.textContent =
                "Nenhum produto guardado";

        }

        else if(total === 1){

            resultText.textContent =
                "1 produto guardado";

        }

        else{

            resultText.textContent =
                `${total} produtos guardados`;

        }

    }

}


/*======================================================
ATUALIZAR PÁGINA
======================================================*/

function updateWishlistPage(){

    renderWishlist();

    updateWishlistCounters();

}


/*======================================================
ADICIONAR FAVORITO AO CARRINHO
======================================================*/

function addWishlistProductToCart(productId){

    if(!requireLogin()){

        return;

    }


    const wishlist =
        getWishlist();


    const product =
        wishlist.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if(!product){

        return;

    }


    /*
     * Utiliza o sistema principal do carrinho
     * quando a função estiver disponível.
     */

    if(
        typeof window.addToCart ===
        "function"
    ){

        window.addToCart(
            product
        );


        showWishlistNotification(
            "Produto adicionado ao carrinho."
        );


        return;

    }


    /*
     * Compatibilidade com o carrinho
     * atual baseado na chave "cart".
     */

    let cart = [];


    try{

        const storedCart =
            localStorage.getItem(
                "cart"
            );


        if(storedCart){

            cart =
                JSON.parse(
                    storedCart
                );

        }


        if(!Array.isArray(cart)){

            cart = [];

        }

    }
    catch(error){

        cart = [];

    }


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(product.id)
        );


    if(existing){

        existing.quantity =
            Number(
                existing.quantity || 1
            ) + 1;

    }
    else{

        cart.push({

            ...product,

            quantity: 1

        });

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    showWishlistNotification(
        "Produto adicionado ao carrinho."
    );

}


/*======================================================
NOTIFICAÇÃO
======================================================*/

function showWishlistNotification(message){

    const old =
        document.querySelector(
            ".wishlist-notification"
        );


    if(old){

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
        function(){

            if(notification){

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
    function(event){


        /*==============================================
        REMOVER FAVORITO
        ==============================================*/

        const removeButton =
            event.target.closest(
                "[data-remove]"
            );


        if(removeButton){

            const productId =
                removeButton.dataset.remove;


            removeFromWishlist(
                productId
            );


            return;

        }


        /*==============================================
        ADICIONAR AO CARRINHO
        ==============================================*/

        const cartButton =
            event.target.closest(
                "[data-cart-id]"
            );


        if(cartButton){

            const productId =
                cartButton.dataset.cartId;


            addWishlistProductToCart(
                productId
            );


            return;

        }


        /*==============================================
        LIMPAR FAVORITOS
        ==============================================*/

        const clearButton =
            event.target.closest(
                "#clearWishlist"
            );


        if(clearButton){

            clearWishlist();

        }

    }
);


/*======================================================
INICIALIZAÇÃO
======================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        updateWishlistPage();

    }
);


/*======================================================
ATUALIZAÇÃO AUTOMÁTICA
======================================================*/

window.addEventListener(
    "storage",
    function(event){

        /*
         * Atualiza quando a sessão muda
         * ou quando os favoritos são alterados.
         */

        if(
            event.key === "avMarketCurrentUser" ||
            event.key === "avMarketUser" ||
            event.key === "currentUser" ||
            event.key === "loggedUser" ||
            event.key === "avMarketSession" ||
            event.key === "userSession" ||
            (
                event.key &&
                event.key.startsWith(
                    AV_WISHLIST_PREFIX
                )
            )
        ){

            updateWishlistPage();

        }

    }
);


/*======================================================
API GLOBAL
PARA OUTROS FICHEIROS DO AV MARKET
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
        getAccountType

};


/*======================================================
LOG
======================================================*/

console.log(
    "AV Market — Wishlist inteligente carregado."
);

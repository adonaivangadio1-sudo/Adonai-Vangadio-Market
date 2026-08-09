/* ======================================================
   AV MARKET
   CART.JS
   SISTEMA INTELIGENTE DO CARRINHO
   ====================================================== */

"use strict";


/* ======================================================
   IDENTIDADE DO UTILIZADOR
   ====================================================== */

function getCurrentAVUser(){

    try{

        const savedUser =
            localStorage.getItem(
                "avMarketUser"
            );

        if(!savedUser){

            return null;

        }

        const user =
            JSON.parse(
                savedUser
            );

        if(
            !user ||
            !user.uid
        ){

            return null;

        }

        return user;

    }

    catch(error){

        console.error(
            "AV Market: erro ao obter utilizador.",
            error
        );

        return null;

    }

}


/* ======================================================
   TIPO DE CONTA
   ====================================================== */

function getCurrentAVRole(){

    const user =
        getCurrentAVUser();


    if(!user){

        return "";

    }


    return String(

        user.role ||
        user.tipo ||
        user.accountType ||
        ""

    )
    .trim()
    .toLowerCase();

}


/* ======================================================
   VERIFICAR SE ESTÁ AUTENTICADO
   ====================================================== */

function isAVUserLoggedIn(){

    return !!getCurrentAVUser();

}


/* ======================================================
   CHAVE DO CARRINHO
   ====================================================== */

/*
   Cada utilizador possui um carrinho independente.

   Exemplo:

   avMarketCart_comprador_UID123

   avMarketCart_revendedor_UID456

   Assim:

   - Comprador A não vê o carrinho do Comprador B
   - Comprador não vê o carrinho do Revendedor
   - Revendedor não vê o carrinho de outro Revendedor
   - Logout/login não mistura os dados
*/

function getCartStorageKey(){

    const user =
        getCurrentAVUser();


    if(!user || !user.uid){

        return null;

    }


    const role =
        getCurrentAVRole() ||
        "utilizador";


    return (
        "avMarketCart_" +
        role +
        "_" +
        user.uid
    );

}


/* ======================================================
   CHAVE ANTIGA
   ====================================================== */

const OLD_CART_KEY =
    "cart";


const OLD_AV_CART_KEY =
    "avMarketCart";


/* ======================================================
   OBTER CARRINHO
   ====================================================== */

function getCart(){

    const storageKey =
        getCartStorageKey();


    /*
       Se não houver utilizador autenticado,
       não devolvemos o carrinho de outra pessoa.
    */

    if(!storageKey){

        return [];

    }


    try{

        const savedCart =
            localStorage.getItem(
                storageKey
            );


        if(!savedCart){

            return [];

        }


        const parsed =
            JSON.parse(
                savedCart
            );


        if(!Array.isArray(parsed)){

            return [];

        }


        return parsed;

    }

    catch(error){

        console.error(
            "AV Market: erro ao carregar carrinho.",
            error
        );

        return [];

    }

}


/* ======================================================
   GUARDAR CARRINHO
   ====================================================== */

function saveCart(cart){

    const storageKey =
        getCartStorageKey();


    if(!storageKey){

        console.warn(
            "AV Market: não é possível guardar carrinho sem utilizador autenticado."
        );

        return false;

    }


    try{

        localStorage.setItem(

            storageKey,

            JSON.stringify(
                Array.isArray(cart)
                    ? cart
                    : []
            )

        );


        /*
           Mantemos também uma cópia
           temporária da chave "cart"
           para compatibilidade com páginas
           antigas do sistema.
        */

        localStorage.setItem(

            "cart",

            JSON.stringify(
                Array.isArray(cart)
                    ? cart
                    : []
            )

        );


        return true;

    }

    catch(error){

        console.error(
            "AV Market: erro ao guardar carrinho.",
            error
        );

        return false;

    }

}


/* ======================================================
   MIGRAÇÃO DO CARRINHO ANTIGO
   ====================================================== */

/*
   Se existir um carrinho antigo na chave "cart"
   e o utilizador atual ainda não tiver um carrinho
   próprio, fazemos uma migração única.

   Isto evita perder produtos que já estavam
   guardados antes desta atualização.
*/

function migrateOldCart(){

    const storageKey =
        getCartStorageKey();


    if(!storageKey){

        return;

    }


    try{

        const current =
            localStorage.getItem(
                storageKey
            );


        if(current){

            return;

        }


        let oldCart = null;


        const oldAVCart =
            localStorage.getItem(
                OLD_AV_CART_KEY
            );


        const oldCart =
            localStorage.getItem(
                OLD_CART_KEY
            );


        if(oldAVCart){

            oldCart =
                JSON.parse(
                    oldAVCart
                );

        }

        else if(oldCart){

            oldCart =
                JSON.parse(
                    oldCart
                );

        }


        if(
            !Array.isArray(
                oldCart
            )
        ){

            return;

        }


        if(oldCart.length === 0){

            return;

        }


        localStorage.setItem(

            storageKey,

            JSON.stringify(
                oldCart
            )

        );


        console.log(
            "AV Market: carrinho antigo migrado para a conta atual."
        );

    }

    catch(error){

        console.error(
            "AV Market: erro na migração do carrinho.",
            error
        );

    }

}


/* ======================================================
   VERIFICAR ACESSO AO CARRINHO
   ====================================================== */

function requireCartLogin(){

    if(
        isAVUserLoggedIn()
    ){

        return true;

    }


    window.location.href =
        "pages/login.html";


    return false;

}


/* ======================================================
   VERIFICAR SE É COMPRADOR
   ====================================================== */

function isBuyerAccount(){

    const role =
        getCurrentAVRole();


    return (

        role === "comprador" ||
        role === "buyer"

    );

}


/* ======================================================
   VERIFICAR ACESSO DO COMPRADOR
   ====================================================== */

function requireBuyerCartAccess(){

    const user =
        getCurrentAVUser();


    if(!user){

        window.location.href =
            "pages/login.html";

        return false;

    }


    const role =
        getCurrentAVRole();


    /*
       Se for comprador, acesso normal.
    */

    if(
        role === "comprador" ||
        role === "buyer"
    ){

        return true;

    }


    /*
       Se for revendedor/vendedor,
       não misturamos o carrinho do vendedor
       com o do comprador.

       O vendedor é encaminhado para
       o seu perfil/painel.
    */

    if(
        role === "revendedor" ||
        role === "vendedor" ||
        role === "seller"
    ){

        window.location.href =
            "pages/perfil-revendedor.html";

        return false;

    }


    /*
       Administrador.
    */

    if(
        role === "admin" ||
        role === "administrador"
    ){

        window.location.href =
            "pages/administrador/dashboard.html";

        return false;

    }


    return true;

}


/* ======================================================
   NORMALIZAR PRODUTO
   ====================================================== */

function normalizeCartProduct(product){

    if(
        !product ||
        !product.id
    ){

        return null;

    }


    const normalized = {

        ...product,

        id:
            String(
                product.id
            ),

        quantity:
            Number(
                product.quantity ??
                product.quantidade ??
                1
            ) > 0

                ?

                Number(
                    product.quantity ??
                    product.quantidade ??
                    1
                )

                :

                1

    };


    normalized.quantidade =
        normalized.quantity;


    return normalized;

}


/* ======================================================
   ADICIONAR AO CARRINHO
   ====================================================== */

function addToCart(product){

    /*
       Primeiro verificamos a autenticação.
    */

    if(
        !requireBuyerCartAccess()
    ){

        return false;

    }


    const normalized =
        normalizeCartProduct(
            product
        );


    if(!normalized){

        console.warn(
            "AV Market: produto inválido."
        );

        return false;

    }


    migrateOldCart();


    const cart =
        getCart();


    const existingIndex =
        cart.findIndex(
            item =>
                String(item.id) ===
                String(normalized.id)
        );


    if(existingIndex !== -1){

        const currentQuantity =
            Number(
                cart[existingIndex].quantity ||
                cart[existingIndex].quantidade ||
                1
            );


        cart[existingIndex].quantity =
            currentQuantity + 1;


        cart[existingIndex].quantidade =
            currentQuantity + 1;

    }

    else{

        cart.push(
            normalized
        );

    }


    saveCart(
        cart
    );


    /*
       Evento interno para atualizar
       componentes da página imediatamente.
    */

    window.dispatchEvent(
        new CustomEvent(
            "avMarketCartUpdated",
            {
                detail:{
                    cart:cart
                }
            }
        )
    );


    return true;

}


/* ======================================================
   REMOVER DO CARRINHO
   ====================================================== */

function removeFromCart(productId){

    if(
        !requireBuyerCartAccess()
    ){

        return false;

    }


    let cart =
        getCart();


    cart =
        cart.filter(
            product =>
                String(product.id) !==
                String(productId)
        );


    saveCart(
        cart
    );


    window.dispatchEvent(
        new CustomEvent(
            "avMarketCartUpdated",
            {
                detail:{
                    cart:cart
                }
            }
        )
    );


    return true;

}


/* ======================================================
   ALTERAR QUANTIDADE
   ====================================================== */

function updateCartQuantity(
    productId,
    quantity
){

    if(
        !requireBuyerCartAccess()
    ){

        return false;

    }


    let cart =
        getCart();


    const index =
        cart.findIndex(
            product =>
                String(product.id) ===
                String(productId)
        );


    if(index === -1){

        return false;

    }


    const newQuantity =
        Number(
            quantity
        );


    if(
        !Number.isFinite(
            newQuantity
        ) ||
        newQuantity <= 0
    ){

        cart.splice(
            index,
            1
        );

    }

    else{

        cart[index].quantity =
            newQuantity;

        cart[index].quantidade =
            newQuantity;

    }


    saveCart(
        cart
    );


    window.dispatchEvent(
        new CustomEvent(
            "avMarketCartUpdated",
            {
                detail:{
                    cart:cart
                }
            }
        )
    );


    return true;

}


/* ======================================================
   LIMPAR CARRINHO
   ====================================================== */

function clearCart(){

    if(
        !requireBuyerCartAccess()
    ){

        return false;

    }


    const storageKey =
        getCartStorageKey();


    if(!storageKey){

        return false;

    }


    localStorage.removeItem(
        storageKey
    );


    /*
       Limpa também a chave antiga
       para evitar reaproveitamento
       indevido.
    */

    localStorage.removeItem(
        OLD_CART_KEY
    );


    localStorage.removeItem(
        OLD_AV_CART_KEY
    );


    window.dispatchEvent(
        new CustomEvent(
            "avMarketCartUpdated",
            {
                detail:{
                    cart:[]
                }
            }
        )
    );


    return true;

}


/* ======================================================
   CONTAR PRODUTOS
   ====================================================== */

function getCartItemCount(){

    const cart =
        getCart();


    return cart.reduce(
        function(total,product){

            return total +

                Number(
                    product.quantity ??
                    product.quantidade ??
                    1
                );

        },
        0
    );

}


/* ======================================================
   CALCULAR SUBTOTAL
   ====================================================== */

function getCartSubtotal(){

    const cart =
        getCart();


    return cart.reduce(
        function(total,product){

            const price =
                Number(

                    product.price ??
                    product.preco ??
                    product.valor ??
                    0

                );


            const quantity =
                Number(

                    product.quantity ??
                    product.quantidade ??
                    1

                );


            return total +
                (
                    price *
                    quantity
                );

        },
        0
    );

}


/* ======================================================
   ATUALIZAR CARRINHO VISUAL
   ====================================================== */

function refreshCartUI(){

    /*
       Se existir uma função renderCart()
       pertencente à página do carrinho,
       atualizamos automaticamente.
    */

    if(
        typeof window.renderCart ===
        "function"
    ){

        window.renderCart();

    }


    /*
       Atualizar possíveis contadores
       presentes no cabeçalho/rodapé.
    */

    const count =
        getCartItemCount();


    const counters =
        document.querySelectorAll(
            "[data-cart-count]"
        );


    counters.forEach(
        element => {

            element.textContent =
                count;

        }
    );


    const cartCounters =
        document.querySelectorAll(
            ".cart-count, .cart-badge"
        );


    cartCounters.forEach(
        element => {

            element.textContent =
                count;

            element.hidden =
                count <= 0;

        }
    );

}


/* ======================================================
   EVENTO DE ATUALIZAÇÃO
   ====================================================== */

window.addEventListener(
    "avMarketCartUpdated",
    function(){

        refreshCartUI();

    }
);


/* ======================================================
   STORAGE
====================================================== */

window.addEventListener(
    "storage",
    function(event){

        const currentKey =
            getCartStorageKey();


        if(
            event.key ===
            currentKey
        ){

            refreshCartUI();

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
           Só fazemos migração se houver
           utilizador autenticado.
        */

        if(
            isAVUserLoggedIn()
        ){

            migrateOldCart();

        }


        refreshCartUI();


        console.log(
            "AV Market — Cart.js inteligente carregado."
        );

    }
);


/* ======================================================
   API GLOBAL
   OUTROS FICHEIROS DO AV MARKET
   ====================================================== */

window.AVCart = {

    get:
        getCart,

    add:
        addToCart,

    remove:
        removeFromCart,

    updateQuantity:
        updateCartQuantity,

    clear:
        clearCart,

    count:
        getCartItemCount,

    subtotal:
        getCartSubtotal,

    isLoggedIn:
        isAVUserLoggedIn,

    isBuyer:
        isBuyerAccount,

    requireLogin:
        requireCartLogin,

    requireBuyer:
        requireBuyerCartAccess,

    getStorageKey:
        getCartStorageKey

};


/* ======================================================
   COMPATIBILIDADE GLOBAL
   ====================================================== */

window.getCart =
    getCart;


window.addToCart =
    addToCart;


window.saveCart =
    saveCart;


window.removeFromCart =
    removeFromCart;


window.updateCartQuantity =
    updateCartQuantity;


window.clearCart =
    clearCart;


/* ======================================================
   FIM DO CART.JS
   ====================================================== */

/*======================================================
 AV MARKET — CHECKOUT
 NAVEGAÇÃO DE PAGAMENTO SIMPLIFICADA
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

import {
    getFunctions,
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-functions.js";

/*======================================================
 CLOUD FUNCTIONS
======================================================*/

const functions =
    getFunctions(
        undefined,
        "europe-west1"
    );

const createOrderFunction =
    httpsCallable(
        functions,
        "createOrder"
    );

/*======================================================
 ELEMENTOS
======================================================*/

const checkoutContent =
    document.getElementById("checkoutContent");

const checkoutAuthMessage =
    document.getElementById("checkoutAuthMessage");

const checkoutCustomerName =
    document.getElementById("checkoutCustomerName");

const checkoutCustomerEmail =
    document.getElementById("checkoutCustomerEmail");

const checkoutCustomerPhone =
    document.getElementById("checkoutCustomerPhone");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutDelivery =
    document.getElementById("checkoutDelivery");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const processingModal =
    document.getElementById("checkoutProcessing");

const resultModal =
    document.getElementById("checkoutResult");

const resultTitle =
    document.getElementById("checkoutResultTitle");

const resultMessage =
    document.getElementById("checkoutResultMessage");

const orderNumber =
    document.getElementById("checkoutOrderNumber");

/*======================================================
 ESTADO
======================================================*/

let currentUser = null;

let currentProfile = null;

let currentCart = [];

let checkoutReady = false;

/*======================================================
 UTILITÁRIOS
======================================================*/

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function formatCurrency(value) {

    const number =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "pt-PT"
    ).format(number) + " Kz";

}

function getUserCartKey(uid) {

    if (!uid) {

        return null;

    }

    return `avMarketCart_${uid}`;

}

/*======================================================
 CARRINHO
======================================================*/

function getUserCart(uid) {

    const key =
        getUserCartKey(uid);

    if (!key) {

        return [];

    }

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {

            return [];

        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch(error) {

        console.error(
            "AV Market: erro ao carregar carrinho.",
            error
        );

        return [];

    }

}

/*======================================================
 UTILIZADOR NÃO AUTENTICADO
======================================================*/

function showLoggedOut() {

    checkoutReady =
        false;

    currentUser =
        null;

    currentProfile =
        null;

    currentCart =
        [];

    if (checkoutContent) {

        checkoutContent.style.display =
            "none";

    }

    if (checkoutAuthMessage) {

        checkoutAuthMessage.classList.add(
            "show"
        );

    }

    if (placeOrderButton) {

        placeOrderButton.disabled =
            true;

    }

}

/*======================================================
 UTILIZADOR AUTENTICADO
======================================================*/

function showLoggedIn(profile) {

    currentProfile =
        profile;

    if (checkoutAuthMessage) {

        checkoutAuthMessage.classList.remove(
            "show"
        );

    }

    if (checkoutContent) {

        checkoutContent.style.display =
            "grid";

    }

    fillCustomerData(
        profile
    );

    currentCart =
        getUserCart(
            profile.uid
        );

    renderCart();

}

/*======================================================
 DADOS DO CLIENTE
======================================================*/

function fillCustomerData(profile) {

    const name =
        profile.name ||
        profile.nome ||
        profile.nomeCompleto ||
        "Utilizador";

    const email =
        profile.email ||
        currentUser?.email ||
        "—";

    const phone =
        profile.phone ||
        profile.telefone ||
        "";

    if (checkoutCustomerName) {

        checkoutCustomerName.textContent =
            name;

    }

    if (checkoutCustomerEmail) {

        checkoutCustomerEmail.textContent =
            email;

    }

    if (checkoutCustomerPhone) {

        checkoutCustomerPhone.textContent =
            phone || "—";

    }

    const deliveryName =
        document.getElementById(
            "deliveryName"
        );

    const deliveryPhone =
        document.getElementById(
            "deliveryPhone"
        );

    if (
        deliveryName &&
        !deliveryName.value
    ) {

        deliveryName.value =
            name;

    }

    if (
        deliveryPhone &&
        !deliveryPhone.value
    ) {

        deliveryPhone.value =
            phone;

    }

}

/*======================================================
 RENDERIZAR CARRINHO
======================================================*/

function renderCart() {

    if (!checkoutItems) {

        return;

    }

    checkoutItems.innerHTML =
        "";

    if (!currentCart.length) {

        checkoutItems.innerHTML = `

            <div class="checkout-item-empty">

                <i class="fa-solid fa-cart-shopping"></i>

                <span>
                    O seu carrinho está vazio.
                </span>

            </div>

        `;

        updateTotals(0);

        if (placeOrderButton) {

            placeOrderButton.disabled =
                true;

        }

        return;

    }

    let subtotal =
        0;

    currentCart.forEach(
        function(item) {

            const quantity =
                Number(
                    item.quantity ||
                    item.qty ||
                    1
                );

            const price =
                Number(
                    item.price ||
                    item.preco ||
                    0
                );

            const total =
                price * quantity;

            subtotal +=
                total;

            const name =
                item.name ||
                item.nome ||
                item.title ||
                "Produto";

            const image =
                item.image ||
                item.imagem ||
                item.photo ||
                "";

            checkoutItems.insertAdjacentHTML(
                "beforeend",
                `

                <div class="checkout-item">

                    <div class="checkout-item-image">

                        ${
                            image
                            ?
                            `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}">
                            `
                            :
                            `
                            <i class="fa-solid fa-image"></i>
                            `
                        }

                    </div>

                    <div class="checkout-item-info">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <span>
                            Quantidade: ${quantity}
                        </span>

                    </div>

                    <strong class="checkout-item-price">
                        ${formatCurrency(total)}
                    </strong>

                </div>

                `
            );

        }
    );

    updateTotals(
        subtotal
    );

    validateCheckout();

}

/*======================================================
 TOTAIS
======================================================*/

function updateTotals(subtotal) {

    const delivery =
        0;

    const total =
        subtotal +
        delivery;

    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatCurrency(subtotal);

    }

    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            delivery === 0
                ? "A calcular"
                : formatCurrency(delivery);

    }

    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatCurrency(total);

    }

    return total;

}

/*======================================================
 PAGAMENTO
======================================================

 O checkout NÃO escolhe o método de pagamento.

 Existe apenas um botão HTML:

 pagamento.html

 A página pagamento.html será responsável por
 apresentar todos os métodos e respetivos dados.

 Não adicionamos nenhum evento JavaScript
 ao botão de pagamento.
======================================================*/

/*======================================================
 VALIDAÇÃO
======================================================*/

function validateCheckout() {

    if (!placeOrderButton) {

        return;

    }

    const deliveryName =
        document.getElementById(
            "deliveryName"
        )?.value.trim();

    const deliveryPhone =
        document.getElementById(
            "deliveryPhone"
        )?.value.trim();

    const deliveryAddress =
        document.getElementById(
            "deliveryAddress"
        )?.value.trim();

    const valid =

        Boolean(currentUser) &&

        currentCart.length > 0 &&

        Boolean(deliveryName) &&

        Boolean(deliveryPhone) &&

        Boolean(deliveryAddress);

    placeOrderButton.disabled =
        !valid;

    checkoutReady =
        valid;

}

/*======================================================
 EVENTOS DO FORMULÁRIO
======================================================*/

document
    .querySelectorAll(
        "#checkoutContent input, #checkoutContent textarea"
    )
    .forEach(
        function(field) {

            field.addEventListener(
                "input",
                validateCheckout
            );

        }
    );

/*======================================================
 CRIAR PEDIDO
======================================================*/

async function createOrder() {

    if (!checkoutReady) {

        return;

    }

    if (!currentUser) {

        return;

    }

    showProcessing();

    try {

        const deliveryName =
            document
                .getElementById(
                    "deliveryName"
                )
                ?.value
                .trim();

        const deliveryPhone =
            document
                .getElementById(
                    "deliveryPhone"
                )
                ?.value
                .trim();

        const deliveryAddress =
            document
                .getElementById(
                    "deliveryAddress"
                )
                ?.value
                .trim();

        const subtotal =
            currentCart.reduce(
                function(total, item) {

                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );

                    const price =
                        Number(
                            item.price ||
                            item.preco ||
                            0
                        );

                    return total +
                        price * quantity;

                },
                0
            );

        const response =
            await createOrderFunction({

                items:
                    currentCart.map(
                        function(item) {

                            return {

                                productId:
                                    item.productId ||
                                    item.id ||
                                    item.uid,

                                name:
                                    item.name ||
                                    item.nome ||
                                    item.title ||
                                    "",

                                image:
                                    item.image ||
                                    item.imagem ||
                                    item.photo ||
                                    "",

                                quantity:
                                    Number(
                                        item.quantity ||
                                        item.qty ||
                                        1
                                    )

                            };

                        }
                    ),

                paymentMethod:
                    "pending",

                total:
                    subtotal,

                customer: {

                    name:
                        deliveryName,

                    phone:
                        deliveryPhone,

                    address:
                        deliveryAddress

                }

            });

        const result =
            response.data;

        hideProcessing();

        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                "Resposta inválida do servidor."
            );

        }

        showResult(
            "Pedido criado com sucesso",
            "O seu pedido foi registado. Guarde o número do recibo para acompanhar a encomenda."
        );

        if (orderNumber) {

            orderNumber.textContent =
                result.receiptNumber ||
                result.orderNumber ||
                result.orderId;

        }

        const cartKey =
            getUserCartKey(
                currentUser.uid
            );

        if (cartKey) {

            localStorage.removeItem(
                cartKey
            );

        }

        currentCart =
            [];

        checkoutReady =
            false;

        if (placeOrderButton) {

            placeOrderButton.disabled =
                true;

        }

    }

    catch(error) {

        console.error(
            "AV Market: erro ao criar pedido.",
            error
        );

        hideProcessing();

        let message =
            "Não foi possível criar o pedido. Tente novamente.";

        if (
            error?.code ===
            "functions/unauthenticated"
        ) {

            message =
                "A sua sessão terminou. Entre novamente na sua conta.";

        }

        if (
            error?.code ===
            "functions/invalid-argument"
        ) {

            message =
                error.message ||
                "Os dados do checkout são inválidos.";

        }

        showResult(
            "Não foi possível continuar",
            message
        );

    }

}

/*======================================================
 PROCESSAMENTO
======================================================*/

function showProcessing() {

    if (processingModal) {

        processingModal.classList.add(
            "show"
        );

    }

}

function hideProcessing() {

    if (processingModal) {

        processingModal.classList.remove(
            "show"
        );

    }

}

/*======================================================
 RESULTADO
======================================================*/

function showResult(
    title,
    message
) {

    if (resultTitle) {

        resultTitle.textContent =
            title;

    }

    if (resultMessage) {

        resultMessage.textContent =
            message;

    }

    if (
        orderNumber &&
        !orderNumber.textContent.trim()
    ) {

        orderNumber.textContent =
            "—";

    }

    if (resultModal) {

        resultModal.classList.add(
            "show"
        );

    }

}

/*======================================================
 BOTÃO FINALIZAR
======================================================*/

if (placeOrderButton) {

    placeOrderButton.addEventListener(
        "click",
        createOrder
    );

}

/*======================================================
 FIREBASE AUTH
======================================================*/

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            showLoggedOut();

            return;

        }

        currentUser =
            user;

        const profile = {

            uid:
                user.uid,

            email:
                user.email || "",

            name:
                user.displayName || "",

            phone:
                user.phoneNumber || ""

        };

        showLoggedIn(
            profile
        );

    }
);

/*======================================================
 INICIALIZAÇÃO
======================================================*/

console.log(
    "AV Market — checkout carregado."
);

console.log(
    "AV Market — pagamento disponível através de pagamento.html."
);

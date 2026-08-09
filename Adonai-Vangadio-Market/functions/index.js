/* ============================================================
   AV MARKET
   CLOUD FUNCTIONS
   SISTEMA SEGURO DE PEDIDOS / CHECKOUT
============================================================ */

"use strict";


/* ============================================================
   FIREBASE ADMIN
============================================================ */

const {
    initializeApp
} = require("firebase-admin/app");


const {
    getFirestore,
    FieldValue
} = require("firebase-admin/firestore");


const {
    onCall,
    HttpsError
} = require("firebase-functions/v2/https");


const {
    defineSecret
} = require("firebase-functions/params");


/* ============================================================
   FIREBASE
============================================================ */

initializeApp();

const db = getFirestore();


/* ============================================================
   DADOS DE PAGAMENTO
   FICAM EXCLUSIVAMENTE NO BACKEND
============================================================ */

const MULTICAIXA_EXPRESS =
    defineSecret("MULTICAIXA_EXPRESS");


const IBAN =
    defineSecret("IBAN");


const PAYPAL_EMAIL =
    defineSecret("PAYPAL_EMAIL");


const PAYPAY_NUMBER =
    defineSecret("PAYPAY_NUMBER");


/* ============================================================
   CONFIGURAÇÃO
============================================================ */

const FUNCTION_OPTIONS = {

    region: "europe-west1",

    secrets: [
        MULTICAIXA_EXPRESS,
        IBAN,
        PAYPAL_EMAIL,
        PAYPAY_NUMBER
    ]

};


/* ============================================================
   GERAR NÚMERO ÚNICO DO PEDIDO
============================================================ */

function generateOrderNumber() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `AVM-${year}${month}${day}-${random}`;

}


/* ============================================================
   NORMALIZAR MÉTODO DE PAGAMENTO
============================================================ */

function normalizePaymentMethod(method) {

    const value =
        String(method || "")
            .trim()
            .toLowerCase();

    const methods = {

        multicaixa:
            "multicaixa_express",

        multicaixa_express:
            "multicaixa_express",

        express:
            "multicaixa_express",

        iban:
            "iban",

        paypal:
            "paypal",

        paypay:
            "paypay"

    };

    return methods[value] || null;

}


/* ============================================================
   VALIDAR PRODUTOS RECEBIDOS
============================================================ */

function validateItems(items) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        throw new HttpsError(
            "invalid-argument",
            "O carrinho está vazio."
        );

    }


    if (items.length > 100) {

        throw new HttpsError(
            "invalid-argument",
            "Quantidade de produtos inválida."
        );

    }


    return items.map(function(item) {

        if (
            !item ||
            !item.productId
        ) {

            throw new HttpsError(
                "invalid-argument",
                "Produto inválido."
            );

        }


        const quantity =
            Number(item.quantity);


        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 999
        ) {

            throw new HttpsError(
                "invalid-argument",
                "Quantidade inválida."
            );

        }


        return {

            productId:
                String(item.productId),

            name:
                String(item.name || "")
                    .substring(0, 200),

            image:
                String(item.image || "")
                    .substring(0, 500),

            quantity:
                quantity

        };

    });

}


/* ============================================================
   CRIAR PEDIDO
============================================================ */

exports.createOrder =
    onCall(
        FUNCTION_OPTIONS,
        async function(request) {

            /* ==================================================
               AUTENTICAÇÃO
            ================================================== */

            if (!request.auth) {

                throw new HttpsError(
                    "unauthenticated",
                    "É necessário iniciar sessão."
                );

            }


            const uid =
                request.auth.uid;


            /* ==================================================
               DADOS
            ================================================== */

            const data =
                request.data || {};


            const items =
                validateItems(
                    data.items
                );


            const paymentMethod =
                normalizePaymentMethod(
                    data.paymentMethod
                );


            if (!paymentMethod) {

                throw new HttpsError(
                    "invalid-argument",
                    "Método de pagamento inválido."
                );

            }


            /* ==================================================
               CLIENTE
            ================================================== */

            const customer =
                data.customer || {};


            const customerName =
                String(
                    customer.name || ""
                )
                    .trim()
                    .substring(0, 150);


            const customerPhone =
                String(
                    customer.phone || ""
                )
                    .trim()
                    .substring(0, 50);


            const customerAddress =
                String(
                    customer.address || ""
                )
                    .trim()
                    .substring(0, 500);


            if (
                !customerName ||
                !customerPhone ||
                !customerAddress
            ) {

                throw new HttpsError(
                    "invalid-argument",
                    "Preencha os dados de entrega."
                );

            }


            /* ==================================================
               TOTAL RECEBIDO DO CLIENTE
               
               NOTA:
               O cálculo definitivo deverá consultar
               os produtos reais no Firestore.
            ================================================== */

            const clientTotal =
                Number(data.total);


            if (
                !Number.isFinite(clientTotal) ||
                clientTotal < 0
            ) {

                throw new HttpsError(
                    "invalid-argument",
                    "Valor total inválido."
                );

            }


            /* ==================================================
               NÚMERO DO PEDIDO / RECIBO
            ================================================== */

            const orderNumber =
                generateOrderNumber();


            const orderRef =
                db
                    .collection("orders")
                    .doc();


            /* ==================================================
               PAGAMENTO
            ================================================== */

            const payment = {

                method:
                    paymentMethod,

                status:
                    "pendente",

                submitted:
                    false,

                createdAt:
                    FieldValue.serverTimestamp()

            };


            /* ==================================================
               PEDIDO
            ================================================== */

            const order = {

                orderId:
                    orderRef.id,

                orderNumber:
                    orderNumber,

                receiptNumber:
                    orderNumber,

                userId:
                    uid,

                customer: {

                    name:
                        customerName,

                    phone:
                        customerPhone,

                    address:
                        customerAddress

                },

                items:
                    items,

                total:
                    clientTotal,

                currency:
                    "AOA",

                payment:
                    payment,

                status:
                    "pagamento_pendente",

                statusHistory: [

                    {

                        status:
                            "pagamento_pendente",

                        timestamp:
                            new Date().toISOString()

                    }

                ],

                createdAt:
                    FieldValue.serverTimestamp(),

                updatedAt:
                    FieldValue.serverTimestamp()

            };


            /* ==================================================
               GUARDAR PEDIDO
            ================================================== */

            await orderRef.set(order);


            /* ==================================================
               ÍNDICE DO UTILIZADOR
            ================================================== */

            await db
                .collection("users")
                .doc(uid)
                .collection("orders")
                .doc(orderRef.id)
                .set({

                    orderId:
                        orderRef.id,

                    orderNumber:
                        orderNumber,

                    total:
                        clientTotal,

                    currency:
                        "AOA",

                    status:
                        "pagamento_pendente",

                    createdAt:
                        FieldValue.serverTimestamp()

                });


            /* ==================================================
               RESPOSTA
            ================================================== */

            return {

                success:
                    true,

                orderId:
                    orderRef.id,

                orderNumber:
                    orderNumber,

                receiptNumber:
                    orderNumber,

                status:
                    "pagamento_pendente"

            };

        }
    );

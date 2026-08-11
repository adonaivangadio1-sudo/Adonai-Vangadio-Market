/* ======================================================
   AV MARKET
   CRIAR CONTA — COMPRADOR
   FIREBASE AUTH + FIRESTORE
   SISTEMA CENTRAL DE REGISTO
====================================================== */

"use strict";


/* ======================================================
   IMPORTAÇÕES
====================================================== */

import {
    auth,
    db,
    saveLocalSession,
    clearLocalSession
} from "./auth.js";


import {
    createUserWithEmailAndPassword,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ======================================================
   ELEMENTOS
====================================================== */

const form =
    document.getElementById(
        "buyerRegisterForm"
    );


const nameInput =
    document.getElementById(
        "buyerName"
    );


const emailInput =
    document.getElementById(
        "buyerEmail"
    );


const phoneInput =
    document.getElementById(
        "buyerPhone"
    );


const passwordInput =
    document.getElementById(
        "buyerPassword"
    );


const confirmPasswordInput =
    document.getElementById(
        "buyerConfirmPassword"
    );


const termsInput =
    document.getElementById(
        "buyerTerms"
    );


const createButton =
    document.getElementById(
        "buyerCreateButton"
    );


const messageBox =
    document.getElementById(
        "buyerRegisterMessage"
    );


/* ======================================================
   MENSAGENS
====================================================== */

function showMessage(
    message,
    type = "error"
) {

    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    messageBox.classList.remove(
        "success",
        "error"
    );


    messageBox.classList.add(
        type
    );


    messageBox.style.display =
        "block";

}


function clearMessage() {

    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        "";


    messageBox.classList.remove(
        "success",
        "error"
    );


    messageBox.style.display =
        "none";

}


/* ======================================================
   MOSTRAR / OCULTAR PASSWORD
====================================================== */

function setupPasswordToggle(
    input,
    button
) {

    if (
        !input ||
        !button
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            const showing =
                input.type ===
                "password";


            input.type =
                showing
                    ? "text"
                    : "password";


            const icon =
                button.querySelector(
                    "i"
                );


            if (icon) {

                icon.className =
                    showing
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye";

            }


            button.setAttribute(
                "aria-pressed",
                showing
                    ? "true"
                    : "false"
            );


            button.setAttribute(
                "aria-label",
                showing
                    ? "Ocultar palavra-passe"
                    : "Mostrar palavra-passe"
            );

        }
    );

}


setupPasswordToggle(
    passwordInput,
    document.getElementById(
        "buyerToggle"
    )
);


setupPasswordToggle(
    confirmPasswordInput,
    document.getElementById(
        "buyerConfirmToggle"
    )
);


/* ======================================================
   LOADING
====================================================== */

function setLoading(
    loading
) {

    if (!createButton) {
        return;
    }


    createButton.disabled =
        loading;


    createButton.setAttribute(
        "aria-busy",
        loading
            ? "true"
            : "false"
    );


    if (loading) {

        createButton.innerHTML =
            '<span>A criar conta...</span>' +
            '<i class="fa-solid fa-spinner fa-spin"></i>';

    }

    else {

        createButton.innerHTML =
            '<span>Criar conta</span>' +
            '<i class="fa-solid fa-arrow-right"></i>';

    }

}


/* ======================================================
   ERROS FIREBASE
====================================================== */

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return (
            "Não foi possível criar a conta. " +
            "Tente novamente."
        );

    }


    switch (
        error.code
    ) {

        case "auth/email-already-in-use":

            return (
                "Este e-mail já está registado. " +
                "Entre na sua conta."
            );


        case "auth/invalid-email":

            return (
                "O e-mail introduzido não é válido."
            );


        case "auth/weak-password":

            return (
                "A palavra-passe é demasiado fraca."
            );


        case "auth/network-request-failed":

            return (
                "Erro de ligação. " +
                "Verifique a sua internet."
            );


        case "auth/operation-not-allowed":

            return (
                "A criação de contas por e-mail " +
                "ainda não está ativada no Firebase."
            );


        case "auth/password-does-not-meet-requirements":

            return (
                "A palavra-passe não cumpre os " +
                "requisitos definidos no Firebase."
            );


        case "auth/too-many-requests":

            return (
                "Foram feitas muitas tentativas. " +
                "Tente novamente mais tarde."
            );


        default:

            console.error(
                "AV Market Firebase:",
                error
            );


            return (
                "Não foi possível criar a conta. " +
                "Tente novamente."
            );

    }

}


/* ======================================================
   CRIAR PERFIL DO COMPRADOR
====================================================== */

async function createBuyerProfile(
    user,
    name,
    email,
    phone
) {

    const userReference =
        doc(
            db,
            "users",
            user.uid
        );


    await setDoc(
        userReference,
        {

            uid:
                user.uid,

            name:
                name,

            email:
                email,

            phone:
                phone,

            role:
                "comprador",

            accountType:
                "comprador",

            status:
                "active",

            profileComplete:
                true,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        }
    );

}


/* ======================================================
   CRIAR SESSÃO CENTRAL
====================================================== */

function createBuyerSession(
    user,
    name,
    email,
    phone
) {

    const profile = {

        uid:
            user.uid,

        name:
            name,

        email:
            email,

        phone:
            phone,

        role:
            "comprador",

        accountType:
            "comprador",

        photoURL:
            user.photoURL ||
            ""

    };


    return saveLocalSession(
        user,
        profile
    );

}


/* ======================================================
   EVITAR DUPLO SUBMIT
====================================================== */

let registrationInProgress =
    false;


/* ======================================================
   FORMULÁRIO
====================================================== */

if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /*
             * Impedir dois cliques seguidos.
             */

            if (
                registrationInProgress
            ) {

                return;

            }


            clearMessage();


            /* ==========================================
               RECOLHER DADOS
            ========================================== */

            const name =
                nameInput?.value
                    .trim() ||
                "";


            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const phone =
                phoneInput?.value
                    .trim() ||
                "";


            const password =
                passwordInput?.value ||
                "";


            const confirmPassword =
                confirmPasswordInput?.value ||
                "";


            /* ==========================================
               VALIDAR NOME
            ========================================== */

            if (!name) {

                showMessage(
                    "Introduza o seu nome completo."
                );


                nameInput?.focus();


                return;

            }


            /* ==========================================
               VALIDAR E-MAIL
            ========================================== */

            if (!email) {

                showMessage(
                    "Introduza o seu e-mail."
                );


                emailInput?.focus();


                return;

            }


            /* ==========================================
               VALIDAR TELEFONE
            ========================================== */

            if (!phone) {

                showMessage(
                    "Introduza o seu telefone ou WhatsApp."
                );


                phoneInput?.focus();


                return;

            }


            /* ==========================================
               VALIDAR PASSWORD
            ========================================== */

            if (
                password.length <
                6
            ) {

                showMessage(
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );


                passwordInput?.focus();


                return;

            }


            /* ==========================================
               CONFIRMAR PASSWORD
            ========================================== */

            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "As palavras-passe não coincidem."
                );


                confirmPasswordInput?.focus();


                return;

            }


            /* ==========================================
               TERMOS
            ========================================== */

            if (
                termsInput &&
                !termsInput.checked
            ) {

                showMessage(
                    "Aceite os termos de utilização para continuar."
                );


                return;

            }


            /* ==========================================
               INICIAR
            ========================================== */

            registrationInProgress =
                true;


            setLoading(
                true
            );


            let createdUser =
                null;


            try {

                /* ======================================
                   LIMPAR SESSÃO LOCAL ANTERIOR
                ====================================== */

                clearLocalSession();


                /* ======================================
                   DEFINIR PERSISTÊNCIA
                ====================================== */

                await setPersistence(
                    auth,
                    browserLocalPersistence
                );


                /* ======================================
                   CRIAR CONTA FIREBASE AUTH
                ====================================== */

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                createdUser =
                    credential.user;


                if (!createdUser) {

                    throw new Error(
                        "UTILIZADOR_NAO_CRIADO"
                    );

                }


                console.log(
                    "AV Market: comprador criado no Authentication:",
                    createdUser.uid
                );


                /* ======================================
                   ATUALIZAR NOME NO AUTH
                ====================================== */

                await updateProfile(
                    createdUser,
                    {
                        displayName:
                            name
                    }
                );


                /* ======================================
                   CRIAR PERFIL NO FIRESTORE
                ====================================== */

                await createBuyerProfile(
                    createdUser,
                    name,
                    email,
                    phone
                );


                console.log(
                    "AV Market: perfil comprador criado:",
                    createdUser.uid
                );


                /* ======================================
                   CRIAR SESSÃO CENTRAL
                ====================================== */

                const session =
                    createBuyerSession(
                        createdUser,
                        name,
                        email,
                        phone
                    );


                if (!session) {

                    throw new Error(
                        "SESSAO_NAO_CRIADA"
                    );

                }


                console.log(
                    "AV Market: sessão do comprador criada:",
                    session
                );


                /* ======================================
                   LIMPAR PASSWORDS
                ====================================== */

                if (
                    passwordInput
                ) {

                    passwordInput.value =
                        "";

                }


                if (
                    confirmPasswordInput
                ) {

                    confirmPasswordInput.value =
                        "";

                }


                /* ======================================
                   MENSAGEM
                ====================================== */

                showMessage(
                    "Conta criada com sucesso! A entrar...",
                    "success"
                );


                /* ======================================
                   REDIRECIONAR
                ====================================== */

                setTimeout(
                    function() {

                        window.location.replace(
                            "../index.html"
                        );

                    },
                    500
                );

            }

            catch (error) {

                console.error(
                    "AV Market — erro ao criar comprador:",
                    error
                );


                /*
                 * Se o Authentication foi criado,
                 * mas o Firestore falhou, removemos
                 * a conta criada para evitar uma conta
                 * incompleta.
                 */

                if (
                    createdUser
                ) {

                    try {

                        await deleteUser(
                            createdUser
                        );


                        console.warn(
                            "AV Market: conta Authentication incompleta removida."
                        );

                    }

                    catch (deleteError) {

                        console.error(
                            "AV Market: não foi possível remover a conta incompleta:",
                            deleteError
                        );

                    }

                }


                clearLocalSession();


                /* ======================================
                   MENSAGEM DE ERRO
                ====================================== */

                if (
                    error.message ===
                    "UTILIZADOR_NAO_CRIADO"
                ) {

                    showMessage(
                        "Não foi possível criar o utilizador. Tente novamente."
                    );

                }

                else if (
                    error.message ===
                    "SESSAO_NAO_CRIADA"
                ) {

                    showMessage(
                        "A conta foi criada, mas não foi possível iniciar a sessão."
                    );

                }

                else {

                    showMessage(
                        getFirebaseErrorMessage(
                            error
                        )
                    );

                }

            }

            finally {

                registrationInProgress =
                    false;


                setLoading(
                    false
                );

            }

        }
    );

}


/* ======================================================
   FORMULÁRIO NÃO ENCONTRADO
====================================================== */

else {

    console.warn(
        "AV Market — #buyerRegisterForm não encontrado."
    );

}


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

console.log(
    "AV Market — criação de conta de comprador carregada."
);

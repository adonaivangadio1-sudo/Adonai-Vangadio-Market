/* ======================================================
   AV MARKET
   CRIAR CONTA — REVENDEDOR
   FIREBASE AUTH + FIRESTORE
   SISTEMA COMPLETO DE REGISTO
====================================================== */

"use strict";

import {
    auth,
    db
} from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    setPersistence,
    browserLocalPersistence
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
    document.getElementById("sellerRegisterForm");

const nameInput =
    document.getElementById("sellerName");

const emailInput =
    document.getElementById("sellerEmail");

const phoneInput =
    document.getElementById("sellerPhone");

const passwordInput =
    document.getElementById("sellerPassword");

const confirmPasswordInput =
    document.getElementById("sellerConfirmPassword");

const termsInput =
    document.getElementById("sellerTerms");

const createButton =
    document.getElementById("sellerCreateButton");

const messageBox =
    document.getElementById("sellerRegisterMessage");


/* ======================================================
   MENSAGENS
====================================================== */

function showMessage(message, type = "error") {

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;

    messageBox.classList.remove(
        "success",
        "error"
    );

    messageBox.classList.add(type);

    messageBox.style.display = "block";
}


function clearMessage() {

    if (!messageBox) {
        return;
    }

    messageBox.textContent = "";

    messageBox.classList.remove(
        "success",
        "error"
    );

    messageBox.style.display = "none";
}


/* ======================================================
   PASSWORD TOGGLE
====================================================== */

function setupPasswordToggle(input, button) {

    if (!input || !button) {
        return;
    }

    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const showing =
                input.type === "password";

            input.type =
                showing
                    ? "text"
                    : "password";

            const icon =
                button.querySelector("i");

            if (icon) {

                icon.className =
                    showing
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye";

            }

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
    document.getElementById("sellerToggle")
);


setupPasswordToggle(
    confirmPasswordInput,
    document.getElementById("sellerConfirmToggle")
);


/* ======================================================
   LOADING
====================================================== */

function setLoading(loading) {

    if (!createButton) {
        return;
    }

    createButton.disabled =
        loading;

    if (loading) {

        createButton.innerHTML =
            '<span>A criar conta...</span>' +
            '<i class="fa-solid fa-spinner fa-spin"></i>';

    } else {

        createButton.innerHTML =
            '<span>Criar conta</span>' +
            '<i class="fa-solid fa-arrow-right"></i>';

    }
}


/* ======================================================
   ERROS FIREBASE
====================================================== */

function getFirebaseErrorMessage(error) {

    switch (error.code) {

        case "auth/email-already-in-use":

            return "Este e-mail já está registado. Entre na sua conta.";

        case "auth/invalid-email":

            return "O e-mail introduzido não é válido.";

        case "auth/weak-password":

            return "A palavra-passe deve ter pelo menos 6 caracteres.";

        case "auth/network-request-failed":

            return "Erro de ligação. Verifique a sua internet.";

        case "auth/operation-not-allowed":

            return "A criação de contas por e-mail ainda não está ativada no Firebase.";

        case "auth/password-does-not-meet-requirements":

            return "A palavra-passe não cumpre os requisitos definidos no Firebase.";

        default:

            console.error(
                "AV Market Firebase:",
                error
            );

            return "Não foi possível criar a conta. Tente novamente.";
    }
}


/* ======================================================
   VERIFICAR CONTRATO
====================================================== */

function isContractAccepted() {

    return (
        sessionStorage.getItem(
            "avMarketContractAccepted"
        ) === "true"
    );
}


/* ======================================================
   CRIAR PERFIL REVENDEDOR
====================================================== */

async function createSellerProfile(
    user,
    name,
    email,
    phone
) {

    await setDoc(
        doc(
            db,
            "users",
            user.uid
        ),
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
                "revendedor",

            accountType:
                "revendedor",

            status:
                "active",

            contractAccepted:
                true,

            contractAcceptedAt:
                serverTimestamp(),

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
   GUARDAR SESSÃO VISUAL
====================================================== */

function saveSellerSession(
    user,
    name,
    email,
    phone
) {

    const session = {

        uid:
            user.uid,

        nome:
            name,

        email:
            email,

        telefone:
            phone,

        tipo:
            "revendedor",

        role:
            "revendedor",

        foto:
            user.photoURL || ""

    };


    localStorage.setItem(
        "avMarketUser",
        JSON.stringify(session)
    );


    localStorage.setItem(
        "avMarketUserId",
        user.uid
    );


    localStorage.setItem(
        "avMarketRole",
        "revendedor"
    );
}


/* ======================================================
   FORMULÁRIO
====================================================== */

if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            clearMessage();


            /* ==========================================
               CONTRATO
            ========================================== */

            if (!isContractAccepted()) {

                showMessage(
                    "Aceite o contrato de revendedor antes de criar a conta."
                );

                return;
            }


            const name =
                nameInput?.value
                    .trim() || "";


            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase() || "";


            const phone =
                phoneInput?.value
                    .trim() || "";


            const password =
                passwordInput?.value || "";


            const confirmPassword =
                confirmPasswordInput?.value || "";


            /* ==========================================
               VALIDAÇÕES
            ========================================== */

            if (!name) {

                showMessage(
                    "Informe o seu nome ou o nome da empresa."
                );

                nameInput?.focus();

                return;
            }


            if (!email) {

                showMessage(
                    "Informe o seu e-mail."
                );

                emailInput?.focus();

                return;
            }


            if (!phone) {

                showMessage(
                    "Informe o seu telefone ou WhatsApp."
                );

                phoneInput?.focus();

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

                passwordInput?.focus();

                return;
            }


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


            if (
                termsInput &&
                !termsInput.checked
            ) {

                showMessage(
                    "Aceite o contrato de revendedor para continuar."
                );

                return;
            }


            setLoading(true);


            try {

                /* ======================================
                   PERSISTÊNCIA
                ====================================== */

                await setPersistence(
                    auth,
                    browserLocalPersistence
                );


                /* ======================================
                   CRIAR UTILIZADOR NO FIREBASE AUTH
                ====================================== */

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                /* ======================================
                   NOME DO UTILIZADOR
                ====================================== */

                await updateProfile(
                    user,
                    {
                        displayName:
                            name
                    }
                );


                /* ======================================
                   CRIAR PERFIL NO FIRESTORE
                ====================================== */

                await createSellerProfile(
                    user,
                    name,
                    email,
                    phone
                );


                /* ======================================
                   GUARDAR SESSÃO
                ====================================== */

                saveSellerSession(
                    user,
                    name,
                    email,
                    phone
                );


                /* ======================================
                   LIMPAR CONTRATO
                ====================================== */

                sessionStorage.removeItem(
                    "avMarketContractAccepted"
                );

                sessionStorage.removeItem(
                    "avMarketContractAcceptedAt"
                );


                /* ======================================
                   LIMPAR PASSWORD
                ====================================== */

                if (passwordInput) {
                    passwordInput.value = "";
                }

                if (confirmPasswordInput) {
                    confirmPasswordInput.value = "";
                }


                /* ======================================
                   REDIRECIONAMENTO
                ====================================== */

                window.location.replace(
                    "perfil-revendedor.html"
                );

            }

            catch (error) {

                console.error(
                    "AV Market — erro ao criar revendedor:",
                    error
                );


                showMessage(
                    getFirebaseErrorMessage(error)
                );


                setLoading(false);

            }

        }
    );
}


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

console.log(
    "AV Market — criação de conta de revendedor carregada."
);

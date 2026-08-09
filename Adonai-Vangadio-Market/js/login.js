/* ======================================================
   AV MARKET
   LOGIN
   FIREBASE AUTH + FIRESTORE
   LOGIN INTELIGENTE
====================================================== */

"use strict";


import {
    auth,
    db
} from "./firebase-config.js";


import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ======================================================
   ELEMENTOS
====================================================== */

const form =
    document.getElementById(
        "loginForm"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const passwordToggle =
    document.getElementById(
        "passwordToggle"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const loginButtonText =
    document.getElementById(
        "loginButtonText"
    );


const loginButtonIcon =
    document.getElementById(
        "loginButtonIcon"
    );


const messageBox =
    document.getElementById(
        "loginMessage"
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

if (
    passwordToggle &&
    passwordInput
) {

    passwordToggle.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const showing =
                passwordInput.type ===
                "password";


            passwordInput.type =
                showing
                    ? "text"
                    : "password";


            passwordToggle.setAttribute(
                "aria-pressed",
                showing
                    ? "true"
                    : "false"
            );


            passwordToggle.setAttribute(
                "aria-label",
                showing
                    ? "Ocultar palavra-passe"
                    : "Mostrar palavra-passe"
            );


            const icon =
                passwordToggle.querySelector(
                    "i"
                );


            if (icon) {

                icon.className =
                    showing
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye";

            }

        }
    );

}


/* ======================================================
   LOADING
====================================================== */

function setLoading(
    loading
) {

    if (!loginButton) {
        return;
    }


    loginButton.disabled =
        loading;


    if (loading) {

        if (loginButtonText) {

            loginButtonText.textContent =
                "A entrar...";

        }


        if (loginButtonIcon) {

            loginButtonIcon.className =
                "fa-solid fa-spinner fa-spin";

        }

    }

    else {

        if (loginButtonText) {

            loginButtonText.textContent =
                "Entrar";

        }


        if (loginButtonIcon) {

            loginButtonIcon.className =
                "fa-solid fa-arrow-right";

        }

    }

}


/* ======================================================
   ERROS FIREBASE
====================================================== */

function getFirebaseErrorMessage(
    error
) {

    switch (error.code) {

        case "auth/invalid-email":

            return "O e-mail introduzido não é válido.";


        case "auth/invalid-credential":

            return "E-mail ou palavra-passe incorretos.";


        case "auth/user-not-found":

            return "Não existe uma conta com este e-mail.";


        case "auth/wrong-password":

            return "A palavra-passe está incorreta.";


        case "auth/user-disabled":

            return "Esta conta encontra-se desativada.";


        case "auth/too-many-requests":

            return "Muitas tentativas. Tente novamente mais tarde.";


        case "auth/network-request-failed":

            return "Erro de ligação. Verifique a sua internet.";


        default:

            console.error(
                "AV Market Firebase:",
                error
            );


            return "Não foi possível iniciar sessão. Tente novamente.";

    }

}


/* ======================================================
   OBTER PERFIL
====================================================== */

async function getProfile(
    uid
) {

    const reference =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(
            reference
        );


    if (!snapshot.exists()) {

        throw new Error(
            "PERFIL_NAO_ENCONTRADO"
        );

    }


    return snapshot.data();

}


/* ======================================================
   IDENTIFICAR ROLE
====================================================== */

function getRole(
    profile
) {

    if (!profile) {
        return "";
    }


    const role =
        profile.role ||
        profile.accountType ||
        profile.tipoConta ||
        profile.tipo ||
        "";


    return String(
        role
    )
        .trim()
        .toLowerCase();

}


/* ======================================================
   GUARDAR SESSÃO
====================================================== */

function saveSession(
    firebaseUser,
    profile,
    role
) {

    const session = {

        uid:
            firebaseUser.uid,

        nome:
            profile.name ||
            profile.nome ||
            profile.nomeCompleto ||
            firebaseUser.displayName ||
            "Minha Conta",

        email:
            profile.email ||
            firebaseUser.email ||
            "",

        telefone:
            profile.phone ||
            profile.telefone ||
            "",

        tipo:
            role,

        role:
            role,

        foto:
            profile.foto ||
            profile.photoURL ||
            firebaseUser.photoURL ||
            ""

    };


    localStorage.setItem(
        "avMarketUser",
        JSON.stringify(session)
    );


    localStorage.setItem(
        "avMarketUserId",
        firebaseUser.uid
    );


    localStorage.setItem(
        "avMarketRole",
        role
    );


    return session;

}


/* ======================================================
   REDIRECIONAMENTO POR PERFIL
====================================================== */

function redirectByRole(
    role
) {

    switch (role) {

        case "comprador":

        case "buyer":

            window.location.replace(
                "perfil-comprador.html"
            );

            return true;


        case "revendedor":

        case "vendedor":

        case "seller":

            window.location.replace(
                "perfil-revendedor.html"
            );

            return true;


        case "admin":

        case "administrador":

            window.location.replace(
                "administrador/dashboard.html"
            );

            return true;


        default:

            return false;

    }

}


/* ======================================================
   LOGIN
====================================================== */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage();


            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase() || "";


            const password =
                passwordInput?.value || "";


            if (!email) {

                showMessage(
                    "Introduza o seu e-mail."
                );

                emailInput?.focus();

                return;

            }


            if (!password) {

                showMessage(
                    "Introduza a sua palavra-passe."
                );

                passwordInput?.focus();

                return;

            }


            setLoading(
                true
            );


            try {

                /* ======================================
                   MANTER LOGIN
                ====================================== */

                await setPersistence(
                    auth,
                    browserLocalPersistence
                );


                /* ======================================
                   AUTENTICAR
                ====================================== */

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const firebaseUser =
                    credential.user;


                /* ======================================
                   BUSCAR PERFIL
                ====================================== */

                const profile =
                    await getProfile(
                        firebaseUser.uid
                    );


                /* ======================================
                   DESCOBRIR TIPO
                ====================================== */

                const role =
                    getRole(
                        profile
                    );


                if (!role) {

                    throw new Error(
                        "ROLE_NAO_DEFINIDA"
                    );

                }


                /* ======================================
                   GUARDAR SESSÃO
                ====================================== */

                saveSession(
                    firebaseUser,
                    profile,
                    role
                );


                /* ======================================
                   REDIRECIONAR
                ====================================== */

                if (
                    !redirectByRole(
                        role
                    )
                ) {

                    throw new Error(
                        "ROLE_NAO_DEFINIDA"
                    );

                }

            }

            catch (error) {

                console.error(
                    "AV Market — erro no login:",
                    error
                );


                if (
                    error.message ===
                    "PERFIL_NAO_ENCONTRADO"
                ) {

                    showMessage(
                        "A conta foi autenticada, mas o perfil não foi encontrado no sistema."
                    );

                }

                else if (
                    error.message ===
                    "ROLE_NAO_DEFINIDA"
                ) {

                    showMessage(
                        "O tipo desta conta não está definido. Contacte o suporte."
                    );

                }

                else {

                    showMessage(
                        getFirebaseErrorMessage(
                            error
                        )
                    );

                }


                setLoading(
                    false
                );

            }

        }
    );

}


console.log(
    "AV Market — Login Firebase carregado."
);

/* ======================================================
   AV MARKET
   LOGIN
   FIREBASE AUTH + FIRESTORE
   SISTEMA CENTRAL DE AUTENTICAÇÃO
====================================================== */

"use strict";


/* ======================================================
   IMPORTAÇÕES
====================================================== */

import {
    auth,
    db,
    ROLES,
    getUserProfile,
    normalizeRole,
    saveLocalSession,
    clearLocalSession
} from "./auth.js";


import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


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


    loginButton.setAttribute(
        "aria-busy",
        loading
            ? "true"
            : "false"
    );


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

    if (!error) {

        return (
            "Não foi possível iniciar sessão. " +
            "Tente novamente."
        );

    }


    switch (
        error.code
    ) {

        case "auth/invalid-email":

            return (
                "O e-mail introduzido não é válido."
            );


        case "auth/invalid-credential":

            return (
                "E-mail ou palavra-passe incorretos."
            );


        case "auth/user-not-found":

            return (
                "Não existe uma conta com este e-mail."
            );


        case "auth/wrong-password":

            return (
                "A palavra-passe está incorreta."
            );


        case "auth/user-disabled":

            return (
                "Esta conta encontra-se desativada."
            );


        case "auth/too-many-requests":

            return (
                "Muitas tentativas. " +
                "Tente novamente mais tarde."
            );


        case "auth/network-request-failed":

            return (
                "Erro de ligação. " +
                "Verifique a sua internet."
            );


        case "auth/operation-not-allowed":

            return (
                "O login por e-mail e palavra-passe " +
                "não está ativado no Firebase."
            );


        case "auth/internal-error":

            return (
                "O Firebase encontrou um erro interno. " +
                "Tente novamente."
            );


        case "auth/invalid-api-key":

            return (
                "A configuração do Firebase está incorreta."
            );


        case "auth/app-not-authorized":

            return (
                "Este domínio não está autorizado no Firebase."
            );


        case "auth/unauthorized-domain":

            return (
                "Este domínio não está autorizado para utilizar o Firebase Authentication."
            );


        default:

            console.error(
                "AV Market Firebase:",
                error
            );


            return (
                "Não foi possível iniciar sessão. " +
                "Tente novamente."
            );

    }

}


/* ======================================================
   ERROS INTERNOS
====================================================== */

function getInternalErrorMessage(
    error
) {

    if (!error) {

        return (
            "Não foi possível concluir o login."
        );

    }


    switch (
        error.message
    ) {

        case "PERFIL_NAO_ENCONTRADO":

            return (
                "A conta foi autenticada, " +
                "mas o perfil não foi encontrado no sistema."
            );


        case "ROLE_NAO_DEFINIDA":

            return (
                "O tipo desta conta não está definido. " +
                "Contacte o suporte."
            );


        case "ROLE_INVALIDA":

            return (
                "O tipo desta conta não é reconhecido pelo sistema."
            );


        case "UTILIZADOR_NAO_ENCONTRADO":

            return (
                "Não foi possível identificar a conta autenticada."
            );


        default:

            return null;

    }

}


/* ======================================================
   VALIDAR ROLE
====================================================== */

function isValidRole(
    role
) {

    const normalizedRole =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    return [

        ROLES.ADMIN,

        ROLES.COMPRADOR,

        ROLES.REVENDEDOR,

        "administrador",

        "buyer",

        "vendedor",

        "seller"

    ].includes(
        normalizedRole
    );

}


/* ======================================================
   REDIRECIONAMENTO POR PERFIL
====================================================== */

function redirectByRole(
    role
) {

    const normalizedRole =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    console.log(
        "AV Market — redirecionando role:",
        normalizedRole
    );


    switch (
        normalizedRole
    ) {

        /* ==============================================
           ADMIN
        ============================================== */

        case "admin":

        case "administrador":

            window.location.replace(
                "administrador/admin.html"
            );

            return true;


        /* ==============================================
           COMPRADOR
        ============================================== */

        case "comprador":

        case "buyer":

            window.location.replace(
                "../index.html"
            );

            return true;


        /* ==============================================
           REVENDEDOR
        ============================================== */

        case "revendedor":

        case "vendedor":

        case "seller":

            window.location.replace(
                "../index.html"
            );

            return true;


        default:

            console.error(
                "AV Market — role sem redirecionamento:",
                normalizedRole
            );


            return false;

    }

}


/* ======================================================
   EVITAR LOGIN DUPLICADO
====================================================== */

let loginInProgress =
    false;


/* ======================================================
   LOGIN
====================================================== */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ==========================================
               IMPEDIR DUPLO CLIQUE
            ========================================== */

            if (
                loginInProgress
            ) {

                return;

            }


            clearMessage();


            /* ==========================================
               OBTER CAMPOS
            ========================================== */

            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const password =
                passwordInput?.value ||
                "";


            /* ==========================================
               VALIDAR EMAIL
            ========================================== */

            if (!email) {

                showMessage(
                    "Introduza o seu e-mail."
                );


                emailInput?.focus();


                return;

            }


            /* ==========================================
               VALIDAR PASSWORD
            ========================================== */

            if (!password) {

                showMessage(
                    "Introduza a sua palavra-passe."
                );


                passwordInput?.focus();


                return;

            }


            /* ==========================================
               INICIAR LOADING
            ========================================== */

            loginInProgress =
                true;


            setLoading(
                true
            );


            try {

                /* ======================================
                   LIMPAR SESSÃO LOCAL ANTERIOR
                ====================================== */

                clearLocalSession();


                console.log(
                    "AV Market — sessão local anterior limpa."
                );


                /* ======================================
                   DEFINIR PERSISTÊNCIA
                ====================================== */

                await setPersistence(
                    auth,
                    browserLocalPersistence
                );


                console.log(
                    "AV Market — persistência definida."
                );


                /* ======================================
                   AUTHENTICATION
                ====================================== */

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const firebaseUser =
                    credential?.user;


                if (!firebaseUser) {

                    throw new Error(
                        "UTILIZADOR_NAO_ENCONTRADO"
                    );

                }


                console.log(
                    "AV Market — Firebase Authentication OK:",
                    firebaseUser.uid
                );


                /* ======================================
                   BUSCAR PERFIL FIRESTORE
                ====================================== */

                let profile = null;


                try {

                    profile =
                        await getUserProfile(
                            firebaseUser.uid
                        );

                }

                catch (firestoreError) {

                    console.error(
                        "AV Market — erro ao consultar Firestore:",
                        firestoreError
                    );


                    /*
                     * Se o login no Auth funcionou,
                     * mas a leitura do perfil falhou,
                     * encerramos a autenticação para
                     * não deixar uma sessão incompleta.
                     */

                    try {

                        await signOut(
                            auth
                        );

                    }

                    catch (logoutError) {

                        console.error(
                            "AV Market — erro ao limpar Auth:",
                            logoutError
                        );

                    }


                    clearLocalSession();


                    throw new Error(
                        "FIRESTORE_PROFILE_ERROR"
                    );

                }


                /* ======================================
                   PERFIL NÃO EXISTE
                ====================================== */

                if (!profile) {

                    console.error(
                        "AV Market — perfil não encontrado para UID:",
                        firebaseUser.uid
                    );


                    try {

                        await signOut(
                            auth
                        );

                    }

                    catch (logoutError) {

                        console.error(
                            "AV Market — erro ao terminar sessão:",
                            logoutError
                        );

                    }


                    clearLocalSession();


                    throw new Error(
                        "PERFIL_NAO_ENCONTRADO"
                    );

                }


                console.log(
                    "AV Market — perfil Firestore encontrado:",
                    profile
                );


                /* ======================================
                   IDENTIFICAR ROLE
                ====================================== */

                const role =
                    normalizeRole(
                        profile
                    );


                console.log(
                    "AV Market — role identificada:",
                    role
                );


                /* ======================================
                   ROLE NÃO DEFINIDA
                ====================================== */

                if (!role) {

                    try {

                        await signOut(
                            auth
                        );

                    }

                    catch (logoutError) {

                        console.error(
                            "AV Market — erro ao terminar sessão:",
                            logoutError
                        );

                    }


                    clearLocalSession();


                    throw new Error(
                        "ROLE_NAO_DEFINIDA"
                    );

                }


                /* ======================================
                   VALIDAR ROLE
                ====================================== */

                if (
                    !isValidRole(
                        role
                    )
                ) {

                    console.error(
                        "AV Market — role inválida:",
                        role
                    );


                    try {

                        await signOut(
                            auth
                        );

                    }

                    catch (logoutError) {

                        console.error(
                            "AV Market — erro ao terminar sessão:",
                            logoutError
                        );

                    }


                    clearLocalSession();


                    throw new Error(
                        "ROLE_INVALIDA"
                    );

                }


                /* ======================================
                   CRIAR SESSÃO CENTRAL
                ====================================== */

                const session =
                    saveLocalSession(
                        firebaseUser,
                        {
                            ...profile,
                            role
                        }
                    );


                if (!session) {

                    try {

                        await signOut(
                            auth
                        );

                    }

                    catch (logoutError) {

                        console.error(
                            "AV Market — erro ao terminar sessão:",
                            logoutError
                        );

                    }


                    clearLocalSession();


                    throw new Error(
                        "SESSAO_NAO_CRIADA"
                    );

                }


                console.log(
                    "AV Market — sessão criada:",
                    session
                );


                /* ======================================
                   REDIRECIONAR
                ====================================== */

                const redirected =
                    redirectByRole(
                        role
                    );


                if (!redirected) {

                    try {

                        await signOut(
                            auth
                        );

                    }

                    catch (logoutError) {

                        console.error(
                            "AV Market — erro ao terminar sessão:",
                            logoutError
                        );

                    }


                    clearLocalSession();


                    throw new Error(
                        "ROLE_INVALIDA"
                    );

                }


                /*
                 * Se o redirecionamento foi executado,
                 * não precisamos mexer mais no botão.
                 */

                console.log(
                    "AV Market — login concluído com sucesso."
                );

            }

            catch (error) {

                console.error(
                    "AV Market — erro completo no login:",
                    error
                );


                /* ======================================
                   ERROS INTERNOS
                ====================================== */

                let internalMessage =
                    null;


                if (
                    error?.message ===
                    "FIRESTORE_PROFILE_ERROR"
                ) {

                    internalMessage =
                        "A autenticação funcionou, mas não foi possível consultar o perfil no Firestore. Verifique as regras do Firestore e tente novamente.";

                }

                else if (
                    error?.message ===
                    "SESSAO_NAO_CRIADA"
                ) {

                    internalMessage =
                        "A conta foi autenticada, mas não foi possível criar a sessão.";

                }

                else {

                    internalMessage =
                        getInternalErrorMessage(
                            error
                        );

                }


                if (
                    internalMessage
                ) {

                    showMessage(
                        internalMessage,
                        "error"
                    );

                }

                else {

                    showMessage(
                        getFirebaseErrorMessage(
                            error
                        ),
                        "error"
                    );

                }

            }

            finally {

                /*
                 * MUITO IMPORTANTE:
                 *
                 * Nunca deixar o botão preso
                 * em "A entrar..."
                 */

                loginInProgress =
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

    console.error(
        "AV Market — #loginForm não encontrado."
    );

}


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

console.log(
    "AV Market — Login Firebase carregado corretamente."
);

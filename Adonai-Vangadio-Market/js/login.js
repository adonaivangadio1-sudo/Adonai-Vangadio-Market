/* ======================================================
   AV MARKET
   LOGIN
   SUPABASE AUTH + DATABASE
   SISTEMA CENTRAL DE AUTENTICAÇÃO
====================================================== */

"use strict";


/* ======================================================
   IMPORTAÇÕES
====================================================== */

import {
    supabase,
    ROLES,
    ADMIN_UID,
    getUserProfile,
    normalizeRole,
    saveLocalSession,
    clearLocalSession
} from "./auth.js";


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
   ERROS SUPABASE
====================================================== */

function getSupabaseErrorMessage(
    error
) {

    if (!error) {

        return (
            "Não foi possível iniciar sessão. " +
            "Tente novamente."
        );

    }


    const message =
        String(
            error.message || ""
        ).toLowerCase();


    const code =
        String(
            error.code || ""
        ).toLowerCase();


    /* ==============================================
       CREDENCIAIS
    ============================================== */

    if (
        message.includes(
            "invalid login credentials"
        )
    ) {

        return (
            "E-mail ou palavra-passe incorretos."
        );

    }


    if (
        message.includes(
            "email not confirmed"
        )
    ) {

        return (
            "O e-mail desta conta ainda não foi confirmado."
        );

    }


    /* ==============================================
       EMAIL
    ============================================== */

    if (
        message.includes(
            "invalid email"
        ) ||
        code ===
        "invalid_email"
    ) {

        return (
            "O e-mail introduzido não é válido."
        );

    }


    /* ==============================================
       PASSWORD
    ============================================== */

    if (
        message.includes(
            "password"
        ) &&
        message.includes(
            "invalid"
        )
    ) {

        return (
            "A palavra-passe está incorreta."
        );

    }


    /* ==============================================
       REDE
    ============================================== */

    if (
        message.includes(
            "network"
        ) ||
        message.includes(
            "fetch"
        ) ||
        message.includes(
            "failed to fetch"
        )
    ) {

        return (
            "Erro de ligação. " +
            "Verifique a sua internet."
        );

    }


    /* ==============================================
       RATE LIMIT
    ============================================== */

    if (
        message.includes(
            "rate limit"
        ) ||
        message.includes(
            "too many"
        )
    ) {

        return (
            "Muitas tentativas. " +
            "Tente novamente mais tarde."
        );

    }


    /* ==============================================
       DEFAULT
    ============================================== */

    console.error(
        "AV Market Supabase:",
        error
    );


    return (
        "Não foi possível iniciar sessão. " +
        "Tente novamente."
    );

}


/* ======================================================
   ERROS INTERNOS
====================================================== */

function getInternalErrorMessage(
    error
) {

    if (!error) {
        return null;
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


        case "SESSAO_NAO_CRIADA":

            return (
                "A conta foi autenticada, " +
                "mas não foi possível criar a sessão."
            );


        case "FIRESTORE_PROFILE_ERROR":

            return (
                "Não foi possível consultar o perfil da conta."
            );


        case "PERFIL_DATABASE_ERROR":

            return (
                "A autenticação funcionou, " +
                "mas não foi possível consultar o perfil."
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


    return (

        normalizedRole ===
        ROLES.ADMIN ||

        normalizedRole ===
        ROLES.COMPRADOR ||

        normalizedRole ===
        ROLES.REVENDEDOR

    );

}


/* ======================================================
   REDIRECIONAMENTO POR ROLE
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
        "AV Market — role:",
        normalizedRole
    );


    switch (
        normalizedRole
    ) {

        /* ==============================================
           ADMINISTRADOR
        ============================================== */

        case ROLES.ADMIN:

        case "administrador":

            window.location.replace(
                "administrador/admin.html"
            );

            return true;


        /* ==============================================
           COMPRADOR
        ============================================== */

        case ROLES.COMPRADOR:

        case "buyer":

            window.location.replace(
                "../index.html"
            );

            return true;


        /* ==============================================
           REVENDEDOR
        ============================================== */

        case ROLES.REVENDEDOR:

        case "vendedor":

        case "seller":

            window.location.replace(
                "../index.html"
            );

            return true;


        /* ==============================================
           ROLE DESCONHECIDA
        ============================================== */

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
                    ?.trim()
                    ?.toLowerCase() ||
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
               INICIAR LOGIN
            ========================================== */

            loginInProgress =
                true;


            setLoading(
                true
            );


            try {

                /* ======================================
                   LIMPAR CACHE LOCAL ANTIGO
                ====================================== */

                clearLocalSession();


                console.log(
                    "AV Market — sessão local anterior limpa."
                );


                /* ======================================
                   AUTENTICAÇÃO SUPABASE
                ====================================== */

                const {
                    data,
                    error
                } =
                    await supabase.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                /* ======================================
                   ERRO DE AUTENTICAÇÃO
                ====================================== */

                if (
                    error
                ) {

                    throw error;

                }


                /* ======================================
                   UTILIZADOR
                ====================================== */

                const user =
                    data?.user;


                if (!user) {

                    throw new Error(
                        "UTILIZADOR_NAO_ENCONTRADO"
                    );

                }


                console.log(
                    "AV Market — Supabase Authentication OK:",
                    user.id
                );


                /* ======================================
                   VERIFICAR ADMIN PELO UID
                ====================================== */

                let profile =
                    null;


                if (
                    user.id ===
                    ADMIN_UID
                ) {

                    profile = {

                        uid:
                            user.id,

                        id:
                            user.id,

                        name:
                            user.user_metadata?.name ||
                            "Administrador",

                        email:
                            user.email ||
                            "",

                        role:
                            ROLES.ADMIN

                    };


                    console.log(
                        "AV Market — administrador identificado pelo UID."
                    );

                }

                else {

                    /* ==================================
                       BUSCAR PERFIL NA TABELA
                       "perfis"
                    ================================== */

                    try {

                        profile =
                            await getUserProfile(
                                user.id
                            );

                    }

                    catch (
                        profileError
                    ) {

                        console.error(
                            "AV Market — erro ao consultar tabela perfis:",
                            profileError
                        );


                        /*
                         * IMPORTANTE:
                         *
                         * A autenticação já funcionou.
                         *
                         * O problema agora é somente
                         * na consulta do perfil.
                         */

                        try {

                            await supabase.auth
                                .signOut();

                        }

                        catch (
                            logoutError
                        ) {

                            console.error(
                                "AV Market — erro ao terminar sessão:",
                                logoutError
                            );

                        }


                        clearLocalSession();


                        throw new Error(
                            "PERFIL_DATABASE_ERROR"
                        );

                    }

                }


                /* ======================================
                   PERFIL NÃO ENCONTRADO
                ====================================== */

                if (!profile) {

                    console.error(
                        "AV Market — perfil não encontrado:",
                        user.id
                    );


                    try {

                        await supabase.auth
                            .signOut();

                    }

                    catch (
                        logoutError
                    ) {

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
                    "AV Market — perfil encontrado:",
                    profile
                );


                /* ======================================
                   IDENTIFICAR ROLE
                ====================================== */

                let role =
                    normalizeRole(
                        profile
                    );


                /* ======================================
                   ADMIN TEM PRIORIDADE
                ====================================== */

                if (
                    user.id ===
                    ADMIN_UID
                ) {

                    role =
                        ROLES.ADMIN;

                }


                console.log(
                    "AV Market — role identificada:",
                    role
                );


                /* ======================================
                   ROLE NÃO DEFINIDA
                ====================================== */

                if (!role) {

                    try {

                        await supabase.auth
                            .signOut();

                    }

                    catch (
                        logoutError
                    ) {

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

                        await supabase.auth
                            .signOut();

                    }

                    catch (
                        logoutError
                    ) {

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

                        user,

                        {

                            ...profile,

                            role

                        }

                    );


                if (!session) {

                    try {

                        await supabase.auth
                            .signOut();

                    }

                    catch (
                        logoutError
                    ) {

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
                   REDIRECIONAMENTO
                ====================================== */

                const redirected =
                    redirectByRole(
                        role
                    );


                if (!redirected) {

                    try {

                        await supabase.auth
                            .signOut();

                    }

                    catch (
                        logoutError
                    ) {

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


                console.log(
                    "AV Market — login concluído com sucesso."
                );

            }

            catch (
                error
            ) {

                console.error(
                    "AV Market — erro completo no login:",
                    error
                );


                /* ======================================
                   MENSAGEM INTERNA
                ====================================== */

                const internalMessage =
                    getInternalErrorMessage(
                        error
                    );


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
                        getSupabaseErrorMessage(
                            error
                        ),
                        "error"
                    );

                }

            }

            finally {

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
    "AV Market — Login Supabase carregado corretamente."
);

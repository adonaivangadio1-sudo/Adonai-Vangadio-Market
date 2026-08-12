/* ======================================================
   AV MARKET
   LOGIN
   SUPABASE AUTH + DATABASE
   SISTEMA CENTRAL DE AUTENTICAÇÃO
====================================================== */

"use strict";

import {
    supabase
} from "./supabase-config.js";


/* ======================================================
   ELEMENTOS
====================================================== */

const form =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginButtonIcon =
    document.getElementById("loginButtonIcon");

const messageBox =
    document.getElementById("loginMessage");


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
        function(event) {

            event.preventDefault();

            const showing =
                passwordInput.type === "password";

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
                passwordToggle.querySelector("i");

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


    if (
        message.includes("invalid login credentials")
    ) {

        return (
            "E-mail ou palavra-passe incorretos."
        );
    }


    if (
        message.includes("email not confirmed")
    ) {

        return (
            "O seu e-mail ainda não foi confirmado."
        );
    }


    if (
        message.includes("too many requests")
    ) {

        return (
            "Muitas tentativas. " +
            "Tente novamente mais tarde."
        );
    }


    if (
        message.includes("network")
    ) {

        return (
            "Erro de ligação. " +
            "Verifique a sua internet."
        );
    }


    return (
        "Não foi possível iniciar sessão. " +
        "Tente novamente."
    );
}


/* ======================================================
   ROLE
====================================================== */

function normalizeRole(
    profile
) {

    if (!profile) {
        return "";
    }

    return String(
        profile.role ||
        profile.account_type ||
        ""
    )
        .trim()
        .toLowerCase();
}


/* ======================================================
   GUARDAR SESSÃO LOCAL
====================================================== */

function saveLocalSession(
    user,
    profile
) {

    if (
        !user ||
        !profile
    ) {

        return null;
    }


    const role =
        normalizeRole(profile);


    const session = {

        uid:
            user.id,

        nome:
            profile.name ||
            "",

        email:
            user.email ||
            profile.email ||
            "",

        telefone:
            profile.phone ||
            "",

        role:
            role,

        tipo:
            role,

        foto:
            profile.photo_url ||
            "",

        emailVerificado:
            Boolean(
                user.email_confirmed_at
            )

    };


    localStorage.setItem(
        "avMarketUser",
        JSON.stringify(session)
    );

    localStorage.setItem(
        "avMarketUserId",
        user.id
    );

    localStorage.setItem(
        "avMarketRole",
        role
    );


    return session;
}


/* ======================================================
   LIMPAR SESSÃO LOCAL
====================================================== */

function clearLocalSession() {

    const keys = [

        "avMarketUser",
        "avMarketUserId",
        "avMarketRole",

        "avMarketSession",
        "avmarket_session",

        "authSession",
        "currentUser",
        "userSession",
        "loggedUser",

        "avMarketAuth",
        "avMarketCurrentUser",
        "loggedInUser",
        "av_market_user"

    ];


    keys.forEach(
        key => {

            localStorage.removeItem(
                key
            );

            sessionStorage.removeItem(
                key
            );

        }
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


    switch (
        normalizedRole
    ) {

        /* ==============================================
           ADMINISTRADOR
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
        async function(event) {

            event.preventDefault();


            if (
                loginInProgress
            ) {

                return;
            }


            clearMessage();


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


            loginInProgress =
                true;

            setLoading(true);


            try {

                clearLocalSession();


                /* ======================================
                   LOGIN SUPABASE
                ====================================== */

                const {
                    data,
                    error
                } =
                    await supabase.auth.signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


                if (error) {

                    throw error;
                }


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
                   BUSCAR PERFIL
                   users/{id}
                ====================================== */

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabase

                        .from("users")

                        .select("*")

                        .eq(
                            "id",
                            user.id
                        )

                        .maybeSingle();


                if (profileError) {

                    console.error(
                        "AV Market — erro ao consultar perfil:",
                        profileError
                    );

                    throw new Error(
                        "FIRESTORE_PROFILE_ERROR"
                    );
                }


                if (!profile) {

                    await supabase.auth.signOut();

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

                const role =
                    normalizeRole(profile);


                if (!role) {

                    await supabase.auth.signOut();

                    clearLocalSession();

                    throw new Error(
                        "ROLE_NAO_DEFINIDA"
                    );
                }


                /* ======================================
                   VALIDAR ROLE
                ====================================== */

                const validRoles = [

                    "admin",
                    "administrador",

                    "comprador",
                    "buyer",

                    "revendedor",
                    "vendedor",
                    "seller"

                ];


                if (
                    !validRoles.includes(role)
                ) {

                    await supabase.auth.signOut();

                    clearLocalSession();

                    throw new Error(
                        "ROLE_INVALIDA"
                    );
                }


                /* ======================================
                   CRIAR SESSÃO
                ====================================== */

                const session =
                    saveLocalSession(
                        user,
                        profile
                    );


                if (!session) {

                    await supabase.auth.signOut();

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

                    await supabase.auth.signOut();

                    clearLocalSession();

                    throw new Error(
                        "ROLE_INVALIDA"
                    );
                }


            }

            catch (error) {

                console.error(
                    "AV Market — erro no login:",
                    error
                );


                switch (
                    error?.message
                ) {

                    case "PERFIL_NAO_ENCONTRADO":

                        showMessage(
                            "A conta foi autenticada, mas o perfil não foi encontrado no sistema."
                        );

                        break;


                    case "ROLE_NAO_DEFINIDA":

                        showMessage(
                            "O tipo desta conta não está definido. Contacte o suporte."
                        );

                        break;


                    case "ROLE_INVALIDA":

                        showMessage(
                            "O tipo desta conta não é reconhecido pelo sistema."
                        );

                        break;


                    case "FIRESTORE_PROFILE_ERROR":

                        showMessage(
                            "A autenticação funcionou, mas não foi possível consultar o perfil. Verifique as permissões da tabela users."
                        );

                        break;


                    case "SESSAO_NAO_CRIADA":

                        showMessage(
                            "A conta foi autenticada, mas não foi possível criar a sessão."
                        );

                        break;


                    case "UTILIZADOR_NAO_ENCONTRADO":

                        showMessage(
                            "Não foi possível identificar a conta autenticada."
                        );

                        break;


                    default:

                        showMessage(
                            getSupabaseErrorMessage(
                                error
                            )
                        );

                }

            }

            finally {

                loginInProgress =
                    false;

                setLoading(false);
            }

        }
    );

}

else {

    console.error(
        "AV Market — #loginForm não encontrado."
    );
}


console.log(
    "AV Market — Login Supabase carregado corretamente."
);

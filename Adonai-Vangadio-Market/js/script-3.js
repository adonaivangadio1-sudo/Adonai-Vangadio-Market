/* =========================================================
   AV MARKET
   SCRIPT-3.JS
   AUTENTICAÇÃO INTELIGENTE
   SUPABASE AUTH + PERFIS + REDIRECIONAMENTO

   NÃO SUBSTITUI O script-2.js

   Responsabilidades:
   - Login
   - Criar conta comprador
   - Criar conta revendedor
   - Identificar role
   - Criar sessão local
   - Redirecionar para o perfil correto
========================================================= */

"use strict";


/* =========================================================
   IMPORTAR SUPABASE
========================================================= */

import {
    supabase
} from "./supabase-config.js";


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const ADMIN_UID =
    "f82df114-169b-4c24-8e7e-748555898720";


const ROLES = Object.freeze({

    COMPRADOR:
        "comprador",

    REVENDEDOR:
        "revendedor",

    ADMIN:
        "admin"

});


/* =========================================================
   CAMINHOS DOS PERFIS
========================================================= */

const PROFILE_PATHS = Object.freeze({

    comprador:
        "perfil-comprador.html",

    revendedor:
        "perfil-revendedor.html",

    admin:
        "admin.html"

});


/* =========================================================
   NORMALIZAR ROLE
========================================================= */

function normalizeRole(profile) {

    if (!profile) {

        return "";

    }


    const role =

        profile.role ||

        profile.account_type ||

        profile.accountType ||

        profile.tipoConta ||

        profile.tipo ||

        profile.userType ||

        profile.type ||

        "";


    return String(role)
        .trim()
        .toLowerCase();

}


/* =========================================================
   MOSTRAR MENSAGEM
========================================================= */

function showMessage(
    element,
    message,
    type = "error"
) {

    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.classList.remove(
        "success",
        "error"
    );


    element.classList.add(
        type
    );

}


/* =========================================================
   LIMPAR MENSAGEM
========================================================= */

function clearMessage(element) {

    if (!element) {

        return;

    }


    element.textContent =
        "";


    element.classList.remove(
        "success",
        "error"
    );

}


/* =========================================================
   BOTÃO — LOADING
========================================================= */

function setButtonLoading(
    button,
    loading,
    loadingText = "A processar..."
) {

    if (!button) {

        return;

    }


    button.disabled =
        loading;


    button.setAttribute(
        "aria-busy",
        loading
            ? "true"
            : "false"
    );


    if (loading) {

        button.innerHTML =

            "<span>" +
            loadingText +
            "</span>" +

            '<i class="fa-solid fa-spinner fa-spin"></i>';

    }

}


/* =========================================================
   RESTAURAR BOTÃO LOGIN
========================================================= */

function restoreLoginButton(button) {

    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.setAttribute(
        "aria-busy",
        "false"
    );


    button.innerHTML =

        '<span>Entrar</span>' +

        '<i class="fa-solid fa-arrow-right"></i>';

}


/* =========================================================
   RESTAURAR BOTÃO COMPRADOR
========================================================= */

function restoreBuyerButton(button) {

    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.setAttribute(
        "aria-busy",
        "false"
    );


    button.innerHTML =

        '<span>Criar conta</span>' +

        '<i class="fa-solid fa-arrow-right"></i>';

}


/* =========================================================
   RESTAURAR BOTÃO REVENDEDOR
========================================================= */

function restoreSellerButton(button) {

    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.setAttribute(
        "aria-busy",
        "false"
    );


    button.innerHTML =

        '<span>Criar conta</span>' +

        '<i class="fa-solid fa-arrow-right"></i>';

}


/* =========================================================
   GUARDAR SESSÃO LOCAL
========================================================= */

function saveLocalSession(
    user,
    profile,
    role
) {

    const session = {

        uid:
            user.id,

        name:
            profile?.name ||
            profile?.nome ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            "Minha Conta",

        email:
            profile?.email ||
            user.email ||
            "",

        phone:
            profile?.phone ||
            profile?.telefone ||
            user.user_metadata?.phone ||
            "",

        role:
            role,

        tipo:
            role,

        createdAt:
            profile?.created_at ||
            user.created_at ||
            null

    };


    localStorage.setItem(

        "avMarketUser",

        JSON.stringify(
            session
        )

    );


    localStorage.setItem(

        "avMarketUserId",

        user.id

    );


    localStorage.setItem(

        "avMarketRole",

        role

    );


    localStorage.setItem(

        "avMarketSession",

        JSON.stringify(
            session
        )

    );


    return session;

}


/* =========================================================
   BUSCAR PERFIL
========================================================= */

async function getProfile(
    uid
) {

    if (!uid) {

        return null;

    }


    /* =====================================================
       ADMIN
    ===================================================== */

    if (
        uid ===
        ADMIN_UID
    ) {

        return {

            id:
                uid,

            uid:
                uid,

            role:
                ROLES.ADMIN,

            account_type:
                ROLES.ADMIN

        };

    }


    /* =====================================================
       PRIMEIRO:
       TABELA USERS

       Esta é a tabela utilizada pelo
       sistema antigo que estava funcional.
    ===================================================== */

    const usersResult =
        await supabase

            .from("users")

            .select("*")

            .eq(
                "id",
                uid
            )

            .maybeSingle();


    if (
        usersResult.error
    ) {

        console.warn(

            "AV Market: erro ao consultar users:",

            usersResult.error

        );

    }


    if (
        usersResult.data
    ) {

        return {

            uid:
                uid,

            ...usersResult.data

        };

    }


    /* =====================================================
       SEGUNDO:
       TABELA PERFIS

       Mantemos compatibilidade com o auth.js atual.
    ===================================================== */

    const perfisResult =
        await supabase

            .from("perfis")

            .select("*")

            .eq(
                "id",
                uid
            )

            .maybeSingle();


    if (
        perfisResult.error
    ) {

        console.warn(

            "AV Market: erro ao consultar perfis:",

            perfisResult.error

        );

    }


    if (
        perfisResult.data
    ) {

        return {

            uid:
                uid,

            ...perfisResult.data

        };

    }


    return null;

}


/* =========================================================
   REDIRECIONAMENTO POR ROLE
========================================================= */

function redirectByRole(
    role
) {

    const normalized =
        String(
            role || ""
        )
        .trim()
        .toLowerCase();


    let destination;


    switch (
        normalized
    ) {

        case ROLES.COMPRADOR:

            destination =
                PROFILE_PATHS.comprador;

            break;


        case ROLES.REVENDEDOR:

            destination =
                PROFILE_PATHS.revendedor;

            break;


        case ROLES.ADMIN:

            destination =
                PROFILE_PATHS.admin;

            break;


        default:

            console.error(

                "AV Market: role não reconhecida:",
                normalized

            );

            return false;

    }


    /*
     * Todos os perfis estão dentro da pasta pages.
     *
     * Por isso utilizamos apenas o nome do ficheiro
     * quando estamos dentro de pages.
     */

    window.location.replace(
        destination
    );


    return true;

}


/* =========================================================
   MENSAGEM DE ERRO SUPABASE
========================================================= */

function getSupabaseErrorMessage(
    error
) {

    if (!error) {

        return (
            "Não foi possível concluir a operação. " +
            "Tente novamente."
        );

    }


    const message =
        String(
            error.message ||
            ""
        ).toLowerCase();


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
            "O seu e-mail ainda não foi confirmado."
        );

    }


    if (
        message.includes(
            "user already registered"
        )
    ) {

        return (
            "Este e-mail já está registado. " +
            "Entre na sua conta."
        );

    }


    if (
        message.includes(
            "password"
        ) &&
        message.includes(
            "6"
        )
    ) {

        return (
            "A palavra-passe deve ter pelo menos 6 caracteres."
        );

    }


    if (
        message.includes(
            "network"
        )
    ) {

        return (
            "Erro de ligação. Verifique a sua internet."
        );

    }


    console.error(
        "AV Market Supabase:",
        error
    );


    return (
        error.message ||
        "Não foi possível concluir a operação."
    );

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {


    const emailInput =
        document.getElementById(
            "email"
        ) ||
        document.getElementById(
            "loginEmail"
        );


    const passwordInput =
        document.getElementById(
            "password"
        ) ||
        document.getElementById(
            "loginPassword"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    let loginInProgress =
        false;


    loginForm.addEventListener(
        "submit",
        async (
            event
        ) => {


            event.preventDefault();


            if (
                loginInProgress
            ) {

                return;

            }


            const email =
                emailInput?.value
                    ?.trim()
                    .toLowerCase() ||
                "";


            const password =
                passwordInput?.value ||
                "";


            clearMessage(
                loginMessage
            );


            /* =============================================
               VALIDAÇÃO
            ============================================= */

            if (!email) {

                showMessage(
                    loginMessage,
                    "Introduza o seu e-mail."
                );


                emailInput?.focus();


                return;

            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "Introduza a sua palavra-passe."
                );


                passwordInput?.focus();


                return;

            }


            loginInProgress =
                true;


            setButtonLoading(

                loginButton,

                true,

                "A entrar..."

            );


            try {


                /* =========================================
                   AUTENTICAR NO SUPABASE
                ========================================= */

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

                    "AV Market — login realizado:",
                    user.id

                );


                /* =========================================
                   IDENTIFICAR ADMIN
                ========================================= */

                let role;


                if (
                    user.id ===
                    ADMIN_UID
                ) {

                    role =
                        ROLES.ADMIN;

                }

                else {


                    /* =====================================
                       BUSCAR PERFIL
                    ===================================== */

                    const profile =
                        await getProfile(
                            user.id
                        );


                    if (!profile) {

                        throw new Error(
                            "PERFIL_NAO_ENCONTRADO"
                        );

                    }


                    role =
                        normalizeRole(
                            profile
                        );


                }


                /* =========================================
                   VERIFICAR ROLE
                ========================================= */

                if (!role) {

                    throw new Error(
                        "ROLE_NAO_DEFINIDA"
                    );

                }


                if (
                    ![
                        ROLES.COMPRADOR,
                        ROLES.REVENDEDOR,
                        ROLES.ADMIN
                    ].includes(
                        role
                    )
                ) {

                    throw new Error(
                        "ROLE_INVALIDA"
                    );

                }


                /* =========================================
                   GUARDAR SESSÃO
                ========================================= */

                let profile;


                if (
                    role ===
                    ROLES.ADMIN
                ) {

                    profile = {

                        id:
                            user.id,

                        uid:
                            user.id,

                        role:
                            ROLES.ADMIN,

                        name:
                            user.user_metadata?.name ||
                            "Administrador",

                        email:
                            user.email ||
                            ""

                    };

                }

                else {

                    profile =
                        await getProfile(
                            user.id
                        );

                }


                saveLocalSession(

                    user,

                    profile,

                    role

                );


                /* =========================================
                   MENSAGEM
                ========================================= */

                showMessage(

                    loginMessage,

                    "Login realizado com sucesso! A entrar...",

                    "success"

                );


                /* =========================================
                   REDIRECIONAMENTO INTELIGENTE
                ========================================= */

                setTimeout(
                    () => {

                        redirectByRole(
                            role
                        );

                    },
                    350
                );


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

                            loginMessage,

                            "A conta foi autenticada, mas o perfil não foi encontrado."

                        );

                        break;


                    case "ROLE_NAO_DEFINIDA":

                        showMessage(

                            loginMessage,

                            "O tipo desta conta não está definido."

                        );

                        break;


                    case "ROLE_INVALIDA":

                        showMessage(

                            loginMessage,

                            "O tipo desta conta não é reconhecido."

                        );

                        break;


                    case "UTILIZADOR_NAO_ENCONTRADO":

                        showMessage(

                            loginMessage,

                            "Não foi possível identificar a conta."

                        );

                        break;


                    default:

                        showMessage(

                            loginMessage,

                            getSupabaseErrorMessage(
                                error
                            )

                        );

                }


                restoreLoginButton(
                    loginButton
                );


            }

            finally {

                loginInProgress =
                    false;

            }


        }
    );

}


/* =========================================================
   FUNÇÃO CENTRAL DE CRIAÇÃO DE CONTA
========================================================= */

async function registerAccount({

    form,

    name,

    email,

    phone,

    password,

    confirmPassword,

    role,

    termsAccepted,

    messageElement,

    button,

    isSeller = false

}) {


    /* =====================================================
       VALIDAÇÕES
    ===================================================== */

    if (!name) {

        showMessage(

            messageElement,

            "Introduza o seu nome."

        );

        return false;

    }


    if (!email) {

        showMessage(

            messageElement,

            "Introduza o seu e-mail."

        );

        return false;

    }


    if (!phone) {

        showMessage(

            messageElement,

            "Introduza o seu telefone ou WhatsApp."

        );

        return false;

    }


    if (
        password.length < 6
    ) {

        showMessage(

            messageElement,

            "A palavra-passe deve ter pelo menos 6 caracteres."

        );

        return false;

    }


    if (
        password !==
        confirmPassword
    ) {

        showMessage(

            messageElement,

            "As palavras-passe não coincidem."

        );

        return false;

    }


    if (
        !termsAccepted
    ) {

        showMessage(

            messageElement,

            isSeller

                ? "Aceite o contrato de revendedor para continuar."

                : "Aceite os termos de utilização para continuar."

        );

        return false;

    }


    setButtonLoading(

        button,

        true,

        "A criar conta..."

    );


    try {


        /* =================================================
           CRIAR UTILIZADOR NO SUPABASE AUTH
        ================================================= */

        const {
            data,
            error
        } =
            await supabase.auth.signUp({

                email:

                    email,

                password:

                    password,

                options: {

                    data: {

                        name:

                            name,

                        phone:

                            phone,

                        role:

                            role

                    }

                }

            });


        if (error) {

            throw error;

        }


        const createdUser =
            data?.user;


        if (!createdUser) {

            throw new Error(
                "UTILIZADOR_NAO_CRIADO"
            );

        }


        console.log(

            "AV Market — conta criada:",

            createdUser.id,

            role

        );


        /* =================================================
           CRIAR PERFIL NA TABELA USERS

           Mantemos exatamente a lógica do sistema
           anterior que já estava funcional.
        ================================================= */

        const profileData = {

            id:

                createdUser.id,

            name:

                name,

            email:

                email,

            phone:

                phone,

            role:

                role,

            account_type:

                role,

            status:

                "active",

            profile_complete:

                true

        };


        if (isSeller) {

            profileData.contract_accepted =
                true;

        }


        const {
            error:
                profileError
        } =
            await supabase

                .from("users")

                .insert(
                    profileData
                );


        if (profileError) {

            console.error(

                "AV Market — erro ao criar perfil:",

                profileError

            );


            throw new Error(
                "PERFIL_NAO_CRIADO"
            );

        }


        /* =================================================
           LIMPAR PASSWORDS
        ================================================= */

        const passwordInput =
            form.querySelector(
                'input[type="password"]'
            );


        if (passwordInput) {

            /*
             * Não apagamos todos os campos,
             * apenas passwords.
             */

        }


        const passwordInputs =
            form.querySelectorAll(
                'input[type="password"]'
            );


        passwordInputs.forEach(
            input => {

                input.value =
                    "";

            }
        );


        /* =================================================
           SE O SUPABASE EXIGIR CONFIRMAÇÃO
        ================================================= */

        if (!data.session) {

            showMessage(

                messageElement,

                "Conta criada! Verifique o seu e-mail para confirmar a conta.",

                "success"

            );


            return true;

        }


        /* =================================================
           CRIAR SESSÃO LOCAL
        ================================================= */

        saveLocalSession(

            createdUser,

            profileData,

            role

        );


        /* =================================================
           MENSAGEM
        ================================================= */

        showMessage(

            messageElement,

            "Conta criada com sucesso! A entrar...",

            "success"

        );


        /* =================================================
           REDIRECIONAMENTO
        ================================================= */

        setTimeout(
            () => {

                redirectByRole(
                    role
                );

            },
            350
        );


        return true;


    }

    catch (error) {


        console.error(

            "AV Market — erro ao criar conta:",

            error

        );


        switch (
            error?.message
        ) {

            case "PERFIL_NAO_CRIADO":

                showMessage(

                    messageElement,

                    "A conta foi criada, mas não foi possível criar o perfil. Verifique as permissões da tabela users."

                );

                break;


            case "UTILIZADOR_NAO_CRIADO":

                showMessage(

                    messageElement,

                    "Não foi possível criar o utilizador."

                );

                break;


            default:

                showMessage(

                    messageElement,

                    getSupabaseErrorMessage(
                        error
                    )

                );

        }


        return false;


    }

    finally {

        if (
            button
        ) {

            button.disabled =
                false;

            button.setAttribute(
                "aria-busy",
                "false"
            );

        }

    }

}


/* =========================================================
   CRIAR CONTA — COMPRADOR
========================================================= */

const buyerRegisterForm =
    document.getElementById(
        "buyerRegisterForm"
    );


if (buyerRegisterForm) {


    const buyerName =
        document.getElementById(
            "buyerName"
        );


    const buyerEmail =
        document.getElementById(
            "buyerEmail"
        );


    const buyerPhone =
        document.getElementById(
            "buyerPhone"
        );


    const buyerPassword =
        document.getElementById(
            "buyerPassword"
        );


    const buyerConfirmPassword =
        document.getElementById(
            "buyerConfirmPassword"
        );


    const buyerTerms =
        document.getElementById(
            "buyerTerms"
        );


    const buyerCreateButton =
        document.getElementById(
            "buyerCreateButton"
        );


    const buyerRegisterMessage =
        document.getElementById(
            "buyerRegisterMessage"
        );


    let buyerInProgress =
        false;


    buyerRegisterForm.addEventListener(

        "submit",

        async (
            event
        ) => {


            event.preventDefault();


            if (
                buyerInProgress
            ) {

                return;

            }


            buyerInProgress =
                true;


            try {


                await registerAccount({

                    form:
                        buyerRegisterForm,

                    name:
                        buyerName?.value
                            ?.trim() ||
                        "",

                    email:
                        buyerEmail?.value
                            ?.trim()
                            ?.toLowerCase() ||
                        "",

                    phone:
                        buyerPhone?.value
                            ?.trim() ||
                        "",

                    password:
                        buyerPassword?.value ||
                        "",

                    confirmPassword:
                        buyerConfirmPassword?.value ||
                        "",

                    role:
                        ROLES.COMPRADOR,

                    termsAccepted:
                        buyerTerms?.checked === true,

                    messageElement:
                        buyerRegisterMessage,

                    button:
                        buyerCreateButton,

                    isSeller:
                        false

                });


            }

            finally {

                buyerInProgress =
                    false;

            }

        }

    );

}


/* =========================================================
   CRIAR CONTA — REVENDEDOR
========================================================= */

const sellerRegisterForm =
    document.getElementById(
        "sellerRegisterForm"
    );


if (sellerRegisterForm) {


    const sellerName =
        document.getElementById(
            "sellerName"
        );


    const sellerEmail =
        document.getElementById(
            "sellerEmail"
        );


    const sellerPhone =
        document.getElementById(
            "sellerPhone"
        );


    const sellerPassword =
        document.getElementById(
            "sellerPassword"
        );


    const sellerConfirmPassword =
        document.getElementById(
            "sellerConfirmPassword"
        );


    const sellerTerms =
        document.getElementById(
            "sellerTerms"
        );


    const sellerCreateButton =
        document.getElementById(
            "sellerCreateButton"
        );


    const sellerRegisterMessage =
        document.getElementById(
            "sellerRegisterMessage"
        );


    let sellerInProgress =
        false;


    sellerRegisterForm.addEventListener(

        "submit",

        async (
            event
        ) => {


            event.preventDefault();


            if (
                sellerInProgress
            ) {

                return;

            }


            sellerInProgress =
                true;


            try {


                await registerAccount({

                    form:
                        sellerRegisterForm,

                    name:
                        sellerName?.value
                            ?.trim() ||
                        "",

                    email:
                        sellerEmail?.value
                            ?.trim()
                            ?.toLowerCase() ||
                        "",

                    phone:
                        sellerPhone?.value
                            ?.trim() ||
                        "",

                    password:
                        sellerPassword?.value ||
                        "",

                    confirmPassword:
                        sellerConfirmPassword?.value ||
                        "",

                    role:
                        ROLES.REVENDEDOR,

                    termsAccepted:
                        sellerTerms?.checked === true,

                    messageElement:
                        sellerRegisterMessage,

                    button:
                        sellerCreateButton,

                    isSeller:
                        true

                });


            }

            finally {

                sellerInProgress =
                    false;

            }

        }

    );

}


/* =========================================================
   CONTRATO DO REVENDEDOR
========================================================= */

const acceptContract =
    document.getElementById(
        "acceptContract"
    );


const contractContinueButton =
    document.getElementById(
        "contractContinueButton"
    );


if (
    acceptContract &&
    contractContinueButton
) {


    acceptContract.addEventListener(

        "change",

        () => {


            if (
                acceptContract.checked
            ) {


                sessionStorage.setItem(

                    "avMarketContractAccepted",

                    "true"

                );


                sessionStorage.setItem(

                    "avMarketContractAcceptedAt",

                    String(
                        Date.now()
                    )

                );


                contractContinueButton
                    .classList
                    .remove(
                        "disabled"
                    );


                contractContinueButton
                    .setAttribute(
                        "aria-disabled",
                        "false"
                    );


            }

            else {


                sessionStorage.removeItem(

                    "avMarketContractAccepted"

                );


                sessionStorage.removeItem(

                    "avMarketContractAcceptedAt"

                );


                contractContinueButton
                    .classList
                    .add(
                        "disabled"
                    );


                contractContinueButton
                    .setAttribute(
                        "aria-disabled",
                        "true"
                    );

            }

        }

    );


    contractContinueButton.addEventListener(

        "click",

        event => {


            if (
                !acceptContract.checked
            ) {

                event.preventDefault();

                return;

            }


            sessionStorage.setItem(

                "avMarketContractAccepted",

                "true"

            );


            sessionStorage.setItem(

                "avMarketContractAcceptedAt",

                String(
                    Date.now()
                )

            );

        }

    );

}


/* =========================================================
   EXPORTAÇÃO GLOBAL
========================================================= */

window.AVMarketAuthSmart = {

    supabase,

    ROLES,

    ADMIN_UID,

    normalizeRole,

    getProfile,

    redirectByRole,

    saveLocalSession

};


/* =========================================================
   DEBUG
========================================================= */

console.log(

    "AV Market — script-3.js carregado corretamente."

);
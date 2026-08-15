/* =========================================================
   AV MARKET
   SCRIPT-3.JS
   AUTENTICAÇÃO INTELIGENTE

   Responsável por:

   - Login Supabase
   - Identificação da conta
   - Admin
   - Comprador
   - Revendedor
   - Criação de conta comprador
   - Criação de conta revendedor
   - Criação dos perfis
   - Sessão local
   - Redirecionamento inteligente

   IMPORTANTE:
   script-2.js continua responsável pela
   animação e navegação visual.
========================================================= */

"use strict";


/* =========================================================
   SUPABASE
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

    ADMIN:
        "admin",

    COMPRADOR:
        "comprador",

    REVENDEDOR:
        "revendedor"

});


/* =========================================================
   CAMINHOS DOS PERFIS
========================================================= */

const PROFILE_PATHS = Object.freeze({

    admin:
        "admin.html",

    comprador:
        "perfil-comprador.html",

    revendedor:
        "perfil-revendedor.html"

});


/* =========================================================
   SESSÃO LOCAL
========================================================= */

const SESSION_KEYS = [

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


/* =========================================================
   ELEMENTOS DO LOGIN
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );


const loginPassword =
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


/* =========================================================
   ELEMENTOS COMPRADOR
========================================================= */

const buyerForm =
    document.getElementById(
        "buyerRegisterForm"
    );


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


const buyerMessage =
    document.getElementById(
        "buyerRegisterMessage"
    );


/* =========================================================
   ELEMENTOS REVENDEDOR
========================================================= */

const sellerForm =
    document.getElementById(
        "sellerRegisterForm"
    );


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


const sellerMessage =
    document.getElementById(
        "sellerRegisterMessage"
    );


/* =========================================================
   FUNÇÕES DE MENSAGEM
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


    element.style.display =
        "block";

}


function clearMessage(
    element
) {

    if (!element) {

        return;

    }


    element.textContent =
        "";


    element.classList.remove(
        "success",
        "error"
    );


    element.style.display =
        "none";

}


/* =========================================================
   LIMPAR SESSÃO LOCAL
========================================================= */

function clearLocalSession() {

    SESSION_KEYS.forEach(
        key => {

            try {

                localStorage.removeItem(
                    key
                );

            }

            catch (error) {

                console.warn(
                    "AV Market: erro ao limpar localStorage:",
                    error
                );

            }


            try {

                sessionStorage.removeItem(
                    key
                );

            }

            catch (error) {

                console.warn(
                    "AV Market: erro ao limpar sessionStorage:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   GUARDAR SESSÃO
========================================================= */

function saveLocalSession(
    user,
    profile,
    role
) {

    if (!user) {

        return null;

    }


    const session = {

        uid:
            user.id,

        id:
            user.id,

        nome:
            profile?.name ||
            profile?.nome ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            "Minha Conta",

        email:
            profile?.email ||
            user.email ||
            "",

        telefone:
            profile?.phone ||
            profile?.telefone ||
            user.user_metadata?.phone ||
            "",

        role:
            role,

        tipo:
            role,

        foto:
            profile?.foto ||
            profile?.photo ||
            user.user_metadata?.avatar_url ||
            "",

        criadoEm:
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
   NORMALIZAR ROLE
========================================================= */

function normalizeRole(
    profile
) {

    if (!profile) {

        return "";

    }


    const role =

        profile.role ||

        profile.account_type ||

        profile.accountType ||

        profile.tipo ||

        profile.tipoConta ||

        profile.userType ||

        profile.type ||

        "";


    return String(
        role
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   VALIDAR ROLE
========================================================= */

function isValidRole(
    role
) {

    return (

        role === "admin" ||

        role === "administrador" ||

        role === "comprador" ||

        role === "buyer" ||

        role === "revendedor" ||

        role === "vendedor" ||

        role === "seller"

    );

}


/* =========================================================
   CONVERTER ROLE PARA ROLE OFICIAL
========================================================= */

function getOfficialRole(
    role
) {

    const normalized =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    switch (
        normalized
    ) {

        case "admin":

        case "administrador":

            return ROLES.ADMIN;


        case "comprador":

        case "buyer":

            return ROLES.COMPRADOR;


        case "revendedor":

        case "vendedor":

        case "seller":

            return ROLES.REVENDEDOR;


        default:

            return "";

    }

}


/* =========================================================
   REDIRECIONAMENTO INTELIGENTE
========================================================= */

function redirectByRole(
    role
) {

    const officialRole =
        getOfficialRole(
            role
        );


    if (!officialRole) {

        return false;

    }


    const destination =
        PROFILE_PATHS[
            officialRole
        ];


    if (!destination) {

        return false;

    }


    console.log(
        "AV Market — redirecionamento:",
        officialRole,
        "→",
        destination
    );


    window.location.replace(
        destination
    );


    return true;

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


    /*
     * PRIMEIRO:
     * tabela users
     *
     * É a estrutura utilizada
     * pela lógica anterior funcional.
     */

    try {

        const {
            data,
            error
        } = await supabase

            .from("users")

            .select("*")

            .eq(
                "id",
                uid
            )

            .maybeSingle();


        if (!error && data) {

            return data;

        }


        /*
         * Se a tabela users não devolver
         * o perfil, tentamos a tabela
         * perfis utilizada pelo novo
         * sistema central.
         */

        if (
            error &&
            error.code !== "PGRST116"
        ) {

            console.warn(
                "AV Market — users não disponível:",
                error
            );

        }

    }

    catch (error) {

        console.warn(
            "AV Market — erro ao consultar users:",
            error
        );

    }


    /* =====================================================
       SEGUNDA TENTATIVA — PERFIS
    ===================================================== */

    try {

        const {
            data,
            error
        } = await supabase

            .from("perfis")

            .select("*")

            .eq(
                "id",
                uid
            )

            .maybeSingle();


        if (
            error
        ) {

            console.warn(
                "AV Market — erro ao consultar perfis:",
                error
            );


            return null;

        }


        return data || null;

    }

    catch (error) {

        console.error(
            "AV Market — erro ao buscar perfil:",
            error
        );


        return null;

    }

}


/* =========================================================
   MENSAGEM DE ERRO SUPABASE
========================================================= */

function getSupabaseErrorMessage(
    error
) {

    const message =
        String(
            error?.message ||
            error?.code ||
            ""
        )
            .toLowerCase();


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
            "Confirme o seu e-mail antes de entrar."
        );

    }


    if (
        message.includes(
            "already registered"
        )
    ) {

        return (
            "Este e-mail já está registado."
        );

    }


    if (
        message.includes(
            "user already registered"
        )
    ) {

        return (
            "Este e-mail já está registado."
        );

    }


    if (
        message.includes(
            "invalid email"
        )
    ) {

        return (
            "O e-mail introduzido não é válido."
        );

    }


    if (
        message.includes(
            "password"
        )
    ) {

        return (
            "A palavra-passe não cumpre os requisitos."
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


    return (
        "Ocorreu um erro. Tente novamente."
    );

}


/* =========================================================
   LOADING LOGIN
========================================================= */

function setLoginLoading(
    loading
) {

    if (!loginButton) {

        return;

    }


    loginButton.disabled =
        loading;


    if (loading) {

        loginButton.textContent =
            "A entrar...";

    }

    else {

        loginButton.textContent =
            "Entrar";

    }

}


/* =========================================================
   LOADING COMPRADOR
========================================================= */

function setBuyerLoading(
    loading
) {

    if (!buyerCreateButton) {

        return;

    }


    buyerCreateButton.disabled =
        loading;


    if (loading) {

        buyerCreateButton.textContent =
            "A criar conta...";

    }

    else {

        buyerCreateButton.textContent =
            "Criar conta";

    }

}


/* =========================================================
   LOADING REVENDEDOR
========================================================= */

function setSellerLoading(
    loading
) {

    if (!sellerCreateButton) {

        return;

    }


    sellerCreateButton.disabled =
        loading;


    if (loading) {

        sellerCreateButton.textContent =
            "A criar conta...";

    }

    else {

        sellerCreateButton.textContent =
            "Criar conta";

    }

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    let loginInProgress =
        false;


    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                loginInProgress
            ) {

                return;

            }


            clearMessage(
                loginMessage
            );


            const email =
                loginEmail?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const password =
                loginPassword?.value ||
                "";


            /* =============================================
               VALIDAR
            ============================================= */

            if (!email) {

                showMessage(
                    loginMessage,
                    "Introduza o seu e-mail."
                );


                loginEmail?.focus();

                return;

            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "Introduza a sua palavra-passe."
                );


                loginPassword?.focus();

                return;

            }


            loginInProgress =
                true;


            setLoginLoading(
                true
            );


            try {

                clearLocalSession();


                /* =========================================
                   SUPABASE AUTH
                ========================================= */

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
                    "AV Market — login Supabase OK:",
                    user.id
                );


                /* =========================================
                   ADMINISTRADOR
                   
                   O UID oficial tem prioridade.
                ========================================= */

                if (
                    user.id ===
                    ADMIN_UID
                ) {

                    const adminProfile = {

                        id:
                            user.id,

                        uid:
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


                    saveLocalSession(

                        user,

                        adminProfile,

                        ROLES.ADMIN

                    );


                    showMessage(
                        loginMessage,
                        "Login efetuado. A entrar...",
                        "success"
                    );


                    setTimeout(
                        () => {

                            redirectByRole(
                                ROLES.ADMIN
                            );

                        },
                        300
                    );


                    return;

                }


                /* =========================================
                   BUSCAR PERFIL
                ========================================= */

                const profile =
                    await getProfile(
                        user.id
                    );


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


                /* =========================================
                   IDENTIFICAR ROLE
                ========================================= */

                const role =
                    getOfficialRole(
                        normalizeRole(
                            profile
                        )
                    );


                if (!role) {

                    await supabase.auth.signOut();

                    clearLocalSession();


                    throw new Error(
                        "ROLE_NAO_DEFINIDA"
                    );

                }


                if (
                    !isValidRole(
                        role
                    )
                ) {

                    await supabase.auth.signOut();

                    clearLocalSession();


                    throw new Error(
                        "ROLE_INVALIDA"
                    );

                }


                /* =========================================
                   GUARDAR SESSÃO
                ========================================= */

                saveLocalSession(

                    user,

                    profile,

                    role

                );


                console.log(
                    "AV Market — role identificada:",
                    role
                );


                showMessage(
                    loginMessage,
                    "Login efetuado. A entrar...",
                    "success"
                );


                /* =========================================
                   REDIRECIONAR
                ========================================= */

                setTimeout(
                    () => {

                        redirectByRole(
                            role
                        );

                    },
                    300
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

            }

            finally {

                loginInProgress =
                    false;


                setLoginLoading(
                    false
                );

            }

        }
    );

}


/* =========================================================
   CRIAR CONTA — COMPRADOR
========================================================= */

if (buyerForm) {

    let buyerRegistrationInProgress =
        false;


    buyerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                buyerRegistrationInProgress
            ) {

                return;

            }


            clearMessage(
                buyerMessage
            );


            const name =
                buyerName?.value
                    .trim() ||
                "";


            const email =
                buyerEmail?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const phone =
                buyerPhone?.value
                    .trim() ||
                "";


            const password =
                buyerPassword?.value ||
                "";


            const confirmPassword =
                buyerConfirmPassword?.value ||
                "";


            /* =============================================
               VALIDAÇÕES
            ============================================= */

            if (!name) {

                showMessage(
                    buyerMessage,
                    "Introduza o seu nome completo."
                );


                buyerName?.focus();

                return;

            }


            if (!email) {

                showMessage(
                    buyerMessage,
                    "Introduza o seu e-mail."
                );


                buyerEmail?.focus();

                return;

            }


            if (!phone) {

                showMessage(
                    buyerMessage,
                    "Introduza o seu telefone ou WhatsApp."
                );


                buyerPhone?.focus();

                return;

            }


            if (
                password.length <
                6
            ) {

                showMessage(
                    buyerMessage,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );


                buyerPassword?.focus();

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    buyerMessage,
                    "As palavras-passe não coincidem."
                );


                buyerConfirmPassword?.focus();

                return;

            }


            if (
                buyerTerms &&
                !buyerTerms.checked
            ) {

                showMessage(
                    buyerMessage,
                    "Aceite os termos de utilização e a política de privacidade para continuar."
                );


                return;

            }


            buyerRegistrationInProgress =
                true;


            setBuyerLoading(
                true
            );


            try {

                clearLocalSession();


                /* =========================================
                   CRIAR AUTH
                ========================================= */

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
                                    ROLES.COMPRADOR

                            }

                        }

                    });


                if (error) {

                    throw error;

                }


                const user =
                    data?.user;


                if (!user) {

                    throw new Error(
                        "UTILIZADOR_NAO_CRIADO"
                    );

                }


                console.log(
                    "AV Market — comprador criado:",
                    user.id
                );


                /* =========================================
                   CRIAR PERFIL NA TABELA USERS
                ========================================= */

                const {
                    error: profileError
                } =
                    await supabase

                        .from("users")

                        .insert({

                            id:
                                user.id,

                            name:
                                name,

                            email:
                                email,

                            phone:
                                phone,

                            role:
                                ROLES.COMPRADOR,

                            account_type:
                                ROLES.COMPRADOR,

                            status:
                                "active",

                            profile_complete:
                                true

                        });


                if (profileError) {

                    console.error(
                        "AV Market — erro ao criar perfil comprador:",
                        profileError
                    );


                    /*
                     * Tentativa alternativa
                     * para a tabela perfis.
                     */

                    const {
                        error: perfilError
                    } =
                        await supabase

                            .from("perfis")

                            .insert({

                                id:
                                    user.id,

                                name:
                                    name,

                                email:
                                    email,

                                phone:
                                    phone,

                                role:
                                    ROLES.COMPRADOR

                            });


                    if (perfilError) {

                        throw new Error(
                            "PERFIL_NAO_CRIADO"
                        );

                    }

                }


                /* =========================================
                   GUARDAR SESSÃO
                ========================================= */

                if (
                    data.session
                ) {

                    saveLocalSession(

                        user,

                        {

                            id:
                                user.id,

                            name:
                                name,

                            email:
                                email,

                            phone:
                                phone,

                            role:
                                ROLES.COMPRADOR

                        },

                        ROLES.COMPRADOR

                    );

                }


                if (
                    buyerPassword
                ) {

                    buyerPassword.value =
                        "";

                }


                if (
                    buyerConfirmPassword
                ) {

                    buyerConfirmPassword.value =
                        "";

                }


                /* =========================================
                   EMAIL CONFIRMATION
                ========================================= */

                if (
                    !data.session
                ) {

                    showMessage(
                        buyerMessage,
                        "Conta criada! Verifique o seu e-mail para confirmar a conta.",
                        "success"
                    );


                    return;

                }


                showMessage(
                    buyerMessage,
                    "Conta criada com sucesso! A entrar...",
                    "success"
                );


                setTimeout(
                    () => {

                        redirectByRole(
                            ROLES.COMPRADOR
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


                showMessage(

                    buyerMessage,

                    error?.message ===
                    "PERFIL_NAO_CRIADO"

                        ?

                    "A conta foi criada, mas não foi possível criar o perfil."

                        :

                    error?.message ===
                    "UTILIZADOR_NAO_CRIADO"

                        ?

                    "Não foi possível criar o utilizador."

                        :

                    getSupabaseErrorMessage(
                        error
                    )

                );

            }

            finally {

                buyerRegistrationInProgress =
                    false;


                setBuyerLoading(
                    false
                );

            }

        }
    );

}


/* =========================================================
   CRIAR CONTA — REVENDEDOR
========================================================= */

if (sellerForm) {

    let sellerRegistrationInProgress =
        false;


    sellerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                sellerRegistrationInProgress
            ) {

                return;

            }


            clearMessage(
                sellerMessage
            );


            const name =
                sellerName?.value
                    .trim() ||
                "";


            const email =
                sellerEmail?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const phone =
                sellerPhone?.value
                    .trim() ||
                "";


            const password =
                sellerPassword?.value ||
                "";


            const confirmPassword =
                sellerConfirmPassword?.value ||
                "";


            /* =============================================
               VALIDAÇÕES
            ============================================= */

            if (!name) {

                showMessage(
                    sellerMessage,
                    "Introduza o seu nome completo."
                );


                sellerName?.focus();

                return;

            }


            if (!email) {

                showMessage(
                    sellerMessage,
                    "Introduza o seu e-mail."
                );


                sellerEmail?.focus();

                return;

            }


            if (!phone) {

                showMessage(
                    sellerMessage,
                    "Introduza o seu telefone ou WhatsApp."
                );


                sellerPhone?.focus();

                return;

            }


            if (
                password.length <
                6
            ) {

                showMessage(
                    sellerMessage,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );


                sellerPassword?.focus();

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    sellerMessage,
                    "As palavras-passe não coincidem."
                );


                sellerConfirmPassword?.focus();

                return;

            }


            if (
                sellerTerms &&
                !sellerTerms.checked
            ) {

                showMessage(
                    sellerMessage,
                    "Aceite o contrato de revendedor para continuar."
                );


                return;

            }


            sellerRegistrationInProgress =
                true;


            setSellerLoading(
                true
            );


            try {

                clearLocalSession();


                /* =========================================
                   CRIAR AUTH
                ========================================= */

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
                                    ROLES.REVENDEDOR

                            }

                        }

                    });


                if (error) {

                    throw error;

                }


                const user =
                    data?.user;


                if (!user) {

                    throw new Error(
                        "UTILIZADOR_NAO_CRIADO"
                    );

                }


                console.log(
                    "AV Market — revendedor criado:",
                    user.id
                );


                /* =========================================
                   CRIAR PERFIL
                ========================================= */

                const {
                    error: profileError
                } =
                    await supabase

                        .from("users")

                        .insert({

                            id:
                                user.id,

                            name:
                                name,

                            email:
                                email,

                            phone:
                                phone,

                            role:
                                ROLES.REVENDEDOR,

                            account_type:
                                ROLES.REVENDEDOR,

                            status:
                                "active",

                            profile_complete:
                                true

                        });


                if (profileError) {

                    console.error(
                        "AV Market — erro ao criar perfil revendedor:",
                        profileError
                    );


                    /*
                     * Tentativa alternativa
                     * para perfis.
                     */

                    const {
                        error: perfilError
                    } =
                        await supabase

                            .from("perfis")

                            .insert({

                                id:
                                    user.id,

                                name:
                                    name,

                                email:
                                    email,

                                phone:
                                    phone,

                                role:
                                    ROLES.REVENDEDOR

                            });


                    if (perfilError) {

                        throw new Error(
                            "PERFIL_NAO_CRIADO"
                        );

                    }

                }


                /* =========================================
                   GUARDAR SESSÃO
                ========================================= */

                if (
                    data.session
                ) {

                    saveLocalSession(

                        user,

                        {

                            id:
                                user.id,

                            name:
                                name,

                            email:
                                email,

                            phone:
                                phone,

                            role:
                                ROLES.REVENDEDOR

                        },

                        ROLES.REVENDEDOR

                    );

                }


                /* =========================================
                   LIMPAR CONTRATO
                ========================================= */

                sessionStorage.removeItem(
                    "avMarketContractAccepted"
                );


                sessionStorage.removeItem(
                    "avMarketContractAcceptedAt"
                );


                if (
                    sellerPassword
                ) {

                    sellerPassword.value =
                        "";

                }


                if (
                    sellerConfirmPassword
                ) {

                    sellerConfirmPassword.value =
                        "";

                }


                /* =========================================
                   CONFIRMAÇÃO DE EMAIL
                ========================================= */

                if (
                    !data.session
                ) {

                    showMessage(
                        sellerMessage,
                        "Conta criada! Verifique o seu e-mail para confirmar a conta.",
                        "success"
                    );


                    return;

                }


                showMessage(
                    sellerMessage,
                    "Conta de revendedor criada com sucesso! A entrar...",
                    "success"
                );


                setTimeout(
                    () => {

                        redirectByRole(
                            ROLES.REVENDEDOR
                        );

                    },
                    500
                );

            }

            catch (error) {

                console.error(
                    "AV Market — erro ao criar revendedor:",
                    error
                );


                showMessage(

                    sellerMessage,

                    error?.message ===
                    "PERFIL_NAO_CRIADO"

                        ?

                    "A conta foi criada, mas não foi possível criar o perfil."

                        :

                    error?.message ===
                    "UTILIZADOR_NAO_CRIADO"

                        ?

                    "Não foi possível criar o utilizador."

                        :

                    getSupabaseErrorMessage(
                        error
                    )

                );

            }

            finally {

                sellerRegistrationInProgress =
                    false;


                setSellerLoading(
                    false
                );

            }

        }
    );

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "AV Market — script-3.js carregado."
);
/* ======================================================
   AV MARKET
   SISTEMA CENTRAL DE AUTENTICAÇÃO E SESSÃO
   SUPABASE AUTH + PROFILES
====================================================== */

"use strict";


/* ======================================================
   IMPORTAÇÃO SUPABASE
====================================================== */

import {
    supabase
} from "./supabase-config.js";


/* ======================================================
   ROLES OFICIAIS
====================================================== */

const ROLES = Object.freeze({

    COMPRADOR:
        "comprador",

    REVENDEDOR:
        "revendedor",

    ADMIN:
        "admin"

});


/* ======================================================
   UID OFICIAL DO ADMINISTRADOR
====================================================== */

const ADMIN_UID =
    "f82df114-169b-4c24-8e7e-748555898720";


/* ======================================================
   TABELA PRINCIPAL DE PERFIS
====================================================== */

const PROFILE_TABLE =
    "profiles";


/* ======================================================
   CHAVES DA SESSÃO LOCAL
====================================================== */

const SESSION_KEYS = Object.freeze([

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

]);


/* ======================================================
   NORMALIZAR ROLE
====================================================== */

function normalizeRole(profile) {

    if (!profile) {

        return "";

    }


    const value =

        profile.role ||

        profile.account_type ||

        profile.accountType ||

        profile.tipoConta ||

        profile.tipo ||

        profile.userType ||

        profile.type ||

        "";


    return String(value)
        .trim()
        .toLowerCase();

}


/* ======================================================
   VERIFICAR ROLE VÁLIDA
====================================================== */

function isValidRole(role) {

    return (

        role ===
        ROLES.COMPRADOR ||

        role ===
        ROLES.REVENDEDOR ||

        role ===
        ROLES.ADMIN

    );

}


/* ======================================================
   BUSCAR PERFIL NO SUPABASE
====================================================== */

async function getUserProfile(uid) {

    if (!uid) {

        return null;

    }


    /* ==================================================
       ADMINISTRADOR
    ================================================== */

    if (
        uid ===
        ADMIN_UID
    ) {

        const {
            data,
            error
        } =
            await supabase

                .from(PROFILE_TABLE)

                .select("*")

                .eq(
                    "id",
                    uid
                )

                .maybeSingle();


        if (
            error &&
            error.code !== "PGRST116"
        ) {

            throw error;

        }


        /*
         * Se o administrador ainda não tiver
         * perfil, mantemos o comportamento
         * especial que já funcionava.
         */

        if (!data) {

            return {

                id:
                    uid,

                uid:
                    uid,

                email:
                    null,

                role:
                    ROLES.ADMIN

            };

        }


        return {

            uid:
                uid,

            ...data,

            role:
                ROLES.ADMIN

        };

    }


    /* ==================================================
       UTILIZADORES NORMAIS
    ================================================== */

    const {
        data,
        error
    } =
        await supabase

            .from(PROFILE_TABLE)

            .select("*")

            .eq(
                "id",
                uid
            )

            .maybeSingle();


    if (
        error
    ) {

        throw error;

    }


    if (!data) {

        return null;

    }


    return {

        uid:
            uid,

        ...data

    };

}


/* ======================================================
   CRIAR OBJETO DE SESSÃO
====================================================== */

function buildSession(
    user,
    profile
) {

    if (
        !user ||
        !profile
    ) {

        return null;

    }


    let role =
        normalizeRole(
            profile
        );


    /* ADMIN POR UID */

    if (
        user.id ===
        ADMIN_UID
    ) {

        role =
            ROLES.ADMIN;

    }


    return {

        uid:
            user.id,


        nome:

            profile.name ||

            profile.nome ||

            profile.nomeCompleto ||

            profile.displayName ||

            user.user_metadata?.name ||

            user.user_metadata?.full_name ||

            "Minha Conta",


        email:

            profile.email ||

            user.email ||

            "",


        telefone:

            profile.phone ||

            profile.telefone ||

            profile.phoneNumber ||

            user.phone ||

            "",


        role,


        tipo:
            role,


        foto:

            profile.foto ||

            profile.photoURL ||

            profile.photo ||

            profile.avatar_url ||

            user.user_metadata?.avatar_url ||

            "",


        emailVerificado:

            Boolean(
                user.email_confirmed_at
            ),


        criadoEm:

            profile.created_at ||

            profile.criadoEm ||

            user.created_at ||

            null

    };

}


/* ======================================================
   GUARDAR SESSÃO LOCAL
====================================================== */

function saveLocalSession(
    user,
    profile
) {

    const session =
        buildSession(
            user,
            profile
        );


    if (!session) {

        return null;

    }


    localStorage.setItem(

        "avMarketUser",

        JSON.stringify(
            session
        )

    );


    localStorage.setItem(

        "avMarketUserId",

        session.uid

    );


    localStorage.setItem(

        "avMarketRole",

        session.role

    );


    localStorage.setItem(

        "avMarketSession",

        JSON.stringify(
            session
        )

    );


    return session;

}


/* ======================================================
   LIMPAR SESSÃO LOCAL
====================================================== */

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
                    "AV Market Auth — erro ao limpar localStorage:",
                    key,
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
                    "AV Market Auth — erro ao limpar sessionStorage:",
                    key,
                    error
                );

            }

        }
    );

}


/* ======================================================
   OBTER UTILIZADOR LOCAL
====================================================== */

function getLocalUser() {

    const value =
        localStorage.getItem(
            "avMarketUser"
        );


    if (!value) {

        return null;

    }


    try {

        return JSON.parse(
            value
        );

    }

    catch (error) {

        console.warn(
            "AV Market Auth — sessão local inválida.",
            error
        );


        clearLocalSession();


        return null;

    }

}


/* ======================================================
   OBTER UID LOCAL
====================================================== */

function getLocalUserId() {

    return localStorage.getItem(
        "avMarketUserId"
    );

}


/* ======================================================
   OBTER ROLE LOCAL
====================================================== */

function getLocalRole() {

    return localStorage.getItem(
        "avMarketRole"
    );

}


/* ======================================================
   VERIFICAR AUTENTICAÇÃO REAL
====================================================== */

async function isAuthenticated() {

    try {

        const {
            data,
            error
        } =
            await supabase.auth.getSession();


        if (error) {

            return false;

        }


        return Boolean(
            data?.session
        );

    }

    catch (error) {

        console.error(
            "AV Market Auth — erro ao verificar autenticação:",
            error
        );


        return false;

    }

}


/* ======================================================
   UTILIZADOR ATUAL
====================================================== */

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabase.auth.getUser();


    if (
        error
    ) {

        return null;

    }


    return (
        data?.user ||
        null
    );

}


/* ======================================================
   LOGOUT
====================================================== */

async function logout() {

    try {

        const {
            error
        } =
            await supabase.auth.signOut();


        if (
            error
        ) {

            throw error;

        }

    }

    catch (error) {

        console.error(
            "AV Market Auth — erro ao fazer logout:",
            error
        );


        throw error;

    }

    finally {

        clearLocalSession();

    }

}


/* ======================================================
   PROCESSAR UTILIZADOR AUTENTICADO
====================================================== */

async function processAuthenticatedUser(
    user,
    callback
) {

    if (!user) {

        clearLocalSession();


        callback(
            null,
            null
        );


        return;

    }


    try {

        console.log(
            "AV Market Auth — utilizador autenticado:",
            user.id
        );


        const profile =
            await getUserProfile(
                user.id
            );


        /* ==================================================
           ADMINISTRADOR
        ================================================== */

        if (
            user.id ===
            ADMIN_UID
        ) {

            const adminProfile = {

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


            const session =
                saveLocalSession(
                    user,
                    adminProfile
                );


            callback(

                user,

                {

                    ...adminProfile,

                    ...session

                }

            );


            return;

        }


        /* ==================================================
           UTILIZADOR NORMAL SEM PERFIL
        ================================================== */

        if (!profile) {

            console.warn(
                "AV Market Auth — utilizador autenticado sem perfil:",
                user.id
            );


            clearLocalSession();


            callback(

                user,

                null

            );


            return;

        }


        const role =
            normalizeRole(
                profile
            );


        /* ==================================================
           PERFIL SEM ROLE
        ================================================== */

        if (!role) {

            console.warn(
                "AV Market Auth — perfil sem role:",
                user.id
            );


            clearLocalSession();


            callback(

                user,

                {

                    ...profile,

                    uid:
                        user.id,

                    role:
                        ""

                }

            );


            return;

        }


        /* ==================================================
           ROLE DESCONHECIDA
        ================================================== */

        if (
            !isValidRole(
                role
            )
        ) {

            console.warn(
                "AV Market Auth — role desconhecida:",
                role
            );


            callback(

                user,

                {

                    ...profile,

                    uid:
                        user.id,

                    role

                }

            );


            return;

        }


        /* ==================================================
           GUARDAR SESSÃO
        ================================================== */

        const session =
            saveLocalSession(

                user,

                {

                    ...profile,

                    role

                }

            );


        callback(

            user,

            {

                ...profile,

                ...session

            }

        );

    }

    catch (error) {

        console.error(
            "AV Market Auth — erro ao carregar perfil:",
            error
        );


        clearLocalSession();


        callback(

            user,

            null

        );

    }

}


/* ======================================================
   OBSERVADOR CENTRAL
====================================================== */

function watchAuth(
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        throw new TypeError(
            "AV Market Auth: watchAuth() precisa de uma função callback."
        );

    }


    /* ==================================================
       ESTADO INICIAL
    ================================================== */

    supabase.auth
        .getSession()
        .then(
            async ({
                data,
                error
            }) => {

                if (error) {

                    console.error(
                        "AV Market Auth — erro ao obter sessão:",
                        error
                    );


                    clearLocalSession();


                    callback(
                        null,
                        null
                    );


                    return;

                }


                const session =
                    data?.session;


                if (!session) {

                    clearLocalSession();


                    callback(
                        null,
                        null
                    );


                    return;

                }


                await processAuthenticatedUser(

                    session.user,

                    callback

                );

            }
        );


    /* ==================================================
       ALTERAÇÕES FUTURAS
    ================================================== */

    const {
        data: subscription
    } =
        supabase.auth
            .onAuthStateChange(
                async (
                    event,
                    session
                ) => {

                    console.log(
                        "AV Market Auth:",
                        event
                    );


                    if (
                        event ===
                        "SIGNED_OUT"
                    ) {

                        clearLocalSession();


                        callback(
                            null,
                            null
                        );


                        return;

                    }


                    if (
                        !session?.user
                    ) {

                        return;

                    }


                    await processAuthenticatedUser(

                        session.user,

                        callback

                    );

                }
            );


    return function unsubscribe() {

        subscription
            ?.subscription
            ?.unsubscribe();

    };

}


/* ======================================================
   ESPERAR PELO ESTADO INICIAL
====================================================== */

async function waitForAuthState() {

    const {
        data,
        error
    } =
        await supabase.auth.getSession();


    if (
        error
    ) {

        console.error(
            "AV Market Auth — erro ao obter estado inicial:",
            error
        );


        return null;

    }


    return (
        data?.session?.user ||
        null
    );

}


/* ======================================================
   EXPORTAR
====================================================== */

export {

    supabase,

    ADMIN_UID,

    ROLES,

    PROFILE_TABLE,

    normalizeRole,

    isValidRole,

    getUserProfile,

    buildSession,

    saveLocalSession,

    clearLocalSession,

    getLocalUser,

    getLocalUserId,

    getLocalRole,

    isAuthenticated,

    getCurrentUser,

    logout,

    watchAuth,

    waitForAuthState

};


/* ======================================================
   DISPONIBILIZAR GLOBALMENTE
====================================================== */

window.AVMarketAuth = {

    supabase,

    ADMIN_UID,

    ROLES,

    PROFILE_TABLE,

    normalizeRole,

    isValidRole,

    getUserProfile,

    buildSession,

    saveLocalSession,

    clearLocalSession,

    getLocalUser,

    getLocalUserId,

    getLocalRole,

    isAuthenticated,

    getCurrentUser,

    logout,

    watchAuth,

    waitForAuthState

};


/* ======================================================
   DEBUG
====================================================== */

console.log(
    "AV Market Auth — sistema central carregado. Tabela: profiles."
);

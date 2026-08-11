"use strict";


/* =========================================================
   AV MARKET
   SISTEMA CENTRAL DE AUTENTICAÇÃO E SESSÃO
========================================================= */

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   ROLES OFICIAIS
========================================================= */

const ROLES = Object.freeze({

    COMPRADOR: "comprador",

    REVENDEDOR: "revendedor",

    ADMIN: "admin"

});


/* =========================================================
   CHAVES DA SESSÃO
========================================================= */

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


/* =========================================================
   NORMALIZAR ROLE
========================================================= */

function normalizeRole(profile) {

    if (!profile) {
        return "";
    }


    const value =
        profile.role ||
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


/* =========================================================
   VERIFICAR ROLE VÁLIDA
========================================================= */

function isValidRole(role) {

    return (

        role === ROLES.COMPRADOR ||

        role === ROLES.REVENDEDOR ||

        role === ROLES.ADMIN

    );

}


/* =========================================================
   OBTER PERFIL DO FIRESTORE
========================================================= */

async function getUserProfile(uid) {

    if (!uid) {
        return null;
    }


    const reference =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(reference);


    if (!snapshot.exists()) {

        return null;

    }


    return {

        uid,

        ...snapshot.data()

    };

}


/* =========================================================
   CRIAR OBJETO DE SESSÃO
========================================================= */

function buildSession(user, profile) {

    if (!user || !profile) {

        return null;

    }


    const role =
        normalizeRole(profile);


    return {

        uid:
            user.uid,


        nome:
            profile.name ||
            profile.nome ||
            profile.nomeCompleto ||
            profile.displayName ||
            user.displayName ||
            "Minha Conta",


        email:
            profile.email ||
            user.email ||
            "",


        telefone:
            profile.phone ||
            profile.telefone ||
            profile.phoneNumber ||
            user.phoneNumber ||
            "",


        role,


        tipo:
            role,


        foto:
            profile.foto ||
            profile.photoURL ||
            profile.photo ||
            user.photoURL ||
            "",


        emailVerificado:
            Boolean(
                user.emailVerified
            ),


        criadoEm:
            profile.criadoEm ||
            profile.createdAt ||
            null

    };

}


/* =========================================================
   GUARDAR SESSÃO LOCAL
========================================================= */

function saveLocalSession(user, profile) {

    const session =
        buildSession(
            user,
            profile
        );


    if (!session) {

        return null;

    }


    /*
     * A sessão local serve apenas como
     * cache/interface.
     *
     * A autenticação verdadeira continua
     * sendo controlada pelo Firebase Auth.
     */

    localStorage.setItem(

        "avMarketUser",

        JSON.stringify(
            session
        )

    );


    localStorage.setItem(

        "avMarketUserId",

        user.uid

    );


    localStorage.setItem(

        "avMarketRole",

        session.role

    );


    return session;

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

            } catch (error) {

                console.warn(
                    "AV Market: erro ao limpar localStorage:",
                    key,
                    error
                );

            }


            try {

                sessionStorage.removeItem(
                    key
                );

            } catch (error) {

                console.warn(
                    "AV Market: erro ao limpar sessionStorage:",
                    key,
                    error
                );

            }

        }
    );

}


/* =========================================================
   OBTER UTILIZADOR LOCAL
========================================================= */

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
            "AV Market: sessão local inválida.",
            error
        );


        clearLocalSession();


        return null;

    }

}


/* =========================================================
   OBTER UID DO UTILIZADOR LOCAL
========================================================= */

function getLocalUserId() {

    return localStorage.getItem(
        "avMarketUserId"
    );

}


/* =========================================================
   OBTER ROLE LOCAL
========================================================= */

function getLocalRole() {

    return localStorage.getItem(
        "avMarketRole"
    );

}


/* =========================================================
   VERIFICAR SE ESTÁ AUTENTICADO
========================================================= */

function isAuthenticated() {

    return Boolean(
        auth.currentUser
    );

}


/* =========================================================
   UTILIZADOR ATUAL DO FIREBASE
========================================================= */

function getCurrentUser() {

    return auth.currentUser || null;

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        /*
         * Primeiro encerramos a sessão
         * oficial do Firebase.
         */

        await signOut(
            auth
        );

    }

    catch (error) {

        console.error(
            "AV Market: erro ao fazer logout:",
            error
        );

        throw error;

    }

    finally {

        /*
         * Independentemente do resultado,
         * removemos os dados locais.
         */

        clearLocalSession();

    }

}


/* =========================================================
   OBSERVADOR CENTRAL DE AUTENTICAÇÃO
========================================================= */

function watchAuth(callback) {

    if (
        typeof callback !== "function"
    ) {

        throw new TypeError(
            "AV Market: watchAuth() precisa de uma função callback."
        );

    }


    return onAuthStateChanged(

        auth,

        async user => {

            /*
             * =================================================
             * CASO 1 — NÃO EXISTE UTILIZADOR AUTENTICADO
             * =================================================
             */

            if (!user) {

                clearLocalSession();


                callback(
                    null,
                    null
                );


                return;

            }


            /*
             * =================================================
             * CASO 2 — UTILIZADOR AUTENTICADO
             * =================================================
             */

            try {

                console.log(
                    "AV Market Auth: utilizador autenticado:",
                    user.uid
                );


                /*
                 * Buscar o perfil correspondente
                 * ao UID no Firestore.
                 */

                const profile =
                    await getUserProfile(
                        user.uid
                    );


                /*
                 * Authentication existe,
                 * mas documento users/{uid}
                 * ainda não existe.
                 *
                 * NÃO fazemos signOut aqui.
                 */

                if (!profile) {

                    console.warn(
                        "AV Market Auth: utilizador autenticado sem perfil Firestore.",
                        user.uid
                    );


                    /*
                     * Mantemos a autenticação Firebase.
                     * Apenas não criamos uma sessão
                     * de perfil incompleta.
                     */

                    clearLocalSession();


                    callback(

                        user,

                        null

                    );


                    return;

                }


                /*
                 * =================================================
                 * IDENTIFICAR ROLE
                 * =================================================
                 */

                const role =
                    normalizeRole(
                        profile
                    );


                /*
                 * Conta sem role.
                 */

                if (!role) {

                    console.warn(
                        "AV Market Auth: perfil sem role.",
                        user.uid
                    );


                    clearLocalSession();


                    callback(

                        user,

                        {
                            ...profile,

                            uid:
                                user.uid,

                            role:
                                ""

                        }

                    );


                    return;

                }


                /*
                 * Role desconhecida.
                 */

                if (
                    !isValidRole(
                        role
                    )
                ) {

                    console.warn(
                        "AV Market Auth: role desconhecida:",
                        role
                    );


                    const session = {

                        ...buildSession(
                            user,
                            profile
                        ),

                        role,

                        tipo:
                            role

                    };


                    callback(

                        user,

                        {
                            ...profile,
                            ...session
                        }

                    );


                    return;

                }


                /*
                 * =================================================
                 * CRIAR SESSÃO
                 * =================================================
                 */

                const session =
                    saveLocalSession(

                        user,

                        {

                            ...profile,

                            role

                        }

                    );


                /*
                 * =================================================
                 * DEVOLVER DADOS À PÁGINA
                 * =================================================
                 */

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
                    "AV Market Auth: erro ao carregar perfil:",
                    error
                );


                /*
                 * Não fazemos logout automaticamente.
                 *
                 * Um erro de Firestore/rede não significa
                 * necessariamente que a autenticação falhou.
                 */

                callback(

                    user,

                    null

                );

            }

        }

    );

}


/* =========================================================
   ESPERAR PELO ESTADO INICIAL DA AUTENTICAÇÃO
========================================================= */

function waitForAuthState() {

    return new Promise(
        resolve => {

            const unsubscribe =
                onAuthStateChanged(

                    auth,

                    user => {

                        unsubscribe();

                        resolve(
                            user
                        );

                    }

                );

        }
    );

}


/* =========================================================
   EXPORTAR
========================================================= */

export {

    auth,

    db,

    ROLES,

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


/* =========================================================
   DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.AVMarketAuth = {

    auth,

    db,

    ROLES,

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


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "AV Market Auth: sistema de autenticação carregado."
);

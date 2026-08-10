"use strict";

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
        "";

    return String(value)
        .trim()
        .toLowerCase();

}


/* =========================================================
   OBTER PERFIL FIRESTORE
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
   GUARDAR SESSÃO LOCAL
========================================================= */

function saveLocalSession(user, profile) {

    if (!user || !profile) {
        return null;
    }

    const role =
        normalizeRole(profile);

    const session = {

        uid:
            user.uid,

        nome:
            profile.name ||
            profile.nome ||
            profile.nomeCompleto ||
            user.displayName ||
            "Minha Conta",

        email:
            profile.email ||
            user.email ||
            "",

        telefone:
            profile.phone ||
            profile.telefone ||
            "",

        role,

        tipo:
            role,

        foto:
            profile.foto ||
            profile.photoURL ||
            user.photoURL ||
            ""

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
        role
    );

    return session;

}


/* =========================================================
   LIMPAR SESSÃO
========================================================= */

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

            localStorage.removeItem(key);

            sessionStorage.removeItem(key);

        }
    );

}


/* =========================================================
   UTILIZADOR LOCAL
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

        return JSON.parse(value);

    }

    catch {

        clearLocalSession();

        return null;

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        await signOut(auth);

    }

    finally {

        clearLocalSession();

    }

}


/* =========================================================
   OBSERVAR AUTENTICAÇÃO
========================================================= */

function watchAuth(callback) {

    return onAuthStateChanged(
        auth,
        async user => {

            /*
             * Não autenticado
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
             * Buscar perfil
             */

            try {

                const profile =
                    await getUserProfile(
                        user.uid
                    );


                /*
                 * Authentication existe,
                 * mas Firestore não.
                 */

                if (!profile) {

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


                /*
                 * Conta sem role.
                 */

                if (!role) {

                    clearLocalSession();

                    callback(
                        user,
                        null
                    );

                    return;

                }


                const session =
                    saveLocalSession(
                        user,
                        profile
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
                    "AV Market Auth:",
                    error
                );

                callback(
                    user,
                    null
                );

            }

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

    getUserProfile,

    saveLocalSession,

    clearLocalSession,

    getLocalUser,

    logout,

    watchAuth

};


/* =========================================================
   GLOBAL
========================================================= */

window.AVMarketAuth = {

    auth,

    db,

    ROLES,

    normalizeRole,

    getUserProfile,

    saveLocalSession,

    clearLocalSession,

    getLocalUser,

    logout,

    watchAuth

};

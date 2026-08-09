/* ============================================================
   AV MARKET
   AUTH.JS
   SISTEMA CENTRAL DE AUTENTICAÇÃO FIREBASE
============================================================ */

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


/* ============================================================
   ROLES
============================================================ */

const ROLES = {

    COMPRADOR: "comprador",

    REVENDEDOR: "revendedor",

    ADMIN: "admin"

};


/* ============================================================
   NORMALIZAR ROLE
============================================================ */

function normalizeRole(data) {

    if (!data) {
        return "";
    }


    const role =
        data.role ||
        data.accountType ||
        data.tipoConta ||
        data.tipo ||
        "";


    return String(role)
        .trim()
        .toLowerCase();

}


/* ============================================================
   OBTER PERFIL FIRESTORE
============================================================ */

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
        await getDoc(
            reference
        );


    if (!snapshot.exists()) {
        return null;
    }


    return {

        uid: uid,

        ...snapshot.data()

    };

}


/* ============================================================
   GUARDAR SESSÃO LOCAL
============================================================ */

function saveLocalSession(
    user,
    profile
) {

    if (!user) {
        return null;
    }


    const role =
        normalizeRole(profile);


    const session = {

        uid:
            user.uid,

        nome:
            profile?.name ||
            profile?.nome ||
            profile?.nomeCompleto ||
            user.displayName ||
            "Minha Conta",

        email:
            profile?.email ||
            user.email ||
            "",

        telefone:
            profile?.phone ||
            profile?.telefone ||
            "",

        tipo:
            role,

        role:
            role,

        foto:
            profile?.foto ||
            profile?.photoURL ||
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


/* ============================================================
   LIMPAR SESSÃO LOCAL
============================================================ */

function clearLocalSession() {

    localStorage.removeItem(
        "avMarketUser"
    );


    localStorage.removeItem(
        "avMarketUserId"
    );


    localStorage.removeItem(
        "avMarketRole"
    );


    localStorage.removeItem(
        "avmarket_session"
    );


    localStorage.removeItem(
        "user"
    );

}


/* ============================================================
   UTILIZADOR LOCAL
============================================================ */

function getLocalUser() {

    const data =
        localStorage.getItem(
            "avMarketUser"
        );


    if (!data) {
        return null;
    }


    try {

        return JSON.parse(data);

    }

    catch (error) {

        console.error(
            "AV Market: sessão local inválida.",
            error
        );


        return null;

    }

}


/* ============================================================
   CAMINHO DO PERFIL
============================================================ */

function getProfilePath(role) {

    switch (role) {

        case ROLES.COMPRADOR:

            return "perfil-comprador.html";


        case ROLES.REVENDEDOR:

            return "perfil-revendedor.html";


        case ROLES.ADMIN:

            return "administrador/dashboard.html";


        default:

            return null;

    }

}


/* ============================================================
   TERMINAR SESSÃO
============================================================ */

async function logout() {

    try {

        await signOut(
            auth
        );


        clearLocalSession();


        return true;

    }

    catch (error) {

        console.error(
            "AV Market: erro ao terminar sessão.",
            error
        );


        return false;

    }

}


/* ============================================================
   MONITORAR AUTENTICAÇÃO
============================================================ */

function watchAuth(callback) {

    return onAuthStateChanged(
        auth,
        async function (user) {

            if (!user) {

                clearLocalSession();

                callback(
                    null,
                    null
                );

                return;

            }


            try {

                const profile =
                    await getUserProfile(
                        user.uid
                    );


                if (!profile) {

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
                    "AV Market: erro ao carregar perfil.",
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


/* ============================================================
   EXPORTAR
============================================================ */

export {

    auth,

    db,

    ROLES,

    normalizeRole,

    getUserProfile,

    getLocalUser,

    getProfilePath,

    saveLocalSession,

    clearLocalSession,

    logout,

    watchAuth

};


/* ============================================================
   DISPONIBILIZAR GLOBALMENTE
============================================================ */

window.AVMarketAuth = {

    auth,

    db,

    ROLES,

    normalizeRole,

    getUserProfile,

    getLocalUser,

    getProfilePath,

    saveLocalSession,

    clearLocalSession,

    logout,

    watchAuth

};

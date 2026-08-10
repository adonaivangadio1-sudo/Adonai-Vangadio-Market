/* ======================================================
   AV MARKET
   FIREBASE CONFIGURATION
====================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyA1YgIK05tzyP7963pQgUeEY2US6bHV52o",

    authDomain:
        "av-market-a39b6.firebaseapp.com",

    projectId:
        "av-market-a39b6",

    storageBucket:
        "av-market-a39b6.firebasestorage.app",

    messagingSenderId:
        "211922806104",

    appId:
        "1:211922806104:web:cfa19f4583e0cb4fa1712d"

};


/* ======================================================
   FIREBASE
====================================================== */

const app =
    initializeApp(firebaseConfig);


/* ======================================================
   AUTHENTICATION
====================================================== */

const auth =
    getAuth(app);


/* ======================================================
   FIRESTORE
====================================================== */

const db =
    getFirestore(app);


/* ======================================================
   EXPORTAR
====================================================== */

export {
    app,
    auth,
    db
};

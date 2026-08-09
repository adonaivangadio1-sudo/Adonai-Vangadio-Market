import { db } from "./firebase-config.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ======================================================
   AV MARKET
   CRIAÇÃO DO PERFIL ADMINISTRADOR
====================================================== */


/* ======================================================
   DADOS DO ADMINISTRADOR
====================================================== */

const ADMIN_UID =
    "8q7AXBXaUKbSWhaXxx9xwWwSTBH2";


const ADMIN_EMAIL =
    "adonaiv@icloud.com";


/* ======================================================
   CRIAR DOCUMENTO DO ADMINISTRADOR
====================================================== */

async function criarAdministrador() {

    try {

        const adminReference =
            doc(
                db,
                "users",
                ADMIN_UID
            );


        await setDoc(
            adminReference,
            {

                name:
                    "Administrador AV Market",

                email:
                    ADMIN_EMAIL,

                role:
                    "admin",

                accountType:
                    "admin",

                tipoConta:
                    "admin",

                tipo:
                    "admin",

                ativo:
                    true,

                criadoEm:
                    new Date().toISOString()

            }
        );


        console.log(
            "========================================"
        );

        console.log(
            "ADMINISTRADOR AV MARKET CRIADO!"
        );

        console.log(
            "UID:",
            ADMIN_UID
        );

        console.log(
            "Role: admin"
        );

        console.log(
            "========================================"
        );


        alert(
            "Administrador AV Market criado com sucesso!"
        );


    }

    catch (error) {

        console.error(
            "Erro ao criar administrador:",
            error
        );


        alert(
            "Erro ao criar administrador. Verifica a consola."
        );

    }

}


/* ======================================================
   EXECUTAR
====================================================== */

criarAdministrador();

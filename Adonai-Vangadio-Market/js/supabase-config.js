/* ======================================================
   AV MARKET
   SUPABASE CONFIGURATION
====================================================== */

"use strict";


/* ======================================================
   IMPORTAR SUPABASE
====================================================== */

import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* ======================================================
   CONFIGURAÇÃO
====================================================== */

const SUPABASE_URL =
    "https://miwkwrynzgymhktjmhcc.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_-WTr7-Xos9C24IED7FQwag_56cxUJ6Q";


/* ======================================================
   CLIENTE SUPABASE
====================================================== */

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {

                autoRefreshToken:
                    true,

                persistSession:
                    true,

                detectSessionInUrl:
                    true

            }
        }
    );


/* ======================================================
   EXPORTAR
====================================================== */

export {

    supabase,

    SUPABASE_URL

};


/* ======================================================
   DISPONIBILIZAR GLOBALMENTE
====================================================== */

window.AVMarketSupabase = {

    supabase

};


/* ======================================================
   DEBUG
====================================================== */

console.log(
    "AV Market — Supabase carregado corretamente."
);

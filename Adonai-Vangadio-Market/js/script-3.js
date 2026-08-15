/* =========================================================
   AV MARKET
   SCRIPT-3.JS

   AUTENTICAÇÃO INTELIGENTE
   Supabase Auth + Perfis

   NÃO controla a animação.
   NÃO substitui o script-2.js.

   Responsável por:
   - Login
   - Criação de comprador
   - Criação de revendedor
   - Identificação automática do role
   - Redirecionamento para o perfil correto
========================================================= */

"use strict";

import {
    supabase,
    ADMIN_UID,
    ROLES,
    getUserProfile,
    saveLocalSession
} from "./auth.js";


/* =========================================================
   CAMINHOS DOS PERFIS
========================================================= */

const PROFILE_ROUTES = Object.freeze({

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

function normalizeRole(role) {

    return String(role || "")
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


    element.style.color =
        type === "success"
            ? "#3f7d3f"
            : "#9b2e2e";

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

}


/* =========================================================
   ESTADO DO BOTÃO
========================================================= */

function setButtonLoading(
    button,
    loading,
    loadingText = "Aguarde..."
) {

    if (!button) {

        return;

    }


    if (loading) {

        button.dataset.originalText =
            button.textContent;


        button.disabled =
            true;


        button.textContent =
            loadingText;

    } else {

        button.disabled =
            false;


        button.textContent =
            button.dataset.originalText ||
            button.textContent;

    }

}


/* =========================================================
   TRADUZIR ERROS DO SUPABASE
========================================================= */

function getAuthErrorMessage(error) {

    if (!error) {

        return "Ocorreu um erro. Tenta novamente.";

    }


    const message =
        String(
            error.message || ""
        ).toLowerCase();


    if (
        message.includes(
            "invalid login credentials"
        )
    ) {

        return "E-mail ou palavra-passe incorretos.";

    }


    if (
        message.includes(
            "email not confirmed"
        )
    ) {

        return "O teu e-mail ainda não foi confirmado.";

    }


    if (
        message.includes(
            "user already registered"
        )
    ) {

        return "Este e-mail já possui uma conta.";

    }


    if (
        message.includes(
            "password should be at least"
        )
    ) {

        return "A palavra-passe é demasiado curta.";

    }


    if (
        message.includes(
            "rate limit"
        )
    ) {

        return "Muitas tentativas. Aguarda alguns instantes e tenta novamente.";

    }


    return (
        error.message ||
        "Ocorreu um erro. Tenta novamente."
    );

}


/* =========================================================
   REDIRECIONAR PELO ROLE
========================================================= */

function redirectByRole(role) {

    const normalizedRole =
        normalizeRole(
            role
        );


    let destination =
        PROFILE_ROUTES[
            normalizedRole
        ];


    if (!destination) {

        console.error(
            "AV Market Auth: role desconhecida:",
            normalizedRole
        );


        return false;

    }


    /*
     * O script está dentro de /js,
     * mas as páginas de perfil estão dentro
     * da mesma pasta de páginas que o login.
     *
     * Como o HTML está em /pages,
     * usamos o caminho relativo a partir
     * da própria página.
     */

    window.location.assign(
        destination
    );


    return true;

}


/* =========================================================
   DESCOBRIR ROLE DO UTILIZADOR
========================================================= */

async function resolveUserRole(user) {

    if (!user) {

        return null;

    }


    /*
     * ADMINISTRADOR
     *
     * O UID oficial tem prioridade absoluta.
     */

    if (
        user.id === ADMIN_UID
    ) {

        return ROLES.ADMIN;

    }


    /*
     * Procurar o perfil no Supabase.
     */

    const profile =
        await getUserProfile(
            user.id
        );


    if (!profile) {

        return null;

    }


    const role =
        normalizeRole(
            profile.role ||
            profile.accountType ||
            profile.tipoConta ||
            profile.tipo ||
            profile.userType ||
            profile.type
        );


    if (!role) {

        return null;

    }


    if (
        role !== ROLES.COMPRADOR &&
        role !== ROLES.REVENDEDOR &&
        role !== ROLES.ADMIN
    ) {

        return null;

    }


    return role;

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
    form
) {

    const emailInput =
        document.getElementById(
            "loginEmail"
        );


    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {

        return;

    }


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            message,
            "Preenche o e-mail e a palavra-passe."
        );

        return;

    }


    setButtonLoading(
        loginButton,
        true,
        "A entrar..."
    );


    clearMessage(
        message
    );


    try {

        /*
         * AUTENTICAÇÃO REAL
         */

        const {
            data,
            error
        } =
            await supabase.auth.signInWithPassword({

                email,

                password

            });


        if (error) {

            throw error;

        }


        const user =
            data?.user;


        if (!user) {

            throw new Error(
                "Não foi possível obter o utilizador autenticado."
            );

        }


        /*
         * DESCOBRIR AUTOMATICAMENTE
         * O TIPO DA CONTA.
         */

        const role =
            await resolveUserRole(
                user
            );


        if (!role) {

            await supabase.auth.signOut();


            throw new Error(
                "A tua conta não possui um perfil válido."
            );

        }


        /*
         * Guardar sessão local apenas
         * como cache da interface.
         */

        let profile = null;


        if (
            role === ROLES.ADMIN
        ) {

            profile = {

                id:
                    user.id,

                uid:
                    user.id,

                email:
                    user.email || "",

                name:
                    user.user_metadata?.name ||
                    "Administrador",

                role:
                    ROLES.ADMIN

            };

        } else {

            profile =
                await getUserProfile(
                    user.id
                );

        }


        if (profile) {

            saveLocalSession(
                user,
                {
                    ...profile,
                    role
                }
            );

        }


        /*
         * AGORA O SISTEMA SABE
         * PARA ONDE O UTILIZADOR DEVE IR.
         */

        const redirected =
            redirectByRole(
                role
            );


        if (!redirected) {

            throw new Error(
                "Não foi possível determinar o perfil desta conta."
            );

        }

    }

    catch (error) {

        console.error(
            "AV Market Login:",
            error
        );


        showMessage(
            message,
            getAuthErrorMessage(
                error
            )
        );


        setButtonLoading(
            loginButton,
            false
        );

    }

}


/* =========================================================
   CRIAR CONTA COMUM
========================================================= */

async function createAccount({

    name,
    email,
    password,
    role,
    form,
    button,
    message

}) {

    if (
        !name ||
        !email ||
        !password
    ) {

        showMessage(
            message,
            "Preenche todos os campos."
        );

        return;

    }


    if (
        password.length < 6
    ) {

        showMessage(
            message,
            "A palavra-passe deve ter pelo menos 6 caracteres."
        );

        return;

    }


    if (
        role !== ROLES.COMPRADOR &&
        role !== ROLES.REVENDEDOR
    ) {

        showMessage(
            message,
            "Tipo de conta inválido."
        );

        return;

    }


    setButtonLoading(
        button,
        true,
        "A criar..."
    );


    clearMessage(
        message
    );


    try {

        /*
         * CRIAR UTILIZADOR NO SUPABASE AUTH
         */

        const {
            data,
            error
        } =
            await supabase.auth.signUp({

                email,

                password,

                options: {

                    data: {

                        name,

                        full_name:
                            name,

                        role

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
                "Não foi possível criar a conta."
            );

        }


        /*
         * CRIAR O PERFIL NA TABELA "perfis"
         *
         * A role é gravada aqui.
         * É ela que posteriormente permite
         * ao login distinguir comprador/revendedor.
         */

        const {
            data: profile,
            error: profileError
        } =
            await supabase
                .from("perfis")
                .upsert({

                    id:
                        user.id,

                    email:
                        email,

                    name:
                        name,

                    role:
                        role

                }, {

                    onConflict:
                        "id"

                })
                .select("*")
                .single();


        if (profileError) {

            console.error(
                "AV Market: erro ao criar perfil:",
                profileError
            );


            /*
             * Se o perfil não puder ser criado,
             * não fingimos que a conta terminou.
             */

            throw new Error(
                "A conta foi criada, mas não foi possível criar o perfil. Verifica as permissões da tabela perfis no Supabase."
            );

        }


        /*
         * Se o Supabase estiver configurado
         * para exigir confirmação de e-mail,
         * normalmente não existe sessão imediata.
         *
         * Nesse caso informamos o utilizador.
         */

        if (
            !data.session
        ) {

            showMessage(
                message,
                "Conta criada. Verifica o teu e-mail para confirmar a conta.",
                "success"
            );


            setButtonLoading(
                button,
                false
            );


            return;

        }


        /*
         * Existe sessão.
         * Guardamos e encaminhamos.
         */

        saveLocalSession(

            user,

            {

                ...profile,

                role

            }

        );


        redirectByRole(
            role
        );

    }

    catch (error) {

        console.error(
            "AV Market Create Account:",
            error
        );


        showMessage(
            message,
            getAuthErrorMessage(
                error
            )
        );


        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   CRIAR CONTA — COMPRADOR
========================================================= */

async function handleBuyerRegister(
    form
) {

    const nameInput =
        document.getElementById(
            "buyerName"
        );


    const emailInput =
        document.getElementById(
            "buyerEmail"
        );


    const passwordInput =
        document.getElementById(
            "buyerPassword"
        );


    const button =
        document.getElementById(
            "buyerCreateButton"
        );


    const message =
        document.getElementById(
            "buyerRegisterMessage"
        );


    await createAccount({

        name:
            nameInput?.value.trim(),

        email:
            emailInput?.value
                .trim()
                .toLowerCase(),

        password:
            passwordInput?.value,

        role:
            ROLES.COMPRADOR,

        form,

        button,

        message

    });

}


/* =========================================================
   CRIAR CONTA — REVENDEDOR
========================================================= */

async function handleSellerRegister(
    form
) {

    const nameInput =
        document.getElementById(
            "sellerName"
        );


    const emailInput =
        document.getElementById(
            "sellerEmail"
        );


    const passwordInput =
        document.getElementById(
            "sellerPassword"
        );


    const button =
        document.getElementById(
            "sellerCreateButton"
        );


    const message =
        document.getElementById(
            "sellerRegisterMessage"
        );


    /*
     * Verificar se o contrato foi aceite.
     *
     * O script-2.js já controla visualmente
     * o botão do contrato.
     *
     * Aqui protegemos também a criação
     * da conta.
     */

    const contractAccepted =
        sessionStorage.getItem(
            "avMarketContractAccepted"
        );


    /*
     * Se o projeto ainda não guardar
     * a aceitação no sessionStorage,
     * não bloqueamos a criação aqui.
     *
     * A página do contrato continua sendo
     * o ponto de entrada do revendedor.
     */


    await createAccount({

        name:
            nameInput?.value.trim(),

        email:
            emailInput?.value
                .trim()
                .toLowerCase(),

        password:
            passwordInput?.value,

        role:
            ROLES.REVENDEDOR,

        form,

        button,

        message

    });

}


/* =========================================================
   CONTRATO
========================================================= */

function setupContract() {

    const checkbox =
        document.getElementById(
            "sellerTerms"
        );


    if (!checkbox) {

        return;

    }


    checkbox.addEventListener(
        "change",
        () => {

            if (
                checkbox.checked
            ) {

                sessionStorage.setItem(
                    "avMarketContractAccepted",
                    "true"
                );

            } else {

                sessionStorage.removeItem(
                    "avMarketContractAccepted"
                );

            }

        }
    );

}


/* =========================================================
   FORMULÁRIOS
========================================================= */

function setupForms() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                event.stopPropagation();


                await handleLogin(
                    loginForm
                );

            }
        );

    }


    const buyerForm =
        document.getElementById(
            "buyerRegisterForm"
        );


    if (buyerForm) {

        buyerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                event.stopPropagation();


                await handleBuyerRegister(
                    buyerForm
                );

            }
        );

    }


    const sellerForm =
        document.getElementById(
            "sellerRegisterForm"
        );


    if (sellerForm) {

        sellerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                event.stopPropagation();


                await handleSellerRegister(
                    sellerForm
                );

            }
        );

    }

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupForms();

        setupContract();

        console.log(
            "AV Market — script-3.js carregado."
        );

    }
);


/* =========================================================
   EXPORTAR
========================================================= */

export {

    redirectByRole,

    resolveUserRole,

    handleLogin,

    handleBuyerRegister,

    handleSellerRegister

};
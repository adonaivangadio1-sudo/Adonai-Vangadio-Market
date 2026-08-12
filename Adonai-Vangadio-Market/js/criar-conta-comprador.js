/* ======================================================
   AV MARKET
   CRIAR CONTA — COMPRADOR
   SUPABASE AUTH + DATABASE
====================================================== */

"use strict";


/* ======================================================
   IMPORTAR SUPABASE
====================================================== */

import {
    supabase
} from "./supabase-config.js";


/* ======================================================
   ELEMENTOS
====================================================== */

const form =
    document.getElementById(
        "buyerRegisterForm"
    );


const nameInput =
    document.getElementById(
        "buyerName"
    );


const emailInput =
    document.getElementById(
        "buyerEmail"
    );


const phoneInput =
    document.getElementById(
        "buyerPhone"
    );


const passwordInput =
    document.getElementById(
        "buyerPassword"
    );


const confirmPasswordInput =
    document.getElementById(
        "buyerConfirmPassword"
    );


const termsInput =
    document.getElementById(
        "buyerTerms"
    );


const createButton =
    document.getElementById(
        "buyerCreateButton"
    );


const messageBox =
    document.getElementById(
        "buyerRegisterMessage"
    );


/* ======================================================
   MENSAGENS
====================================================== */

function showMessage(
    message,
    type = "error"
) {

    if (!messageBox) {

        return;

    }


    messageBox.textContent =
        message;


    messageBox.classList.remove(
        "success",
        "error"
    );


    messageBox.classList.add(
        type
    );


    messageBox.style.display =
        "block";

}


function clearMessage() {

    if (!messageBox) {

        return;

    }


    messageBox.textContent =
        "";


    messageBox.classList.remove(
        "success",
        "error"
    );


    messageBox.style.display =
        "none";

}


/* ======================================================
   PASSWORD TOGGLE
====================================================== */

function setupPasswordToggle(
    input,
    button
) {

    if (
        !input ||
        !button
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            const showing =
                input.type ===
                "password";


            input.type =
                showing
                    ? "text"
                    : "password";


            const icon =
                button.querySelector(
                    "i"
                );


            if (icon) {

                icon.className =
                    showing
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye";

            }


            button.setAttribute(
                "aria-pressed",
                showing
                    ? "true"
                    : "false"
            );


            button.setAttribute(
                "aria-label",
                showing
                    ? "Ocultar palavra-passe"
                    : "Mostrar palavra-passe"
            );

        }
    );

}


setupPasswordToggle(
    passwordInput,
    document.getElementById(
        "buyerToggle"
    )
);


setupPasswordToggle(
    confirmPasswordInput,
    document.getElementById(
        "buyerConfirmToggle"
    )
);


/* ======================================================
   LOADING
====================================================== */

function setLoading(
    loading
) {

    if (!createButton) {

        return;

    }


    createButton.disabled =
        loading;


    createButton.setAttribute(
        "aria-busy",
        loading
            ? "true"
            : "false"
    );


    if (loading) {

        createButton.innerHTML =
            '<span>A criar conta...</span>' +
            '<i class="fa-solid fa-spinner fa-spin"></i>';

    }

    else {

        createButton.innerHTML =
            '<span>Criar conta</span>' +
            '<i class="fa-solid fa-arrow-right"></i>';

    }

}


/* ======================================================
   TRADUZIR ERROS DO SUPABASE
====================================================== */

function getSupabaseErrorMessage(
    error
) {

    const message =
        String(
            error?.message || ""
        ).toLowerCase();


    if (
        message.includes(
            "already registered"
        ) ||
        message.includes(
            "already been registered"
        ) ||
        message.includes(
            "user already registered"
        )
    ) {

        return (
            "Este e-mail já está registado. Entre na sua conta."
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
            "A palavra-passe não cumpre os requisitos definidos."
        );

    }


    if (
        message.includes(
            "network"
        ) ||
        message.includes(
            "fetch"
        )
    ) {

        return (
            "Erro de ligação. Verifique a sua internet."
        );

    }


    if (
        message.includes(
            "row-level security"
        ) ||
        message.includes(
            "rls"
        ) ||
        message.includes(
            "permission denied"
        ) ||
        message.includes(
            "not allowed"
        )
    ) {

        return (
            "A conta foi criada, mas o perfil não pôde ser gravado. Verifique as permissões da tabela users no Supabase."
        );

    }


    return (
        "Não foi possível criar a conta. Tente novamente."
    );

}


/* ======================================================
   EVITAR DUPLO REGISTO
====================================================== */

let registrationInProgress =
    false;


/* ======================================================
   FORMULÁRIO
====================================================== */

if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                registrationInProgress
            ) {

                return;

            }


            clearMessage();


            /* ==========================================
               RECOLHER DADOS
            ========================================== */

            const name =
                nameInput?.value
                    .trim() ||
                "";


            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const phone =
                phoneInput?.value
                    .trim() ||
                "";


            const password =
                passwordInput?.value ||
                "";


            const confirmPassword =
                confirmPasswordInput?.value ||
                "";


            /* ==========================================
               VALIDAÇÕES
            ========================================== */

            if (!name) {

                showMessage(
                    "Introduza o seu nome completo."
                );

                nameInput?.focus();

                return;

            }


            if (!email) {

                showMessage(
                    "Introduza o seu e-mail."
                );

                emailInput?.focus();

                return;

            }


            if (!phone) {

                showMessage(
                    "Introduza o seu telefone ou WhatsApp."
                );

                phoneInput?.focus();

                return;

            }


            if (
                password.length < 6
            ) {

                showMessage(
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

                passwordInput?.focus();

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "As palavras-passe não coincidem."
                );

                confirmPasswordInput?.focus();

                return;

            }


            if (
                termsInput &&
                !termsInput.checked
            ) {

                showMessage(
                    "Aceite os termos de utilização para continuar."
                );

                return;

            }


            registrationInProgress =
                true;


            setLoading(true);


            try {

                /* ======================================
                   CRIAR UTILIZADOR NO SUPABASE AUTH
                ====================================== */

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
                                    "comprador"

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
                    "AV Market — comprador criado no Auth:",
                    createdUser.id
                );


                /* ======================================
                   CRIAR PERFIL NA TABELA USERS
                ====================================== */

                const {
                    data: createdProfile,
                    error: profileError
                } =
                    await supabase

                        .from("users")

                        .insert({

                            id:
                                createdUser.id,

                            name:
                                name,

                            email:
                                email,

                            phone:
                                phone,

                            role:
                                "comprador",

                            account_type:
                                "comprador",

                            status:
                                "active",

                            profile_complete:
                                true

                        })

                        .select("*");


                if (profileError) {

                    console.error(
                        "AV Market — erro ao criar perfil do comprador na tabela users:",
                        profileError
                    );


                    throw new Error(
                        "PERFIL_NAO_CRIADO"
                    );

                }


                console.log(
                    "AV Market — perfil do comprador criado:",
                    createdProfile
                );


                /* ======================================
                   LIMPAR PASSWORDS
                ====================================== */

                if (passwordInput) {

                    passwordInput.value =
                        "";

                }


                if (confirmPasswordInput) {

                    confirmPasswordInput.value =
                        "";

                }


                /* ======================================
                   CONTA CRIADA — EMAIL PRECISA SER
                   CONFIRMADO
                ====================================== */

                if (
                    !data.session
                ) {

                    showMessage(
                        "Conta criada com sucesso! Verifique o seu e-mail para confirmar a conta.",
                        "success"
                    );

                    return;

                }


                /* ======================================
                   CONTA CRIADA COM SESSÃO
                ====================================== */

                showMessage(
                    "Conta criada com sucesso! A entrar...",
                    "success"
                );


                /* ======================================
                   REDIRECIONAR
                ====================================== */

                setTimeout(
                    function() {

                        window.location.replace(
                            "../index.html"
                        );

                    },
                    700
                );

            }

            catch (error) {

                console.error(
                    "AV Market — erro ao criar comprador:",
                    error
                );


                if (
                    error?.message ===
                    "PERFIL_NAO_CRIADO"
                ) {

                    showMessage(
                        "A conta foi criada, mas não foi possível criar o perfil. Verifique as permissões da tabela users."
                    );

                }

                else if (
                    error?.message ===
                    "UTILIZADOR_NAO_CRIADO"
                ) {

                    showMessage(
                        "Não foi possível criar o utilizador."
                    );

                }

                else {

                    showMessage(
                        getSupabaseErrorMessage(
                            error
                        )
                    );

                }

            }

            finally {

                registrationInProgress =
                    false;


                setLoading(false);

            }

        }
    );

}

else {

    console.error(
        "AV Market — #buyerRegisterForm não encontrado."
    );

}


console.log(
    "AV Market — criação de conta de comprador Supabase carregada."
);


/* ======================================================
   FIM — CRIAR CONTA COMPRADOR
====================================================== */

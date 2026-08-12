/* ======================================================
   AV MARKET
   CRIAR CONTA — REVENDEDOR
   SUPABASE AUTH + PROFILES
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
        "sellerRegisterForm"
    );


const nameInput =
    document.getElementById(
        "sellerName"
    );


const emailInput =
    document.getElementById(
        "sellerEmail"
    );


const phoneInput =
    document.getElementById(
        "sellerPhone"
    );


const passwordInput =
    document.getElementById(
        "sellerPassword"
    );


const confirmPasswordInput =
    document.getElementById(
        "sellerConfirmPassword"
    );


const termsInput =
    document.getElementById(
        "sellerTerms"
    );


const createButton =
    document.getElementById(
        "sellerCreateButton"
    );


const messageBox =
    document.getElementById(
        "sellerRegisterMessage"
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


    messageBox.hidden =
        false;


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


    messageBox.hidden =
        true;


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
        "sellerToggle"
    )

);


setupPasswordToggle(

    confirmPasswordInput,

    document.getElementById(
        "sellerConfirmToggle"
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

            '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';

    }

    else {

        createButton.innerHTML =

            '<span>Criar conta</span>' +

            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';

    }

}


/* ======================================================
   ERROS SUPABASE
====================================================== */

function getSupabaseErrorMessage(
    error
) {

    const message =
        String(
            error?.message ||
            ""
        ).toLowerCase();


    if (
        message.includes(
            "already registered"
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
            "profiles"
        ) ||
        message.includes(
            "row-level security"
        ) ||
        message.includes(
            "permission"
        ) ||
        message.includes(
            "policy"
        )
    ) {

        return (
            "A conta foi criada no Auth, mas o perfil não pôde ser criado na tabela profiles. Verifique as políticas RLS da tabela profiles."
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
        "Não foi possível criar a conta. Tente novamente."
    );

}


/* ======================================================
   VERIFICAR CONTRATO
====================================================== */

function isContractAccepted() {

    return (
        sessionStorage.getItem(
            "avMarketContractAccepted"
        ) === "true"
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
               CONTRATO
            ========================================== */

            if (
                !isContractAccepted()
            ) {

                showMessage(
                    "Aceite o contrato de revendedor antes de criar a conta."
                );


                return;

            }


            /* ==========================================
               DADOS
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
                    "Informe o seu nome ou o nome da empresa."
                );


                nameInput?.focus();


                return;

            }


            if (!email) {

                showMessage(
                    "Informe o seu e-mail."
                );


                emailInput?.focus();


                return;

            }


            if (!phone) {

                showMessage(
                    "Informe o seu telefone ou WhatsApp."
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
                    "Aceite o contrato de revendedor para continuar."
                );


                return;

            }


            registrationInProgress =
                true;


            setLoading(
                true
            );


            try {

                /* ======================================
                   CRIAR AUTH USER
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
                                    "revendedor"

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
                    "AV Market — revendedor Auth criado:",
                    createdUser.id
                );


                /* ======================================
                   CRIAR PROFILE
                ====================================== */

                const {
                    error: profileError
                } =
                    await supabase

                        .from("profiles")

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
                                "revendedor",

                            account_type:
                                "revendedor",

                            status:
                                "active",

                            contract_accepted:
                                true,

                            profile_complete:
                                true

                        });


                if (profileError) {

                    console.error(
                        "AV Market — erro ao criar profile:",
                        profileError
                    );


                    throw new Error(
                        "PROFILE_NAO_CRIADO"
                    );

                }


                console.log(
                    "AV Market — profile de revendedor criado:",
                    createdUser.id
                );


                /* ======================================
                   LIMPAR CONTRATO
                ====================================== */

                sessionStorage.removeItem(
                    "avMarketContractAccepted"
                );


                sessionStorage.removeItem(
                    "avMarketContractAcceptedAt"
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
                   CONFIRMAÇÃO DE EMAIL
                ====================================== */

                if (
                    !data.session
                ) {

                    showMessage(
                        "Conta de revendedor criada! Verifique o seu e-mail para confirmar a conta.",
                        "success"
                    );


                    return;

                }


                /* ======================================
                   CONTA CRIADA
                ====================================== */

                showMessage(
                    "Conta de revendedor criada com sucesso! A entrar...",
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
                    "AV Market — erro ao criar revendedor:",
                    error
                );


                if (
                    error?.message ===
                    "PROFILE_NAO_CRIADO"
                ) {

                    showMessage(
                        "A conta foi criada no Auth, mas não foi possível criar o perfil. Verifique as permissões da tabela profiles."
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


                setLoading(
                    false
                );

            }

        }
    );

}

else {

    console.error(
        "AV Market — #sellerRegisterForm não encontrado."
    );

}


console.log(
    "AV Market — criação de conta de revendedor carregada. Tabela: profiles."
);

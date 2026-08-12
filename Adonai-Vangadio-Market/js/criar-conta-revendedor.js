/* ======================================================
   AV MARKET
   CRIAR CONTA — REVENDEDOR
   SUPABASE AUTH + DATABASE
====================================================== */

"use strict";

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
                button.querySelector("i");


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
            '<i class="fa-solid fa-spinner fa-spin"></i>';

    }

    else {

        createButton.innerHTML =
            '<span>Criar conta</span>' +
            '<i class="fa-solid fa-arrow-right"></i>';

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
            error?.message || ""
        ).toLowerCase();


    if (
        message.includes("already registered")
    ) {

        return (
            "Este e-mail já está registado. Entre na sua conta."
        );
    }


    if (
        message.includes("invalid email")
    ) {

        return (
            "O e-mail introduzido não é válido."
        );
    }


    if (
        message.includes("password")
    ) {

        return (
            "A palavra-passe não cumpre os requisitos definidos."
        );
    }


    if (
        message.includes("network")
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
               VERIFICAR CONTRATO
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
                    "AV Market — revendedor criado:",
                    createdUser.id
                );


                /* ======================================
                   CRIAR PERFIL NA TABELA USERS
                ====================================== */

                const {
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
                        "AV Market — erro ao criar perfil:",
                        profileError
                    );

                    throw new Error(
                        "PERFIL_NAO_CRIADO"
                    );
                }


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
                   CONTA CRIADA
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
        "AV Market — #sellerRegisterForm não encontrado."
    );
}


console.log(
    "AV Market — criação de conta de revendedor Supabase carregada."
);

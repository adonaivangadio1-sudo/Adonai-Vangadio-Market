/* ======================================================
   AV MARKET
   CONTRATO DE REVENDEDOR
   CONTROLO DE ACEITAÇÃO
   FIREBASE / SESSÃO
====================================================== */

"use strict";


/* ======================================================
   EXECUTAR QUANDO O DOM ESTIVER PRONTO
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ==================================================
           ELEMENTOS
        ================================================== */

        const checkbox =
            document.getElementById(
                "acceptContract"
            );


        const button =
            document.getElementById(
                "contractContinueButton"
            );


        /* ==================================================
           VALIDAR ELEMENTOS
        ================================================== */

        if (
            !checkbox ||
            !button
        ) {

            console.error(
                "AV Market: elementos do contrato não encontrados."
            );

            return;

        }


        /* ==================================================
           FUNÇÃO — ATUALIZAR BOTÃO
        ================================================== */

        function updateButtonState() {

            if (
                checkbox.checked
            ) {

                button.classList.remove(
                    "disabled"
                );


                button.setAttribute(
                    "aria-disabled",
                    "false"
                );


                button.style.pointerEvents =
                    "auto";


                button.style.opacity =
                    "";


            }

            else {

                button.classList.add(
                    "disabled"
                );


                button.setAttribute(
                    "aria-disabled",
                    "true"
                );


                button.style.pointerEvents =
                    "auto";


                button.style.opacity =
                    "";

            }

        }


        /* ==================================================
           ESTADO INICIAL
        ================================================== */

        checkbox.checked =
            false;


        updateButtonState();


        /* ==================================================
           ALTERAÇÃO DO CHECKBOX
        ================================================== */

        checkbox.addEventListener(
            "change",
            function () {

                updateButtonState();

            }
        );


        /* ==================================================
           BOTÃO CONTINUAR
        ================================================== */

        button.addEventListener(
            "click",
            function (event) {

                /* ==========================================
                   NÃO ACEITOU
                ========================================== */

                if (
                    !checkbox.checked
                ) {

                    event.preventDefault();


                    button.classList.add(
                        "disabled"
                    );


                    button.setAttribute(
                        "aria-disabled",
                        "true"
                    );


                    return;

                }


                /* ==========================================
                   GUARDAR ACEITAÇÃO
                ========================================== */

                try {

                    sessionStorage.setItem(
                        "avMarketContractAccepted",
                        "true"
                    );


                    sessionStorage.setItem(
                        "avMarketContractAcceptedAt",
                        new Date().toISOString()
                    );


                    console.log(
                        "AV Market: contrato de revendedor aceite."
                    );


                }

                catch (error) {

                    console.error(
                        "AV Market: erro ao guardar aceitação do contrato:",
                        error
                    );


                    event.preventDefault();


                    alert(
                        "Não foi possível guardar a aceitação do contrato. Tente novamente."
                    );


                    return;

                }


                /* ==========================================
                   GARANTIR ESTADO
                ========================================== */

                button.classList.remove(
                    "disabled"
                );


                button.setAttribute(
                    "aria-disabled",
                    "false"
                );


                /*
                 * O href do próprio HTML continua responsável
                 * pelo redirecionamento:
                 *
                 * criar-conta-revendedor.html
                 */

            }
        );


        /* ==================================================
           VERIFICAR SE EXISTE ACEITAÇÃO ANTERIOR
        ================================================== */

        const previousAcceptance =
            sessionStorage.getItem(
                "avMarketContractAccepted"
            );


        if (
            previousAcceptance ===
            "true"
        ) {

            /*
             * Não marcamos automaticamente o checkbox.
             *
             * A aceitação deve ser feita explicitamente
             * pelo utilizador nesta página.
             */

            sessionStorage.removeItem(
                "avMarketContractAccepted"
            );


            sessionStorage.removeItem(
                "avMarketContractAcceptedAt"
            );

        }


        /* ==================================================
           INICIALIZAÇÃO
        ================================================== */

        console.log(
            "AV Market — contrato de revendedor carregado corretamente."
        );

    }
);

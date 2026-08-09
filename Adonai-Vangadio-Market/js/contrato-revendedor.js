/* ======================================================
   AV MARKET
   CONTRATO DE REVENDEDOR
   CONTROLO DE ACEITAÇÃO
====================================================== */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {


        const checkbox =
            document.getElementById(
                "acceptContract"
            );


        const button =
            document.getElementById(
                "contractContinueButton"
            );


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
           ESTADO INICIAL
        ================================================== */

        button.classList.add(
            "disabled"
        );


        button.setAttribute(
            "aria-disabled",
            "true"
        );


        /* ==================================================
           CHECKBOX
        ================================================== */

        checkbox.addEventListener(
            "change",
            function () {

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

                }

                else {

                    button.classList.add(
                        "disabled"
                    );


                    button.setAttribute(
                        "aria-disabled",
                        "true"
                    );

                }

            }
        );


        /* ==================================================
           BOTÃO
        ================================================== */

        button.addEventListener(
            "click",
            function (event) {

                if (
                    !checkbox.checked
                ) {

                    event.preventDefault();

                    return;

                }


                /* ==========================================
                   GUARDAR ACEITAÇÃO TEMPORÁRIA
                ========================================== */

                sessionStorage.setItem(
                    "avMarketContractAccepted",
                    "true"
                );


                sessionStorage.setItem(
                    "avMarketContractAcceptedAt",
                    new Date().toISOString()
                );

            }
        );


        console.log(
            "AV Market — contrato de revendedor carregado."
        );

    }
);

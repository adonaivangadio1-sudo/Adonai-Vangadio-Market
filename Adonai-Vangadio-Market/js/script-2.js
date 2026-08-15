/* =========================================================
   AV MARKET
   SCRIPT ÚNICO — script-2.js

   Navegação + animação horizontal
   + pequenos controles
========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    const container =
        document.getElementById("authContainer");


    /*
     * Mantemos a referência caso algum HTML antigo
     * ainda possua o elemento pageTransition.
     *
     * Porém ele NÃO será utilizado.
     *
     * A transição agora acontece somente dentro
     * da própria janela de autenticação.
     */

    const transition =
        document.getElementById("pageTransition");



    /* =====================================================
       NAVEGAÇÃO COM TROCA HORIZONTAL
    ===================================================== */


    const navigationButtons =
        document.querySelectorAll(
            "[data-navigate]"
        );



    navigationButtons.forEach((button) => {


        button.addEventListener("click", (event) => {


            event.preventDefault();



            const destination =
                button.getAttribute(
                    "data-navigate"
                );



            if (!destination) {

                return;

            }



            /*
             * O contrato só pode continuar
             * depois de ser aceite.
            */

            if (
                button.id ===
                    "acceptContractButton"
                &&
                button.disabled
            ) {

                return;

            }



            /*
             * Evita dois cliques durante
             * a animação.
            */

            if (
                container &&
                container.classList.contains(
                    "is-leaving"
                )
            ) {

                return;

            }



            /*
             * Resolve o caminho de forma segura
             * em relação à página atual.
            */

            let destinationUrl;



            try {

                destinationUrl =
                    new URL(
                        destination,
                        window.location.href
                    );

            } catch (error) {

                console.error(
                    "Caminho inválido:",
                    destination,
                    error
                );

                return;

            }



            /*
             * Se não existir a janela de autenticação,
             * navega normalmente.
            */

            if (!container) {

                window.location.assign(
                    destinationUrl.href
                );

                return;

            }



            /*
             * COMEÇA A TROCA HORIZONTAL
             *
             * Não existe mais uma tela preta
             * entrando por cima da página.
             */

            container.classList.add(
                "is-leaving"
            );



            /*
             * IMPORTANTE:
             *
             * Não ativamos mais:
             *
             * transition.classList.add("active")
             *
             * porque era isso que criava a
             * página preta rápida.
             */

            if (transition) {

                transition.classList.remove(
                    "active"
                );

                transition.classList.remove(
                    "exit"
                );

            }



            /*
             * Espera a animação horizontal
             * terminar antes de mudar de página.
             */

            setTimeout(() => {


                window.location.assign(
                    destinationUrl.href
                );


            }, 760);


        });


    });



    /* =====================================================
       CONTRATO DO REVENDEDOR
    ===================================================== */


    const contractCheckbox =
        document.getElementById(
            "sellerTerms"
        );


    const acceptContractButton =
        document.getElementById(
            "acceptContractButton"
        );



    if (
        contractCheckbox &&
        acceptContractButton
    ) {


        contractCheckbox.addEventListener(
            "change",
            () => {


                acceptContractButton.disabled =
                    !contractCheckbox.checked;


            }
        );


    }



    /* =====================================================
       MOSTRAR / ESCONDER PALAVRA-PASSE
    ===================================================== */


    const passwordButtons =
        document.querySelectorAll(
            "[data-password-toggle]"
        );



    passwordButtons.forEach((button) => {


        button.addEventListener(
            "click",
            () => {


                const targetId =
                    button.getAttribute(
                        "data-password-toggle"
                    );



                const input =
                    document.getElementById(
                        targetId
                    );



                if (!input) {

                    return;

                }



                if (
                    input.type === "password"
                ) {


                    input.type = "text";

                    button.textContent = "○";


                } else {


                    input.type = "password";

                    button.textContent = "●";


                }


            }
        );


    });



    /* =====================================================
       ENTRADA SUAVE DA PÁGINA
    ===================================================== */


    if (container) {


        requestAnimationFrame(() => {


            container.classList.add(
                "page-enter"
            );


        });


    }



    /* =====================================================
       PREVENIR DUPLO ENVIO DOS FORMULÁRIOS
    ===================================================== */


    const forms =
        document.querySelectorAll(
            "form"
        );



    forms.forEach((form) => {


        form.addEventListener(
            "submit",
            () => {


                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );



                if (!submitButton) {

                    return;

                }



                /*
                 * Não alteramos a lógica
                 * de autenticação.
                 *
                 * Apenas impedimos cliques
                 * repetidos.
                */

                setTimeout(() => {


                    if (
                        !form.classList.contains(
                            "auth-error"
                        )
                    ) {


                        submitButton.disabled =
                            true;


                    }


                }, 50);


            }
        );


    });


});
/* =========================================================
   AV MARKET
   LOGIN PREMIUM
   LOGIN.JS
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const authContainer = document.getElementById("authContainer");

const buyerButton = document.getElementById("buyerButton");

const resellerButton =
    document.getElementById("resellerButton");

const backToLogin =
    document.getElementById("backToLogin");

const loginForm =
    document.getElementById("loginForm");

const buyerForm =
    document.getElementById("buyerForm");

const resellerForm =
    document.getElementById("resellerForm");

const forgotPassword =
    document.getElementById("forgotPassword");

const loginMessage =
    document.getElementById("loginMessage");

const buyerMessage =
    document.getElementById("buyerMessage");

const resellerMessage =
    document.getElementById("resellerMessage");


/* =========================================================
   ESTADO
========================================================= */

let currentMode = "login";


/* =========================================================
   ABRIR REGISTO
========================================================= */

function openRegister(type) {

    if (!authContainer) return;

    currentMode = type;

    authContainer.classList.add("register-mode");

    document.body.classList.add("register-active");

    clearMessages();

    /*
       Pequeno atraso para permitir que a animação
       visual aconteça de forma natural.
    */

    setTimeout(() => {

        if (type === "buyer") {

            document
                .getElementById("buyerScreen")
                ?.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

        }

        if (type === "reseller") {

            document
                .getElementById("resellerScreen")
                ?.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

        }

    }, 100);

}


/* =========================================================
   VOLTAR AO LOGIN
========================================================= */

function openLogin() {

    if (!authContainer) return;

    currentMode = "login";

    authContainer.classList.remove("register-mode");

    document.body.classList.remove("register-active");

    clearMessages();

}


/* =========================================================
   BOTÃO COMPRADOR
========================================================= */

if (buyerButton) {

    buyerButton.addEventListener(
        "click",
        () => {

            openRegister("buyer");

        }
    );

}


/* =========================================================
   BOTÃO REVENDEDOR
========================================================= */

if (resellerButton) {

    resellerButton.addEventListener(
        "click",
        () => {

            openRegister("reseller");

        }
    );

}


/* =========================================================
   VOLTAR AO LOGIN
========================================================= */

if (backToLogin) {

    backToLogin.addEventListener(
        "click",
        openLogin
    );

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

const passwordButtons =
    document.querySelectorAll(
        ".password-toggle"
    );


passwordButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            if (!input) return;


            if (input.type === "password") {

                input.type = "text";

                button.setAttribute(
                    "aria-label",
                    "Esconder palavra-passe"
                );

                button.classList.add("visible");

            } else {

                input.type = "password";

                button.setAttribute(
                    "aria-label",
                    "Mostrar palavra-passe"
                );

                button.classList.remove("visible");

            }

        }
    );

});


/* =========================================================
   MENSAGENS
========================================================= */

function showMessage(
    element,
    message,
    type = "error"
) {

    if (!element) return;

    element.textContent = message;

    element.className =
        `form-message ${type}`;

}


function clearMessages() {

    [
        loginMessage,
        buyerMessage,
        resellerMessage

    ].forEach(element => {

        if (!element) return;

        element.textContent = "";

        element.className =
            "form-message";

    });

}


/* =========================================================
   VALIDAR EMAIL
========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearMessages();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            if (!email) {

                showMessage(
                    loginMessage,
                    "Introduz o teu e-mail."
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    loginMessage,
                    "Introduz um e-mail válido."
                );

                return;
            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "Introduz a tua palavra-passe."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    loginMessage,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

                return;
            }


            /*
             ===================================================
             AQUI VAI ENTRAR O FIREBASE AUTH

             Neste momento estamos apenas a validar
             visualmente o formulário.

             Depois ligaremos este botão ao Firebase.
             ===================================================
            */


            showMessage(
                loginMessage,
                "Dados válidos. A autenticação será ligada ao Firebase.",
                "success"
            );

        }
    );

}


/* =========================================================
   RECUPERAR PALAVRA-PASSE
========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        () => {

            clearMessages();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            if (!email) {

                showMessage(
                    loginMessage,
                    "Introduz primeiro o teu e-mail."
                );

                document
                    .getElementById("loginEmail")
                    ?.focus();

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    loginMessage,
                    "Introduz um e-mail válido."
                );

                return;
            }


            showMessage(
                loginMessage,
                "O processo de recuperação será ligado ao Firebase.",
                "success"
            );

        }
    );

}


/* =========================================================
   REGISTO DO COMPRADOR
========================================================= */

if (buyerForm) {

    buyerForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearMessages();


            const name =
                document
                    .getElementById("buyerName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("buyerEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("buyerPassword")
                    .value;


            const confirmation =
                document
                    .getElementById("buyerPasswordConfirm")
                    .value;


            if (!name) {

                showMessage(
                    buyerMessage,
                    "Introduz o teu nome."
                );

                return;
            }


            if (!email || !isValidEmail(email)) {

                showMessage(
                    buyerMessage,
                    "Introduz um e-mail válido."
                );

                return;
            }


            if (!password || password.length < 6) {

                showMessage(
                    buyerMessage,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

                return;
            }


            if (password !== confirmation) {

                showMessage(
                    buyerMessage,
                    "As palavras-passe não coincidem."
                );

                return;
            }


            /*
             ===================================================
             FIREBASE AUTH DO COMPRADOR
             ===================================================
            */


            showMessage(
                buyerMessage,
                "Dados válidos. A criação da conta será ligada ao Firebase.",
                "success"
            );

        }
    );

}


/* =========================================================
   REGISTO DO REVENDEDOR
========================================================= */

if (resellerForm) {

    resellerForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearMessages();


            const name =
                document
                    .getElementById("resellerName")
                    .value
                    .trim();


            const business =
                document
                    .getElementById("resellerBusiness")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("resellerEmail")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("resellerPhone")
                    .value
                    .trim();


            if (!name) {

                showMessage(
                    resellerMessage,
                    "Introduz o teu nome."
                );

                return;
            }


            if (!business) {

                showMessage(
                    resellerMessage,
                    "Introduz o nome do teu negócio."
                );

                return;
            }


            if (!email || !isValidEmail(email)) {

                showMessage(
                    resellerMessage,
                    "Introduz um e-mail profissional válido."
                );

                return;
            }


            if (!phone) {

                showMessage(
                    resellerMessage,
                    "Introduz o teu número de telefone."
                );

                return;
            }


            /*
             ===================================================
             AQUI ENTRARÁ O FLUXO DE REVENDEDOR

             Depois poderemos fazer:

             1. Criar utilizador Firebase
             2. Criar perfil do revendedor
             3. Guardar tipo = "reseller"
             4. Abrir formulário profissional
             5. Guardar dados da loja
             ===================================================
            */


            showMessage(
                resellerMessage,
                "Dados válidos. Vamos continuar para o cadastro profissional.",
                "success"
            );

        }
    );

}


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            if (
                authContainer &&
                authContainer.classList.contains(
                    "register-mode"
                )
            ) {

                openLogin();

            }

        }

    }
);


/* =========================================================
   PREVENIR SUBMIT ACIDENTAL
========================================================= */

document
    .querySelectorAll("button")
    .forEach(button => {

        if (
            button.type !== "submit" &&
            !button.type
        ) {

            button.type = "button";

        }

    });


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (authContainer) {

            authContainer.classList.remove(
                "register-mode"
            );

        }

        currentMode = "login";

    }
);

/* =========================================================
   AV MARKET
   LOGIN / REGISTRO
   JAVASCRIPT
   ========================================================= */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================================
   ELEMENTOS PRINCIPAIS
   ========================================================= */

const authContainer = document.querySelector(".auth-container");
const brandPanel = document.getElementById("brandPanel");

const brandLoginContent =
    document.getElementById("brandLoginContent");

const brandBuyerContent =
    document.getElementById("brandBuyerContent");

const brandResellerContent =
    document.getElementById("brandResellerContent");


/* =========================================================
   FORMULÁRIOS
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");

const buyerRegisterForm =
    document.getElementById("buyerRegisterForm");

const resellerContractForm =
    document.getElementById("resellerContractForm");

const resellerRegisterForm =
    document.getElementById("resellerRegisterForm");


/* =========================================================
   LOGIN
   ========================================================= */

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");


/* =========================================================
   COMPRADOR
   ========================================================= */

const buyerName =
    document.getElementById("buyerName");

const buyerEmail =
    document.getElementById("buyerEmail");

const buyerPassword =
    document.getElementById("buyerPassword");

const buyerConfirmPassword =
    document.getElementById("buyerConfirmPassword");

const buyerTerms =
    document.getElementById("buyerTerms");

const createBuyerBtn =
    document.getElementById("createBuyerBtn");

const buyerMessage =
    document.getElementById("buyerMessage");


/* =========================================================
   REVENDEDOR — CONTRATO
   ========================================================= */

const resellerContractAccepted =
    document.getElementById("resellerContractAccepted");

const continueResellerBtn =
    document.getElementById("continueResellerBtn");

const contractMessage =
    document.getElementById("contractMessage");


/* =========================================================
   REVENDEDOR
   ========================================================= */

const resellerName =
    document.getElementById("resellerName");

const resellerBusiness =
    document.getElementById("resellerBusiness");

const resellerEmail =
    document.getElementById("resellerEmail");

const resellerPhone =
    document.getElementById("resellerPhone");

const resellerPassword =
    document.getElementById("resellerPassword");

const resellerConfirmPassword =
    document.getElementById("resellerConfirmPassword");

const resellerTerms =
    document.getElementById("resellerTerms");

const createResellerBtn =
    document.getElementById("createResellerBtn");

const resellerMessage =
    document.getElementById("resellerMessage");


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

function showMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;

    element.className = `form-message ${type}`;

}


function clearMessages() {

    [
        loginMessage,
        buyerMessage,
        contractMessage,
        resellerMessage
    ].forEach(element => {

        if (element) {
            element.textContent = "";
            element.className = "form-message";
        }

    });

}


/* =========================================================
   CONTROLO DOS PAINÉIS
   ========================================================= */

/*
    Estado inicial:

    ┌──────────────────────────────┐
    │ PAINEL ESCURO │ LOGIN       │
    │               │             │
    │               │             │
    └──────────────────────────────┘

    Ao clicar em comprador/revendedor:

    ┌──────────────────────────────┐
    │ FORMULÁRIO      │ PAINEL    │
    │               │ ESCURO       │
    └──────────────────────────────┘

    A classe "active" é responsável pela
    animação definida no login.css.
*/


function resetBrandContents() {

    if (brandLoginContent)
        brandLoginContent.classList.remove("active");

    if (brandBuyerContent)
        brandBuyerContent.classList.remove("active");

    if (brandResellerContent)
        brandResellerContent.classList.remove("active");

}


function showLoginPanel() {

    clearMessages();

    resetBrandContents();

    if (brandLoginContent)
        brandLoginContent.classList.add("active");

    if (authContainer)
        authContainer.classList.remove("register-mode");

    if (brandPanel)
        brandPanel.classList.remove("register-mode");

}


function showBuyerPanel() {

    clearMessages();

    resetBrandContents();

    if (brandBuyerContent)
        brandBuyerContent.classList.add("active");

    if (authContainer)
        authContainer.classList.add("register-mode");

    if (brandPanel)
        brandPanel.classList.add("register-mode");

}


function showResellerContractPanel() {

    clearMessages();

    resetBrandContents();

    if (brandResellerContent)
        brandResellerContent.classList.add("active");

    if (authContainer)
        authContainer.classList.add("register-mode");

    if (brandPanel)
        brandPanel.classList.add("register-mode");

}


/* =========================================================
   BOTÕES DE NAVEGAÇÃO
   ========================================================= */

document.addEventListener("click", event => {

    const target = event.target.closest("[data-action]");

    if (!target) return;

    const action = target.dataset.action;


    /* -----------------------------------------------------
       LOGIN
       ----------------------------------------------------- */

    if (action === "login") {

        showLoginPanel();

    }


    /* -----------------------------------------------------
       CRIAR COMPRADOR
       ----------------------------------------------------- */

    if (action === "buyer") {

        showBuyerPanel();

    }


    /* -----------------------------------------------------
       CRIAR REVENDEDOR
       ----------------------------------------------------- */

    if (action === "reseller") {

        showResellerContractPanel();

    }


    /* -----------------------------------------------------
       VOLTAR
       ----------------------------------------------------- */

    if (action === "back-login") {

        showLoginPanel();

    }

});


/* =========================================================
   LOGIN COM FIREBASE
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async event => {

        event.preventDefault();

        clearMessages();

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        /* -----------------------------------------------
           VALIDAÇÃO
           ----------------------------------------------- */

        if (!email || !password) {

            showMessage(
                loginMessage,
                "Preencha o e-mail e a palavra-passe."
            );

            return;
        }


        /* -----------------------------------------------
           ESTADO DO BOTÃO
           ----------------------------------------------- */

        const originalText =
            loginBtn.textContent;

        loginBtn.disabled = true;
        loginBtn.textContent = "A entrar...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            showMessage(
                loginMessage,
                "Login efetuado com sucesso.",
                "success"
            );


            /*
                O onAuthStateChanged abaixo
                tratará do redirecionamento.
            */


        } catch (error) {

            console.error(
                "Erro no login:",
                error
            );


            let message =
                "Não foi possível entrar.";


            switch (error.code) {

                case "auth/invalid-credential":
                case "auth/wrong-password":
                case "auth/user-not-found":

                    message =
                        "E-mail ou palavra-passe incorretos.";

                    break;


                case "auth/invalid-email":

                    message =
                        "Introduza um e-mail válido.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "Muitas tentativas. Tente novamente mais tarde.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "Verifique a sua ligação à internet.";

                    break;

            }


            showMessage(
                loginMessage,
                message
            );


        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = originalText;

        }

    });

}


/* =========================================================
   REGISTO DO COMPRADOR
   ========================================================= */

if (buyerRegisterForm) {

    buyerRegisterForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            clearMessages();


            const name =
                buyerName.value.trim();

            const email =
                buyerEmail.value.trim();

            const password =
                buyerPassword.value;

            const confirmPassword =
                buyerConfirmPassword.value;


            /* ---------------------------------------------
               VALIDAÇÕES
               --------------------------------------------- */

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                showMessage(
                    buyerMessage,
                    "Preencha todos os campos."
                );

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    buyerMessage,
                    "As palavras-passe não coincidem."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    buyerMessage,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

                return;
            }


            if (
                buyerTerms &&
                !buyerTerms.checked
            ) {

                showMessage(
                    buyerMessage,
                    "Aceite os termos para continuar."
                );

                return;
            }


            /* ---------------------------------------------
               ESTADO DO BOTÃO
               --------------------------------------------- */

            const originalText =
                createBuyerBtn.textContent;

            createBuyerBtn.disabled = true;
            createBuyerBtn.textContent =
                "A criar conta...";


            try {

                /* -----------------------------------------
                   CRIA UTILIZADOR NO FIREBASE AUTH
                   ----------------------------------------- */

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                /* -----------------------------------------
                   GUARDA PERFIL NO FIRESTORE
                   ----------------------------------------- */

                await setDoc(
                    doc(db, "users", user.uid),
                    {

                        uid: user.uid,

                        name: name,

                        email: email,

                        role: "buyer",

                        accountType: "buyer",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* -----------------------------------------
                   SUCESSO
                   ----------------------------------------- */

                showMessage(
                    buyerMessage,
                    "Conta de comprador criada com sucesso!",
                    "success"
                );


                /*
                    Pequena pausa para o utilizador
                    visualizar a mensagem.
                */

                setTimeout(() => {

                    window.location.href =
                        "../index.html";

                }, 1200);


            } catch (error) {

                console.error(
                    "Erro ao criar comprador:",
                    error
                );


                let message =
                    "Não foi possível criar a conta.";


                switch (error.code) {

                    case "auth/email-already-in-use":

                        message =
                            "Este e-mail já está associado a uma conta.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Introduza um e-mail válido.";

                        break;


                    case "auth/weak-password":

                        message =
                            "A palavra-passe é demasiado fraca.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Verifique a sua ligação à internet.";

                        break;

                }


                showMessage(
                    buyerMessage,
                    message
                );


            } finally {

                createBuyerBtn.disabled = false;

                createBuyerBtn.textContent =
                    originalText;

            }

        }
    );

}


/* =========================================================
   CONTRATO DO REVENDEDOR
   ========================================================= */

if (resellerContractForm) {

    resellerContractForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            clearMessages();


            if (
                resellerContractAccepted &&
                !resellerContractAccepted.checked
            ) {

                showMessage(
                    contractMessage,
                    "É necessário aceitar o contrato para continuar."
                );

                return;
            }


            /*
                Depois de aceitar o contrato,
                escondemos o contrato e mostramos
                o formulário do revendedor.
            */

            resellerContractForm.classList.add(
                "hidden"
            );


            if (resellerRegisterForm) {

                resellerRegisterForm.classList.remove(
                    "hidden"
                );

            }


            /*
                Mantém o painel escuro no lado
                correto enquanto o formulário
                aparece.
            */

            if (authContainer) {

                authContainer.classList.add(
                    "reseller-form-mode"
                );

            }

        }
    );

}


/* =========================================================
   REGISTO DO REVENDEDOR
   ========================================================= */

if (resellerRegisterForm) {

    resellerRegisterForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            clearMessages();


            const name =
                resellerName.value.trim();

            const business =
                resellerBusiness.value.trim();

            const email =
                resellerEmail.value.trim();

            const phone =
                resellerPhone.value.trim();

            const password =
                resellerPassword.value;

            const confirmPassword =
                resellerConfirmPassword.value;


            /* ---------------------------------------------
               VALIDAÇÃO
               --------------------------------------------- */

            if (
                !name ||
                !business ||
                !email ||
                !phone ||
                !password ||
                !confirmPassword
            ) {

                showMessage(
                    resellerMessage,
                    "Preencha todos os campos."
                );

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    resellerMessage,
                    "As palavras-passe não coincidem."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    resellerMessage,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

                return;
            }


            if (
                resellerTerms &&
                !resellerTerms.checked
            ) {

                showMessage(
                    resellerMessage,
                    "Aceite os termos para continuar."
                );

                return;
            }


            /* ---------------------------------------------
               BOTÃO
               --------------------------------------------- */

            const originalText =
                createResellerBtn.textContent;

            createResellerBtn.disabled = true;

            createResellerBtn.textContent =
                "A criar conta...";


            try {

                /* -----------------------------------------
                   FIREBASE AUTH
                   ----------------------------------------- */

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                /* -----------------------------------------
                   FIRESTORE
                   ----------------------------------------- */

                await setDoc(
                    doc(db, "users", user.uid),
                    {

                        uid: user.uid,

                        name: name,

                        businessName: business,

                        email: email,

                        phone: phone,

                        role: "reseller",

                        accountType: "reseller",

                        contractAccepted: true,

                        contractAcceptedAt:
                            serverTimestamp(),

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* -----------------------------------------
                   SUCESSO
                   ----------------------------------------- */

                showMessage(
                    resellerMessage,
                    "Conta de revendedor criada com sucesso!",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "../index.html";

                }, 1200);


            } catch (error) {

                console.error(
                    "Erro ao criar revendedor:",
                    error
                );


                let message =
                    "Não foi possível criar a conta.";


                switch (error.code) {

                    case "auth/email-already-in-use":

                        message =
                            "Este e-mail já está associado a uma conta.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Introduza um e-mail válido.";

                        break;


                    case "auth/weak-password":

                        message =
                            "A palavra-passe é demasiado fraca.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Verifique a sua ligação à internet.";

                        break;

                }


                showMessage(
                    resellerMessage,
                    message
                );


            } finally {

                createResellerBtn.disabled = false;

                createResellerBtn.textContent =
                    originalText;

            }

        }
    );

}


/* =========================================================
   ESTADO DA AUTENTICAÇÃO
   ========================================================= */

onAuthStateChanged(
    auth,
    user => {

        /*
            Não fazemos redirecionamento automático
            aqui quando o utilizador já está na página
            de login.

            O redirecionamento acontece depois do
            login/registo concluído.
        */

        if (user) {

            console.log(
                "Utilizador autenticado:",
                user.uid
            );

        }

    }
);


/* =========================================================
   MOSTRAR LOGIN INICIAL
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showLoginPanel();

    }
);

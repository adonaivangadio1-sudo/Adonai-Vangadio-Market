/* =========================================================
   AV MARKET
   SISTEMA DE LOGIN PREMIUM
   LOGIN.CSS
========================================================= */


/* =========================================================
   01. RESET
========================================================= */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}


html {
    scroll-behavior: smooth;
}


body {
    min-height: 100vh;
    font-family: "Inter", sans-serif;
    background:
        radial-gradient(
            circle at 15% 20%,
            rgba(255, 255, 255, 0.06),
            transparent 30%
        ),
        radial-gradient(
            circle at 85% 80%,
            rgba(255, 255, 255, 0.04),
            transparent 30%
        ),
        #080808;

    color: #111;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}


button,
input {
    font-family: inherit;
}


button {
    border: none;
    outline: none;
    cursor: pointer;
}


input {
    outline: none;
}


svg {
    display: block;
}


/* =========================================================
   02. PÁGINA PRINCIPAL
========================================================= */

.auth-page {
    width: 100%;
    min-height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 40px;

    position: relative;
}


/* =========================================================
   03. CONTAINER PRINCIPAL
========================================================= */

.auth-container {

    width: min(1120px, 100%);

    height: 680px;

    position: relative;

    background: #f8f7f5;

    border-radius: 28px;

    overflow: hidden;

    box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.45),
        0 10px 30px rgba(0, 0, 0, 0.18);

    isolation: isolate;
}


/* =========================================================
   04. ÁREA DOS FORMULÁRIOS
========================================================= */

.auth-forms {

    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    z-index: 2;

    pointer-events: none;
}


/* =========================================================
   05. FORMULÁRIOS
========================================================= */

.auth-form {

    position: absolute;

    top: 0;

    width: 50%;
    height: 100%;

    padding: 70px 75px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    background: #f8f7f5;

    opacity: 0;
    visibility: hidden;

    pointer-events: none;

    transition:
        opacity 0.35s ease,
        visibility 0.35s ease,
        transform 0.65s cubic-bezier(0.77, 0, 0.18, 1);

    transform: translateX(25px);
}


/* LOGIN FICA À DIREITA */

.login-form {
    right: 0;

    transform: translateX(0);
}


/* COMPRADOR COMEÇA À ESQUERDA */

.buyer-form,
.seller-form {
    left: 0;

    transform: translateX(-25px);
}


/* FORMULÁRIO ATIVO */

.auth-form.active {

    opacity: 1;

    visibility: visible;

    pointer-events: auto;

    transform: translateX(0);
}


/* =========================================================
   06. PAINEL ESCURO DINÂMICO
========================================================= */

.auth-panel {

    position: absolute;

    top: 0;
    left: 0;

    width: 50%;
    height: 100%;

    z-index: 10;

    padding: 55px;

    color: #fff;

    overflow: hidden;

    background:
        radial-gradient(
            circle at 15% 15%,
            rgba(255, 255, 255, 0.10),
            transparent 28%
        ),
        radial-gradient(
            circle at 90% 85%,
            rgba(255, 255, 255, 0.05),
            transparent 35%
        ),
        linear-gradient(
            145deg,
            #050505,
            #111111 55%,
            #181818
        );

    border-radius: 28px 90px 90px 28px;

    display: flex;
    flex-direction: column;

    transition:
        transform 0.8s cubic-bezier(0.77, 0, 0.18, 1),
        border-radius 0.8s cubic-bezier(0.77, 0, 0.18, 1);
}


/* =========================================================
   07. PAINEL NO LADO DIREITO
========================================================= */

.auth-container.buyer-mode .auth-panel,
.auth-container.seller-mode .auth-panel {

    transform: translateX(100%);

    border-radius: 90px 28px 28px 90px;
}


/* =========================================================
   08. LOGO
========================================================= */

.panel-logo {

    display: flex;

    align-items: center;

    gap: 13px;

    position: relative;

    z-index: 3;
}


.logo-mark {

    width: 46px;
    height: 46px;

    border-radius: 14px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #fff;

    color: #090909;

    font-size: 15px;

    font-weight: 800;

    letter-spacing: -0.5px;

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.25);
}


.logo-name {

    display: flex;

    flex-direction: column;

    line-height: 1;
}


.logo-name strong {

    font-size: 17px;

    font-weight: 800;

    letter-spacing: 1px;
}


.logo-name span {

    margin-top: 4px;

    font-size: 8px;

    font-weight: 600;

    letter-spacing: 3px;

    opacity: 0.55;
}


/* =========================================================
   09. CONTEÚDO DO PAINEL
========================================================= */

.panel-content {

    position: absolute;

    left: 55px;
    right: 55px;

    top: 50%;

    transform: translateY(-45%);

    opacity: 0;

    visibility: hidden;

    pointer-events: none;

    transition:
        opacity 0.4s ease,
        transform 0.65s cubic-bezier(0.77, 0, 0.18, 1),
        visibility 0.4s ease;
}


/* PAINEL LOGIN ATIVO */

.panel-login {

    opacity: 1;

    visibility: visible;

    pointer-events: auto;

    transform: translateY(-50%);
}


/* QUANDO É COMPRADOR */

.auth-container.buyer-mode .panel-login,
.auth-container.seller-mode .panel-login {

    opacity: 0;

    visibility: hidden;

    pointer-events: none;

    transform: translateY(-60%);
}


/* PAINEL COMPRADOR */

.auth-container.buyer-mode .panel-buyer {

    opacity: 1;

    visibility: visible;

    pointer-events: auto;

    transform: translateY(-50%);
}


/* PAINEL REVENDEDOR */

.auth-container.seller-mode .panel-seller {

    opacity: 1;

    visibility: visible;

    pointer-events: auto;

    transform: translateY(-50%);
}


/* =========================================================
   10. LABEL DO PAINEL
========================================================= */

.panel-label {

    display: inline-block;

    margin-bottom: 18px;

    font-size: 10px;

    font-weight: 700;

    letter-spacing: 2.5px;

    color: rgba(255, 255, 255, 0.55);
}


/* =========================================================
   11. TÍTULO DO PAINEL
========================================================= */

.panel-content h1 {

    max-width: 390px;

    font-size: clamp(32px, 3.2vw, 48px);

    line-height: 1.05;

    letter-spacing: -2px;

    font-weight: 800;

    color: #fff;
}


/* =========================================================
   12. TEXTO DO PAINEL
========================================================= */

.panel-content > p {

    max-width: 360px;

    margin-top: 20px;

    font-size: 14px;

    line-height: 1.7;

    color: rgba(255, 255, 255, 0.58);
}


/* =========================================================
   13. OPÇÕES DE CONTA
========================================================= */

.account-options {

    margin-top: 34px;

    display: flex;

    flex-direction: column;

    gap: 12px;
}


/* =========================================================
   14. BOTÃO DE OPÇÃO
========================================================= */

.panel-option {

    width: 100%;

    min-height: 72px;

    padding: 12px 15px;

    display: flex;

    align-items: center;

    gap: 13px;

    text-align: left;

    color: #fff;

    background: rgba(255, 255, 255, 0.055);

    border: 1px solid rgba(255, 255, 255, 0.08);

    border-radius: 16px;

    transition:
        background 0.25s ease,
        border-color 0.25s ease,
        transform 0.25s ease;
}


.panel-option:hover {

    background: rgba(255, 255, 255, 0.10);

    border-color: rgba(255, 255, 255, 0.17);

    transform: translateX(5px);
}


/* =========================================================
   15. ÍCONE DAS OPÇÕES
========================================================= */

.option-icon {

    width: 42px;
    height: 42px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background: rgba(255, 255, 255, 0.09);
}


.option-icon svg {

    width: 20px;
    height: 20px;

    fill: none;

    stroke: currentColor;

    stroke-width: 1.6;

    stroke-linecap: round;

    stroke-linejoin: round;
}


/* =========================================================
   16. TEXTO DAS OPÇÕES
========================================================= */

.option-text {

    min-width: 0;

    flex: 1;

    display: flex;

    flex-direction: column;

    gap: 5px;
}


.option-text strong {

    font-size: 12px;

    font-weight: 700;
}


.option-text small {

    font-size: 10px;

    color: rgba(255, 255, 255, 0.45);
}


/* =========================================================
   17. SETA
========================================================= */

.option-arrow {

    font-size: 20px;

    color: rgba(255, 255, 255, 0.45);

    transition:
        transform 0.25s ease,
        color 0.25s ease;
}


.panel-option:hover .option-arrow {

    color: #fff;

    transform: translateX(4px);
}


/* =========================================================
   18. FEATURES
========================================================= */

.panel-feature {

    margin-top: 35px;

    padding-top: 25px;

    border-top: 1px solid rgba(255, 255, 255, 0.10);

    display: flex;

    align-items: flex-start;

    gap: 16px;
}


.feature-number {

    font-size: 11px;

    font-weight: 700;

    letter-spacing: 1px;

    color: rgba(255, 255, 255, 0.35);
}


.panel-feature strong {

    display: block;

    font-size: 12px;

    font-weight: 700;
}


.panel-feature small {

    display: block;

    margin-top: 6px;

    font-size: 10px;

    line-height: 1.5;

    color: rgba(255, 255, 255, 0.45);
}


/* =========================================================
   19. BOTÃO VOLTAR AO LOGIN
========================================================= */

.back-login {

    margin-top: 30px;

    display: inline-flex;

    align-items: center;

    gap: 10px;

    color: #fff;

    background: transparent;

    font-size: 11px;

    font-weight: 600;

    opacity: 0.7;

    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}


.back-login:hover {

    opacity: 1;

    transform: translateX(-4px);
}


.back-login span {

    font-size: 18px;

    line-height: 1;
}


/* =========================================================
   20. CABEÇALHO DO FORMULÁRIO
========================================================= */

.form-header {

    margin-bottom: 32px;
}


.form-label {

    display: inline-block;

    margin-bottom: 12px;

    font-size: 9px;

    font-weight: 700;

    letter-spacing: 2.5px;

    color: #999;
}


.form-header h2 {

    font-size: 38px;

    line-height: 1;

    font-weight: 800;

    letter-spacing: -1.7px;

    color: #111;
}


.form-header p {

    margin-top: 11px;

    font-size: 12px;

    line-height: 1.6;

    color: #999;
}


/* =========================================================
   21. INPUT GROUP
========================================================= */

.input-group {

    margin-bottom: 16px;
}


.input-group label {

    display: block;

    margin-bottom: 8px;

    font-size: 10px;

    font-weight: 600;

    color: #555;
}


/* =========================================================
   22. INPUT WRAPPER
========================================================= */

.input-wrapper {

    position: relative;

    width: 100%;
}


.input-wrapper > svg {

    position: absolute;

    left: 15px;

    top: 50%;

    width: 17px;
    height: 17px;

    transform: translateY(-50%);

    fill: none;

    stroke: #9a9a9a;

    stroke-width: 1.6;

    stroke-linecap: round;

    stroke-linejoin: round;

    pointer-events: none;

    transition: stroke 0.2s ease;
}


.input-wrapper:focus-within > svg {

    stroke: #111;
}


/* =========================================================
   23. INPUT
========================================================= */

.input-wrapper input {

    width: 100%;

    height: 50px;

    padding:
        0 44px
        0 44px;

    border: 1px solid #e9e7e4;

    border-radius: 12px;

    background: #f1efec;

    color: #111;

    font-size: 12px;

    font-weight: 500;

    transition:
        border-color 0.2s ease,
        background 0.2s ease,
        box-shadow 0.2s ease;
}


.input-wrapper input::placeholder {

    color: #aaa;
}


.input-wrapper input:hover {

    background: #eeece9;
}


.input-wrapper input:focus {

    background: #fff;

    border-color: #bbb;

    box-shadow:
        0 0 0 3px rgba(0, 0, 0, 0.035);
}


/* =========================================================
   24. BOTÃO MOSTRAR PALAVRA-PASSE
========================================================= */

.password-toggle {

    position: absolute;

    right: 13px;

    top: 50%;

    width: 28px;
    height: 28px;

    transform: translateY(-50%);

    display: flex;

    align-items: center;
    justify-content: center;

    background: transparent;

    color: #999;
}


.password-toggle svg {

    width: 17px;
    height: 17px;

    fill: none;

    stroke: currentColor;

    stroke-width: 1.6;

    stroke-linecap: round;

    stroke-linejoin: round;
}


.password-toggle:hover {

    color: #111;
}


/* =========================================================
   25. OPÇÕES DO FORMULÁRIO
========================================================= */

.form-options {

    margin-top: 3px;

    margin-bottom: 20px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 10px;
}


.remember-option {

    display: flex;

    align-items: center;

    gap: 7px;

    cursor: pointer;

    font-size: 10px;

    color: #888;
}


.remember-option input {

    width: 13px;
    height: 13px;

    accent-color: #111;

    cursor: pointer;
}


.forgot-password {

    background: transparent;

    color: #555;

    font-size: 10px;

    font-weight: 600;

    transition: color 0.2s ease;
}


.forgot-password:hover {

    color: #000;
}


/* =========================================================
   26. BOTÃO PRINCIPAL
========================================================= */

.primary-button {

    width: 100%;

    height: 52px;

    padding: 0 18px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    border-radius: 12px;

    background: #111;

    color: #fff;

    font-size: 11px;

    font-weight: 700;

    letter-spacing: 0.1px;

    box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.12);

    transition:
        transform 0.25s ease,
        background 0.25s ease,
        box-shadow 0.25s ease;
}


.primary-button:hover {

    background: #252525;

    transform: translateY(-2px);

    box-shadow:
        0 12px 25px rgba(0, 0, 0, 0.17);
}


.primary-button:active {

    transform: translateY(0);
}


.button-arrow {

    width: 28px;
    height: 28px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: rgba(255, 255, 255, 0.10);

    font-size: 15px;
}


/* =========================================================
   27. MENSAGEM
========================================================= */

.form-message {

    min-height: 18px;

    margin-top: 10px;

    font-size: 10px;

    line-height: 1.5;

    color: #b00020;
}


/* =========================================================
   28. DIVISOR
========================================================= */

.form-divider {

    display: flex;

    align-items: center;

    gap: 12px;

    margin: 14px 0 16px;
}


.form-divider span {

    flex: 1;

    height: 1px;

    background: #e6e3df;
}


.form-divider small {

    font-size: 9px;

    color: #aaa;
}


/* =========================================================
   29. FOOTER DO FORMULÁRIO
========================================================= */

.form-footer {

    text-align: center;
}


.form-footer p {

    font-size: 10px;

    color: #999;
}


.footer-actions {

    margin-top: 8px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 15px;
}


.footer-actions button,
.text-button {

    background: transparent;

    color: #222;

    font-size: 10px;

    font-weight: 700;

    transition: opacity 0.2s ease;
}


.footer-actions button:hover,
.text-button:hover {

    opacity: 0.55;
}


.text-button {

    margin-top: 8px;
}


/* =========================================================
   30. TERMOS
========================================================= */

.terms-option {

    margin: 1px 0 18px;

    display: flex;

    align-items: flex-start;

    gap: 8px;

    cursor: pointer;

    font-size: 9px;

    line-height: 1.5;

    color: #888;
}


.terms-option input {

    width: 13px;
    height: 13px;

    margin-top: 1px;

    flex-shrink: 0;

    accent-color: #111;

    cursor: pointer;
}


/* =========================================================
   31. ESTADO DE CARREGAMENTO
========================================================= */

.primary-button.loading {

    pointer-events: none;

    opacity: 0.7;
}


.primary-button.loading .button-arrow {

    animation: buttonSpin 0.8s linear infinite;
}


@keyframes buttonSpin {

    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }

}


/* =========================================================
   32. ANIMAÇÃO EXTRA DO PAINEL
========================================================= */

.auth-container::after {

    content: "";

    position: absolute;

    width: 450px;
    height: 450px;

    border-radius: 50%;

    background:
        radial-gradient(
            circle,
            rgba(255, 255, 255, 0.045),
            transparent 65%
        );

    top: -220px;
    left: -220px;

    pointer-events: none;

    z-index: 12;

    opacity: 0.7;
}


/* =========================================================
   33. RESPONSIVIDADE — TABLET
========================================================= */

@media (max-width: 950px) {

    .auth-page {

        padding: 25px;
    }


    .auth-container {

        height: 650px;
    }


    .auth-panel {

        padding: 40px;
    }


    .panel-content {

        left: 40px;
        right: 40px;
    }


    .auth-form {

        padding:
            55px 45px;
    }


    .panel-content h1 {

        font-size: 34px;
    }


    .form-header h2 {

        font-size: 34px;
    }

}


/* =========================================================
   34. RESPONSIVIDADE — MOBILE
========================================================= */

@media (max-width: 720px) {

    body {

        background: #080808;
    }


    .auth-page {

        min-height: 100vh;

        padding: 15px;
    }


    .auth-container {

        width: 100%;

        min-height: 760px;

        height: auto;

        border-radius: 22px;

        overflow: hidden;
    }


    /*
       NO MOBILE:
       O SISTEMA CONTINUA DINÂMICO,
       MAS O PAINEL PASSA PARA CIMA/BAIXO.
    */

    .auth-panel {

        top: 0;

        left: 0;

        width: 100%;

        height: 280px;

        padding: 28px;

        border-radius: 22px 22px 65px 65px;

        transition:
            transform 0.75s cubic-bezier(0.77, 0, 0.18, 1),
            border-radius 0.75s cubic-bezier(0.77, 0, 0.18, 1);
    }


    .auth-container.buyer-mode .auth-panel,
    .auth-container.seller-mode .auth-panel {

        transform: translateY(480px);

        border-radius:
            65px 65px 22px 22px;
    }


    .panel-logo {

        position: relative;
    }


    .logo-mark {

        width: 42px;
        height: 42px;
    }


    .panel-content {

        left: 28px;
        right: 28px;

        top: 58%;

        transform: translateY(-45%);
    }


    .panel-content h1 {

        font-size: 28px;

        letter-spacing: -1.2px;
    }


    .panel-content > p {

        margin-top: 10px;

        font-size: 11px;

        max-width: 320px;
    }


    .account-options {

        margin-top: 18px;

        flex-direction: row;

        gap: 8px;
    }


    .panel-option {

        min-height: 58px;

        padding: 8px;

        border-radius: 12px;

        gap: 7px;
    }


    .option-icon {

        width: 34px;
        height: 34px;

        border-radius: 9px;
    }


    .option-icon svg {

        width: 16px;
        height: 16px;
    }


    .option-text strong {

        font-size: 9px;
    }


    .option-text small {

        display: none;
    }


    .option-arrow {

        display: none;
    }


    .panel-feature {

        margin-top: 15px;

        padding-top: 15px;
    }


    .panel-feature small {

        font-size: 9px;
    }


    .back-login {

        margin-top: 15px;
    }


    /*
       FORMULÁRIOS MOBILE
    */

    .auth-forms {

        position: relative;

        min-height: 760px;

        height: auto;
    }


    .auth-form {

        position: absolute;

        top: 280px;

        left: 0;

        width: 100%;

        height: calc(100% - 280px);

        min-height: 480px;

        padding: 32px 28px 35px;

        justify-content: flex-start;

        overflow-y: auto;
    }


    .login-form {

        right: auto;
    }


    .buyer-form,
    .seller-form {

        left: 0;
    }


    .form-header {

        margin-bottom: 22px;
    }


    .form-header h2 {

        font-size: 31px;
    }


    .input-group {

        margin-bottom: 13px;
    }


    .input-wrapper input {

        height: 48px;
    }


    /*
       QUANDO O PAINEL DESCE,
       OS FORMULÁRIOS ACOMPANHAM.
    */

    .auth-container.buyer-mode .buyer-form.active,
    .auth-container.seller-mode .seller-form.active {

        top: 0;

        padding-top: 35px;
    }


    .auth-container.buyer-mode .login-form,
    .auth-container.seller-mode .login-form {

        top: 280px;
    }


    .auth-container.buyer-mode .panel-buyer,
    .auth-container.seller-mode .panel-seller {

        top: 50%;
    }


    .footer-actions {

        gap: 12px;
    }

}


/* =========================================================
   35. MOBILE PEQUENO
========================================================= */

@media (max-width: 430px) {

    .auth-page {

        padding: 10px;
    }


    .auth-container {

        border-radius: 18px;

        min-height: 740px;
    }


    .auth-panel {

        height: 270px;

        padding: 24px;

        border-radius:
            18px 18px 55px 55px;
    }


    .auth-container.buyer-mode .auth-panel,
    .auth-container.seller-mode .auth-panel {

        transform: translateY(470px);

        border-radius:
            55px 55px 18px 18px;
    }


    .panel-content {

        left: 24px;
        right: 24px;
    }


    .panel-content h1 {

        font-size: 25px;
    }


    .panel-content > p {

        font-size: 10px;
    }


    .account-options {

        gap: 6px;
    }


    .panel-option {

        min-height: 54px;
    }


    .option-icon {

        display: none;
    }


    .auth-forms {

        min-height: 740px;
    }


    .auth-form {

        top: 270px;

        height: calc(100% - 270px);

        padding:
            28px 22px 30px;
    }


    .auth-container.buyer-mode .login-form,
    .auth-container.seller-mode .login-form {

        top: 270px;
    }


    .form-header h2 {

        font-size: 28px;
    }


    .form-header p {

        font-size: 11px;
    }


    .form-options {

        flex-direction: column;

        align-items: flex-start;

        gap: 10px;
    }


    .footer-actions {

        flex-direction: column;

        gap: 7px;
    }

}


/* =========================================================
   36. ACESSIBILIDADE
========================================================= */

@media (prefers-reduced-motion: reduce) {

    *,
    *::before,
    *::after {

        scroll-behavior: auto !important;

        transition-duration: 0.01ms !important;

        animation-duration: 0.01ms !important;

        animation-iteration-count: 1 !important;
    }

}


/* =========================================================
   FIM DO LOGIN.CSS
========================================================= */

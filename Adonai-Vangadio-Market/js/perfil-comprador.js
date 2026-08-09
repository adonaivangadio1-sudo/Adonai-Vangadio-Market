/* ======================================================
   AV MARKET
   PERFIL COMPRADOR
   JAVASCRIPT
====================================================== */


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ==================================================
       ELEMENTOS
    ================================================== */

    const accountButton =
        document.getElementById("buyerAccountButton");

    const accountMenu =
        document.getElementById("buyerAccountMenu");

    const logoutButton =
        document.getElementById("buyerLogoutButton");

    const sidebarLogout =
        document.getElementById("buyerSidebarLogout");


    /* ==================================================
       MENU DA CONTA
    ================================================== */

    if (accountButton && accountMenu) {

        accountButton.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen =
                accountMenu.classList.contains("open");

            accountMenu.classList.toggle("open", !isOpen);

            accountButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });


        document.addEventListener("click", function (event) {

            if (
                !accountMenu.contains(event.target) &&
                !accountButton.contains(event.target)
            ) {

                accountMenu.classList.remove("open");

                accountButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    /* ==================================================
       NOME DO COMPRADOR
    ================================================== */

    carregarNomeComprador();


    /* ==================================================
       DADOS DO PERFIL
    ================================================== */

    atualizarEstatisticas();


    /* ==================================================
       LINKS DO MENU
    ================================================== */

    const menuItems =
        document.querySelectorAll(
            ".buyer-menu a, .account-menu-item"
        );


    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            if (accountMenu) {

                accountMenu.classList.remove("open");

            }

            if (accountButton) {

                accountButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    });


    /* ==================================================
       LOGOUT
    ================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            terminarSessao
        );

    }


    if (sidebarLogout) {

        sidebarLogout.addEventListener(
            "click",
            terminarSessao
        );

    }


    /* ==================================================
       ATUALIZAR MENU ATIVO
    ================================================== */

    const sidebarLinks =
        document.querySelectorAll(".buyer-menu a");


    sidebarLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            sidebarLinks.forEach(function (item) {

                item.classList.remove("active");

            });


            link.classList.add("active");

        });

    });


    /* ==================================================
       NOTIFICAÇÕES
    ================================================== */

    const notificationButton =
        document.querySelector(".buyer-notification");


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                alert(
                    "Não existem novas notificações."
                );

            }
        );

    }


});


/* ======================================================
   CARREGAR NOME DO COMPRADOR
====================================================== */

function carregarNomeComprador() {


    let nome = null;


    const possiveisChaves = [

        "buyerName",

        "compradorNome",

        "userName",

        "nomeUsuario",

        "nome",

        "accountName"

    ];


    for (
        let i = 0;
        i < possiveisChaves.length;
        i++
    ) {

        const valor =
            localStorage.getItem(
                possiveisChaves[i]
            );


        if (valor) {

            nome = valor;

            break;

        }

    }


    /* ==================================================
       TENTAR LER OBJETO DE USUÁRIO
    ================================================== */

    if (!nome) {

        const possiveisObjetos = [

            "currentUser",

            "usuarioAtual",

            "user",

            "loggedUser",

            "buyerAccount"

        ];


        for (
            let i = 0;
            i < possiveisObjetos.length;
            i++
        ) {

            try {

                const objeto =
                    JSON.parse(
                        localStorage.getItem(
                            possiveisObjetos[i]
                        )
                    );


                if (
                    objeto &&
                    typeof objeto === "object"
                ) {

                    nome =
                        objeto.nome ||
                        objeto.name ||
                        objeto.nomeCompleto ||
                        objeto.fullName;

                    if (nome) {

                        break;

                    }

                }

            } catch (erro) {

                /* Ignorar valores que não sejam JSON */

            }

        }

    }


    if (!nome) {

        nome = "Comprador";

    }


    /* ==================================================
       ATUALIZAR INTERFACE
    ================================================== */

    const headerName =
        document.getElementById(
            "buyerHeaderName"
        );


    const menuName =
        document.getElementById(
            "buyerMenuName"
        );


    const welcomeName =
        document.getElementById(
            "buyerWelcomeName"
        );


    if (headerName) {

        headerName.textContent =
            nome;

    }


    if (menuName) {

        menuName.textContent =
            nome;

    }


    if (welcomeName) {

        welcomeName.textContent =
            nome;

    }

}


/* ======================================================
   ESTATÍSTICAS
====================================================== */

function atualizarEstatisticas() {


    /* ==================================================
       CARRINHO
    ================================================== */

    const carrinho =
        obterArrayLocalStorage([
            "cart",
            "carrinho",
            "shoppingCart"
        ]);


    /* ==================================================
       FAVORITOS
    ================================================== */

    const favoritos =
        obterArrayLocalStorage([
            "favorites",
            "favoritos",
            "wishlist"
        ]);


    /* ==================================================
       PEDIDOS
    ================================================== */

    const pedidos =
        obterArrayLocalStorage([
            "orders",
            "pedidos",
            "buyerOrders"
        ]);


    const comprasElement =
        document.getElementById(
            "buyerPurchasesCount"
        );


    const pedidosElement =
        document.getElementById(
            "buyerOrdersCount"
        );


    const favoritosElement =
        document.getElementById(
            "buyerFavoritesCount"
        );


    if (comprasElement) {

        comprasElement.textContent =
            pedidos.length;

    }


    if (pedidosElement) {

        pedidosElement.textContent =
            pedidos.length;

    }


    if (favoritosElement) {

        favoritosElement.textContent =
            favoritos.length;

    }


    /* ==================================================
       SALDO
    ================================================== */

    const saldo =
        localStorage.getItem("buyerBalance") ||
        localStorage.getItem("saldo") ||
        "0";


    const saldoElement =
        document.getElementById(
            "buyerBalance"
        );


    if (saldoElement) {

        saldoElement.textContent =
            formatarMoeda(saldo);

    }

}


/* ======================================================
   OBTER ARRAY DO LOCAL STORAGE
====================================================== */

function obterArrayLocalStorage(chaves) {


    for (
        let i = 0;
        i < chaves.length;
        i++
    ) {

        const valor =
            localStorage.getItem(
                chaves[i]
            );


        if (!valor) {

            continue;

        }


        try {

            const dados =
                JSON.parse(valor);


            if (Array.isArray(dados)) {

                return dados;

            }

        } catch (erro) {

            continue;

        }

    }


    return [];

}


/* ======================================================
   FORMATAR MOEDA
====================================================== */

function formatarMoeda(valor) {


    const numero =
        Number(
            String(valor)
                .replace(/[^\d.,-]/g, "")
                .replace(",", ".")
        );


    if (Number.isNaN(numero)) {

        return "0 Kz";

    }


    return (
        new Intl.NumberFormat(
            "pt-AO"
        ).format(numero)
        + " Kz"
    );

}


/* ======================================================
   TERMINAR SESSÃO
====================================================== */

function terminarSessao() {


    /* ==================================================
       REMOVER DADOS DE SESSÃO
    ================================================== */

    const chavesSessao = [

        "loggedIn",

        "isLoggedIn",

        "userLoggedIn",

        "buyerLoggedIn",

        "sellerLoggedIn",

        "resellerLoggedIn",

        "currentUser",

        "usuarioAtual",

        "loggedUser",

        "accountName",

        "accountType"

    ];


    chavesSessao.forEach(function (chave) {

        localStorage.removeItem(chave);

    });


    /* ==================================================
       MARCAR COMO DESLOGADO
    ================================================== */

    localStorage.setItem(
        "loggedIn",
        "false"
    );


    /* ==================================================
       IR PARA LOGIN
    ================================================== */

    window.location.href =
        "login.html";

}


/* ======================================================
   FECHAR MENU AO PRESSIONAR ESC
====================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {

            return;

        }


        const menu =
            document.getElementById(
                "buyerAccountMenu"
            );


        const button =
            document.getElementById(
                "buyerAccountButton"
            );


        if (menu) {

            menu.classList.remove("open");

        }


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);

/* ======================================================
   AV MARKET
   VENDEDOR.JS
   ÁREA DO REVENDEDOR
====================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ==================================================
       SIDEBAR MOBILE
    ================================================== */

    const menuButton =
        document.querySelector("#sellerMenuButton");

    const sidebar =
        document.querySelector("#sellerSidebar");


    if (menuButton && sidebar) {

        menuButton.addEventListener("click", function () {

            sidebar.classList.toggle("open");

        });

    }



    /* ==================================================
       FECHAR SIDEBAR AO CLICAR NUM ITEM
    ================================================== */

    const menuLinks =
        document.querySelectorAll(".seller-menu a");


    menuLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            menuLinks.forEach(function (item) {

                item.classList.remove("active");

            });


            link.classList.add("active");


            if (window.innerWidth <= 800) {

                sidebar.classList.remove("open");

            }

        });

    });



    /* ==================================================
       FORMULÁRIO DE PRODUTO
    ================================================== */

    const productForm =
        document.querySelector("#productForm");


    const toast =
        document.querySelector("#sellerToast");


    if (productForm) {

        productForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const productName =
                document.querySelector("#productName").value.trim();


            if (!productName) {

                return;

            }


            /* ------------------------------------------
               MOSTRAR NOTIFICAÇÃO
            ------------------------------------------ */

            if (toast) {

                toast.classList.add("show");


                setTimeout(function () {

                    toast.classList.remove("show");

                }, 3000);

            }


            /* ------------------------------------------
               LIMPAR FORMULÁRIO
            ------------------------------------------ */

            productForm.reset();

        });

    }



    /* ==================================================
       FOTOGRAFIA DO PRODUTO
    ================================================== */

    const productImage =
        document.querySelector("#productImage");


    if (productImage) {

        productImage.addEventListener("change", function () {

            const upload =
                document.querySelector(".seller-upload span");


            if (
                upload &&
                productImage.files &&
                productImage.files.length > 0
            ) {

                upload.textContent =
                    productImage.files[0].name;

            }

        });

    }



    /* ==================================================
       LINKS INTERNOS
    ================================================== */

    const internalLinks =
        document.querySelectorAll(
            '.seller-menu a[href^="#"], .seller-welcome a[href^="#"], .seller-empty a[href^="#"]'
        );


    internalLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                link.getAttribute("href");


            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

        });

    });

});

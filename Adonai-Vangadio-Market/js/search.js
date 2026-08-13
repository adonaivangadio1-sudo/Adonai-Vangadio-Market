/*======================================================
JS/SEARCH.JS

PESQUISA INTELIGENTE
======================================================*/


const searchInput=document.querySelector("#searchInput");

const searchButton=document.querySelector(".search-button");



if(searchButton){


searchButton.onclick=()=>{


let value=searchInput.value.trim();


if(value){

location.href=

"pages/pesquisa.html?q="+

encodeURIComponent(value);


}


};


}



const filterButton=document.querySelector(".filter-button");

const filterBox=document.querySelector(".search-filter");



if(filterButton){

filterButton.onclick=()=>{

filterBox.classList.toggle("active");

};

}

/* =========================================================
   AV MARKET — PESQUISA POR FOTOGRAFIA
   SUPABASE STORAGE
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       CONFIGURAÇÃO SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://miwkwrynzgymhktjmhcc.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_-WTr7-Xos9C24IED7FQwag_56cxUJ6Q";

    const STORAGE_BUCKET = "product-images";


    /* =====================================================
       ELEMENTOS DO HTML
    ===================================================== */

    const imageSearchButton =
        document.getElementById("imageSearchButton");

    const imageSearchInput =
        document.getElementById("imageSearchInput");

    const searchInput =
        document.getElementById("searchInput");


    /* =====================================================
       VERIFICAR ELEMENTOS
    ===================================================== */

    if (!imageSearchButton || !imageSearchInput) {

        console.warn(
            "AV Market: elementos da pesquisa por fotografia não encontrados."
        );

        return;
    }


    /* =====================================================
       ABRIR CÂMERA / GALERIA
    ===================================================== */

    imageSearchButton.addEventListener("click", function () {

        imageSearchInput.click();

    });


    /* =====================================================
       QUANDO O UTILIZADOR ESCOLHER UMA FOTOGRAFIA
    ===================================================== */

    imageSearchInput.addEventListener("change", async function (event) {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }


        /* =================================================
           VERIFICAR TIPO DE ARQUIVO
        ================================================= */

        if (!file.type.startsWith("image/")) {

            alert(
                "Por favor, selecione uma fotografia válida."
            );

            imageSearchInput.value = "";

            return;
        }


        /* =================================================
           LIMITE DE 10 MB
        ================================================= */

        const MAX_SIZE = 10 * 1024 * 1024;

        if (file.size > MAX_SIZE) {

            alert(
                "A fotografia é muito grande. O tamanho máximo é 10 MB."
            );

            imageSearchInput.value = "";

            return;
        }


        /* =================================================
           MOSTRAR ESTADO DE PROCESSAMENTO
        ================================================= */

        const originalHTML =
            imageSearchButton.innerHTML;

        imageSearchButton.disabled = true;

        imageSearchButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;


        try {

            /* =============================================
               CRIAR NOME ÚNICO
            ============================================= */

            const extension =
                getFileExtension(file);

            const uniqueName =
                `search-${Date.now()}-${crypto.randomUUID()}${extension}`;

            const filePath =
                `searches/${uniqueName}`;


            /* =============================================
               ENVIAR IMAGEM PARA SUPABASE STORAGE
            ============================================= */

            const uploadURL =
                `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;


            const uploadResponse =
                await fetch(uploadURL, {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "apikey":
                            SUPABASE_KEY,

                        "Content-Type":
                            file.type,

                        "x-upsert":
                            "false"

                    },

                    body: file

                });


            /* =============================================
               VERIFICAR UPLOAD
            ============================================= */

            if (!uploadResponse.ok) {

                let errorMessage =
                    "Não foi possível enviar a fotografia.";

                try {

                    const errorData =
                        await uploadResponse.json();

                    if (errorData?.message) {
                        errorMessage =
                            errorData.message;
                    }

                } catch (error) {
                    /* resposta sem JSON */
                }

                throw new Error(errorMessage);
            }


            /* =============================================
               URL PÚBLICA DA IMAGEM
            ============================================= */

            const imageURL =
                `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;


            /* =============================================
               GUARDAR DADOS DA PESQUISA
            ============================================= */

            const searchData = {

                fileName: file.name,

                filePath: filePath,

                imageURL: imageURL,

                fileType: file.type,

                fileSize: file.size,

                createdAt:
                    new Date().toISOString()

            };


            sessionStorage.setItem(
                "avMarketImageSearch",
                JSON.stringify(searchData)
            );


            /* =============================================
               EVENTO PARA O RESTANTE DO SISTEMA
            ============================================= */

            document.dispatchEvent(

                new CustomEvent(
                    "avMarketImageUploaded",
                    {
                        detail: searchData
                    }
                )

            );


            /* =============================================
               MENSAGEM AO UTILIZADOR
            ============================================= */

            showImageSearchMessage(
                "Fotografia recebida. A pesquisar produtos semelhantes..."
            );


            /* =============================================
               PRÓXIMA ETAPA:
               SISTEMA DE PESQUISA VISUAL
            ============================================= */

            await startVisualSearch(searchData);


        } catch (error) {

            console.error(
                "AV Market — erro na pesquisa por fotografia:",
                error
            );

            alert(
                "Não foi possível processar a fotografia.\n\n" +
                error.message
            );

        } finally {

            imageSearchButton.disabled = false;

            imageSearchButton.innerHTML =
                originalHTML;

            imageSearchInput.value = "";

        }

    });


    /* =====================================================
       EXTENSÃO DO ARQUIVO
    ===================================================== */

    function getFileExtension(file) {

        const name =
            file.name || "";

        const extension =
            name.substring(
                name.lastIndexOf(".")
            );

        if (extension) {
            return extension.toLowerCase();
        }

        switch (file.type) {

            case "image/png":
                return ".png";

            case "image/webp":
                return ".webp";

            case "image/gif":
                return ".gif";

            default:
                return ".jpg";
        }
    }


    /* =====================================================
       MENSAGEM DE PROCESSAMENTO
    ===================================================== */

    function showImageSearchMessage(message) {

        let messageElement =
            document.getElementById(
                "imageSearchMessage"
            );


        if (!messageElement) {

            messageElement =
                document.createElement("div");

            messageElement.id =
                "imageSearchMessage";

            messageElement.style.position =
                "fixed";

            messageElement.style.left =
                "50%";

            messageElement.style.bottom =
                "100px";

            messageElement.style.transform =
                "translateX(-50%)";

            messageElement.style.zIndex =
                "99999";

            messageElement.style.padding =
                "14px 20px";

            messageElement.style.borderRadius =
                "14px";

            messageElement.style.background =
                "#111";

            messageElement.style.color =
                "#fff";

            messageElement.style.fontSize =
                "14px";

            messageElement.style.fontFamily =
                "Poppins, sans-serif";

            messageElement.style.boxShadow =
                "0 10px 30px rgba(0,0,0,.25)";

            document.body.appendChild(
                messageElement
            );
        }


        messageElement.textContent =
            message;


        clearTimeout(
            messageElement._timeout
        );


        messageElement._timeout =
            setTimeout(function () {

                messageElement.remove();

            }, 5000);

    }


    /* =====================================================
       PESQUISA VISUAL
    ===================================================== */

    async function startVisualSearch(searchData) {

        /*
         * A fotografia já está no Supabase Storage.
         *
         * Nesta etapa deixamos os dados preparados para
         * o mecanismo de inteligência visual.
         *
         * A próxima camada poderá utilizar:
         *
         * 1. Supabase Edge Function
         * 2. Modelo de visão
         * 3. Embeddings
         * 4. pgvector
         * 5. Tabela de produtos
         *
         * para comparar a fotografia enviada com as
         * fotografias dos produtos existentes no Market.
         */


        console.log(
            "AV Market — imagem enviada:",
            searchData.imageURL
        );


        /*
         * Evento para outros ficheiros JS.
         */

        document.dispatchEvent(

            new CustomEvent(
                "avMarketVisualSearchReady",
                {
                    detail: searchData
                }
            )

        );

    }


})();
/*======================================================
AV MARKET — PAGAMENTO
DADOS + COMPROVATIVO + WHATSAPP
======================================================*/

"use strict";


/*======================================================
ELEMENTOS
======================================================*/

const paymentProof =
    document.getElementById(
        "paymentProof"
    );

const proofPreview =
    document.getElementById(
        "proofPreview"
    );

const sendProofButton =
    document.getElementById(
        "sendProofButton"
    );


/*======================================================
WHATSAPP
======================================================*/

/*
 * O número não é apresentado
 * em nenhum elemento visual da página.
 *
 * Ele é utilizado apenas pelo JavaScript
 * quando o utilizador confirma o pagamento.
 */

const whatsappParts = [

    "939",
    "66",
    "33",
    "73"

];

function getWhatsAppNumber(){

    return whatsappParts.join("");

}


/*======================================================
COMPROVATIVO
======================================================*/

let selectedProofFile = null;


if(paymentProof){

    paymentProof.addEventListener(
        "change",
        function(){

            const file =
                paymentProof.files?.[0];


            if(!file){

                clearProof();

                return;

            }


            /*------------------------------------------
              VERIFICAR TIPO
            ------------------------------------------*/

            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"

            ];


            if(
                !allowedTypes.includes(
                    file.type
                )
            ){

                showToast(
                    "Selecione uma imagem JPG, PNG ou WEBP."
                );

                paymentProof.value = "";

                clearProof();

                return;

            }


            /*------------------------------------------
              LIMITE DE TAMANHO
            ------------------------------------------*/

            const maxSize =
                10 * 1024 * 1024;


            if(file.size > maxSize){

                showToast(
                    "O comprovativo deve ter no máximo 10 MB."
                );

                paymentProof.value = "";

                clearProof();

                return;

            }


            selectedProofFile =
                file;


            showProofPreview(
                file
            );


            if(sendProofButton){

                sendProofButton.disabled =
                    false;

            }

        }
    );

}


/*======================================================
PRÉ-VISUALIZAÇÃO
======================================================*/

function showProofPreview(
    file
){

    if(!proofPreview){

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event){

            proofPreview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Pré-visualização do comprovativo">

                <div class="proof-preview-info">

                    <span class="proof-preview-name">
                        ${escapeHTML(file.name)}
                    </span>

                    <button
                        type="button"
                        class="proof-remove"
                        id="removeProofButton">

                        Remover

                    </button>

                </div>

            `;


            proofPreview.classList.add(
                "show"
            );


            const removeButton =
                document.getElementById(
                    "removeProofButton"
                );


            if(removeButton){

                removeButton.addEventListener(
                    "click",
                    clearProof
                );

            }

        };


    reader.readAsDataURL(
        file
    );

}


/*======================================================
REMOVER COMPROVATIVO
======================================================*/

function clearProof(){

    selectedProofFile =
        null;


    if(paymentProof){

        paymentProof.value =
            "";

    }


    if(proofPreview){

        proofPreview.innerHTML =
            "";

        proofPreview.classList.remove(
            "show"
        );

    }


    if(sendProofButton){

        sendProofButton.disabled =
            true;

    }

}


/*======================================================
ENVIAR COMPROVATIVO
======================================================*/

if(sendProofButton){

    sendProofButton.addEventListener(
        "click",
        async function(){

            if(!selectedProofFile){

                showToast(
                    "Carregue primeiro o comprovativo."
                );

                return;

            }


            const number =
                getWhatsAppNumber();


            const message =
                "Olá, AV Market.\n\n" +
                "Estou a enviar o comprovativo " +
                "do meu pagamento.\n\n" +
                "Por favor, confirme o recebimento " +
                "e o pagamento."


            /*------------------------------------------
              TENTAR PARTILHAR O FICHEIRO
            ------------------------------------------*/

            try{

                if(
                    navigator.share &&
                    navigator.canShare
                ){

                    const shareData = {

                        title:
                            "Comprovativo de pagamento — AV Market",

                        text:
                            message,

                        files:
                            [
                                selectedProofFile
                            ]

                    };


                    if(
                        navigator.canShare(
                            {
                                files:
                                    [
                                        selectedProofFile
                                    ]
                            }
                        )
                    ){

                        await navigator.share(
                            shareData
                        );

                        return;

                    }

                }

            }

            catch(error){

                /*
                 * O utilizador pode simplesmente
                 * cancelar a janela de partilha.
                 *
                 * Nesse caso não mostramos erro.
                 */

                if(
                    error?.name ===
                    "AbortError"
                ){

                    return;

                }

            }


            /*------------------------------------------
              FALLBACK — WHATSAPP
            ------------------------------------------*/

            const encodedMessage =
                encodeURIComponent(
                    message
                );


            const whatsappURL =
                `https://wa.me/${number}?text=${encodedMessage}`;


            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );


            showToast(
                "WhatsApp aberto. Anexe o comprovativo na conversa."
            );

        }
    );

}


/*======================================================
BOTÕES COPIAR
======================================================*/

document
    .querySelectorAll(
        ".payment-copy-button"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                async function(){

                    const value =
                        button.dataset.copy ||
                        "";


                    if(!value){

                        return;

                    }


                    try{

                        await navigator.clipboard.writeText(
                            value
                        );


                        button.classList.add(
                            "copied"
                        );


                        button.innerHTML = `

                            <i class="fa-solid fa-check"></i>

                            Copiado

                        `;


                        setTimeout(
                            function(){

                                button.classList.remove(
                                    "copied"
                                );


                                button.innerHTML = `

                                    <i class="fa-regular fa-copy"></i>

                                    Copiar

                                `;

                            },
                            1800
                        );

                    }

                    catch(error){

                        console.error(
                            "AV Market: erro ao copiar.",
                            error
                        );


                        showToast(
                            "Não foi possível copiar o dado."
                        );

                    }

                }
            );

        }
    );


/*======================================================
SEGURANÇA HTML
======================================================*/

function escapeHTML(
    value
){

    return String(
        value ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "'",
        "&#039;"
    );

}


/*======================================================
TOAST
======================================================*/

function showToast(
    message
){

    let toast =
        document.getElementById(
            "paymentToast"
        );


    if(!toast){

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "paymentToast";


        toast.className =
            "payment-toast";


        toast.innerHTML = `

            <i class="fa-solid fa-circle-info"></i>

            <span></span>

        `;


        document.body.appendChild(
            toast
        );

    }


    const span =
        toast.querySelector(
            "span"
        );


    if(span){

        span.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            function(){

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/*======================================================
INICIALIZAÇÃO
======================================================*/

console.log(
    "AV Market — página de pagamento carregada."
);

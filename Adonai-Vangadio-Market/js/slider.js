/*======================================================
JS/SLIDER.JS

PRODUTOS
======================================================*/


document.querySelectorAll(".products-row")

.forEach(row=>{


const parent=row.closest(".product-slider");


if(!parent)return;



const next=parent.querySelector(".next");

const prev=parent.querySelector(".prev");



if(next){

next.onclick=()=>{

row.scrollBy({

left:350,

behavior:"smooth"

});

};

}



if(prev){

prev.onclick=()=>{

row.scrollBy({

left:-350,

behavior:"smooth"

});

};

}



});

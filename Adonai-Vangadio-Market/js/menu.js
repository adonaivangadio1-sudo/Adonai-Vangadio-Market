/*======================================================
JS/MENU.JS

MENU SISTEMA
======================================================*/


const menuBtn=document.querySelector(".menu-mobile");

const menu=document.querySelector(".side-menu");

const closeMenu=document.querySelector(".menu-close");


if(menuBtn){

menuBtn.onclick=()=>{

menu.classList.add("active");

};

}


if(closeMenu){

closeMenu.onclick=()=>{

menu.classList.remove("active");

};

}

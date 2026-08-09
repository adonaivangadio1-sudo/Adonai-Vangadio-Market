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

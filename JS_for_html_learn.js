"use strict"

let elem1 = document.querySelector('#a1');
let elem2 = document.querySelector('#a2');

function func() {
    elem1.textContent = elem1.textContent + "!";
}

elem2.addEventListener('click', func);
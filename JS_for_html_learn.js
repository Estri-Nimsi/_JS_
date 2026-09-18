"use strict"

let elem1 = document.querySelector('#elem1');

elem1.addEventListener('focus', func2);

function func2() {
    elem1.value = '';
}
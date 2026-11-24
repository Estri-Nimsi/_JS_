"use strict";

let inp = document.querySelector('input');
let btn1 = document.querySelector('#btn1');
let btn2 = document.querySelector('#btn2');

btn1.addEventListener('click', function() {
	inp.value = +inp.value + 1;
})

btn2.addEventListener('click', function() {
	inp.value > 0 ? inp.value = +inp.value - 1 : inp.value = 0;
})
"use strict";

let a = document.querySelectorAll('a');
let btn = document.querySelector('button');

btn.addEventListener('click', function() {
	for (let i = 0; i < a.length; i++) {
		a[i].textContent +=` (${a[i].href})`;
	}
})
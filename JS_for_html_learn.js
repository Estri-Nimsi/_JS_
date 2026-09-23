"use strict"

let ps =  document.querySelectorAll('p');

for (let elem of ps) {
	elem.addEventListener ('click', function() {
		this.textContent = (+this.textContent) ** 2
	})
}
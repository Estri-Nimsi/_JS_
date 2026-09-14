"use strict";

function addZero(num) {
	if (num >= 0 && num <= 9) {
		return '0' + num;
	} else {
		return num;
	}
}

let date = new Date();

console.log(
	addZero(date.getFullYear()) + '-' + 
	addZero(date.getMonth() + 1) + '-' +
	addZero(date.getDate())
);
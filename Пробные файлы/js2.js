"use strict";

function func(arr) {
	for (let elem of arr) {
		if (typeof elem == 'object') {
			elem = func(elem);
		} else {
			elem = elem + '!';
		}
	}
	
	return arr;
}

console.log(func([1, [2, 7, 8], [3, 4, [5, 6]]]));

let myArr = [1, [2, 7, 8], [3, 4, [5, 6]]];
func(myArr);
console.log(myArr[0]); // Выведет 1 или '1!'?
console.log(myArr[1][0]); // Выведет 2 или '2!'?
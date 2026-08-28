"use strict";

function test( arr, func) {
	for (let i=0; i < arr.length; i++) {
		arr[i] = func(arr[i]);
	}
	return arr;
}

let res = test([1, 2, 3], function(num) {
	return num ** 3;
});

console.log(res);
"use strict";

function test(num) {
	function func(localNum) {
		num = 2;
	}
	
	func(num);
	console.log(num);
}

test(1);
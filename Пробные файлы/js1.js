"use strict";

let arr = [];

function func1(num1) {
	return function func2(num2) {
		return function func3(num3) {
			return function func4(num4) {
				return function func5(num5) {
					arr.push(num1, num2, num3, num4, num5);
				}
			}
		};
	};
}

console.log(func1(2)(3)(4)(5)());
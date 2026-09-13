"use strict";

function func(...nums) {
    return nums.reduce((acc, elem) => acc + elem, 0) / nums.length
}

let result = func(1, 2, 3);
console.log(result);
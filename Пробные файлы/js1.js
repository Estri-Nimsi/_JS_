"use strict";

let date1 = new Date();
let date2 = new Date(date1.getFullYear(), date1.getMonth(), 15);

if (date1 > date2) {
    console.log('Половина месяца уже прошла');
} else {
    console.log('Половина месяца еще не прошла');
}
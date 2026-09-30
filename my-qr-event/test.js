"use strict";
const http = require('http');

console.log("🚀 Симуляция запущена! Каждую секунду летит 5 запросов...");

const userCodes = [];
for (let i = 1001; i <= 1789; i++) userCodes.push(i);

const points = ['ROBOT', 'FISICS', 'CHEMISTRY', 'PSIH', 'FDPIP'];

function sendFakeScan() {
    const randomUser = userCodes[Math.floor(Math.random() * userCodes.length)];
    const randomPoint = points[Math.floor(Math.random() * points.length)];
    
    const postData = JSON.stringify({ userCode: String(randomUser), pointId: randomPoint });
    
    const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/scan',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => { res.on('data', () => {}); });
    
    req.on('error', (e) => console.log(`Ошибка: ${e.message}`));
    req.write(postData);
    req.end();
}

// Генерируем запросы каждые 200 миллисекунд
setInterval(sendFakeScan, 200);

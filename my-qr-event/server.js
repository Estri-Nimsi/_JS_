"use strict";
const http = require('http');
const fs = require('fs');
const path = require('path');

// Проект работает на порту 3001
const PORT = 3001; 
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const LOG_FILE = path.join(__dirname, 'data', 'log.csv');

// Проверяем и создаем папку data, если её нет
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function writeUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
    // Настройка CORS, чтобы любые телефоны могли слать запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Разбираем URL для проверки путей
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // 1. Авторизация (Вход) участников с поддержкой расширения списка
    if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { userCode } = JSON.parse(body);
            if (!userCode) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Нужен код' }));
            }
            
            let users = readUsers();
            
            // Если пользователя нет в базе данных
            if (!users[userCode]) {
                const numericCode = parseInt(userCode);
                
                // ЗАЩИТА: Если номер выше 1500 (пришли доп. гости на месте) — регистрируем на ходу
                if (!isNaN(numericCode) && numericCode > 1500 && numericCode <= 2000) {
                    users[userCode] = {
                        name: `Участник №${userCode} (Доп.)`,
                        score: 0,
                        scannedPoints: []
                    };
                    writeUsers(users);
                    console.log(`➕ На месте зарегистрирован новый участник под номером: ${userCode}`);
                } else {
                    // Если ввели буквы или нереальный номер — выдаем ошибку
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Неверный код. Пожалуйста, введите корректный номер с бейджа!' }));
                }
            }
            
            // Успешный вход
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, user: users[userCode] }));
        });
    } 
    
    // 2. Начисление баллов волонтерами на точках
    else if (pathname === '/api/scan' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { userCode, pointId } = JSON.parse(body);
            let users = readUsers();

            if (!users[userCode]) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Такой номер участника не найден в базе!' }));
            }

            // СПИСОК СЕКРЕТНЫХ КОДОВ И НАЧИСЛЯЕМЫХ БАЛЛОВ
            // Вы можете менять названия и баллы прямо здесь!
            const VALID_POINTS = {
                'ROBOT': { name: 'Мастер-класс по робототехнике', points: 25 },
                'FISICS': { name: 'Занимательная физика', points: 40 },
                'CHEMISTRY': { name: 'Химическая лаборатория', points: 15 },
                'PSIH': {name: 'Психология и ЕГЭ', points: 30},
                'FDPIP': {name: 'Основы психологии дошкольников', points: 20}
            };

            const cleanPointId = (pointId || '').toUpperCase();

            // Проверка 1: Существует ли вообще такая локация?
            if (!VALID_POINTS[cleanPointId]) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Неизвестный код локации на сервере!' }));
            }

            const user = users[userCode];
            const locationInfo = VALID_POINTS[cleanPointId];

            // Проверка 2: Не начисляли ли уже баллы этому участнику на этой точке?
            if (user.scannedPoints.includes(locationInfo.name)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: `Участник №${userCode} уже получал баллы за "${locationInfo.name}"!`, score: user.score }));
            }

            // Начисляем баллы
            user.score += locationInfo.points;
            user.scannedPoints.push(locationInfo.name); 
            writeUsers(users);

            // Запись в лог CSV для надежности
            const logLine = `${new Date().toISOString()},${userCode},${user.name},${locationInfo.name},${locationInfo.points}\n`;
            fs.appendFileSync(LOG_FILE, logLine, 'utf8');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: `Баллы начислены!`, 
                score: user.score 
            }));
        });
    } 
    
    // 3. Таблица лидеров для админки
    else if (pathname === '/api/leaderboard' && req.method === 'GET') {
        const users = readUsers();
        const sorted = Object.keys(users).map(code => ({
            code: code,
            name: users[code].name,
            score: users[code].score
        })).sort((a, b) => b.score - a.score);
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(sorted));
    } 
    
    // 4. Раздача статических HTML файлов из папки public
    else {
        let fileUrl = pathname === '/' ? '/index.html' : pathname;
        let filePath = path.join(__dirname, 'public', fileUrl);
        
        if (!filePath.startsWith(path.join(__dirname, 'public'))) {
            res.writeHead(403);
            return res.end('Запрещено');
        }

        const ext = path.extname(filePath);
        let contentType = 'text/html; charset=utf-8';
        if (ext === '.js') contentType = 'application/javascript';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.json') contentType = 'application/json';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Страница не найдена');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    }
});

// Автоматическая генерация 500 участников при самом первом запуске
const currentUsers = readUsers();
if (Object.keys(currentUsers).length === 0) {
    console.log("⏳ Генерирую базу данных для 500 участников...");
    for (let i = 1001; i <= 1500; i++) {
        currentUsers[i] = {
            name: `Участник №${i}`,
            score: 0,
            scannedPoints: []
        };
    }
    writeUsers(currentUsers);
    console.log("✅ База данных успешно создана!");
}

server.listen(PORT, () => {
    console.log(`🚀 Автономный сервер успешно запущен на порту ${PORT}`);
});

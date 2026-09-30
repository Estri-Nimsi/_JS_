const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const PORT = 3000; // Ваш основной рабочий порт
const HTML_PATH = path.join(__dirname, 'form.html');

// 📂 Пути для сохранения результатов Теста №1
const JSON_FILE_PATH = path.join(__dirname, 'Пробный тест.json'); 
const CSV_FILE_PATH = 'C:\\Users\\li.nizamutdinova\\Yandex.Disk\\Результаты тестирования\\Пробный тест.csv'; 

// 🎯 БАЗА ОТВЕТОВ: Сюда вы можете добавлять любые новые вопросы! 
// Excel-таблица сама создаст нужные столбцы при первой отправке.
const CORRECT_ANSWERS = {
    q1: 'B',                 // 1 правильный ответ
    q2: ['B', 'C', 'D'],          // 2 правильных ответа
    q3: ['A', 'B', 'D']      // 3 правильных ответа
};

function checkQuestionAnswers(userValues, correctValues) {
    const correctArr = Array.isArray(correctValues) ? correctValues : [correctValues];
    const userArr = Array.isArray(userValues) ? userValues : (userValues ? [userValues] : []);
    let correctCount = 0; let incorrectCount = 0;
    userArr.forEach(val => { if (correctArr.includes(val)) { correctCount++; } else { incorrectCount++; } });
    return { correctCount, incorrectCount };
}

function getMaxPossibleScore() {
    let maxScore = 0;
    for (let qKey in CORRECT_ANSWERS) {
        maxScore += Array.isArray(CORRECT_ANSWERS[qKey]) ? CORRECT_ANSWERS[qKey].length : 1;
    }
    return maxScore;
}

const server = http.createServer((req, res) => {
    // Чистим адрес от случайных двойных слэшей
    const cleanUrl = req.url.replace(/\/+/g, '/');

    if (req.method === 'GET' && (cleanUrl === '/' || cleanUrl === '')) {
        if (fs.existsSync(HTML_PATH)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(HTML_PATH, 'utf-8'));
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`Ошибка: файл form.html не найден!\nИскал тут: ${HTML_PATH}`);
        }
    } 
    else if (req.method === 'POST' && cleanUrl === '/submit-test') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());

        req.on('end', () => {
            const formData = querystring.parse(body);
            const name = formData.operator_name;

            let totalCorrect = 0;
            let totalIncorrect = 0;
            const maxScore = getMaxPossibleScore();
            const operatorAnswersLog = {};

            // 🔄 Автоматический перебор и сбор ответов под любые вопросы
            for (let qKey in CORRECT_ANSWERS) {
                const formKey = `${qKey}[]`;
                const userAns = formData[formKey];
                const correctAns = CORRECT_ANSWERS[qKey];

                const stats = checkQuestionAnswers(userAns, correctAns);
                totalCorrect += stats.correctCount;
                totalIncorrect += stats.incorrectCount;

                // Склеиваем ответы через запятую, чтобы они красиво легли в ячейку Excel
                operatorAnswersLog[qKey] = Array.isArray(userAns) ? userAns.join(', ') : (userAns || 'Нет ответа');
            }

            const dateStr = new Date().toLocaleString();

            // =========================================================================
            // ВАРИАНТ 1: ЗАПИСЬ В EXCEL (CSV) С АВТОМАТИЧЕСКИМИ СТОЛБЦАМИ НА ЯНДЕКС ДИСК
            // =========================================================================
            try {
                if (!fs.existsSync(CSV_FILE_PATH)) {
                    // Формируем динамическую шапку таблицы
                    let headers = '\ufeffДата и время;ФИО оператора;Правильных ответов;Неправильных ответов;Максимум баллов';
                    for (let qKey in CORRECT_ANSWERS) {
                        headers += `;Ответ на ${qKey}`;
                    }
                    headers += '\n';
                    fs.writeFileSync(CSV_FILE_PATH, headers, 'utf-8');
                }

                // Собираем строчку данных
                let csvRow = `${dateStr};${name};${totalCorrect};${totalIncorrect};${maxScore}`;
                for (let qKey in CORRECT_ANSWERS) {
                    csvRow += `;${operatorAnswersLog[qKey]}`;
                }
                csvRow += '\n';

                fs.appendFileSync(CSV_FILE_PATH, csvRow, 'utf-8');
                console.log(`[Excel] Данные успешно сохранены на Яндекс Диск.`);
            } catch (error) {
                console.error('Ошибка записи в CSV:', error.message);
            }

            // =========================================================================
            // ВАРИАНТ 2: ЗАПИСЬ В ПОДРОБНЫЙ JSON (В ПАПКУ ПРОЕКТА)
            // =========================================================================
            try {
                let resultsList = [];
                if (fs.existsSync(JSON_FILE_PATH)) {
                    resultsList = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
                }
                resultsList.push({
                    name: name,
                    correct: totalCorrect,
                    incorrect: totalIncorrect,
                    max_possible: maxScore,
                    answers: operatorAnswersLog,
                    date: dateStr
                });
                fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(resultsList, null, 2), 'utf-8');
                console.log(`[JSON] Подробный лог ответов обновлен.`);
            } catch (error) {
                console.error('Ошибка записи в JSON:', error.message);
            }

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; line-height: 1.8;">
                    <h2>Тест успешно отправлен!</h2>
                    <p>Спасибо, <b>${name}</b>.</p>
                    <div style="display: inline-block; text-align: left; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                        <p style="margin: 5px 0;">✅ Правильных ответов: <b style="color: #4CAF50;">${totalCorrect} из ${maxScore}</b></p>
                        <p style="margin: 5px 0;">❌ Неправильных/лишних ответов: <b style="color: #f44336;">${totalIncorrect}</b></p>
                    </div>
                </div>
            `);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h2>Страница не найдена</h2>');
    }
});

server.listen(PORT, () => console.log(`Автоматический сервер запущен на порту ${PORT}`));

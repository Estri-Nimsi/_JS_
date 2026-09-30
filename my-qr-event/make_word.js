"use strict";
const fs = require('fs');

console.log("⏳ Начинаю пакетную генерацию альбомных карточек БЕЗ ПУСТЫХ ЛИСТОВ...");

const totalStart = 1001;
const totalEnd = 2000;
const chunkSize = 200; 

const styleHeader = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://w3.org">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
    @page { 
        size: 29.7cm 21.0cm; 
        margin: 0.2cm 1cm 0.2cm 1cm; /* Уменьшили нижний маргин, чтобы таблица не выталкивала строки */
        mso-page-orientation: landscape; 
    }
    @page Section1 {
        size: 29.7cm 21.0cm;
        margin: 0.2cm 1cm 0.2cm 1cm;
        mso-header-margin: 0.5cm;
        mso-footer-margin: 0.5cm;
        mso-page-orientation: landscape;
    }
    div.Section1 { page: Section1; }
    
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
    
    /* УБРАЛИ page-break-after: always отсюда, чтобы не плодить пустые листы */
    table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: -10px; margin-bottom: 0; }
    
    td { width: 50%; height: 19.5cm; border: 2px solid #000000; padding: 20px 30px; text-align: center; vertical-align: top; box-sizing: border-box; }
    .title { font-size: 26pt; font-weight: bold; margin-top: 0.8cm; letter-spacing: 1px; }
    .number { font-size: 72pt; font-weight: bold; margin: 1cm 0; }
    .qr-text { font-size: 11pt; font-weight: bold; color: #555555; margin-bottom: 8px; }
    .qr-box { width: 5.5cm; height: 5.5cm; border: 2px dashed #888888; margin: 0 auto; }
    
    .inst-title { font-size: 22pt; font-weight: bold; margin-bottom: 5px; margin-top: 0.5cm; }
    .inst-sub { font-size: 12pt; font-style: italic; margin-bottom: 25px; color: #555555; }
    .step { text-align: left; margin-bottom: 18px; padding-left: 10px; }
    .step-head { font-size: 14pt; font-weight: bold; margin-bottom: 4px; }
    .step-text { font-size: 12pt; line-height: 1.4; color: #333333; }
    
    /* Специальный стиль для чистого разрыва страниц в Word */
    .page-break { page-break-before: always; }
</style>
</head>
<body>
<div class="Section1">
`;

for (let chunkStart = totalStart; chunkStart <= totalEnd; chunkStart += chunkSize) {
    let chunkEnd = chunkStart + chunkSize - 1;
    if (chunkEnd > totalEnd) chunkEnd = totalEnd;

    let htmlContent = styleHeader;
    let isFirstTable = true;

    for (let i = chunkStart; i <= chunkEnd; i += 2) {
        let codeLeft = i;
        let codeRight = i + 1;

        // Если это не самая первая таблица в файле, принудительно делаем красивый разрыв страницы перед ней
        let breakClass = isFirstTable ? "" : "class='page-break'";
        isFirstTable = false;

        // 1. ЛИЦЕВАЯ СТОРОНА
        htmlContent += `
        <table ${breakClass}>
            <tr>
                <td>
                    <div class="title">УЧАСТНИК</div>
                    <div class="number">№ ${codeLeft}</div>
                    <div class="qr-text">МЕСТО ДЛЯ ГЛАВНОГО QR-КОДА</div>
                    <div class="qr-box"></div>
                </td>
                <td>
                    <div class="title">УЧАСТНИК</div>
                    <div class="number">№ ${codeRight}</div>
                    <div class="qr-text">МЕСТО ДЛЯ ГЛАВНОГО QR-КОДА</div>
                    <div class="qr-box"></div>
                </td>
            </tr>
        </table>
        `;

        // 2. ОБОРОТНАЯ СТОРОНА (Зеркальная) — перед ней разрыв обязателен всегда
        htmlContent += `
        <table class="page-break">
            <tr>
                <td>
                    <div class="inst-title">ИНСТРУКЦИЯ КВЕСТА</div>
                    <div class="inst-sub">Для карточки участника № ${codeRight}</div>
                    <div class="step"><div class="step-head">Шаг 1. Вход в кабинет</div><div class="step-text">Отсканируйте главный QR-код на лицевой стороне карточки своим телефоном.</div></div>
                    <div class="step"><div class="step-head">Шаг 2. Авторизация</div><div class="step-text">В открывшемся личном кабинете введите ваш номер: <b>${codeRight}</b>.</div></div>
                    <div class="step"><div class="step-head">⚠️ Важное уточнение!</div><div class="step-text">Если браузер покажет техническое предупреждение, нажмите кнопку "Continue" (Продолжить). Это полностью безопасно.</div></div>
                    <div class="step"><div class="step-head">Шаг 3. Прохождение квеста</div><div class="step-text">Подходите к стендам мероприятий, сканируйте локальные QR-коды и вводите свой номер для получения баллов.</div></div>
                </td>
                <td>
                    <div class="inst-title">ИНСТРУКЦИЯ КВЕСТА</div>
                    <div class="inst-sub">Для карточки участника № ${codeLeft}</div>
                    <div class="step"><div class="step-head">Шаг 1. Вход в кабинет</div><div class="step-text">Отсканируйте главный QR-код на лицевой стороне карточки своим телефоном.</div></div>
                    <div class="step"><div class="step-head">Шаг 2. Авторизация</div><div class="step-text">В открывшемся личном кабинете введите ваш номер: <b>${codeLeft}</b>.</div></div>
                    <div class="step"><div class="step-head">⚠️ Важное уточнение!</div><div class="step-text">Если браузер покажет техническое предупреждение, нажмите кнопку "Continue" (Продолжить). Это полностью безопасно.</div></div>
                    <div class="step"><div class="step-head">Шаг 3. Прохождение квеста</div><div class="step-text">Подходите к стендам мероприятий, сканируйте локальные QR-коды и вводите свой номер для получения баллов.</div></div>
                </td>
            </tr>
        </table>
        `;
    }

    htmlContent += `</div></body></html>`;

    const fileName = `quest_cards_${chunkStart}_to_${chunkEnd}.doc`;
    fs.writeFileSync(fileName, htmlContent, 'utf8');
    console.log(`✅ Исправлен и создан файл: ${fileName}`);
}

console.log("🎉 Все 5 частей перегенерированы! Пустые листы успешно удалены.");

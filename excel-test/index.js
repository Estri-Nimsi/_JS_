// Подключаем библиотеку для работы с Excel
const ExcelJS = require('exceljs');

async function readExcelFile() {
    // Создаем объект рабочей книги
    const workbook = new ExcelJS.Workbook();
    
    // Снаружи открываем файл, лежащий на диске
    await workbook.xlsx.readFile('data.xlsx');
    
    // Выбираем нужный лист по названию
    const worksheet = workbook.getWorksheet('Лист1');
    
    // Получаем значение из ячейки A1
    const cellValue = worksheet.getCell('B5').value;
    
    // Выводим результат в консоль разработчика
    console.log(`Значение в ячейке B5: ${cellValue}`);
}

// Запускаем нашу функцию
readExcelFile();

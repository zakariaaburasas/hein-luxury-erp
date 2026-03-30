const xlsx = require('xlsx');
const workbook = xlsx.readFile('tracker.xlsx');
console.log('Sheets found:', workbook.SheetNames);
for (let name of workbook.SheetNames) {
    console.log(`\n--- ${name} ---`);
    console.log(xlsx.utils.sheet_to_csv(workbook.Sheets[name]).split('\n').slice(0, 5).join('\n'));
}

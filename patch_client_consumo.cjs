const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 gap-4 mt-2">\s*<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Consumo \(Km\/L\)<\/label>\s*<input name="kmL"[\s\S]*?<\/div>\s*<\/div>/g;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/components/Client.tsx', code);
    console.log("Successfully removed Consumo and Preço.");
} else {
    console.log("Regex didn't match.");
}

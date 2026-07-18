const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const regex = /<div className="flex justify-between items-center text-sm">\s*<span className="text-slate-600 font-semibold">Combustível<\/span>[\s\S]*?<\/div>/;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/components/Client.tsx', code);
    console.log("Successfully removed Combustível from client summary.");
} else {
    console.log("Regex didn't match.");
}

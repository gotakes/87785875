const fs = require('fs');
const filepath = 'src/components/PrintOsModal.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `<div className="grid grid-cols-1 text-xs print:text-[10px] leading-tight">
              <div className="p-2 print:p-1"><span className="text-gray-600 block">Transportador Responsável:</span><span className="font-bold text-sm">EL NATHAN TRANSPORTES E SERVIÇOS CNPJ 67.885.483/0001-20</span></div>
            </div>`;

const newStr = `<div className="grid grid-cols-2 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
              <div className="p-2 print:p-1"><span className="text-gray-600 block">Transportador Responsável:</span><span className="font-bold text-sm">EL NATHAN TRANSPORTES E SERVIÇOS</span></div>
              <div className="p-2 print:p-1"><span className="text-gray-600 block">CNPJ:</span><span className="font-bold text-sm">67.885.483/0001-20</span></div>
            </div>`;

if (content.includes(targetStr)) {
    fs.writeFileSync(filepath, content.replace(targetStr, newStr));
    console.log('Success');
} else {
    console.log('Target string not found');
}

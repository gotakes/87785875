const fs = require('fs');
let file = 'src/components/PrintOsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace item 3
const target3 = `<div className="mb-3 md:mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">3. QUILOMETRAGEM E OBSERVAÇÕES</div>
          <div className="grid grid-cols-2 divide-x divide-blue-900 border-b border-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">KM Previsto (ida e volta):</span><span className="font-bold">{printOs.distanceKm} km</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">KM Final (Realizado):</span><span className="font-bold">-</span></div>
          </div>
          <div className="p-2 text-xs print:text-[10px] leading-tight">
            <span className="text-gray-600 block">Observações:</span>
            <span className="font-bold">{printOs.observations || 'Nenhuma observação.'}</span>
          </div>
        </div>`;

const replace3 = `{userRole !== 'CLIENT' && (
        <div className="mb-3 md:mb-4 print:mb-1 border border-blue-900">
          <div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">3. QUILOMETRAGEM E OBSERVAÇÕES</div>
          <div className="grid grid-cols-2 divide-x divide-blue-900 border-b border-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">KM Previsto (ida e volta):</span><span className="font-bold">{printOs.distanceKm} km</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">KM Final (Realizado):</span><span className="font-bold">-</span></div>
          </div>
          <div className="p-2 text-xs print:text-[10px] leading-tight">
            <span className="text-gray-600 block">Observações:</span>
            <span className="font-bold">{printOs.observations || 'Nenhuma observação.'}</span>
          </div>
        </div>
        )}`;

content = content.replace(target3, replace3);

content = content.replace(/4\. VALORES/g, "{userRole === 'CLIENT' ? '3.' : '4.'} VALORES");
content = content.replace(/5\. CLIENTE CONTRATOU O SERVIÇO/g, "{userRole === 'CLIENT' ? '4.' : '5.'} CLIENTE CONTRATOU O SERVIÇO");
content = content.replace(/6\. INFORMAÇÕES COMPLEMENTARES/g, "{userRole === 'CLIENT' ? '5.' : '6.'} INFORMAÇÕES COMPLEMENTARES");
content = content.replace(/7\. ASSINATURAS/g, "{userRole === 'CLIENT' ? '6.' : '7.'} ASSINATURAS");

fs.writeFileSync(file, content);
console.log("Patched PrintOsModal.tsx");

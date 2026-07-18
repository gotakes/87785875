const fs = require('fs');

let code = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

// 2. ROTA E CARGA
const rotaECargaNew = `<div className="bg-black text-white font-bold px-2 py-1 text-xs">2. ROTA E CARGA</div>
          <div className="grid grid-cols-2 divide-x divide-black text-xs">
            <div className="p-2"><span className="text-gray-600 block">Origem (Coleta):</span><span className="font-bold">{printOs.origin}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Destino (Entrega):</span><span className="font-bold">{printOs.destinations?.join('; ') || 'N/A'}</span></div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black border-t border-black text-xs">
            <div className="p-2"><span className="text-gray-600 block">Natureza da Carga:</span><span className="font-bold">{printOs.cargoType || 'Diversos'}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Peso Estimado (Kg):</span><span className="font-bold">{printOs.estimatedWeight || '-'}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Volumetria (M³):</span><span className="font-bold">{printOs.cargoVolume || '-'}</span></div>
          </div>`;

code = code.replace(
  /<div className="bg-black text-white font-bold px-2 py-1 text-xs">2\. ROTA E CARGA<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<div className="mb-4 border border-black">/g,
  rotaECargaNew + '\n        </div>\n        <div className="mb-4 border border-black">'
);

// 4. VALORES
const valuesOldRegex = /<div className="bg-black text-white font-bold px-2 py-1 text-xs">4\. VALORES<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<div className="mb-4 border border-black">\s*<div className="bg-black text-white font-bold px-2 py-1 text-xs">5\. CLIENTE/;

const valuesNew = `<div className="bg-black text-white font-bold px-2 py-1 text-xs">4. VALORES</div>
          <div className="grid grid-cols-3 divide-x divide-black border-b border-black text-xs text-center">
            <div className="p-2"><span className="text-gray-600 block">Valor do Frete Bruto:</span><span className="font-bold">R$ {printOs.grossValue?.toFixed(2).replace('.',',')}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Pedágio:</span><span className="font-bold">{printOs.axles || 1} Eixo(s) x R$ {(printOs.tollPerAxle || 0).toFixed(2).replace('.',',')} = R$ {printOs.tollCost?.toFixed(2).replace('.',',')}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Outras Despesas:</span><span className="font-bold">R$ {(printOs.otherExpenses || 0).toFixed(2).replace('.',',')}</span></div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-black text-xs text-center">
            <div className="p-2"><span className="text-gray-600 block">Combustível (Estimado):</span><span className="font-bold text-red-600">- R$ {(printOs.fuelCost || 0).toFixed(2).replace('.',',')}</span></div>
            <div className="p-2 bg-emerald-50"><span className="text-gray-600 block">LÍQUIDO DO MOTORISTA:</span><span className="font-bold text-lg text-emerald-700">R$ {(printOs.netValue || 0).toFixed(2).replace('.',',')}</span></div>
          </div>
        </div>
        <div className="mb-4 border border-black">
          <div className="bg-black text-white font-bold px-2 py-1 text-xs">5. CLIENTE CONTRATOU O SERVIÇO`;

code = code.replace(valuesOldRegex, valuesNew);

// 5. CLIENTE
const clientOldRegex = /<div className="bg-black text-white font-bold px-2 py-1 text-xs">5\. CLIENTE CONTRATOU O SERVIÇO<\/div>\s*<div className="grid grid-cols-2 divide-x divide-black text-xs">\s*<div className="p-2"><span className="text-gray-600 block">Nome \/ Razão Social:<\/span><span className="font-bold">Senso Solution<\/span><\/div>\s*<div className="p-2"><span className="text-gray-600 block">CNPJ:<\/span><span className="font-bold">29\.290\.243\/0001-93<\/span><\/div>/;

const clientNew = `<div className="bg-black text-white font-bold px-2 py-1 text-xs">5. CLIENTE CONTRATOU O SERVIÇO</div>
          <div className="grid grid-cols-2 divide-x divide-black text-xs">
            <div className="p-2"><span className="text-gray-600 block">Nome / Razão Social:</span><span className="font-bold">{printOs.clientName || 'N/A'}</span></div>
            <div className="p-2"><span className="text-gray-600 block">CNPJ / CPF:</span><span className="font-bold">-</span></div>`;

code = code.replace(clientOldRegex, clientNew);


fs.writeFileSync('src/components/PrintOsModal.tsx', code);

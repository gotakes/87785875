const fs = require('fs');

let code = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

const oldValores = /<div className="grid grid-cols-4 divide-x divide-black border-b border-black text-xs text-center">[\s\S]*?<div className="mb-4 border border-black">\s*<div className="bg-black text-white font-bold px-2 py-1 text-xs">5\. CLIENTE CONTRATOU O SERVIÇO<\/div>/;

const newValores = `<div className="grid grid-cols-4 divide-x divide-black border-b border-black text-xs text-center">
            <div className="p-2"><span className="text-gray-600 block">Valor do Frete Bruto:</span><span className="font-bold">R$ {printOs.grossValue?.toFixed(2).replace('.',',')}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Pedágio:</span><span className="font-bold">{printOs.axles || 1} Eixo(s) x R$ {(printOs.tollPerAxle || 0).toFixed(2).replace('.',',')} = R$ {printOs.tollCost?.toFixed(2).replace('.',',')}</span></div>
            <div className="p-2"><span className="text-gray-600 block">Outras Despesas:</span><span className="font-bold">R$ {(printOs.otherExpenses || 0).toFixed(2).replace('.',',')}</span></div>
            <div className={\`p-2 \${userRole !== 'DRIVER' ? 'bg-gray-100' : ''}\`}>
               {userRole !== 'DRIVER' && (
                 <>
                   <span className="text-gray-600 block">FRETE TOTAL DA OS:</span>
                   <span className="font-bold text-lg">
                     \`R$ \${((printOs.grossValue || 0) + (printOs.tollCost || 0) + (printOs.otherExpenses || 0)).toFixed(2).replace('.',',')}\`
                   </span>
                 </>
               )}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black text-xs text-center">
            <div className="p-2"><span className="text-gray-600 block">Combustível (Estimado):</span><span className="font-bold text-red-600">- R$ {(printOs.fuelCost || 0).toFixed(2).replace('.',',')}</span></div>
            <div className="p-2">
              {userRole === 'ADMIN' && (
                <>
                  <span className="text-gray-600 block">Comissão Transportadora:</span>
                  <span className="font-bold text-rose-700">- R$ {(printOs.carrierCommission || 0).toFixed(2).replace('.',',')}</span>
                </>
              )}
            </div>
            <div className={\`p-2 \${userRole !== 'CLIENT' ? 'bg-emerald-50' : ''}\`}>
              {userRole !== 'CLIENT' && (
                <>
                  <span className="text-gray-600 block">LÍQUIDO DO MOTORISTA:</span>
                  <span className="font-bold text-lg text-emerald-700">R$ {(printOs.netValue || 0).toFixed(2).replace('.',',')}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mb-4 border border-black">
          <div className="bg-black text-white font-bold px-2 py-1 text-xs">5. CLIENTE CONTRATOU O SERVIÇO</div>`;

code = code.replace(oldValores, newValores);

fs.writeFileSync('src/components/PrintOsModal.tsx', code);

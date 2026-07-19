const fs = require('fs');
const filepath = 'src/components/PrintOsModal.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `<div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">1. INFORMAÇÕES DO MOTORISTA / VEÍCULO</div>
          <div className="grid grid-cols-3 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Motorista:</span><span className="font-bold">{printOs.driverName || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">CPF:</span><span className="font-bold">{printOs.driverCpf || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Celular:</span><span className="font-bold">{printOs.driverPhone || 'N/A'}</span></div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-blue-900 border-t border-blue-900 text-xs print:text-[10px] leading-tight">
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Placa do Veículo:</span><span className="font-bold">{printOs.driverPlate || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Tipo:</span><span className="font-bold">{printOs.vehicleType || 'N/A'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Capacidade / Tara:</span><span className="font-bold">{printOs.capacityWeight || '-'}</span></div>
            <div className="p-2 print:p-1"><span className="text-gray-600 block">Carroceria:</span><span className="font-bold">{printOs.bodyType || '-'}</span></div>
          </div>`;

const newStr = `<div className="bg-blue-900 text-white font-bold px-2 py-1 text-xs print:text-[10px] leading-tight">1. INFORMAÇÕES DO {userRole === 'CLIENT' ? 'TRANSPORTADOR' : 'MOTORISTA / VEÍCULO'}</div>
          {userRole === 'CLIENT' ? (
            <div className="grid grid-cols-1 text-xs print:text-[10px] leading-tight">
              <div className="p-2 print:p-1"><span className="text-gray-600 block">Transportador Responsável:</span><span className="font-bold text-sm">EL NATHAN TRANSPORTES E SERVIÇOS CNPJ 67.885.483/0001-20</span></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 divide-x divide-blue-900 text-xs print:text-[10px] leading-tight">
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Motorista:</span><span className="font-bold">{printOs.driverName || 'N/A'}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">CPF:</span><span className="font-bold">{printOs.driverCpf || 'N/A'}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Celular:</span><span className="font-bold">{printOs.driverPhone || 'N/A'}</span></div>
              </div>
              <div className="grid grid-cols-4 divide-x divide-blue-900 border-t border-blue-900 text-xs print:text-[10px] leading-tight">
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Placa do Veículo:</span><span className="font-bold">{printOs.driverPlate || 'N/A'}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Tipo:</span><span className="font-bold">{printOs.vehicleType || 'N/A'}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Capacidade / Tara:</span><span className="font-bold">{printOs.capacityWeight || '-'}</span></div>
                <div className="p-2 print:p-1"><span className="text-gray-600 block">Carroceria:</span><span className="font-bold">{printOs.bodyType || '-'}</span></div>
              </div>
            </>
          )}`;

if (content.includes(targetStr)) {
    fs.writeFileSync(filepath, content.replace(targetStr, newStr));
    console.log('Success');
} else {
    console.log('Target string not found');
}

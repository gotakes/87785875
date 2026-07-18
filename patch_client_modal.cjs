const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

code = code.replace(
  /return \(\s*<div className="flex h-screen bg-slate-50 font-sans">/g,
  `return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {printOs && (
        <PrintOsModal 
          printOs={printOs} 
          onClose={() => setPrintOs(null)} 
          onWhatsApp={() => {
            const text = \`*Ordem de Serviço Nº \${printOs.number}*\\n*Motorista:* \${printOs.driverName || 'N/A'}\\n*Veículo:* \${printOs.vehicleType} (\${printOs.driverPlate || ''})\\n*Origem:* \${printOs.origin}\\n*Destino:* \${printOs.destinations?.join('; ') || 'N/A'}\\n*Distância Prevista:* \${printOs.distanceKm} km\\n*Frete:* \${new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(printOs.totalValue || 0)}\`;
            window.open(\`https://wa.me/?text=\${encodeURIComponent(text)}\`, '_blank');
          }}
        />
      )}`
);

fs.writeFileSync('src/components/Client.tsx', code);

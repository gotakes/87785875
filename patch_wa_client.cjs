const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `const text = \`*Ordem de Serviço Nº \${printOs.number}*\\n*Motorista:* \${printOs.driverName || 'N/A'}\\n*Veículo:* \${printOs.vehicleType} (\${printOs.driverPlate || ''})\\n*Origem:* \${printOs.origin}\\n*Destino:* \${printOs.destinations?.join('; ') || 'N/A'}\\n*Distância Prevista:* \${printOs.distanceKm} km\\n*Frete:* \${new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(printOs.totalValue || 0)}\`;`;

const newStr = `const text = \`*Ordem de Serviço Nº \${printOs.number}*\\n*Transportador:* EL NATHAN TRANSPORTES E SERVIÇOS\\n*Origem:* \${printOs.origin}\\n*Destino:* \${printOs.destinations?.join('; ') || 'N/A'}\\n*Distância Prevista:* \${printOs.distanceKm} km\\n*Frete:* \${new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(printOs.totalValue || 0)}\`;`;

if (content.includes(targetStr)) {
    fs.writeFileSync(filepath, content.replace(targetStr, newStr));
    console.log('Success');
} else {
    console.log('Target string not found');
}

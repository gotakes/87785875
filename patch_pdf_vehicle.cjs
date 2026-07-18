const fs = require('fs');
let code = fs.readFileSync('src/components/PrintStatementModal.tsx', 'utf8');

code = code.replace(/\{isClientSide && <td className="py-3 px-2">\{os\.vehicleType\} \(\{os\.driverPlate \|\| '-'\}\)<\/td>\}/g, 
  "{isClientSide && <td className=\"py-3 px-2\">{os.vehicleType || 'Não informado'} ({os.driverPlate || '-'})</td>}");

fs.writeFileSync('src/components/PrintStatementModal.tsx', code);

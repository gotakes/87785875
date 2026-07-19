const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const additionalFields = `
  clientPaymentStatus?: 'Pago' | 'Pendente' | 'Parcial';
  clientPaymentType?: 'À Vista' | 'A Prazo';
  clientPaymentMethod?: 'Pix' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto';
  clientDueDate?: string;
  clientPaidDate?: string;
  
  driverPaymentStatus?: 'Pago' | 'Pendente' | 'Parcial';
  driverDueDate?: string;
  driverPaidDate?: string;
`;

if (!content.includes('clientPaymentStatus')) {
  content = content.replace(
    "financialPaidDate?: string;",
    "financialPaidDate?: string;" + additionalFields
  );
  fs.writeFileSync('src/types.ts', content);
  console.log("Patched types.ts for dual finance");
} else {
  console.log("Already patched");
}

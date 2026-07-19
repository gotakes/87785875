const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const insertFields = `  financialPaymentStatus?: 'Pago' | 'Pendente' | 'Parcial';
  financialPaymentType?: 'À Vista' | 'A Prazo';
  financialPaymentMethod?: 'Pix' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto';
  financialDueDate?: string;
  financialPaidDate?: string;`;

if (!content.includes('financialPaymentStatus')) {
  content = content.replace(
    "paymentStatusClient?: 'PENDING' | 'PAID';",
    "paymentStatusClient?: 'PENDING' | 'PAID';\n" + insertFields
  );
  fs.writeFileSync('src/types.ts', content);
  console.log("Patched types.ts");
} else {
  console.log("Already patched");
}

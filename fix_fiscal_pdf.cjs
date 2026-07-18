const fs = require('fs');

const filePath = 'src/components/PrintFiscalModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `  const handleDownloadPdf = (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      generateAndDownloadPDF('print-statement-content', \`Extrato_\${driver.name.replace(/\\s+/g, '_')}.pdf\`);
    }
  };`,
  `  const handleDownloadPdf = () => {
    generateAndDownloadPDF('print-fiscal-content', \`Comprovante_Rendimentos_\${year}.pdf\`);
  };`
);

fs.writeFileSync(filePath, content);

const fs = require('fs');

const files = [
  'src/components/PrintOsModal.tsx',
  'src/components/PrintStatementModal.tsx',
  'src/components/PrintFiscalModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match the handleDownloadPdf function body block and replace it
  // This is a bit tricky, let's just do a string replacement
  const toReplace = `  const handleDownloadPdf = async (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      const element = document.getElementById('print-os-content');
      if (element) {
        toast.info("Gerando PDF, aguarde...");
        try {
          // @ts-ignore
          const html2pdf = (await import('html2pdf.js')).default;
          const opt = {
            margin:       0.3,
            filename:     \`OS_\${printOs.number}.pdf\`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
          };
          await html2pdf().set(opt).from(element).save();
          toast.success("PDF gerado com sucesso!");
        } catch (error) {
          console.error(error);
          toast.error("Erro ao gerar PDF. Tentando impressão nativa...");
          window.print();
        }
      } else {
        window.print();
      }
    }
  };`;
  
  // We'll just use a more generic regex to replace the function
  content = content.replace(/const handleDownloadPdf = async[\s\S]*?return \(/, `const handleDownloadPdf = (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      window.print();
    }
  };

  return (`);
  
  // For PrintFiscalModal, the signature is different
  content = content.replace(/const handleDownloadPdf = async \(\) => {[\s\S]*?return \(/, `const handleDownloadPdf = () => {
    window.print();
  };

  return (`);
  
  fs.writeFileSync(file, content);
});

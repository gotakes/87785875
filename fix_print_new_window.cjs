const fs = require('fs');

const printWindowFunc = `  const openInNewWindowAndPrint = (elementId: string, title: string) => {
    const content = document.getElementById(elementId);
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Por favor, permita pop-ups neste site para abrir a impressão.");
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\\n');

    printWindow.document.write(\`
      <!DOCTYPE html>
      <html>
        <head>
          <title>\${title}</title>
          \${styles}
          <style>
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print\\\\:hidden { display: none !important; }
            }
            body { font-family: sans-serif; background: white; margin: 0; padding: 20px; }
            .print\\\\:hidden { display: none !important; }
            #\${elementId} { display: block !important; }
          </style>
        </head>
        <body>
          \${content.outerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    \`);
    printWindow.document.close();
  };`;

const fixFile = (filePath, elementIds) => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/const generateAndDownloadPDF = async \([\s\S]*?\} catch \(error\) \{[\s\S]*?window\.print\(\);\n    \}\n  \};/, printWindowFunc);

  if (filePath.includes('PrintOsModal')) {
    content = content.replace(/generateAndDownloadPDF\('print-os-content', \`OS_\$\{printOs\.number\}\.pdf\`\);/, `openInNewWindowAndPrint('print-os-content', \`OS_\$\{printOs.number\}\`);`);
    content = content.replace(/generateAndDownloadPDF\('print-photo-content', \`Anexo_\$\{selectedPhoto\.title\.replace\(\/\\\\s\+\/g, '_'\)\}\.pdf\`\);/, `openInNewWindowAndPrint('print-photo-content', \`Anexo_\$\{selectedPhoto.title\}\`);`);
  } else if (filePath.includes('PrintStatementModal')) {
    content = content.replace(/generateAndDownloadPDF\('print-statement-content', \`Extrato_\$\{driver\.name\.replace\(\/\\\\s\+\/g, '_'\)\}\.pdf\`\);/, `openInNewWindowAndPrint('print-statement-content', \`Extrato_\$\{driver.name\}\`);`);
  } else if (filePath.includes('PrintFiscalModal')) {
    content = content.replace(/generateAndDownloadPDF\('print-fiscal-content', \`Comprovante_Rendimentos_\$\{year\}\.pdf\`\);/, `openInNewWindowAndPrint('print-fiscal-content', \`Comprovante_Rendimentos_\$\{year\}\`);`);
  }
  
  fs.writeFileSync(filePath, content);
};

fixFile('src/components/PrintOsModal.tsx');
fixFile('src/components/PrintStatementModal.tsx');
fixFile('src/components/PrintFiscalModal.tsx');

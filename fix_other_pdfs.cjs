const fs = require('fs');

const fixPdf = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('html2canvas')) {
    content = content.replace(
      /import { (.*?) } from 'lucide-react';/,
      `import { $1 } from 'lucide-react';\nimport html2canvas from 'html2canvas';\nimport jsPDF from 'jspdf';`
    );
  }
  
  const genPdfCode = `  const generateAndDownloadPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }
    
    toast.info("Gerando PDF, por favor aguarde...");
    
    try {
      const originalStyle = element.getAttribute('style');
      element.style.width = '210mm';
      element.style.maxWidth = '210mm';
      element.style.margin = '0';
      element.style.padding = '10mm';
      element.style.backgroundColor = 'white';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
      
      toast.success("PDF salvo com sucesso!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Erro ao gerar PDF. Usando impressão nativa...");
      window.print();
    }
  };`;

  if (content.includes('const handleDownloadPdf = (openWhatsApp = false) => {') || content.includes('const handleDownloadPdf = async (openWhatsApp = false) => {')) {
    content = content.replace(
      /const handleDownloadPdf = \(openWhatsApp = false\) => \{[\s\S]*?\};/,
      `${genPdfCode}\n\n  const handleDownloadPdf = (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      generateAndDownloadPDF('print-statement-content', \`Extrato_\${driver.name.replace(/\\s+/g, '_')}.pdf\`);
    }
  };`
    );
  } else if (content.includes('const handleDownloadPdf = () => {')) {
    content = content.replace(
      /const handleDownloadPdf = \(\) => \{[\s\S]*?\};/,
      `${genPdfCode}\n\n  const handleDownloadPdf = () => {
    generateAndDownloadPDF('print-fiscal-content', \`Comprovante_Rendimentos_\${year}.pdf\`);
  };`
    );
  }
  
  fs.writeFileSync(filePath, content);
};

fixPdf('src/components/PrintStatementModal.tsx');
fixPdf('src/components/PrintFiscalModal.tsx');


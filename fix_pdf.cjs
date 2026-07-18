const fs = require('fs');

const content = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');
let newContent = content.replace(
  `import { FileText, MessageCircle, Globe, Truck, ArrowLeft, Printer } from 'lucide-react';`,
  `import { FileText, MessageCircle, Globe, Truck, ArrowLeft, Printer } from 'lucide-react';\nimport html2canvas from 'html2canvas';\nimport jsPDF from 'jspdf';`
);

newContent = newContent.replace(
  `  const handleDownloadPdf = (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      window.print();
    }
  };`,
  `  const generateAndDownloadPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }
    
    toast.info("Gerando PDF, por favor aguarde...");
    
    try {
      // Force element to be visible and correctly sized for PDF generation
      const originalStyle = element.getAttribute('style');
      element.style.width = '210mm'; // A4 width
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
      toast.error("Erro ao gerar PDF. Usando impressão nativa do navegador...");
      window.print();
    }
  };

  const handleDownloadPdf = (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      generateAndDownloadPDF('print-os-content', \`OS_\${printOs.number}.pdf\`);
    }
  };
  
  const handleDownloadPhotoPdf = () => {
    if (!selectedPhoto) return;
    generateAndDownloadPDF('print-photo-content', \`Anexo_\${selectedPhoto.title.replace(/\\s+/g, '_')}.pdf\`);
  };`
);

// We need to add ID to the photo content div so we can target it
newContent = newContent.replace(
  `<div className="flex-1 p-8 flex items-center justify-center print:p-0 print:block">`,
  `<div id="print-photo-content" className="flex-1 p-8 flex items-center justify-center print:p-0 print:block bg-white w-full h-full">`
);

newContent = newContent.replace(
  `onClick={() => window.print()}`,
  `onClick={handleDownloadPhotoPdf}`
);

fs.writeFileSync('src/components/PrintOsModal.tsx', newContent);


const fs = require('fs');

let content = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

content = content.replace(
  `  const handleDownloadPdf = (openWhatsApp = false) => {
    if (openWhatsApp) {
      if (onWhatsApp) onWhatsApp();
    } else {
      openInNewWindowAndPrint('print-os-content', \`OS_\${printOs.number}\`);
    }
  };`,
  `  const handleDownloadPdf = (openWhatsApp = false) => {
    openInNewWindowAndPrint('print-os-content', \`OS_\${printOs.number}\`);
    if (openWhatsApp && onWhatsApp) {
      setTimeout(() => {
        onWhatsApp();
      }, 300);
    }
  };`
);

fs.writeFileSync('src/components/PrintOsModal.tsx', content);


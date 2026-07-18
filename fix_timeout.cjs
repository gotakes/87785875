const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    `    if (openWhatsApp && onWhatsApp) {
      setTimeout(() => {
        onWhatsApp();
      }, 300);
    }`,
    `    if (openWhatsApp && onWhatsApp) {
      onWhatsApp();
    }`
  );
  
  fs.writeFileSync(file, content);
};

fixFile('src/components/PrintOsModal.tsx');
fixFile('src/components/PrintStatementModal.tsx');

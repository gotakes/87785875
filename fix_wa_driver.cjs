const fs = require('fs');
let content = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const oldDriverWA = `    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; document.body.appendChild(link); link.click(); document.body.removeChild(link);`;
const newDriverWA = `    toast.success("Aba de impressão aberta!", {
      description: "Salve o PDF e clique abaixo para enviar.",
      action: {
        label: "Abrir WhatsApp",
        onClick: () => window.open(url, '_blank')
      },
      duration: 15000,
    });`;
    
content = content.replace(oldDriverWA, newDriverWA);

const oldDriverStatement = `             const link = document.createElement('a'); link.href = \`https://wa.me/?text=\${msg}\`; link.target = '_blank'; link.rel = 'noopener noreferrer'; document.body.appendChild(link); link.click(); document.body.removeChild(link);`;
const newDriverStatement = `             toast.success("Aba de impressão aberta!", {
               description: "Salve o PDF e clique abaixo para enviar.",
               action: {
                 label: "Abrir WhatsApp",
                 onClick: () => window.open(\`https://wa.me/?text=\${msg}\`, '_blank')
               },
               duration: 15000,
             });`;
             
content = content.replace(oldDriverStatement, newDriverStatement);

fs.writeFileSync('src/components/Driver.tsx', content);

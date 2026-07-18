const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');

const oldClientStatement = `             const link = document.createElement('a'); link.href = \`https://wa.me/?text=\${msg}\`; link.target = '_blank'; link.rel = 'noopener noreferrer'; document.body.appendChild(link); link.click(); document.body.removeChild(link);`;

const newClientStatement = `             toast.success("Aba de impressão aberta!", {
               description: "Salve o PDF e clique abaixo para enviar.",
               action: {
                 label: "Abrir WhatsApp",
                 onClick: () => window.open(\`https://wa.me/?text=\${msg}\`, '_blank')
               },
               duration: 15000,
             });`;

content = content.replace(oldClientStatement, newClientStatement);

const oldClientOs = `            const url = \`https://wa.me/?text=\${encodeURIComponent(text)}\`;
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);`;
            
const newClientOs = `            const url = \`https://wa.me/?text=\${encodeURIComponent(text)}\`;
            toast.success("Aba de impressão aberta!", {
              description: "Salve o PDF e clique abaixo para enviar.",
              action: {
                label: "Abrir WhatsApp",
                onClick: () => window.open(url, '_blank')
              },
              duration: 15000,
            });`;

content = content.replace(oldClientOs, newClientOs);

fs.writeFileSync('src/components/Client.tsx', content);

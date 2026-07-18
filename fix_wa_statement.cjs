const fs = require('fs');

let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const originalWAClient = `              const link = document.createElement('a'); link.href = \`https://wa.me/\${phone}?text=\${msg}\`; link.target = '_blank'; link.rel = 'noopener noreferrer'; document.body.appendChild(link); link.click(); document.body.removeChild(link);`;

const toastWAClient = `              toast.success("Aba de impressão aberta!", {
                description: "Salve o PDF e clique abaixo para enviar.",
                action: {
                  label: "Abrir WhatsApp",
                  onClick: () => window.open(\`https://wa.me/\${phone}?text=\${msg}\`, '_blank')
                },
                duration: 15000,
              });`;
              
content = content.replace(originalWAClient, toastWAClient);
content = content.replace(originalWAClient, toastWAClient);

fs.writeFileSync('src/components/Admin.tsx', content);

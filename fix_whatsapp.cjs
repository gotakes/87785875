const fs = require('fs');

const files = ['src/components/Admin.tsx', 'src/components/Driver.tsx', 'src/components/Client.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace sendOsWhatsApp in Admin.tsx
    content = content.replace(/const sendOsWhatsApp = \(os: OrderService\) => \{[\s\S]*?Boa viagem!`;/m, 
`const sendOsWhatsApp = (os: OrderService) => {
    toast.info("Por favor, clique em 'Imprimir / Salvar PDF', salve o arquivo e anexe no WhatsApp.");
    const text = \`Olá! Segue em anexo o PDF da Ordem de Serviço Nº \${os.number}.\`;`);

    fs.writeFileSync(file, content);
  }
});

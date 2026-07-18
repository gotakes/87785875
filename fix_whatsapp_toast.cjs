const fs = require('fs');

const fixFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // We'll replace the direct window open with a toast action
  const originalWhatsAppOs = `  const sendOsWhatsApp = (os: OrderService) => {
    toast.info("Por favor, clique em 'Imprimir / Salvar PDF', salve o arquivo e anexe no WhatsApp.");
    const text = \`Olá! Segue em anexo o PDF da Ordem de Serviço Nº \${os.number}.\`;

    // Try to get only digits, default to empty
    let phone = (os.driverPhone || '').replace(/\\D/g, '');
    if (phone.length === 10 || phone.length === 11) {
       // if it doesn't have country code, add 55
       phone = '55' + phone;
    }
    
    const url = \`https://wa.me/\${phone}?text=\${encodeURIComponent(text)}\`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

  const newWhatsAppOs = `  const sendOsWhatsApp = (os: OrderService) => {
    const text = \`Olá! Segue em anexo o PDF da Ordem de Serviço Nº \${os.number}.\`;

    let phone = (os.driverPhone || '').replace(/\\D/g, '');
    if (phone.length === 10 || phone.length === 11) {
       phone = '55' + phone;
    }
    
    const url = \`https://wa.me/\${phone}?text=\${encodeURIComponent(text)}\`;
    
    toast.success("Aba de impressão aberta!", {
      description: "Salve o PDF e clique abaixo para enviar.",
      action: {
        label: "Abrir WhatsApp",
        onClick: () => window.open(url, '_blank')
      },
      duration: 15000,
    });
  };`;
  
  if (content.includes("Por favor, clique em 'Imprimir / Salvar PDF'")) {
    content = content.replace(originalWhatsAppOs, newWhatsAppOs);
    content = content.replace(/toast\.info\("Por favor, clique em 'Imprimir \/ Salvar PDF', salve o arquivo e anexe no WhatsApp\."\);/g, '');
    fs.writeFileSync(file, content);
  }
};

fixFile('src/components/Admin.tsx');
fixFile('src/components/Driver.tsx');
fixFile('src/components/Client.tsx');


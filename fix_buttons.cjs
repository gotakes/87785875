const fs = require('fs');

let admin = fs.readFileSync('src/components/Admin.tsx', 'utf8');
admin = admin.replace(/title="Imprimir \/ Salvar PDF"/g, 'title="Salvar em PDF"');
admin = admin.replace(/title="Enviar por WhatsApp"/g, 'title="Compartilhar"');
fs.writeFileSync('src/components/Admin.tsx', admin);

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');
client = client.replace(/title="Imprimir \/ Salvar PDF \/ Compartilhar"/g, 'title="Salvar em PDF ou Compartilhar"');
fs.writeFileSync('src/components/Client.tsx', client);

let driver = fs.readFileSync('src/components/Driver.tsx', 'utf8');
driver = driver.replace(/Imprimir \/ Salvar PDF/g, 'Salvar em PDF');
fs.writeFileSync('src/components/Driver.tsx', driver);

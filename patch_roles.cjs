const fs = require('fs');

let client = fs.readFileSync('src/components/Client.tsx', 'utf8');
client = client.replace(
  /<PrintOsModal\s+printOs=\{printOs\}\s+onClose=\{\(\) => setPrintOs\(null\)\}\s+onWhatsApp=\{/g,
  '<PrintOsModal userRole="CLIENT"\n           printOs={printOs}\n           onClose={() => setPrintOs(null)}\n           onWhatsApp={'
);
fs.writeFileSync('src/components/Client.tsx', client);

let driver = fs.readFileSync('src/components/Driver.tsx', 'utf8');
driver = driver.replace(
  /<PrintOsModal\s+onClose=\{\(\) => setPrintOs\(null\)\}\s+printOs=\{printOs\}\s+\/>/g,
  '<PrintOsModal userRole="DRIVER"\n           onClose={() => setPrintOs(null)}\n           printOs={printOs}\n        />'
);
fs.writeFileSync('src/components/Driver.tsx', driver);

let admin = fs.readFileSync('src/components/Admin.tsx', 'utf8');
admin = admin.replace(
  /<PrintOsModal\s+printOs=\{printOs\}\s+onClose=\{\(\) => setPrintOs\(null\)\}\s+onWhatsApp=\{/g,
  '<PrintOsModal userRole="ADMIN"\n           printOs={printOs}\n           onClose={() => setPrintOs(null)}\n           onWhatsApp={'
);
fs.writeFileSync('src/components/Admin.tsx', admin);


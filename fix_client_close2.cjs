const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/          <\/div>\n          <\/div>\n        \)}/g, "          </div>\n        )}");
fs.writeFileSync(filepath, content);

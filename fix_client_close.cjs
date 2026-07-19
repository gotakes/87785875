const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/          <\/div>\n        \)}/g, "          </div>\n          </div>\n        )}");
fs.writeFileSync(filepath, content);

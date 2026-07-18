const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Hide scrollbars
content = content.replace(/::-webkit-scrollbar \{\n  width: 8px;\n  height: 8px;\n\}/g, "::-webkit-scrollbar {\n  display: none;\n}\n\n* {\n  -ms-overflow-style: none;\n  scrollbar-width: none;\n}");

fs.writeFileSync('src/index.css', content);

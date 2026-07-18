const fs = require('fs');
let content = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const endMatch = /        <\/div>\n      <\/div>\n    <\/div>\n  \);\n\}/g;
content = content.replace(endMatch, "      </div>\n    </div>\n  );\n}");

fs.writeFileSync('src/components/Driver.tsx', content);

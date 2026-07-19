const fs = require('fs');
let content = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/AddressAutocomplete.tsx', content);

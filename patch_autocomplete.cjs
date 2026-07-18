const fs = require('fs');
const file = 'src/components/AddressAutocomplete.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('if (!value || !isTyping) {', 'if (!value || value.length < 3 || !isTyping) {');

fs.writeFileSync(file, content);
console.log('Address autocomplete patched.');

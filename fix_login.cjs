const fs = require('fs');
const filepath = 'src/components/Login.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/md:mb-4 md:mb-6/g, 'md:mb-6');
content = content.replace(/font-black font-display tracking-tight font-display/g, 'font-black font-display tracking-tight');

fs.writeFileSync(filepath, content);

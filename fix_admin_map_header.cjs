const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');
content = content.replace(/<div className="mb-6 flex justify-between items-center">/, '<div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-0">');
fs.writeFileSync('src/components/Admin.tsx', content);

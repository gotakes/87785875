const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');
content = content.replace(/<div className="mb-6 flex justify-between items-center">/, '<div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-0">');
content = content.replace(/<div className="h-full flex flex-col animate-in fade-in duration-300 p-8">/, '<div className="h-full flex flex-col animate-in fade-in duration-300 p-4 md:p-8">');
fs.writeFileSync('src/components/Client.tsx', content);

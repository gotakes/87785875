const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');

content = content.replace(
  '<div className="h-full overflow-y-auto w-full animate-in fade-in duration-300">',
  '<div className="h-full overflow-y-auto w-full animate-in fade-in duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">'
);

fs.writeFileSync('src/components/Client.tsx', content);

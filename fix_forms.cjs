const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<form \n                className="space-y-6"/, '<form \n                className="space-y-6 pb-24 md:pb-0"');
  content = content.replace(/<form \n                className="space-y-6"/, '<form \n                className="space-y-6 pb-24 md:pb-0"'); // in case there's another
  fs.writeFileSync(file, content);
}

fixFile('src/components/Client.tsx');
fixFile('src/components/Admin.tsx');

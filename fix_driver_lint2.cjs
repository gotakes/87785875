const fs = require('fs');
const filepath = 'src/components/Driver.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('MessageCircle')) {
  content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1, Map as MapIcon, MessageCircle} from 'lucide-react';");
}
fs.writeFileSync(filepath, content);
console.log("Fixed Driver lint2");

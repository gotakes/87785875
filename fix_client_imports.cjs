const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// replace lucide-react imports to include Search
if (!content.includes('Search')) {
  content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1, Search} from 'lucide-react';");
}

fs.writeFileSync(filepath, content);
console.log("Fixed Client imports");

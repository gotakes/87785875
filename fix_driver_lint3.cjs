const fs = require('fs');
let filepath = 'src/components/Driver.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1, Map as MapIcon, MessageCircle} from 'lucide-react';");
fs.writeFileSync(filepath, content);

filepath = 'src/components/Client.tsx';
content = fs.readFileSync(filepath, 'utf8');
content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1, Search} from 'lucide-react';");
fs.writeFileSync(filepath, content);

console.log("Fixed all imports");

const fs = require('fs');
const filepath = 'src/components/Driver.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace setActiveTab('MAP') with window.open for Maps
content = content.replace(/setActiveTab\('MAP'\); setMobileMenuOpen\(false\);/g, "window.open(`https://maps.google.com/?q=${order.destinations[0]}`, '_blank')");

// Map is not defined as icon or component, import Map from lucide-react, also MessageCircle
if (!content.includes('MessageCircle')) {
  content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1, Map as MapIcon, MessageCircle} from 'lucide-react';");
}
content = content.replace(/<Map size=\{18\} \/>/g, "<MapIcon size={18} />");

fs.writeFileSync(filepath, content);
console.log("Fixed Driver lint");

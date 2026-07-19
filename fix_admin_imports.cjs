const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace lucide-react imports to include Filter
content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1, Filter} from 'lucide-react';");

// Check ExpandableCard import
if (!content.includes("ExpandableCard")) {
  content = content.replace(/import \{ Dashboard \} from '\.\/Dashboard';/, "import { Dashboard } from './Dashboard';\nimport { ExpandableCard } from './ExpandableCard';");
}

// Remove setOsForm({ ... });
content = content.replace(/setOsForm\(\{[^}]+\}\);/g, "");

fs.writeFileSync(filepath, content);
console.log("Fixed imports");

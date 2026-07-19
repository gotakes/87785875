const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes("ExpandableCard")) {
    content = content.replace("import { Dashboard } from './Dashboard';", "import { Dashboard } from './Dashboard';\nimport { ExpandableCard } from './ExpandableCard';");
    fs.writeFileSync(filepath, content);
    console.log("Patched imports");
}

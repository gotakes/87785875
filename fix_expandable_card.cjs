const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes("ExpandableCard")) {
  content = "import { ExpandableCard } from './ExpandableCard';\n" + content;
  fs.writeFileSync(filepath, content);
  console.log("Prepended ExpandableCard");
}

const fs = require('fs');
const content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const start = content.indexOf('export default function AdminPanel');
const returnStart = content.indexOf('return (', start);
const adminPanelEnd = content.indexOf('function SidebarButton', returnStart);
const adminPanelText = content.substring(returnStart, adminPanelEnd);

const lines = adminPanelText.split('\n');
for (let i = lines.length - 10; i < lines.length; i++) {
  console.log(lines[i]);
}

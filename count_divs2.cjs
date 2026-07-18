const fs = require('fs');
const content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const start = content.indexOf('export default function AdminPanel');
const returnStart = content.indexOf('return (', start);
const adminPanelEnd = content.indexOf('function SidebarButton', returnStart);
const adminPanelText = content.substring(returnStart, adminPanelEnd);

let openDivs = 0;
let stack = [];
const lines = adminPanelText.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div(?![^>]*\/>)[^>]*>/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  openDivs += opens - closes;
  if (openDivs < 0) {
    console.log(`Negative open divs at line ${i}: ${line}`);
    break;
  }
}
console.log(`Open divs at end: ${openDivs}`);

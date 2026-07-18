const fs = require('fs');
const content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const lines = content.split('\n');
const startLine = lines.findIndex(l => l.includes('export default function AdminPanel'));
const returnStartLine = lines.findIndex((l, i) => i > startLine && l.includes('return ('));
const endLine = lines.findIndex((l, i) => i > returnStartLine && l.includes('function SidebarButton'));

let openDivs = 0;
for (let i = returnStartLine; i < endLine; i++) {
  const line = lines[i];
  const opens = (line.match(/<div(?![^>]*\/>)[^>]*>/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  openDivs += opens - closes;
  if (openDivs < 0) {
    console.log(`Negative open divs at global line ${i + 1}: ${line}`);
    break;
  }
}
console.log(`Open divs at end: ${openDivs}`);

const fs = require('fs');
const content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const start = content.indexOf('export default function AdminPanel');
const returnStart = content.indexOf('return (', start);
const adminPanelEnd = content.indexOf('\n}\n', returnStart);
const adminPanelText = content.substring(returnStart, adminPanelEnd);

let stack = [];
const lines = adminPanelText.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // A crude way to track
  let pos = 0;
  while (true) {
    const openIdx = line.indexOf('<div', pos);
    const closeIdx = line.indexOf('</div', pos);
    
    if (openIdx === -1 && closeIdx === -1) break;
    
    if (openIdx !== -1 && (closeIdx === -1 || openIdx < closeIdx)) {
      stack.push(`line ${i}: ${line.trim()}`);
      pos = openIdx + 4;
    } else if (closeIdx !== -1 && (openIdx === -1 || closeIdx < openIdx)) {
      stack.pop();
      pos = closeIdx + 5;
    }
  }
}
console.log("Unclosed divs:");
console.log(stack);

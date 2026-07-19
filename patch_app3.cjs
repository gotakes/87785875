const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const strToFind = "export default function WrappedApp() {";
const index = content.indexOf(strToFind);
if (index !== -1) {
  content = content.substring(0, index) + "export default App;\n";
  fs.writeFileSync('src/App.tsx', content);
}

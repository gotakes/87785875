const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/const \[printOs, setPrintOs\] = useState<any>\(null\);/,
  "const [printOs, setPrintOs] = useState<any>(null);\n  const [statementData, setStatementData] = useState<any>(null);");

code = code.replace(/onClose=\{.*setStatementData\(null\).*\}\n.*onWhatsApp=\{.*\}\n\s*\/>/g, (match) => {
  return match + "\n";
}); // Not doing anything with this for now, just finding out the state issue.

fs.writeFileSync('src/components/Admin.tsx', code);

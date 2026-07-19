const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('expandedOsIds')) {
  content = content.replace(
    'const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});',
    'const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});\n  const [expandedOsIds, setExpandedOsIds] = useState<Record<string, boolean>>({});'
  );
  fs.writeFileSync(filepath, content);
  console.log("Added expandedOsIds to Client");
}

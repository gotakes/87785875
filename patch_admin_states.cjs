const fs = require('fs');
const filepath = 'src/components/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const stateStr = `  const [showMapMobile, setShowMapMobile] = useState(false);`;
const newStateStr = `  const [showMapMobile, setShowMapMobile] = useState(false);
  const [expandedOsIds, setExpandedOsIds] = useState<Record<string, boolean>>({});
  const [expandedClientIds, setExpandedClientIds] = useState<Record<string, boolean>>({});
  const [expandedDriverIds, setExpandedDriverIds] = useState<Record<string, boolean>>({});

  const toggleOsExpanded = (id: string) => {
    setExpandedOsIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleClientExpanded = (id: string) => {
    setExpandedClientIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleDriverExpanded = (id: string) => {
    setExpandedDriverIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
`;

if (content.includes(stateStr)) {
    fs.writeFileSync(filepath, content.replace(stateStr, newStateStr));
    console.log('Success states');
} else {
    console.log('States str not found');
}

const fs = require('fs');

let clientCode = fs.readFileSync('src/components/Client.tsx', 'utf8');

// Fix activeTab type
clientCode = clientCode.replace(
  /const \[activeTab, setActiveTab\] = useState<'MY_OS' \| 'MAP' \| 'NEW_OS'>\('MY_OS'\);/,
  "const [activeTab, setActiveTab] = useState<any>('OS_LIST');"
);

// Fix lucide imports
clientCode = clientCode.replace(
  /import \{ Map, FileText, Plus, LogOut \} from 'lucide-react';/,
  "import { Map, FileText, Plus, LogOut, Minus, ArrowUpDown, CheckCircle2, MapPin } from 'lucide-react';"
);

fs.writeFileSync('src/components/Client.tsx', clientCode);

const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const regex = /function DriverDetailView\(\{ driverId, drivers, orders, onBack, onPrintOs, onSendOsWhatsApp \}: \{ driverId: string, drivers: Driver\[\], orders: OrderService\[\], onBack: \(\) => void, onPrintOs: \(os: any\) => void, onSendOsWhatsApp: \(os: any\) => void \}\) \{[\s\S]*?const handleEditSubmit = async/g;

code = code.replace(/function DriverDetailView\(\{ driverId, drivers, orders, onBack, onPrintOs, onSendOsWhatsApp \}/, 
  "function DriverDetailView({ driverId, drivers, orders, onBack, onPrintOs, onSendOsWhatsApp, onGenerateStatement }: { driverId: string, drivers: Driver[], orders: OrderService[], onBack: () => void, onPrintOs: (os: any) => void, onSendOsWhatsApp: (os: any) => void, onGenerateStatement: (oses: OrderService[], driver: Driver) => void }");

code = code.replace(/const \[isEditing, setIsEditing\] = useState\(false\);/,
  "const [isEditing, setIsEditing] = useState(false);\n  const [detailTab, setDetailTab] = useState<'INFO' | 'FINANCE'>('FINANCE');\n  const [selectedOsIds, setSelectedOsIds] = useState<Record<string, boolean>>({});");

fs.writeFileSync('src/components/Admin.tsx', code);

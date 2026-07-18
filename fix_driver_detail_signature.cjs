const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/function DriverDetailView\(\{ driverId, drivers, orders, onBack, onPrintOs, onSendOsWhatsApp, onGenerateStatement \}: \{ driverId: string, drivers: Driver\[\], orders: OrderService\[\], onBack: \(\) => void, onPrintOs: \(os: any\) => void, onSendOsWhatsApp: \(os: any\) => void, onGenerateStatement: \(oses: OrderService\[\], driver: Driver\) => void \}: \{ driverId: string, drivers: Driver\[\], orders: OrderService\[\], onBack: \(\) => void, onPrintOs: \(os: any\) => void, onSendOsWhatsApp: \(os: any\) => void \}/,
  "function DriverDetailView({ driverId, drivers, orders, onBack, onPrintOs, onSendOsWhatsApp, onGenerateStatement }: { driverId: string, drivers: Driver[], orders: OrderService[], onBack: () => void, onPrintOs: (os: any) => void, onSendOsWhatsApp: (os: any) => void, onGenerateStatement: (oses: OrderService[], driver: Driver) => void })");

fs.writeFileSync('src/components/Admin.tsx', code);

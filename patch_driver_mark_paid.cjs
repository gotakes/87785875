const fs = require('fs');
let code = fs.readFileSync('src/components/Driver.tsx', 'utf8');

const generatePdfBtnRegex = /<button \n              onClick=\{\(\) => \{\n                const selectedOses = completedOrders\.filter\(os => selectedOsIds\[os\.id!\]\);\n                setStatementData\(\{\n                  orders: selectedOses,\n                  role: 'DRIVER',\n                  targetName: driver\.name,\n                  targetDocument: driver\.cpf,\n                  driverBankDetails: \{\n                    bank: driver\.bank,\n                    agency: driver\.agency,\n                    account: driver\.account,\n                    pix: driver\.pixKey\n                  \}\n                \}\);\n              \}\}\n              className="w-full bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-colors shadow-sm flex items-center justify-center gap-2"\n            >\n              <FileText size=\{18\} \/> Gerar Cobrança \(PDF\)\n            <\/button>/g;

const replacement = `<div className="w-full flex gap-2">
              <button 
                onClick={() => {
                  const selectedOses = completedOrders.filter(os => selectedOsIds[os.id!]);
                  setStatementData({
                    orders: selectedOses,
                    role: 'DRIVER',
                    targetName: driver.name,
                    targetDocument: driver.cpf,
                    driverBankDetails: {
                      bank: driver.bank,
                      agency: driver.agency,
                      account: driver.account,
                      pix: driver.pixKey
                    }
                  });
                }}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-400 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <FileText size={18} /> Cobrança (PDF)
              </button>
              
              <button 
                onClick={async () => {
                  const selectedOses = completedOrders.filter(os => selectedOsIds[os.id!]);
                  let successCount = 0;
                  for (const os of selectedOses) {
                    try {
                      const osRef = doc(db, 'orders', os.id!);
                      await updateDoc(osRef, { paymentStatusDriver: 'PAID' });
                      successCount++;
                    } catch (e) {}
                  }
                  if (successCount > 0) {
                     toast.success(\`\${successCount} OSs confirmadas como recebidas!\`);
                     setSelectedOsIds({});
                  }
                }}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Já Recebi
              </button>
            </div>`;

code = code.replace(generatePdfBtnRegex, replacement);

// check if there is an import for checkcircle2 in driver.tsx, if not add it.
if (!code.includes('CheckCircle2')) {
  code = code.replace(/import \{ Truck, MapPin, FileDown, Share2, Banknote, Navigation, Fuel, Route, LogOut, /, 
    "import { Truck, MapPin, FileDown, Share2, Banknote, Navigation, Fuel, Route, LogOut, CheckCircle2, ");
}

fs.writeFileSync('src/components/Driver.tsx', code);

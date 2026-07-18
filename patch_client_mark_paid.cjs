const fs = require('fs');
let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

const generatePdfBtnRegex = /<button \n                      onClick=\{\(\) => \{\n                        const selectedOses = clientOrders\.filter\(os => selectedOsIds\[os\.id!\]\);\n                        setStatementData\(\{\n                          orders: selectedOses,\n                          role: 'CLIENT',\n                          targetName: client\.name,\n                          targetDocument: client\.document\n                        \}\);\n                      \}\}\n                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"\n                    >\n                      Gerar Relatório de Pgto\n                    <\/button>/g;

const replacement = `<button 
                      onClick={() => {
                        const selectedOses = clientOrders.filter(os => selectedOsIds[os.id!]);
                        setStatementData({
                          orders: selectedOses,
                          role: 'CLIENT',
                          targetName: client.name,
                          targetDocument: client.document
                        });
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      Relatório (PDF)
                    </button>
                    <button 
                      onClick={async () => {
                        const selectedOses = clientOrders.filter(os => selectedOsIds[os.id!]);
                        let successCount = 0;
                        for (const os of selectedOses) {
                          try {
                            const osRef = doc(db, 'orders', os.id!);
                            await updateDoc(osRef, { paymentStatusClient: 'PAID' });
                            successCount++;
                          } catch (e) {}
                        }
                        if (successCount > 0) {
                           toast.success(\`\${successCount} OSs confirmadas como pagas!\`);
                           setSelectedOsIds({});
                        }
                      }}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      Já Paguei
                    </button>`;

code = code.replace(generatePdfBtnRegex, replacement);

if (!code.includes('CheckCircle2')) {
  code = code.replace(/import \{ Truck, FileDown, Share2, LogOut /, 
    "import { Truck, FileDown, Share2, LogOut, CheckCircle2 ");
}

// Add imports for db and doc, updateDoc
if (!code.includes('updateDoc')) {
  code = code.replace(/import \{ collection, addDoc \} from 'firebase\/firestore';/,
    "import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';");
}

fs.writeFileSync('src/components/Client.tsx', code);

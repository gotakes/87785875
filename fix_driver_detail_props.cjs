const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/<DriverDetailView \n            driverId=\{selectedDriverId\}\n            drivers=\{drivers\}\n            orders=\{orders\}\n            onBack=\{\(\) => \{\n              setSelectedDriverId\(null\);\n              setActiveTab\('DRIVER_LIST'\);\n            \}\} \n            onPrintOs=\{setPrintOs\}\n            onSendOsWhatsApp=\{sendOsWhatsApp\}\n          \/>/g,
  `<DriverDetailView 
            driverId={selectedDriverId}
            drivers={drivers}
            orders={orders}
            onBack={() => {
              setSelectedDriverId(null);
              setActiveTab('DRIVER_LIST');
            }} 
            onPrintOs={setPrintOs}
            onSendOsWhatsApp={sendOsWhatsApp}
            onGenerateStatement={(selectedOses, driver) => {
              setStatementData({
                 orders: selectedOses,
                 role: 'ADMIN_TO_DRIVER',
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
          />`);

fs.writeFileSync('src/components/Admin.tsx', code);

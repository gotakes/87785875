const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const regex = /<DriverDetailView[\s\S]*?\/>/;
code = code.replace(regex, `<DriverDetailView 
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

const fs = require('fs');
const filepath = 'src/components/Client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const strToFind = "            )}\n          </div>\n        )}\n        {activeTab === 'OS_CREATE' && (";
const strToReplace = "            )}\n          </div>\n          </div>\n        )}\n        {activeTab === 'OS_CREATE' && (";

if (content.includes(strToFind)) {
    content = content.replace(strToFind, strToReplace);
    fs.writeFileSync(filepath, content);
    console.log("Successfully replaced string");
} else {
    console.log("String not found");
}

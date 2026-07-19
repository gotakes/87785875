const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /import \{ APIProvider \} from '@vis\.gl\/react-google-maps';\n/g;
content = content.replace(regex, '');

const wrapperRegex = /export default function WrappedApp\(\) \{[\s\S]*\}\n$/;
content = content.replace(wrapperRegex, 'export default App;\n');

fs.writeFileSync('src/App.tsx', content);

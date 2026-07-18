const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');
let idx = code.lastIndexOf('}');
if (idx !== -1) {
    let secondIdx = code.lastIndexOf('}', idx - 1);
    if (secondIdx !== -1) {
        let between = code.substring(secondIdx + 1, idx);
        if (between.trim() === '') {
            code = code.substring(0, idx) + code.substring(idx + 1);
        }
    }
}
fs.writeFileSync('src/components/Admin.tsx', code);

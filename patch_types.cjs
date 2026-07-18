const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('cargoVolume')) {
    code = code.replace(
        /estimatedWeight\?: string;/,
        "estimatedWeight?: string;\n  cargoVolume?: string;"
    );
    fs.writeFileSync('src/types.ts', code);
}

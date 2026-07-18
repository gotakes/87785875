const fs = require('fs');
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(/  \};\n\}\n\n\n\n$/g, "  };\n}\n"); // This regex is bad. Let's just fix the end of the file or the end of DriverDetailView.

code = code.replace(/  \};\n\}\n\}\n/g, "  };\n}\n");
// Actually, let's just use regex to replace `}\n}` with `}` where it happens at the end of the file or similar.
const lastChars = code.slice(-50);
console.log(lastChars);

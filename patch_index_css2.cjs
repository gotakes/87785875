const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// The file currently starts with "500;600;700..."
// Let's just find where @import "tailwindcss" starts
const tailwindIdx = css.indexOf('@import "tailwindcss";');
if (tailwindIdx !== -1) {
    css = css.substring(tailwindIdx);
    fs.writeFileSync('src/index.css', css);
    console.log("Fixed index.css");
}

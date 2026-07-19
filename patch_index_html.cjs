const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('lang="en"', 'lang="pt-BR"');

const fontLinks = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
`;

if (!html.includes('fonts.googleapis.com')) {
    html = html.replace('</title>', '</title>' + fontLinks);
}

fs.writeFileSync('index.html', html);
console.log("Patched index.html");

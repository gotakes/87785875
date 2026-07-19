const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    const replacements = [
        [/\bpx-3 md:px-6 py-4\b/g, 'px-3 py-2 md:px-6 md:py-4'],
        [/\bp-4 font-bold\b/g, 'p-3 md:p-4 font-bold'],
        [/\bp-4 border-b\b/g, 'p-3 md:p-4 border-b'],
        // For general padding that might just be p-4 in tables
        [/\bp-4\b(?! md:p-6)(?! md:p-8)/g, 'p-3 md:p-4'],
        [/md:p-3 md:p-4/g, 'md:p-4'],
        // Also look at padding inside Admin.tsx TD tags specifically if we can't catch them
    ];

    let newContent = content;
    for (const [oldRegex, newStr] of replacements) {
        newContent = newContent.replace(oldRegex, newStr);
    }

    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent);
        console.log(`Updated ${filepath}`);
    }
}

function walkSync(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath);
        } else if (filepath.endsWith('.tsx')) {
            processFile(filepath);
        }
    }
}

walkSync('src/components');

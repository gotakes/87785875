const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    const replacements = [
        // Make buttons a bit more compact on mobile
        [/\bpx-4 py-2\b/g, 'px-3 py-1.5 md:px-4 md:py-2'],
        [/\bpx-6 py-3\b/g, 'px-4 py-2 md:px-6 md:py-3'],
        
        // Prevent doubling up
        [/md:px-3 md:py-1\.5 md:px-4 md:py-2/g, 'md:px-4 md:py-2'],
        [/md:px-4 md:py-2 md:px-6 md:py-3/g, 'md:px-6 md:py-3'],
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

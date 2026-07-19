const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    const replacements = [
        // Revert global text-xs md:text-sm back to text-sm
        [/text-xs md:text-sm/g, 'text-sm'],
        // Except where we specifically want it (like in tables maybe), but it's safer to just revert
        // Also revert text-sm md:text-base back to text-sm
        [/text-sm md:text-base/g, 'text-sm'],
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

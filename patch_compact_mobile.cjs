const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    const replacements = [
        // Reduce spacing in stacks
        [/\bspace-y-6\b/g, 'space-y-4 md:space-y-6'],
        [/\bspace-y-4\b/g, 'space-y-3 md:space-y-4'],
        [/md:space-y-3 md:space-y-4/g, 'md:space-y-4'],
        [/md:space-y-4 md:space-y-6/g, 'md:space-y-6'],
        
        // Further tighten paddings on mobile
        [/\bp-4 md:p-6\b/g, 'p-3 md:p-6'],
        [/\bp-4 md:p-8\b/g, 'p-3 md:p-8'],
        
        // Reduce headings
        [/\btext-xl font-bold\b/g, 'text-lg md:text-xl font-bold'],
        [/\btext-2xl font-bold\b/g, 'text-xl md:text-2xl font-bold'],
        
        // Fix up inputs to be slightly more compact on mobile (py-2 -> py-1.5, except if they have md:py-2)
        [/\bpx-3 py-2 border\b/g, 'px-3 py-1.5 md:py-2 border'],
        
        // Reduce gaps further
        [/\bgap-4 md:gap-6\b/g, 'gap-3 md:gap-6'],
        [/\bgap-3 md:gap-4\b/g, 'gap-2 md:gap-4'],
        
        // Border radius slightly smaller on mobile
        [/\brounded-xl md:rounded-2xl\b/g, 'rounded-lg md:rounded-2xl'],
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

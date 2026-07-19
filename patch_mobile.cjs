const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    const replacements = [
        [/\bp-6\b/g, 'p-4 md:p-6'],
        [/\bp-8\b/g, 'p-4 md:p-8'],
        [/\bpx-6\b/g, 'px-4 md:px-6'],
        [/\bpy-6\b/g, 'py-4 md:py-6'],
        [/\bgap-6\b/g, 'gap-4 md:gap-6'],
        [/\bgap-8\b/g, 'gap-4 md:gap-8'],
        [/\btext-2xl\b/g, 'text-xl md:text-2xl'],
        [/\bmb-6\b/g, 'mb-4 md:mb-6'],
        [/\bmb-8\b/g, 'mb-4 md:mb-8'],
        [/\bmt-6\b/g, 'mt-4 md:mt-6'],
        [/\bmt-8\b/g, 'mt-4 md:mt-8'],
        [/\brounded-2xl\b/g, 'rounded-xl md:rounded-2xl'],
        
        // Avoid doubling up if they already have md: prefix
        [/md:p-4 md:p-6/g, 'md:p-6'],
        [/md:p-4 md:p-8/g, 'md:p-8'],
        [/md:px-4 md:px-6/g, 'md:px-6'],
        [/md:py-4 md:py-6/g, 'md:py-6'],
        [/md:gap-4 md:gap-6/g, 'md:gap-6'],
        [/md:gap-4 md:gap-8/g, 'md:gap-8'],
        [/md:text-xl md:text-2xl/g, 'md:text-2xl'],
        [/md:mb-4 md:mb-6/g, 'md:mb-6'],
        [/md:mb-4 md:mb-8/g, 'md:mb-8'],
        [/md:mt-4 md:mt-6/g, 'md:mt-6'],
        [/md:mt-4 md:mt-8/g, 'md:mt-8'],
        [/md:rounded-xl md:rounded-2xl/g, 'md:rounded-2xl'],
        
        // specific table adjustments for mobile
        [/\bpx-4 py-3 text-left\b/g, 'px-3 py-2 md:px-4 md:py-3 text-left text-sm md:text-base'],
        [/\bpx-4 py-3\b/g, 'px-3 py-2 md:px-4 md:py-3'],
        [/\bpx-4 py-4\b/g, 'px-3 py-3 md:px-4 md:py-4'],
        [/md:px-3 md:py-2 md:px-4 md:py-3/g, 'md:px-4 md:py-3'],
        [/md:px-3 md:py-3 md:px-4 md:py-4/g, 'md:px-4 md:py-4'],
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

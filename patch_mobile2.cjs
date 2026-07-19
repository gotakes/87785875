const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');

    const replacements = [
        // Reduce table cell padding on mobile
        [/\bpx-4 md:px-6\b/g, 'px-3 md:px-6'],
        [/\bpx-4 py-3\b/g, 'px-3 py-2 md:px-4 md:py-3'],
        [/\bpx-4 py-4\b/g, 'px-3 py-3 md:px-4 md:py-4'],
        [/\bpx-4 py-2\b/g, 'px-3 py-1.5 md:px-4 md:py-2'],
        
        // Smaller text in some inputs on mobile
        [/\btext-sm\b/g, 'text-xs md:text-sm'],
        [/\btext-base\b/g, 'text-sm md:text-base'],
        
        // Prevent doubling up
        [/md:text-xs md:text-sm/g, 'md:text-sm'],
        [/md:text-sm md:text-base/g, 'md:text-base'],
        [/md:px-3 md:px-6/g, 'md:px-6'],
        [/md:px-3 md:py-2 md:px-4 md:py-3/g, 'md:px-4 md:py-3'],
        [/md:px-3 md:py-3 md:px-4 md:py-4/g, 'md:px-4 md:py-4'],
        [/md:px-3 md:py-1\.5 md:px-4 md:py-2/g, 'md:px-4 md:py-2'],

        // Compact gap on forms
        [/\bgap-4\b/g, 'gap-3 md:gap-4'],
        [/md:gap-3 md:gap-4/g, 'md:gap-4'],
        
        [/\bmb-4\b/g, 'mb-3 md:mb-4'],
        [/md:mb-3 md:mb-4/g, 'md:mb-4'],
        
        // Smaller headers
        [/\btext-lg\b/g, 'text-base md:text-lg'],
        [/md:text-base md:text-lg/g, 'md:text-lg'],
        
        [/\btext-3xl\b/g, 'text-2xl md:text-3xl'],
        [/md:text-2xl md:text-3xl/g, 'md:text-3xl'],
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

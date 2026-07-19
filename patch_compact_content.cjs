const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Create a backup
    const originalContent = content;

    const replacements = [
        // Reduce text size for table cells and content cards on mobile
        [/\btext-sm\b/g, 'text-xs md:text-sm'],
        
        // Prevent doubling up
        [/md:text-xs md:text-sm/g, 'md:text-sm'],
        [/text-xs md:text-xs/g, 'text-xs'],
        [/text-xs md:text-sm md:text-sm/g, 'text-xs md:text-sm'],
        
        // Fix some paddings inside table cells
        [/\bpx-3 py-2 md:px-6 md:py-4\b/g, 'px-2 py-2 md:px-6 md:py-4'],
        [/\bp-3 md:p-4\b/g, 'p-2 md:p-4'],
        
        // Adjust gaps in flex containers
        [/\bgap-2 md:gap-4\b/g, 'gap-1.5 md:gap-4'],
        [/\bgap-3 md:gap-6\b/g, 'gap-2 md:gap-6'],
    ];

    for (const [oldRegex, newStr] of replacements) {
        content = content.replace(oldRegex, newStr);
    }
    
    // Fix up some specific classes that might have been broken or are too small now
    content = content.replace(/text-xs md:text-sm font-bold/g, 'text-sm md:text-base font-bold');
    
    if (content !== originalContent) {
        fs.writeFileSync(filepath, content);
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

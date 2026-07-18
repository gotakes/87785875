const fs = require('fs');

let code = fs.readFileSync('src/components/Client.tsx', 'utf8');

// Replace NEW_OS with OS_CREATE for consistency
code = code.replace(/'NEW_OS'/g, "'OS_CREATE'");
code = code.replace(/activeTab === 'MY_OS'/g, "activeTab === 'OS_LIST'");
code = code.replace(/setActiveTab\('MY_OS'\)/g, "setActiveTab('OS_LIST')");

// Rename Nova Cotação / OS to Emissão de OS
code = code.replace(/Nova Cotação \/ OS/g, "Emissão de OS");

// Remove the Plus icon for Emissão de OS and use FileText
code = code.replace(/<Plus size=\{20\} \/>/g, "<FileText size={20} />");
// Remove the FileText icon for OS_LIST and use FileArchive
// Wait, both use FileText now? Let's just do it directly.

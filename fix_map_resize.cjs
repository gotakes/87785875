const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('window.dispatchEvent')) {
    const target = "const [showMapMobile, setShowMapMobile] = useState(false);";
    const replacement = `const [showMapMobile, setShowMapMobile] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [showMapMobile]);`;
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
  }
}

fixFile('src/components/Admin.tsx');
fixFile('src/components/Client.tsx');

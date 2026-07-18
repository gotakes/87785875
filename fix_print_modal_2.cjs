const fs = require('fs');
let content = fs.readFileSync('src/components/PrintOsModal.tsx', 'utf8');

content = content.replace(`export default function PrintOsModal({
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string, title: string } | null>(null);
 printOs, onClose, onWhatsApp, userRole = 'ADMIN' }: PrintOsModalProps) {`, 
`export default function PrintOsModal({ printOs, onClose, onWhatsApp, userRole = 'ADMIN' }: PrintOsModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string, title: string } | null>(null);`);

fs.writeFileSync('src/components/PrintOsModal.tsx', content);

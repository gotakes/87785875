const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const target = `      </div>
  );
}

function SidebarButton`;

const replacement = `        </div>
      </div>
    </div>
  );
}

function SidebarButton`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Admin.tsx', content);

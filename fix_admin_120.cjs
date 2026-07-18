const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const target = `        </div>
        </div>
      </div>
    </div>
  );
}

function EditOsModal`;

const replacement = `        </div>
      </div>
    </div>
  );
}

function EditOsModal`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Admin.tsx', content);

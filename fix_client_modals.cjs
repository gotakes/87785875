const fs = require('fs');
let content = fs.readFileSync('src/components/Client.tsx', 'utf8');

const endFind = `      </div>
    </div>
  );
}`;

const endReplace = `        </div>
      </div>
    </div>
  );
}`;

content = content.replace(endFind, endReplace);
fs.writeFileSync('src/components/Client.tsx', content);


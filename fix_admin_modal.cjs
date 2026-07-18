const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const badFind = `        </div>
        </div>
      </div>
    </div>
  );
}`;

const goodReplace = `        </div>
      </div>
    </div>
  );
}`;

content = content.replace(badFind, goodReplace);

// Then let's add the closing divs properly to the end of the file.
const endFind = `      </div>
    </div>
  );
}`;

const endReplace = `        </div>
      </div>
    </div>
  );
}`;
const lastIndex = content.lastIndexOf(endFind);
if(lastIndex !== -1) {
  content = content.substring(0, lastIndex) + endReplace + content.substring(lastIndex + endFind.length);
}

fs.writeFileSync('src/components/Admin.tsx', content);


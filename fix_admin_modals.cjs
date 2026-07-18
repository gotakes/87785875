const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const bad = `          </form>
      </div>
    </div>
  );
}`;
const good = `          </form>
        </div>
      </div>
    </div>
  );
}`;
content = content.replace(bad, good);

fs.writeFileSync('src/components/Admin.tsx', content);

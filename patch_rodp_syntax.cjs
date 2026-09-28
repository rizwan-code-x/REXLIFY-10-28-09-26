const fs = require('fs');
let code = fs.readFileSync('src/rodp/useAppState.ts', 'utf8');
code = code.replace("await import('firebase/database'); => {", "await import('firebase/database');");
fs.writeFileSync('src/rodp/useAppState.ts', code);

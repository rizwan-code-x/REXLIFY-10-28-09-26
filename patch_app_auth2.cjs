const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("const [adminRole, setAdminRole] = useState<'ceo' | 'teacher'>('ceo');", "const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai'>('ceo');");

fs.writeFileSync('src/App.tsx', code);

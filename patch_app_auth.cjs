const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("const handleLoginSuccess = (role: 'ceo' | 'teacher') => {", "const handleLoginSuccess = (role: 'ceo' | 'teacher' | 'rexlify-ai') => {");
code = code.replace("const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | null>(", "const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai' | null>(");

fs.writeFileSync('src/App.tsx', code);

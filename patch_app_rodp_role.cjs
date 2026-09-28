const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("const handleLoginSuccess = (role: 'ceo' | 'teacher' | 'rexlify-ai') => {", "const handleLoginSuccess = (role: 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin') => {");
code = code.replace("const [adminRole, setAdminRole] = React.useState<'ceo' | 'teacher' | 'rexlify-ai' | null>(", "const [adminRole, setAdminRole] = React.useState<'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin' | null>(");
code = code.replace("const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai' | null>(", "const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin' | null>(");
code = code.replace("const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai'>('ceo');", "const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin' | null>(null);");

fs.writeFileSync('src/App.tsx', code);

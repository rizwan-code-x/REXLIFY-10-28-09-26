const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace("  | 'rexlify-ai'", "  | 'rexlify-ai'\n  | 'rexlify-ai-login'");

fs.writeFileSync('src/components/Navbar.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update Teacher Password
code = code.replace("password === 'RTECH@12352'", "password === 'RTECH@1234'");

fs.writeFileSync('server.ts', code);

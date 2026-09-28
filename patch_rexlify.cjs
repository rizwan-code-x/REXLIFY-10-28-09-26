const fs = require('fs');
let code = fs.readFileSync('src/firebase-rexlify.ts', 'utf8');

code = code.replace(/const path = \\\`users\/\\\$\\{userId\\}\/uploads\/\\\$\\{Date\.now\(\)\}_\\\$\\{file\.name\\}\\\`;/, "const path = `users/${userId}/uploads/${Date.now()}_${file.name}`;");

fs.writeFileSync('src/firebase-rexlify.ts', code);

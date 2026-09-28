const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldAuth = `  } else if (role === 'rexlify-ai' && (password === 'RRR@123' || password === 'RTECH@123')) {
    return res.json({ success: true, token: 'rexlify-ai-token-valid' });
  }`;

const newAuth = `  } else if (role === 'rexlify-ai' && (password === 'RRR@123' || password === 'RTECH@123')) {
    return res.json({ success: true, token: 'rexlify-ai-token-valid' });
  } else if (role === 'rodp-admin' && password === 'RODP@RRR123') {
    return res.json({ success: true, token: 'rodp-admin-token-valid' });
  }`;

code = code.replace(oldAuth, newAuth);
fs.writeFileSync('server.ts', code);

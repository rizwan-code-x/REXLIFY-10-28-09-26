const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldAuth = `app.post('/api/auth/login', (req, res) => {
  const { role, password } = req.body;
  if (role === 'ceo' && password === 'Rexlify@RRR 12352') {
    return res.json({ success: true, token: 'ceo-token-valid' });
  } else if (role === 'teacher' && password === 'RTECH@1234') {
    return res.json({ success: true, token: 'teacher-token-valid' });
  }
  return res.status(401).json({ success: false, error: 'Invalid Credentials' });
});`;

const newAuth = `app.post('/api/auth/login', (req, res) => {
  const { role, password } = req.body;
  if (role === 'ceo' && password === 'REXLIFY@RRR0012352') {
    return res.json({ success: true, token: 'ceo-token-valid' });
  } else if (role === 'teacher' && password === 'RTECH@1234') {
    return res.json({ success: true, token: 'teacher-token-valid' });
  } else if (role === 'rexlify-ai' && (password === 'RRR@123' || password === 'RTECH@123')) {
    return res.json({ success: true, token: 'rexlify-ai-token-valid' });
  }
  return res.status(401).json({ success: false, error: 'Invalid Credentials' });
});`;

code = code.replace(oldAuth, newAuth);
fs.writeFileSync('server.ts', code);

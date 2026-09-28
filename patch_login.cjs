const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

// Replace the handleAuth hardcoded password check with a fetch
const oldAuth = `const isCEO = loginMode === 'ceo' && password === 'RTX@007';
      const isTeacher = loginMode === 'teacher' && password === 'RTECH@12352';

      if (isCEO || isTeacher) {`;

const newAuth = `
      // Call backend to verify so passwords aren't in frontend
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: loginMode, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const isCEO = loginMode === 'ceo';
`;

// It's tricky to replace this accurately with string replace. I'll use default_api:edit_file directly instead.

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
code = code.replace("import { AdminLogin } from './components/AdminLogin';", "import { AdminLogin } from './components/AdminLogin';\nimport { RexlifyAiLogin } from './components/RexlifyAiLogin';");

// Update rexlify-ai check
const oldCheck = `    if (view === 'rexlify-ai') {
      if (!loading && !status.rexlify_ai) return renderDisabledBlock('Rexlify AI');
      if (!isAdminLoggedIn || (adminRole !== 'ceo' && adminRole !== 'rexlify-ai')) {
        setView('admin-login');
        return null;
      }`;

const newCheck = `    if (view === 'rexlify-ai') {
      if (!loading && !status.rexlify_ai) return renderDisabledBlock('Rexlify AI');
      if (!isAdminLoggedIn || (adminRole !== 'ceo' && adminRole !== 'rexlify-ai')) {
        setView('rexlify-ai-login');
        return null;
      }`;

code = code.replace(oldCheck, newCheck);

// Add route for rexlify-ai-login
const loginRoute = `
    if (view === 'rexlify-ai-login') {
      return (
        <RexlifyAiLogin 
          setView={setView}
          onSuccess={() => {
            setIsAdminLoggedIn(true);
            setAdminRole('rexlify-ai');
          }}
        />
      );
    }
`;

code = code.replace("    if (view === 'rexlify-ai') {", loginRoute + "\n    if (view === 'rexlify-ai') {");

fs.writeFileSync('src/App.tsx', code);

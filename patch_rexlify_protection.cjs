const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldRexlifyView = `    if (view === 'rexlify-ai') {
      return (
        <RexlifyAiApp 
          onBack={() => {
            setView('applications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }`;

const newRexlifyView = `    if (view === 'rexlify-ai') {
      if (!isAdminLoggedIn || (adminRole !== 'ceo' && adminRole !== 'rexlify-ai')) {
        setView('admin-login');
        return null;
      }
      return (
        <RexlifyAiApp 
          onBack={() => {
            setView('applications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }`;

code = code.replace(oldRexlifyView, newRexlifyView);

fs.writeFileSync('src/App.tsx', code);

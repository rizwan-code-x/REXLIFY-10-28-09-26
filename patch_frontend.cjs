const fs = require('fs');
let code = fs.readFileSync('src/components/FrontendPages.tsx', 'utf8');

const target = `    onAddMessage({
      senderName: formName,
      senderEmail: formEmail,
      subject: formSubject || 'Ecosystem Query',
      category: formCategory,
      message: formMessage,
    });`;

const replacement = `
    // Transmit to Supabase (via API)
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        email: formEmail,
        subject: formSubject || 'Ecosystem Query',
        message: formMessage,
      })
    }).catch(err => console.error('Feedback submit error:', err));

    onAddMessage({
      senderName: formName,
      senderEmail: formEmail,
      subject: formSubject || 'Ecosystem Query',
      category: formCategory,
      message: formMessage,
    });`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/FrontendPages.tsx', code);

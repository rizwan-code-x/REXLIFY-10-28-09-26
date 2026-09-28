const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldRoot = '<div className="min-h-screen text-white flex flex-col md:flex-row rounded-[2.5rem] overflow-hidden border border-pink-500/20 bg-white/5 backdrop-blur-xl m-4">';
const newRoot = '<div className="min-h-screen text-white flex flex-col md:flex-row rounded-[2.5rem] overflow-hidden border border-pink-500/30 bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(236,72,153,0.15)] m-4 relative z-10">';

code = code.replace(oldRoot, newRoot);

// Ensure the main outer container is transparent to show the gradient
code = code.replace(/<div className="bg-white\/5 backdrop-blur-xl rounded-\[2.5rem\]/g, '<div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem]');

fs.writeFileSync('src/components/AdminPanel.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Container & Main Background
code = code.replace(/bg-\[\#050505\]/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/bg-\[\#030303\]/g, 'bg-white/5 backdrop-blur-2xl');
code = code.replace(/bg-\[\#0c0c0c\]/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/border-white\/10/g, 'border-pink-500/20');
code = code.replace(/border-white\/5/g, 'border-pink-500/10');

// Emerald to Pink/Purple
code = code.replace(/text-emerald-400/g, 'text-pink-300');
code = code.replace(/text-emerald-500/g, 'text-pink-400');
code = code.replace(/border-emerald-500/g, 'border-pink-400');
code = code.replace(/bg-emerald-500/g, 'bg-pink-500');

// Text Colors
code = code.replace(/text-gray-400/g, 'text-pink-200/70');
code = code.replace(/text-gray-500/g, 'text-pink-300/50');
code = code.replace(/text-gray-100/g, 'text-white');

// Button Styling (Pink, Blue, Golden mixed)
const newBtn = 'bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]';
// Find primary buttons
code = code.replace(/bg-white text-black/g, newBtn);
code = code.replace(/bg-blue-500 hover:bg-blue-400 text-black/g, newBtn);
code = code.replace(/bg-emerald-500 text-black/g, newBtn);
code = code.replace(/bg-emerald-500 hover:bg-emerald-400 text-black/g, newBtn);
code = code.replace(/hover:bg-white\/10 text-white/g, 'hover:bg-purple-500/20 text-white');

// Update active sidebar tab logic
code = code.replace(/bg-white\/10 text-white/g, newBtn);

fs.writeFileSync('src/components/AdminPanel.tsx', code);

const fs = require('fs');

let code = fs.readFileSync('src/rodp/useAppState.ts', 'utf8');
code = code.replace("import('../firebase-rexlify').then(({ rtdb, push, ref })", "import('../firebase-rexlify').then(async ({ rtdb }) => {\n        const { push, ref } = await import('firebase/database');");
// fix bracket
code = code.replace("        if (rtdb) {", "        if (rtdb) {");

fs.writeFileSync('src/rodp/useAppState.ts', code);

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace("import('../firebase-rexlify').then(({ rtdb, ref, onValue }) => {", "import('../firebase-rexlify').then(async ({ rtdb }) => {\n      const { ref, onValue } = await import('firebase/database');");
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let branchCode = fs.readFileSync('src/rodp/components/BranchDashboardView.tsx', 'utf8');
branchCode = branchCode.replace("import('../../firebase-rexlify').then(({ rtdb, ref, onValue }) => {", "import('../../firebase-rexlify').then(async ({ rtdb }) => {\n      const { ref, onValue } = await import('firebase/database');");
fs.writeFileSync('src/rodp/components/BranchDashboardView.tsx', branchCode);

const fs = require('fs');

let useAppState = fs.readFileSync('src/rodp/useAppState.ts', 'utf8');
useAppState = useAppState.replace("import('../../firebase-rexlify')", "import('../firebase-rexlify')");
fs.writeFileSync('src/rodp/useAppState.ts', useAppState);

let branchDashboard = fs.readFileSync('src/rodp/components/BranchDashboardView.tsx', 'utf8');
branchDashboard = branchDashboard.replace("import('../../firebase-rexlify')", "import('../../firebase-rexlify')"); // wait, components/BranchDashboardView is in src/rodp/components/ so ../../ is correct.
// let's check

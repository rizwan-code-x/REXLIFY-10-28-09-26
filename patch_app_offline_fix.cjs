const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import {') || !code.includes('AlertTriangle')) {
  code = code.replace("import React, {", "import { AlertTriangle } from 'lucide-react';\nimport React, {");
}

fs.writeFileSync('src/App.tsx', code);

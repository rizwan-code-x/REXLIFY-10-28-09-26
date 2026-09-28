const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");

if (!code.includes(" Users")) {
    code = code.replace("} from 'lucide-react';", ", Users } from 'lucide-react';");
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);

const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// I will just read line by line and find the problematic lines
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const ytRegex = /")) {
        // Line 29 is: const ytRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:[^\/
        // Line 30 is: ]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        if (lines[i].endsWith("[^\\/")) {
            lines[i] = "  const ytRegex = /(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtube\\.com\\/(?:[^\\/\\n]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|\\S*?[?&]v=|shorts\\/|live\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/i;";
            lines[i+1] = ""; // Clear the next line which is the rest of it
        }
    }
    
    if (lines[i].includes("const igRegex = /")) {
        if (lines[i].endsWith("[^\\/")) {
            lines[i] = "  const igRegex = /(?:https?:\\/\\/)?(?:www\\.)?instagram\\.com\\/(?:[^\\/\\n]+\\/)?(?:p|reel|reels|tv)\\/([a-zA-Z0-9_-]+)/i;";
            lines[i+1] = "";
        }
    }
    
    if (lines[i].includes("featuresRaw.split('")) {
        if (lines[i].endsWith("split('") || lines[i].endsWith("split('\\n")) {
            lines[i] = "    const featuresList = featuresRaw ? featuresRaw.split('\\n').filter(Boolean) : [];";
            lines[i+1] = "";
        }
    }
    
    if (lines[i].includes("defaultValue={editingApp?.features.join('")) {
        if (lines[i].endsWith("join('") || lines[i].endsWith("join('\\n")) {
            // Find where the rest of the textarea is. It's likely on the next line.
            lines[i] = lines[i].substring(0, lines[i].indexOf("defaultValue=")) + 
                "defaultValue={editingApp?.features.join('\\n') || ''} placeholder=\"Capacity alpha: details...\" className=\"w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors\" />";
            lines[i+1] = "";
        }
    }
}

fs.writeFileSync('src/components/AdminPanel.tsx', lines.join('\n'));

const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. ytRegex
let parts = content.split("const ytRegex = /(?:https?://)?(?:www\\.|m\\.)?(?:youtube\\.com/(?:[^\\/");
if (parts.length === 2) {
    content = parts[0] + "const ytRegex = /(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtube\\.com\\/(?:[^\\/\\n]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|\\S*?[?&]v=|shorts\\/|live\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/i;" + parts[1].substring(parts[1].indexOf('const ytMatch'));
}

// 2. igRegex
parts = content.split("const igRegex = /(?:https?://)?(?:www\\.)?instagram\\.com/(?:[^\\/");
if (parts.length === 2) {
    content = parts[0] + "const igRegex = /(?:https?:\\/\\/)?(?:www\\.)?instagram\\.com\\/(?:[^\\/\\n]+\\/)?(?:p|reel|reels|tv)\\/([a-zA-Z0-9_-]+)/i;" + parts[1].substring(parts[1].indexOf('const igMatch'));
}

// 3. featuresRaw.split('\n')
parts = content.split("const featuresList = featuresRaw ? featuresRaw.split('");
if (parts.length === 2) {
    content = parts[0] + "const featuresList = featuresRaw ? featuresRaw.split('\\n" + parts[1];
}

// 4. defaultValue={editingApp?.features.join('\n')
parts = content.split("defaultValue={editingApp?.features.join('");
if (parts.length === 2) {
    content = parts[0] + "defaultValue={editingApp?.features.join('\\n" + parts[1];
}

// I should check if there are others. Like split('\n') or join('\n')
content = content.replace(/\.split\('(?:\r?\n)'\)/g, ".split('\\n')");
content = content.replace(/\.join\('(?:\r?\n)'\)/g, ".join('\\n')");

// Also there might be others like `\n` in JSX strings.
// Let's just fix these 4 explicitly.

fs.writeFileSync('src/components/AdminPanel.tsx', content);

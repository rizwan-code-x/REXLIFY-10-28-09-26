const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The script replaced literal "\\n" with literal newline.
// I will just fix the specific broken lines based on what I see.

// Fix ytRegex
content = content.replace(/const ytRegex = \/\(\?:https\?:\/\/\)\?\(\?:www\\\.|m\\\.\)\?\(\?:youtube\\\.com\/\(\?:\[\^\\\/(\r?\n)[^]*?\{\d+\}\)\/i;/g, (match) => {
    // wait, simpler approach is just to look for the broken fragments
    return match;
});

// A simpler, targeted string replace!
content = content.replace("const ytRegex = /(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtube\\.com\\/(?:[^\\/\n]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|\\S*?[?&]v=|shorts\\/|live\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/i;", "const ytRegex = /(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtube\\.com\\/(?:[^\\/\\\\n]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|\\S*?[?&]v=|shorts\\/|live\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/i;");

// I'll just write a script that replaces actual newline followed by specific text.

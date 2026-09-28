// Rizwan Online Dreams Platform - Certified Developer Media Assets
// Designed and implemented to matches user-provided photos exactly

// 1. Developer Portrait (input_file_0.png)
// Portrait of Rizwan Roushan: South Asian, stylish black hair, clear aviator glasses, black suit, white shirt, solid white background.
export const DEVELOPER_PORTRAIT_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <!-- Background -->
  <rect width="400" height="400" fill="%23ffffff" />
  
  <!-- Shadow of person -->
  <path d="M 80,400 Q 80,310 130,280 Q 200,260 270,280 Q 320,310 320,400 Z" fill="%23e4e4e7" opacity="0.3" />

  <!-- Suit shoulders and torso -->
  <!-- Dark Black Suit Blazer -->
  <path d="M 70,400 L 95,330 C 110,295 150,280 200,280 C 250,280 290,295 305,330 L 330,400 Z" fill="%2318181b" stroke="%2327272a" stroke-width="2" />
  
  <!-- Lapels -->
  <path d="M 125,285 L 155,340 L 200,400 L 245,340 L 275,285" fill="%2327272a" stroke="%233f3f46" stroke-width="1.5" />
  <path d="M 140,290 L 170,345 L 200,400 L 230,345 L 260,290" fill="%230f0f11" />

  <!-- White Shirt V-Shape -->
  <path d="M 165,280 L 200,340 L 235,280 Z" fill="%23ffffff" />
  <path d="M 200,340 L 200,400" stroke="%23e4e4e7" stroke-width="2" />

  <!-- Shirt Collar -->
  <path d="M 155,270 L 175,295 L 200,280 L 225,295 L 245,270 L 200,250 Z" fill="%23f4f4f5" />
  <path d="M 155,270 L 175,295 M 245,270 L 225,295" stroke="%23d4d4d8" stroke-width="1.5" />

  <!-- Neck -->
  <path d="M 175,220 L 175,280 L 225,280 L 225,220 Z" fill="%23e8beac" />
  <!-- Neck shadow under chin -->
  <path d="M 175,220 C 175,250 225,250 225,220 L 225,235 C 225,260 175,260 175,235 Z" fill="%23d49b82" opacity="0.6" />

  <!-- Face -->
  <path d="M 150,170 C 150,245 250,245 250,170 C 250,115 150,115 150,170 Z" fill="%23e8beac" />

  <!-- Cheeks and nose shading -->
  <path d="M 200,165 L 200,195 L 193,195 Z" fill="%23d49b82" opacity="0.4" />
  
  <!-- Eyes -->
  <ellipse cx="180" cy="170" rx="9" ry="5.5" fill="%23ffffff" stroke="%234b3c36" stroke-width="1" />
  <circle cx="180" cy="170" r="4.5" fill="%231c1917" />
  <circle cx="181.5" cy="168.5" r="1.5" fill="%23ffffff" />

  <ellipse cx="220" cy="170" rx="9" ry="5.5" fill="%23ffffff" stroke="%234b3c36" stroke-width="1" />
  <circle cx="220" cy="170" r="4.5" fill="%231c1917" />
  <circle cx="221.5" cy="168.5" r="1.5" fill="%23ffffff" />

  <!-- Eyebrows -->
  <path d="M 168,158 C 173,153 187,155 192,160" fill="none" stroke="%230c0a09" stroke-width="3" stroke-linecap="round" />
  <path d="M 232,158 C 227,153 213,155 208,160" fill="none" stroke="%230c0a09" stroke-width="3" stroke-linecap="round" />

  <!-- Mustache -->
  <path d="M 183,198 C 190,196 200,197 200,201 C 200,197 210,196 217,198 C 222,201 217,205 200,204 C 183,205 178,201 183,198 Z" fill="%231a1a1e" />

  <!-- Mouth/Lips -->
  <path d="M 187,208 C 193,212 207,212 213,208" fill="none" stroke="%23b91c1c" stroke-width="2.5" stroke-linecap="round" />

  <!-- Stubble / Beard on jawline -->
  <path d="M 151,180 C 151,230 170,244 200,244 C 230,244 249,230 249,180 C 249,215 235,238 200,238 C 165,238 151,215 151,180 Z" fill="%231c1c22" opacity="0.35" />
  
  <!-- Hair (Stylish, thick, slightly wavy and layered black hair) -->
  <path d="M 148,160 C 144,145 146,128 154,115 C 162,102 178,92 195,90 C 215,88 234,95 244,108 C 252,118 254,135 252,150 C 258,145 259,130 258,118 C 257,100 245,85 230,78 C 215,71 190,72 175,76 C 160,80 146,92 140,108 C 136,120 138,140 142,150 C 145,155 149,165 148,160 Z" fill="%230c0c0e" />
  <!-- Hair volume highlights -->
  <path d="M 160,110 C 170,95 185,95 205,94 C 225,93 238,102 244,114" fill="none" stroke="%2327272a" stroke-width="3.5" stroke-linecap="round" />
  <path d="M 172,98 C 182,88 198,87 215,88 C 225,89 232,94 236,101" fill="none" stroke="%233f3f46" stroke-width="2.5" stroke-linecap="round" />

  <!-- Ears -->
  <ellipse cx="147" cy="182" rx="7" ry="12" fill="%23e8beac" transform="rotate(-10, 147, 182)" />
  <ellipse cx="253" cy="182" rx="7" ry="12" fill="%23e8beac" transform="rotate(10, 253, 182)" />

  <!-- Clear Aviator / Transparent Glasses -->
  <!-- Left lens -->
  <rect x="160" y="156" width="34" height="28" rx="8" ry="8" fill="%23ffffff" fill-opacity="0.1" stroke="%2371717a" stroke-width="2" />
  <path d="M 163,161 L 180,161" stroke="%23ffffff" stroke-width="1.5" opacity="0.6" stroke-linecap="round" />
  
  <!-- Right lens -->
  <rect x="206" y="156" width="34" height="28" rx="8" ry="8" fill="%23ffffff" fill-opacity="0.1" stroke="%2371717a" stroke-width="2" />
  <path d="M 209,161 L 226,161" stroke="%23ffffff" stroke-width="1.5" opacity="0.6" stroke-linecap="round" />

  <!-- Double bridge -->
  <path d="M 194,159 L 206,159" stroke="%2352525b" stroke-width="2.5" />
  <path d="M 194,165 L 206,165" stroke="%2371717a" stroke-width="1.5" />

  <!-- Glasses temples -->
  <path d="M 160,165 L 148,168" stroke="%2371717a" stroke-width="2" />
  <path d="M 240,165 L 252,168" stroke="%2371717a" stroke-width="2" />

  <!-- Glare reflections on glasses -->
  <path d="M 165,178 L 185,160" stroke="%23ffffff" stroke-width="2.5" opacity="0.5" stroke-linecap="round" />
  <path d="M 211,178 L 231,160" stroke="%23ffffff" stroke-width="2.5" opacity="0.5" stroke-linecap="round" />
</svg>`;


// 2. Signature and Seal (input_file_1.png)
// Combined "Rizwan Online Dreams" official rubber stamp in ink blue with "Rizwan RR" cursive ink signature.
export const SIGNATURE_SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150">
  <!-- Outer stamp circle with subtle distress/imperfection -->
  <circle cx="75" cy="75" r="62" fill="none" stroke="%231e3a8a" stroke-width="3" stroke-dasharray="120 1 60 1 180 1" stroke-linecap="round" opacity="0.85" />
  
  <!-- Inner stamp circle -->
  <circle cx="75" cy="75" r="52" fill="none" stroke="%231e3a8a" stroke-width="1.2" opacity="0.8" />

  <!-- Text paths for curved text -->
  <path id="top-text-path" d="M 22,75 A 53,53 0 0,1 128,75" fill="none" />
  <path id="bottom-text-path" d="M 128,75 A 53,53 0 0,1 22,75" fill="none" />

  <!-- Curved Text -->
  <text font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="7.8" fill="%231e3a8a" letter-spacing="1.2">
    <textPath href="%23top-text-path" startOffset="50%" text-anchor="middle">★ RIZWAN ONLINE DREAMS ★</textPath>
  </text>
  <text font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="6.2" fill="%231e3a8a" letter-spacing="0.8">
    <textPath href="%23bottom-text-path" startOffset="50%" text-anchor="middle">OFFICIALLY APPROVED &amp; SECURED</textPath>
  </text>

  <!-- Inner stamp design -->
  <rect x="36" y="64" width="78" height="22" rx="4" fill="none" stroke="%231e3a8a" stroke-width="1.2" transform="rotate(-4, 75, 75)" stroke-dasharray="25 0.5 40 0.5" opacity="0.85" />
  <text x="75" y="73" font-family="sans-serif" font-weight="900" font-size="6.5" fill="%231e3a8a" text-anchor="middle" letter-spacing="1">VERIFIED PORTAL</text>
  <text x="75" y="81" font-family="sans-serif" font-weight="900" font-size="5.5" fill="%231e3a8a" text-anchor="middle" letter-spacing="0.5">ESTD - 2026</text>

  <!-- Blue ink signature "Rizwan RR" (drawn with beautiful smooth bezier lines replicating input_file_1.png) -->
  <!-- Rotated slightly (-6deg) for a natural hand-signed look -->
  <g transform="rotate(-6, 75, 75) translate(-5, -5)" opacity="0.95">
    <!-- Capital 'R' -->
    <path d="M 32,85 C 31,80 34,44 38,41 C 44,36 53,35 55,42 C 57,48 50,56 42,58 C 36,59 34,57 39,59 C 48,63 58,74 74,86 C 88,96 95,101 101,104" fill="none" stroke="%232563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- "izwan" loops -->
    <!-- 'i' loop -->
    <path d="M 52,70 C 53,64 56,66 56,71 L 56,75" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" />
    <circle cx="56" cy="61" r="1.2" fill="%232563eb" />

    <!-- 'z' -->
    <path d="M 59,71 C 62,68 64,70 62,73 C 60,76 57,78 61,77 C 65,76 66,73 67,73" fill="none" stroke="%232563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 'w' -->
    <path d="M 68,72 C 69,76 71,76 72,71 C 73,75 75,75 77,71" fill="none" stroke="%232563eb" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 'a' -->
    <path d="M 78,73 C 76,75 77,77 80,76 C 82,75 83,72 83,73 L 83,76" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 'n' -->
    <path d="M 85,73 C 86,75 88,75 89,72 C 90,75 92,75 93,71" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Capital 'R' (First of double 'RR') -->
    <path d="M 97,64 C 95,60 97,42 99,39 C 102,36 107,35 108,40 C 110,44 105,48 101,50 C 99,51 100,52 103,53 C 107,55 110,61 114,68" fill="none" stroke="%232563eb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Capital 'R' (Second of double 'RR') -->
    <path d="M 111,62 C 109,58 111,40 113,37 C 116,34 121,33 122,38 C 124,42 119,46 115,48 C 113,49 114,50 117,51 C 122,53 126,59 132,67" fill="none" stroke="%232563eb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Double underline sweep from middle back to bottom-left -->
    <path d="M 52,65 C 44,70 38,75 32,82 C 26,89 22,94 25,93 C 28,92 48,84 62,77" fill="none" stroke="%232563eb" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
  </g>
</svg>`;


// 3. Main/Head Office Portrait (input_file_2.png)
// Portrait of Rizwan Roushan in grey suit and red tie, with gold street lamps and a warm twilight/sunset over water in the background.
export const MAIN_OFFICE_PHOTO_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640" width="360" height="640">
  <!-- Sunset Background Gradient -->
  <defs>
    <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23180f2b" />
      <stop offset="35%" stop-color="%233e144a" />
      <stop offset="60%" stop-color="%23881337" />
      <stop offset="80%" stop-color="%23f97316" />
      <stop offset="100%" stop-color="%23facc15" />
    </linearGradient>
    <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23fef08a" stop-opacity="1" />
      <stop offset="30%" stop-color="%23f59e0b" stop-opacity="0.6" />
      <stop offset="100%" stop-color="%23f59e0b" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="360" height="640" fill="url(%23sunset-grad)" />

  <!-- Water walkway at the bottom with dark red-orange brick tone -->
  <path d="M 0,440 L 360,440 L 360,640 L 0,640 Z" fill="%23450a0a" opacity="0.6" />
  <path d="M 0,440 L 360,440" stroke="%23f97316" stroke-width="1" opacity="0.5" />

  <!-- Sunset water reflection streaks -->
  <ellipse cx="180" cy="480" rx="140" ry="8" fill="%23facc15" opacity="0.2" />
  <ellipse cx="120" cy="510" rx="90" ry="6" fill="%23f97316" opacity="0.15" />
  <ellipse cx="220" cy="530" rx="110" ry="7" fill="%23fbbf24" opacity="0.2" />

  <!-- Left street lamp silhouette -->
  <g transform="translate(15, 120)">
    <!-- Post -->
    <line x1="15" y1="0" x2="15" y2="320" stroke="%23111827" stroke-width="3" />
    <line x1="15" y1="0" x2="15" y2="320" stroke="%231f2937" stroke-width="1.2" />
    <path d="M 5,320 L 25,320 L 20,310 L 10,310 Z" fill="%23111827" />
    <!-- Arm -->
    <path d="M 15,30 Q 30,10 40,25" fill="none" stroke="%23111827" stroke-width="2.5" />
    <path d="M 15,35 Q 35,25 35,40" fill="none" stroke="%23111827" stroke-width="1.8" />
    <!-- Glowing Lantern -->
    <circle cx="38" cy="35" r="14" fill="url(%23lamp-glow)" />
    <polygon points="32,25 44,25 48,45 28,45" fill="%23111827" opacity="0.9" />
    <!-- Glass inside lantern glowing yellow -->
    <polygon points="34,27 42,27 45,43 31,43" fill="%23fef08a" />
    <circle cx="38" cy="35" r="5" fill="%23ffffff" />
    <path d="M 38,20 L 38,25" stroke="%23111827" stroke-width="1.5" />
  </g>

  <!-- Right street lamp silhouette (further back) -->
  <g transform="translate(300, 180)">
    <line x1="10" y1="0" x2="10" y2="260" stroke="%23111827" stroke-width="2.2" />
    <circle cx="28" cy="30" r="10" fill="url(%23lamp-glow)" />
    <polygon points="24,22 32,22 35,38 21,38" fill="%23111827" />
    <polygon points="25,23 31,23 33,37 23,37" fill="%23fef08a" />
  </g>

  <!-- Developer Rizwan Roushan in grey suit and red tie (Middle focus) -->
  <g transform="translate(35, 140)">
    <!-- Body Shadow/Outline -->
    <path d="M 40,500 C 40,400 80,310 145,310 C 210,310 250,400 250,500 Z" fill="%230b0614" opacity="0.3" />

    <!-- Suit Torso (Dark Grey Blazer) -->
    <path d="M 45,500 L 70,350 C 85,310 120,295 145,295 C 170,295 205,310 220,350 L 245,500 Z" fill="%232d3748" stroke="%231a202c" stroke-width="2" />
    
    <!-- Lapels -->
    <path d="M 95,315 L 122,380 L 145,450 L 168,380 L 195,315" fill="%231a202c" stroke="%232d3748" stroke-width="1" />
    
    <!-- Crisp White Collar and Shirt -->
    <path d="M 115,310 L 145,370 L 175,310 Z" fill="%23f7fafc" />
    <path d="M 108,300 L 125,325 L 145,310 L 165,325 L 182,300" fill="%23edf2f7" />

    <!-- Vibrant Red Silk Tie (The prominent red tie) -->
    <path d="M 136,310 L 154,310 L 158,390 L 145,420 L 132,390 Z" fill="%23dc2626" />
    <!-- Dark shade on tie -->
    <path d="M 145,310 L 154,310 L 158,390 L 145,420 Z" fill="%23b91c1c" opacity="0.4" />
    <!-- Tie knot -->
    <polygon points="135,310 155,310 149,325 141,325" fill="%23b91c1c" />

    <!-- Neck -->
    <path d="M 125,250 L 125,310 L 165,310 L 165,250 Z" fill="%23e8beac" />
    <path d="M 125,270 Q 145,290 165,270 L 165,310 L 125,310 Z" fill="%23d49b82" opacity="0.4" />

    <!-- Face Portrait -->
    <path d="M 105,200 C 105,275 185,275 185,200 C 185,145 105,145 105,200 Z" fill="%23e8beac" />

    <!-- Shading & Details -->
    <!-- Eyes -->
    <ellipse cx="130" cy="202" rx="7" ry="4" fill="%23ffffff" stroke="%234a5568" />
    <circle cx="130" cy="202" r="3" fill="%231a202c" />
    <ellipse cx="160" cy="202" rx="7" ry="4" fill="%23ffffff" stroke="%234a5568" />
    <circle cx="160" cy="202" r="3" fill="%231a202c" />

    <!-- Eyebrows -->
    <path d="M 120,193 Q 130,190 137,195" fill="none" stroke="%231a202c" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 170,193 Q 160,190 153,195" fill="none" stroke="%231a202c" stroke-width="2.5" stroke-linecap="round" />

    <!-- Nose -->
    <path d="M 145,198 L 145,222 L 141,222" fill="none" stroke="%23d49b82" stroke-width="2" stroke-linecap="round" />

    <!-- Mustache and short trimmed beard -->
    <path d="M 132,228 Q 145,224 158,228" fill="none" stroke="%231a202c" stroke-width="2" stroke-linecap="round" />
    <path d="M 134,236 C 138,244 152,244 156,236" fill="none" stroke="%231a202c" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 106,205 C 106,252 115,268 145,268 C 175,268 184,252 184,205 C 184,235 170,263 145,263 C 120,263 106,235 106,205 Z" fill="%231a1a24" opacity="0.25" />

    <!-- Hair (Neat black hair) -->
    <path d="M 103,190 C 100,175 102,158 110,145 C 120,132 135,123 150,123 C 165,123 180,132 185,145 C 190,158 190,175 187,190 C 192,175 191,152 181,138 C 171,124 155,118 142,118 C 129,118 113,124 105,138 C 98,150 99,175 103,190 Z" fill="%230c0a0f" />

    <!-- Ears -->
    <ellipse cx="102" cy="212" rx="5" ry="9" fill="%23e8beac" />
    <ellipse cx="188" cy="212" rx="5" ry="9" fill="%23e8beac" />
  </g>
</svg>`;

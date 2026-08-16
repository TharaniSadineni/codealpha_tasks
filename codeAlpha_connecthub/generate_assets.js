const fs = require('fs');
const path = require('path');

const avatarsDir = path.join(__dirname, 'public', 'images', 'avatars');
const postsDir = path.join(__dirname, 'public', 'images', 'posts');

if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

// Avatar Colors
const avatarColors = [
  ['#6366F1', '#8B5CF6'], // Indigo -> Violet
  ['#EC4899', '#8B5CF6'], // Rose -> Violet
  ['#10B981', '#3B82F6'], // Emerald -> Blue
  ['#F59E0B', '#EF4444'], // Amber -> Red
  ['#06B6D4', '#3B82F6'], // Cyan -> Blue
  ['#8B5CF6', '#D946EF'], // Violet -> Fuchsia
  ['#14B8A6', '#06B6D4'], // Teal -> Cyan
  ['#F43F5E', '#FB923C'], // Rose -> Orange
  ['#6366F1', '#D946EF'], // Indigo -> Fuchsia
  ['#059669', '#10B981']  // Emerald
];

const names = ['Alex', 'Sarah', 'David', 'Emma', 'Michael', 'Olivia', 'James', 'Sophia', 'Daniel', 'Emily'];

// 1. Generate 10 Valid SVG Avatars
names.forEach((name, idx) => {
  const [c1, c2] = avatarColors[idx % avatarColors.length];
  const initial = name.charAt(0);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="avatarGrad${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="60" fill="url(#avatarGrad${idx})" />
  <circle cx="60" cy="44" r="22" fill="#ffffff" opacity="0.95" />
  <path d="M 24 102 C 24 74, 96 74, 96 102 Z" fill="#ffffff" opacity="0.95" />
  <text x="60" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="${c1}" text-anchor="middle">${initial}</text>
</svg>`;
  fs.writeFileSync(path.join(avatarsDir, `avatar${idx + 1}.svg`), svg, 'utf8');
});

// 2. Generate 8 Pure Abstract Vector Illustration SVGs (NO TEXT INSIDE SVGs)
const postIllustrations = [
  // Post 1: Tech & Code Illustration (Laptop + Grid)
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
    <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg1)" />
  <!-- Abstract Decorative Geometry -->
  <circle cx="700" cy="100" r="180" fill="#ffffff" opacity="0.08" />
  <circle cx="100" cy="420" r="220" fill="#ffffff" opacity="0.05" />
  <path d="M-50 200 Q 200 100 400 250 T 850 150" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2" />
  <path d="M-50 240 Q 200 140 400 290 T 850 190" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.15" />
  <!-- Center Glassmorphism Backdrop Card -->
  <rect x="220" y="90" width="360" height="320" rx="24" fill="url(#cardGrad1)" stroke="#ffffff" stroke-width="1.5" opacity="0.9" />
  <!-- Laptop Vector Graphic -->
  <g transform="translate(260, 140)">
    <rect x="50" y="40" width="180" height="115" rx="8" fill="#1E1B4B" stroke="#ffffff" stroke-width="3" />
    <rect x="62" y="52" width="156" height="91" rx="4" fill="#312E81" />
    <!-- Code Snippet Lines -->
    <rect x="75" y="65" width="40" height="6" rx="3" fill="#6366F1" />
    <rect x="122" y="65" width="60" height="6" rx="3" fill="#EC4899" />
    <rect x="75" y="80" width="80" height="6" rx="3" fill="#10B981" />
    <rect x="75" y="95" width="55" height="6" rx="3" fill="#F59E0B" />
    <rect x="137" y="95" width="45" height="6" rx="3" fill="#3B82F6" />
    <rect x="75" y="110" width="90" height="6" rx="3" fill="#8B5CF6" />
    <!-- Laptop Base -->
    <path d="M20 160 H260 L275 178 H5 Z" fill="#ffffff" opacity="0.9" />
    <rect x="120" y="162" width="40" height="4" rx="2" fill="#94A3B8" />
  </g>
</svg>`,

  // Post 2: Coffee & Workspace Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg2)" />
  <circle cx="400" cy="250" r="210" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.1" stroke-dasharray="10 10" />
  <circle cx="400" cy="250" r="160" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.15" />
  <!-- Floating Steam Waves -->
  <path d="M370 120 Q380 90 370 60" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" opacity="0.6" />
  <path d="M400 110 Q410 80 400 50" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  <path d="M430 120 Q440 90 430 60" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" opacity="0.6" />
  <!-- Coffee Mug Vector Graphic -->
  <g transform="translate(280, 150)">
    <rect x="40" y="40" width="140" height="150" rx="24" fill="#1E293B" stroke="#38BDF8" stroke-width="4" />
    <path d="M180 70 C220 70 220 140 180 140" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" />
    <ellipse cx="110" cy="40" rx="70" ry="12" fill="#38BDF8" opacity="0.3" />
    <!-- Coaster Base -->
    <rect x="20" y="195" width="180" height="10" rx="5" fill="#38BDF8" opacity="0.8" />
  </g>
</svg>`,

  // Post 3: UI/UX Design & Palette Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg3)" />
  <circle cx="200" cy="150" r="140" fill="#ffffff" opacity="0.1" />
  <circle cx="650" cy="380" r="180" fill="#ffffff" opacity="0.08" />
  <!-- Design Palette Vector Graphic -->
  <g transform="translate(250, 100)">
    <path d="M150 40 C60 40 10 110 10 190 C10 270 70 320 150 320 C180 320 200 300 200 280 C200 265 190 250 190 235 C190 220 205 210 220 210 H250 C280 210 300 180 300 140 C300 80 230 40 150 40 Z" fill="#ffffff" opacity="0.9" />
    <circle cx="80" cy="120" r="22" fill="#EC4899" />
    <circle cx="150" cy="90" r="22" fill="#8B5CF6" />
    <circle cx="220" cy="120" r="22" fill="#3B82F6" />
    <circle cx="90" cy="200" r="22" fill="#10B981" />
    <circle cx="120" cy="260" r="20" fill="#F59E0B" />
  </g>
</svg>`,

  // Post 4: Database & Lightning Speed Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg4)" />
  <polygon points="100,50 300,450 250,480 50,80" fill="#ffffff" opacity="0.05" />
  <polygon points="500,20 750,400 700,430 450,50" fill="#ffffff" opacity="0.05" />
  <!-- Database Stack Vector Graphic -->
  <g transform="translate(300, 110)">
    <!-- Top Cylinder -->
    <ellipse cx="100" cy="40" rx="90" ry="30" fill="#ffffff" opacity="0.95" />
    <path d="M10 40 V90 C10 106 50 120 100 120 C150 120 190 106 190 90 V40 Z" fill="#34D399" opacity="0.8" />
    <ellipse cx="100" cy="40" rx="70" ry="20" fill="#064E3B" opacity="0.2" />
    <!-- Middle Cylinder -->
    <path d="M10 110 V160 C10 176 50 190 100 190 C150 190 190 176 190 160 V110 Z" fill="#ffffff" opacity="0.9" />
    <!-- Bottom Cylinder -->
    <path d="M10 180 V230 C10 246 50 260 100 260 C150 260 190 246 190 230 V180 Z" fill="#34D399" opacity="0.9" />
    <!-- Floating Lightning Bolt Overlay -->
    <polygon points="140,80 80,180 120,180 90,260 170,140 130,140" fill="#F59E0B" />
  </g>
</svg>`,

  // Post 5: Sunset Horizon & Mountain Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E" />
      <stop offset="100%" stop-color="#FB923C" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg5)" />
  <!-- Sun Disk -->
  <circle cx="400" cy="220" r="110" fill="#FEF08A" opacity="0.9" />
  <circle cx="400" cy="220" r="140" fill="#FEF08A" opacity="0.2" />
  <!-- Mountain Silhouettes -->
  <path d="M50 420 L280 200 L420 320 L580 180 L750 420 Z" fill="#881337" opacity="0.7" />
  <path d="M-20 450 L180 260 L320 370 L520 220 L820 450 Z" fill="#4C0519" />
  <!-- Sun Rays -->
  <line x1="400" y1="50" x2="400" y2="80" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity="0.6" />
  <line x1="260" y1="100" x2="285" y2="125" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity="0.6" />
  <line x1="540" y1="100" x2="515" y2="125" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity="0.6" />
</svg>`,

  // Post 6: Hackathon & Launch Rocket Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#D946EF" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg6)" />
  <!-- Orbital Rings -->
  <ellipse cx="400" cy="260" rx="300" ry="100" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2" transform="rotate(-20 400 260)" />
  <ellipse cx="400" cy="260" rx="220" ry="70" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.3" transform="rotate(15 400 260)" />
  <!-- Rocket Vector Graphic -->
  <g transform="translate(330, 100)">
    <!-- Rocket Body -->
    <path d="M70 20 C120 70 120 180 100 220 H40 C20 180 20 70 70 20 Z" fill="#ffffff" />
    <!-- Nose Cone -->
    <path d="M70 20 C95 45 95 80 70 80 C45 80 45 45 70 20 Z" fill="#EF4444" />
    <!-- Porthole Window -->
    <circle cx="70" cy="120" r="18" fill="#3B82F6" stroke="#ffffff" stroke-width="4" />
    <!-- Fins -->
    <path d="M35 180 L5 230 H40 Z" fill="#F59E0B" />
    <path d="M105 180 L135 230 H100 Z" fill="#F59E0B" />
    <!-- Exhaust Flames -->
    <polygon points="50,220 70,280 90,220" fill="#F97316" />
    <polygon points="60,220 70,260 80,220" fill="#FACC15" />
  </g>
</svg>`,

  // Post 7: Milestone & Golden Trophy Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg7)" />
  <!-- Radiant Sunburst Particles -->
  <circle cx="400" cy="220" r="180" fill="#ffffff" opacity="0.1" />
  <circle cx="400" cy="220" r="130" fill="#ffffff" opacity="0.15" />
  <!-- Confetti Polygons -->
  <rect x="180" y="100" width="16" height="16" rx="3" fill="#F43F5E" transform="rotate(25 180 100)" />
  <rect x="620" y="140" width="18" height="18" rx="3" fill="#10B981" transform="rotate(-15 620 140)" />
  <rect x="220" y="340" width="14" height="14" rx="3" fill="#F59E0B" transform="rotate(45 220 340)" />
  <rect x="600" y="320" width="16" height="16" rx="3" fill="#EC4899" transform="rotate(30 600 320)" />
  <!-- Trophy Vector Graphic -->
  <g transform="translate(270, 90)">
    <!-- Cup Bowl -->
    <path d="M50 40 H210 V140 C210 190 170 220 130 220 C90 220 50 190 50 140 Z" fill="url(#goldGrad)" />
    <!-- Handles -->
    <path d="M50 60 H20 C10 60 10 120 50 120" fill="none" stroke="#FBBF24" stroke-width="10" stroke-linecap="round" />
    <path d="M210 60 H240 C250 60 250 120 210 120" fill="none" stroke="#FBBF24" stroke-width="10" stroke-linecap="round" />
    <!-- Stem & Base -->
    <rect x="115" y="220" width="30" height="50" fill="#D97706" />
    <rect x="75" y="270" width="110" height="30" rx="6" fill="#1E293B" />
    <!-- Star on Trophy -->
    <polygon points="130,90 137,110 158,110 141,123 147,143 130,130 113,143 119,123 102,110 123,110" fill="#ffffff" />
  </g>
</svg>`,

  // Post 8: Inspiration & 3D Star Emblem Illustration
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EF4444" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="20" fill="url(#bg8)" />
  <circle cx="400" cy="250" r="200" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.2" stroke-dasharray="15 15" />
  <circle cx="400" cy="250" r="140" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3" />
  <!-- Center Star Emblem Graphic -->
  <g transform="translate(250, 100)">
    <polygon points="150,20 185,110 280,110 202,165 232,255 150,200 68,255 98,165 20,110 115,110" fill="#ffffff" opacity="0.95" />
    <polygon points="150,50 174,115 240,115 186,155 207,220 150,180 93,220 114,155 60,115 126,115" fill="#FEF08A" />
  </g>
</svg>`
];

// Save the 8 pure abstract vector illustration SVGs
postIllustrations.forEach((svgContent, idx) => {
  fs.writeFileSync(path.join(postsDir, `post${idx + 1}.svg`), svgContent, 'utf8');
});

console.log('Successfully generated pure abstract vector illustrations for all posts (NO text inside SVGs)!');

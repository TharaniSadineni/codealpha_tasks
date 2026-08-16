const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const postsDir = path.join(__dirname, 'public', 'images', 'posts');
const avatarsDir = path.join(__dirname, 'public', 'images', 'avatars');

if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// CRC32 implementation for PNG Chunk validation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function createPNG(width, height, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 2; // RGB color type
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with 0 byte filter per row
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 3;
      rawData[pxOffset] = Math.max(0, Math.min(255, Math.floor(r)));
      rawData[pxOffset + 1] = Math.max(0, Math.min(255, Math.floor(g)));
      rawData[pxOffset + 2] = Math.max(0, Math.min(255, Math.floor(b)));
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Color Interpolation Helper
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// 1. Generate 8 High-Quality Post PNGs (600x375)
const postThemes = [
  // 1: Indigo-Violet Cyber Tech
  { c1: '#6366F1', c2: '#8B5CF6', pattern: 'grid' },
  // 2: Dark Slate Coffee & Code
  { c1: '#0F172A', c2: '#334155', pattern: 'circles' },
  // 3: Sunset Rose UI/UX Design
  { c1: '#EC4899', c2: '#8B5CF6', pattern: 'waves' },
  // 4: Emerald Backend & Data
  { c1: '#059669', c2: '#10B981', pattern: 'diagonal' },
  // 5: Coral & Orange Horizon Vibe
  { c1: '#F43F5E', c2: '#FB923C', pattern: 'sun' },
  // 6: Deep Purple Hackathon Rocket
  { c1: '#7C3AED', c2: '#D946EF', pattern: 'stars' },
  // 7: Electric Cyan Milestone Trophy
  { c1: '#06B6D4', c2: '#3B82F6', pattern: 'rays' },
  // 8: Warm Amber Star Horizon
  { c1: '#F59E0B', c2: '#EF4444', pattern: 'diamonds' }
];

console.log('Generating 8 high-quality PNG post images...');

postThemes.forEach((theme, idx) => {
  const [r1, g1, b1] = hexToRgb(theme.c1);
  const [r2, g2, b2] = hexToRgb(theme.c2);

  const pngBuffer = createPNG(600, 375, (x, y, w, h) => {
    // Base Diagonal Gradient
    const t = (x / w + y / h) / 2;
    let r = lerp(r1, r2, t);
    let g = lerp(g1, g2, t);
    let b = lerp(b1, b2, t);

    // Decorative Geometric Patterns
    const cx = w / 2;
    const cy = h / 2;
    const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    if (theme.pattern === 'circles') {
      if (Math.abs(distFromCenter - 100) < 4 || Math.abs(distFromCenter - 150) < 3) {
        r += 50; g += 50; b += 50;
      }
    } else if (theme.pattern === 'grid') {
      if (x % 30 === 0 || y % 30 === 0) {
        r += 35; g += 35; b += 35;
      }
    } else if (theme.pattern === 'waves') {
      const waveY = cy + Math.sin(x / 40) * 40;
      if (Math.abs(y - waveY) < 6) {
        r += 60; g += 60; b += 60;
      }
    } else if (theme.pattern === 'diagonal') {
      if ((x + y) % 40 < 5) {
        r += 40; g += 40; b += 40;
      }
    } else if (theme.pattern === 'sun') {
      if (distFromCenter < 70) {
        r = lerp(r, 254, 0.7);
        g = lerp(g, 240, 0.7);
        b = lerp(b, 138, 0.7);
      }
    } else if (theme.pattern === 'stars') {
      if ((x * 17 + y * 37) % 230 === 0) {
        r = 255; g = 255; b = 255;
      }
    } else if (theme.pattern === 'rays') {
      const angle = Math.atan2(y - cy, x - cx);
      if (Math.sin(angle * 8) > 0.7) {
        r += 40; g += 40; b += 40;
      }
    } else if (theme.pattern === 'diamonds') {
      if ((Math.abs(x - cx) + Math.abs(y - cy)) % 50 < 6) {
        r += 50; g += 50; b += 50;
      }
    }

    // Glassmorphism Center Frame Card Accent
    if (Math.abs(x - cx) < 160 && Math.abs(y - cy) < 90) {
      r = lerp(r, 255, 0.22);
      g = lerp(g, 255, 0.22);
      b = lerp(b, 255, 0.22);
    }
    // Border highlight around center frame
    if ((Math.abs(x - cx) === 160 && Math.abs(y - cy) <= 90) || (Math.abs(y - cy) === 90 && Math.abs(x - cx) <= 160)) {
      r = 255; g = 255; b = 255;
    }

    return [r, g, b];
  });

  const filePath = path.join(postsDir, `post${idx + 1}.png`);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Saved ${filePath} (${pngBuffer.length} bytes)`);
});

// 2. Generate 10 Avatar PNGs (120x120)
const avatarColors = [
  ['#6366F1', '#8B5CF6'],
  ['#EC4899', '#8B5CF6'],
  ['#10B981', '#3B82F6'],
  ['#F59E0B', '#EF4444'],
  ['#06B6D4', '#3B82F6'],
  ['#8B5CF6', '#D946EF'],
  ['#14B8A6', '#06B6D4'],
  ['#F43F5E', '#FB923C'],
  ['#6366F1', '#D946EF'],
  ['#059669', '#10B981']
];

console.log('Generating 10 PNG avatar images...');

avatarColors.forEach((cols, idx) => {
  const [r1, g1, b1] = hexToRgb(cols[0]);
  const [r2, g2, b2] = hexToRgb(cols[1]);

  const pngBuffer = createPNG(120, 120, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    const t = (x / w + y / h) / 2;
    let r = lerp(r1, r2, t);
    let g = lerp(g1, g2, t);
    let b = lerp(b1, b2, t);

    // Head circle
    const headDist = Math.sqrt((x - cx) ** 2 + (y - 44) ** 2);
    if (headDist < 22) {
      r = 255; g = 255; b = 255;
    }

    // Body arc
    if (y >= 74 && Math.abs(x - cx) < (y - 70) * 1.5 && dist < 58) {
      r = 255; g = 255; b = 255;
    }

    // Circle border ring
    if (Math.abs(dist - 58) < 2) {
      r = 255; g = 255; b = 255;
    }

    return [r, g, b];
  });

  const filePath = path.join(avatarsDir, `avatar${idx + 1}.png`);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Saved ${filePath} (${pngBuffer.length} bytes)`);
});

console.log('\n==================================================');
console.log('✅ ALL LOCAL PNG POST & AVATAR IMAGES GENERATED!');
console.log('==================================================');

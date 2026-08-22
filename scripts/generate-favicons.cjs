const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Crisp vector SVG with #047857 background and pure white bold 'SK' text
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#047857" />
  <text 
    x="256" 
    y="266" 
    text-anchor="middle" 
    dominant-baseline="central"
    fill="#ffffff" 
    font-family="Arial, 'Helvetica Neue', Helvetica, -apple-system, BlinkMacSystemFont, sans-serif" 
    font-size="280" 
    font-weight="900"
    letter-spacing="-10"
  >SK</text>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

async function buildFavicons() {
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  console.log('Saved public/favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-144x144.png', size: 144 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const s of sizes) {
    await sharp(svgBuffer)
      .resize(s.size, s.size)
      .png()
      .toFile(path.join(publicDir, s.name));
    console.log(`Generated ${s.name} (${s.size}x${s.size})`);
  }

  // Create standard multi-resolution ICO file (16x16, 32x32, 48x48)
  const p16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const p32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const p48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const pngImages = [
    { width: 16, height: 16, buffer: p16 },
    { width: 32, height: 32, buffer: p32 },
    { width: 48, height: 48, buffer: p48 }
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type (1 = icon)
  header.writeUInt16LE(pngImages.length, 4); // count of images

  let offset = 6 + (16 * pngImages.length);
  const dirEntries = [];

  for (const img of pngImages) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset in file
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...dirEntries,
    ...pngImages.map(img => img.buffer)
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Successfully written public/favicon.ico (Multi-size ICO containing 16x16, 32x32, 48x48 frames)');
}

buildFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});

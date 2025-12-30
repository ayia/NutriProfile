/**
 * Generate PWA icons from logo.svg
 * Run with: node scripts/generate-pwa-icons.js
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const sizes = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

async function generateIcons() {
  const svgPath = join(publicDir, 'logo.svg');

  console.log('Generating PWA icons from logo.svg...\n');

  for (const { name, size } of sizes) {
    const outputPath = join(publicDir, name);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created ${name} (${size}x${size})`);
  }

  // Generate maskable icon with padding (safe zone)
  const maskableSize = 512;
  const iconSize = Math.floor(maskableSize * 0.8); // 80% of total size for safe zone
  const padding = Math.floor((maskableSize - iconSize) / 2);

  // Create maskable icon with background
  const svgBuffer = await sharp(svgPath)
    .resize(iconSize, iconSize)
    .toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 16, g: 185, b: 129, alpha: 1 } // #10B981 emerald-500
    }
  })
    .composite([{
      input: svgBuffer,
      top: padding,
      left: padding
    }])
    .png()
    .toFile(join(publicDir, 'maskable-icon-512x512.png'));

  console.log(`  Created maskable-icon-512x512.png (512x512 with safe zone)`);

  console.log('\nDone! PWA icons generated successfully.');
}

generateIcons().catch(console.error);

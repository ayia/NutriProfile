import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../public/logo.png');
const outputDir = join(__dirname, '../public');

const sizes = [
  { size: 192, name: 'logo-192.png' },
  { size: 512, name: 'logo-512.png' },
];

async function generateIcons() {
  for (const { size, name } of sizes) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(join(outputDir, name));

    console.log(`Generated ${name} (${size}x${size})`);
  }

  console.log('PWA icons generated successfully!');
}

generateIcons().catch(console.error);

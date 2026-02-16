const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = 'checkapi-logo.jpg';
const outputDir = '../../frontend/public';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('🎨 Generating favicons from checkapi-logo.jpg...\n');

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (using 32x32 as base)
  const icoPath = path.join(outputDir, 'favicon.ico');
  await sharp(sourceImage)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile(icoPath);
  
  console.log(`✓ Generated favicon.ico (32x32)`);

  console.log('\n✅ All favicons generated successfully!');
  console.log(`📁 Output directory: ${path.resolve(outputDir)}`);
}

generateFavicons().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

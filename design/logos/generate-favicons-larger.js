const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = 'checkapi-logo.jpg';
const outputDir = '../../frontend/public';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true);
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
  console.log('🎨 Generating LARGER favicons from checkapi-logo.jpg...\n');

  // First, load and trim the source image
  let trimmedBuffer = await sharp(sourceImage)
    .trim()
    .toBuffer();

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    
    // Use 85% of canvas for logo (more visible)
    const logoSize = Math.floor(size * 0.85);
    const padding = Math.floor((size - logoSize) / 2);
    
    // Resize logo
    const resizedLogo = await sharp(trimmedBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();
    
    // Create canvas and composite
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 }
      }
    })
    .composite([{
      input: resizedLogo,
      top: padding,
      left: padding
    }])
    .png()
    .toFile(outputPath);
    
    console.log(`✓ Generated ${name} (${size}x${size}) - logo at 85% size`);
  }

  // Generate favicon.ico
  const icoPath = path.join(outputDir, 'favicon.ico');
  const logoSize = Math.floor(32 * 0.85);
  const padding = Math.floor((32 - logoSize) / 2);
  
  const resizedLogo = await sharp(trimmedBuffer)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();
  
  await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 }
    }
  })
  .composite([{
    input: resizedLogo,
    top: padding,
    left: padding
  }])
  .toFile(icoPath);
  
  console.log(`✓ Generated favicon.ico (32x32 with larger logo)`);

  console.log('\n✅ All favicons regenerated with LARGER, more visible logos!');
  console.log(`📁 Output directory: ${path.resolve(outputDir)}`);
  console.log('🔍 Logo now takes 85% of canvas for better visibility');
}

generateFavicons().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

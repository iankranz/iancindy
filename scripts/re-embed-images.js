/**
 * Script to re-embed optimized images back into SVGs as base64
 * This ensures SVGs are self-contained while still being optimized
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OPTIMIZED_DIR = path.join(__dirname, '../public/images/optimized');

function getImageAsBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  let mimeType;
  
  if (ext === '.webp') {
    mimeType = 'image/webp';
  } else if (ext === '.png') {
    mimeType = 'image/png';
  } else if (ext === '.jpg' || ext === '.jpeg') {
    mimeType = 'image/jpeg';
  } else {
    throw new Error(`Unsupported image format: ${ext}`);
  }
  
  const base64 = imageBuffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

function reEmbedImages(svgPath) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const fileName = path.basename(svgPath, '.svg');
  
  // Find all external image references
  const imageRefRegex = /xlink:href="\/images\/optimized\/([^"]+)"/g;
  let match;
  let updatedContent = svgContent;
  let updated = false;
  
  while ((match = imageRefRegex.exec(svgContent)) !== null) {
    const imageFileName = match[1];
    const imagePath = path.join(OPTIMIZED_DIR, imageFileName);
    
    if (fs.existsSync(imagePath)) {
      try {
        const base64Data = getImageAsBase64(imagePath);
        const oldRef = match[0];
        const newRef = `xlink:href="${base64Data}"`;
        updatedContent = updatedContent.replace(oldRef, newRef);
        updated = true;
        console.log(`  ✅ Re-embedded ${imageFileName}`);
      } catch (error) {
        console.error(`  ❌ Error processing ${imageFileName}:`, error.message);
      }
    } else {
      console.log(`  ⚠️  Image not found: ${imageFileName}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync(svgPath, updatedContent);
    const stats = fs.statSync(svgPath);
    console.log(`\n✅ Updated ${fileName}.svg (${(stats.size / 1024).toFixed(1)} KB)\n`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔄 Re-embedding optimized images into SVGs...\n');
  
  const svgFiles = [
    'bandits-background.svg',
    'card-template.svg',
    'kevin-template.svg',
    'kevin.svg',
    'logo.svg',
  ];
  
  let totalUpdated = 0;
  
  svgFiles.forEach(file => {
    const svgPath = path.join(IMAGES_DIR, file);
    if (fs.existsSync(svgPath)) {
      console.log(`Processing ${file}...`);
      if (reEmbedImages(svgPath)) {
        totalUpdated++;
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  });
  
  console.log(`\n✅ Re-embedded images in ${totalUpdated} SVG file(s)`);
  console.log('\nSVGs are now self-contained with optimized embedded images!');
}

main();


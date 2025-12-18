/**
 * Script to optimize SVG files by extracting embedded base64 images
 * and replacing them with external image references
 */

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = path.join(__dirname, '../public/images/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function extractBase64Images(svgContent) {
  const images = [];
  const base64Regex = /data:image\/([^;]+);base64,([^"')]+)/g;
  let match;
  let index = 0;

  while ((match = base64Regex.exec(svgContent)) !== null) {
    const mimeType = match[1];
    const base64Data = match[2];
    const extension = mimeType === 'png' ? 'png' : mimeType === 'jpeg' ? 'jpg' : 'png';
    
    images.push({
      index: index++,
      fullMatch: match[0],
      mimeType,
      base64Data,
      extension,
      buffer: Buffer.from(base64Data, 'base64'),
    });
  }

  return images;
}

function optimizeSVG(svgPath) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const fileName = path.basename(svgPath, '.svg');
  const images = extractBase64Images(svgContent);

  if (images.length === 0) {
    console.log(`No embedded images found in ${fileName}.svg`);
    return;
  }

  console.log(`Found ${images.length} embedded image(s) in ${fileName}.svg`);

  let optimizedContent = svgContent;
  let totalSizeBefore = Buffer.from(svgContent).length;

  images.forEach((img, idx) => {
    const imageFileName = `${fileName}-image-${idx + 1}.${img.extension}`;
    const imagePath = path.join(OUTPUT_DIR, imageFileName);
    
    // Save extracted image
    fs.writeFileSync(imagePath, img.buffer);
    const imageSize = img.buffer.length;
    console.log(`  Extracted ${imageFileName} (${(imageSize / 1024 / 1024).toFixed(2)} MB)`);

    // Replace base64 with external reference
    // Use absolute path from public directory (Next.js serves from /images/)
    const absolutePath = `/images/optimized/${imageFileName}`;
    optimizedContent = optimizedContent.replace(
      img.fullMatch,
      absolutePath
    );
  });

  // Save optimized SVG
  const optimizedPath = path.join(OUTPUT_DIR, `${fileName}.svg`);
  fs.writeFileSync(optimizedPath, optimizedContent);
  
  const totalSizeAfter = Buffer.from(optimizedContent).length;
  const saved = totalSizeBefore - totalSizeAfter;
  const savedPercent = ((saved / totalSizeBefore) * 100).toFixed(1);

  console.log(`\n${fileName}.svg:`);
  console.log(`  Before: ${(totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  After:  ${(totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Saved:  ${(saved / 1024 / 1024).toFixed(2)} MB (${savedPercent}%)\n`);
}

// Process SVG files
const svgFiles = [
  'card-template.svg',
  'bandits-background.svg',
  'kevin-template.svg',
  'kevin.svg',
  'logo.svg',
];

svgFiles.forEach(file => {
  const filePath = path.join(SVG_DIR, file);
  if (fs.existsSync(filePath)) {
    optimizeSVG(filePath);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('\nDone! Optimized files are in public/images/optimized/');
console.log('Next steps:');
console.log('1. Review the optimized SVGs');
console.log('2. Use an image optimizer (like sharp, imagemin, or online tools) to compress the extracted images');
console.log('3. Replace the original SVGs with the optimized versions');


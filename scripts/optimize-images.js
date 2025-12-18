/**
 * Script to optimize extracted PNG images
 * Converts PNG to WebP and compresses them for better performance
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images/optimized');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  sharp not found. Installing...');
  console.log('   Run: npm install --save-dev sharp');
  console.log('   Then run this script again.\n');
  process.exit(1);
}

async function optimizeImage(imagePath) {
  const fileName = path.basename(imagePath);
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  if (ext !== '.png') {
    console.log(`Skipping ${fileName} (not a PNG)`);
    return;
  }

  const stats = fs.statSync(imagePath);
  const sizeBefore = stats.size;
  
  try {
    // Create WebP version (better compression)
    const webpPath = path.join(path.dirname(imagePath), `${baseName}.webp`);
    await sharp(imagePath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    
    const webpStats = fs.statSync(webpPath);
    const webpSize = webpStats.size;
    const webpSaved = ((sizeBefore - webpSize) / sizeBefore * 100).toFixed(1);
    
    // Also create optimized PNG (fallback)
    const optimizedPngPath = path.join(path.dirname(imagePath), `${baseName}-optimized.png`);
    await sharp(imagePath)
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(optimizedPngPath);
    
    const pngStats = fs.statSync(optimizedPngPath);
    const pngSize = pngStats.size;
    const pngSaved = ((sizeBefore - pngSize) / sizeBefore * 100).toFixed(1);
    
    console.log(`\n${fileName}:`);
    console.log(`  Original: ${(sizeBefore / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  WebP:     ${(webpSize / 1024 / 1024).toFixed(2)} MB (${webpSaved}% smaller) ✅`);
    console.log(`  PNG opt:  ${(pngSize / 1024 / 1024).toFixed(2)} MB (${pngSaved}% smaller)`);
    
    // Keep the smaller format
    if (webpSize < pngSize) {
      // Update SVG to use WebP, keep optimized PNG as fallback
      return { format: 'webp', path: webpPath, size: webpSize };
    } else {
      // Use optimized PNG
      fs.unlinkSync(webpPath);
      return { format: 'png', path: optimizedPngPath, size: pngSize };
    }
  } catch (error) {
    console.error(`Error optimizing ${fileName}:`, error.message);
    return null;
  }
}

async function updateSVGReferences(svgPath, imageUpdates) {
  let svgContent = fs.readFileSync(svgPath, 'utf8');
  let updated = false;
  
  imageUpdates.forEach(({ oldName, newName, format }) => {
    const oldPath = `/images/optimized/${oldName}`;
    const newPath = `/images/optimized/${newName}`;
    
    if (svgContent.includes(oldPath)) {
      svgContent = svgContent.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(svgPath, svgContent);
    console.log(`\n✅ Updated ${path.basename(svgPath)} with optimized image references`);
  }
}

async function main() {
  console.log('🖼️  Optimizing images...\n');
  
  const files = fs.readdirSync(IMAGES_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png') && !f.includes('-optimized'));
  const svgFiles = files.filter(f => f.endsWith('.svg'));
  
  if (pngFiles.length === 0) {
    console.log('No PNG files found to optimize.');
    return;
  }
  
  const imageUpdates = [];
  let totalBefore = 0;
  let totalAfter = 0;
  
  for (const pngFile of pngFiles) {
    const imagePath = path.join(IMAGES_DIR, pngFile);
    const stats = fs.statSync(imagePath);
    totalBefore += stats.size;
    
    const result = await optimizeImage(imagePath);
    if (result) {
      totalAfter += result.size;
      const newName = path.basename(result.path);
      imageUpdates.push({
        oldName: pngFile,
        newName: newName,
        format: result.format
      });
    }
  }
  
  // Update SVG files to reference optimized images
  for (const svgFile of svgFiles) {
    const svgPath = path.join(IMAGES_DIR, svgFile);
    await updateSVGReferences(svgPath, imageUpdates);
  }
  
  const totalSaved = ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1);
  console.log(`\n📊 Summary:`);
  console.log(`   Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   After:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (${totalSaved}%)`);
  console.log(`\n✅ Optimization complete!`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the optimized images in public/images/optimized/`);
  console.log(`2. Test the SVGs to ensure they load correctly`);
  console.log(`3. Replace the original SVGs with the optimized versions`);
}

main().catch(console.error);



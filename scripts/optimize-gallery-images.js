/**
 * Script to optimize gallery images (JPG/JPEG)
 * Converts to WebP and creates optimized versions
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');

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

async function optimizeImage(imagePath, outputDir) {
  const fileName = path.basename(imagePath);
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext);
  
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    console.log(`Skipping ${fileName} (not a supported format)`);
    return null;
  }

  const stats = fs.statSync(imagePath);
  const sizeBefore = stats.size;
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create WebP version (better compression)
    const webpPath = path.join(outputDir, `${baseName}.webp`);
    await sharp(imagePath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    
    const webpStats = fs.statSync(webpPath);
    const webpSize = webpStats.size;
    
    // Also create optimized JPG (fallback)
    const optimizedJpgPath = path.join(outputDir, `${baseName}-optimized.jpg`);
    await sharp(imagePath)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(optimizedJpgPath);
    
    const jpgStats = fs.statSync(optimizedJpgPath);
    const jpgSize = jpgStats.size;
    
    const webpSaved = ((sizeBefore - webpSize) / sizeBefore * 100).toFixed(1);
    const jpgSaved = ((sizeBefore - jpgSize) / sizeBefore * 100).toFixed(1);
    
    console.log(`\n${fileName}:`);
    console.log(`  Original: ${(sizeBefore / 1024).toFixed(2)} KB`);
    console.log(`  WebP:     ${(webpSize / 1024).toFixed(2)} KB (${webpSaved}% smaller) ✅`);
    console.log(`  JPG opt:  ${(jpgSize / 1024).toFixed(2)} KB (${jpgSaved}% smaller)`);
    
    return { 
      original: imagePath,
      webp: webpPath,
      jpg: optimizedJpgPath,
      webpSize,
      jpgSize,
      originalSize: sizeBefore
    };
  } catch (error) {
    console.error(`Error optimizing ${fileName}:`, error.message);
    return null;
  }
}

async function optimizeDirectory(dirPath, outputDir) {
  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log(`No images found in ${path.basename(dirPath)}`);
    return [];
  }

  console.log(`\n📁 Processing ${imageFiles.length} images in ${path.basename(dirPath)}...`);
  
  const results = [];
  let totalBefore = 0;
  let totalAfter = 0;

  for (const imageFile of imageFiles) {
    const imagePath = path.join(dirPath, imageFile);
    const result = await optimizeImage(imagePath, outputDir);
    if (result) {
      totalBefore += result.originalSize;
      totalAfter += result.webpSize; // Use WebP size for comparison
      results.push({
        ...result,
        fileName: imageFile,
        relativePath: path.relative(IMAGES_DIR, result.webp).replace(/\\/g, '/')
      });
    }
  }

  const totalSaved = totalBefore > 0 ? ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1) : 0;
  console.log(`\n📊 ${path.basename(dirPath)} Summary:`);
  console.log(`   Before: ${(totalBefore / 1024).toFixed(2)} KB`);
  console.log(`   After:  ${(totalAfter / 1024).toFixed(2)} KB`);
  console.log(`   Saved:  ${((totalBefore - totalAfter) / 1024).toFixed(2)} KB (${totalSaved}%)`);

  return results;
}

async function main() {
  console.log('🖼️  Optimizing gallery images...\n');
  
  const directories = [
    { input: 'travel', output: 'optimized/travel' },
    { input: 'weddings', output: 'optimized/weddings' },
    { input: 'moving', output: 'optimized/moving' },
    { input: 'nocontext', output: 'optimized/nocontext' },
    { input: 'nyc', output: 'optimized/nyc' },
    { input: 'cindy2025', output: 'optimized/cindy2025' }
  ];

  const allResults = {};

  for (const dir of directories) {
    const inputPath = path.join(IMAGES_DIR, dir.input);
    const outputPath = path.join(IMAGES_DIR, dir.output);
    
    if (fs.existsSync(inputPath)) {
      const results = await optimizeDirectory(inputPath, outputPath);
      allResults[dir.input] = results;
    } else {
      console.log(`\n⚠️  Directory ${dir.input} not found, skipping...`);
    }
  }

  // Handle fin.jpg if it exists
  const finPath = path.join(IMAGES_DIR, 'fin.jpg');
  if (fs.existsSync(finPath)) {
    console.log(`\n📁 Processing fin.jpg...`);
    const finOutput = path.join(IMAGES_DIR, 'optimized');
    const result = await optimizeImage(finPath, finOutput);
    if (result) {
      allResults['fin'] = [{
        ...result,
        fileName: 'fin.jpg',
        relativePath: path.relative(IMAGES_DIR, result.webp).replace(/\\/g, '/')
      }];
    }
  }

  // Handle cindy2025 specific files (housewarming, fin-cindy)
  const cindy2025Dir = path.join(IMAGES_DIR, 'cindy2025');
  if (fs.existsSync(cindy2025Dir)) {
    const cindy2025Output = path.join(IMAGES_DIR, 'optimized/cindy2025');
    
    // Handle housewarming.JPG
    const housewarmingPath = path.join(cindy2025Dir, 'housewarming.JPG');
    if (fs.existsSync(housewarmingPath)) {
      console.log(`\n📁 Processing housewarming.JPG...`);
      const result = await optimizeImage(housewarmingPath, cindy2025Output);
      if (result) {
        if (!allResults.cindy2025) allResults.cindy2025 = [];
        allResults.cindy2025.push({
          ...result,
          fileName: 'housewarming.JPG',
          relativePath: path.relative(IMAGES_DIR, result.webp).replace(/\\/g, '/')
        });
      }
    }
    
    // Handle fin-cindy.JPG
    const finCindyPath = path.join(cindy2025Dir, 'fin-cindy.JPG');
    if (fs.existsSync(finCindyPath)) {
      console.log(`\n📁 Processing fin-cindy.JPG...`);
      const result = await optimizeImage(finCindyPath, cindy2025Output);
      if (result) {
        if (!allResults.cindy2025) allResults.cindy2025 = [];
        allResults.cindy2025.push({
          ...result,
          fileName: 'fin-cindy.JPG',
          relativePath: path.relative(IMAGES_DIR, result.webp).replace(/\\/g, '/')
        });
      }
    }
  }

  console.log(`\n✅ Optimization complete!`);
  console.log(`\nOptimized images are in public/images/optimized/`);
  
  // Generate gallery arrays
  console.log(`\n📝 Gallery arrays to add to page.tsx:\n`);
  
  if (allResults.travel && allResults.travel.length > 0) {
    console.log('const travelGalleryImages: GalleryImage[] = [');
    allResults.travel.forEach((img, idx) => {
      console.log(`  { src: "/images/${img.relativePath}", alt: "Travel photo ${idx + 1}" },`);
    });
    console.log(']');
    console.log('');
  }

  if (allResults.weddings && allResults.weddings.length > 0) {
    console.log('const weddingsGalleryImages: GalleryImage[] = [');
    allResults.weddings.forEach((img, idx) => {
      console.log(`  { src: "/images/${img.relativePath}", alt: "Wedding photo ${idx + 1}" },`);
    });
    console.log(']');
    console.log('');
  }

  if (allResults.moving && allResults.moving.length > 0) {
    console.log('const movingGalleryImages: GalleryImage[] = [');
    allResults.moving.forEach((img, idx) => {
      console.log(`  { src: "/images/${img.relativePath}", alt: "Moving photo ${idx + 1}" },`);
    });
    console.log(']');
    console.log('');
  }

  if (allResults.nyc && allResults.nyc.length > 0) {
    console.log('const nycGalleryImages: GalleryImage[] = [');
    allResults.nyc.forEach((img, idx) => {
      console.log(`  { src: "/images/${img.relativePath}", alt: "NYC photo ${idx + 1}" },`);
    });
    console.log(']');
    console.log('');
  }

  if (allResults.cindy2025 && allResults.cindy2025.length > 0) {
    console.log('// Cindy 2025 images organized by category:');
    console.log('');
    
    // Organize by prefix
    const workImages = allResults.cindy2025.filter(img => img.fileName.startsWith('work'));
    const skiImages = allResults.cindy2025.filter(img => img.fileName.startsWith('ski'));
    const hairImages = allResults.cindy2025.filter(img => img.fileName.startsWith('hair'));
    const peopleImages = allResults.cindy2025.filter(img => img.fileName.startsWith('people'));
    const travelImages = allResults.cindy2025.filter(img => img.fileName.startsWith('travel'));
    const astronautImages = allResults.cindy2025.filter(img => img.fileName.startsWith('astronaut'));
    const bonusImages = allResults.cindy2025.filter(img => img.fileName.startsWith('bonus'));
    
    if (workImages.length > 0) {
      console.log('const jobGalleryImages: GalleryImage[] = [');
      workImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "Work photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
    
    if (skiImages.length > 0) {
      console.log('const hobbiesGalleryImages: GalleryImage[] = [');
      skiImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "Ski photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
    
    if (hairImages.length > 0) {
      console.log('const hairGalleryImages: GalleryImage[] = [');
      hairImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "Hair photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
    
    if (peopleImages.length > 0) {
      console.log('const peopleGalleryImages: GalleryImage[] = [');
      peopleImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "People photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
    
    if (travelImages.length > 0) {
      console.log('const travelGalleryImages: GalleryImage[] = [');
      travelImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "Travel photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
    
    if (astronautImages.length > 0) {
      console.log('const astronautGalleryImages: GalleryImage[] = [');
      astronautImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "Astronaut photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
    
    if (bonusImages.length > 0) {
      console.log('const bonusGalleryImages: GalleryImage[] = [');
      bonusImages.forEach((img, idx) => {
        console.log(`  { src: "/images/${img.relativePath}", alt: "Bonus photo ${idx + 1}" },`);
      });
      console.log(']');
      console.log('');
    }
  }
}

main().catch(console.error);


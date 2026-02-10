import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const MAX_WIDTH = 1920; // Max width for images
const QUALITY = 85; // WebP quality

async function getImageFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await getImageFiles(fullPath, files);
    } else if (IMAGE_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeImage(inputPath) {
  const ext = extname(inputPath);
  const baseName = basename(inputPath, ext);
  const dir = dirname(inputPath);
  const outputPath = join(dir, `${baseName}.webp`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Optimizing: ${inputPath}`);
    console.log(`  Original size: ${(await stat(inputPath)).size / 1024} KB`);
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);

    // Resize if too large
    let pipeline = image;
    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Convert to WebP
    await pipeline
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const outputSize = (await stat(outputPath)).size / 1024;
    const originalSize = (await stat(inputPath)).size / 1024;
    const savings = ((1 - outputSize / originalSize) * 100).toFixed(1);

    console.log(`  ✓ Saved to: ${outputPath}`);
    console.log(`  New size: ${outputSize.toFixed(1)} KB (${savings}% reduction)\n`);

    return { inputPath, outputPath, originalSize, outputSize, savings };
  } catch (error) {
    console.error(`  ✗ Error optimizing ${inputPath}:`, error.message, '\n');
    return null;
  }
}

async function main() {
  const publicDir = join(__dirname, 'public');

  console.log('🖼️  Finding images in public directory...\n');
  const imageFiles = await getImageFiles(publicDir);

  console.log(`Found ${imageFiles.length} images to optimize\n`);
  console.log('=' .repeat(60), '\n');

  const results = [];
  for (const imagePath of imageFiles) {
    const result = await optimizeImage(imagePath);
    if (result) results.push(result);
  }

  console.log('=' .repeat(60));
  console.log('\n📊 Summary:');
  console.log(`Images optimized: ${results.length}`);

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOptimized = results.reduce((sum, r) => sum + r.outputSize, 0);
  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);

  console.log(`Total original size: ${totalOriginal.toFixed(1)} KB`);
  console.log(`Total optimized size: ${totalOptimized.toFixed(1)} KB`);
  console.log(`Total savings: ${(totalOriginal - totalOptimized).toFixed(1)} KB (${totalSavings}%)`);

  console.log('\n⚠️  Next steps:');
  console.log('1. Update image references in your code from .png to .webp');
  console.log('2. Test the images in your application');
  console.log('3. Delete the original .png files if everything works');
}

main().catch(console.error);

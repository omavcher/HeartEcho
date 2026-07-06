import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const targetDirs = ['./public/gifts', './public/gems_store'];

async function compressPNG(filePath) {
  const statsBefore = fs.statSync(filePath);
  const sizeBeforeKB = (statsBefore.size / 1024).toFixed(2);

  const tempPath = filePath + '.tmp';
  
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    await image
      .png({
        palette: true,     
        quality: 85,       
        compressionLevel: 9 
      })
      .toFile(tempPath);

    const statsAfter = fs.statSync(tempPath);
    const sizeAfterKB = (statsAfter.size / 1024).toFixed(2);
    const savingsPercent = ((1 - statsAfter.size / statsBefore.size) * 100).toFixed(1);

    if (statsAfter.size < statsBefore.size) {
      fs.renameSync(tempPath, filePath);
      console.log(`✓ Optimized ${path.basename(filePath)}: ${sizeBeforeKB} KB -> ${sizeAfterKB} KB (-${savingsPercent}%) [${metadata.width}x${metadata.height}]`);
      return { before: statsBefore.size, after: statsAfter.size };
    } else {
      fs.unlinkSync(tempPath);
      console.log(`~ Skipped ${path.basename(filePath)}: Already fully optimized.`);
      return { before: statsBefore.size, after: statsBefore.size };
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    console.error(`✗ Error compressing ${path.basename(filePath)}:`, err);
    return null;
  }
}

async function main() {
  let grandTotalBefore = 0;
  let grandTotalAfter = 0;

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`Directory not found: ${dir}, skipping.`);
      continue;
    }

    const files = fs.readdirSync(dir).filter(file => file.toLowerCase().endsWith('.png'));
    console.log(`\nProcessing directory: ${dir} (${files.length} PNG files)...`);

    let totalBefore = 0;
    let totalAfter = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const result = await compressPNG(filePath);
      if (result) {
        totalBefore += result.before;
        totalAfter += result.after;
      }
    }

    grandTotalBefore += totalBefore;
    grandTotalAfter += totalAfter;
  }

  const totalBeforeMB = (grandTotalBefore / (1024 * 1024)).toFixed(2);
  const totalAfterMB = (grandTotalAfter / (1024 * 1024)).toFixed(2);
  const totalSavings = ((1 - grandTotalAfter / grandTotalBefore) * 100).toFixed(1);
  console.log(`\n===========================================`);
  console.log(`Finished optimization for all directories!`);
  console.log(`Total Size Before: ${totalBeforeMB} MB`);
  console.log(`Total Size After:  ${totalAfterMB} MB`);
  console.log(`Total Space Saved: -${totalSavings}%`);
  console.log(`===========================================`);
}

main().catch(err => console.error(err));

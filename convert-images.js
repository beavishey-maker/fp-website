/**
 * PNG → WebP 変換スクリプト
 * 対象: images/ フォルダ内の全 PNG ファイル
 * 目標: 500KB 以下に圧縮
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'images');
const OUTPUT_DIR = path.join(__dirname, 'images');
const TARGET_SIZE_KB = 500;
const TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024;

// 品質を下げながら目標サイズに収まるまでリトライ
async function convertWithSizeControl(inputPath, outputPath) {
  let quality = 82;
  const minQuality = 20;
  const step = 8;
  let buffer;

  while (quality >= minQuality) {
    buffer = await sharp(inputPath)
      .webp({ quality, effort: 4 })
      .toBuffer();

    if (buffer.length <= TARGET_SIZE_BYTES) break;
    quality -= step;
  }

  // 最終手段: リサイズ（幅を最大1920pxに制限）
  if (buffer.length > TARGET_SIZE_BYTES) {
    const meta = await sharp(inputPath).metadata();
    let width = Math.min(meta.width, 1920);

    while (buffer.length > TARGET_SIZE_BYTES && width >= 800) {
      buffer = await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer();
      width = Math.floor(width * 0.85);
    }
  }

  fs.writeFileSync(outputPath, buffer);
  return { quality, sizeKB: Math.round(buffer.length / 1024) };
}

async function main() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.png'));

  if (files.length === 0) {
    console.log('PNG ファイルが見つかりませんでした。');
    return;
  }

  console.log(`\n変換対象: ${files.length} ファイル\n${'─'.repeat(60)}`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const baseName = path.basename(file, '.png');
    const outputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

    const beforeBytes = fs.statSync(inputPath).size;
    totalBefore += beforeBytes;

    process.stdout.write(`変換中: ${file} ... `);

    try {
      const { quality, sizeKB } = await convertWithSizeControl(inputPath, outputPath);
      const beforeKB = Math.round(beforeBytes / 1024);
      const reduction = Math.round((1 - sizeKB / beforeKB) * 100);
      totalAfter += sizeKB * 1024;

      console.log(`完了`);
      console.log(`  ${beforeKB} KB → ${sizeKB} KB  (${reduction}% 削減, 品質: ${quality})`);
      console.log(`  出力: ${path.basename(outputPath)}`);
    } catch (err) {
      console.log(`エラー: ${err.message}`);
    }
  }

  const totalBeforeKB = Math.round(totalBefore / 1024);
  const totalAfterKB = Math.round(totalAfter / 1024);
  const totalReduction = Math.round((1 - totalAfter / totalBefore) * 100);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`合計削減: ${totalBeforeKB} KB → ${totalAfterKB} KB  (${totalReduction}% 削減)`);
  console.log(`すべての WebP ファイルを images/ に保存しました。`);
}

main().catch(console.error);

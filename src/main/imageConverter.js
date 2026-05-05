const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const sharp = require('sharp');

function ffmpegPath() {
  const candidate = process.resourcesPath ? path.join(process.resourcesPath, 'ffmpeg.exe') : '';
  return candidate && fs.existsSync(candidate) ? candidate : ffmpegStatic;
}

function convertToBmp(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath(), ['-y', '-i', inputPath, outputPath]);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg no pudo crear BMP (codigo ${code}).`));
    });
  });
}

async function convertImage({ inputPath, outputPath, format, settings, onProgress }) {
  onProgress(10);
  let pipeline = sharp(inputPath, { animated: format === 'gif' });

  const width = Number(settings.image.width);
  const height = Number(settings.image.height);
  if (width || height) {
    pipeline = pipeline.resize({
      width: width || null,
      height: height || null,
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  const quality = Number(settings.image.quality) || 85;
  onProgress(45);

  if (format === 'jpg' || format === 'jpeg') pipeline = pipeline.jpeg({ quality });
  if (format === 'png') pipeline = pipeline.png({ quality });
  if (format === 'webp') pipeline = pipeline.webp({ quality });
  if (format === 'gif') pipeline = pipeline.gif();

  if (format === 'bmp') {
    const temporaryPath = path.join(os.tmpdir(), `morpho-${Date.now()}.png`);
    await pipeline.png().toFile(temporaryPath);
    onProgress(75);
    await convertToBmp(temporaryPath, outputPath);
    fs.rmSync(temporaryPath, { force: true });
    onProgress(100);
    const outputSize = fs.statSync(outputPath).size;
    return {
      outputPath,
      fileName: path.basename(outputPath),
      outputSize
    };
  }

  await pipeline.toFile(outputPath);
  onProgress(100);
  const outputSize = fs.statSync(outputPath).size;

  return {
    outputPath,
    fileName: path.basename(outputPath),
    outputSize
  };
}

module.exports = { convertImage };

const fs = require('fs');
const os = require('os');
const path = require('path');
const archiver = require('archiver');
const { app } = require('electron');
const { getFileType, OUTPUT_FORMATS } = require('./formats');
const { convertImage } = require('./imageConverter');
const { convertMedia } = require('./mediaConverter');
const { addHistory } = require('./historyStore');

const DEFAULT_SETTINGS = {
  video: {
    resolution: 'source',
    bitrate: '2500k',
    fps: 30
  },
  audio: {
    bitrate: '192k',
    sampleRate: 44100,
    channels: 'stereo'
  },
  image: {
    quality: 85,
    width: '',
    height: ''
  }
};

function normalizeSettings(settings = {}) {
  return {
    video: { ...DEFAULT_SETTINGS.video, ...(settings.video || {}) },
    audio: { ...DEFAULT_SETTINGS.audio, ...(settings.audio || {}) },
    image: { ...DEFAULT_SETTINGS.image, ...(settings.image || {}) }
  };
}

function uniqueOutputPath(directory, baseName, extension) {
  let candidate = path.join(directory, `${baseName}.${extension}`);
  let index = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(directory, `${baseName}-${index}.${extension}`);
    index += 1;
  }
  return candidate;
}

function resolveOutputDirectory(outputDirectory) {
  const directory = outputDirectory || path.join(app.getPath('downloads'), 'Morpho');
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

async function convertBatch({ files, globalFormat, outputDirectory, settings, onFileUpdate, onBatchUpdate }) {
  const normalizedSettings = normalizeSettings(settings);
  const directory = resolveOutputDirectory(outputDirectory);
  const results = [];
  let completed = 0;
  const concurrency = 1;

  async function convertOne(file) {
    const ext = path.extname(file.path).replace('.', '').toLowerCase();
    const type = getFileType(ext);
    const outputFormat = file.outputFormat || globalFormat || OUTPUT_FORMATS[type]?.[0];

    if (!OUTPUT_FORMATS[type]?.includes(outputFormat)) {
      const error = `Formato de salida no valido para ${type}: ${outputFormat}`;
      onFileUpdate({ id: file.id, status: 'error', error });
      results.push({ ...file, status: 'error', error });
      completed += 1;
      onBatchUpdate({ completed, total: files.length });
      return;
    }

    const outputPath = uniqueOutputPath(directory, `${path.parse(file.path).name}-converted`, outputFormat);
    onFileUpdate({ id: file.id, status: 'processing', progress: 0 });

    try {
      const progress = (value) => onFileUpdate({ id: file.id, status: 'processing', progress: value });
      const result = type === 'image'
        ? await convertImage({ inputPath: file.path, outputPath, format: outputFormat, settings: normalizedSettings, onProgress: progress })
        : await convertMedia({ inputPath: file.path, outputPath, type, settings: normalizedSettings, onProgress: progress });

      const done = { ...file, ...result, type, outputFormat, status: 'completed', progress: 100, completedAt: new Date().toISOString() };
      addHistory(done);
      results.push(done);
      onFileUpdate(done);
    } catch (error) {
      const failed = { ...file, status: 'error', progress: 0, error: error.message };
      results.push(failed);
      onFileUpdate(failed);
    } finally {
      completed += 1;
      onBatchUpdate({ completed, total: files.length });
    }
  }

  const queue = [...files];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const file = queue.shift();
      await convertOne(file);
    }
  });

  await Promise.all(workers);
  return { results, outputDirectory: directory };
}

async function createZip(files, targetPath) {
  const output = fs.createWriteStream(targetPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(targetPath));
    archive.on('error', reject);
    archive.pipe(output);

    files.filter((file) => file.outputPath && fs.existsSync(file.outputPath)).forEach((file) => {
      archive.file(file.outputPath, { name: path.basename(file.outputPath) });
    });

    archive.finalize();
  });
}

function temporaryPreviewPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const target = path.join(os.tmpdir(), `morpho-preview-${Date.now()}${ext}`);
  fs.copyFileSync(filePath, target);
  return target;
}

module.exports = {
  DEFAULT_SETTINGS,
  convertBatch,
  createZip,
  temporaryPreviewPath
};

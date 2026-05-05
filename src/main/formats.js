const VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];
const AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'ogg', 'flac'];

const OUTPUT_FORMATS = {
  video: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
  image: ['jpg', 'png', 'webp', 'bmp', 'gif'],
  audio: ['mp3', 'wav', 'aac', 'ogg', 'flac']
};

function getFileType(extension) {
  const normalized = extension.replace('.', '').toLowerCase();
  if (VIDEO_FORMATS.includes(normalized)) return 'video';
  if (IMAGE_FORMATS.includes(normalized)) return 'image';
  if (AUDIO_FORMATS.includes(normalized)) return 'audio';
  return 'unknown';
}

function isSupported(extension) {
  return getFileType(extension) !== 'unknown';
}

module.exports = {
  VIDEO_FORMATS,
  IMAGE_FORMATS,
  AUDIO_FORMATS,
  OUTPUT_FORMATS,
  getFileType,
  isSupported
};

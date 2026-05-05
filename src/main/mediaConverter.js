const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

function resourceBinary(name, fallback) {
  if (process.resourcesPath) {
    const candidate = path.join(process.resourcesPath, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return fallback;
}

ffmpeg.setFfmpegPath(resourceBinary('ffmpeg.exe', ffmpegStatic));

const RESOLUTION_MAP = {
  source: null,
  '720p': '1280:720',
  '1080p': '1920:1080',
  '4k': '3840:2160'
};

function convertMedia({ inputPath, outputPath, type, settings, onProgress }) {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath).output(outputPath);

    if (type === 'video') {
      const resolution = RESOLUTION_MAP[settings.video.resolution];
      if (resolution) {
        command = command.videoFilters(`scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2`);
      }
      if (settings.video.bitrate) command = command.videoBitrate(settings.video.bitrate);
      if (settings.video.fps) command = command.fps(Number(settings.video.fps));
      if (settings.audio.bitrate) command = command.audioBitrate(settings.audio.bitrate);
      if (settings.audio.sampleRate) command = command.audioFrequency(Number(settings.audio.sampleRate));
      if (settings.audio.channels) command = command.audioChannels(settings.audio.channels === 'mono' ? 1 : 2);
    }

    if (type === 'audio') {
      command = command.noVideo();
      if (settings.audio.bitrate) command = command.audioBitrate(settings.audio.bitrate);
      if (settings.audio.sampleRate) command = command.audioFrequency(Number(settings.audio.sampleRate));
      if (settings.audio.channels) command = command.audioChannels(settings.audio.channels === 'mono' ? 1 : 2);
    }

    command
      .on('progress', (progress) => onProgress(Math.max(0, Math.min(99, Math.round(progress.percent || 0)))))
      .on('end', () => {
        onProgress(100);
        const outputSize = fs.statSync(outputPath).size;
        resolve({
          outputPath,
          fileName: path.basename(outputPath),
          outputSize
        });
      })
      .on('error', reject)
      .run();
  });
}

module.exports = { convertMedia };

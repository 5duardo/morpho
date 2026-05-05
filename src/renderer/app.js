const api = window.formatChange;

const state = {
  files: [],
  formats: { video: [], image: [], audio: [] },
  history: [],
  favorites: [],
  outputDirectory: '',
  completedBatch: null
};

const els = {
  selectFilesBtn: document.querySelector('#selectFilesBtn'),
  selectOutputBtn: document.querySelector('#selectOutputBtn'),
  outputDirectory: document.querySelector('#outputDirectory'),
  dropZone: document.querySelector('#dropZone'),
  fileList: document.querySelector('#fileList'),
  globalFormat: document.querySelector('#globalFormat'),
  convertBtn: document.querySelector('#convertBtn'),
  clearBtn: document.querySelector('#clearBtn'),
  overallProgressText: document.querySelector('#overallProgressText'),
  overallProgressBar: document.querySelector('#overallProgressBar'),
  saveAllBtn: document.querySelector('#saveAllBtn'),
  exportZipBtn: document.querySelector('#exportZipBtn'),
  historyList: document.querySelector('#historyList'),
  favoriteList: document.querySelector('#favoriteList'),
  clearHistoryBtn: document.querySelector('#clearHistoryBtn'),
  saveFavoriteBtn: document.querySelector('#saveFavoriteBtn'),
  themeToggle: document.querySelector('#themeToggle'),
  languageSelect: document.querySelector('#languageSelect')
};

const settingIds = {
  video: ['videoResolution', 'videoBitrate', 'videoFps'],
  audio: ['audioBitrate', 'audioSampleRate', 'audioChannels'],
  image: ['imageQuality', 'imageWidth', 'imageHeight']
};

const icons = {
  audio: '<span class="preview-icon"><svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12h-2V8.4l-6 1.2V18H9Zm-3 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm10 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg></span>',
  open: '<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 5h6v2H7v10h10v-4h2v6H5V5Zm8 0h6v6h-2V8.4l-6.3 6.3-1.4-1.4L15.6 7H13V5Z"/></svg></span>',
  save: '<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5V3Zm2 2v14h10V6.2L15.8 5H15v5H9V5H7Zm4 0v3h2V5h-2Zm-1 9h4v2h-4v-2Z"/></svg></span>',
  folder: '<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 4v8h14v-8H5Z"/></svg></span>',
  check: '<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20.5 7.5 19 6 9 16.2Z"/></svg></span>',
  trash: '<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10l1 2h4v2H2V6h4l1-2Zm-1 6h12l-1 11H7L6 10Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/></svg></span>'
};

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusLabel(status) {
  return {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    error: 'Error'
  }[status] || status;
}

function allOutputFormats() {
  return [...new Set([...state.formats.video, ...state.formats.image, ...state.formats.audio])];
}

function renderGlobalFormats() {
  els.globalFormat.innerHTML = allOutputFormats().map((format) => `<option value="${format}">${format.toUpperCase()}</option>`).join('');
}

function renderFiles() {
  els.fileList.classList.toggle('empty', state.files.length === 0);
  els.fileList.innerHTML = state.files.map((file) => {
    const formats = state.formats[file.type] || [];
    const targetFormat = file.outputFormat || formats[0] || '';
    const formatOptions = formats.map((format) => `<option value="${format}" ${file.outputFormat === format ? 'selected' : ''}>${format.toUpperCase()}</option>`).join('');
    const preview = file.type === 'image'
      ? `<img src="${file.previewUrl}" alt="">`
      : file.type === 'video'
        ? `<video src="${file.previewUrl}" muted></video>`
        : file.type === 'audio'
          ? icons.audio
          : file.extension;
    const resultAction = file.outputPath
      ? `<button class="ghost small" data-open-result="${file.outputPath}">${icons.open}Abrir</button>`
      : '<span></span>';
    const saveAction = file.outputPath
      ? `<button class="ghost small" data-save-file="${file.id}">${icons.save}Guardar</button>`
      : '';
    return `
      <article class="file-item" data-id="${file.id}">
        <div class="preview">${preview}</div>
        <div>
          <div class="file-name" title="${file.path}">${file.name}</div>
          <div class="file-meta">${file.type} &middot; ${formatSize(file.size)}</div>
          <div class="format-route" aria-label="Formato original ${file.extension.toUpperCase()} a ${targetFormat.toUpperCase()}">
            <span class="format-badge source">${file.extension.toUpperCase()}</span>
            <span class="route-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.2 5.3 20 12l-6.8 6.7-1.4-1.4 4.4-4.3H4v-2h12.2l-4.4-4.3 1.4-1.4Z"/></svg></span>
            <span class="format-badge target">${targetFormat.toUpperCase()}</span>
          </div>
          <div class="progress"><span style="width:${file.progress || 0}%"></span></div>
        </div>
        <select class="file-format">${formatOptions}</select>
        <span class="status ${file.status}">${statusLabel(file.status)}</span>
        <div class="file-actions">
          ${resultAction}
          ${saveAction}
          <button class="ghost small icon-only" type="button" title="Eliminar de la cola" aria-label="Eliminar ${file.name} de la cola" data-remove-file="${file.id}">${icons.trash}</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderHistory() {
  els.historyList.innerHTML = state.history.length ? state.history.map((item) => `
    <article class="record">
      <div>
        <strong>${item.name}</strong>
        <span>${item.outputFormat?.toUpperCase() || ''} &middot; ${new Date(item.completedAt).toLocaleString()}</span>
      </div>
      <button class="ghost small" data-open="${item.outputPath}">${icons.open}Abrir</button>
      <button class="ghost small" data-folder="${item.outputPath}">${icons.folder}Carpeta</button>
    </article>
  `).join('') : '<p class="file-meta">Aun no hay conversiones.</p>';
}

function renderFavorites() {
  els.favoriteList.innerHTML = state.favorites.length ? state.favorites.map((favorite) => `
    <article class="record">
      <div>
        <strong>${favorite.name}</strong>
        <span>${new Date(favorite.updatedAt).toLocaleString()}</span>
      </div>
      <button class="ghost small" data-apply-favorite="${favorite.id}">${icons.check}Aplicar</button>
      <button class="ghost small" data-delete-favorite="${favorite.id}">${icons.trash}Borrar</button>
    </article>
  `).join('') : '<p class="file-meta">Guarda presets para reutilizarlos aqui.</p>';
}

function mergeFiles(files) {
  const existing = new Set(state.files.map((file) => file.path));
  state.files = [...state.files, ...files.filter((file) => !existing.has(file.path))];
  renderFiles();
}

function readSettings() {
  return {
    video: {
      resolution: document.querySelector('#videoResolution').value,
      bitrate: document.querySelector('#videoBitrate').value,
      fps: Number(document.querySelector('#videoFps').value)
    },
    audio: {
      bitrate: document.querySelector('#audioBitrate').value,
      sampleRate: Number(document.querySelector('#audioSampleRate').value),
      channels: document.querySelector('#audioChannels').value
    },
    image: {
      quality: Number(document.querySelector('#imageQuality').value),
      width: document.querySelector('#imageWidth').value,
      height: document.querySelector('#imageHeight').value
    },
    concurrency: 1
  };
}

function applySettings(settings) {
  if (!settings) return;
  document.querySelector('#videoResolution').value = settings.video?.resolution || 'source';
  document.querySelector('#videoBitrate').value = settings.video?.bitrate || '2500k';
  document.querySelector('#videoFps').value = settings.video?.fps || 30;
  document.querySelector('#audioBitrate').value = settings.audio?.bitrate || '192k';
  document.querySelector('#audioSampleRate').value = settings.audio?.sampleRate || 44100;
  document.querySelector('#audioChannels').value = settings.audio?.channels || 'stereo';
  document.querySelector('#imageQuality').value = settings.image?.quality || 85;
  document.querySelector('#imageWidth').value = settings.image?.width || '';
  document.querySelector('#imageHeight').value = settings.image?.height || '';
  document.querySelector('#concurrency').value = 1;
}

function updateOverallProgress(completed, total) {
  const progress = total ? Math.round((completed / total) * 100) : 0;
  els.overallProgressText.textContent = `${progress}%`;
  els.overallProgressBar.style.width = `${progress}%`;
}

els.selectFilesBtn.addEventListener('click', async () => mergeFiles(await api.selectFiles()));
els.selectOutputBtn.addEventListener('click', async () => {
  const folder = await api.selectFolder();
  if (!folder) return;
  state.outputDirectory = folder;
  els.outputDirectory.value = folder;
});

els.dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  els.dropZone.classList.add('dragover');
});
els.dropZone.addEventListener('dragleave', () => els.dropZone.classList.remove('dragover'));
els.dropZone.addEventListener('drop', async (event) => {
  event.preventDefault();
  els.dropZone.classList.remove('dragover');
  const paths = [...event.dataTransfer.files].map((file) => api.getPathForFile(file)).filter(Boolean);
  mergeFiles(await api.filesFromDrop(paths));
});

els.fileList.addEventListener('change', (event) => {
  if (!event.target.classList.contains('file-format')) return;
  const id = event.target.closest('.file-item').dataset.id;
  state.files = state.files.map((file) => file.id === id ? { ...file, outputFormat: event.target.value } : file);
});

els.fileList.addEventListener('click', async (event) => {
  const removeId = event.target.closest('[data-remove-file]')?.dataset.removeFile;
  if (removeId) {
    state.files = state.files.filter((file) => file.id !== removeId);
    if (!state.files.length) {
      state.completedBatch = null;
      updateOverallProgress(0, 0);
    }
    renderFiles();
    return;
  }

  const outputPath = event.target.closest('[data-open-result]')?.dataset.openResult;
  if (outputPath) await api.openPath(outputPath);

  const saveId = event.target.closest('[data-save-file]')?.dataset.saveFile;
  if (saveId) {
    const file = state.files.find((item) => item.id === saveId);
    if (file) await api.saveFile(file);
  }
});

els.globalFormat.addEventListener('change', () => {
  const selected = els.globalFormat.value;
  state.files = state.files.map((file) => {
    const valid = state.formats[file.type]?.includes(selected);
    return valid ? { ...file, outputFormat: selected } : file;
  });
  renderFiles();
});

els.convertBtn.addEventListener('click', async () => {
  if (!state.files.length) return;
  updateOverallProgress(0, state.files.length);
  state.files = state.files.map((file) => ({ ...file, status: 'pending', progress: 0 }));
  renderFiles();
  state.completedBatch = await api.startConversion({
    files: state.files,
    globalFormat: els.globalFormat.value,
    outputDirectory: state.outputDirectory,
    settings: readSettings()
  });
});

els.clearBtn.addEventListener('click', () => {
  state.files = [];
  state.completedBatch = null;
  updateOverallProgress(0, 0);
  renderFiles();
});

els.exportZipBtn.addEventListener('click', async () => {
  const files = state.completedBatch?.results || state.files;
  await api.exportZip({ files, outputDirectory: state.completedBatch?.outputDirectory || state.outputDirectory });
});

els.saveAllBtn.addEventListener('click', async () => {
  const files = state.completedBatch?.results || state.files;
  await api.saveAll(files);
});

els.saveFavoriteBtn.addEventListener('click', async () => {
  const name = `Preset ${new Date().toLocaleTimeString()}`;
  const saved = await api.saveFavorite({ name, settings: readSettings() });
  state.favorites = [saved, ...state.favorites.filter((item) => item.id !== saved.id)];
  renderFavorites();
});

els.clearHistoryBtn.addEventListener('click', async () => {
  state.history = await api.clearHistory();
  renderHistory();
});

els.historyList.addEventListener('click', async (event) => {
  const openPath = event.target.closest('[data-open]')?.dataset.open;
  const folderPath = event.target.closest('[data-folder]')?.dataset.folder;
  if (openPath) await api.openPath(openPath);
  if (folderPath) await api.openFolder(folderPath);
});

els.favoriteList.addEventListener('click', async (event) => {
  const applyId = event.target.closest('[data-apply-favorite]')?.dataset.applyFavorite;
  const deleteId = event.target.closest('[data-delete-favorite]')?.dataset.deleteFavorite;
  if (applyId) applySettings(state.favorites.find((item) => item.id === applyId)?.settings);
  if (deleteId) {
    state.favorites = await api.deleteFavorite(deleteId);
    renderFavorites();
  }
});

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
    button.classList.add('active');
    document.querySelector(`#${button.dataset.view}View`).classList.add('active');
  });
});

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.settings-group').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelector(`#${button.dataset.settings}Settings`).classList.add('active');
  });
});

els.themeToggle.addEventListener('change', async () => {
  document.body.classList.toggle('light', !els.themeToggle.checked);
  await api.setSettings({ theme: els.themeToggle.checked ? 'dark' : 'light' });
});

els.languageSelect.addEventListener('change', async () => {
  await api.setSettings({ language: els.languageSelect.value });
});

api.onFileUpdate((update) => {
  state.files = state.files.map((file) => file.id === update.id ? { ...file, ...update } : file);
  renderFiles();
});

api.onBatchUpdate(({ completed, total }) => updateOverallProgress(completed, total));

api.onDone(async (batch) => {
  state.completedBatch = batch;
  const data = await api.getAppData();
  state.history = data.history;
  renderHistory();
});

async function init() {
  const data = await api.getAppData();
  state.formats = data.formats;
  state.history = data.history;
  state.favorites = data.favorites;
  renderGlobalFormats();
  renderFiles();
  renderHistory();
  renderFavorites();
  applySettings(data.favorites[0]?.settings);
  if (data.settings?.theme === 'light') {
    els.themeToggle.checked = false;
    document.body.classList.add('light');
  }
  if (data.settings?.language) els.languageSelect.value = data.settings.language;
}

init();

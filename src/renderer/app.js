const api = window.formatChange;

function paintIcons(scope = document) {
  if (!api?.getIcon) return;
  scope.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = api.getIcon(element.dataset.icon) || '';
  });
}

function icon(name, className = 'icon') {
  return `<span class="${className}" aria-hidden="true" data-icon="${name}"></span>`;
}

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
  historyConvertList: document.querySelector('#historyConvertList'),
  historyOptimizeList: document.querySelector('#historyOptimizeList'),
  favoriteList: document.querySelector('#favoriteList'),
  clearHistoryBtn: document.querySelector('#clearHistoryBtn'),
  saveFavoriteBtn: document.querySelector('#saveFavoriteBtn'),
  themeToggle: document.querySelector('#themeToggle'),
  languageSelect: document.querySelector('#languageSelect'),
  checkUpdatesBtn: document.querySelector('#checkUpdatesBtn'),
  updateStatus: document.querySelector('#updateStatus'),
  appVersion: document.querySelector('#appVersion')
};

const translations = {
  es: {
    appTitle: 'Morpho',
    nav: { convert: 'Convertir', optimize: 'Optimizar', history: 'Historial', favorites: 'Favoritos', settings: 'Ajustes' },
    sidebar: { noteLabel: 'Versión actual' },
    brand: { subtitle: 'Conversor multimedia' },
    converter: {
      eyebrow: 'Conversión en lote',
      title: 'Convierte archivos multimedia de forma simple',
      selectFiles: 'Elegir archivos',
      selectFolder: 'Destino',
      dropTitle: 'Arrastra o selecciona archivos',
      dropHint: 'Compatible con video, audio e imagen',
      globalFormat: 'Formato de salida',
      outputLabel: 'Carpeta de destino',
      outputPlaceholder: 'Descargas/Morpho',
      savePreset: 'Guardar configuración',
      convert: 'Iniciar conversión',
      progress: 'Progreso total',
      filesTitle: 'Cola de archivos',
      clear: 'Vaciar',
      advancedSettings: 'Ajustes de conversión',
      video: 'Video',
      audio: 'Audio',
      image: 'Imagen',
      videoResolution: 'Resolucion',
      videoBitrate: 'Bitrate',
      videoFps: 'FPS',
      original: 'Original',
      audioBitrate: 'Bitrate',
      audioSampleRate: 'Sample rate',
      audioChannels: 'Canales',
      stereo: 'Estereo',
      mono: 'Mono',
      imageQuality: 'Calidad',
      imageWidth: 'Ancho max.',
      imageHeight: 'Alto max.',
      concurrency: 'Procesamiento',
      oneByOne: 'Uno por uno',
      saveAll: 'Guardar todos',
      exportZip: 'Exportar todo .ZIP',
      auto: 'Auto',
      none: 'Sin archivos cargados'
    },
    history: { title: 'Historial', clear: 'Borrar historial', empty: 'Aun no hay conversiones.', conversions: 'Conversiones', optimizations: 'Optimizaciones', emptyOpt: 'Aun no hay optimizaciones.' },
    favorites: { title: 'Configuraciones favoritas', empty: 'Guarda presets para reutilizarlos aqui.' },
    optimizer: {
      eyebrow: 'Reducción de peso',
      title: 'Optimiza archivos sin perder calidad',
      selectFiles: 'Elegir archivos',
      quality: 'Nivel de compresión',
      lossless: 'Sin pérdida',
      balanced: 'Balanceado',
      max: 'Máxima compresión',
      outputLabel: 'Carpeta de destino',
      sameFolderPlaceholder: 'Misma carpeta',
      selectFolder: 'Destino',
      start: 'Optimizar',
      progress: 'Progreso',
      filesTitle: 'Cola de archivos',
      clear: 'Vaciar',
      saveAll: 'Guardar todos',
      dropTitle: 'Arrastra o selecciona archivos para optimizar',
      dropHint: 'Compatible con imagen, video y audio',
      none: 'Sin archivos cargados'
    },
    settings: {
      eyebrow: 'Preferences',
      title: 'Ajustes',
      appearanceTitle: 'Tema',
      appearanceHint: 'Elige entre modo claro u oscuro.',
      darkMode: 'Tema oscuro',
      toggleHint: 'Activa o desactiva el modo oscuro.',
      languageTitle: 'Idioma',
      languageHint: 'Cambia el idioma de la interfaz.',
      languageLabel: 'Idioma de la app',
      updateTitle: 'Actualizaciones',
      updateHint: 'Comprueba si hay una nueva versión disponible.',
      currentVersion: 'Versión instalada',
      checkUpdates: 'Buscar actualizaciones',
      updateIdle: 'La app revisa actualizaciones al iniciar.',
      aboutTitle: 'Acerca de',
      aboutHint: 'Información del proyecto y del equipo responsable.',
      developedBy: 'Desarrollado por HYPED',
      aboutBody: 'Morpho es una herramienta de escritorio para convertir archivos multimedia de forma simple y confiable.',
      visitSite: 'Ir a HYPED.CENTER',
      updateUnavailable: 'Las actualizaciones automáticas solo estan disponibles en la version empaquetada.',
      checking: 'Buscando actualizaciones...',
      available: 'Actualización disponible: {version}.',
      none: 'No hay actualizaciones disponibles.',
      downloading: 'Descargando actualización... {percent}%',
      downloaded: 'Actualización descargada. La app se reiniciará para aplicarla.',
      error: 'No se pudo comprobar actualizaciones.'
    },
    status: {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      error: 'Error'
    },
    actions: { open: 'Abrir', save: 'Guardar', apply: 'Aplicar', delete: 'Borrar', folder: 'Carpeta' },
    language: { es: 'Español', en: 'English' },
    empty: { history: 'Aun no hay conversiones.', favorites: 'Guarda presets para reutilizarlos aqui.' }
  },
  en: {
    appTitle: 'Morpho',
    nav: { convert: 'Convert', optimize: 'Optimize', history: 'History', favorites: 'Favorites', settings: 'Settings' },
    sidebar: { noteLabel: 'Current version' },
    brand: { subtitle: 'Multimedia converter' },
    converter: {
      eyebrow: 'Batch conversion',
      title: 'Convert multimedia files with a simple workflow',
      selectFiles: 'Choose files',
      selectFolder: 'Destination',
      dropTitle: 'Drop or select files',
      dropHint: 'Video, audio and image supported',
      globalFormat: 'Output format',
      outputLabel: 'Destination folder',
      outputPlaceholder: 'Downloads/Morpho',
      savePreset: 'Save settings',
      convert: 'Start conversion',
      progress: 'Total progress',
      filesTitle: 'File queue',
      clear: 'Empty',
      advancedSettings: 'Conversion settings',
      video: 'Video',
      audio: 'Audio',
      image: 'Image',
      videoResolution: 'Resolution',
      videoBitrate: 'Bitrate',
      videoFps: 'FPS',
      original: 'Source',
      audioBitrate: 'Bitrate',
      audioSampleRate: 'Sample rate',
      audioChannels: 'Channels',
      stereo: 'Stereo',
      mono: 'Mono',
      imageQuality: 'Quality',
      imageWidth: 'Max width',
      imageHeight: 'Max height',
      concurrency: 'Processing',
      oneByOne: 'One by one',
      saveAll: 'Save all',
      exportZip: 'Export all .ZIP',
      auto: 'Auto',
      none: 'No files loaded'
    },
    history: { title: 'History', clear: 'Clear history', empty: 'No conversions yet.', conversions: 'Conversions', optimizations: 'Optimizations', emptyOpt: 'No optimizations yet.' },
    favorites: { title: 'Favorite settings', empty: 'Save presets to reuse them here.' },
    optimizer: {
      eyebrow: 'File size reduction',
      title: 'Optimize files without losing quality',
      selectFiles: 'Choose files',
      quality: 'Compression level',
      lossless: 'Lossless',
      balanced: 'Balanced',
      max: 'Maximum compression',
      outputLabel: 'Destination folder',
      sameFolderPlaceholder: 'Same folder',
      selectFolder: 'Destination',
      start: 'Optimize',
      progress: 'Progress',
      filesTitle: 'File queue',
      clear: 'Empty',
      saveAll: 'Save all',
      dropTitle: 'Drop or select files to optimize',
      dropHint: 'Image, video and audio supported',
      none: 'No files loaded'
    },
    settings: {
      eyebrow: 'Preferences',
      title: 'Settings',
      appearanceTitle: 'Theme',
      appearanceHint: 'Choose between light and dark mode.',
      darkMode: 'Dark theme',
      toggleHint: 'Turn dark mode on or off.',
      languageTitle: 'Language',
      languageHint: 'Change the interface language.',
      languageLabel: 'App language',
      updateTitle: 'Updates',
      updateHint: 'Check if a new version is available.',
      currentVersion: 'Installed version',
      checkUpdates: 'Check for updates',
      updateIdle: 'The app checks for updates on startup.',
      aboutTitle: 'About',
      aboutHint: 'Project details and the team behind it.',
      developedBy: 'Developed by HYPED',
      aboutBody: 'Morpho is a desktop tool for converting multimedia files with a simple and reliable workflow.',
      visitSite: 'Go to HYPED.CENTER',
      updateUnavailable: 'Automatic updates are only available in the packaged app.',
      checking: 'Checking for updates...',
      available: 'Update available: {version}.',
      none: 'No updates available.',
      downloading: 'Downloading update... {percent}%',
      downloaded: 'Update downloaded. The app will restart to apply it.',
      error: 'Could not check for updates.'
    },
    status: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      error: 'Error'
    },
    actions: { open: 'Open', save: 'Save', apply: 'Apply', delete: 'Delete', folder: 'Folder' },
    language: { es: 'Spanish', en: 'English' },
    empty: { history: 'No conversions yet.', favorites: 'Save presets to reuse them here.' }
  }
};

let activeLanguage = 'es';

function currentStrings() {
  return translations[activeLanguage] || translations.es;
}

function translate(path, values = {}) {
  const segments = path.split('.');
  let value = currentStrings();
  for (const segment of segments) {
    value = value?.[segment];
  }
  if (typeof value !== 'string') return path;
  return value.replace(/\{(\w+)\}/g, (_match, key) => values[key] ?? '');
}

function applyLanguage() {
  document.documentElement.lang = activeLanguage;
  document.title = translate('appTitle');
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', translate(element.dataset.i18nPlaceholder));
  });
  paintIcons(document);
}

function setLanguage(language, persist = false) {
  activeLanguage = translations[language] ? language : 'es';
  if (els.languageSelect) els.languageSelect.value = activeLanguage;
  applyLanguage();
  renderFiles();
  renderHistory();
  renderFavorites();
  if (els.updateStatus?.dataset.state) {
    els.updateStatus.textContent = translate(`settings.${els.updateStatus.dataset.state}`, {
      version: els.updateStatus.dataset.version,
      percent: els.updateStatus.dataset.percent
    });
  }
  if (persist) api.setSettings({ language: activeLanguage });
}

function applyTheme(theme, persist = false) {
  const isDark = theme !== 'light';
  document.body.classList.toggle('light', !isDark);
  if (els.themeToggle) els.themeToggle.checked = isDark;
  if (persist) api.setSettings({ theme: isDark ? 'dark' : 'light' });
}

function setUpdateStatus(state, values = {}) {
  if (!els.updateStatus) return;
  const messageKey = state === 'unavailable' ? 'updateUnavailable' : state;
  els.updateStatus.dataset.state = messageKey;
  els.updateStatus.dataset.version = values.version || '';
  els.updateStatus.dataset.percent = values.percent || '';
  els.updateStatus.textContent = translate(`settings.${messageKey}`, values);
}

const settingIds = {
  video: ['videoResolution', 'videoBitrate', 'videoFps'],
  audio: ['audioBitrate', 'audioSampleRate', 'audioChannels'],
  image: ['imageQuality', 'imageWidth', 'imageHeight']
};

const icons = {
  audio: icon('Music', 'preview-icon'),
  open: icon('ExternalLink'),
  save: icon('Save'),
  folder: icon('FolderOpen'),
  check: icon('Check'),
  trash: icon('Trash2')
};

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusLabel(status) {
  return translate(`status.${status}`);
}

function allOutputFormats() {
  return [...new Set([...state.formats.video, ...state.formats.image, ...state.formats.audio])];
}

function renderGlobalFormats() {
  els.globalFormat.innerHTML = allOutputFormats().map((format) => `<option value="${format}">${format.toUpperCase()}</option>`).join('');
}

function renderFiles() {
  els.fileList.classList.toggle('empty', state.files.length === 0);
  if (!state.files.length) {
    els.fileList.innerHTML = `
      <div class="empty-drop" id="emptyDropArea">
        <span class="drop-icon" aria-hidden="true" data-icon="Download"></span>
        <div>
          <strong data-i18n="converter.dropTitle">${translate('converter.dropTitle')}</strong>
          <span class="file-meta" data-i18n="converter.dropHint">${translate('converter.dropHint')}</span>
        </div>
      </div>
    `;
    paintIcons(els.fileList);
    return;
  }
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
      ? `<button class="ghost small" data-open-result="${file.outputPath}">${icons.open}${translate('actions.open')}</button>`
      : '<span></span>';
    const saveAction = file.outputPath
      ? `<button class="ghost small" data-save-file="${file.id}">${icons.save}${translate('actions.save')}</button>`
      : '';
    return `
      <article class="file-item" data-id="${file.id}">
        <div class="preview">${preview}</div>
        <div>
          <div class="file-name" title="${file.path}">${file.name}</div>
          <div class="file-meta">${file.type} &middot; ${formatSize(file.size)}${file.outputSize ? ` → ${formatSize(file.outputSize)} (${file.outputSize < file.size ? '-' : '+'}${Math.abs(Math.round((1 - file.outputSize / file.size) * 100))}%)` : ''}</div>
          <div class="format-route" aria-label="Formato original ${file.extension.toUpperCase()} a ${targetFormat.toUpperCase()}">
            <span class="format-badge source">${file.extension.toUpperCase()}</span>
            ${icon('ArrowRightLeft', 'route-arrow')}
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
  paintIcons(els.fileList);
}

function renderHistoryList(container, items, emptyKey) {
  container.innerHTML = items.length ? items.map((item) => {
    const sizeInfo = item.outputSize && item.size
      ? ` · ${formatSize(item.size)} → ${formatSize(item.outputSize)} (${item.outputSize < item.size ? '-' : '+'}${Math.abs(Math.round((1 - item.outputSize / item.size) * 100))}%)`
      : '';
    return `
    <article class="record">
      <div>
        <strong>${item.name}</strong>
        <span>${item.outputFormat?.toUpperCase() || ''} · ${new Date(item.completedAt).toLocaleString()}${sizeInfo}</span>
      </div>
      <button class="ghost small" data-open="${item.outputPath}">${icons.open}${translate('actions.open')}</button>
      <button class="ghost small" data-folder="${item.outputPath}">${icons.folder}${translate('actions.folder')}</button>
    </article>
    `;
  }).join('') : `<p class="file-meta">${translate(emptyKey)}</p>`;
  paintIcons(container);
}

function renderHistory() {
  const converts = state.history.filter((h) => h.source !== 'optimizer');
  const optimizes = state.history.filter((h) => h.source === 'optimizer');
  renderHistoryList(els.historyConvertList, converts, 'history.empty');
  renderHistoryList(els.historyOptimizeList, optimizes, 'history.emptyOpt');
}

function renderFavorites() {
  els.favoriteList.innerHTML = state.favorites.length ? state.favorites.map((favorite) => `
    <article class="record">
      <div>
        <strong>${favorite.name}</strong>
        <span>${new Date(favorite.updatedAt).toLocaleString()}</span>
      </div>
      <button class="ghost small" data-apply-favorite="${favorite.id}">${icons.check}${translate('actions.apply')}</button>
      <button class="ghost small" data-delete-favorite="${favorite.id}">${icons.trash}${translate('actions.delete')}</button>
    </article>
    `).join('') : `<p class="file-meta">${translate('favorites.empty')}</p>`;
    paintIcons(els.favoriteList);
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

function bindUpdateStatus(status) {
  if (!status) return;
  if (status.state === 'error') {
    setUpdateStatus('error');
    return;
  }
  if (status.state === 'checking') {
    setUpdateStatus('checking');
    return;
  }
  if (status.state === 'available') {
    setUpdateStatus('available', { version: status.version });
    return;
  }
  if (status.state === 'none') {
    setUpdateStatus('none');
    return;
  }
  if (status.state === 'downloading') {
    setUpdateStatus('downloading', { percent: Math.round(status.percent || 0) });
    return;
  }
  if (status.state === 'downloaded') {
    setUpdateStatus('downloaded');
    return;
  }
  if (status.state === 'unavailable') {
    setUpdateStatus('unavailable');
  }
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
  if (event.target.closest('#emptyDropArea')) {
    mergeFiles(await api.selectFiles());
    return;
  }

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

function handleHistoryClick(event) {
  const openPath = event.target.closest('[data-open]')?.dataset.open;
  const folderPath = event.target.closest('[data-folder]')?.dataset.folder;
  if (openPath) api.openPath(openPath);
  if (folderPath) api.openFolder(folderPath);
}
els.historyConvertList.addEventListener('click', handleHistoryClick);
els.historyOptimizeList.addEventListener('click', handleHistoryClick);

els.favoriteList.addEventListener('click', async (event) => {
  const applyId = event.target.closest('[data-apply-favorite]')?.dataset.applyFavorite;
  const deleteId = event.target.closest('[data-delete-favorite]')?.dataset.deleteFavorite;
  if (applyId) applySettings(state.favorites.find((item) => item.id === applyId)?.settings);
  if (deleteId) {
    state.favorites = await api.deleteFavorite(deleteId);
    renderFavorites();
  }
});

document.querySelectorAll('[data-external-url]').forEach((button) => {
  button.addEventListener('click', async () => {
    const url = button.dataset.externalUrl;
    if (url) await api.openExternal(url);
  });
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

els.themeToggle.addEventListener('change', () => applyTheme(els.themeToggle.checked ? 'dark' : 'light', true));

els.languageSelect.addEventListener('change', () => setLanguage(els.languageSelect.value, true));

els.checkUpdatesBtn.addEventListener('click', async () => {
  setUpdateStatus('checking');
  const result = await api.checkForUpdates();
  if (result?.state) bindUpdateStatus(result);
});

api.onFileUpdate((update) => {
  // Update converter files
  if (state.files.some((f) => f.id === update.id)) {
    state.files = state.files.map((file) => file.id === update.id ? { ...file, ...update } : file);
    renderFiles();
  }
  // Update optimizer files
  if (optimizerState.files.some((f) => f.id === update.id)) {
    optimizerState.files = optimizerState.files.map((f) => f.id === update.id ? { ...f, ...update } : f);
    renderOptFiles();
  }
});

api.onBatchUpdate(({ completed, total }) => updateOverallProgress(completed, total));

api.onUpdateStatus((status) => bindUpdateStatus(status));

api.onDone(async (batch) => {
  state.completedBatch = batch;
  const data = await api.getAppData();
  state.history = data.history;
  renderHistory();
});

// ── Optimizer ──────────────────────────────────────────────────
const optimizerState = { files: [], outputDirectory: '' };

const optEls = {
  selectBtn: document.querySelector('#optimizeSelectBtn'),
  outputBtn: document.querySelector('#optimizeOutputBtn'),
  output: document.querySelector('#optimizeOutput'),
  startBtn: document.querySelector('#optimizeStartBtn'),
  clearBtn: document.querySelector('#optimizeClearBtn'),
  fileList: document.querySelector('#optimizeFileList'),
  dropZone: document.querySelector('#optimizeDropZone'),
  progressText: document.querySelector('#optimizeProgressText'),
  progressBar: document.querySelector('#optimizeProgressBar'),
  quality: document.querySelector('#optimizeQuality'),
  saveAllBtn: document.querySelector('#optimizeSaveAllBtn')
};

function renderOptFiles() {
  optEls.fileList.classList.toggle('empty', optimizerState.files.length === 0);
  if (!optimizerState.files.length) {
    optEls.fileList.innerHTML = `
      <div class="empty-drop" id="optEmptyDrop">
        <span class="drop-icon" aria-hidden="true" data-icon="Download"></span>
        <div>
          <strong>${translate('optimizer.dropTitle')}</strong>
          <span class="file-meta">${translate('optimizer.dropHint')}</span>
        </div>
      </div>
    `;
    paintIcons(optEls.fileList);
    return;
  }
  optEls.fileList.innerHTML = optimizerState.files.map((file) => {
    const preview = file.type === 'image'
      ? `<img src="${file.previewUrl}" alt="">`
      : file.type === 'video'
        ? `<video src="${file.previewUrl}" muted></video>`
        : file.type === 'audio'
          ? icons.audio
          : file.extension;
    const sizeInfo = file.outputSize
      ? ` → ${formatSize(file.outputSize)} (${file.outputSize < file.size ? '-' : '+'}${Math.abs(Math.round((1 - file.outputSize / file.size) * 100))}%)`
      : '';
    return `
      <article class="file-item" data-id="${file.id}">
        <div class="preview">${preview}</div>
        <div>
          <div class="file-name" title="${file.path}">${file.name}</div>
          <div class="file-meta">${file.type} · ${formatSize(file.size)}${sizeInfo}</div>
          <div class="progress"><span style="width:${file.progress || 0}%"></span></div>
        </div>
        <span></span>
        <span class="status ${file.status}">${statusLabel(file.status)}</span>
        <div class="file-actions">
          ${file.outputPath ? `<button class="ghost small" data-opt-open="${file.outputPath}">${icons.open}${translate('actions.open')}</button>` : ''}
          ${file.outputPath ? `<button class="ghost small" data-opt-save="${file.id}">${icons.save}${translate('actions.save')}</button>` : ''}
          <button class="ghost small icon-only" type="button" data-opt-remove="${file.id}">${icons.trash}</button>
        </div>
      </article>
    `;
  }).join('');
  paintIcons(optEls.fileList);
}

function mergeOptFiles(files) {
  const existing = new Set(optimizerState.files.map((f) => f.path));
  optimizerState.files = [...optimizerState.files, ...files.filter((f) => !existing.has(f.path))];
  renderOptFiles();
}

optEls.selectBtn.addEventListener('click', async () => mergeOptFiles(await api.selectFiles()));

optEls.outputBtn.addEventListener('click', async () => {
  const folder = await api.selectFolder();
  if (!folder) return;
  optimizerState.outputDirectory = folder;
  optEls.output.value = folder;
});

optEls.clearBtn.addEventListener('click', () => {
  optimizerState.files = [];
  optEls.progressText.textContent = '0%';
  optEls.progressBar.style.width = '0%';
  renderOptFiles();
});

optEls.saveAllBtn.addEventListener('click', async () => {
  const completed = optimizerState.files.filter((f) => f.outputPath);
  if (completed.length) await api.saveAll(completed);
});

optEls.fileList.addEventListener('click', async (event) => {
  if (event.target.closest('#optEmptyDrop')) {
    mergeOptFiles(await api.selectFiles());
    return;
  }
  const openPath = event.target.closest('[data-opt-open]')?.dataset.optOpen;
  if (openPath) { await api.openPath(openPath); return; }

  const saveId = event.target.closest('[data-opt-save]')?.dataset.optSave;
  if (saveId) {
    const file = optimizerState.files.find((f) => f.id === saveId);
    if (file) await api.saveFile(file);
    return;
  }

  const removeId = event.target.closest('[data-opt-remove]')?.dataset.optRemove;
  if (removeId) {
    optimizerState.files = optimizerState.files.filter((f) => f.id !== removeId);
    renderOptFiles();
  }
});

optEls.dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  optEls.dropZone.classList.add('dragover');
});
optEls.dropZone.addEventListener('dragleave', () => optEls.dropZone.classList.remove('dragover'));
optEls.dropZone.addEventListener('drop', async (event) => {
  event.preventDefault();
  optEls.dropZone.classList.remove('dragover');
  const paths = [...event.dataTransfer.files].map((f) => api.getPathForFile(f)).filter(Boolean);
  mergeOptFiles(await api.filesFromDrop(paths));
});

optEls.startBtn.addEventListener('click', async () => {
  if (!optimizerState.files.length) return;
  optimizerState.files = optimizerState.files.map((f) => ({ ...f, status: 'pending', progress: 0 }));
  renderOptFiles();
  // Re-use convert with same-format to optimize
  const result = await api.startConversion({
    files: optimizerState.files.map((f) => ({ ...f, outputFormat: f.extension, source: 'optimizer' })),
    globalFormat: '',
    outputDirectory: optimizerState.outputDirectory,
    settings: {
      video: { resolution: 'source', bitrate: '2500k', fps: 30 },
      audio: { bitrate: '128k', sampleRate: 44100, channels: 'stereo' },
      image: { quality: optEls.quality.value === 'max' ? 60 : optEls.quality.value === 'balanced' ? 75 : 95, width: '', height: '' },
      concurrency: 1
    }
  });
  if (result) {
    optimizerState.files = result.results || optimizerState.files;
    renderOptFiles();
  }
});

renderOptFiles();

async function init() {
  const data = await api.getAppData();
  state.formats = data.formats;
  state.history = data.history;
  state.favorites = data.favorites;
  if (els.appVersion && data.version) els.appVersion.textContent = data.version;
  renderGlobalFormats();
  renderFiles();
  renderHistory();
  renderFavorites();
  applySettings(data.favorites[0]?.settings);
  applyTheme(data.settings?.theme || 'dark');
  setLanguage(data.settings?.language || 'es');
  setUpdateStatus('updateIdle');
  paintIcons(document);
}

init();

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { randomUUID } = require('crypto');

const defaults = {
  history: [],
  favorites: [],
  settings: {
    theme: 'dark',
    language: 'es'
  }
};

function storePath() {
  const directory = app.getPath('userData');
  fs.mkdirSync(directory, { recursive: true });
  return path.join(directory, 'morpho.json');
}

function readStore() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(storePath(), 'utf8')) };
  } catch {
    return { ...defaults };
  }
}

function writeStore(data) {
  fs.writeFileSync(storePath(), JSON.stringify({ ...defaults, ...data }, null, 2));
}

function get(key, fallback) {
  return readStore()[key] ?? fallback;
}

function set(key, value) {
  const data = readStore();
  data[key] = value;
  writeStore(data);
}

function getHistory() {
  return get('history', []);
}

function addHistory(entry) {
  const history = getHistory();
  set('history', [entry, ...history].slice(0, 100));
}

function clearHistory() {
  set('history', []);
}

function getFavorites() {
  return get('favorites', []);
}

function saveFavorite(favorite) {
  const favorites = getFavorites();
  const id = favorite.id || randomUUID();
  const next = [{ ...favorite, id, updatedAt: new Date().toISOString() }, ...favorites.filter((item) => item.id !== id)];
  set('favorites', next.slice(0, 20));
  return next[0];
}

function deleteFavorite(id) {
  set('favorites', getFavorites().filter((item) => item.id !== id));
}

function getSettings() {
  return get('settings', defaults.settings);
}

function setSettings(settings) {
  set('settings', { ...getSettings(), ...settings });
  return getSettings();
}

module.exports = {
  addHistory,
  clearHistory,
  deleteFavorite,
  getFavorites,
  getHistory,
  getSettings,
  saveFavorite,
  setSettings
};

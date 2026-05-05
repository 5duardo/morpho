# Morpho

Aplicacion de escritorio con Electron para convertir archivos multimedia en lote.

## Funciones

- Carga multiple por selector manual y drag & drop.
- Soporte de video, imagen y audio:
  - Video: MP4, AVI, MOV, MKV, WEBM
  - Imagen: JPG, PNG, WEBP, BMP, GIF
  - Audio: MP3, WAV, AAC, OGG, FLAC
- Conversion por lote con formato global o formato individual por archivo.
- Progreso por archivo y progreso general.
- Exportacion de archivos convertidos y empaquetado `.zip`.
- Ajustes avanzados para video, audio e imagen.
- Historial, presets favoritos, tema oscuro y base para multilenguaje.

## Requisitos

- Node.js 20 o superior.
- Windows para generar instalador `.exe`.

## Instalacion

```powershell
npm.cmd install
```

## Desarrollo

```powershell
npm.cmd run dev
```

## Verificacion rapida

```powershell
npm.cmd run lint
```

## Generar .exe

```powershell
npm.cmd run build
```

El instalador queda en `dist/`.

## Auto updates

Morpho usa `electron-updater` y GitHub Releases. Para publicar una version:

1. Sube el codigo al repositorio `5duardo/morpho`.
2. Crea un tag semver, por ejemplo `v1.0.1`.
3. Empuja el tag a GitHub.

El workflow de release construye el instalador NSIS, crea la release y publica `latest.yml`, que Morpho consulta al iniciar cuando esta empaquetado.

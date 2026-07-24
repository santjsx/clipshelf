import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcLogo = 'C:\\Users\\heysa\\.gemini\\antigravity-ide\\brain\\15713d72-273d-4228-8835-58dd553ea746\\clipshelf_logo_1784894118121.png';
const projectDir = __dirname;

const assetsDir = path.join(projectDir, 'src', 'assets');
const iconsDir = path.join(projectDir, 'src-tauri', 'icons');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const bytes = fs.readFileSync(srcLogo);

// Save to frontend assets & tauri icons
fs.writeFileSync(path.join(assetsDir, 'logo.png'), bytes);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), bytes);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), bytes);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), bytes);
fs.writeFileSync(path.join(iconsDir, '32x32.png'), bytes);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), bytes);

// Build valid ICO wrapping PNG
const width = 0; // 256x256
const height = 0;
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

const icoDirEntry = Buffer.alloc(16);
icoDirEntry.writeUInt8(width, 0);
icoDirEntry.writeUInt8(height, 1);
icoDirEntry.writeUInt8(0, 2);
icoDirEntry.writeUInt8(0, 3);
icoDirEntry.writeUInt16LE(1, 4);
icoDirEntry.writeUInt16LE(32, 6);
icoDirEntry.writeUInt32LE(bytes.length, 8);
icoDirEntry.writeUInt32LE(22, 12);

const icoFile = Buffer.concat([icoHeader, icoDirEntry, bytes]);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoFile);

console.log('Successfully copied logo to src/assets/logo.png and src-tauri/icons/');

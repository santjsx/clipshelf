import fs from 'fs';
import path from 'path';
import { Connection } from 'sqlite3';

const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\heysa\\AppData\\Local';
const dbPath = path.join(localAppData, 'ClipShelf', 'clipshelf.db');

console.log('DB Path:', dbPath);
console.log('Exists:', fs.existsSync(dbPath));

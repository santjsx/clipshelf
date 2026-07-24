import fs from 'fs';

const buffer = fs.readFileSync('c:\\Users\\heysa\\Documents\\Dev\\clipboard\\src\\assets\\logo.png');

console.log('Converted Magic bytes:', buffer.subarray(0, 16).toString('hex'));
console.log('Converted Magic ASCII:', buffer.subarray(0, 16).toString('ascii'));

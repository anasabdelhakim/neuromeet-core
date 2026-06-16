import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    
    // Ignore shadcn/ui folders to keep shadcn UI as it is
    if (filePath.includes(path.join('src', 'components', 'ui')) || filePath.includes(path.join('src', 'ui'))) {
      continue;
    }

    if (fs.statSync(filePath).isDirectory()) {
      fileList = getAllTsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

const files = getAllTsxFiles(srcDir);
let changedFilesCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // 1. Z-Index replacements (only mapping to existing variables, leaving others unchanged)
  content = content.replace(/\bz\-50\b/g, 'z-dropdown');
  content = content.replace(/\bz\-100\b/g, 'z-sticky');
  content = content.replace(/\bz\-200\b/g, 'z-overlay');
  content = content.replace(/\bz\-300\b/g, 'z-modal');
  content = content.replace(/\bz\-400\b/g, 'z-toast');

  // 2. Duration replacements
  content = content.replace(/\bduration-(?:100|150|200)\b/g, 'duration-fast');
  content = content.replace(/\bduration-(?:250|300|350|400|450|500)\b/g, 'duration-normal');
  content = content.replace(/\bduration-(?:600|700|800|1000)\b/g, 'duration-slow');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    changedFilesCount++;
    console.log(`Refactored: ${path.relative(__dirname, file)}`);
  }
}

console.log(`\nRefactoring complete! Updated ${changedFilesCount} files with existing z-index variables and transition durations.`);

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
    
    // Ignore shadcn/ui folder explicitly to keep shadcn UI as it is
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

  // 1. Soft (lg, xl, 2xl, 3xl, card, panel) -> soft
  content = content.replace(/\brounded-(t|b|l|r|tl|tr|bl|br)-(?:lg|xl|2xl|3xl|card|panel)\b/g, 'rounded-$1-soft');
  content = content.replace(/\brounded-(?:lg|xl|2xl|3xl|card|panel)\b/g, 'rounded-soft');

  // 2. Medium (md, button, input, popover) -> medium
  content = content.replace(/\brounded-(t|b|l|r|tl|tr|bl|br)-(?:md|button|input|popover)\b/g, 'rounded-$1-medium');
  content = content.replace(/\brounded-(?:md|button|input|popover)\b/g, 'rounded-medium');

  // 3. Plain rounded (default md) -> rounded-medium
  content = content.replace(/\brounded\b(?!\-)/g, 'rounded-medium');

  // 4. Hard (sm, badge) -> hard
  content = content.replace(/\brounded-(t|b|l|r|tl|tr|bl|br)-(?:sm|badge)\b/g, 'rounded-$1-hard');
  content = content.replace(/\brounded-(?:sm|badge)\b/g, 'rounded-hard');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    changedFilesCount++;
    console.log(`Normalized: ${path.relative(__dirname, file)}`);
  }
}

console.log(`\nNormalization complete! Updated ${changedFilesCount} files to the new semantic naming scale (soft, medium, hard).`);

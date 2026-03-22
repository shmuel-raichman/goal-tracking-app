const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-emerald-500 border-emerald-500 text-\[var\(--text-main\)\]/g, replacement: 'bg-emerald-500 border-emerald-500 text-white' },
  { regex: /bg-red-500 border-red-500 text-\[var\(--text-main\)\]/g, replacement: 'bg-red-500 border-red-500 text-white' },
  { regex: /text-emerald-400/g, replacement: 'text-emerald-500 dark:text-emerald-400' },
  { regex: /text-red-400/g, replacement: 'text-red-500 dark:text-red-400' },
  { regex: /text-blue-400/g, replacement: 'text-blue-500 dark:text-blue-400' },
  { regex: /text-amber-400/g, replacement: 'text-amber-500 dark:text-amber-400' },
  { regex: /text-indigo-400/g, replacement: 'text-indigo-500 dark:text-indigo-400' },
  { regex: /bg-\[#0F172A\]/g, replacement: 'bg-[var(--bg-main)]' },
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(path.join(__dirname, 'src'));

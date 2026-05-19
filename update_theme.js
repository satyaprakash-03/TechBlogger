const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'client', 'src');

const replacements = [
  { regex: /bg-zinc-900/g, replacement: 'bg-white dark:bg-zinc-900' },
  { regex: /bg-zinc-800/g, replacement: 'bg-zinc-100 dark:bg-zinc-800' },
  { regex: /bg-\[\#09090b\]/g, replacement: 'bg-slate-50 dark:bg-[#09090b]' },
  { regex: /bg-zinc-950/g, replacement: 'bg-slate-100 dark:bg-zinc-950' },
  { regex: /text-white/g, replacement: 'text-zinc-900 dark:text-white' },
  { regex: /text-zinc-100/g, replacement: 'text-zinc-800 dark:text-zinc-100' },
  { regex: /text-zinc-200/g, replacement: 'text-zinc-700 dark:text-zinc-200' },
  { regex: /text-zinc-300/g, replacement: 'text-zinc-600 dark:text-zinc-300' },
  { regex: /text-zinc-400/g, replacement: 'text-zinc-500 dark:text-zinc-400' },
  { regex: /text-zinc-500/g, replacement: 'text-zinc-400 dark:text-zinc-500' },
  { regex: /border-zinc-800/g, replacement: 'border-zinc-200 dark:border-zinc-800' },
  { regex: /border-zinc-700/g, replacement: 'border-zinc-300 dark:border-zinc-700' },
  { regex: /border-zinc-900/g, replacement: 'border-zinc-100 dark:border-zinc-900' },
  { regex: /text-transparent bg-clip-text/g, replacement: 'text-transparent bg-clip-text' } // just in case
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(directoryPath);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Apply replacements
  // Be careful not to duplicate if script is run twice
  replacements.forEach(rule => {
    // We can just do a naive replace if we ensure no double replace
    // Actually, to prevent double replacing, let's use a function that checks
    content = content.replace(rule.regex, (match, offset, string) => {
      // Check if it's already prefixed by dark: or light counterpart
      const before = string.slice(Math.max(0, offset - 10), offset);
      if (before.includes('dark:')) return match; // already handled somewhat
      
      // Also we need to make sure we don't end up with e.g. "bg-white bg-white dark:bg-zinc-900" 
      // but this script is only run once so it should be fine.
      return rule.replacement;
    });
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated:', file);
});

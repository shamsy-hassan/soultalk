import fs from 'node:fs/promises';
import path from 'node:path';

const FRONTEND_ROOT = path.resolve(import.meta.dirname, '..', '..');
const SRC_ROOT = path.join(FRONTEND_ROOT, 'src');
const LOCALES_ROOT = path.join(SRC_ROOT, 'locales');

const HUMANIZE_UPPER = new Set(['otp', 'ui', 'ux', 'ai', 'id']);
const humanizeKey = (key) => {
  const words = key
    .split('_')
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      if (HUMANIZE_UPPER.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

  if (!words.length) return key;
  // Prefer sentence-ish casing (only first word capitalized) for longer strings.
  if (words.length > 3) {
    return [words[0], ...words.slice(1).map((w) => w.toLowerCase())].join(' ');
  }
  return words.join(' ');
};

const isSourceFile = (filePath) =>
  filePath.endsWith('.js') ||
  filePath.endsWith('.jsx') ||
  filePath.endsWith('.ts') ||
  filePath.endsWith('.tsx');

const shouldSkipDir = (dirName) => dirName === 'locales' || dirName === 'node_modules' || dirName === 'dist';

const listSourceFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      results.push(...(await listSourceFiles(full)));
      continue;
    }
    if (entry.isFile() && isSourceFile(full)) results.push(full);
  }
  return results;
};

const extractKeysAndDefaults = async () => {
  const files = await listSourceFiles(SRC_ROOT);

  const usedKeys = new Set();
  const defaultValues = new Map();

  const keyRegex = /(?:\bt\s*\(|\bi18n\.t\s*\()\s*['\"]([^'\"]+)['\"]/g;

  // Line-based extraction for defaultValue: '...' or "..." or `...` without interpolation.
  const defaultSingle = /\bt\(\s*['\"]([^'\"]+)['\"]\s*,\s*\{[^}]*\bdefaultValue\s*:\s*'([^']*)'/;
  const defaultDouble = /\bt\(\s*['\"]([^'\"]+)['\"]\s*,\s*\{[^}]*\bdefaultValue\s*:\s*\"([^\"]*)\"/;
  const defaultBacktick = /\bt\(\s*['\"]([^'\"]+)['\"]\s*,\s*\{[^}]*\bdefaultValue\s*:\s*`([^`]*)`/;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    for (const match of content.matchAll(keyRegex)) {
      usedKeys.add(match[1]);
    }

    // Default values are mostly on one line; this keeps the extractor dependency-free.
    for (const line of content.split(/\r?\n/)) {
      let m = line.match(defaultSingle);
      if (!m) m = line.match(defaultDouble);
      if (!m) {
        const mb = line.match(defaultBacktick);
        if (mb && !mb[2].includes('${')) m = mb;
      }

      if (!m) continue;
      const key = m[1];
      const val = m[2];
      if (!defaultValues.has(key) && typeof val === 'string' && val.trim()) {
        defaultValues.set(key, val);
      }
    }
  }

  return { usedKeys, defaultValues };
};

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const writeJson = async (filePath, obj) => {
  const json = JSON.stringify(obj, null, 2) + '\n';
  await fs.writeFile(filePath, json, 'utf8');
};

const main = async () => {
  const localeDirs = (await fs.readdir(LOCALES_ROOT, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const localeFiles = localeDirs.map((code) => ({
    code,
    filePath: path.join(LOCALES_ROOT, code, 'translation.json'),
  }));

  const locales = new Map();
  for (const { code, filePath } of localeFiles) {
    locales.set(code, await readJson(filePath));
  }

  const en = locales.get('en');
  if (!en) throw new Error('Missing en locale at frontend/src/locales/en/translation.json');

  const { usedKeys, defaultValues } = await extractKeysAndDefaults();

  // Ensure language names exist for supported UI languages.
  for (const code of localeDirs) {
    usedKeys.add(`language_${code}`);
  }

  const existingEnKeys = new Set(Object.keys(en));
  const missingInEn = [...usedKeys].filter((k) => !existingEnKeys.has(k)).sort();

  for (const key of missingInEn) {
    en[key] = defaultValues.get(key) ?? humanizeKey(key);
  }

  // Apply to all locales (only fill missing keys; never overwrite existing translations).
  for (const [code, data] of locales.entries()) {
    const existing = new Set(Object.keys(data));
    for (const key of missingInEn) {
      if (!existing.has(key)) {
        data[key] = en[key];
      }
    }
    locales.set(code, data);
  }

  for (const { code, filePath } of localeFiles) {
    await writeJson(filePath, locales.get(code));
  }

  process.stdout.write(
    `Synced ${localeFiles.length} locales. Added ${missingInEn.length} keys (from code usage)\n`
  );
};

await main();

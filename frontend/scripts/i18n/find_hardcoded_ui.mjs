import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const FRONTEND_ROOT = path.resolve(import.meta.dirname, '..', '..');
const SRC_ROOT = path.join(FRONTEND_ROOT, 'src');

const traverseAst = traverse?.default ?? traverse;

const isSourceFile = (filePath) =>
  filePath.endsWith('.js') ||
  filePath.endsWith('.jsx') ||
  filePath.endsWith('.ts') ||
  filePath.endsWith('.tsx');

const shouldSkipDir = (dirName) =>
  dirName === 'locales' || dirName === 'node_modules' || dirName === 'dist' || dirName === 'assets';

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

const IGNORED_ATTRS = new Set([
  'className',
  'id',
  'type',
  'name',
  'value',
  'href',
  'to',
  'src',
  'width',
  'height',
  'viewBox',
  'd',
  'fill',
  'stroke',
  'role',
  'tabIndex',
  'target',
  'rel',
  'autoComplete',
  'inputMode',
  'pattern',
  'accept',
  'min',
  'max',
  'step',
]);

const isMostlyPunctuation = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return /^[\s•—–·…!?:;.,()\[\]{}<>]+$/.test(trimmed);
};

const main = async () => {
  const files = await listSourceFiles(SRC_ROOT);
  const findings = [];

  for (const filePath of files) {
    const code = await fs.readFile(filePath, 'utf8');

    let ast;
    try {
      ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true,
      });
    } catch {
      continue;
    }

    traverseAst(ast, {
      JSXText(p) {
        const value = p.node.value;
        const trimmed = value.trim();
        if (!trimmed) return;
        if (isMostlyPunctuation(trimmed)) return;

        findings.push({
          filePath,
          line: p.node.loc?.start.line ?? null,
          kind: 'JSXText',
          text: trimmed,
        });
      },
      JSXAttribute(p) {
        const name = p.node.name?.name;
        if (!name || typeof name !== 'string') return;
        if (IGNORED_ATTRS.has(name)) return;

        const v = p.node.value;
        if (!v || v.type !== 'StringLiteral') return;
        const text = v.value?.trim();
        if (!text) return;
        if (isMostlyPunctuation(text)) return;

        findings.push({
          filePath,
          line: v.loc?.start.line ?? null,
          kind: `JSXAttr:${name}`,
          text,
        });
      },
    });
  }

  findings.sort((a, b) =>
    a.filePath === b.filePath ? (a.line ?? 0) - (b.line ?? 0) : a.filePath.localeCompare(b.filePath)
  );

  const byFile = new Map();
  for (const f of findings) {
    const rel = path.relative(FRONTEND_ROOT, f.filePath);
    if (!byFile.has(rel)) byFile.set(rel, []);
    byFile.get(rel).push(f);
  }

  process.stdout.write(`Hardcoded UI strings (heuristic): ${findings.length}\n`);
  for (const [rel, list] of byFile.entries()) {
    process.stdout.write(`\n- ${rel} (${list.length})\n`);
    for (const item of list.slice(0, 30)) {
      const at = item.line ? `:${item.line}` : '';
      process.stdout.write(`  ${item.kind}${at}: ${JSON.stringify(item.text)}\n`);
    }
    if (list.length > 30) {
      process.stdout.write(`  ... +${list.length - 30} more\n`);
    }
  }

  process.exitCode = findings.length ? 1 : 0;
};

await main();

#!/usr/bin/env node
/**
 * Tredegar Design System — Figma token export.
 *
 * Merges the canonical DTCG sources (tokens/primitives.json + tokens/semantic.json)
 * into a single import-ready file: tokens/tredegar.figma.tokens.json
 *
 * Import it into Figma with a DTCG-compatible plugin (e.g. Tokens Studio, or the
 * free "Variables Import Export" community plugin) to sync the file's variables.
 * Primitive colors -> COLOR variables; dimensions -> FLOAT (px stripped on import);
 * semantic tokens import as aliases because their values use {reference} syntax.
 */
const fs = require('fs');
const path = require('path');

const tokensDir = path.join(__dirname, '..', 'tokens');
const out = path.join(tokensDir, 'tredegar.figma.tokens.json');

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(tokensDir, name), 'utf8'));
}

// Deep-merge so the primitive and semantic trees combine into one document.
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const merged = deepMerge(read('primitives.json'), read('semantic.json'));

// Figma's number variables can't carry easing; drop cubic-bezier from the export.
delete merged['ease-out'];

fs.writeFileSync(out, JSON.stringify(merged, null, 2) + '\n');
console.log('Wrote ' + path.relative(path.join(__dirname, '..'), out));

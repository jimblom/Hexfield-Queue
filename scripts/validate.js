#!/usr/bin/env node
/**
 * Hexfield Queue — Schema Validator
 * Usage: node scripts/validate.js <file.queue.yaml> [file2.queue.yaml ...]
 * Exit 0: all files valid. Exit 1: any errors found.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const VALID_TYPES = new Set(['track', 'album']);
const VALID_GENERATED_BY = new Set(['human', 'claude', 'import']);

function validateQueue(filePath) {
  const errors = [];
  const warnings = [];

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return { errors: [`Cannot read file: ${e.message}`], warnings: [] };
  }

  let doc;
  try {
    doc = yaml.load(raw);
  } catch (e) {
    return { errors: [`YAML parse error: ${e.message}`], warnings: [] };
  }

  if (!doc || typeof doc !== 'object') {
    return { errors: ['File does not contain a valid YAML object.'], warnings: [] };
  }

  // version
  if (!doc.version) {
    errors.push('Missing required field: version');
  } else if (doc.version !== '0.1') {
    warnings.push(`Unknown schema version: "${doc.version}" (expected "0.1")`);
  }

  // meta
  if (!doc.meta || typeof doc.meta !== 'object') {
    errors.push('Missing required field: meta');
  } else {
    if (!doc.meta.title || typeof doc.meta.title !== 'string' || !doc.meta.title.trim()) {
      errors.push('Missing required field: meta.title');
    }
    if (doc.meta.generated_by && !VALID_GENERATED_BY.has(doc.meta.generated_by)) {
      errors.push(`Invalid meta.generated_by: "${doc.meta.generated_by}" — must be "human", "claude", or "import"`);
    }
    if (doc.meta.created && !/^\d{4}-\d{2}-\d{2}$/.test(doc.meta.created)) {
      warnings.push(`meta.created "${doc.meta.created}" is not ISO 8601 format (YYYY-MM-DD)`);
    }
  }

  // tracks
  if (!Array.isArray(doc.tracks)) {
    errors.push('Missing required field: tracks (must be an array)');
  } else if (doc.tracks.length === 0) {
    errors.push('tracks array is empty — a queue must have at least one entry');
  } else {
    doc.tracks.forEach((track, i) => {
      const label = `tracks[${i}]`;

      if (!track.type) {
        errors.push(`${label}: missing required field "type"`);
      } else if (!VALID_TYPES.has(track.type)) {
        errors.push(`${label}: invalid type "${track.type}" — must be "track" or "album"`);
      }

      if (!track.title || typeof track.title !== 'string' || !track.title.trim()) {
        errors.push(`${label}: missing required field "title"`);
      }

      if (!track.artist || typeof track.artist !== 'string' || !track.artist.trim()) {
        errors.push(`${label}: missing required field "artist"`);
      }

      if (track.type === 'track' && !track.album) {
        errors.push(`${label}: type "track" requires an "album" field`);
      }

      if (track.year !== undefined && (!Number.isInteger(track.year) || track.year < 1000 || track.year > 9999)) {
        warnings.push(`${label}: year "${track.year}" does not look like a valid 4-digit year`);
      }
    });
  }

  return { errors, warnings };
}

function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.error('Usage: node scripts/validate.js <file.queue.yaml> [...]');
    process.exit(1);
  }

  let anyErrors = false;

  for (const file of files) {
    const { errors, warnings } = validateQueue(file);
    const name = path.relative(process.cwd(), file);

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`✓ ${name}`);
    } else {
      if (errors.length > 0) {
        anyErrors = true;
        console.error(`✗ ${name}`);
        errors.forEach(e => console.error(`    error: ${e}`));
      } else {
        console.log(`~ ${name}`);
      }
      warnings.forEach(w => console.warn(`    warn:  ${w}`));
    }
  }

  process.exit(anyErrors ? 1 : 0);
}

main();

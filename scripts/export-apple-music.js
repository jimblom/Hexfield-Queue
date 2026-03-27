#!/usr/bin/env node
/**
 * Hexfield Queue — Apple Music CSV Exporter
 * Usage: node scripts/export-apple-music.js <file.queue.yaml>
 * Output: [playlist-title].csv in current working directory
 *
 * Columns: Name,Artist,Album,Year,Comments
 * - type: track → one row per track
 * - type: album → one row with album as Name, no track title
 *   (import to Apple Music, then play the album in order)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function csvCell(value) {
  if (value === undefined || value === null) return '';
  const str = String(value);
  // Quote cells that contain commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function csvRow(cells) {
  return cells.map(csvCell).join(',');
}

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node scripts/export-apple-music.js <file.queue.yaml>');
    process.exit(1);
  }

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(`Cannot read file: ${e.message}`);
    process.exit(1);
  }

  let doc;
  try {
    doc = yaml.load(raw);
  } catch (e) {
    console.error(`YAML parse error: ${e.message}`);
    process.exit(1);
  }

  if (!doc || !doc.meta || !doc.meta.title) {
    console.error('Invalid queue file: missing meta.title');
    process.exit(1);
  }

  if (!Array.isArray(doc.tracks) || doc.tracks.length === 0) {
    console.error('Invalid queue file: no tracks found');
    process.exit(1);
  }

  const rows = [csvRow(['Name', 'Artist', 'Album', 'Year', 'Comments'])];

  for (const track of doc.tracks) {
    if (track.type === 'track') {
      rows.push(csvRow([
        track.title,
        track.artist,
        track.album || '',
        track.year || '',
        track.notes || '',
      ]));
    } else if (track.type === 'album') {
      // Emit a single row representing the album.
      // Apple Music import: add the album row, then play it in order.
      rows.push(csvRow([
        track.title,
        track.artist,
        track.title,   // album = title for album entries
        track.year || '',
        track.notes ? `[Album] ${track.notes}` : '[Album — play in full]',
      ]));
    }
  }

  const outputName = slugify(doc.meta.title) + '.csv';
  const outputPath = path.join(process.cwd(), outputName);

  fs.writeFileSync(outputPath, rows.join('\n') + '\n', 'utf8');

  console.log(`Exported ${doc.tracks.length} entries → ${outputName}`);
}

main();

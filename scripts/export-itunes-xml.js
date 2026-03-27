#!/usr/bin/env node
/**
 * Hexfield Queue — iTunes XML Exporter
 * Usage: node scripts/export-itunes-xml.js <file.queue.yaml>
 * Output: [playlist-title].xml in current working directory
 *
 * Generates an iTunes Library XML (plist) file that Music.app can import
 * via File → Library → Import Playlist...
 *
 * NOTE: Music.app matches imported tracks against your local library by
 * Name + Artist + Album. Tracks must exist in your library (added from
 * Apple Music or as local files) to be found and added to the playlist.
 * See docs/apple-music-export-options.md for full option trade-off analysis.
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

function escapeXml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function plistString(value) {
  return `<string>${escapeXml(value)}</string>`;
}

function plistInteger(value) {
  return `<integer>${parseInt(value, 10)}</integer>`;
}

function buildTrackDict(track, trackId) {
  const lines = [];
  lines.push(`\t\t<key>${trackId}</key>`);
  lines.push(`\t\t<dict>`);
  lines.push(`\t\t\t<key>Track ID</key>${plistInteger(trackId)}`);
  lines.push(`\t\t\t<key>Name</key>${plistString(track.title)}`);
  lines.push(`\t\t\t<key>Artist</key>${plistString(track.artist)}`);

  if (track.type === 'track' && track.album) {
    lines.push(`\t\t\t<key>Album</key>${plistString(track.album)}`);
  } else if (track.type === 'album') {
    // For album entries, Name is the album title — set Album = Name
    lines.push(`\t\t\t<key>Album</key>${plistString(track.title)}`);
  }

  if (track.year) {
    lines.push(`\t\t\t<key>Year</key>${plistInteger(track.year)}`);
  }

  // Kind hint — helps Music.app know these are streaming tracks
  lines.push(`\t\t\t<key>Kind</key>${plistString('Apple Music AAC audio file')}`);

  if (track.notes) {
    lines.push(`\t\t\t<key>Comments</key>${plistString(track.notes)}`);
  }

  lines.push(`\t\t</dict>`);
  return lines.join('\n');
}

function buildPlaylistItems(tracks) {
  return tracks
    .map((_, i) => {
      const trackId = i + 1;
      return `\t\t\t\t<dict><key>Track ID</key>${plistInteger(trackId)}</dict>`;
    })
    .join('\n');
}

function buildXml(doc) {
  const tracks = doc.tracks;
  const title = doc.meta.title;

  const trackDicts = tracks
    .map((track, i) => buildTrackDict(track, i + 1))
    .join('\n');

  const playlistItems = buildPlaylistItems(tracks);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>Major Version</key><integer>1</integer>
\t<key>Minor Version</key><integer>1</integer>
\t<key>Application Version</key><string>12.9.4.102</string>
\t<key>Music Folder</key><string>file:///Music/</string>
\t<key>Library Persistent ID</key><string>0000000000000001</string>
\t<key>Tracks</key>
\t<dict>
${trackDicts}
\t</dict>
\t<key>Playlists</key>
\t<array>
\t\t<dict>
\t\t\t<key>Name</key>${plistString(title)}
\t\t\t<key>Description</key>${plistString(doc.meta.description || '')}
\t\t\t<key>Playlist ID</key><integer>1</integer>
\t\t\t<key>Playlist Persistent ID</key><string>0000000000000002</string>
\t\t\t<key>All Items</key><true/>
\t\t\t<key>Playlist Items</key>
\t\t\t<array>
${playlistItems}
\t\t\t</array>
\t\t</dict>
\t</array>
</dict>
</plist>
`;
}

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node scripts/export-itunes-xml.js <file.queue.yaml>');
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

  const xml = buildXml(doc);
  const outputName = slugify(doc.meta.title) + '.xml';
  const outputPath = path.join(process.cwd(), outputName);

  fs.writeFileSync(outputPath, xml, 'utf8');

  console.log(`Exported ${doc.tracks.length} entries → ${outputName}`);
  console.log(`Import: File → Library → Import Playlist... in Music.app`);
  console.log(`Note: tracks must exist in your Apple Music library to be matched.`);
}

main();

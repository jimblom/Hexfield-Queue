# Hexfield Queue

A YAML-based playlist standard, Claude-powered generation pipeline, and music service export tool. Part of the [Hexfield](https://github.com/jimblom) ecosystem.

---

## What Is It?

**Hexfield Queue** is two things:

1. **A playlist standard** — an open, human-writable, AI-generatable YAML schema for describing playlists. Service-agnostic. Lives in Git. Diffable, readable, forkable.

2. **A translation pipeline** — takes conforming `.queue.yaml` files and exports them to music services. MVP: Apple Music via CSV.

It is **not** a web app. The editing experience is your text editor. The visual experience is [Hexfield Deck](https://github.com/jimblom/Hexfield-Deck).

---

## Quick Start

```bash
npm install

# Validate a queue file
node scripts/validate.js examples/intro-black-pistol-fire.queue.yaml

# Export to Apple Music CSV
node scripts/export-apple-music.js examples/intro-black-pistol-fire.queue.yaml
```

---

## The Format

Queue files use the `.queue.yaml` extension. Here's a minimal example:

```yaml
version: "0.1"
meta:
  title: "Friday Night Drive"
  created: "2026-03-26"
  generated_by: "human"

tracks:
  - type: track
    title: "Running Down a Dream"
    artist: "Tom Petty"
    album: "Full Moon Fever"
    year: 1989

  - type: album
    title: "Rumours"
    artist: "Fleetwood Mac"
    year: 1977
    notes: "Play in full."
```

See [`spec/schema-v0.1.md`](spec/schema-v0.1.md) for the full schema reference.

---

## Generating with Claude

Drop the contents of [`prompts/system-prompt.md`](prompts/system-prompt.md) into a Claude conversation as the system prompt, then describe your playlist in natural language. Claude outputs a valid `.queue.yaml` directly.

---

## Export Pipeline

### Apple Music (MVP)

```bash
node scripts/export-apple-music.js <file.queue.yaml>
# → outputs [playlist-title].csv
```

Import the CSV via **File → Library → Import Playlist...** in the Music app on macOS.

---

## Hexfield Deck Integration

Hexfield Deck renders `.queue.yaml` files as draggable song/album cards in a VS Code webview. Reordering cards syncs back to the source YAML. See the [Hexfield Deck repo](https://github.com/jimblom/Hexfield-Deck) for details.

---

## Repository Structure

```
Hexfield-Queue/
├── examples/               # Real, playable queue files
├── prompts/                # Claude generation system prompt
├── scripts/
│   ├── validate.js         # Schema validator
│   └── export-apple-music.js
├── spec/
│   └── schema-v0.1.md      # Formal schema documentation
└── .github/workflows/
    └── validate.yml        # CI validation
```

---

*Maintained by [@jimblom](https://github.com/jimblom) · Part of the Hexfield ecosystem*

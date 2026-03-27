# CLAUDE.md — Hexfield Queue

> A YAML-based playlist standard, Claude-powered generation pipeline, and music service export tool.
> Part of the Hexfield ecosystem. Companion to Hexfield Deck.

---

## What Is Hexfield Queue?

Hexfield Queue is two things:

1. **A playlist standard** — an open, human-writable, AI-generatable YAML schema for describing playlists. Service-agnostic. Lives in Git. Diffable, readable, forkable.

2. **A translation pipeline** — takes conforming `.queue.yaml` files and exports them to music services. MVP target: Apple Music via CSV. Future: MusicKit JS, Spotify, etc.

It is **not** a web app UI. It is a format spec and a pipeline. The editing experience is your text editor (VS Code, GitHub mobile, anything). The visual experience is Hexfield Deck.

---

## Ecosystem Context

Hexfield is a suite of plaintext-first productivity tools by [@jimblom](https://github.com/jimblom). All products share the principle: **the file is the source of truth, visuals are a layer on top**.

| Product | Input | Visual Layer |
|---|---|---|
| Hexfield Deck | Markdown weekly planner | Kanban board (VS Code webview) |
| Hexfield Text | Natural language | Structured text output |
| **Hexfield Queue** | YAML playlist files | Song/album cards in Deck (VS Code webview) |

**Key relationship:** Hexfield Deck is being extended to render `.queue.yaml` files as draggable song/album cards. Hexfield Queue defines the format; Deck displays it. These are sister repos — changes to the schema must be coordinated with Hexfield Deck.

---

## Naming Convention

All Hexfield products follow the pattern: **`Hexfield [Word]`** where the word is evocative of the tool's function.

This project lives under the `hexfield` GitHub org or jimblom's personal account depending on org migration status. Check before creating forks or PRs.

> ⚠️ Do not create standalone brand names for features. If it benefits from VS Code visual rendering, it's a Hexfield product.

---

## The YAML Standard

### File Extension
`.queue.yaml`

### Philosophy
- Human-writable first. A person with a text editor and no tooling should be able to create a valid queue file.
- AI-generatable second. Claude (or any LLM) should be able to produce valid queue files from natural language prompts.
- Service-agnostic always. No Spotify IDs, no Apple Music IDs in the core schema. Export adapters handle service-specific lookups.

### Schema (v0.1)

```yaml
# Hexfield Queue — .queue.yaml
version: "0.1"
meta:
  title: "Introduction to Black Pistol Fire"
  description: "Start with latest, then their best album, then most popular, then influences and contemporaries."
  created: "2026-03-26"
  tags: ["rock", "blues-rock", "introduction"]
  generated_by: "claude"        # "human" | "claude" | "import"
  prompt: |                     # optional — the natural language prompt that generated this, if AI-generated
    Introduce me to Black Pistol Fire. Start with their latest release,
    then their most critically recognized album in full, then their most
    popular tracks. Follow with artists who influenced them and contemporaries.

tracks:
  - type: track                 # "track" | "album"
    title: "Railhead"
    artist: "Black Pistol Fire"
    album: "Deadwater"
    year: 2023
    notes: "Latest single as of generation date."

  - type: album
    title: "Deadwater"
    artist: "Black Pistol Fire"
    year: 2023
    notes: "Most recent full album — play in full."

  - type: track
    title: "Suffocation Blues"
    artist: "Black Pistol Fire"
    album: "Big Beat '59"
    year: 2014
    notes: "Their most popular track by streams."

  - type: track
    title: "Garbage Fire"
    artist: "Black Pistol Fire"
    album: "Deadwater"
    year: 2023

  - type: track
    title: "Lonely Boy"
    artist: "The Black Keys"
    album: "El Camino"
    year: 2011
    notes: "Influence/contemporary — similar blues-rock energy."
```

### Field Reference

| Field | Required | Type | Notes |
|---|---|---|---|
| `version` | yes | string | Schema version. Current: `"0.1"` |
| `meta.title` | yes | string | Human-readable playlist name |
| `meta.description` | no | string | Intent/context for the playlist |
| `meta.created` | no | ISO date | |
| `meta.tags` | no | string[] | Genre, mood, etc. |
| `meta.generated_by` | no | enum | `"human"` \| `"claude"` \| `"import"` |
| `meta.prompt` | no | string | Original NL prompt if AI-generated |
| `tracks[].type` | yes | enum | `"track"` \| `"album"` |
| `tracks[].title` | yes | string | Track or album title |
| `tracks[].artist` | yes | string | Primary artist |
| `tracks[].album` | no* | string | Required for `type: track` |
| `tracks[].year` | no | integer | Release year |
| `tracks[].notes` | no | string | Human/AI annotation — shown in Deck card |

---

## Claude Generation

### The Generation Interface

Claude should be invoked via a system prompt that:
1. Knows the schema (include schema reference above)
2. Understands functional playlist recipes (see below)
3. Always outputs valid `.queue.yaml` — no prose, no markdown fences, just YAML

### System Prompt Template

```
You are a music expert and playlist curator. When given a natural language playlist request, you output a valid Hexfield Queue YAML file conforming to the schema below and nothing else — no explanation, no markdown code fences, just raw YAML.

[PASTE SCHEMA REFERENCE HERE]

Rules:
- Always include meta.generated_by: "claude"
- Always include meta.prompt with the original request
- Use type: album when the intent is to play a full album in sequence
- Use type: track for individual songs
- Include notes fields to explain curatorial decisions
- Be specific with years and album names — do not guess; if uncertain, omit the field
- Respect functional recipe language (see below)
```

### Functional Recipe Language

The prompt interface supports parameterized playlist recipes. Claude should understand and honor these patterns:

| Recipe phrase | Interpretation |
|---|---|
| "start with their latest" | Most recent release by date |
| "their best album" / "most recognized" | Critically acclaimed album (Metacritic, general consensus) |
| "most popular" | Highest stream count / chart performance |
| "second most popular if already played" | Dedup logic — skip if already in queue |
| "influences" | Artists who shaped this artist's sound |
| "contemporaries" | Artists working in same genre/era |
| "introduce me to X" | Curated gateway sequence: latest → best → popular → context |
| "play in full" | Expand to `type: album` |

Future: these recipes may be formalized as a `recipe:` field in the schema, generating a `tracks:` list as output. For now, Claude resolves them at generation time.

---

## Export Pipeline

### MVP: Apple Music CSV

Apple Music's "Music" app on macOS accepts a CSV import with columns:
```
Name,Artist,Album,Genre,Size,Time,Disc Number,Track Number,Year,Date Modified,Date Added,Bit Rate,Sample Rate,Volume Adjustment,Kind,Equalizer,Comments,Plays,Last Played,Skipped,Last Skipped,My Rating,Location
```

For our purposes, the minimum viable columns are:
```
Name,Artist,Album,Year,Comments
```

The export script (`scripts/export-apple-music.js` or `.py`) should:
1. Parse the `.queue.yaml` file
2. For `type: track` entries: emit one CSV row
3. For `type: album` entries: emit a row with just the album/artist (user imports then plays in order), OR expand to individual tracks if a track listing is available
4. Output: `[playlist-title].csv`

### Future Export Targets
- MusicKit JS (direct Apple Music API — requires Apple Developer token)
- Spotify (via Spotify Web API)
- M3U (local file playback)
- Markdown (human-readable listicle)

---

## Hexfield Deck Integration

> ⚠️ This section affects both repos. Coordinate changes with Hexfield-Deck.

### New Card Type: Queue Card

Hexfield Deck should detect `.queue.yaml` files and render them as a sequential list of draggable cards in a webview panel.

**Song card fields to display:**
- Track/album title (large)
- Artist
- Album name + year
- `notes` field (smaller, italicized)
- Type badge: `track` or `album`

**Behaviors:**
- Cards are draggable to reorder
- Reordering updates the `tracks:` array order in the source YAML (bidirectional sync, same pattern as Deck's markdown sync)
- "Export" button in the webview triggers the export pipeline

**Visual design language:** Follow existing Hexfield Deck card conventions. Queue cards are a new card type, not a new product.

---

## Repository Structure

```
Hexfield-Queue/
├── CLAUDE.md               # This file
├── README.md
├── spec/
│   └── schema-v0.1.md      # Formal schema documentation
├── examples/
│   ├── intro-black-pistol-fire.queue.yaml
│   └── weekend-classics.queue.yaml
├── scripts/
│   ├── export-apple-music.js   # YAML → Apple Music CSV
│   └── validate.js             # Schema validation
├── prompts/
│   └── system-prompt.md        # Claude generation system prompt
└── .github/
    └── workflows/
        └── validate.yml        # CI: validate all .queue.yaml files in repo
```

---

## Development Principles

- **Schema stability matters.** Changing field names breaks existing queue files. Version the schema. Use `version: "0.1"` now; bump for breaking changes.
- **Export adapters are pluggable.** The core schema never changes for a new export target — only a new adapter script is added.
- **Claude generation is a first-class feature, not an afterthought.** The `meta.prompt` and `meta.generated_by` fields exist so every queue file is self-documenting about its origin.
- **Test with real data.** The `examples/` directory should have real, playable playlists — not lorem ipsum.

---

## Key Decisions Log

| Decision | Rationale |
|---|---|
| YAML over JSON | Human-writable, supports comments, git-diff friendly |
| YAML over Markdown | Structured enough for reliable parsing; Markdown is for Deck's planner format |
| `.queue.yaml` extension | Distinct from generic `.yaml`; allows Deck to detect and render |
| Service-agnostic schema | Export adapters handle service IDs; core schema stays portable |
| CSV for Apple Music MVP | Zero auth, zero API keys, works today |
| `type: album` support | Playlists often mean "play this album here" — first-class concept |

---

## MST3K / Deep 13 Context

This project was conceived in Deep 13 (the home lab project). It has no dependency on Deep 13 infrastructure — it's a standalone open source tool. The naming and spirit are MST3K-adjacent but the project itself is public and general-purpose.

*"We've got playlists to make down here!"* 🎵🤖

---

*Last Updated: 2026-03-26*
*Maintained by: jimblom*

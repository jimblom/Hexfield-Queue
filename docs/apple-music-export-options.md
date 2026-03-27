# Apple Music Export — Options Trade Matrix

> Decision context: Hexfield Queue needs a reliable path from `.queue.yaml` → Apple Music playlist.
> The initial CSV approach (v0.1) was confirmed non-functional. This document captures the full option space.

---

## The Core Problem

Apple Music has no simple, universal import path for externally-generated playlist files. Every viable approach involves a tradeoff between auth complexity, scope (streaming vs. local library), and engineering effort.

---

## Options

### 1. iTunes Library XML (plist)

Music.app on macOS imports `.xml` files via **File → Library → Import Playlist...**. This is the format iTunes itself exports. We can generate conforming XML from a `.queue.yaml`.

| | |
|---|---|
| **Auth — developer** | None |
| **Auth — user** | None |
| **Works for streaming tracks** | Unknown — under test |
| **Works for local files** | Yes |
| **Requires network** | No |
| **User friction** | Low — drag-and-drop or menu import |
| **Ordering preserved** | Yes |
| **Platform** | macOS only (Music.app) |
| **Implementation effort** | Low — built on `feat/itunes-xml-export` |
| **Maintenance burden** | Low — format is stable (unchanged since iTunes era) |

**Key uncertainty:** Music.app matches imported tracks against the local library by Name + Artist + Album. Whether it resolves Apple Music streaming tracks (tracks you've added from the catalog but don't own locally) is unconfirmed. Needs hands-on testing.

**Best case:** Zero-auth, low-friction, works today.
**Worst case:** Only matches locally-owned tracks — streaming catalog tracks are silently skipped.

---

### 2. CSV (macOS Music.app Import)

The original v0.1 MVP target.

| | |
|---|---|
| **Auth — developer** | None |
| **Auth — user** | None |
| **Works for streaming tracks** | No |
| **Works for local files** | No |
| **Status** | **Confirmed broken** — Music.app silently ignores external CSVs |

**Verdict:** Dead end. Retire as a standalone Apple Music export. May still be useful as a human-readable dump or for third-party tools (see Option 5).

---

### 3. MusicKit JS (Apple Music API)

Apple's official JavaScript framework and REST API for Apple Music. Supports search, playlist creation, and track addition against the full Apple Music streaming catalog.

| | |
|---|---|
| **Auth — developer** | Apple Developer account required ($99/yr) + MusicKit key |
| **Auth — user** | Apple Music subscription + OAuth (sign in with Apple ID) |
| **Works for streaming tracks** | Yes — full catalog access |
| **Works for local files** | N/A |
| **Requires network** | Yes |
| **User friction** | Medium — OAuth login flow required |
| **Ordering preserved** | Yes |
| **Platform** | Web (any browser), can be embedded in VS Code webview |
| **Implementation effort** | High — requires hosted component or VS Code extension integration |
| **Maintenance burden** | Medium — Apple API versioning, token rotation |

**Note:** Only the developer (jimblom) needs the Apple Developer account. End users authenticate with their own Apple ID / Apple Music subscription — no developer account required from users.

**Best case:** Proper, reliable, full-catalog playlist creation. The right long-term answer.
**Worst case:** Apple revokes/changes API, requires ongoing maintenance.

---

### 4. AppleScript

macOS Music.app is fully scriptable via AppleScript. A script can search the local library and build a playlist programmatically.

| | |
|---|---|
| **Auth — developer** | None |
| **Auth — user** | None |
| **Works for streaming tracks** | Partial — only tracks previously added to library |
| **Works for local files** | Yes |
| **Requires network** | No |
| **User friction** | Low — run a script, playlist appears in Music.app |
| **Ordering preserved** | Yes |
| **Platform** | macOS only |
| **Implementation effort** | Medium — generate `.scpt` or `.applescript` from queue file |
| **Maintenance burden** | Low — AppleScript Music dictionary is stable |

**Limitation:** Same as XML — only resolves tracks already in the user's library. Streaming catalog tracks not yet added to the library will be skipped.

**Best case:** Zero-auth, zero-friction for power users comfortable running scripts.
**Worst case:** Unfamiliar to non-technical users; macOS-only.

---

### 5. Third-Party Transfer Services (Soundiiz, TuneMyMusic, etc.)

Services like Soundiiz and TuneMyMusic accept a plain track list (artist + title) and create Apple Music playlists directly via their own API integrations.

| | |
|---|---|
| **Auth — developer** | None (we generate the input file; they handle Apple Music auth) |
| **Auth — user** | Account on third-party service + Apple Music connection |
| **Works for streaming tracks** | Yes — full catalog |
| **Works for local files** | N/A |
| **Requires network** | Yes |
| **User friction** | Medium — account creation on third-party service |
| **Ordering preserved** | Usually |
| **Platform** | Web |
| **Implementation effort** | Very low — generate a plain text or CSV that matches their import format |
| **Maintenance burden** | None on our side (format is simple) |

**Key dependency:** These services can change pricing, format, or shut down — we don't control the pipeline.

**Best case:** Full streaming catalog, no dev account, works today, minimal engineering.
**Worst case:** Third-party dependency; free tiers often limit playlist size.

---

## Summary Matrix

| Option | Dev Auth | User Auth | Streaming Tracks | Effort | Status |
|---|---|---|---|---|---|
| iTunes XML | None | None | **Unknown — testing** | Low | Built, under test |
| CSV | None | None | No | Done | **Confirmed broken** |
| MusicKit JS | $99/yr dev account | Apple ID + subscription | Yes | High | Future target |
| AppleScript | None | None | Library-only | Medium | Not built |
| Third-party (Soundiiz) | None | 3rd-party account | Yes | Very low | Not built |

---

## Recommended Path

1. **Test iTunes XML first** (`feat/itunes-xml-export`). If streaming tracks resolve correctly in Music.app, this is the zero-auth answer and closes the MVP.

2. **If XML only works for local tracks:** Ship it as a "local library" export, then evaluate MusicKit JS vs. third-party services for the streaming use case. Soundiiz is the fastest path to streaming with zero dev overhead. MusicKit JS is the right long-term answer if Hexfield Queue becomes a more active product.

3. **MusicKit JS** whenever the tool grows to warrant an Apple Developer account — it's the only option that covers the full catalog with no third-party dependency.

---

*Last Updated: 2026-03-26*
*Context: Hexfield Queue v0.1 export pipeline decision*

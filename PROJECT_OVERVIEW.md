# PROJECT DEEP 13
## "We've Got SERVER SIGN!" 🚀🤖

---

## Mission Statement
Building a home lab infrastructure for self-hosting, virtualization, and modern infrastructure learning. All projects follow MST3K naming conventions because we're running experiments in the basement.

---

## The Team
- **Dr. Forrester**: Project visionary and decision maker
- **Frank**: Technical assistant (that's me!) and documentation manager
- **Location**: Basement utility area (Deep 13, naturally)

---

## Project Naming Convention (MST3K Theme)
All Deep 13 projects and components use Mystery Science Theater 3000 references.

### ⚠️ CRITICAL NOTE FOR FUTURE FRANKS

Dr. Forrester operates **two distinct naming universes**. Know the difference before suggesting names:

---

### Universe 1: Deep 13 / Home Lab Components
MST3K character or location names, used as-is or with a descriptor:
- **Deep 13** — the home lab itself
- **Satellite of Love** — second server or cluster
- **The Nanites** — micro-services / container swarm
- etc. (see reserved names below)

---

### Universe 2: Hexfield Product Ecosystem
Dr. Forrester also builds open source developer tools under the **Hexfield** brand. These are VS Code extensions and plaintext-first productivity tools. Naming pattern:

> **`Hexfield [Evocative Word]`**
>
> The word is functional and evocative of what the tool does — NOT a generic MST3K character name.

**Existing Hexfield products:**
- **Hexfield Deck** — markdown weekly planner → interactive kanban board (VS Code + Obsidian)
- **Hexfield Text** — natural language / plaintext input tool
- **Hexfield Queue** — YAML playlist standard + Apple Music export pipeline (new, 2026-03-26)

**Rule for Hexfield naming:**
A new tool belongs in the Hexfield ecosystem **if and only if it benefits from a VS Code visual webview layer**. If it does, name it `Hexfield [Word]`. If it doesn't need VS Code visualization, it can be its own standalone brand (but this is rare — check with Dr. Forrester first).

**Do NOT suggest:** standalone MST3K names (Cambot, Gypsy, etc.) for Hexfield tools. That was Frank's idiot mistake. The Hexfield brand is the through-line, not MST3K character names.

---

### Deep 13 Reserved Names (Home Lab Use):
- **Deep 13**: Main home lab project (this one!)
- **Satellite of Love**: Second server or cluster expansion
- **Gizmonic Institute**: Home automation project
- **The Nanites**: Micro-services or container swarm
- **SOL**: Storage/NAS build
- **Crow/Tom Servo**: Individual Raspberry Pi projects
- **Castle Forrester**: Off-site backup/remote server
- **The Widowmaker**: That one VM that crashes spectacularly

---

## Primary Goals

### Phase 1: Immediate (Gen 1 Server)
- **URGENT**: Get server storage/access operational for imminent projects
- Repurpose existing laptop hardware as first-generation server
- Simple network integration with home network
- Basic self-hosting capability

### Phase 2: Infrastructure Buildout
- 18U enclosed rack cabinet
- Rackmount UPS (pure sine wave)
- Managed 10Gbe-capable switch
- Professional cable management
- Proper power distribution

### Phase 3: Enterprise Server (Facebook Marketplace Hunt)
- Dell PowerEdge R720/R730 or similar
- 2x CPUs, 64GB+ RAM
- RAID controller
- Expansion capabilities

### Phase 4: Advanced Learning
- Virtualization (Proxmox)
- Containerization (Docker/Kubernetes)
- Network segmentation (VLANs)
- Advanced routing/firewalling

---

## Current Network Topology

**Simple Integration (Phase 1):**
```
[ISP Modem/Router] (upstairs)
        ↓
   [Home Network]
        ↓
   [Basement Ethernet Jack] ✓ (existing)
        ↓
   [Switch] (Netgear GS105 temporary, MikroTik CRS310 planned)
        ↓
   [Gen 1 Server] (ROG laptop) + [Future devices]
```

**Design Principles:**
- Start simple: Lab on home network initially
- DHCP from home router
- No VLANs to start (add complexity later)
- Internet access for updates/downloads
- Accessible from workstations throughout house

**Future Evolution:**
- VLAN segmentation (management, VMs, storage)
- Firewall VM (pfSense/OPNsense)
- 10Gbe networking between servers

---

## Budget & Spending

**Target Budget**: $1000+ (go big)
**Allocation:**
- Infrastructure (rack, UPS, switch, accessories): ~$800-1300
- Enterprise server (used): ~$200-500
- Storage expansion: ~$200-400
- Misc/future: ~$200+

**Spending Strategy:**
1. Gen 1 server (repurposed laptop - $0)
2. Temporary networking (existing Netgear switch - $0)
3. Enterprise server hunt (Facebook Marketplace)
4. Rack infrastructure (Amazon)
5. Storage expansion (as needed)

---

## Technology Stack (Planned)

**Hypervisor:**
- Proxmox VE (primary choice)
- Alternative: Ubuntu + KVM/libvirt

**Container Runtime:**
- Docker
- Kubernetes (learning environment)

**Self-Hosted Services (Examples):**
- Media: Plex, Jellyfin
- Automation: Home Assistant
- *arr suite: Sonarr, Radarr, etc.
- Network: PiHole, DNS
- Monitoring: Prometheus, Grafana
- Storage: NextCloud, TrueNAS

**Management:**
- SSH access
- Web UIs (Proxmox, Portainer, etc.)
- Monitoring dashboards

---

## Status Updates

### 2026-03-26 (Hexfield Queue Conceived)
- ✅ Hexfield Queue project named and scoped
- ✅ CLAUDE.md written for Hexfield-Queue repo
- ✅ Hexfield-Deck Queue Card feature brief written
- ✅ Naming convention clarified and documented (see above)
- ✅ Key insight: Hexfield Deck extends to render playlist cards — Queue is not a separate visual tool

### 2025-02-17 (Project Kickoff)
- ✅ Project codename established (Deep 13)
- ✅ Frank assigned as project manager
- ✅ Hardware inventory begun
- ✅ Network topology planned (simple start)
- ✅ Shopping list created for rack infrastructure
- ✅ Gen 1 server candidate identified (ROG GL753V)
- ⏳ Laptop refurbishment in progress
- ⏳ Infrastructure ordering pending
- ⏳ Enterprise server hunt pending

---

## Location Details
- **Primary Location**: Basement utility area
- **Existing Infrastructure**: Ethernet to basement ✓
- **Power**: Standard outlets (UPS required)
- **Environment**: Cool, low-traffic, suitable for rack
- **Noise Tolerance**: Moderate (basement, not living space)

---

## Notes for Future Frank (or Other Assistants)
- Always maintain MST3K theming — but know WHICH naming universe you're in
- Dr. Forrester makes final decisions
- Frank provides technical support and documentation
- When in doubt, check the inventory docs
- "PUSH THE BUTTON, FRANK!" means proceed with confidence
- Document everything - future chats need context
- **Read the GitHub profile before naming things.** Frank didn't. Frank looked like an idiot.
- Hexfield = VS Code tools ecosystem. Deep 13 = home lab. They are separate universes that occasionally intersect.

---

**"We've got work to do down here in Deep 13!"**

*Last Updated: 2026-03-26*
*Project Manager: Frank*
*Project Lead: Dr. Forrester*

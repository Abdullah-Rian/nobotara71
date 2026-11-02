# Nobotara71 — Hero Description Card Repositioning & Progress Bar Removal

Remove the dual-tone progress bar capsule from beneath the mission title across all three missions (`Apollo 11`, `Earth`, and `Voyager 1`) and move the frosted dark glass description card directly into that position under the 2-line hero headline, while keeping the glowing `GET STARTED` button and segmented mission dock anchored at the bottom of the viewport.

## User Review & Critical Decisions

> [!IMPORTANT]
> Both of your layout preferences from Phase 1 have been locked into this plan:

- **Confirmed Decision 1 — Upper Hero vs. Lower Action Split**: Only the mission description card moves up into the hero header block (starting at the exact vertical offset where the progress bar previously sat, `margin-top: 18px` below the 2-line title). The glowing `GET STARTED` CTA button and bottom segmented capsule dock remain anchored at the bottom of the screen, opening up the middle viewport so the 4K planetary and deep-space background videos are unobstructed.
- **Confirmed Decision 2 — Frosted Dark Glass Card Preserved**: The description section retains its frosted dark glass container (`background: rgba(25, 30, 40, 0.72)`, `backdrop-filter: blur(18px)`, `border-radius: 20px`, `padding: 18px 22px`, `1px solid rgba(255, 255, 255, 0.14)`) across all three missions.

---

## 1. Overview & Core Concept

- **What It Does**: Streamlines the vertical hierarchy of **Nobotara71** by eliminating the static dual-tone progress capsule and grouping the mission's narrative copy (`eyebrow` + `2-line title` + `frosted description card`) at the top of the HUD, while keeping the primary interactive controls (`GET STARTED` + `Bottom Mission Dock`) in the natural bottom thumb zone.
- **Target Audience / Persona**: Mobile and desktop users exploring Apollo 11, Earth, and Voyager 1 who want immediate narrative context beneath the headline and a clear, unobstructed central window into the 4K background video loops.
- **Key Value**: Removes visual clutter between the title and description while maximizing central viewport visibility of the lunar surface, orbital Earth, and Voyager 1 spacecraft streams.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Unified Top Reading Flow**: Users read the electric cyan `MISSION: [NAME]` eyebrow, the ultra-bold 2-line mission title (`ONE GIANT LEAP`, `BLUE MARBLE`, `THE GOLDEN DISK`), and immediately below (`18px` gap) the frosted glass mission briefing card.
  2. **Unobstructed Central Video Stage**: With the description card moved up into the hero block, the middle of the viewport stays completely open to showcase the 4K video loops and high-resolution stills.
  3. **Ergonomic Bottom Thumb Zone**: Users trigger the Mission Dossier via the glowing `#00E5FF` `GET STARTED` button or switch missions via the bottom segmented dock (`APOLLO 11` | `EARTH` | `VOYAGER 1`) with shared-buffer Web Audio feedback.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Deep-space mobile HUD with high-contrast editorial typography in the upper zone, open cinematic video framing in the middle zone, and tactile thumb-zone controls at the bottom.
  - *Color Palette & Mood*:
    - Dominant Canvas (60%): Deep space `#03070e` with 4K looping mission videos.
    - Structural Surfaces (30%): Frosted dark glass description card (`rgba(25, 30, 40, 0.72)`, `backdrop-filter: blur(18px)`) positioned directly under the title, circular `44px` top-right glass menu button, and bottom segmented dock.
    - Accent Budget (10%): Electric cyan (`#00E5FF`) reserved for the `"71"` brand suffix, `MISSION: [NAME]` eyebrow, and glowing `GET STARTED` CTA pill.
  - *Component Styling & Spatial Math*:
    - `.hero-header-block`: Contains `.mission-eyebrow`, `.mission-title`, and `.description-card` (`margin-top: 18px`, matching the exact starting line of the removed `.dual-tone-capsule`).
    - `.lower-stack`: Anchored at `margin-top: auto` containing `.cta-glow-btn` (`GET STARTED`) and `.bottom-dock`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Group Narrative Elements in Upper Hero & Keep Actions in Bottom Thumb Zone**
  - *Chosen Approach*: Move `.description-card` inside `.hero-header-block` directly beneath `.mission-title` (`margin-top: 18px`) and remove `.dual-tone-capsule`. Leave `.cta-glow-btn` and `.bottom-dock` inside `.lower-stack`.
  - *Why*: Follows mobile touch-first ergonomics—reading content sits in the upper visual scan zone while interactive triggers (`GET STARTED` and mission switcher tabs) remain comfortably within one-handed thumb reach at the bottom.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Nobotara71 Application Root (App.tsx)                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Unified Master HUD (.hud-layer)               │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 1. Top Header (.top-header)                                 │  │  │
│  │  │    • Nobotara71 Brandmark + 44px Circular Glass Hamburger   │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 2. Hero Header Block (.hero-header-block)                   │  │  │
│  │  │    • Eyebrow (MISSION: APOLLO 11 / EARTH / VOYAGER 1)       │  │  │
│  │  │    • 2-Line Stacked Ultra-Bold Title                        │  │  │
│  │  │    • Frosted Glass Description Card (margin-top: 18px)      │  │  │
│  │  │      [Replaces removed dual-tone progress bar]              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │         [ Open Central Viewport Window for 4K Video Stream ]      │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 3. Lower Action Stack (.lower-stack, margin-top: auto)      │  │  │
│  │  │    • Glowing #00E5FF "GET STARTED" CTA Button               │  │  │
│  │  │    • Bottom Segmented Capsule Dock (APOLLO 11 | EARTH | V1) │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Remove unused `capsuleProgress` property from `MissionData` and `MISSIONS` dataset (`apollo11`, `earth`, `voyager1`).
  - Preserve all mission descriptions, video/still URLs, cutout badges, telemetry metrics, and shared `AudioBuffer` sound effects (`'cta'`, `'switch'`, `'menu'`).
- **Interactive Component & State Mapping**:
  - Switching tabs in `.bottom-dock` updates the eyebrow, 2-line title, and the newly positioned `.description-card` directly underneath the title across all three missions.
  - Clicking `GET STARTED` in `.lower-stack` plays the shared `'cta'` audio buffer and opens the interactive Mission Dossier modal.

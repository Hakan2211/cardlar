# Cardlar — PRD: Owner Mode, Local Models & Viewer 2.0 "Memory Lane"

**Status:** In progress · **Date:** 2026-07-16 · **Author:** Hakan (with Claude)

---

## Implementation status

| Phase | Scope | Status |
|---|---|---|
| 1 | Owner Mode + AI provider abstraction (fal/local/mock) + hardened checkout | ✅ Done & building |
| 2 | Local models (Stable Diffusion WebUI images, dev-tracks music) | ✅ Folded into Phase 1's `local` provider |
| 3 | Memory Lane multi-image timeline (studio + viewer) | ✅ Done & building |
| 4 | Multi-track soundtrack (up to 3, sequential) | ✅ Done & building |
| 5 | Magic polish (canvas particles, palette theming, handwritten reveal, replay/send-back) | ✅ Done & building (P1 items; P2/P3 remain in §4.B3) |

**Note:** `.env.local` is gitignored (`.env*.local` in `.gitignore`) — the earlier concern about committed live secrets was a false alarm; no rotation needed.

---

## 1. Background & Current State

Cardlar is a Next.js 16 + Convex + Stripe + fal.ai app for AI-personalized greeting cards.
Today's flow: **Landing → pick occasion → pick package → Stripe Checkout → Studio (image → message → voice → music → preview) → Share link → Recipient opens envelope experience at `/c/[slug]`.**

Relevant current facts:

- **Payment gates creation.** `app/api/stripe/create-session/route.ts` runs *before* the studio. A card row is created in `checkout/success` with `status: "pending_payment"` and only becomes editable after `markPaid`.
- **Partial dev bypass already exists**, but implicitly: if `STRIPE_SECRET_KEY` is unset the checkout skips Stripe entirely; if `FAL_KEY` is unset, image APIs return placehold.co placeholders and music returns nothing. This is presence-of-key magic, not an explicit mode.
- **Media limits:** exactly **1 image** (`imageUrl`), **1 voice recording**, **1 AI music track** (`musicUrl`). Image regens capped at 3.
- **Viewer:** envelope with wax seal → spring reveal → single image → word-by-word message animation → emoji particle rain → optional watermark. Music loops at volume 0.3.
- **AI:** fal.ai only — `nano-banana-2` (generate), `nano-banana-2/edit` (photo restyle), `minimax/music-3` (music).
- **Dev vs prod data:** dev runs against the dev Convex deployment (`dev:quaint-mouse-314`); a card created there is **not reachable from the production site** — this matters for "share my dev cards".

---

## 2. Goals

1. **Owner Mode:** As the owner/developer, create unlimited cards **without paying**, primarily in development; use **local AI models** so experimentation costs nothing.
2. **Shareable owner cards:** Cards I create for free must be **sendable/shareable like any paid card** (real public URL, works for recipients).
3. **Viewer 2.0 — make it mind-blowing:** multiple photos presented as a **timeline / memory lane**, up to **3 music tracks playing in sequence**, plus a set of "magic" experience upgrades.

### Non-Goals (this iteration)

- User accounts / auth (cards stay anonymous, slug-gated).
- Email delivery of cards (link/WhatsApp share stays the mechanism).
- Changing pricing/packages beyond what multi-image/multi-track requires.
- Mobile apps.

---

## 3. Feature A — Owner Mode & Local Models

### A1. Explicit Owner Mode (free creation)

Replace the implicit "no Stripe key = free" behavior with an explicit, safe mode.

**Design:**

- New env vars:
  - `OWNER_MODE=true` — only honored when `process.env.NODE_ENV !== "production"`. Enables free creation in dev with zero friction.
  - `ADMIN_SECRET=<long-random-string>` — honored **in production too**. Lets the owner create free cards on the live site (see A3).
- New route: `POST /api/admin/create-card`
  - Accepts `{ occasion, packageType, showWatermark, customOccasionName, adminSecret? }`.
  - Authorized if (`OWNER_MODE` && not production) **or** `adminSecret === ADMIN_SECRET` (constant-time compare).
  - Creates the card via Convex `cards.create` and immediately `cards.markPaid` (introduce a paid-source field, see §5), then returns `/studio/<slug>`.
- New page: `/admin` (or `/create-free`)
  - Dev: renders automatically when `OWNER_MODE` is on — occasion picker + package picker + "Create free card" button.
  - Prod: shows a secret input (stored in `localStorage` after first use) before allowing creation. No links to this page from anywhere; it's owner-only by obscurity + secret.
- **Remove/deprecate the implicit bypass** in `create-session`: if `STRIPE_SECRET_KEY` is missing and Owner Mode is off, return a clear 500 ("Stripe not configured") instead of silently free-creating. This prevents accidentally shipping a free production checkout.
- Regen caps: Owner Mode cards skip `MAX_IMAGE_REGENERATIONS` (pass through an `isAdmin` flag to `incrementImageRegen`, or simply don't call it).

**Acceptance criteria:**

- With `OWNER_MODE=true` in `.env.local`, I can go from landing → studio without ever seeing Stripe, on any package including `full`.
- With `OWNER_MODE` unset, dev behaves exactly like production (Stripe required).
- In production, posting to `/api/admin/create-card` without the correct secret returns 401; with it, I get a fully unlocked card.
- Nothing in the production UI links to or reveals the admin page.

### A2. Local model providers (dev)

Introduce a **provider abstraction** so image/music generation can run against fal.ai, local models, or mocks — selected by env, never hardcoded in routes.

**Design:**

- New module `lib/ai/` with a small interface:
  ```ts
  interface AIProvider {
    generateImage(opts: { prompt: string }): Promise<{ url: string }>;
    editImage(opts: { prompt: string; imageUrl: string }): Promise<{ url: string }>;
    generateMusic(opts: { prompt: string; lyrics?: string }): Promise<{ url: string } | null>;
  }
  ```
  Implementations: `falProvider.ts` (current behavior moved here), `localProvider.ts`, `mockProvider.ts` (current placehold.co behavior).
- Selection: `AI_PROVIDER=fal | local | mock` (default: `fal` when `FAL_KEY` is set, else `mock`). `local` is refused in production builds.
- The three API routes (`generate-image`, `edit-image`, `generate-music`) become thin wrappers over the selected provider.

**Local implementations (recommended stack):**

| Capability | Recommended local backend | Notes |
|---|---|---|
| Image generate | **ComfyUI** HTTP API (`LOCAL_IMAGE_URL=http://127.0.0.1:8188`) running FLUX.1-schnell or SDXL-Turbo | Fast on a decent GPU; workflow JSON checked into `lib/ai/comfy-workflows/`. Alternative: Automatic1111 `/sdapi/v1/txt2img`. |
| Image edit (photo restyle) | ComfyUI img2img / IP-Adapter workflow | Same server, second workflow file. |
| Music | **MusicGen** (Meta audiocraft) or **ACE-Step** behind a tiny FastAPI wrapper (`LOCAL_MUSIC_URL=http://127.0.0.1:8500`) | Local music gen is the weakest link; acceptable fallback: a `public/dev-tracks/` folder of royalty-free MP3s that `localProvider.generateMusic` picks from by occasion. Start with the fallback, add MusicGen later. |

- Local outputs are files/bytes, not URLs — `localProvider` uploads the resulting bytes to **Convex storage** (same `files.generateUploadUrl` path used for photo uploads) so the rest of the pipeline (viewer, fal edit chaining) keeps working with real URLs.

**Acceptance criteria:**

- `AI_PROVIDER=mock` — studio works end-to-end offline with placeholders.
- `AI_PROVIDER=local` + ComfyUI running — "Pick a Design" and photo-restyle produce real images with zero fal.ai spend.
- `AI_PROVIDER=fal` — byte-for-byte current behavior.
- Building for production with `AI_PROVIDER=local` fails loudly (or falls back to `fal` with a console error).

### A3. Sharing owner-created cards

Two distinct cases, both must work:

1. **Dev-created cards** (local Convex): shareable **on the LAN/localhost only** — fine for previewing on my own phone (`NEXT_PUBLIC_APP_URL` set to the LAN IP). Not for real recipients. Document this limitation.
2. **Real shareable cards for free:** use the **production admin path** (A1's `ADMIN_SECRET` route on the live site). The card is created on prod Convex, generated with fal (production always uses fal for quality), gets a normal `https://<domain>/c/<slug>` URL, shows on `/share/[slug]` with the standard ShareButton (Web Share / copy / WhatsApp). It is indistinguishable from a paid card.

Optional (Phase 3, nice-to-have): `npx tsx scripts/promote-card.ts <slug>` — copies a dev card's row + storage files to the prod deployment for the rare case a dev experiment turns out perfect.

---

## 4. Feature B — Viewer 2.0: "Memory Lane"

### B1. Multiple images as a timeline

**Product shape:** a card becomes a short **story**: cover image → a scrollable/auto-advancing sequence of **moments** (photo + optional caption + optional date label) → the written message as the finale.

**Limits & UX:**

- **Up to 10 images** per card (1 cover + up to 9 timeline moments). Full package keeps 3 AI regens *per image slot*; uploaded originals are free/unlimited.
- Studio: `ImageGenerator` evolves into **`GalleryBuilder`**:
  - Grid of slots with drag-to-reorder (use `framer-motion` `Reorder`).
  - Each slot: upload photo → optional style restyle (existing edit flow) OR AI-generate from prompt (existing flow).
  - Per-slot caption (max ~80 chars) and optional date/label ("Summer 2019", "The day we met").
  - Slot 1 is the cover (used for envelope reveal + OG image).
- Viewer: after the envelope opens, moments play as a **cinematic timeline**:
  - Each moment: photo with slow **Ken Burns** pan/zoom, caption fading in beneath, a subtle timeline progress rail on the edge (dots per moment).
  - Advance by tap/swipe **and** auto-advance (~5s/moment) — recipient can just watch.
  - Transitions: crossfade + slight parallax; respect `prefers-reduced-motion`.
  - Finale: last crossfade lands on the message (existing word-by-word animation), then sender signature + particles crescendo.
- Backward compatibility: cards with a single `imageUrl` render exactly like today (cover → message).

### B2. Multiple music tracks (up to 3, sequential)

- Studio `MusicGenerator` → **`SoundtrackBuilder`**: up to **3 tracks**, each generated from its own prompt/lyrics (or re-used defaults), reorderable, each individually previewable and deletable.
- Viewer playback:
  - Tracks play **in sequence**: when track 1 ends, track 2 starts (preload `next` track's `<audio>` while current plays; 1.5s **crossfade** between tracks via dual audio elements + volume ramps).
  - After the last track: loop the final track (default) — configurable later.
  - Keep: start 1s after envelope open, volume 0.3, voice message ducks music to 0.1 while playing.
  - Small unobtrusive **now-playing chip** (track x/3, mute toggle) in a corner.
- Cost note: 3 tracks ≈ 3× minimax cost per card → **multi-track is a `full`-package (or new tier) feature**; `music` package stays 1 track. (Owner Mode: always 3.)

### B3. Magic backlog — experience upgrades

Prioritized ideas to make opening a card unforgettable. **P1 = ship with Viewer 2.0, P2 = fast-follow, P3 = later.**

| P | Idea | Sketch |
|---|---|---|
| P1 | **Handwritten message reveal** | Render the message in a script font with an SVG-mask "ink writing itself" effect (or letter-by-letter with a pen cursor) as an alternative to word-fade. Finally uses the dormant `fontFamily` field. |
| P1 | **Particles 2.0** | Replace CSS emoji rain with canvas particles (`tsparticles` or hand-rolled): confetti bursts *on envelope open*, gentle ambient drift afterwards, occasion-colored. Big perceived-quality jump for low effort. |
| P1 | **Theme from photos** | Extract a dominant-color palette from the cover image (canvas sampling) and tint the envelope/background/progress rail to match — every card feels custom-designed. Uses the dormant `theme` field. |
| P1 | **Replay & "Send one back"** | End screen: ♻ Replay button + "Send {sender} a card back" CTA (deep-links to landing with occasion=thank-you). Turns recipients into customers. |
| P2 | **Birthday candle blow-out** | For birthday cards: a lit candle overlay; recipient blows into the mic (volume spike detection) or taps to extinguish → confetti cannon + music starts. Signature magic moment. |
| P2 | **Voice waveform visualizer** | While the voice message plays, show an animated waveform/orb pulsing with amplitude (Web Audio AnalyserNode) instead of playing invisibly. |
| P2 | **Countdown mode** | Optional `revealAt` timestamp: before that moment the card shows a beautiful countdown ("Opens on her birthday in 2d 4h") — perfect for scheduled surprises. |
| P2 | **3D envelope** | Upgrade envelope to a CSS-3D flap that actually folds open (rotateX + shadows), wax seal that cracks. No WebGL needed. |
| P3 | **Starry-sky dedication** | Night-sky scene where stars twinkle into a constellation spelling the recipient's initial. |
| P3 | **Guestbook/reactions** | Recipient can leave a one-tap reaction (❤️🥹🎉) or short note; sender sees it on `/share/[slug]` next to view count. |
| P3 | **Keepsake video export** | Server-side render (Remotion) of the whole experience to an MP4 the recipient can download/store. |
| P3 | **Ambient soundscapes** | Occasion sound layers under music (soft fireplace for christmas, waves for miss-you) at very low volume. |

---

## 5. Data Model Changes (Convex `cards` table)

Add (all optional — old cards keep working):

```ts
// Gallery (B1) — supersedes single imageUrl; keep old fields for back-compat reads
images: v.optional(v.array(v.object({
  url: v.string(),
  storageId: v.optional(v.id("_storage")),
  caption: v.optional(v.string()),
  dateLabel: v.optional(v.string()),   // free text: "Summer 2019"
  source: v.union(v.literal("upload"), v.literal("generated"), v.literal("edited")),
  regenCount: v.number(),
}))),

// Soundtrack (B2) — supersedes single musicUrl
musicTracks: v.optional(v.array(v.object({
  url: v.string(),
  storageId: v.optional(v.id("_storage")),
  prompt: v.optional(v.string()),
  title: v.optional(v.string()),
}))),

// Owner mode (A1)
paidVia: v.optional(v.union(v.literal("stripe"), v.literal("owner"), v.literal("admin"))),

// Magic backlog hooks
revealAt: v.optional(v.number()),          // countdown mode (P2)
messageStyle: v.optional(v.string()),      // "fade-words" | "handwritten"
```

**Migration/read strategy:** viewer + studio read through helpers `getImages(card)` / `getTracks(card)` that normalize: if `images` missing, synthesize `[{url: imageUrl, ...}]`; same for music. Writes always use the new arrays. No data migration script needed.

New/changed Convex functions: `cards.updateGallery`, `cards.updateSoundtrack`, per-slot regen accounting in `incrementImageRegen(slotIndex)`, `cards.createAdmin` (or `create` + `markPaid({source})`).

---

## 6. API Changes

| Route | Change |
|---|---|
| `POST /api/admin/create-card` | **New** (A1). Owner/admin free card creation. |
| `POST /api/generate-image` | Provider abstraction (A2); accepts `slotIndex` for regen accounting. |
| `POST /api/edit-image` | Provider abstraction (A2). |
| `POST /api/generate-music` | Provider abstraction (A2); accepts `trackIndex`; enforce ≤3 tracks + package entitlement. |
| `POST /api/stripe/create-session` | Remove implicit no-key bypass; hard error if unconfigured (unless Owner Mode). |

---

## 7. Implementation Plan (phased)

### Phase 1 — Owner Mode & provider abstraction (~1–2 days)
1. `lib/ai/` provider interface + move fal calls into `falProvider`; `mockProvider` from existing placeholders; `AI_PROVIDER` selection. Routes become thin wrappers.
2. `OWNER_MODE` + `ADMIN_SECRET` envs; `POST /api/admin/create-card`; `/admin` page; `paidVia` field; skip regen caps for owner cards.
3. Harden `create-session` (remove silent bypass).
4. `.env.example` documenting every var. (`.env.local` is already gitignored — verified, no committed secrets.)

### Phase 2 — Local models (~1–2 days, GPU box permitting)
5. `localProvider` for images against ComfyUI (workflows checked in, results uploaded to Convex storage).
6. `localProvider.generateMusic`: start with the royalty-free `public/dev-tracks/` picker; MusicGen/ACE-Step wrapper as stretch.

### Phase 3 — Memory Lane (multi-image) (~3–4 days)
7. Schema: `images[]` + normalizing read helpers; per-slot regen mutation.
8. Studio: `GalleryBuilder` (slots, reorder, captions/date labels, per-slot generate/upload/restyle).
9. Viewer: timeline experience (Ken Burns, auto-advance + swipe, progress rail, message finale), reduced-motion support, back-compat single-image path.
10. OG image uses cover slot.

### Phase 4 — Soundtrack (multi-music) (~1–2 days)
11. Schema `musicTracks[]`; `SoundtrackBuilder` in studio (≤3, reorder, preview).
12. Viewer sequential playback with crossfade + now-playing chip + voice ducking.
13. Entitlement: 3 tracks only on `full` (decide final packaging).

### Phase 5 — Magic P1 polish (~2–3 days)
14. Canvas particles + open-burst; palette extraction theming; handwritten message option; replay + "send one back" end screen.

Each phase ships independently; production users see no change until Phase 3 lands.

---

## 8. Risks & Open Questions

- **Autoplay across tracks:** the initial tap gesture authorizes audio; subsequent programmatic `play()` on a *new* element can be blocked on iOS Safari. Mitigation: create/prime all 3 `<audio>` elements (muted `play()/pause()`) inside the original open-tap handler.
- **Cost of multi-track/multi-image:** 3 music generations + up to 10 image generations per card materially raises fal spend per card — revisit `full` pricing ($4.99) or cap AI-generated slots (e.g., uploads unlimited, AI generations ≤5/card).
- **Local music quality:** MusicGen output is noticeably below minimax; that's fine for dev, but never let `AI_PROVIDER=local` reach prod.
- **Timeline weight:** 10 images on mobile — lazy-load moments (next+1 only), serve WebP, cap upload dimension (resize client-side before upload).
- **Admin secret hygiene:** treat `ADMIN_SECRET` like a password; constant-time compare; rate-limit the admin route.
- **Open:** Should multi-image/multi-track become a new "Premium/Story" package above `full`, or fold into `full` at a higher price? (Recommendation: fold into `full`, raise to $6.99, keep others unchanged.)
- **Open:** Auto-advance timing (5s) vs. tap-only — validate with 2–3 real recipients.
- **Reminder from audit:** 7-day expiration exists in schema but is intentionally unimplemented (commit `282af47`); decide during Phase 3 whether Memory Lane cards revive it (storage cost grows with 10 images/card).

---

## 9. Success Criteria

- Owner can produce and share a real, production-grade card end-to-end for $0 (admin path) and iterate freely in dev for $0 API spend (local/mock providers).
- A Memory Lane card with 6+ photos and 3 tracks plays smoothly on a mid-range phone (no jank, <3s to first envelope render).
- Recipient replay rate and "send one back" clicks are measurable from `/share` (view count already exists; add simple counters).

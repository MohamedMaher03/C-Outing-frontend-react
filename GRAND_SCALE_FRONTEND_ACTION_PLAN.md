# C-Outing Grand Scale Frontend Action Plan (Jury Edition)

Date: 2026-04-18
Scope: Frontend architecture and product-level experience upgrades for a high-impact graduation project demo.

## 1) Audit Snapshot of Current Workspace

### What is already strong

1. Solid feature-first clean architecture (UI -> Hook -> Service -> API) that is ready for scale.
2. Rich discovery baseline on Home with mood, district, type, budget, top-rated, and similar recommendation flows.
3. Significant Framer Motion usage is already present across core surfaces (Home, onboarding, layouts, notifications).
4. Good multilingual/theming foundation (Arabic/English and light/dark mode).
5. Place Detail is already content-rich (reviews, social reviews, metro info, facilities, menu gallery).
6. Route-level lazy loading and better bundle behavior are already in place.

### Grand-scale gaps (biggest opportunity)

1. No first-class in-app geospatial canvas yet (no Mapbox/Leaflet explorer, clustering, heatmaps, route overlays).
2. Discovery logic is still section-based and endpoint-driven rather than map-first and scenario-first.
3. Client recommendation caching and re-ranking are lightweight compared to what a high-performance AI product needs.
4. No collaborative or real-time social planning loop (rooms, live votes, live crowd signal).
5. No jury-grade signature interaction moment (cinematic shared-element journeys, spatial storytelling, city pulse overlays).

### Audit evidence (from current workspace)

- Home discovery orchestration and multi-source sections: src/features/home/pages/HomePage.tsx and src/features/home/hooks/useHomeHook.ts
- Current geospatial behavior is distance sorting + open external maps (no in-app map canvas): src/features/home/utils/distance.ts and src/features/place-detail/hooks/usePlaceDetail.ts
- Place detail richness and transport context already available: src/features/place-detail/pages/PlaceDetailPage.tsx
- Existing API contract map (no dedicated geospatial endpoints yet): src/config/api.ts
- Existing high-motion baseline with Framer Motion across key routes/layouts: src/features/home/pages/HomePage.tsx, src/features/onboarding/pages/OnboardingPage.tsx, src/components/layout/AppLayout.tsx
- Existing lightweight cache pattern only in notifications feature: src/features/notifications/services/notificationsService.ts
- Current dependencies include Framer Motion but no Mapbox/Leaflet stack yet: package.json

## 2) Product North Star for Cairo

Design principle: Cairo is not just data. Cairo is the interface.

Experience target:

- Users should feel they are navigating a living city, not browsing a static directory.
- Decision time should drop to under 20-30 seconds for common "Where do we go now?" moments.
- The interface should feel like a smart local guide: warm, quick, and confidently opinionated.

## 3) 12-Week Grand Scale Roadmap

## Phase 1 (Weeks 1-3): Cairo Atlas Experience (Map-First Discovery)

### Goal

Transform discovery from card-only browsing into a map-driven, cinematic exploration surface.

### Frontend implementation

1. Create a new feature module:

- src/features/map-atlas/api
- src/features/map-atlas/hooks
- src/features/map-atlas/components
- src/features/map-atlas/services
- src/features/map-atlas/types
- src/features/map-atlas/pages

2. Build a dual-surface layout:

- Desktop: split panel (left recommendation stream, right interactive map).
- Mobile: draggable bottom sheet over full-screen map with snap points (30%, 65%, 92%).

3. Add advanced map rendering:

- Category-aware clustering with custom navy/gold cluster markers.
- District-level heatmaps by time-of-day (morning/afternoon/night intensity).
- Smart viewport filtering (only fetch and render venues in visible bounds).

4. Add route-to-venue intelligence:

- Show 2-3 route options (fastest, cheapest, least transfers).
- Add ETA chips in cards and on map pins.
- Support route type toggles (car, walking, metro-aware).

5. Add motion signature:

- Shared element transition from venue card -> map pin -> detail header.
- Cinematic map camera fly-to on selection.
- Reduced-motion fallback with non-animated state transitions.

### Suggested tech stack

- Mapbox GL JS (primary) or Leaflet (lighter fallback)
- react-map-gl
- supercluster
- @turf/turf
- Framer Motion + View Transitions API (progressive enhancement)

### Performance strategy

- Keep map marker rendering in viewport-only batches.
- Use requestAnimationFrame throttling for camera-change handlers.
- Offload expensive geospatial calculations to a Web Worker.

## Phase 2 (Weeks 3-6): Heavy React Recommendation Engine on the Client

### Goal

Make frontend state orchestration feel AI-native, instant, and resilient.

### Frontend implementation

1. Add recommendation query orchestration layer:

- Introduce TanStack Query for server-state caching, dedupe, and background refresh.
- Persist high-value recommendation snapshots in IndexedDB for fast reopen.
- Use stale-while-revalidate for curated/trending/similar/map-layers.

2. Build advanced multi-step filter composer:

- Replace flat filter toggles with a staged intent builder:
  - Step A: with whom? (solo/couple/friends/family)
  - Step B: vibe now? (chill/social/adventure/cultural/romantic)
  - Step C: logistics constraints (budget, travel time, accessibility, open-now)
- Use XState for deterministic transitions and undo/redo support.

3. Add local re-ranking engine:

- Client-side score fusion:
  - backend score (base)
  - distance weight
  - social trend weight
  - novelty weight
  - user history penalty for repetition
- Re-rank instantly without refetching every small toggle change.

4. Add recommendation explanation cards:

- "Why this place" chips (near metro, matches vibe, budget fit, trending now).
- Confidence meter and tradeoff labels (e.g., quieter but farther).

### Suggested architecture extensions

- src/features/recommendation-studio
- src/features/filter-composer
- src/lib/cache/recommendationCache.ts
- src/workers/geoRank.worker.ts

## Phase 3 (Weeks 6-9): Killer Differentiator Features (Pick 3-5)

## Killer Feature 1: Live Collaborative Outing Rooms

What users feel:

- One user creates a room, invites friends, everyone votes on venues in real-time.

Frontend details:

- Presence avatars, live vote bars, "host picks" control.
- Synchronized filter state and map viewport.
- Conflict-free updates using optimistic UI + server reconciliation.

Heavy React logic:

- Real-time room store with event reducers.
- Role-based interaction model (host/member/viewer).

## Killer Feature 2: Cairo Crowd Pulse

What users feel:

- See live crowd density and "busy now" probability on district map.

Frontend details:

- District pulse layer with animated intensity rings.
- Time slider (now + next 3 hours) for crowd forecasting.

Heavy React logic:

- Smooth interpolation of streaming crowd updates.
- Historical snapshot cache and delta updates.

## Killer Feature 3: Gamified Cairo Quest (Check-ins + Badges)

What users feel:

- Discovery becomes a game: collect district badges, complete themed trails.

Frontend details:

- Quest panel with progress arcs and unlock animations.
- Check-in timeline and weekly leaderboard.

Heavy React logic:

- Rule engine for achievements and streaks.
- Offline-safe check-in queue with eventual sync.

## Killer Feature 4: AI Night Planner (Multi-stop Itinerary)

What users feel:

- "Plan my evening" generates a 2-4 stop route (cafe -> walk -> dinner).

Frontend details:

- Timeline editor with drag-and-drop stop reorder.
- Dynamic ETA and budget recalculation per change.

Heavy React logic:

- State graph for itinerary constraints.
- Local simulation engine for timing overlap and feasibility.

## Killer Feature 5: AR-style Compass Teaser (No Full ARKit Needed)

What users feel:

- A camera-like compass mode that points toward nearby suggested places.

Frontend details:

- Device orientation + geolocation overlay arrows.
- Distance halo and directional confidence indicator.

Heavy React logic:

- Sensor smoothing and jitter filtering.
- Battery-aware update cadence.

## Phase 4 (Weeks 9-12): Jury Polish, Reliability, and Showmanship

### Goal

Turn great features into a seamless jury demo story.

### Implementation checklist

1. Add "Demo Mode" script:

- Pre-seeded user personas (Foodie Couple, Student Group, Family Weekend).
- One-click scenario switching.
- Controlled mock-real hybrid data mode to guarantee smooth live demo.

2. Add signature transition choreography:

- Home -> Map Atlas -> Place Detail -> Collaborative Room sequence with connected motion language.

3. Add reliability safeguards:

- Graceful fallbacks when geolocation denied.
- Skeletons and optimistic placeholders for all network-heavy surfaces.
- Offline-friendly cached recommendation fallback.

4. Add measurable quality gates:

- INP < 200ms on filter interactions.
- 60fps target on map pan/zoom on mid-range Android devices.
- LCP < 2.5s on Home.
- WCAG AA with reduced-motion-safe alternatives.

## 4) Backend Endpoint Requests Needed for Frontend Wow Factor

## Geospatial endpoints

1. GET /api/v1/Geo/VenuesInBounds?bbox={minLng,minLat,maxLng,maxLat}&zoom={z}&filters={...}

- Needed for viewport-driven map fetch.

2. GET /api/v1/Geo/Heatmap?district={id}&timeWindow={now|next3h}

- Needed for crowd/activity heat layers.

3. GET /api/v1/Geo/Clusters?bbox={...}&zoom={z}&category={...}

- Needed for server-assisted cluster payloads at scale.

4. POST /api/v1/Geo/RouteMatrix

- Body: origin + candidate venue IDs
- Returns ETAs for fast route ranking in UI.

5. GET /api/v1/Geo/Isochrones?origin={lat,lng}&minutes=10,20,30

- Needed for "reachable now" overlays.

## Recommendation intelligence endpoints

1. POST /api/v1/Recommendation/ReRank

- Body: venueIds + userContext + intent filters
- Returns scored list with explanation tokens.

2. GET /api/v1/Recommendation/Explain/{venueId}

- Returns human-readable reason tags and confidence.

3. GET /api/v1/Recommendation/SimilarGraph/{venueId}

- Returns graph neighbors for exploration trails.

## Social and collaboration endpoints

1. POST /api/v1/Rooms
2. POST /api/v1/Rooms/{roomId}/Invite
3. GET /api/v1/Rooms/{roomId}
4. WS /ws/rooms/{roomId}

- Needed for live voting, presence, and synchronized state.

## Live operations endpoints

1. GET /api/v1/Venue/{id}/LiveStatus

- Queue time, crowd %, peak window.

2. GET /api/v1/District/{id}/Pulse

- Area-level demand trend for map pulse.

3. POST /api/v1/Checkin
4. GET /api/v1/Gamification/Progress

- Needed for quests, badges, streaks.

## 5) Architecture Fit With Current Codebase

Your existing architecture is ideal for this expansion. Keep the same layering and just add new feature domains.

Recommended additions:

- Map Atlas feature for geospatial UI and map orchestration.
- Recommendation Studio feature for caching, ranking, and explanation state.
- Collaboration feature for room logic and real-time event handling.
- Gamification feature for check-ins, badges, and progress UI.

Cross-cutting modules to introduce:

- src/lib/realtime/socketClient.ts
- src/lib/cache/indexedDbCache.ts
- src/workers/geo.worker.ts
- src/workers/recommendation.worker.ts

## 6) Cairo-Specific UX Direction for Jury Impact

1. District-first storytelling

- Start from real Cairo neighborhoods users recognize instantly.
- Let users navigate by mood + district identity, not only generic categories.

2. Commute-aware recommendations

- In Cairo, travel friction matters as much as rating.
- Surface ETA and route friction as first-class recommendation criteria.

3. Bilingual local tone

- Keep Arabic and English parity in all high-value interactions.
- Preserve local copy style: friendly local expert, not generic travel app language.

4. Evening/weekend behavior focus

- Add quick presets for "after work", "late-night", and "family weekend".

## 7) Immediate Next Steps (Execution Order)

1. Implement Phase 1 core: Map Atlas split layout + cluster layer + card-to-map linking.
2. Implement Phase 2 core: TanStack Query + persistent recommendation cache + filter state machine.
3. Implement two killer features first: Collaborative Rooms and Cairo Crowd Pulse.
4. Add jury Demo Mode with scenario presets and scripted transition sequence.
5. Run performance and accessibility hard gates before final presentation.

---

This plan intentionally avoids minor refactors and focuses on high-impact, jury-visible capabilities that make C-Outing feel like a world-class Cairo-native intelligence product, not a standard venue directory.

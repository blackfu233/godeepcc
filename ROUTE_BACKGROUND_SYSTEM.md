# Route Background System

## Scope

This system only changes the visual route background layer. It does not change route timing, segment length, route tuning, event logic, Hook Anomaly logic, Pull Up, RTP, or the 100-zone world coordinate system.

## Data Flow

`src/config/routeBackgroundDefinitions.ts` defines 12 background configurations:

- 3 routes: School Current, Golden Current, Storm Trench
- 4 depth layers: 0-2500m, 2500-5000m, 5000-7500m, 7500-10000m

The active background is selected by:

1. `activeRoute.id`
2. `depthLayerForZone(currentZone)`

`src/components/routes/RouteBackgroundLayer.tsx` reads the active route and zone, resolves the background definition, and renders `RouteBackgroundTransition`.

## Layer Structure

Each route background renders the same structural layers:

- Far background: route color grade and distant terrain mood
- Mid background: route-specific silhouettes such as fish schools, ruins, or trench walls
- Near background: low-opacity foreground edges and props
- Light shafts: route-appropriate light direction and color
- Ambient particles: bubbles, gold dust, or electric mist
- Optional props: reef life, sunken treasure, or abyss cleft

## Transition

When route or depth layer changes, the previous and current background definitions are rendered together for about 1.2 seconds. The new scene fades in while the old scene fades out. This avoids a hard background cut.

## Priority

Route background is a world layer, not a main effect.

Priority order:

1. Hook Break / Repair
2. Pull Up
3. Hook Anomaly Event
4. Event Fish Trigger
5. Rare Signal / Treasure Wake / Panic Current / Predator
6. Route Background / Route Ambient

When Pull Up, Hook Event, or Event Fish is active, the route background enters subdued mode. This lowers opacity and saturation so fish, hook effects, and route sweep remain readable.

## Reduced Motion

`prefers-reduced-motion: reduce` disables background drift, particle animation, school movement, gold glimmer, and storm flicker. The route-specific static composition remains visible.

# Route Background Preview

All entries below are implemented as layered local visuals. Each route now has a generated bitmap far-background plate, plus depth-layer color grading, particles, props, and overlays.

Generated route plates:

- School Current: `src/assets/route-backgrounds/school-current-bg.png`
- Golden Current: `src/assets/route-backgrounds/golden-current-bg.png`
- Storm Trench: `src/assets/route-backgrounds/storm-trench-bg.png`

| Route | Layer | Depth | Theme | Far | Mid | Near / Props |
| --- | --- | ---: | --- | --- | --- | --- |
| School Current | L1 | 0-2500m | Lively blue-green reef corridor | Blue-green current | Small schooling fish | Reef life, bubbles |
| School Current | L2 | 2500-5000m | Deeper current lane | Darker turquoise flow | Stronger current lines | Rock reef edges |
| School Current | L3 | 5000-7500m | Concentrated fish flow | Reduced light | Clustered fish silhouettes | Dark coral edge |
| School Current | L4 | 7500-10000m | Abyss school stream | Deep muted aqua | Distant fish stream | Muted reef edges |
| Golden Current | L1 | 0-2500m | First treasure glimmer | Deep blue with warm glint | Sunken ship hint | Pearl sand |
| Golden Current | L2 | 2500-5000m | Pearl grotto | Dark blue-gold | Ruin arches | Metal fragments |
| Golden Current | L3 | 5000-7500m | Ancient ruins | Focused golden reflection | Ruin columns | Dark columns |
| Golden Current | L4 | 7500-10000m | Abyss treasure cleft | Sparse deep gold | Rare glints | Sparse gold stones |
| Storm Trench | L1 | 0-2500m | First electric cleft | Blue-indigo | Faint electric wall | Indigo stone |
| Storm Trench | L2 | 2500-5000m | Deeper canyon | Dark indigo | Rock wall | Electric mist |
| Storm Trench | L3 | 5000-7500m | Fissure lightning | Cold deep blue | Sharp trench silhouette | Violet fog |
| Storm Trench | L4 | 7500-10000m | Abyss pressure | Near-black indigo | Deep cleft | Sparse electric edges |

## QA URLs

- `?qa=route-bg-school-layer1` through `route-bg-school-layer4`
- `?qa=route-bg-golden-layer1` through `route-bg-golden-layer4`
- `?qa=route-bg-storm-layer1` through `route-bg-storm-layer4`
- `?qa=route-bg-hook-event-priority`
- `?qa=route-bg-pullup-priority`
- `?qa=route-bg-result-priority`

## Formality

Current state: functional visual system with generated route far-background plates and layered route/depth overlays.

Production state needed later: route-specific painted/generated far, mid, near plates for every Route x Depth Layer, exported as actual art assets.

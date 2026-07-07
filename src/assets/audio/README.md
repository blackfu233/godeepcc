# Audio Assets

This demo now uses downloaded local Mixkit MP3 assets from `public/audio/`.

Status: `External Local Audio Assets`

Future replacement production assets can be placed here or under `public/audio/`:

- `music/*.ogg` or `music/*.mp3` for loop-ready BGM layers.
- `sfx/*.ogg` or `sfx/*.wav` for UI, event, pull-up, reel, and result sounds.

Recommended asset prep:

- Leave 0.1-0.2 seconds of headroom.
- Make BGM loops seamless.
- Keep SFX short and normalized by category.
- Replace entries in `src/audio/audioManifest.ts` when final studio-approved assets are available.

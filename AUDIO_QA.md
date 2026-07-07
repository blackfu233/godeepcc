# Audio QA

## Build

Run:

```bash
npm run build
```

## Verification Checklist

| Test | Expected |
| --- | --- |
| Inspect files | `public/audio/music/` has 6 MP3 files and `public/audio/sfx/` has downloaded MP3 files |
| Search code | No runtime imports from `proceduralFallback` or `sfxDefinitions` |
| First user interaction | Audio unlocks and starts local BGM from `/audio/music/` |
| Go Deep | Local click, wager, chain and reveal sounds play; no generated beep/sine sound |
| Depth 2500/5000/7500/10000 | Music layer crossfades and milestone sting plays |
| Event Chain Demo | Twin/Pearl/Puffer/Jelly local SFX sequences play |
| Pull Up | Depth BGM ducks; pull-up tension BGM and vortex/route loops start and stop by phase |
| High fish challenge | Struggle loop, reel spin, reel stop and win/escape SFX play |
| Result | Pull Up loops stop before result; Big Win+ plays result sting and result BGM |
| Restart / Scenario switch | No Pull Up/event loops remain after the new run begins |

## Notes

- Audio files are external Mixkit assets downloaded into the repository's `public/audio/` folder.
- No YouTube, SoundCloud, Spotify, paid, login-only, API-key, or unknown-license sources were used.
- The code still uses the Web Audio API only as a local-file mixer/decoder for volume buses, crossfades, loop control and pitch variation. It no longer uses procedural oscillator/noise placeholders as gameplay audio.

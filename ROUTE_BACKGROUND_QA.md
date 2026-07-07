# Route Background QA

## Build

`npm run build` completed successfully after adding the route background system.

## Manual Checks

- School / Golden / Storm use different far/mid/near compositions.
- Each route has 4 depth-layer configurations.
- Route background is selected from `activeRoute.id` and `currentZone`.
- Hook Event and Event Fish states set the background into subdued mode.
- Pull Up keeps the base scene but reduces route-specific background intensity.
- Result UI remains above the background.
- Reduced motion disables background animation while keeping route identity.

## Screenshot Set

Expected output folder:

`qa_screenshots/route_background/`

The app exposes deterministic QA URLs for every required shot. Open:

`http://127.0.0.1:5175/?qa=<name>`

Required states:

1. route-bg-school-layer1.png
2. route-bg-school-layer2.png
3. route-bg-school-layer3.png
4. route-bg-school-layer4.png
5. route-bg-golden-layer1.png
6. route-bg-golden-layer2.png
7. route-bg-golden-layer3.png
8. route-bg-golden-layer4.png
9. route-bg-storm-layer1.png
10. route-bg-storm-layer2.png
11. route-bg-storm-layer3.png
12. route-bg-storm-layer4.png
13. route-bg-transition-school-to-golden.png
14. route-bg-transition-golden-to-storm.png
15. route-bg-transition-storm-to-school.png
16. route-bg-hook-event-priority.png
17. route-bg-pullup-priority.png
18. route-bg-result-priority.png

## Screenshot Tool Blocker

Automated screenshot export was attempted after build, but the local screenshot backends were blocked by the environment:

- Microsoft Edge headless failed before writing files with `CreateFile: access denied` and `mojo platform_channel Check failed: access denied`.
- Retrying Edge with a workspace user-data-dir, `--no-sandbox`, and crashpad/breakpad disable flags still failed with the same crashpad/mojo access-denied error.
- Codex in-app browser navigation worked, but `Page.captureScreenshot` timed out and reset the browser automation session before any PNG could be written.

No fake or synthetic screenshots were generated. The QA URLs above remain wired in `src/App.tsx` for direct visual inspection in the in-app browser.

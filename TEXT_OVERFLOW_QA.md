# Text Overflow QA

## Build

- `npm run build`: Passed.

## Viewports Covered By CSS Rules

| Size | Coverage |
|---|---|
| 360 x 640 | Small-screen media rules apply. |
| 375 x 812 | Standard phone layout with adaptive text rules. |
| 390 x 844 | Standard target phone layout. |
| 412 x 915 | Standard target phone layout. |
| 430 x 932 | Desktop phone-frame target layout. |

## Screens / States Covered

| UI | Status |
|---|---|
| Main HUD | Protected by wrapping and font clamps. |
| Bottom Control Bar | Protected by adaptive min-height and wrapping. |
| Route Choice | Protected by adaptive panel/card text rules. |
| Active Route Chip | Protected by width cap and wrapping. |
| Hook Event Banner | Protected by 72% viewport width and two-line text handling. |
| Hook Break Panel | Protected by scroll-safe modal and responsive buttons. |
| Pull Up / Retrieving | Control overlay text protected by wrapping. |
| Result Screen | Large labels and numbers clamped to fit. |
| Settings / Audio | Panel scroll-safe with wrapping labels. |
| Depth Rail | Depth labels protected from right-edge overflow. |
| Fish Multiplier Chips | Browser-verified that fish payout chips no longer intersect the bottom control bar or phone-frame edges. |

## Browser Plugin Verification

- Reloaded the running in-app browser at `http://127.0.0.1:5175/`.
- Checked player-facing text containers with `scrollWidth/clientWidth` and `scrollHeight/clientHeight`; result: `[]`.
- Checked fish entities and fish multiplier chips against the phone frame and bottom control bar; remaining intersections were only the control bar's own buttons, which is expected.

## Screenshot Export

Automated screenshot export was attempted for the requested `textfix-*.png` set under `qa_screenshots/`, but Microsoft Edge headless was blocked by the local Windows browser sandbox:

- `Crashpad CreateFile: Access denied (0x5)`
- `mojo platform_channel Check failed: Access denied (0x5)`
- `Failed to grant sandbox access to cache/network directories`

No fake screenshots were produced. Manual visual confirmation should use:

- `http://127.0.0.1:5175/?qa=surface`
- `http://127.0.0.1:5175/?qa=route-restored-choice-zone25`
- `http://127.0.0.1:5175/?qa=route-restored-hook-event-priority`
- `http://127.0.0.1:5175/?qa=route-restored-pullup-priority`
- `http://127.0.0.1:5175/?qa=route-bg-result-priority`

## Known Remaining Risk

- The app currently does not expose a complete runtime language switch for all strings, so CSS was prepared for Traditional Chinese widths rather than validating every future localized string in-app.
- Debug panel text can still be dense by design; normal player UI was prioritized.

# External Asset Blockers

Status: no external image-generation blocker in this pass.

The requested Hook Anomaly VFX assets were generated through the available `$imagegen` bitmap generation flow, processed locally with chroma-key removal, and integrated into the project.

Notes:

- Native transparent background generation was not used. The pipeline used pure `#00FF00` chroma-key sources and local alpha conversion.
- The generated sheets are AI-created sprite sheets, so small frame-to-frame art drift may still exist.
- If a future pass needs stricter production animation registration, the next step should be specialist frame cleanup or hand-authored 2D animation after the current generated base.

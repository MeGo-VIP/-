# /anatomy/models/

Drop your real anatomical model here as **`body.glb`** (Draco-compressed
recommended). The system will pick it up automatically — **no code changes
needed** — as long as the model's mesh names follow the convention below.
Until this file exists, the viewer shows a clearly-labeled placeholder body
so the pipeline (layers, selection, camera, info panel) is fully testable.

## Mesh naming convention (case-insensitive substring match)

| Contains in mesh name | Bound to layer |
|---|---|
| `skin` | skin |
| `fat`, `adipose` | fat |
| `muscle` | muscles |
| `bone`, `skeleton` | skeleton |
| `organ` | organs |
| `vessel`, `artery`, `vein` | vessels |
| `nerve` | nerves |

| Contains in mesh name | Bound to structure (info panel) |
|---|---|
| `heart` | Heart |
| `lung` | Lungs |
| `brain` | Brain |
| `liver` | Liver |
| `kidney` | Kidneys |
| `stomach` | Stomach |

To add more structures, add an entry to `PARTS` in
`/anatomy/data/anatomy-map.js` with the same `nodeNames` convention — the
loader (`core/engine.js` → `_ingestModel`) and the raycaster will bind to it
automatically.

## Suggested open/free sources (verify each model's license yourself before use)

- **Z-Anatomy** (Sketchfab / GitHub) — CC-BY, layered human anatomy.
- **BodyParts3D** (DBCLS, Japan) — CC-BY-SA, anatomical structures.
- **NIH 3D Print Exchange** — mixed licenses, check per-model.

None of these have been downloaded or embedded by the assistant — verify the
license terms of whichever model you choose before shipping it publicly.

## Draco compression

If you compress with `gltf-transform` or `gltfpack`, keep the default Draco
settings — `core/engine.js` already points `DRACOLoader` at the matching
decoder version on jsdelivr.

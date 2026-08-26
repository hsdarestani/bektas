# Asset sources and licenses

## Bektas business photography

The team portraits, team photograph and the two real property photographs were downloaded from the existing public Bektas Immobilien Wiesbaden website solely for this Bektas sales demo:

- https://bektas-immobilien-wiesbaden.de/
- `Bektas-Immobilien-Wiesbaden-Fulya-Bektas-Portrait.jpg`
- `Bektas-Immobilien-Wiesbaden-Fatih-Bektas-Portrait.jpg`
- `IMG_3229.jpg`, `IMG_3226.jpg`, `Bild-Gemeinsam.jpg`
- `IMG_1241.jpg`, `Bild-1.jpg`

These assets remain the property of their original rights holder. Confirm the client's usage rights before moving the concept to a different production domain or campaign.

## Concept architecture photography

`hero-residence.webp`, `urban-residence.webp`, and `interior-detail.webp` were generated specifically for this speculative concept with OpenAI image generation. They contain no third-party logos or visible text.

## Fonts

- DM Sans — Copyright Google; SIL Open Font License 1.1.
- Instrument Serif — Copyright Instrument; SIL Open Font License 1.1.

Both font families are self-hosted in `public/fonts` to avoid runtime font requests.

## Immersive 3D architecture

- **Modern luxury villa house building with pool** by **saeedakbari** —
  [Sketchfab source](https://sketchfab.com/3d-models/modern-luxury-villa-house-building-with-pool-1e36279ffc4e43c997c627cfa41752f0),
  licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  `public/experience/models/villa.glb` is an optimized derivative of that model.
- Downloadable source mirror used for the original glTF package:
  [DylPorter/aisl-vr at caf4d84](https://github.com/DylPorter/aisl-vr/tree/caf4d84f4f39558582af0df7d6dd8de3b1f40353/modern_luxury_villa_house_building_with_pool).
  The embedded model metadata and bundled `license.txt` identify the same Sketchfab author, model URL and CC BY 4.0 license.

## HDR environment, vegetation and PBR surfaces

The following assets are by [Poly Haven](https://polyhaven.com/) and are licensed
under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/):

- [Eilenriede Park HDRI](https://polyhaven.com/a/eilenriede_park) — self-hosted 1K and 2K HDR variants.
- [Quiver Tree 01](https://polyhaven.com/a/quiver_tree_01) — optimized glTF.
- [Shrub 02](https://polyhaven.com/a/shrub_02) — optimized glTF.
- [Fern 02](https://polyhaven.com/a/fern_02) — optimized glTF.
- [Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock) — 1K base color, OpenGL normal, roughness and displacement maps.
- [Concrete Pavement 02](https://polyhaven.com/a/concrete_pavement_02) — 1K base color, OpenGL normal, roughness and displacement maps.
- [Concrete Wall 009](https://polyhaven.com/a/concrete_wall_009) — 1K OpenGL normal and roughness maps.

All runtime assets are self-hosted. Models were web-optimized with glTF Transform,
Meshopt geometry compression and WebP texture conversion. The original author credit
and licensing summary are also served at `/experience/credits.txt`.

## 3D and interaction libraries

- Three.js — MIT License
- React Three Fiber — MIT License
- Drei — MIT License
- React Three Postprocessing — MIT License
- postprocessing — Zlib License
- Lenis — MIT License
- Lucide — ISC License
- glTF Transform (development tooling) — MIT License

See each package's license in `node_modules` or its upstream repository for the complete terms.

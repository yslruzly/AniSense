# AniSense logo

## The mark

A palay grain notched at the base into an upward point: the harvest and the
rising price in one shape. The vertical husk seam keeps it reading as grain
rather than as an arrowhead, and it survives down to 48px.

## Files

| File | Use |
| --- | --- |
| `anisense-mark.svg` | Mark only, `currentColor` fill. Seam knocked out; set `--anisense-knockout` to the background colour. |
| `anisense-mark-solid.svg` | Single-colour version, seam punched out of the path. Use on photos, stamps, embroidery, anything one-colour. |
| `anisense-icon.svg` | Rounded tile, gold on ink. |
| `anisense-icon-light.svg` | Rounded tile, green on paper. |
| `anisense-lockup-dark.svg` / `-light.svg` | Horizontal mark + wordmark. |
| `ic_launcher_foreground.svg` / `_background.svg` | Android adaptive icon layers, 108dp canvas. |
| `icon-{48,72,96,144,192,512,1024}.png` | Raster exports. 512 for Play Store listing, 1024 spare. |

The wordmark is **Lexend Bold, tracking −1.2**. The lockup SVGs reference the
font by name; convert the text to outlines before sending the file anywhere the
font isn't installed.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| ink | `#16211B` | Icon background, wordmark on light |
| palay | `#F2B32C` | Mark on ink |
| tanim | `#0B6B41` | Mark on paper |
| paper | `#FAF8F3` | Light background, wordmark on ink |

Gold on ink is the primary pairing. Green on paper is the light alternate.
Don't put gold on paper; it fails contrast.

## Clear space and minimum size

Keep clear space equal to half the mark's width on all sides. Minimum size is
20px tall for the mark on screen; below that the husk seam closes up, so switch
to `anisense-mark-solid.svg`.

## In the app

`src/components/AniSenseMark.tsx` renders the mark inline. It takes `size`,
`color`, `knockout`, and `solid`.

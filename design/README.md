# Design source images

The original artwork, at full size. **The app does not load anything from this
folder.** Each one was converted to a smaller `.webp` in `src/assets/`, which is
what the screens import — a 2 MB PNG on a phone screen costs a farmer's data and
a second of loading for a picture that renders 380 pixels wide.

| Source here | Used by the app as | Where it appears |
|---|---|---|
| `AnisensePosterLS.png` | `src/assets/anisense-poster.webp` | Buyer Home, between the price chart and Featured farmers |
| `AnisensePosterMarket.png` | *(unused — identical to `AnisensePosterLS.png`)* | — |
| `FarmerMarketSell.png` | `src/assets/farmer-sell.webp` | Marketplace panel, farmer accounts |
| `Peeking.png` | `src/assets/juan-peek.webp`, split into `juan-peek-body.webp` + `juan-peek-hand.webp` (+ `juan-peek-mouth-half.webp`, `juan-peek-mouth-shut.webp`: drawn half-open mouth and closed smile) | Signup screens (language, role); the hand layer waves from the wrist, and the mouth layers loop so he keeps talking |
| `CarryingBasket.png` (its "transparent" checkerboard was painted in; cut out) | `src/assets/mascot-basket.webp` (+ `-blink`, `-mouth-half`, `-mouth-shut`: drawn closed lids, half-open mouth, closed smile) | Today's market card on Prices; blinks and talks on a loop |
| `buyersmascot.png` | `src/assets/buyer-mascot.webp` (+ `buyer-mascot-eyes.webp`, `buyer-mascot-mouth.webp`: drawn closed lids and closed smile) | "Fresh from local farms" card, buyer Home; on the role screen he blinks and talks |
| `mascothi.png` → `mascothi-clean.png` (extra hat lobe removed) | `src/assets/mascot-wave-body.webp` + `-hand` + `-eyes` + `-mouth` | Opening card of the walkthrough: the hand rotates from the wrist; `-eyes` (closed lids) and `-mouth` (closed smile) are drawn overlays that switch on to blink and talk |
| `mascotthumbsup.png` → `mascotthumbsup-cut.png` (white background removed) | `src/assets/mascot-thumbs.webp` + `mascot-thumbs-eyes.webp` | Last card of the walkthrough; `-eyes` (closed lids) switches on to blink |

The marketplace poster that is actually on screen came from a file that is no
longer on disk; `src/assets/anisense-poster-market.webp` is the only copy of it.

## Adding or replacing one

Drop the full-size file here, then convert it into `src/assets/` before using it:

```bash
python -c "from PIL import Image; im=Image.open('design/NEW.png').convert('RGB'); w=1000; im.resize((w, round(im.height*w/im.width)), Image.LANCZOS).save('src/assets/new.webp','WEBP',quality=84,method=6)"
```

1000 px wide is sharp on a phone (about 2.6× a 380 px slot) and lands around
80–90 KB. Import the `.webp` in the screen that shows it, never the PNG.

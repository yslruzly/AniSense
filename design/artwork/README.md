# Design source images

The original artwork, at full size. **The app does not load anything from this
folder.** Each one was converted to a smaller `.webp` in `src/assets/`, which is
what the screens import — a 2 MB PNG on a phone screen costs a farmer's data and
a second of loading for a picture that renders 380 pixels wide.

| Source here | Used by the app as | Where it appears |
|---|---|---|
| `AniSenseWallpaper.png` | `src/assets/anisense-wallpaper.webp` | Welcome screen, full-bleed behind the two sign-up buttons |
| `AnisensePosterLS.png` | `src/assets/anisense-poster.webp` (1200 wide) | Buyer Home, the second poster in the banner under the search bar; farmer Home, partway down |
| `FarmerMarketPoster.png` | `src/assets/farmer-market-poster.webp` (1200 wide) | Marketplace poster, farmer accounts (16:9, the same frame as the buyers' poster) |
| `MarketplaceBuyerPoster.png` | `src/assets/anisense-poster-market.webp` (1200 wide: the poster carries a lot of text) | Marketplace poster, buyer accounts: "Fresh from the Farm. Connect directly with local farmers" |
| `Peeking.png` | `src/assets/juan-peek.webp`, split into `juan-peek-body.webp` + `juan-peek-hand.webp` (+ `juan-peek-mouth-half.webp`, `juan-peek-mouth-shut.webp`: drawn half-open mouth and closed smile) | Signup screens (language, role); the hand layer waves from the wrist, and the mouth layers switch in turn so he says each line, then stops |
| `FarmerCarryingBasket.png` (already transparent; cropped to the figure's width, 420 × 474) | `src/assets/mascot-basket.webp` (+ `-blink`, `-mouth-half`, `-mouth-shut`: closed lids, a half-open mouth and a closed smile, drawn on the same canvas by a script that fills the eyes and mouth with the face's own skin tones) | The market card at the top of Prices; blinks and talks on a loop |
| `BuyerPhone.png` (the faint coloured haze left by its background removal cleared; cropped head to waist, 456 × 520) | `src/assets/buyer-mascot.webp` (+ `buyer-mascot-eyes.webp`, `buyer-mascot-mouth.webp`: closed lids and a closed smile, drawn on the same canvas by a script) | Creating an account as a buyer: the role step and every sign-up question. She blinks, and says each line |
| `BuyerHi.png` (haze cleared; cropped head to waist, 420 × 435, the farmer's hello frame) | `src/assets/buyer-wave-body.webp` (the hand cut away above the wrist; her sleeve carried on where the palm covered it) + `-hand` (rotates from the wrist crease, `transform-origin: 14.37% 55.91%` on `.tour-mascot.buyer .tm-hand`) + `-eyes` (her open eye closed; the other is drawn winking) + `-mouth` (a small open mouth: she is drawn with a closed smile, so saying hi opens it) | Opening card of the buyer's walkthrough: she waves, blinks and says hi |
| `FarmerHi.png` (already transparent; cropped to the figure's width from the top of the hat, 420 × 435) | `src/assets/mascot-wave-body.webp` (the hand cut away above the wrist) + `-hand` (the hand alone; it rotates from the wrist crease, `transform-origin: 14.47% 61.55%` on `.tm-hand`) + `-eyes` (closed lids) + `-mouth` (closed smile), all drawn on the same canvas by a script | Opening card of the walkthrough, and the Guide: the hand waves, the eyes blink, the smile closes to say hello |
| `FarmerThumbsUp.png` (already transparent; cropped to the figure's width, 420 × 443) | `src/assets/mascot-thumbs.webp` + `mascot-thumbs-eyes.webp` (closed lids, drawn on the same canvas by a script that fills the eyes with the face's own skin tones) | Last card of the walkthrough, and the achievement pop-up; `-eyes` switches on to blink |

## Adding or replacing one

**Replacing a PNG here changes nothing in the app by itself.** The app shows the
`.webp` in `src/assets/`, so after dropping in the new full-size file:

1. convert it over that `.webp` (below), then
2. build a new APK (`npm run build`, `npx cap sync android`,
   `.\android\gradlew.bat -p android assembleDebug`) and install it.

To convert:

```bash
python -c "from PIL import Image; im=Image.open('design/artwork/NEW.png').convert('RGB'); w=1000; im.resize((w, round(im.height*w/im.width)), Image.LANCZOS).save('src/assets/new.webp','WEBP',quality=84,method=6)"
```

1000 px wide is sharp on a phone (about 2.6× a 380 px slot) and lands around
80–90 KB. Import the `.webp` in the screen that shows it, never the PNG.

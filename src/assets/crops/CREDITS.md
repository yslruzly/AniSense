# Image credits

Crop photographs in `src/assets/crops/`. This record exists so the
provenance of each file can be checked later.

Since 2026-10-06, every crop photo except rice comes from the AniSense team's
own folder of photos (`AniSense_Crop-images`), cropped to 4:3 and saved at
most 720 x 540 by the conversion script described below. Before the app is
published, confirm that the team has the right to use each of these photos
(taken by the team, or licensed for commercial use).

| File | Variety | Source file |
| --- | --- | --- |
| `ampalaya-galaxy.webp` | Galaxy Ampalaya | GalaxyAmpalaya.png |
| `ampalaya-native.webp` | Native Ampalaya | NativeAmpalaya.png |
| `cala-regular.webp` | Regular Calamansi | Calamansi.png |
| `corn-sweet.webp` | Sweet Corn | SweetCorn.png |
| `corn-white.webp` | White Corn | WhiteCorn.png |
| `corn-yellow.webp` | Yellow Corn | YellowCorn.png |
| `garlic-native.webp` | Native Garlic | NativeGarlic.png |
| `mango-carab.webp` | Carabao Mango | CarabaoMango.png (333 px wide: shown as is, not enlarged) |
| `mango-indian.webp` | Indian Mango | IndianMango.png |
| `melon-seedless.webp` | Seedless Watermelon | SeedlessWatermelon.png |
| `melon-sweet.webp` | Sweet Watermelon | SweetWatermelon.png |
| `melon-yellow.webp` | Yellow Watermelon | YellowWatermelon.png |
| `onion-red.webp` | Red Onion | RedOnion.png |
| `onion-spring.webp` | Spring Onion | SpringOnion.png |
| `onion-white.webp` | Yellow/White Onion | YellowOnion.png |
| `onion-yellow.webp` | Shallots Onion | ShallotsOnion.png |
| `squash-kalabasa.webp` | Kalabasa | KalabasaSquash.png |
| `tom-baguio.webp` | Kamatis Baguio | KamatisBaguio.png (on white: widened with white, not cropped) |
| `tom-cherry.webp` | Diamante Max F1 Tomato | DiamanteMaxTomato.png |
| `tom-tagalog.webp` | Kamatis Tagalog | TagalogTomato.png |

Rice is the one photo not from the team's folder:

| File | Source | License | Original title |
| --- | --- | --- | --- |
| `rice-special.webp` | openverse/wordpress | cc0 | Short white rice grains are displayed in bulk at a hypermarket in Kozhikode. The smooth, polished grains are a common rice variety used in Kerala homes for breakfasts like dosa and idli. |

The three rice grades (Special, Well Milled, Regular Milled) share it: they
are all milled white rice, and the difference does not photograph.

## Replacing a photo

Put the new photo in a folder, crop it to 4:3 around the crop (the fruit,
bulbs or ears in frame), and save it here as WebP, at most 720 x 540 and
never enlarged, under the variety's id (the names above). `src/data/cropPhotos.ts`
maps each variety's id to its file.

## Other images

| File | Source | License | Original title |
| --- | --- | --- | --- |
| `src/assets/expenses-bg.webp` | StockSnap | CC0 | Accounting Finance (calculator at a desk) |

import { Wheat, Sprout, Leaf, FlaskConical, User, Tractor, Waves, Package, CloudSun, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, Moon, CloudMoon } from "lucide-react";

// ─── Lucide Icon Maps ─────────────────────────────────────────────────────────
export const S = 16; // default icon size

export function CropIcon({ crop, size = S }: { crop: string; size?: number }) {
  const props = { size, color: "var(--tanim)" };
  const riceVarieties = ["Rice (All Varieties)", "Special Rice", "Well Milled", "Regular Milled"];
  if (riceVarieties.includes(crop)) return <Wheat {...props} />;
  switch (crop) {
    case "All Crops": return <Wheat   {...props} />;
    case "Corn": return <Sprout  {...props} />;
    case "Onions": return <Leaf    {...props} />;
    case "Tomatoes": return <Leaf    {...props} color="var(--error)" />;
    case "Calamansi": return <Sprout  {...props} color="var(--gold-text)" />;
    case "Mango": return <Leaf    {...props} color="var(--gold-text)" />;
    case "Garlic": return <Sprout  {...props} color="var(--tanim)" />;
    case "Squash": return <Leaf    {...props} color="var(--gold-text)" />;
    case "Ampalaya": return <Leaf    {...props} color="var(--tanim)" />;
    case "Watermelon": return <Leaf    {...props} color="var(--error)" />;
    default: return <Sprout  {...props} />;
  }
}

export function ExpenseIcon({ cat, size = S, color = "var(--tanim)" }: { cat: string; size?: number; color?: string }) {
  const props = { size, color };
  switch (cat) {
    case "Seeds": return <Wheat        {...props} />;
    case "Fertilizer": return <FlaskConical {...props} />;
    case "Labor": return <User         {...props} />;
    case "Equipment": return <Tractor      {...props} />;
    case "Irrigation": return <Waves        {...props} />;
    default: return <Package      {...props} />;
  }
}

// One picture per condition, in the colour of what it means: gold sun,
// slate cloud, blue rain, violet storm. After dark, the sun becomes the moon.
export function WeatherIcon({ icon, size = 22, night = false }: { icon: string; size?: number; night?: boolean }) {
  const props = { size, strokeWidth: 2 };
  switch (icon) {
    case "Sunny": return night ? <Moon {...props} color="#8C9BC9" /> : <Sun {...props} color="#D9941A" />;
    case "PartlyCloudy": return night ? <CloudMoon {...props} color="#7F8BB0" /> : <CloudSun {...props} color="#C98A1B" />;
    case "Cloudy": return <Cloud {...props} color="#7D8B86" />;
    case "LightRain": return <CloudDrizzle {...props} color="#3F83C4" />;
    case "Rainy": return <CloudRain {...props} color="#2F6FA8" />;
    case "Stormy": return <CloudLightning {...props} color="#5C45A8" />;
    default: return <CloudSun {...props} color="#C98A1B" />;
  }
}

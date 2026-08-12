import { Wheat, Sprout, Leaf, FlaskConical, User, Tractor, Waves, Package, CloudSun, Droplets, AlertTriangle } from "lucide-react";

// ─── Lucide Icon Maps ─────────────────────────────────────────────────────────
export const S = 16; // default icon size

export function CropIcon({ crop, size = S }: { crop: string; size?: number }) {
  const props = { size, color: "#2e7d4f" };
  const riceVarieties = ["Rice (All Varieties)", "Special Rice", "Well Milled", "Regular Milled"];
  if (riceVarieties.includes(crop)) return <Wheat {...props} />;
  switch (crop) {
    case "Corn": return <Sprout  {...props} />;
    case "Onions": return <Leaf    {...props} />;
    case "Tomatoes": return <Leaf    {...props} color="#c74133" />;
    case "Calamansi": return <Sprout  {...props} color="#b97d10" />;
    case "Mango": return <Leaf    {...props} color="#8a5d0c" />;
    case "Garlic": return <Sprout  {...props} color="#2e7d4f" />;
    case "Squash": return <Leaf    {...props} color="#c96a24" />;
    default: return <Sprout  {...props} />;
  }
}

export function ExpenseIcon({ cat, size = S }: { cat: string; size?: number }) {
  const props = { size, color: "#2e7d4f" };
  switch (cat) {
    case "Seeds": return <Wheat        {...props} />;
    case "Fertilizer": return <FlaskConical {...props} />;
    case "Labor": return <User         {...props} />;
    case "Equipment": return <Tractor      {...props} />;
    case "Irrigation": return <Waves        {...props} />;
    default: return <Package      {...props} />;
  }
}

export function WeatherIcon({ icon, size = 22 }: { icon: string; size?: number }) {
  const props = { size };
  switch (icon) {
    case "Sunny": return <CloudSun      {...props} color="#cf8f1f" />;
    case "PartlyCloudy": return <CloudSun      {...props} color="#82735f" />;
    case "Rainy": return <Droplets      {...props} color="#5c86b8" />;
    case "Stormy": return <AlertTriangle {...props} color="#6d4bb8" />;
    case "LightRain": return <Droplets      {...props} color="#8fadd0" />;
    default: return <CloudSun      {...props} color="#82735f" />;
  }
}

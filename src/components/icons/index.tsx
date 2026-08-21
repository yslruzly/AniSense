import { Wheat, Sprout, Leaf, FlaskConical, User, Tractor, Waves, Package, CloudSun, Droplets, AlertTriangle } from "lucide-react";

// ─── Lucide Icon Maps ─────────────────────────────────────────────────────────
export const S = 16; // default icon size

export function CropIcon({ crop, size = S }: { crop: string; size?: number }) {
  const props = { size, color: "var(--tanim)" };
  const riceVarieties = ["Rice (All Varieties)", "Special Rice", "Well Milled", "Regular Milled"];
  if (riceVarieties.includes(crop)) return <Wheat {...props} />;
  switch (crop) {
    case "Corn": return <Sprout  {...props} />;
    case "Onions": return <Leaf    {...props} />;
    case "Tomatoes": return <Leaf    {...props} color="var(--error)" />;
    case "Calamansi": return <Sprout  {...props} color="var(--gold-text)" />;
    case "Mango": return <Leaf    {...props} color="var(--gold-text)" />;
    case "Garlic": return <Sprout  {...props} color="var(--tanim)" />;
    case "Squash": return <Leaf    {...props} color="var(--gold-text)" />;
    default: return <Sprout  {...props} />;
  }
}

export function ExpenseIcon({ cat, size = S }: { cat: string; size?: number }) {
  const props = { size, color: "var(--tanim)" };
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
    case "Sunny": return <CloudSun      {...props} color="var(--gold-text)" />;
    case "PartlyCloudy": return <CloudSun      {...props} color="var(--text-muted)" />;
    case "Rainy": return <Droplets      {...props} color="var(--tanim)" />;
    case "Stormy": return <AlertTriangle {...props} color="var(--ink-2)" />;
    case "LightRain": return <Droplets      {...props} color="var(--tanim-sk)" />;
    default: return <CloudSun      {...props} color="var(--text-muted)" />;
  }
}

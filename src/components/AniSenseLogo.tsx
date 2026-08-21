import logoSrc from "../assets/AnisenseLogoIn.png";

// ─── AniSense Logo ────────────────────────────────────────────────────────────
// The brand mark, shipped as artwork rather than drawn in code. It is square, so
// callers only pass one dimension.
export function AniSenseLogo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt="AniSense"
      className={className}
      style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
    />
  );
}

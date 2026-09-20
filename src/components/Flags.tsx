// ─── Flags ────────────────────────────────────────────────────────────────────
// Drawn rather than typed as emoji: 🇵🇭 renders as the letters "PH" on Windows,
// as a different shape on every Android skin, and can't be sized or given a
// border. These are plain SVG, so they look the same everywhere and keep their
// edges at any size.
//
// Decorative: the language name beside them is what's read aloud.

export function FlagPH({ width = 46 }: { width?: number }) {
  return (
    <svg className="flag" viewBox="0 0 60 40" width={width} height={width * (40 / 60)} aria-hidden="true">
      {/* Blue over red, white triangle at the hoist. (In wartime the flag is
          flown red over blue; peacetime is blue on top.) */}
      <rect width="60" height="20" fill="#0038A8" />
      <rect y="20" width="60" height="20" fill="#CE1126" />
      <polygon points="0,0 0,40 34.64,20" fill="#FFFFFF" />
      {/* Eight-rayed sun for the first eight provinces to revolt. */}
      <g fill="#FCD116">
        <circle cx="11.6" cy="20" r="4" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="10.9" y="12.4" width="1.4" height="4" rx=".6"
            transform={`rotate(${i * 45} 11.6 20)`} />
        ))}
        {/* Three stars: Luzon, Visayas, Mindanao. */}
        {[[4.6, 4.6], [4.6, 35.4], [28.4, 20]].map(([x, y], i) => (
          <polygon key={i}
            points="0,-2.6 0.76,-0.8 2.6,-0.8 1.1,0.4 1.6,2.2 0,1.1 -1.6,2.2 -1.1,0.4 -2.6,-0.8 -0.76,-0.8"
            transform={`translate(${x} ${y})`} />
        ))}
      </g>
    </svg>
  );
}

export function FlagUS({ width = 46 }: { width?: number }) {
  const stripe = 40 / 13;
  return (
    <svg className="flag" viewBox="0 0 60 40" width={width} height={width * (40 / 60)} aria-hidden="true">
      <rect width="60" height="40" fill="#FFFFFF" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="60" height={stripe} fill="#B22234" />
      ))}
      <rect width="24" height={stripe * 7} fill="#3C3B6E" />
      {/* The stars are a regular grid, not the exact 50-star pattern: at this
          size the real arrangement is a smudge either way. */}
      <g fill="#FFFFFF">
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => (
            <circle key={`${r}-${c}`} cx={2.6 + c * 3.9} cy={2.4 + r * 3.9} r=".78" />
          ))
        )}
      </g>
    </svg>
  );
}

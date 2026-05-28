// 四君子 — plum, orchid, bamboo, chrysanthemum — rendered as stylised
// ink-painting SVGs in the four corners of the page. Decorative only:
// pointer-events disabled so clicks always reach content above, and
// hidden on small viewports to avoid crowding the board on phones.

const INK = '#2a1d14';
const ACCENT = '#a8543b';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const POS: Record<Corner, string> = {
  tl: 'top-3 left-3',
  tr: 'top-3 right-3',
  bl: 'bottom-3 left-3',
  br: 'bottom-3 right-3',
};

function Plum() {
  // 梅 — bare branch with small 5-petal blossoms and a hint of cinnabar
  // pistil. Suggests winter resilience.
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke={INK} fill="none" strokeLinecap="round">
        {/* main branch */}
        <path d="M 10 85 Q 30 65 50 52 Q 70 40 88 18" strokeWidth="2.6" />
        {/* twigs */}
        <path d="M 50 52 Q 53 35 58 25" strokeWidth="1.6" />
        <path d="M 70 40 Q 75 30 80 22" strokeWidth="1.4" />
      </g>
      {/* blossoms — 5 petals + accent pistil */}
      {[
        { x: 28, y: 70 },
        { x: 58, y: 25 },
        { x: 78, y: 22 },
      ].map(({ x, y }) => (
        <g key={`${x}-${y}`} transform={`translate(${x},${y})`}>
          <g fill={INK}>
            <circle r="2.5" cx="0" cy="-4" />
            <circle r="2.5" cx="3.8" cy="-1.2" />
            <circle r="2.5" cx="2.4" cy="3.3" />
            <circle r="2.5" cx="-2.4" cy="3.3" />
            <circle r="2.5" cx="-3.8" cy="-1.2" />
          </g>
          <circle r="1.3" fill={ACCENT} />
        </g>
      ))}
    </svg>
  );
}

function Orchid() {
  // 兰 — long curving leaves with a couple of small blossoms.
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke={INK} fill="none" strokeLinecap="round">
        {/* sweeping leaves from a common base */}
        <path d="M 50 92 C 32 78 22 50 28 22" strokeWidth="2.4" />
        <path d="M 50 92 C 56 65 66 42 78 22" strokeWidth="2.4" />
        <path d="M 50 92 C 46 70 46 50 52 30" strokeWidth="1.8" />
        <path d="M 50 92 C 62 78 76 72 90 78" strokeWidth="1.8" />
        <path d="M 50 92 C 38 82 24 80 12 86" strokeWidth="1.8" />
        {/* flower stem */}
        <path d="M 50 70 Q 58 58 64 50" strokeWidth="1.2" />
      </g>
      {/* small orchid blooms */}
      <g fill={INK}>
        <ellipse cx="64" cy="50" rx="4" ry="2.4" transform="rotate(-25 64 50)" />
        <ellipse cx="38" cy="40" rx="3.6" ry="2.1" transform="rotate(35 38 40)" />
      </g>
      <circle cx="64" cy="50" r="1.1" fill={ACCENT} />
    </svg>
  );
}

function Bamboo() {
  // 竹 — two segmented stalks with characteristic leaf clusters.
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke={INK} fill="none" strokeLinecap="round">
        {/* stalks */}
        <line x1="38" y1="10" x2="38" y2="92" strokeWidth="3" />
        <line x1="62" y1="22" x2="62" y2="92" strokeWidth="2.6" />
        {/* joints */}
        <line x1="34" y1="32" x2="42" y2="32" strokeWidth="2" />
        <line x1="34" y1="54" x2="42" y2="54" strokeWidth="2" />
        <line x1="34" y1="76" x2="42" y2="76" strokeWidth="2" />
        <line x1="58" y1="44" x2="66" y2="44" strokeWidth="2" />
        <line x1="58" y1="66" x2="66" y2="66" strokeWidth="2" />
        {/* leaves */}
        <path d="M 38 22 Q 54 14 66 18" strokeWidth="2" />
        <path d="M 38 42 Q 22 34 12 38" strokeWidth="2" />
        <path d="M 62 34 Q 78 24 90 28" strokeWidth="2" />
        <path d="M 38 64 Q 54 58 66 64" strokeWidth="2" />
        <path d="M 62 58 Q 78 50 88 54" strokeWidth="2" />
      </g>
    </svg>
  );
}

function Chrysanthemum() {
  // 菊 — radial-petal flower on a stem with two leaves.
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke={INK} fill="none" strokeLinecap="round">
        {/* stem */}
        <line x1="50" y1="55" x2="50" y2="96" strokeWidth="2" />
        {/* leaves */}
        <path d="M 50 76 Q 30 70 22 60" strokeWidth="2" />
        <path d="M 50 86 Q 70 82 78 72" strokeWidth="2" />
      </g>
      {/* radial petals */}
      <g transform="translate(50 40)" stroke={INK} fill="none" strokeWidth="1.8" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 360) / 12;
          return (
            <ellipse
              key={i}
              cx="0"
              cy="-15"
              rx="2.6"
              ry="7"
              transform={`rotate(${angle})`}
            />
          );
        })}
      </g>
      <circle cx="50" cy="40" r="3" fill={ACCENT} />
    </svg>
  );
}

const CORNERS: ReadonlyArray<{ corner: Corner; Icon: () => JSX.Element }> = [
  { corner: 'tl', Icon: Plum },
  { corner: 'tr', Icon: Orchid },
  { corner: 'bl', Icon: Bamboo },
  { corner: 'br', Icon: Chrysanthemum },
];

export function CornerDecoration() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden sm:block select-none"
    >
      {CORNERS.map(({ corner, Icon }) => (
        <div
          key={corner}
          className={`absolute ${POS[corner]} w-28 h-28 lg:w-36 lg:h-36 opacity-30`}
        >
          <Icon />
        </div>
      ))}
    </div>
  );
}

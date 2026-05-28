// 四君子 — plum, orchid, bamboo, chrysanthemum — rendered as low-opacity
// brush-calligraphy watermarks in the four corners of the page. Pure
// decoration: pointer-events disabled so clicks always reach the content
// above, and hidden on small viewports to avoid visual collision with the
// main board.
const ITEMS: ReadonlyArray<{ ch: string; pos: string }> = [
  { ch: '梅', pos: 'top-2 left-2' },
  { ch: '兰', pos: 'top-2 right-2' },
  { ch: '竹', pos: 'bottom-2 left-2' },
  { ch: '菊', pos: 'bottom-2 right-2' },
];

export function CornerDecoration() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden sm:block select-none"
    >
      {ITEMS.map(({ ch, pos }) => (
        <span
          key={ch}
          className={`absolute ${pos} font-brush text-[7rem] leading-none text-[#2a1d14] opacity-15`}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

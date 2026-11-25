export function MovaraMark({ className = '' }: { className?: string }) {
  const strokes = [
    'M14 14 L652 662',
    'M18 218 L18 652',
    'M18 218 L232 420',
    'M650 22 L650 442',
    'M650 22 L405 246',
  ];

  return (
    <svg
      viewBox="-20 -20 708 740"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g>
        {strokes.map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}

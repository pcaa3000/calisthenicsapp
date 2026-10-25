interface FigureProps {
  anim: string;
  size?: number;
}

// Animated stick figure. The `anim` key maps to `.anim-<key>` rules in
// styles.css, which drive every part via CSS transforms on the groups below.
export function Figure({ anim, size = 140 }: FigureProps) {
  return (
    <svg
      viewBox="0 0 140 130"
      width={size}
      height={size}
      className={`fig anim-${anim}`}
      role="img"
      aria-hidden="true"
    >
      <ellipse className="fig-shadow" cx="70" cy="118" rx="30" ry="5" />
      <line className="fig-ground" x1="8" y1="118" x2="132" y2="118" />
      <line className="fig-wall" x1="112" y1="10" x2="112" y2="118" />
      <g className="fig-chair">
        <line x1="94" y1="84" x2="128" y2="84" />
        <line x1="98" y1="84" x2="98" y2="118" />
        <line x1="124" y1="84" x2="124" y2="118" />
        <line x1="124" y1="56" x2="124" y2="84" />
      </g>
      <path className="fig-diamond" d="M100 102 l7 7 -7 7 -7 -7 z" />
      <g className="fig-body">
        <g className="lower">
          <line className="torso-low" x1="70" y1="42" x2="70" y2="60" />
          <g className="leg leg-a">
            <line x1="70" y1="60" x2="70" y2="86" />
            <g className="shin shin-a">
              <line x1="70" y1="86" x2="70" y2="112" />
            </g>
          </g>
          <g className="leg leg-b">
            <line x1="70" y1="60" x2="70" y2="86" />
            <g className="shin shin-b">
              <line x1="70" y1="86" x2="70" y2="112" />
            </g>
          </g>
        </g>
        <g className="upper">
          <line className="torso-up" x1="70" y1="24" x2="70" y2="44" />
          <circle className="head" cx="70" cy="14" r="7" />
          <g className="arm arm-a">
            <line x1="70" y1="30" x2="70" y2="52" />
            <g className="fore fore-a">
              <line x1="70" y1="52" x2="70" y2="72" />
            </g>
          </g>
          <g className="arm arm-b">
            <line x1="70" y1="30" x2="70" y2="52" />
            <g className="fore fore-b">
              <line x1="70" y1="52" x2="70" y2="72" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

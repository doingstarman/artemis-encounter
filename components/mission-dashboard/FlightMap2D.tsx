import type { TrajectoryPoint } from "@/lib/types";
import styles from "@/components/mission-dashboard/FlightMap2D.module.css";

type Props = {
  trajectory: TrajectoryPoint[];
  progress: number;
  activeStageTitle: string;
};

const WIDTH = 1000;
const HEIGHT = 460;

const STARS = [
  { cx: 210, cy: 22, r: 0.9, o: 0.7 }, { cx: 310, cy: 44, r: 1.2, o: 0.5 },
  { cx: 420, cy: 18, r: 0.7, o: 0.65 }, { cx: 500, cy: 35, r: 1.1, o: 0.4 },
  { cx: 580, cy: 20, r: 0.8, o: 0.8 }, { cx: 645, cy: 52, r: 0.6, o: 0.5 },
  { cx: 720, cy: 28, r: 1.0, o: 0.6 }, { cx: 798, cy: 46, r: 0.7, o: 0.7 },
  { cx: 955, cy: 75, r: 0.9, o: 0.5 }, { cx: 972, cy: 145, r: 0.6, o: 0.4 },
  { cx: 962, cy: 295, r: 0.8, o: 0.6 }, { cx: 944, cy: 355, r: 1.0, o: 0.5 },
  { cx: 822, cy: 402, r: 0.7, o: 0.6 }, { cx: 702, cy: 422, r: 1.1, o: 0.4 },
  { cx: 598, cy: 438, r: 0.8, o: 0.5 }, { cx: 488, cy: 448, r: 0.6, o: 0.7 },
  { cx: 378, cy: 432, r: 1.0, o: 0.5 }, { cx: 268, cy: 420, r: 0.7, o: 0.6 },
  { cx: 168, cy: 402, r: 0.9, o: 0.4 }, { cx: 30, cy: 355, r: 0.8, o: 0.5 },
  { cx: 18, cy: 195, r: 0.6, o: 0.7 }, { cx: 34, cy: 95, r: 1.0, o: 0.4 },
  { cx: 282, cy: 138, r: 0.7, o: 0.4 }, { cx: 364, cy: 178, r: 0.5, o: 0.5 },
  { cx: 452, cy: 98, r: 0.9, o: 0.3 }, { cx: 522, cy: 202, r: 0.6, o: 0.35 },
  { cx: 602, cy: 128, r: 0.8, o: 0.5 }, { cx: 672, cy: 305, r: 0.7, o: 0.3 },
  { cx: 742, cy: 352, r: 1.0, o: 0.4 }, { cx: 812, cy: 312, r: 0.6, o: 0.5 },
  { cx: 154, cy: 158, r: 0.8, o: 0.5 }, { cx: 238, cy: 202, r: 0.6, o: 0.4 },
  { cx: 332, cy: 302, r: 0.7, o: 0.3 }, { cx: 402, cy: 352, r: 0.5, o: 0.5 },
  { cx: 472, cy: 288, r: 0.9, o: 0.35 }, { cx: 548, cy: 158, r: 0.6, o: 0.5 },
  { cx: 618, cy: 252, r: 0.8, o: 0.3 }, { cx: 688, cy: 138, r: 0.5, o: 0.6 },
  { cx: 758, cy: 198, r: 0.7, o: 0.4 }, { cx: 852, cy: 372, r: 0.9, o: 0.5 },
  { cx: 112, cy: 88, r: 0.7, o: 0.6 }, { cx: 442, cy: 148, r: 1.1, o: 0.3 },
  { cx: 558, cy: 388, r: 0.8, o: 0.45 }, { cx: 732, cy: 418, r: 0.6, o: 0.5 },
  { cx: 86, cy: 318, r: 0.9, o: 0.4 }, { cx: 906, cy: 318, r: 0.7, o: 0.4 },
];

function buildPath(points: TrajectoryPoint[]): string {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

function shipPosition(points: TrajectoryPoint[], progress: number): TrajectoryPoint {
  return points.find((p) => p.t >= progress) ?? points[points.length - 1];
}

// Returns the heading angle (degrees) that the ship should face along the trajectory.
function shipHeading(points: TrajectoryPoint[], progress: number): number {
  const curr = points.find((p) => p.t >= progress);
  if (!curr) return 0;
  const idx = points.indexOf(curr);
  const next = points[idx + 1] ?? curr;
  if (next === curr) return 0;
  const rad = Math.atan2(next.y - curr.y, next.x - curr.x);
  // +90° because the Orion shape is drawn pointing up (-Y)
  return rad * (180 / Math.PI) + 90;
}

export function FlightMap2D({ trajectory, progress, activeStageTitle }: Props) {
  const outbound = trajectory.filter((p) => p.t <= 0.502);
  const returnLeg = trajectory.filter((p) => p.t >= 0.498);
  const outPath = buildPath(outbound);
  const retPath = buildPath(returnLeg);
  const ship = shipPosition(trajectory, progress);
  const heading = shipHeading(trajectory, progress);

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.map}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Карта миссии Artemis II"
      >
        <defs>
          <radialGradient id="mapBg" cx="50%" cy="45%" r="72%">
            <stop offset="0%" stopColor="#0e2040" />
            <stop offset="100%" stopColor="#040810" />
          </radialGradient>
          <radialGradient id="earthGrad" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#b8ecff" />
            <stop offset="38%" stopColor="#4fa8e8" />
            <stop offset="100%" stopColor="#1a4a82" />
          </radialGradient>
          <radialGradient id="moonGrad" cx="35%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cdd2dc" />
            <stop offset="100%" stopColor="#787e8c" />
          </radialGradient>
          <radialGradient id="earthAtmo" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(80,180,255,0.22)" />
          </radialGradient>
          <filter id="shipGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#mapBg)" rx={18} />

        {STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.o} />
        ))}

        <path d={retPath} className={styles.trajectoryRet} />
        <path d={outPath} className={styles.trajectoryOut} />

        {/* Earth */}
        <circle cx={120} cy={282} r={75} fill="url(#earthAtmo)" />
        <circle cx={120} cy={282} r={56} fill="url(#earthGrad)" filter="url(#softGlow)" />
        <ellipse cx={104} cy={264} rx={20} ry={7} fill="rgba(255,255,255,0.2)" transform="rotate(-28 104 264)" />
        <ellipse cx={132} cy={292} rx={17} ry={6} fill="rgba(255,255,255,0.14)" transform="rotate(8 132 292)" />

        {/* Moon */}
        <circle cx={878} cy={176} r={40} fill="url(#moonGrad)" filter="url(#softGlow)" />
        <circle cx={866} cy={166} r={5.5} fill="rgba(0,0,0,0.13)" />
        <circle cx={888} cy={182} r={3.5} fill="rgba(0,0,0,0.1)" />
        <circle cx={872} cy={190} r={2.8} fill="rgba(0,0,0,0.08)" />

        {/* Orion spacecraft — rotated to face direction of travel */}
        <g
          className={styles.shipGroup}
          style={{ transform: `translate(${ship.x}px, ${ship.y}px) rotate(${heading}deg)` }}
          filter="url(#shipGlow)"
        >
          {/* Engine exhaust glow (behind the ship) */}
          <ellipse cx={0} cy={14} rx={4} ry={6} className={styles.exhaustGlow} />

          {/* Solar array wings (ESM) */}
          <rect x={-18} y={3} width={12} height={3.5} rx={0.8} className={styles.solar} />
          <rect x={6} y={3} width={12} height={3.5} rx={0.8} className={styles.solar} />
          {/* Wing root connector */}
          <rect x={-5} y={3.5} width={10} height={2.5} className={styles.sm} />

          {/* European Service Module body */}
          <rect x={-4.5} y={0} width={9} height={8} rx={1} className={styles.sm} />

          {/* Heat shield (base of crew module) */}
          <ellipse cx={0} cy={0} rx={6.5} ry={2} className={styles.heatShield} />

          {/* Crew Module — blunt cone pointing forward */}
          <path d="M 0,-11 L 5.5,0 L -5.5,0 Z" className={styles.cm} />
          {/* CM highlight */}
          <path d="M 0,-11 L 3.5,0 L 1.5,0 Z" fill="rgba(255,255,255,0.18)" />

          {/* Launch Abort System tower tip */}
          <line x1={0} y1={-11} x2={0} y2={-15} className={styles.las} />
          <circle cx={0} cy={-15} r={1} className={styles.lasTip} />
        </g>
      </svg>

      <div className={styles.footer}>
        <div className={styles.stageBadge}>
          <span className={styles.stageDot} />
          {activeStageTitle}
        </div>
      </div>
    </div>
  );
}

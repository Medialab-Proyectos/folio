// Ultra-detailed luxury sedan SVG — used as a watermark / hero background
// in check-in and check-out pages for rich emotional context.

interface UltraCarSvgProps {
  className?: string;
  opacity?: number;
  /** 'in' tints the glow green, 'out' tints it blue */
  variant?: 'in' | 'out';
}

export function UltraCarSvg({ className = '', opacity = 0.12, variant = 'in' }: UltraCarSvgProps) {
  const glow = variant === 'in' ? '#22c55e' : '#3b82f6';
  const glowLight = variant === 'in' ? '#86efac' : '#93c5fd';

  return (
    <svg
      className={className}
      viewBox="0 0 900 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        {/* Body gradient */}
        <linearGradient id={`bodyGrad-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#aaaaaa" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#333333" stopOpacity="0.08" />
        </linearGradient>
        {/* Glass gradient */}
        <linearGradient id={`glassGrad-${variant}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#e0f0ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4090cc" stopOpacity="0.08" />
        </linearGradient>
        {/* Wheel gradient */}
        <radialGradient id={`wheelGrad-${variant}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#555" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#111" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </radialGradient>
        {/* Glow filter */}
        <filter id={`glow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Chrome reflection */}
        <linearGradient id={`chromeGrad-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#ccc" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#888" stopOpacity="0.1" />
        </linearGradient>
        {/* Rim gradient */}
        <linearGradient id={`rimGrad-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#888888" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* ─── Ground shadow ──────────────────────────────────────────────────── */}
      <ellipse cx="450" cy="395" rx="360" ry="18" fill="#000" opacity="0.18" />

      {/* ─── Body — lower chassis ──────────────────────────────────────────── */}
      <path
        d="M120 290 L780 290 L800 310 L820 335 L80 335 L100 310 Z"
        fill={`url(#bodyGrad-${variant})`}
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />

      {/* ─── Rocker panels & sills ────────────────────────────────────────── */}
      <rect x="155" y="317" width="590" height="14" rx="2" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />

      {/* ─── Body — upper section (below greenhouse) ──────────────────────── */}
      <path
        d="M90 220 Q95 200 130 195 L770 195 Q805 200 810 220 L820 290 L80 290 Z"
        fill={`url(#bodyGrad-${variant})`}
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />

      {/* ─── Greenhouse / cabin ───────────────────────────────────────────── */}
      <path
        d="M250 195 Q270 130 310 115 L590 115 Q630 130 650 195 Z"
        fill="white"
        fillOpacity="0.06"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.3"
      />

      {/* ─── Roof ─────────────────────────────────────────────────────────── */}
      <path
        d="M305 115 Q320 95 450 88 Q570 95 590 115 Z"
        fill="white"
        fillOpacity="0.14"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* Roof highlight */}
      <path
        d="M350 100 Q450 91 545 100"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />

      {/* ─── A-pillar (left) ─────────────────────────────────────────────── */}
      <line x1="310" y1="115" x2="270" y2="195" stroke="white" strokeWidth="2.5" strokeOpacity="0.5" />
      {/* C-pillar (right) */}
      <line x1="590" y1="115" x2="630" y2="195" stroke="white" strokeWidth="2.5" strokeOpacity="0.5" />
      {/* B-pillar */}
      <line x1="450" y1="115" x2="450" y2="195" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* ─── Windows ─────────────────────────────────────────────────────── */}
      {/* Front window */}
      <path
        d="M277 193 L318 120 L447 120 L447 193 Z"
        fill={`url(#glassGrad-${variant})`}
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      {/* Front window glare */}
      <path d="M290 175 L320 125 L360 125 L330 175 Z" fill="white" fillOpacity="0.08" />

      {/* Rear window */}
      <path
        d="M453 193 L453 120 L582 120 L623 193 Z"
        fill={`url(#glassGrad-${variant})`}
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      {/* Rear window glare */}
      <path d="M472 175 L472 128 L520 128 L520 175 Z" fill="white" fillOpacity="0.06" />

      {/* Rear quarter glass */}
      <path
        d="M627 193 L590 120 L625 120 L660 193 Z"
        fill={`url(#glassGrad-${variant})`}
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.25"
      />

      {/* Front quarter glass */}
      <path
        d="M273 193 L248 193 L310 120 L316 120 Z"
        fill={`url(#glassGrad-${variant})`}
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.25"
      />

      {/* ─── Door lines ───────────────────────────────────────────────────── */}
      <line x1="450" y1="195" x2="450" y2="330" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
      {/* Door crease line */}
      <path d="M120 245 Q450 235 780 245" stroke="white" strokeWidth="1.2" strokeOpacity="0.18" fill="none" />
      {/* Body highlight / feature line */}
      <path d="M105 270 Q450 260 795 270" stroke="white" strokeWidth="0.8" strokeOpacity="0.12" fill="none" />

      {/* ─── Hood ─────────────────────────────────────────────────────────── */}
      <path
        d="M80 290 L95 220 L270 195 L270 220 Q180 225 165 290 Z"
        fill="white"
        fillOpacity="0.07"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      {/* Hood power bulge */}
      <path d="M100 240 Q170 230 265 232" stroke="white" strokeWidth="1" strokeOpacity="0.22" fill="none" />
      {/* Hood leading edge highlight */}
      <path d="M82 285 Q160 270 265 265" stroke="white" strokeWidth="1.8" strokeOpacity="0.35" fill="none" />

      {/* ─── Trunk ────────────────────────────────────────────────────────── */}
      <path
        d="M635 195 L730 195 L815 220 L820 290 L730 290 L640 220 Z"
        fill="white"
        fillOpacity="0.06"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.18"
      />
      {/* Trunk lid highlight */}
      <path d="M645 200 Q700 192 720 195" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />

      {/* ─── Front headlights (DRL-style) ─────────────────────────────────── */}
      <path
        d="M82 240 L140 232 Q150 240 145 250 L85 255 Z"
        fill={glow}
        fillOpacity="0.3"
        stroke={glowLight}
        strokeWidth="1"
        strokeOpacity="0.7"
        filter={`url(#glow-${variant})`}
      />
      {/* DRL strip */}
      <path d="M84 245 L138 237" stroke={glowLight} strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
      {/* Low beam */}
      <ellipse cx="113" cy="248" rx="20" ry="8" fill={glow} fillOpacity="0.15" />

      {/* Light beam projection */}
      <path d="M80 248 L10 210 M80 251 L5 260" stroke={glowLight} strokeWidth="0.8" strokeOpacity="0.15" />

      {/* ─── Rear taillights ─────────────────────────────────────────────── */}
      <path
        d="M818 240 L762 232 Q750 240 755 252 L820 257 Z"
        fill="#ef4444"
        fillOpacity="0.25"
        stroke="#fca5a5"
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      {/* Tail light strip */}
      <path d="M818 246 L764 238" stroke="#fca5a5" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" />

      {/* ─── Front grille ─────────────────────────────────────────────────── */}
      <path d="M88 262 L155 253 L158 272 L90 278 Z" fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" />
      {/* Grille slats */}
      {[0, 1, 2, 3].map(i => (
        <path key={i}
          d={`M90 ${264 + i * 3.5} L156 ${255 + i * 3.5}`}
          stroke="white" strokeWidth="0.8" strokeOpacity="0.18"
        />
      ))}
      {/* Badge */}
      <circle cx="122" cy="268" r="5" fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <circle cx="122" cy="268" r="2" fill="white" fillOpacity="0.4" />

      {/* ─── Side mirror (left) ───────────────────────────────────────────── */}
      <path d="M258 215 L238 215 Q230 220 232 228 L260 228 Z"
        fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      {/* Mirror glass */}
      <rect x="232" y="217" width="22" height="9" rx="2" fill={`url(#glassGrad-${variant})`} fillOpacity="0.4" />

      {/* Side mirror (right) */}
      <path d="M642 215 L662 215 Q670 220 668 228 L640 228 Z"
        fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      <rect x="646" y="217" width="22" height="9" rx="2" fill={`url(#glassGrad-${variant})`} fillOpacity="0.4" />

      {/* ─── Door handles ─────────────────────────────────────────────────── */}
      {/* Front door handle */}
      <rect x="360" y="247" width="30" height="5" rx="2.5" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="0.6" strokeOpacity="0.5" />
      {/* Rear door handle */}
      <rect x="510" y="247" width="30" height="5" rx="2.5" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="0.6" strokeOpacity="0.5" />

      {/* ─── Front bumper ─────────────────────────────────────────────────── */}
      <path d="M78 290 Q65 305 70 330 L100 330 L100 310 L85 305 Z"
        fill="white" fillOpacity="0.06" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
      {/* Front lower splitter */}
      <path d="M75 325 L200 318" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round" />

      {/* ─── Rear bumper ──────────────────────────────────────────────────── */}
      <path d="M822 290 Q835 305 830 330 L800 330 L800 310 L815 305 Z"
        fill="white" fillOpacity="0.06" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
      {/* Diffuser slats */}
      {[0, 1, 2].map(i => (
        <path key={i}
          d={`M706 ${320 + i * 4} L810 ${316 + i * 4}`}
          stroke="white" strokeWidth="0.8" strokeOpacity="0.18"
        />
      ))}
      {/* Exhaust tips */}
      <ellipse cx="730" cy="328" rx="7" ry="4" fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
      <ellipse cx="753" cy="328" rx="7" ry="4" fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />

      {/* ─── WHEEL — Front ───────────────────────────────────────────────── */}
      {/* Tyre */}
      <circle cx="212" cy="356" r="62" fill="black" fillOpacity="0.85" />
      <circle cx="212" cy="356" r="62" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.25" />
      {/* Wheel arch shadow */}
      <path d="M152 330 Q212 290 272 330" stroke="white" strokeWidth="1" strokeOpacity="0.15" fill="none" />
      {/* Rim */}
      <circle cx="212" cy="356" r="46" fill={`url(#rimGrad-${variant})`} fillOpacity="0.12" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Spokes */}
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const x2 = 212 + Math.cos(angle) * 42;
        const y2 = 356 + Math.sin(angle) * 42;
        return (
          <g key={i}>
            <line x1="212" y1="356" x2={x2} y2={y2} stroke="white" strokeWidth="4" strokeOpacity="0.25" strokeLinecap="round" />
            <line x1="212" y1="356" x2={x2} y2={y2} stroke="white" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          </g>
        );
      })}
      {/* Rim outer ring */}
      <circle cx="212" cy="356" r="44" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="212" cy="356" r="38" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
      {/* Centre cap */}
      <circle cx="212" cy="356" r="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="212" cy="356" r="5" fill="white" fillOpacity="0.2" />
      {/* Brake disc glimpse */}
      <circle cx="212" cy="356" r="26" fill="none" stroke="white" strokeWidth="0.7" strokeOpacity="0.15" strokeDasharray="4 3" />

      {/* ─── WHEEL — Rear ────────────────────────────────────────────────── */}
      <circle cx="688" cy="356" r="62" fill="black" fillOpacity="0.85" />
      <circle cx="688" cy="356" r="62" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M628 330 Q688 290 748 330" stroke="white" strokeWidth="1" strokeOpacity="0.15" fill="none" />
      <circle cx="688" cy="356" r="46" fill={`url(#rimGrad-${variant})`} fillOpacity="0.12" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i * 72 - 18) * Math.PI / 180;
        const x2 = 688 + Math.cos(angle) * 42;
        const y2 = 356 + Math.sin(angle) * 42;
        return (
          <g key={i}>
            <line x1="688" y1="356" x2={x2} y2={y2} stroke="white" strokeWidth="4" strokeOpacity="0.25" strokeLinecap="round" />
            <line x1="688" y1="356" x2={x2} y2={y2} stroke="white" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx="688" cy="356" r="44" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="688" cy="356" r="38" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
      <circle cx="688" cy="356" r="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="688" cy="356" r="5" fill="white" fillOpacity="0.2" />
      <circle cx="688" cy="356" r="26" fill="none" stroke="white" strokeWidth="0.7" strokeOpacity="0.15" strokeDasharray="4 3" />

      {/* ─── Wheel arches ─────────────────────────────────────────────────── */}
      <path d="M148 335 Q212 293 276 335" stroke="white" strokeWidth="2.5" strokeOpacity="0.3" fill="none" />
      <path d="M624 335 Q688 293 752 335" stroke="white" strokeWidth="2.5" strokeOpacity="0.3" fill="none" />

      {/* ─── Chrome trim strips ───────────────────────────────────────────── */}
      <path d="M160 330 L740 330" stroke={`url(#chromeGrad-${variant})`} strokeWidth="2" strokeOpacity="0.4" />
      {/* Window trim */}
      <path d="M270 193 L454 193" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />
      <path d="M454 193 L635 193" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />

      {/* ─── Subtle glow under the car ────────────────────────────────────── */}
      <ellipse cx="450" cy="380" rx="280" ry="12" fill={glow} fillOpacity="0.06" />
    </svg>
  );
}

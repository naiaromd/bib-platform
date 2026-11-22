"use client";

// Simplified, static diagram of the Roboderm® mechanism under the skin.
// Takes the current "step" (0=overview, 1=chamber, 2=rollers, 3=tissue, 4=light)
// and toggles emphasis via opacity.
// Faithful enough for an educational illustration; the DC prototype's
// full physics animation is a follow-up (see audit §05).

interface Props {
  step: number;
  showNet: boolean;
  suc: number; // 0-100
  led: boolean;
  las: boolean;
}

export default function MechanismDiagram({ step, showNet, suc, led, las }: Props) {
  // Lift amount scales with suction (visual only).
  const liftIntensity = 0.35 + (suc / 100) * 0.65;

  // Layer emphasis based on current step. step=0 (all) keeps everything bright.
  const emph = (idx: number) => (step === 0 || step === idx ? 1 : 0.55);
  const chamberOn = step === 0 || step === 1;
  const rollersOn = step === 0 || step === 2;
  const tissueOn = step === 0 || step === 3;
  const lightOn = step === 0 || step === 4;

  return (
    <div className="relative border border-line border-b-0 rounded-t-[16px] overflow-hidden bg-paper">
      <svg
        viewBox="0 0 1000 470"
        role="img"
        aria-label="ภาพจำลองกลไกหัว Roboderm ใต้ผิว"
        className="block w-full h-auto"
      >
        <defs>
          <linearGradient id="g-shell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#F5F2EC" />
            <stop offset="1" stopColor="#DCD5CA" />
          </linearGradient>
          <radialGradient id="g-roll" cx="0.38" cy="0.32" r="0.75">
            <stop offset="0" stopColor="#8a847e" />
            <stop offset="0.55" stopColor="#5b5752" />
            <stop offset="1" stopColor="#3b3835" />
          </radialGradient>
          <radialGradient id="g-hub" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#D8D1C6" />
          </radialGradient>
          <linearGradient id="g-derm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4CFC2" />
            <stop offset="1" stopColor="#E6B3A3" />
          </linearGradient>
          <linearGradient id="g-epi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBE6DC" />
            <stop offset="1" stopColor="#F5D3C5" />
          </linearGradient>
          <linearGradient id="g-fat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3DDB8" />
            <stop offset="1" stopColor="#F7E8CF" />
          </linearGradient>
          <linearGradient id="g-led" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E06C5E" stopOpacity="0.55" />
            <stop offset="1" stopColor="#E06C5E" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="g-las" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C08A5A" stopOpacity="0.5" />
            <stop offset="1" stopColor="#C08A5A" stopOpacity="0" />
          </linearGradient>
          <filter id="f-soft" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#2C2A28" floodOpacity="0.16" />
          </filter>
        </defs>

        <rect x="0" y="0" width="1000" height="470" fill="#FAF7F1" />

        {/* === Tissue stack === */}
        <g style={{ opacity: emph(3), transition: "opacity 0.35s" }}>
          {/* fat */}
          <path
            d={`M0 410 L0 ${410 - liftIntensity * 6} C 200 ${410 - liftIntensity * 20} 400 ${410 - liftIntensity * 30} 500 ${410 - liftIntensity * 34} C 600 ${410 - liftIntensity * 30} 800 ${410 - liftIntensity * 20} 1000 ${410 - liftIntensity * 6} L1000 470 Z`}
            fill="url(#g-fat)"
          />
          {/* lobules (static grid) */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 22 }).map((_, col) => {
              const cx = col * 46 + (row % 2) * 23 + 20;
              const cy = 420 + row * 12;
              return (
                <ellipse
                  key={`lob-${row}-${col}`}
                  cx={cx}
                  cy={cy}
                  rx={22}
                  ry={9}
                  fill="#FBECD3"
                  stroke="#EBD3A9"
                  strokeWidth="0.9"
                />
              );
            })
          )}
          {/* dermis */}
          <path
            d={`M0 ${340 - liftIntensity * 4} C 250 ${340 - liftIntensity * 16} 400 ${340 - liftIntensity * 28} 500 ${340 - liftIntensity * 34} C 600 ${340 - liftIntensity * 28} 750 ${340 - liftIntensity * 16} 1000 ${340 - liftIntensity * 4} L1000 410 L0 410 Z`}
            fill="url(#g-derm)"
          />
          {/* collagen mesh */}
          {showNet && (
            <g fill="none" stroke="#FFF7F3" opacity="0.8">
              {Array.from({ length: 24 }).map((_, i) => {
                const x = (i / 23) * 1000;
                return (
                  <path
                    key={`net-${i}`}
                    d={`M${x} 340 Q ${x + 25} 365 ${x} 395`}
                    strokeWidth="0.9"
                    opacity="0.55"
                  />
                );
              })}
            </g>
          )}
          {/* epidermis */}
          <path
            d={`M0 ${310 - liftIntensity * 4} C 250 ${310 - liftIntensity * 20} 400 ${310 - liftIntensity * 36} 500 ${310 - liftIntensity * 44} C 600 ${310 - liftIntensity * 36} 750 ${310 - liftIntensity * 20} 1000 ${310 - liftIntensity * 4} L1000 ${340 - liftIntensity * 4} C 750 ${340 - liftIntensity * 16} 600 ${340 - liftIntensity * 28} 500 ${340 - liftIntensity * 34} C 400 ${340 - liftIntensity * 28} 250 ${340 - liftIntensity * 16} 0 ${340 - liftIntensity * 4} Z`}
            fill="url(#g-epi)"
          />
          {/* surface */}
          <path
            d={`M0 ${310 - liftIntensity * 4} C 250 ${310 - liftIntensity * 20} 400 ${310 - liftIntensity * 36} 500 ${310 - liftIntensity * 44} C 600 ${310 - liftIntensity * 36} 750 ${310 - liftIntensity * 20} 1000 ${310 - liftIntensity * 4}`}
            fill="none"
            stroke="#C98270"
            strokeWidth="1.6"
          />
        </g>

        {/* === Light cones === */}
        {lightOn && (las || led) && (
          <g style={{ opacity: emph(4) }}>
            {led && (
              <path
                d="M460 240 L540 240 L620 410 L380 410 Z"
                fill="url(#g-led)"
              />
            )}
            {las && (
              <path
                d="M475 240 L525 240 L600 430 L400 430 Z"
                fill="url(#g-las)"
              />
            )}
          </g>
        )}

        {/* === Device body === */}
        <g>
          {/* shell */}
          <g filter="url(#f-soft)">
            <path
              d="M340 260 C 336 220 376 180 470 180 H530 C 624 180 664 220 660 260 Q 654 266 646 260 H354 Q 346 266 340 260 Z"
              fill="url(#g-shell)"
              stroke="#D7D0C5"
              strokeWidth="1"
            />
          </g>
          {/* center chamber */}
          <g style={{ opacity: emph(1) }}>
            <path d="M442 240 C 442 210 468 194 500 194 C 532 194 558 210 558 240 L558 258 L442 258 Z" fill="#EFE9DF" />
            <path d="M490 215 H510 V260 H490 Z" fill="#F1ECE3" stroke="#D7D0C5" />
            {chamberOn && (
              <g fill="#C89B8A">
                <circle cx="500" cy="220" r="2.2" />
                <circle cx="500" cy="230" r="2.2" />
                <circle cx="500" cy="240" r="2.2" />
                <circle cx="500" cy="250" r="2.2" />
              </g>
            )}
          </g>
          {/* rollers */}
          <g style={{ opacity: emph(2) }}>
            {[380, 620].map((cx, i) => (
              <g key={`r${i}`}>
                <path
                  d={`M${cx - 8} 194 H${cx + 8} V254 H${cx - 8} Z`}
                  fill="#F1ECE3"
                  stroke="#D7D0C5"
                />
                <circle cx={cx} cy={262} r={60} fill="url(#g-roll)" />
                {/* roller holes */}
                {rollersOn &&
                  Array.from({ length: 12 }).map((_, j) => {
                    const an = (j / 12) * Math.PI * 2;
                    const rx = cx + Math.cos(an) * 52;
                    const ry = 262 + Math.sin(an) * 52;
                    return (
                      <circle key={`h${i}-${j}`} cx={rx} cy={ry} r={4} fill="#1f1d1b" />
                    );
                  })}
                <circle cx={cx} cy={262} r={12} fill="url(#g-hub)" stroke="#3b3835" strokeWidth="0.8" />
                {rollersOn && (
                  <circle
                    cx={cx}
                    cy={262}
                    r={68}
                    fill="none"
                    stroke="#C89B8A"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}
              </g>
            ))}
          </g>
          {/* labels */}
          <g fill="#2C2A28">
            {chamberOn && (
              <g>
                <circle cx="522" cy="170" r="10" fill="#2C2A28" />
                <text x="522" y="174" textAnchor="middle" fill="#FAF7F1" fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight={600}>
                  1
                </text>
              </g>
            )}
            {rollersOn && (
              <>
                <g>
                  <circle cx="358" cy="170" r="10" fill="#2C2A28" />
                  <text x="358" y="174" textAnchor="middle" fill="#FAF7F1" fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight={600}>
                    2
                  </text>
                </g>
                <g>
                  <circle cx="642" cy="170" r="10" fill="#2C2A28" />
                  <text x="642" y="174" textAnchor="middle" fill="#FAF7F1" fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight={600}>
                    3
                  </text>
                </g>
              </>
            )}
          </g>
        </g>

        {/* layer labels */}
        <g
          fontFamily="IBM Plex Sans Thai, sans-serif"
          fontSize="12"
          fill="#8A7F70"
          style={{ opacity: tissueOn ? 1 : 0.65 }}
        >
          <text x="18" y="325">ผิวชั้นนอก</text>
          <text x="18" y="370">ชั้นหนังแท้</text>
          <text x="18" y="430">ชั้นไขมันใต้ผิว</text>
        </g>
      </svg>
    </div>
  );
}

import { DAMAGE_CODES } from '../lib/translations.js';

const FRONT_AREAS = [
  { key: 'frontBumper',      label: 'Bufera Përpara',         x: 62,  y: 6,   w: 76,  h: 20, rx: 3 },
  { key: 'hood',             label: 'Kapuç',                  x: 38,  y: 26,  w: 124, h: 66, rx: 4 },
  { key: 'frontLeftFender',  label: 'Parafango Para Majtë',   x: 12,  y: 30,  w: 30,  h: 62, rx: 4 },
  { key: 'frontRightFender', label: 'Parafango Para Djathas', x: 158, y: 30,  w: 30,  h: 62, rx: 4 },
  { key: 'frontLeftDoor',    label: 'Portë Para Majtë',       x: 12,  y: 96,  w: 30,  h: 75, rx: 4 },
  { key: 'frontRightDoor',   label: 'Portë Para Djathas',     x: 158, y: 96,  w: 30,  h: 75, rx: 4 },
  { key: 'roof',             label: 'Çati',                   x: 44,  y: 108, w: 112, h: 116, rx: 4 },
];

const REAR_AREAS = [
  { key: 'rearLeftDoor',   label: 'Portë Mbrapa Majtë',   x: 12,  y: 175, w: 30,  h: 75, rx: 4 },
  { key: 'rearRightDoor',  label: 'Portë Mbrapa Djathas', x: 158, y: 175, w: 30,  h: 75, rx: 4 },
  { key: 'rearLeftPanel',  label: 'Panel Mbrapa Majtë',   x: 14,  y: 254, w: 28,  h: 66, rx: 4 },
  { key: 'rearRightPanel', label: 'Panel Mbrapa Djathas', x: 158, y: 254, w: 28,  h: 66, rx: 4 },
  { key: 'trunk',          label: 'Bagazh',               x: 38,  y: 252, w: 124, h: 68, rx: 4 },
  { key: 'rearBumper',     label: 'Bufera Mbrapa',        x: 62,  y: 322, w: 76,  h: 20, rx: 3 },
];

const ALL_AREAS = [...FRONT_AREAS, ...REAR_AREAS];

function areaStyle(code, theme = 'dark') {
  const empty = theme === 'light'
    ? { fill: 'rgba(0,0,0,0.04)', stroke: 'rgba(0,0,0,0.12)', sw: 0.8 }
    : { fill: 'rgba(255,255,255,0.025)', stroke: 'rgba(255,255,255,0.07)', sw: 0.8 };
  if (!code) return empty;
  const c = DAMAGE_CODES[code];
  return c
    ? { fill: c.color + '28', stroke: c.color, sw: 1.5 }
    : empty;
}

function CarSVG({ areas, damage, viewBox, label }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] uppercase tracking-widest mb-1.5 text-center font-mono font-semibold"
         style={{ color: 'var(--text-4)' }}>{label}</p>
      <svg viewBox={viewBox} className="w-36" style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,60,0.25))' }}>
        {/* Car body */}
        <path
          d="M 68,8 L 132,8 C 148,8 160,20 164,38 L 172,82 L 175,168 L 172,258 C 168,290 156,320 140,328 L 60,328 C 44,320 32,290 28,258 L 25,168 L 28,82 C 36,38 52,8 68,8 Z"
          fill="var(--bg-card2,rgba(8,8,20,0.9))" stroke="rgba(100,120,200,0.2)" strokeWidth="1.5"
        />
        {/* Wheels */}
        <rect x="5"   y="78"  width="16" height="46" rx="5" fill="none" stroke="rgba(100,120,200,0.25)" strokeWidth="1.2" />
        <rect x="179" y="78"  width="16" height="46" rx="5" fill="none" stroke="rgba(100,120,200,0.25)" strokeWidth="1.2" />
        <rect x="5"   y="218" width="16" height="46" rx="5" fill="none" stroke="rgba(100,120,200,0.25)" strokeWidth="1.2" />
        <rect x="179" y="218" width="16" height="46" rx="5" fill="none" stroke="rgba(100,120,200,0.25)" strokeWidth="1.2" />
        {/* Side mirrors */}
        <rect x="0"   y="86" width="14" height="9" rx="3" fill="none" stroke="rgba(100,120,200,0.2)" strokeWidth="1" />
        <rect x="186" y="86" width="14" height="9" rx="3" fill="none" stroke="rgba(100,120,200,0.2)" strokeWidth="1" />
        {/* Front windshield */}
        <path d="M 48,94 L 152,94 L 148,112 L 52,112 Z"
          fill="rgba(147,197,253,0.08)" stroke="rgba(147,197,253,0.2)" strokeWidth="0.8" />
        {/* Rear windshield */}
        <path d="M 52,228 L 148,228 L 152,246 L 48,246 Z"
          fill="rgba(147,197,253,0.06)" stroke="rgba(147,197,253,0.15)" strokeWidth="0.8" />
        {/* Roof */}
        <rect x="46" y="112" width="108" height="116" rx="4"
          fill="rgba(100,120,200,0.03)" stroke="rgba(100,120,200,0.1)" strokeWidth="0.8" />
        {/* Door separation */}
        <line x1="22" y1="170" x2="178" y2="170" stroke="rgba(100,120,200,0.08)" strokeWidth="0.8" />
        {/* Damage areas */}
        {areas.map(area => {
          const code = damage?.[area.key];
          const s = areaStyle(code);
          return (
            <g key={area.key}>
              <rect x={area.x} y={area.y} width={area.w} height={area.h} rx={area.rx}
                fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
              {code && (
                <text x={area.x + area.w / 2} y={area.y + area.h / 2 + 4}
                  textAnchor="middle" fontSize={9} fontWeight="700"
                  fill={s.stroke} fontFamily="monospace">
                  {code}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AccidentDiagram({ damage, dataAvailable = true }) {
  const damaged = ALL_AREAS.filter(a => damage?.[a.key]);
  const hasInspection = damage !== null && damage !== undefined;
  const clean = hasInspection && !damaged.length;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border-lo)' }}>
        {[['N','Nderrim'],['R','Riparim'],['K','Korrozion'],['G','Gervishtje'],['P','Parregullsi']].map(([code, label]) => (
          <div key={code} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
            <span className="font-mono w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
              style={{ background: DAMAGE_CODES[code]?.color + '22', border: `1.5px solid ${DAMAGE_CODES[code]?.color}`, color: DAMAGE_CODES[code]?.color }}>
              {code}
            </span>
            {label}
          </div>
        ))}
      </div>

      {/* Status badge */}
      {clean || !hasInspection ? (
        <div className="flex items-center gap-2 mb-5 py-2.5 px-4 rounded-xl"
             style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-sm font-semibold" style={{ color: '#10b981' }}>✓ Asnjë dëmtim i raportuar — inspektim koreane</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-5 py-2.5 px-4 rounded-xl"
             style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>{damaged.length} zonë me dëmtime të raportuara</span>
        </div>
      )}

      {/* Two-view diagram: Front + Rear */}
      <div className="flex gap-6 justify-center mb-6">
        <CarSVG areas={FRONT_AREAS} damage={damage} viewBox="0 0 200 185" label="PARA — Front" />
        <CarSVG areas={REAR_AREAS}  damage={damage} viewBox="0 150 200 195" label="MBRAPA — Rear" />
      </div>

      {/* Detailed area checklist */}
      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-widest font-mono font-semibold mb-2"
           style={{ color: 'var(--text-4)' }}>Të Gjitha Zonat · Kontroll i Plotë</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {/* Front areas */}
          <div>
            <p className="text-[9px] uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--text-4)' }}>Para</p>
            {FRONT_AREAS.map(area => {
              const code = damage?.[area.key];
              const info = code ? DAMAGE_CODES[code] : null;
              return (
                <div key={area.key} className="flex items-center justify-between py-1 text-xs"
                  style={{ borderBottom: '1px solid var(--border-lo)' }}>
                  <span style={{ color: code ? 'var(--text-2)' : 'var(--text-4)' }}>{area.label}</span>
                  {info
                    ? <span className="font-mono font-bold text-[10px]" style={{ color: info.color }}>{code} · {info.label}</span>
                    : <span className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>✓</span>
                  }
                </div>
              );
            })}
          </div>
          {/* Rear areas */}
          <div>
            <p className="text-[9px] uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--text-4)' }}>Mbrapa</p>
            {REAR_AREAS.map(area => {
              const code = damage?.[area.key];
              const info = code ? DAMAGE_CODES[code] : null;
              return (
                <div key={area.key} className="flex items-center justify-between py-1 text-xs"
                  style={{ borderBottom: '1px solid var(--border-lo)' }}>
                  <span style={{ color: code ? 'var(--text-2)' : 'var(--text-4)' }}>{area.label}</span>
                  {info
                    ? <span className="font-mono font-bold text-[10px]" style={{ color: info.color }}>{code} · {info.label}</span>
                    : <span className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>✓</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Damaged zone detail */}
      {!clean && (
        <div className="mt-4 space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-mono font-semibold mb-2"
             style={{ color: 'var(--text-4)' }}>Zonat me Dëmtime</p>
          {damaged.map(area => {
            const code = damage[area.key];
            const info = DAMAGE_CODES[code];
            return (
              <div key={area.key} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                style={{ background: info?.color + '10', border: `1px solid ${info?.color}25` }}>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{area.label}</span>
                {info && (
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: info.color + '20', color: info.color, border: `1px solid ${info.color}40` }}>
                    {code} · {info.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

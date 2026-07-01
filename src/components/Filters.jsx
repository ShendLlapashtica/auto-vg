import { useState, useEffect } from 'react';
import { ChevronDown, RotateCcw, X, SlidersHorizontal } from 'lucide-react';

const BRANDS = [
  'BMW','Mercedes-Benz','Audi','Volkswagen','Porsche',
  'Hyundai','Kia','Genesis','Lexus','Toyota','Honda',
  'Chevrolet','SsangYong','Renault Samsung','Volvo',
  'Land Rover','Mini','Peugeot','Subaru','Mitsubishi',
  'Nissan','Infiniti','Maserati','Ferrari','Lamborghini',
];

const FUELS = [
  { val: '',         label: 'Karburant' },
  { val: 'diesel',   label: 'Naftë' },
  { val: 'gasoline', label: 'Benzinë' },
  { val: 'electric', label: 'Elektrik' },
  { val: 'hybrid',   label: 'Hibrid' },
  { val: 'lpg',      label: 'LPG' },
];

const YEARS = Array.from({ length: 21 }, (_, i) => String(2025 - i));

const KM_MAX = [
  { val: '',       label: 'Km max' },
  { val: '50000',  label: '≤ 50k km' },
  { val: '100000', label: '≤ 100k km' },
  { val: '150000', label: '≤ 150k km' },
  { val: '200000', label: '≤ 200k km' },
];

const EMPTY = { manufacturer: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' };

function Sel({ label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-wider font-mono font-semibold" style={{ color: 'var(--text-3)' }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="select pr-8 text-sm appearance-none w-full"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-3)' }} />
      </div>
    </div>
  );
}

export default function Filters({ filters, onChange, forceOpen = false, onForceClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  function close() {
    setOpen(false);
    onForceClose?.();
  }

  function set(key) { return val => onChange(prev => ({ ...prev, [key]: val })); }
  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters  = activeCount > 0;

  const filterContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Sel label="Prodhuesi" value={filters.manufacturer} onChange={set('manufacturer')}>
        <option value="">Të gjithë</option>
        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
      </Sel>
      <Sel label="Karburanti" value={filters.fuel} onChange={set('fuel')}>
        {FUELS.map(f => <option key={f.val} value={f.val}>{f.label === 'Karburant' ? 'Të gjitha' : f.label}</option>)}
      </Sel>
      <Sel label="Viti nga" value={filters.yearFrom} onChange={set('yearFrom')}>
        <option value="">Çdo vit</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </Sel>
      <Sel label="Viti deri" value={filters.yearTo} onChange={set('yearTo')}>
        <option value="">Çdo vit</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </Sel>
      <Sel label="Km maksimum" value={filters.mileageTo} onChange={set('mileageTo')}>
        {KM_MAX.map(k => <option key={k.val} value={k.val}>{k.val === '' ? 'Pa limit' : k.label}</option>)}
      </Sel>
      {hasFilters ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] invisible">x</label>
          <button
            onClick={() => { onChange(EMPTY); close(); }}
            className="flex items-center justify-center gap-1.5 h-[42px] text-xs rounded-xl transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <RotateCcw className="w-3.5 h-3.5" />Pastro
          </button>
        </div>
      ) : <div />}
    </div>
  );

  return (
    <>
      {/* Desktop: always-visible filter row */}
      <div className="hidden sm:block" style={{ borderBottom: '1px solid var(--border-lo)', background: 'var(--bg-page)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          {filterContent}
        </div>
      </div>

      {/* Mobile: compact horizontal filter strip */}
      <div className="sm:hidden overflow-x-auto" style={{ borderBottom: '1px solid var(--border-lo)', background: 'var(--bg-page)' }}>
        <div className="flex gap-2 px-4 py-2.5 min-w-max items-center">
          {/* Brand */}
          <div className="relative">
            <select value={filters.manufacturer} onChange={e => set('manufacturer')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.manufacturer ? 'rgba(59,130,246,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.manufacturer ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`, color: filters.manufacturer ? '#60a5fa' : 'var(--text-3)' }}>
              <option value="">Prodhuesi</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Fuel */}
          <div className="relative">
            <select value={filters.fuel} onChange={e => set('fuel')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.fuel ? 'rgba(59,130,246,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.fuel ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`, color: filters.fuel ? '#60a5fa' : 'var(--text-3)' }}>
              {FUELS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Year from */}
          <div className="relative">
            <select value={filters.yearFrom} onChange={e => set('yearFrom')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.yearFrom ? 'rgba(59,130,246,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.yearFrom ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`, color: filters.yearFrom ? '#60a5fa' : 'var(--text-3)' }}>
              <option value="">Viti nga</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Year to */}
          <div className="relative">
            <select value={filters.yearTo} onChange={e => set('yearTo')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.yearTo ? 'rgba(59,130,246,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.yearTo ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`, color: filters.yearTo ? '#60a5fa' : 'var(--text-3)' }}>
              <option value="">Viti deri</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Km */}
          <div className="relative">
            <select value={filters.mileageTo} onChange={e => set('mileageTo')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.mileageTo ? 'rgba(59,130,246,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.mileageTo ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`, color: filters.mileageTo ? '#60a5fa' : 'var(--text-3)' }}>
              {KM_MAX.map(k => <option key={k.val} value={k.val}>{k.label}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Clear button — only shows when filters active */}
          {hasFilters && (
            <button onClick={() => onChange(EMPTY)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Full-screen drawer — mobile only */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="relative rounded-t-2xl p-5 pb-8 shadow-2xl animate-slide-up w-full"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottom: 'none' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>
                Filtra
                {activeCount > 0 && (
                  <span className="ml-2 text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </h3>
              <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full btn-ghost" style={{ color: 'var(--text-1)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {filterContent}

            <div className="flex gap-3 mt-5">
              {hasFilters && (
                <button onClick={() => { onChange(EMPTY); close(); }} className="flex-1 btn-ghost py-3 text-sm">
                  Pastro
                </button>
              )}
              <button onClick={close} className={`btn-primary py-3 text-sm ${hasFilters ? 'flex-1' : 'w-full'}`}>
                Apliko
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only floating Filtra button — minimal ghost style */}
      <div className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtra
          {activeCount > 0 && (
            <span className="text-[10px] font-bold font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

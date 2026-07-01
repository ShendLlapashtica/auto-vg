import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import { BRANDS, MODELS_BY_BRAND } from '../lib/brandModels.js';

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

const PRICES = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000];

const EMPTY = { manufacturer: '', model: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '', priceFrom: '', priceTo: '' };

function Sel({ label, value, onChange, disabled, children }) {
  const active = !!value;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-wider font-mono font-semibold" style={{ color: 'var(--text-3)' }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="pr-8 text-sm font-semibold appearance-none w-full rounded-xl px-3.5 py-3 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
          style={{
            background: active ? 'rgba(220,38,38,0.12)' : 'var(--bg-card)',
            border: `1.5px solid ${active ? 'rgba(220,38,38,0.5)' : 'var(--border)'}`,
            color: active ? '#f87171' : 'var(--text-1)',
          }}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: active ? '#f87171' : 'var(--text-3)' }} />
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

  function set(key) {
    return val => onChange(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'manufacturer') next.model = ''; // brand changed — reset model
      return next;
    });
  }
  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters  = activeCount > 0;
  const models      = MODELS_BY_BRAND[filters.manufacturer] || [];

  const filterContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <Sel label="Prodhuesi" value={filters.manufacturer} onChange={set('manufacturer')}>
        <option value="">Të gjithë</option>
        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
      </Sel>
      <Sel label="Modeli" value={filters.model} onChange={set('model')} disabled={!filters.manufacturer}>
        <option value="">{filters.manufacturer ? 'Të gjithë' : 'Zgjidh markën'}</option>
        {models.map(m => <option key={m} value={m}>{m}</option>)}
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
      <Sel label="Çmimi nga" value={filters.priceFrom} onChange={set('priceFrom')}>
        <option value="">Pa limit</option>
        {PRICES.map(p => <option key={p} value={p}>{p.toLocaleString('de-DE')} €</option>)}
      </Sel>
      <Sel label="Çmimi deri" value={filters.priceTo} onChange={set('priceTo')}>
        <option value="">Pa limit</option>
        {PRICES.map(p => <option key={p} value={p}>{p.toLocaleString('de-DE')} €</option>)}
      </Sel>
      {hasFilters ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] invisible">x</label>
          <button
            onClick={() => { onChange(EMPTY); close(); }}
            className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold rounded-xl transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <RotateCcw className="w-3.5 h-3.5" />Pastro
          </button>
        </div>
      ) : <div />}
    </div>
  );

  return (
    <>
      {/* Desktop: always-visible filter row (caller supplies the outer chrome) */}
      <div className="hidden sm:block">
        {filterContent}
      </div>

      {/* Mobile: compact horizontal filter strip */}
      <div className="sm:hidden overflow-x-auto -mx-1">
        <div className="flex gap-2 px-1 py-1 min-w-max items-center">
          {/* Brand */}
          <div className="relative">
            <select value={filters.manufacturer} onChange={e => set('manufacturer')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.manufacturer ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.manufacturer ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.manufacturer ? '#f87171' : 'var(--text-3)' }}>
              <option value="">Prodhuesi</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Model — only meaningful once a brand is chosen */}
          <div className="relative">
            <select value={filters.model} onChange={e => set('model')(e.target.value)}
                    disabled={!filters.manufacturer}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium disabled:opacity-40"
                    style={{ background: filters.model ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.model ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.model ? '#f87171' : 'var(--text-3)' }}>
              <option value="">Modeli</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Fuel */}
          <div className="relative">
            <select value={filters.fuel} onChange={e => set('fuel')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.fuel ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.fuel ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.fuel ? '#f87171' : 'var(--text-3)' }}>
              {FUELS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Year from */}
          <div className="relative">
            <select value={filters.yearFrom} onChange={e => set('yearFrom')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.yearFrom ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.yearFrom ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.yearFrom ? '#f87171' : 'var(--text-3)' }}>
              <option value="">Viti nga</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Year to */}
          <div className="relative">
            <select value={filters.yearTo} onChange={e => set('yearTo')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.yearTo ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.yearTo ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.yearTo ? '#f87171' : 'var(--text-3)' }}>
              <option value="">Viti deri</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Km */}
          <div className="relative">
            <select value={filters.mileageTo} onChange={e => set('mileageTo')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.mileageTo ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.mileageTo ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.mileageTo ? '#f87171' : 'var(--text-3)' }}>
              {KM_MAX.map(k => <option key={k.val} value={k.val}>{k.label}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Price from */}
          <div className="relative">
            <select value={filters.priceFrom} onChange={e => set('priceFrom')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.priceFrom ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.priceFrom ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.priceFrom ? '#f87171' : 'var(--text-3)' }}>
              <option value="">Çmimi nga</option>
              {PRICES.map(p => <option key={p} value={p}>{p.toLocaleString('de-DE')} €</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          </div>

          {/* Price to */}
          <div className="relative">
            <select value={filters.priceTo} onChange={e => set('priceTo')(e.target.value)}
                    className="appearance-none text-xs rounded-lg pl-2.5 pr-6 py-1.5 font-medium"
                    style={{ background: filters.priceTo ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)', border: `1px solid ${filters.priceTo ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`, color: filters.priceTo ? '#f87171' : 'var(--text-3)' }}>
              <option value="">Çmimi deri</option>
              {PRICES.map(p => <option key={p} value={p}>{p.toLocaleString('de-DE')} €</option>)}
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

      {/* Drawer + floating button are portaled to <body> so `position: fixed`
          is always relative to the real viewport — any ancestor with a
          transform/filter/backdrop-filter (like the glass hero bar) would
          otherwise create its own containing block and break fixed
          positioning, making these appear to scroll away with the page. */}
      {createPortal(
        <>
          {/* Full-screen drawer — mobile only */}
          {open && (
            <div className="sm:hidden fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
              <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl p-5 pb-8 shadow-2xl animate-slide-up overflow-y-auto"
                   style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottom: 'none', maxHeight: '85vh' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>
                    Filtra
                    {activeCount > 0 && (
                      <span className="ml-2 text-xs font-mono bg-red-600 text-white px-2 py-0.5 rounded-full">
                        {activeCount}
                      </span>
                    )}
                  </h3>
                  <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full btn-ghost p-0" style={{ color: 'var(--text-1)' }}>
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

          {/* Mobile-only floating Filtra button — circular FAB, safe-area aware */}
          <div className="sm:hidden fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none"
               style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
            <button
              onClick={() => setOpen(true)}
              aria-label="Hap filtrat"
              className="pointer-events-auto relative flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: '58px',
                height: '58px',
                background: 'linear-gradient(145deg,#ef4444,#b91c1c)',
                boxShadow: '0 8px 24px rgba(220,38,38,0.45), 0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <SlidersHorizontal className="w-6 h-6 text-white" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center text-[11px] font-bold font-mono text-white rounded-full"
                      style={{ width: '22px', height: '22px', background: '#0c0c1c', border: '2px solid var(--bg-page)' }}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

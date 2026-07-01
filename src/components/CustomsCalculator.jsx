import { useState } from 'react';
import { X, Calculator, ChevronDown } from 'lucide-react';

function calcAlbania(valueEur) {
  const duty    = valueEur * 0.05;
  const vat     = (valueEur + duty) * 0.20;
  const eco     = valueEur > 15000 ? 150 : valueEur > 8000 ? 80 : 40;
  const reg     = 120;
  const total   = duty + vat + eco + reg;
  return { duty, vat, eco, reg, total, finalPrice: valueEur + total };
}

function calcKosovo(valueEur) {
  const duty    = valueEur * 0.10;
  const vat     = (valueEur + duty) * 0.18;
  const fees    = 80;
  const total   = duty + vat + fees;
  return { duty, vat, fees, total, finalPrice: valueEur + total };
}

function fmt(n) { return '€' + Math.round(n).toLocaleString('de-DE'); }

export default function CustomsCalculator({ onClose }) {
  const [value, setValue] = useState('');
  const [country, setCountry] = useState('XK');
  const result = value > 0
    ? (country === 'AL' ? calcAlbania(Number(value)) : calcKosovo(Number(value)))
    : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 z-10 shadow-2xl glass-card">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>Kalkulatori i Doganës</h2>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full btn-ghost p-0"
                  style={{ color: 'var(--text-1)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Country */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold mb-1.5"
                   style={{ color: 'var(--text-3)' }}>
              Shteti i Importit
            </label>
            <div className="relative">
              <select value={country} onChange={e => setCountry(e.target.value)}
                      className="select w-full appearance-none pr-8">
                <option value="AL">🇦🇱 Shqipëri (Albania)</option>
                <option value="XK">🇽🇰 Kosovë (Kosovo)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                           style={{ color: 'var(--text-3)' }} />
            </div>
          </div>

          {/* Value input */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-mono font-semibold mb-1.5"
                   style={{ color: 'var(--text-3)' }}>
              Vlera e Mjetit (EUR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold"
                    style={{ color: 'var(--text-3)' }}>€</span>
              <input type="number" min="0" placeholder="p.sh. 12500"
                     value={value} onChange={e => setValue(e.target.value)}
                     className="input pl-8 font-mono" />
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-4)' }}>
              Bazuar në çmimin e automjetit (CIF - Korea → port)
            </p>
          </div>

          {/* Results */}
          {result && (
            <div className="rounded-xl p-4 space-y-2 mt-2"
                 style={{ background: 'var(--bg-card2)', border: '1px solid var(--border-lo)' }}>
              <p className="text-[10px] uppercase tracking-widest font-mono font-semibold mb-3"
                 style={{ color: 'var(--text-3)' }}>
                Llogaritja
              </p>
              {country === 'AL' ? (
                <>
                  <Line label="Çmimi bazë"      val={fmt(Number(value))} />
                  <Line label="Dogana (5%)"      val={fmt(result.duty)} />
                  <Line label="TVSH 20%"         val={fmt(result.vat)} />
                  <Line label="Taksa Ekologjike" val={fmt(result.eco)} muted />
                  <Line label="Regjistrimi"      val={fmt(result.reg)} muted />
                  <div className="pt-2 mt-1" style={{ borderTop: '1px solid var(--border-lo)' }}>
                    <Line label="Totali i Taksave"  val={fmt(result.total)} accent />
                    <Line label="Çmimi Final (AL)"  val={fmt(result.finalPrice)} bold />
                  </div>
                </>
              ) : (
                <>
                  <Line label="Çmimi bazë"   val={fmt(Number(value))} />
                  <Line label="Dogana (10%)" val={fmt(result.duty)} />
                  <Line label="TVSH 18%"     val={fmt(result.vat)} />
                  <Line label="Tarifat Admin" val={fmt(result.fees)} muted />
                  <div className="pt-2 mt-1" style={{ borderTop: '1px solid var(--border-lo)' }}>
                    <Line label="Totali i Taksave" val={fmt(result.total)} accent />
                    <Line label="Çmimi Final (XK)" val={fmt(result.finalPrice)} bold />
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-[10px] text-center" style={{ color: 'var(--text-4)' }}>
            * Llogaritje afërsisht. Tarifat zyrtare mund të ndryshojnë sipas vitit, kubaturës dhe gjendjes.
          </p>
        </div>
      </div>
    </div>
  );
}

function Line({ label, val, accent, bold, muted }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: muted ? 'var(--text-4)' : 'var(--text-3)' }}>{label}</span>
      <span className={`font-mono font-semibold ${bold ? 'text-base' : ''}`}
            style={{ color: bold ? 'var(--text-1)' : accent ? '#f87171' : 'var(--text-2)' }}>
        {val}
      </span>
    </div>
  );
}

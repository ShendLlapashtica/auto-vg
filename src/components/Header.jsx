import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext.jsx';
import CustomsCalculator from './CustomsCalculator.jsx';
import MobileMenu from './MobileMenu.jsx';
import { BRANDS } from '../lib/brandModels.js';

const FUEL_KEYWORDS = {
  'diesel': 'diesel', 'naftë': 'diesel', 'nafta': 'diesel',
  'benzinë': 'gasoline', 'benzina': 'gasoline', 'benzine': 'gasoline', 'petrol': 'gasoline', 'gasoline': 'gasoline',
  'elektrik': 'electric', 'electric': 'electric', 'ev': 'electric',
  'hibrid': 'hybrid', 'hybrid': 'hybrid',
  'lpg': 'lpg',
};

function parseSearchQuery(q) {
  const parts   = q.trim().split(/\s+/);
  const params  = {};

  // Detect year(s)
  const yearParts = parts.filter(p => /^(19|20)\d{2}$/.test(p));
  const nonYear   = parts.filter(p => !/^(19|20)\d{2}$/.test(p));
  if (yearParts.length === 1) { params.yearFrom = yearParts[0]; params.yearTo = yearParts[0]; }
  if (yearParts.length >= 2)  { params.yearFrom = String(Math.min(...yearParts.map(Number))); params.yearTo = String(Math.max(...yearParts.map(Number))); }

  // Detect fuel
  for (const [kw, val] of Object.entries(FUEL_KEYWORDS)) {
    if (nonYear.some(p => p.toLowerCase() === kw)) { params.fuel = val; break; }
  }

  // Detect brand (try longest match first)
  const text = nonYear.join(' ').toLowerCase();
  let matched = '';
  for (let len = 4; len >= 1; len--) {
    const candidate = nonYear.slice(0, len).join(' ');
    if (BRANDS.some(b => b.toLowerCase() === candidate.toLowerCase())) {
      matched = BRANDS.find(b => b.toLowerCase() === candidate.toLowerCase());
      break;
    }
  }
  if (matched) {
    params.brand = matched;
    const brandWordCount = matched.split(/\s+/).length;
    const afterBrand = nonYear.slice(brandWordCount);
    const modelWords = afterBrand.filter(w => !FUEL_KEYWORDS[w.toLowerCase()]);
    if (modelWords.length > 0) params.model = modelWords.join(' ');
  }

  return params;
}

export default function Header() {
  const [calc, setCalc]         = useState(false);
  const [menu, setMenu]         = useState(false);
  const [search, setSearch]     = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { country, setCountry } = useCountry();
  const navigate                = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    const parsed = parseSearchQuery(q);
    const hasParsed = Object.keys(parsed).length > 0;
    if (hasParsed) {
      navigate(`/?${new URLSearchParams(parsed)}`);
    } else {
      navigate(`/?q=${encodeURIComponent(q)}`);
    }
    setShowSearch(false);
    setSearch('');
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl bg-[#060610]/80 border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-2 h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center group select-none flex-shrink-0 mr-2 bg-black rounded-lg px-2 py-1">
            <img src="/logo.png" alt="AUTO VG" className="h-8 w-auto" />
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="BMW, Hyundai Tucson, 2020..."
                className="input pl-8 text-sm h-9"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">

            {/* AL / XK flags */}
            <div className="hidden sm:flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setCountry('AL')}
                title="Shqipëri – çmim Durrës"
                className={`px-2.5 py-1.5 text-base leading-none transition-all
                  ${country === 'AL' ? 'bg-red-600 shadow-[0_0_0_1px_rgba(220,38,38,0.4)]' : 'hover:bg-card2'}`}
              >
                🇦🇱
              </button>
              <button
                onClick={() => setCountry('XK')}
                title="Kosovë – çmim Prishtinë"
                className={`px-2.5 py-1.5 text-base leading-none transition-all
                  ${country === 'XK' ? 'bg-red-600 shadow-[0_0_0_1px_rgba(220,38,38,0.4)]' : 'hover:bg-card2'}`}
              >
                🇽🇰
              </button>
            </div>

            <a href="https://wa.me/38348407634" target="_blank" rel="noopener noreferrer"
               className="hidden sm:inline-flex btn-primary text-xs py-1.5 px-3">
              WhatsApp
            </a>

            {/* Mobile: search icon */}
            <button
              onClick={() => setShowSearch(s => !s)}
              className="sm:hidden flex w-9 h-9 items-center justify-center rounded-xl btn-ghost text-base p-0"
            >
              {showSearch ? <X className="w-4 h-4" /> : '🔍'}
            </button>

            {/* Mobile: burger → X when menu open */}
            <button
              onClick={() => setMenu(o => !o)}
              className="sm:hidden flex w-9 h-9 items-center justify-center rounded-xl btn-ghost p-0"
              aria-label={menu ? 'Mbyll menunë' : 'Hap menunë'}
            >
              {menu ? (
                <X className="w-5 h-5" style={{ color: 'var(--text-1)' }} />
              ) : (
                <div className="flex flex-col justify-center gap-[6px]">
                  <span style={{ display:'block', width:'22px', height:'3px', borderRadius:'3px', background:'linear-gradient(90deg,#ef4444,#dc2626)' }} />
                  <span style={{ display:'block', width:'22px', height:'3px', borderRadius:'3px', background:'linear-gradient(90deg,#f87171,#dc2626)' }} />
                  <span style={{ display:'block', width:'22px', height:'3px', borderRadius:'3px', background:'linear-gradient(90deg,#dc2626,#991b1b)' }} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {showSearch && (
          <div className="sm:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="BMW, 2020, Hyundai Tucson..."
                className="input flex-1 text-sm h-10"
              />
              <button type="submit" className="btn-primary px-4 h-10 text-sm">
                🔍
              </button>
            </form>
          </div>
        )}
      </header>

      {calc && <CustomsCalculator onClose={() => setCalc(false)} />}
      {menu && (
        <MobileMenu
          onClose={() => setMenu(false)}
          onOpenCalc={() => { setMenu(false); setCalc(true); }}
          country={country}
          setCountry={setCountry}
        />
      )}
    </>
  );
}

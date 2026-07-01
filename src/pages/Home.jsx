import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, Shield, Truck, BadgeCheck, Clock, HeartHandshake, Globe, X, SlidersHorizontal } from 'lucide-react';
import CarCard from '../components/CarCard.jsx';
import Filters from '../components/Filters.jsx';

const PAGE_SIZE = 24;
const EMPTY_FILTERS = { manufacturer: '', model: '', fuel: '', yearFrom: '', yearTo: '', mileageTo: '' };

const WHY_US = [
  { icon: BadgeCheck,     title: 'Vetëm Makina të Verifikuara', desc: 'Çdo makinë ka raport inspektimi nga Encar — histori dëmtimesh, numër pronarësh dhe aksidente.' },
  { icon: Globe,          title: '200,000+ Listëzime Live',     desc: 'Direkta nga platforma koreane Encar.com — çmimet dhe disponueshmëria janë në kohë reale.' },
  { icon: Truck,          title: 'Çmim All-in',                 desc: 'Çmimi përfshin transportin deri te porti juaj. Pa kosto të fshehura.' },
  { icon: Clock,          title: 'Dorëzim 30–45 Ditë',          desc: 'Pas konfirmimit të porosisë, makina mbërrin brenda 4–6 javësh.' },
  { icon: HeartHandshake, title: 'Asistencë e Plotë Doganore',  desc: 'E organizojmë gjithë procesin e doganes, TVSH-ës dhe regjistrimit për ju.' },
  { icon: Shield,         title: 'Garanci Kthimi',              desc: 'Nëse makina nuk përputhet me përshkrimin, marrim kujdesin e plotë. Zero risk.' },
];

function filtersFromParams(params) {
  return {
    manufacturer: params.get('brand')    || '',
    model:        params.get('model')    || '',
    fuel:         params.get('fuel')     || '',
    yearFrom:     params.get('yearFrom') || '',
    yearTo:       params.get('yearTo')   || '',
    mileageTo:    params.get('kmMax')    || '',
  };
}

function paramsFromFilters(f, keyword) {
  const p = {};
  if (keyword)      p.q       = keyword;
  if (f.manufacturer) p.brand   = f.manufacturer;
  if (f.model)        p.model   = f.model;
  if (f.fuel)         p.fuel    = f.fuel;
  if (f.yearFrom)     p.yearFrom = f.yearFrom;
  if (f.yearTo)       p.yearTo   = f.yearTo;
  if (f.mileageTo)    p.kmMax    = f.mileageTo;
  return p;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';

  const [cars, setCars]       = useState([]);
  const [total, setTotal]     = useState(null);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState(null);
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));

  // Sticky filter button state
  const [filtersVisible, setFiltersVisible]     = useState(true);
  const [filterForceOpen, setFilterForceOpen]   = useState(false);
  const filtersWrapRef = useRef(null);

  const session    = useRef(0);
  const sentinel   = useRef(null);
  const loadingRef = useRef(false);
  const doneRef    = useRef(false);

  // Sync URL → filters when searchParams change externally (e.g. from Header search)
  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  // Watch when filter row scrolls out of view → show desktop floating button
  useEffect(() => {
    const el = filtersWrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFiltersVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function handleFilterChange(updater) {
    setFilters(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSearchParams(paramsFromFilters(next, keyword), { replace: true });
      return next;
    });
  }

  function clearSearch() {
    setSearchParams(paramsFromFilters(filters, ''), { replace: true });
  }

  const loadPage = useCallback(async (pg, flt, kw, replace) => {
    const sid = ++session.current;
    loadingRef.current = true;
    setLoading(true);
    if (replace) { setCars([]); setDone(false); doneRef.current = false; }
    setError(null);

    try {
      const params = new URLSearchParams({ page: pg, count: PAGE_SIZE });
      if (kw) {
        params.set('q', kw);
      } else {
        Object.entries(flt).forEach(([k, v]) => v && params.set(k, v));
      }

      const r    = await fetch(`/api/cars?${params}`);
      const data = await r.json();
      if (sid !== session.current) return;
      if (data.error) throw new Error(data.error);

      const newCars = data.results || data.SearchResults || [];
      const tot     = data.total ?? data.Count ?? 0;

      setCars(prev => {
        const next = replace ? newCars : [...prev, ...newCars];
        const isDone = next.length >= tot || newCars.length < PAGE_SIZE;
        if (isDone) { setDone(true); doneRef.current = true; }
        return next;
      });
      setTotal(tot);
    } catch (e) {
      if (sid !== session.current) return;
      setError(e.message);
    } finally {
      if (sid === session.current) { loadingRef.current = false; setLoading(false); }
    }
  }, []);

  // Reset on filter/keyword change
  useEffect(() => {
    setPage(0);
    loadPage(0, filters, keyword, true);
  }, [filters, keyword, loadPage]);

  // Infinite scroll — stable observer, refs avoid stale-closure issues
  const filtersRef = useRef(filters);
  const keywordRef = useRef(keyword);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { keywordRef.current = keyword; }, [keyword]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current && !doneRef.current) {
          setPage(prev => {
            const next = prev + 1;
            loadPage(next, filtersRef.current, keywordRef.current, false);
            return next;
          });
        }
      },
      { rootMargin: '600px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadPage]); // stable — never disconnects/reconnects due to loading/done changes

  const isSearching = !!keyword;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>

      {/* Hero */}
      <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <div>
            {isSearching ? (
              <>
                <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold font-mono mb-2">
                  Rezultate për
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none flex items-center gap-3" style={{ color: 'var(--text-1)' }}>
                  "{keyword}"
                  <button onClick={clearSearch} className="p-1 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </h1>
                {total != null && (
                  <p className="text-sm mt-1.5" style={{ color: 'var(--text-3)' }}>
                    <span className="font-mono font-semibold" style={{ color: 'var(--text-2)' }}>{total.toLocaleString('de-DE')}</span> makina u gjetën
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold mb-2 font-mono">
                  Tregti direkte · Korea Jugore
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none" style={{ color: 'var(--text-1)' }}>
                  {total != null ? (
                    <><span className="font-mono">{total.toLocaleString('de-DE')}</span><span className="text-blue-500"> makina</span></>
                  ) : (
                    <span className="animate-pulse" style={{ color: 'var(--text-4)' }}>Duke ngarkuar...</span>
                  )}
                </h1>
                <p className="text-sm mt-2" style={{ color: 'var(--text-3)' }}>Çmimet përfshijnë transport deri në port · all-in</p>
              </>
            )}
          </div>
          <TrendingUp className="w-10 h-10 text-blue-500/15 hidden md:block" />
        </div>
      </div>

      {/* Filters */}
      <div ref={filtersWrapRef}>
        <Filters
          filters={filters}
          onChange={handleFilterChange}
          forceOpen={filterForceOpen}
          onForceClose={() => setFilterForceOpen(false)}
        />
      </div>

      {/* Desktop floating Filtra button — scrolls back to filter row */}
      {!filtersVisible && (
        <div className="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <button
            onClick={() => filtersWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
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
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="text-[10px] font-bold font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/25 rounded-xl text-red-300 text-sm">
            ⚠ {error}
          </div>
        )}

        {cars.length === 0 && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ aspectRatio: '16/10', background: 'var(--bg-card2)' }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded w-3/4" style={{ background: 'var(--border)' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: 'var(--border)' }} />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-3 rounded" style={{ background: 'var(--border-lo)' }} />
                    ))}
                  </div>
                  <div className="pt-2 flex justify-between">
                    <div className="h-5 rounded w-1/3" style={{ background: 'var(--border)' }} />
                    <div className="h-3 rounded w-10" style={{ background: 'var(--border)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cars.length === 0 && !loading && (
          <div className="text-center py-24">
            <p className="text-lg font-medium" style={{ color: 'var(--text-3)' }}>Nuk u gjetën makina</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-4)' }}>Provo të ndryshosh filtrat ose kërkimin</p>
          </div>
        )}

        {cars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cars.map(car => <CarCard key={`${car.Id}-${car.Price}`} car={car} />)}
          </div>
        )}

        {/* Sentinel — always in DOM so IntersectionObserver always has a target */}
        <div ref={sentinel} className="h-16 flex items-center justify-center mt-6 pointer-events-none">
          {loading && cars.length > 0 && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-3)' }}>
              <span className="w-4 h-4 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
              Duke ngarkuar...
            </div>
          )}
          {done && cars.length > 0 && (
            <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
              Të gjitha {total?.toLocaleString('de-DE')} makina u ngarkuan
            </p>
          )}
        </div>

        {/* WHY US — appears inline when all cars are loaded */}
        {done && cars.length > 0 && (
          <div className="mt-10 pt-10" style={{ borderTop: '1px solid var(--border-lo)' }}>
            <div className="text-center mb-8">
              <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold font-mono mb-2">
                Avantazhi ynë
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>
                Pse të na zgjidhni ne?
              </h2>
              <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color: 'var(--text-3)' }}>
                Importojmë direkt nga Korea Jugore — pa ndërmjetës, pa surpriza. Transparencë totale.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHY_US.map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="rounded-2xl p-5 transition-all group"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/15 transition-colors">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: 'var(--text-1)' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a href="https://wa.me/38349644168" target="_blank" rel="noopener noreferrer"
                 className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
                💬 Na Kontaktoni Tani
              </a>
              <p className="text-xs mt-2" style={{ color: 'var(--text-4)' }}>Pa asnjë angazhim · Konsultë falas</p>
            </div>
          </div>
        )}
      </div>

      {/* Why Choose Us */}
      <section style={{ borderTop: '1px solid var(--border-lo)', marginTop: '2rem' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-blue-500/70 font-semibold font-mono mb-3">
              Avantazhi ynë
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>
              Pse të na zgjidhni ne?
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-3)' }}>
              Importojmë direkt nga Korea Jugore — pa ndërmjetës, pa surpriza.
              Transparencë totale nga listëzimi deri te porti juaj.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="rounded-2xl p-6 transition-all group"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-1)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="https://wa.me/38349644168" target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
              Na Kontaktoni Tani
            </a>
            <p className="text-xs mt-3" style={{ color: 'var(--text-4)' }}>Pa asnjë angazhim · Konsultë falas</p>
          </div>
        </div>
      </section>
    </div>
  );
}

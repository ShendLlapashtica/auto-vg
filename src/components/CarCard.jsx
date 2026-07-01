import { useState } from 'react';
import { Link } from 'react-router-dom';
import { carPhotoUrl, fmtEur, fmtKm, carYear, tr, trCity } from '../lib/utils.js';
import { translateFuel, translateTrans, translateColor } from '../lib/translations.js';
import { useCountry } from '../contexts/CountryContext.jsx';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect width='400' height='260' fill='%230a0a14'/%3E%3Ctext x='200' y='138' text-anchor='middle' fill='%23222240' font-size='13' font-family='sans-serif'%3EFoto nuk disponohet%3C/text%3E%3C/svg%3E";

const CONDITION_ALB = { Inspection: 'Inspektuar', Record: 'Histori', Resume: 'Raport', Warranty: 'Garanci' };

const FUEL_COLOR = {
  'Elektrik': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Hibrid':   'bg-teal-500/15 text-teal-300 border-teal-500/25',
  'Naftë':    'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'default':  'bg-blue-500/15 text-blue-300 border-blue-500/25',
};

export default function CarCard({ car }) {
  const [imgSrc, setImgSrc] = useState(() => carPhotoUrl(car) || PLACEHOLDER);
  const { priceFor, label } = useCountry();

  const year   = carYear(car);
  const price  = priceFor(car.Price);
  const fuel   = translateFuel(car.FuelType);
  const trans  = translateTrans(car.Transmission);
  const color  = translateColor(car.Color);
  const maker  = tr(car.Manufacturer);
  const model  = tr(car.Model);
  const badge  = tr(car.Badge);
  const badgeDetail = tr(car.BadgeDetail);
  const cc     = car.CylinderCapacity || car.Spec?.Displacement;
  const drive  = car.Spec?.Drive || car.Drive;
  const city   = trCity(car.OfficeCityState);
  const fuelCls = FUEL_COLOR[fuel] || FUEL_COLOR.default;
  const conditions = (car.Condition || []).slice(0, 3);

  return (
    <Link
      to={`/car/${car.Id}`}
      state={{ car }}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(59,130,246,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/10', background: 'var(--bg-card2)' }}>
        <img
          src={imgSrc}
          alt={`${maker} ${model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          onError={() => setImgSrc(PLACEHOLDER)}
        />
        {conditions.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {conditions.map(c => (
              <span key={c} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-white/70 border border-white/10">
                {CONDITION_ALB[c] || c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <div>
          <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--text-1)' }}>
            {maker} <span style={{ color: 'var(--text-2)' }}>{model}</span>
          </h3>
          {badge && (
            <p className="text-xs mt-0.5 leading-snug truncate" style={{ color: 'var(--text-3)' }}>
              {[badge, badgeDetail].filter(Boolean).join(' · ')}
            </p>
          )}
          {(year || fuel) && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {year && (
                <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-1)' }}>{year}</span>
              )}
              {year && fuel && <span style={{ color: 'var(--text-4)' }}>·</span>}
              {fuel && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${fuelCls}`}>{fuel}</span>
              )}
            </div>
          )}
        </div>

        {/* Attribute grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {car.Mileage != null && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>km</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{fmtKm(car.Mileage)}</span>
            </div>
          )}
          {trans && trans !== '—' && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>⚙</span>
              <span className="truncate">{trans}</span>
            </div>
          )}
          {cc && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>cc</span>
              <span className="font-mono" style={{ color: 'var(--text-1)' }}>{Number(cc).toLocaleString('de-DE')}</span>
            </div>
          )}
          {drive && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>↕</span>
              <span className="truncate">{drive}</span>
            </div>
          )}
          {color && color !== '—' && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>◐</span>
              <span className="truncate">{color}</span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
              <span>🇰🇷</span>
              <span className="truncate">{city}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-lo)' }} />

        {/* Price */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="font-mono text-xl font-bold tracking-tight leading-none" style={{ color: 'var(--text-1)' }}>
              {price > 0 ? fmtEur(price) : '—'}
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
          <span className="text-xs font-semibold text-blue-500 group-hover:text-blue-400 transition-colors pb-0.5 font-mono">
            SHIKO →
          </span>
        </div>
      </div>
    </Link>
  );
}

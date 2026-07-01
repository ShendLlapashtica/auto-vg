import { createContext, useContext, useState } from 'react';
import { durresPrice, pristinePrice } from '../lib/utils.js';

const Ctx = createContext(null);

export function CountryProvider({ children }) {
  const [country, setCountryState] = useState(
    () => localStorage.getItem('xkor_country') || 'XK'
  );

  function setCountry(c) {
    setCountryState(c);
    localStorage.setItem('xkor_country', c);
  }

  function priceFor(manwon) {
    return country === 'AL' ? durresPrice(manwon) : pristinePrice(manwon);
  }

  const label    = country === 'AL' ? 'deri në Durrës · all-in' : 'deri në Prishtinë · all-in';
  const cityName = country === 'AL' ? 'Durrës' : 'Prishtinë';

  return (
    <Ctx.Provider value={{ country, setCountry, priceFor, label, cityName }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCountry must be inside CountryProvider');
  return ctx;
}

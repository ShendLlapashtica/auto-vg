import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDarkState] = useState(
    () => localStorage.getItem('xkor_theme') === 'dark'
  );

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    localStorage.setItem('xkor_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <Ctx.Provider value={{ dark, toggle: () => setDarkState(d => !d) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() { return useContext(Ctx); }

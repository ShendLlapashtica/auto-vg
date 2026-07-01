import { Link } from 'react-router-dom';
import { X, Calculator, Sun, Moon, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function MobileMenu({ onClose, onOpenCalc, country, setCountry, dark, toggleTheme }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const drawerBg = dark ? 'bg-[#0a0a18] border-white/10' : 'bg-white border-black/10';

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-72 h-full border-l flex flex-col shadow-2xl animate-slide-in-right ${drawerBg}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-mono font-bold text-lg" style={{ color: 'var(--text-1)' }}>
            X<span className="text-blue-500">K</span>OR
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full btn-ghost" style={{ color: 'var(--text-1)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Country toggle */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest mb-2 font-mono font-semibold" style={{ color: 'var(--text-3)' }}>
            Çmim për
          </p>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button
              onClick={() => setCountry('AL')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all
                ${country === 'AL' ? 'bg-blue-600 text-white' : ''}`}
              style={country !== 'AL' ? { color: 'var(--text-2)' } : {}}
            >
              🇦🇱 Durrës
            </button>
            <button
              onClick={() => setCountry('XK')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all
                ${country === 'XK' ? 'bg-blue-600 text-white' : ''}`}
              style={country !== 'XK' ? { color: 'var(--text-2)' } : {}}
            >
              🇽🇰 Prishtinë
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-4 space-y-1">
          <button
            onClick={onOpenCalc}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-card2"
          >
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="flex-1 text-left text-sm font-medium" style={{ color: 'var(--text-1)' }}>Kalkulatori i Doganës</span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-card2"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </nav>

        {/* Why us */}
        <div className="flex-1 px-4 py-3" style={{ borderTop: '1px solid var(--border-lo)' }}>
          <p className="text-[10px] uppercase tracking-widest mb-3 font-mono font-semibold" style={{ color: 'var(--text-3)' }}>
            Pse XKOR?
          </p>
          <div className="space-y-2.5">
            {[
              ['✅', 'Çmim transparent — pa surpriza'],
              ['🚢', 'Transport i siguruar deri te ju'],
              ['🔍', 'Inspektim profesional në Kore'],
              ['📋', 'Raport i plotë aksidentesh'],
              ['⚡', 'Procedurë e shpejtë & e sigurt'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--text-2)' }}>
                <span className="flex-shrink-0 text-sm">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          <a href="https://wa.me/38349644168" target="_blank" rel="noopener noreferrer"
             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110"
             style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}
             onClick={onClose}>
            💬 WhatsApp · 049 644 168
          </a>
          <a href="tel:+38349644168"
             className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold btn-ghost"
             style={{ color: 'var(--text-1)' }}
             onClick={onClose}>
            📞 049 644 168
          </a>
        </div>
      </div>
    </div>
  );
}

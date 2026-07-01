export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-lo)', marginTop: '2rem' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <span className="bg-black rounded-lg px-2 py-1 inline-flex">
            <img src="/logo.png" alt="AUTO VG" className="h-9 w-auto" />
          </span>
          <p className="text-sm mt-4" style={{ color: 'var(--text-2)' }}>
            📍 Magj, Prishtinë 10000, Kosovë
          </p>
          <a
            href="https://www.google.com/maps?cid=3057844513289429268"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm mt-1 text-red-500 hover:text-red-400 transition-colors"
          >
            Hap në Google Maps →
          </a>

          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <a href="https://wa.me/38348407634" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110"
               style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
              💬 WhatsApp · 048 407 634
            </a>
            <a href="tel:+38348407634"
               className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold btn-ghost">
              📞 048 407 634
            </a>
          </div>

          <p className="text-xs mt-6" style={{ color: 'var(--text-4)' }}>© 2026 AUTO VG</p>
        </div>

        <div className="rounded-2xl overflow-hidden glass-card" style={{ height: '260px' }}>
          <iframe
            title="AUTO VG — Prishtinë"
            src="https://www.google.com/maps?q=Magj,+Prishtin%C3%AB+10000,+Kosovo&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </footer>
  );
}

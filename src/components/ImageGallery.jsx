import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageGallery({ photos = [], alt = '' }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [loaded, setLoaded] = useState({});
  const [errors, setErrors] = useState({});

  const valid = photos.filter((_, i) => !errors[i]);

  function prev() { setActive(a => Math.max(0, a - 1)); }
  function next() { setActive(a => Math.min(valid.length - 1, a + 1)); }

  if (!valid.length) return null;

  return (
    <>
      {/* Main image */}
      <div className="relative bg-[#08080f] rounded-2xl overflow-hidden aspect-[16/9]">
        <img
          src={valid[active]}
          alt={alt}
          onError={() => setErrors(e => ({ ...e, [active]: true }))}
          onLoad={() => setLoaded(l => ({ ...l, [active]: true }))}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setLightbox(true)}
        />

        {/* Nav arrows */}
        {valid.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={active === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur
                         flex items-center justify-center text-white disabled:opacity-20 hover:bg-black/80 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={active === valid.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur
                         flex items-center justify-center text-white disabled:opacity-20 hover:bg-black/80 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
          {active + 1} / {valid.length}
        </div>
      </div>

      {/* Thumbnails */}
      {valid.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mt-2 scrollbar-hide">
          {valid.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-150
                ${i === active ? 'border-blue-500' : 'border-white/10 opacity-60 hover:opacity-100'}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover"
                onError={() => setErrors(e => ({ ...e, [i]: true }))} />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={valid[active]}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// Single car detail — tries Encar view endpoint, falls back to list search
import { checkApiKey } from '../src/lib/rateLimit.js';
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

async function tryFetch(url, signal, isWrapped = false) {
  const r = await fetch(url, { signal, headers: isWrapped ? {} : BROWSER_HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const text = await r.text();
  if (isWrapped) {
    const outer = JSON.parse(text);
    if (!outer.contents) throw new Error('no contents');
    return JSON.parse(outer.contents);
  }
  return JSON.parse(text);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!await checkApiKey(req, res)) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'missing id' });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);

  // Strategy 1: Encar dedicated view endpoint
  const viewUrl = `https://api.encar.com/search/car/view/general?carid=${id}`;
  // Strategy 2: List search filtered by ID (always works if listing API works)
  const listUrl = `https://api.encar.com/search/car/list/general?${new URLSearchParams({
    count: 'true',
    q: `(And.Hidden.N._.Carid.${id}.)`,
    sr: `|ModifiedDate|0|1`,
    inav: '|Metadata|Sort',
  })}`;

  const enc1 = encodeURIComponent(viewUrl);
  const enc2 = encodeURIComponent(listUrl);

  try {
    const data = await Promise.any([
      // View endpoint — direct + proxied
      tryFetch(viewUrl, ctrl.signal),
      tryFetch(`https://api.allorigins.win/get?url=${enc1}`, ctrl.signal, true),
      tryFetch(`https://corsproxy.io/?${enc1}`, ctrl.signal),
      // List search fallback
      tryFetch(listUrl, ctrl.signal).then(d => {
        const car = d?.SearchResults?.[0];
        if (!car) throw new Error('not found in list');
        return car;
      }),
      tryFetch(`https://api.allorigins.win/get?url=${enc2}`, ctrl.signal, true).then(d => {
        const car = d?.SearchResults?.[0];
        if (!car) throw new Error('not found in list via proxy');
        return car;
      }),
    ]);

    clearTimeout(timer);
    return res.status(200).json(data);
  } catch (err) {
    clearTimeout(timer);
    return res.status(502).json({ error: 'Could not fetch car detail', detail: err.message });
  }
}

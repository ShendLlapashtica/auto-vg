// Returns just the total count for a given filter — cheap prefetch for pagination UI
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const encarUrl = `https://api.encar.com/search/car/list/general?${new URLSearchParams({
    count: 'true',
    q: '(And.Hidden.N.)',
    sr: '|ModifiedDate|0|1',
    inav: '|Metadata|Sort',
  })}`;

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  const enc   = encodeURIComponent(encarUrl);

  try {
    const r = await Promise.any([
      fetch(encarUrl, { signal: ctrl.signal, headers: BROWSER_HEADERS }),
      fetch(`https://api.allorigins.win/get?url=${enc}`, { signal: ctrl.signal }),
    ]);
    clearTimeout(timer);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = JSON.parse(JSON.parse(text).contents); }
    return res.status(200).json({ total: data.Count });
  } catch {
    clearTimeout(timer);
    return res.status(502).json({ error: 'count fetch failed' });
  }
}

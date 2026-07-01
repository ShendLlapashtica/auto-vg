// Encar insurance / accident history — real endpoint, proxy-hardened
// Endpoint: https://api.encar.com/v1/readside/record/vehicle/{id}/open
// Returns the public ("open") carhistory record: owner changes, special
// accidents (total-loss/flood/theft), and the insurance accident list with
// per-claim cost breakdown. Mirrors the "Historia e sigurimeve" Encar tab.

import { checkApiKey } from '../src/lib/rateLimit.js';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://fem.encar.com/',
  'Origin': 'https://fem.encar.com',
};

function fmtDate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/[^0-9]/g, '').slice(0, 8);
  if (s.length === 8) return `${s.slice(6, 8)}.${s.slice(4, 6)}.${s.slice(0, 4)}`;
  if (s.length === 6) return `${s.slice(4, 6)}.${s.slice(0, 4)}`;
  return String(raw);
}

const MAKER_KR = {
  '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis', '쌍용': 'SsangYong',
  '르노삼성': 'Renault Samsung', '르노': 'Renault', '쉐보레': 'Chevrolet',
  '벤츠': 'Mercedes-Benz', '아우디': 'Audi', '폭스바겐': 'Volkswagen',
  '포르쉐': 'Porsche', '렉서스': 'Lexus', '도요타': 'Toyota', '혼다': 'Honda',
  '닛산': 'Nissan', '볼보': 'Volvo', '랜드로버': 'Land Rover', '미니': 'Mini',
  '푸조': 'Peugeot', '재규어': 'Jaguar', 'BMW': 'BMW',
};
const FUEL_KR = {
  '가솔린': 'Benzinë', '디젤': 'Dizel', 'LPG': 'LPG',
  '전기': 'Elektrik', '하이브리드': 'Hibrid',
};
function shapeToAlb(s) {
  if (!s) return null;
  let out = s;
  const shapes = { '세단': 'Sedan', 'SUV': 'SUV', '해치백': 'Hatchback', '왜건': 'Vagon',
    '쿠페': 'Kupe', '컨버터블': 'Kabriolet', '밴': 'Furgon', '리무진': 'Limuzinë' };
  for (const [kr, al] of Object.entries(shapes)) out = out.replace(kr, al);
  out = out.replace(/(\d)\s*도어/, 'me $1 dyer');
  return out.trim();
}
function trMaker(kr) { return MAKER_KR[kr] || kr || null; }
function trFuel(kr)  { return FUEL_KR[kr]  || kr || null; }

function parseRecord(d) {
  const num = v => (v == null ? 0 : Number(v) || 0);
  const wons = arr => arr.reduce((a, x) => a + num(x), 0);

  const accidents = Array.isArray(d.accidents) ? d.accidents : [];
  const mapAcc = a => {
    const total = wons([a.partCost, a.laborCost, a.paintingCost]);
    return {
      date: fmtDate(a.date),
      totalCost: total || num(a.insuranceBenefit) || null,
      partCost: num(a.partCost) || null,
      laborCost: num(a.laborCost) || null,
      paintingCost: num(a.paintingCost) || null,
      insuranceBenefit: num(a.insuranceBenefit) || null,
    };
  };
  const myAccidents    = accidents.filter(a => String(a.type) === '1').map(mapAcc);
  const otherAccidents = accidents.filter(a => String(a.type) === '2').map(mapAcc);

  const carInfoChanges = Array.isArray(d.carInfoChanges)
    ? d.carInfoChanges.map(c => ({ date: fmtDate(c.date), carNo: c.carNo || null }))
    : [];

  const ownerChanges = Array.isArray(d.ownerChanges)
    ? d.ownerChanges.map(o => ({ date: fmtDate(o.date || o.changeDate) })).filter(o => o.date)
    : [];

  return {
    apiError: false,
    hasRecord: d.openData !== false,
    requestDate: fmtDate(d.regDate),
    // vehicle spec summary
    spec: {
      maker: trMaker(d.maker),
      model: d.model || null,
      year: d.year || null,
      fuel: trFuel(d.fuel),
      displacement: d.displacement ? `${Number(d.displacement).toLocaleString('de-DE')} cc` : null,
      shape: shapeToAlb(d.carShape),
      firstDate: fmtDate(d.firstDate),
      carNo: d.carNo || null,
    },
    // headline counts
    counts: {
      myAccident: num(d.myAccidentCnt),
      otherAccident: num(d.otherAccidentCnt),
      ownerChange: num(d.ownerChangeCnt),
      carNoChange: num(d.carNoChangeCnt),
      totalLoss: num(d.totalLossCnt),
      flood: num(d.floodTotalLossCnt) + num(d.floodPartLossCnt),
      robber: num(d.robberCnt),
    },
    costs: {
      myAccident: num(d.myAccidentCost),
      otherAccident: num(d.otherAccidentCost),
    },
    usage: {
      // 0 = no history
      commercialRent: num(d.loan) > 0,
      commercialGeneral: num(d.business) > 0,
      official: num(d.government) > 0,
    },
    myAccidents,
    otherAccidents,
    ownerChanges,
    carInfoChanges,
  };
}

const NO_RECORD = Symbol('no-record');

function looksLikeRecord(o) {
  return o && typeof o === 'object' &&
    ('openData' in o || 'accidents' in o || 'myAccidentCnt' in o || 'carNo' in o);
}

async function fetchRecord(id, signal) {
  const url = `https://api.encar.com/v1/readside/record/vehicle/${id}/open`;
  const enc = encodeURIComponent(url);
  const validate = o => {
    if (o === NO_RECORD) return o;
    if (!looksLikeRecord(o)) throw new Error('not a record payload');
    return o;
  };
  const direct = async () => {
    const r = await fetch(url, { headers: BROWSER_HEADERS, signal });
    if (r.status === 404) return NO_RECORD;
    if (!r.ok) throw new Error(`direct HTTP ${r.status}`);
    return validate(await r.json());
  };
  const allorigins = async () => {
    const r = await fetch(`https://api.allorigins.win/get?url=${enc}`, { signal });
    if (!r.ok) throw new Error(`allorigins HTTP ${r.status}`);
    const o = await r.json();
    if (o?.status?.http_code === 404) return NO_RECORD;
    if (!o?.contents) throw new Error('allorigins empty');
    return validate(JSON.parse(o.contents));
  };
  const corsproxy = async () => {
    const r = await fetch(`https://corsproxy.io/?${enc}`, { signal });
    if (r.status === 404) return NO_RECORD;
    if (!r.ok) throw new Error(`corsproxy HTTP ${r.status}`);
    return validate(await r.json());
  };
  const codetabs = async () => {
    const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${enc}`, { signal });
    if (r.status === 404) return NO_RECORD;
    if (!r.ok) throw new Error(`codetabs HTTP ${r.status}`);
    return validate(await r.json());
  };
  return Promise.any([direct(), allorigins(), corsproxy(), codetabs()]);
}

const EMPTY = {
  apiError: false, hasRecord: false, requestDate: null,
  spec: null, counts: null, costs: null, usage: null,
  myAccidents: [], otherAccidents: [], ownerChanges: [], carInfoChanges: [],
};

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

  let data;
  try {
    data = await fetchRecord(id, ctrl.signal);
  } catch (err) {
    clearTimeout(timer);
    const detail = err instanceof AggregateError
      ? err.errors.map(e => e.message).join(' | ')
      : err.message;
    return res.status(200).json({ ...EMPTY, apiError: true, _error: detail });
  }
  clearTimeout(timer);
  try { ctrl.abort(); } catch {}

  if (data === NO_RECORD) return res.status(200).json(EMPTY);

  return res.status(200).json(parseRecord(data));
}

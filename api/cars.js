// Encar reverse-engineering proxy — uncapped, multi-fallback
// Supports full pagination over 200k+ listings

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.encar.com/',
  'Origin': 'https://www.encar.com',
};

// English brand name → Korean Encar identifier
// (BMW, Audi, Porsche etc. are stored in Encar under their own name or Korean)
const MANUFACTURER_REVERSE = {
  'Hyundai':         '현대',
  'Kia':             '기아',
  'Mercedes-Benz':   '벤츠',
  'Mercedes Benz':   '벤츠',
  'Audi':            '아우디',
  'Volkswagen':      '폭스바겐',
  'Porsche':         '포르쉐',
  'Lexus':           '렉서스',
  'Genesis':         '제네시스',
  'SsangYong':       '쌍용',
  'Ssangyong':       '쌍용',
  'Renault Samsung': '르노삼성',
  'Renault':         '르노',
  'Chevrolet':       '쉐보레',
  'Volvo':           '볼보',
  'Land Rover':      '랜드로버',
  'Mini':            '미니',
  'Toyota':          '도요타',
  'Honda':           '혼다',
  'Maserati':        '마세라티',
  'Ferrari':         '페라리',
  'Lamborghini':     '람보르기니',
  'Bentley':         '벤틀리',
  'Rolls-Royce':     '롤스로이스',
  'Peugeot':         '푸조',
  'Jaguar':          '재규어',
  'Nissan':          '닛산',
  'Infiniti':        '인피니티',
  'Lincoln':         '링컨',
  'Cadillac':        '캐딜락',
  'Jeep':            '지프',
  'Ford':            '포드',
  'Subaru':          '스바루',
  'Mitsubishi':      '미쓰비시',
  'Alfa Romeo':      '알파로메오',
  'Fiat':            '피아트',
  // Brands where Encar uses English — pass through unchanged
  'BMW':             'BMW',
};

// English model name → Korean Encar model identifier
const MODEL_REVERSE = {
  'Avante':    '아반떼', 'Elantra':  '아반떼',
  'Sonata':    '쏘나타', 'Grandeur': '그랜저',
  'Tucson':    '투싼',   'Santa Fe': '싼타페', 'Santafe': '싼타페',
  'Palisade':  '팰리세이드', 'Kona':    '코나',
  'Ioniq':     '아이오닉', 'Ioniq 5': '아이오닉5', 'Ioniq 6': '아이오닉6',
  'Veloster':  '벨로스터', 'Staria':  '스타리아', 'Starex': '스타렉스',
  'Casper':    '캐스퍼',
  'Morning':   '모닝',  'Picanto': '모닝', 'Ray':     '레이',
  'Stonic':    '스토닉', 'Niro':    '니로', 'Seltos':  '셀토스',
  'Sportage':  '스포티지', 'Sorento': '쏘렌토', 'Carnival': '카니발',
  'Stinger':   '스팅어', 'Telluride': '텔루라이드',
  'Tivoli':    '티볼리', 'Rexton':   '렉스턴', 'Korando': '코란도',
  'Musso':     '무쏘',  'Torres':   '토레스',
  'Golf':      '골프',  'Polo':     '폴로',  'Passat':  '파사트',
  'Tiguan':    '티구안', 'Touareg':  '투아렉', 'Arteon':  '아테온',
  'Malibu':    '말리부', 'Spark':    '스파크', 'Equinox': '이쿼녹스',
  'Trailblazer': '트레일블레이저', 'Cruze': '크루즈',
  'Camry':     '캠리',  'Corolla':  '코롤라', 'Prius':   '프리우스',
  'RAV4':      '라브4', 'Highlander': '하이랜더',
  'Accord':    '어코드', 'Civic':   '시빅',
  'Altima':    '알티마', 'Murano':   '무라노', 'Rogue':   '로그',
  'Outlander': '아웃랜더', 'Forester': '포레스터', 'Outback': '아웃백',
};

// Albanian/English fuel → Korean Encar FuelType
const FUEL_MAP = {
  diesel:   '디젤', dizel:    '디젤',
  gasoline: '가솔린', benzin:   '가솔린', benzine: '가솔린', petrol: '가솔린',
  electric: '전기',  elektrik: '전기',  ev: '전기',
  hybrid:   '하이브리드', hibrid: '하이브리드',
  lpg:      'LPG',
};

// Case-insensitive dictionary lookup — returns the matched dictionary key, or null.
function findKey(dict, val) {
  if (Object.prototype.hasOwnProperty.call(dict, val)) return val;
  return Object.keys(dict).find(k => k.toLowerCase() === val.toLowerCase()) || null;
}

function toEncarManufacturer(val) {
  if (!val) return null;
  const key = findKey(MANUFACTURER_REVERSE, val);
  return key ? MANUFACTURER_REVERSE[key] : val;
}

// BMW-style numbered series ("1 Series", "3-Series") are stored on Encar as
// "N시리즈", usually with a generation code appended (e.g. "1시리즈 (F20)"),
// so this is only ever used as a substring term, never an exact filter value.
function seriesTransliteration(val) {
  const m = val.trim().match(/^(\d)\s*-?\s*series$/i);
  return m ? `${m[1]}시리즈` : null;
}

// Models not in the Korean-market dictionary are almost always alphanumeric
// export codes (X5, A4, RS6, C200...) that Encar stores upper-cased.
function toEncarModel(val) {
  if (!val) return null;
  const key = findKey(MODEL_REVERSE, val);
  if (key) return MODEL_REVERSE[key];
  return seriesTransliteration(val) ?? val.toUpperCase();
}

// True only for a confirmed MODEL_REVERSE dictionary hit — the one case
// where the Encar value is known to be the car's literal, complete Model
// facet rather than a base name Encar likely stores with a generation-code
// suffix. Anything else (series transliteration, upper-cased passthrough)
// is a substring term only, per the comments on seriesTransliteration/toEncarModel.
function isExactEncarModel(val) {
  return !!val && !!findKey(MODEL_REVERSE, val);
}

// Parse a free-text keyword like "hyundai tucson" or "bmw x5" into filter parts.
// Matching is case-insensitive throughout so natural, lowercase typing works.
// `remainder` keeps the (possibly transliterated) leftover text for the
// substring fallback tier, which is where series names actually get resolved.
function parseKeyword(keyword) {
  if (!keyword) return {};
  const parts = keyword.trim().split(/\s+/);

  // Check if the first word(s) match a manufacturer (longest match wins)
  for (let len = Math.min(parts.length, 3); len >= 1; len--) {
    const candidate = parts.slice(0, len).join(' ');
    const key = findKey(MANUFACTURER_REVERSE, candidate);
    if (key) {
      const rest = parts.slice(len).join(' ');
      const result = { manufacturer: MANUFACTURER_REVERSE[key] };
      if (rest) {
        const translit   = seriesTransliteration(rest);
        result.model      = translit ?? toEncarModel(rest);
        result.remainder  = translit ?? rest;
        result.modelExact = !translit && isExactEncarModel(rest);
      }
      return result;
    }
  }

  // "N Series" typed with no manufacturer is BMW's signature naming — hint it
  const translit = seriesTransliteration(keyword);
  if (translit) {
    return { manufacturer: MANUFACTURER_REVERSE['BMW'], model: translit, remainder: translit, modelExact: false };
  }

  // No manufacturer recognized — treat the whole keyword as a model/badge search
  return { model: toEncarModel(keyword.trim()), remainder: keyword.trim(), modelExact: isExactEncarModel(keyword.trim()) };
}

async function attempt(fetchUrl, isWrapped, signal, label, extraHeaders = {}) {
  const r = await fetch(fetchUrl, { signal, headers: extraHeaders });
  if (!r.ok) throw new Error(`${label}: HTTP ${r.status}`);
  const text = await r.text();

  let data;
  if (isWrapped) {
    const outer = JSON.parse(text);
    if (outer.status?.http_code === 403) throw new Error(`${label}: Encar 403 via proxy`);
    if (!outer.contents) throw new Error(`${label}: empty proxy contents`);
    data = JSON.parse(outer.contents);
  } else {
    data = JSON.parse(text);
  }

  if (!Array.isArray(data?.SearchResults)) throw new Error(`${label}: no SearchResults`);
  return data;
}

async function runSearch(parts, offset, count, signal) {
  const filter = parts.length > 0
    ? `(And.Hidden.N._.${parts.join('._.')}.)`
    : `(And.Hidden.N.)`;

  const encarUrl = `https://api.encar.com/search/car/list/general?${new URLSearchParams({
    count: 'true',
    q:     filter,
    sr:    `|ModifiedDate|${offset}|${count}`,
    inav:  '|Metadata|Sort',
  })}`;
  const enc = encodeURIComponent(encarUrl);

  return Promise.any([
    attempt(encarUrl,                                          false, signal, 'direct',    BROWSER_HEADERS),
    attempt(`https://api.allorigins.win/get?url=${enc}`,       true,  signal, 'allorigins', {}),
    attempt(`https://corsproxy.io/?${enc}`,                    false, signal, 'corsproxy',  {}),
    attempt(`https://api.codetabs.com/v1/proxy?quest=${enc}`,  false, signal, 'codetabs',   {}),
  ]);
}

// Last-resort fallback for free text that doesn't map onto an exact Encar
// facet value (e.g. "1 Series", "Ser", or any other partial/loose term):
// scan a broad recent batch and rank whatever actually contains the words
// typed, instead of dead-ending with zero results.
function tokenize(str) {
  return (str || '').toLowerCase().split(/[^a-z0-9가-힣]+/).filter(Boolean);
}

// A term that PREFIXES a model token (e.g. "x" -> "x5") is what the user
// means by a partial model code; a term that just happens to appear
// mid-token (e.g. "x" inside the generation code "nx4") is much weaker
// signal and should rank below real matches, not disappear, since we'd
// rather over- than under-include.
function matchScore(car, terms) {
  const modelTokens = tokenize(car.Model);
  const otherTokens = [...tokenize(car.Manufacturer), ...tokenize(car.Badge), ...tokenize(car.BadgeDetail)];
  let score = 0;
  for (const t of terms) {
    if (modelTokens.some(tok => tok === t))            score += 100;
    else if (modelTokens.some(tok => tok.startsWith(t))) score += 50;
    else if (otherTokens.some(tok => tok.startsWith(t))) score += 10;
    else if ([...modelTokens, ...otherTokens].some(tok => tok.includes(t))) score += 1;
  }
  return score;
}

async function substringSearch(keyword, manufacturer, offset, count, signal, extraParts = []) {
  const scanParts = [...(manufacturer ? [`Manufacturer.${manufacturer}`] : []), ...extraParts];
  const broad      = await runSearch(scanParts, 0, 500, signal);

  // Split with the same rule matchScore uses on car fields (tokenize), so a
  // hyphenated term like "C-CLASS" lines up with Encar's "C-클래스" split
  // into ["c","클래스"] instead of staying one unmatchable "c-class" blob.
  // Short tokens (e.g. the "c" in "c-class", or "x" meant to catch X3/X5/X6)
  // are kept rather than dropped as noise — matchScore already ranks an
  // exact short-token match (tier 1, score 100) above a mid-token coincidence
  // (tier 4, score 1), so keeping them only helps precision here.
  const useTerms = tokenize(keyword);

  const matched = broad.SearchResults
    .map(car => ({ car, score: matchScore(car, useTerms) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.car);

  return {
    Count:         matched.length,
    SearchResults: matched.slice(offset, offset + count),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = req.query;

  const page   = Math.max(0, parseInt(q.page  ?? '0'));
  const count  = Math.min(500, Math.max(1, parseInt(q.count ?? '24')));
  const offset = page * count;

  // Identity filter (manufacturer/model) — kept separate from the rest so we
  // can retry with a looser filter if the exact combo comes back empty.
  const rawKeyword = (q.q || q.keyword || q.search || '').trim();
  let manufacturer = null;
  let model        = null;
  let remainder    = null; // raw leftover text, used only by the substring fallback
  let modelExact   = false; // true only for a confirmed MODEL_REVERSE dictionary hit

  if (rawKeyword) {
    const parsed = parseKeyword(rawKeyword);
    manufacturer = parsed.manufacturer || null;
    model        = parsed.model        || null;
    remainder    = parsed.remainder    || null;
    modelExact   = !!parsed.modelExact;
  } else {
    if (q.manufacturer) manufacturer = toEncarManufacturer(q.manufacturer);
    if (q.model) {
      model      = toEncarModel(q.model);
      modelExact = isExactEncarModel(q.model);
      // Use the transliterated value (not the raw English dropdown text) as
      // the substring-fallback term — it tokenizes against Encar's raw
      // Hangul/passthrough-code fields, unlike an English word like "series".
      remainder = model;
    }
  }

  // Filters shared by every attempt (fuel/year/mileage/price)
  const commonParts = [];

  if (q.fuel) {
    const mapped = FUEL_MAP[q.fuel.toLowerCase().trim()] ?? q.fuel;
    commonParts.push(`FuelType.${mapped}`);
  }

  if (q.yearFrom || q.yearTo) {
    // Year field is YYYYMM (e.g. 201405), so convert 4-digit year to 6-digit range
    const from = (q.yearFrom ?? '2000') + '00';
    const to   = (q.yearTo   ?? '2030') + '99';
    commonParts.push(`Year.range(${from}..${to})`);
  }

  if (q.mileageFrom || q.mileageTo) {
    commonParts.push(`Mileage.range(${q.mileageFrom ?? 0}..${q.mileageTo ?? 9999999})`);
  }

  if (q.priceFrom || q.priceTo) {
    commonParts.push(`Price.range(${q.priceFrom ?? 0}..${q.priceTo ?? 999999})`);
  }

  // Only a confirmed dictionary hit is trustworthy as an *exact* Model facet —
  // Encar stores everything else (series/class/code-style names) with a
  // generation-code suffix, so an exact filter on those either goes empty or
  // (worse) returns a small, misleadingly "successful" sliver of real matches
  // (e.g. only the one Audi listing literally tagged "A4" with no suffix).
  const identityParts = [];
  if (manufacturer) identityParts.push(`Manufacturer.${manufacturer}`);
  if (model && modelExact) identityParts.push(`Model.${model}`);

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);

  try {
    let data = await runSearch([...identityParts, ...commonParts], offset, count, ctrl.signal);

    // A non-exact model was left out of the facet filter above — narrow the
    // (brand-wide) results down by substring-matching it now, rather than
    // waiting for a hard zero-result before trying.
    if (model && !modelExact) {
      const narrowed = await substringSearch(remainder, manufacturer, offset, count, ctrl.signal, commonParts);
      if (narrowed.SearchResults.length > 0) data = narrowed;
    }

    // Still nothing matched — progressively broaden instead of dead-ending
    // with zero results:
    //   1. Brand recognized + leftover text ("BMW X" / "BMW X5") → scan that
    //      brand's recent listings for the leftover text (catches X3/X5/X6...).
    //   2. Still nothing but brand is known → show the whole brand.
    //   3. No brand recognized at all ("X5", "X", "1 Series", "Ser") → scan
    //      everything for the typed text.
    //   4. Truly nothing matched anywhere → show recent listings rather than
    //      a hard empty state.
    if (data.SearchResults.length === 0 && (manufacturer || model)) {
      if (manufacturer && remainder) {
        data = await substringSearch(remainder, manufacturer, offset, count, ctrl.signal, commonParts);
      }
      if (data.SearchResults.length === 0 && manufacturer) {
        data = await runSearch([`Manufacturer.${manufacturer}`, ...commonParts], offset, count, ctrl.signal);
      }
      if (data.SearchResults.length === 0 && !manufacturer) {
        data = await substringSearch(rawKeyword, null, offset, count, ctrl.signal, commonParts);
      }
      if (data.SearchResults.length === 0) {
        data = await runSearch(commonParts, offset, count, ctrl.signal);
      }
    }

    clearTimeout(timer);
    return res.status(200).json({
      total:   data.Count,
      page,
      count:   data.SearchResults.length,
      results: data.SearchResults,
    });

  } catch (err) {
    clearTimeout(timer);
    const isTimeout = ctrl.signal.aborted;
    const detail    = err instanceof AggregateError
      ? err.errors.map(e => e.message).join(' | ')
      : err.message;

    return res.status(isTimeout ? 504 : 502).json({
      error:  isTimeout ? 'Koha skadoi. Provo përsëri.' : 'Të gjithë proxy-t dështuan.',
      code:   isTimeout ? 'TIMEOUT' : 'ALL_FAILED',
      detail,
    });
  }
}

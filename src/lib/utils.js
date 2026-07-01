const KRW_TO_EUR = 0.00067;
const DELIVERY_DURRES = 350;
const DELIVERY_PRISHTINA = 700;

export { DELIVERY_DURRES, DELIVERY_PRISHTINA };

export const MANUFACTURER_MAP = {
  '현대': 'Hyundai', '기아': 'Kia', '벤츠': 'Mercedes-Benz',
  '메르세데스-벤츠': 'Mercedes-Benz', '아우디': 'Audi', '폭스바겐': 'Volkswagen',
  '포르쉐': 'Porsche', '렉서스': 'Lexus', '제네시스': 'Genesis',
  '쌍용': 'SsangYong', '르노삼성': 'Renault Samsung', '르노': 'Renault',
  '쉐보레': 'Chevrolet', '볼보': 'Volvo', '랜드로버': 'Land Rover',
  '미니': 'Mini', '도요타': 'Toyota', '혼다': 'Honda',
  '마세라티': 'Maserati', '페라리': 'Ferrari', '람보르기니': 'Lamborghini',
  '벤틀리': 'Bentley', '롤스로이스': 'Rolls-Royce', '푸조': 'Peugeot',
  '오펠': 'Opel', '스즈키': 'Suzuki', '닷지': 'Dodge', '재규어': 'Jaguar',
  '닛산': 'Nissan', '인피니티': 'Infiniti', '링컨': 'Lincoln',
  '캐딜락': 'Cadillac', '크라이슬러': 'Chrysler', '지프': 'Jeep',
  '포드': 'Ford', '스바루': 'Subaru', '미쓰비시': 'Mitsubishi',
  '시트': 'Seat', '알파로메오': 'Alfa Romeo', '피아트': 'Fiat',
};

// English → Korean for Encar API filter (reverse of MANUFACTURER_MAP)
export const MANUFACTURER_REVERSE = {
  'Hyundai': '현대', 'Kia': '기아', 'Mercedes-Benz': '벤츠',
  'Audi': '아우디', 'Volkswagen': '폭스바겐', 'Porsche': '포르쉐',
  'Lexus': '렉서스', 'Genesis': '제네시스', 'SsangYong': '쌍용',
  'Renault Samsung': '르노삼성', 'Renault': '르노', 'Chevrolet': '쉐보레',
  'Volvo': '볼보', 'Land Rover': '랜드로버', 'Mini': '미니',
  'Toyota': '도요타', 'Honda': '혼다', 'Maserati': '마세라티',
  'Ferrari': '페라리', 'Lamborghini': '람보르기니', 'Bentley': '벤틀리',
  'Rolls-Royce': '롤스로이스', 'Peugeot': '푸조', 'Jaguar': '재규어',
  'Nissan': '닛산', 'Infiniti': '인피니티', 'Lincoln': '링컨',
  'Cadillac': '캐딜락', 'Jeep': '지프', 'Ford': '포드',
  'Subaru': '스바루', 'Mitsubishi': '미쓰비시',
  // Non-Korean brands that stay as-is in Encar
  'BMW': 'BMW', 'Alfa Romeo': '알파로메오', 'Fiat': '피아트',
};

// Korean model name → English display name
const MODELS_MAP = {
  // ── Hyundai ──
  '아반떼': 'Avante', '쏘나타': 'Sonata', '소나타': 'Sonata',
  '그랜저': 'Grandeur', '투싼': 'Tucson', '싼타페': 'Santa Fe',
  '팰리세이드': 'Palisade', '코나': 'Kona', '아이오닉': 'Ioniq',
  '아이오닉5': 'Ioniq 5', '아이오닉6': 'Ioniq 6', '아이오닉7': 'Ioniq 7',
  '벨로스터': 'Veloster', '넥쏘': 'Nexo', '스타리아': 'Staria',
  '스타렉스': 'Starex', '포터': 'Porter', '테라칸': 'Terracan',
  '갤로퍼': 'Galloper', '베라크루즈': 'Veracruz', '맥스크루즈': 'Maxcruz',
  '아토스': 'Atos', '클릭': 'Click', '엑센트': 'Accent', '엑셀': 'Excel',
  '라브라도': 'Labrador', '쿠스토': 'Custo', '캐스퍼': 'Casper',
  '아이오닉 5': 'Ioniq 5', '아이오닉 6': 'Ioniq 6',
  '제네시스쿠페': 'Genesis Coupe', '제네시스 쿠페': 'Genesis Coupe',
  '뉴그랜저': 'Grandeur', '더뉴그랜저': 'Grandeur',
  // ── Kia ──
  '모닝': 'Morning', '레이': 'Ray', '스토닉': 'Stonic', '니로': 'Niro',
  '셀토스': 'Seltos', '스포티지': 'Sportage', '쏘렌토': 'Sorento',
  '카니발': 'Carnival', '텔루라이드': 'Telluride', '스팅어': 'Stinger',
  '봉고': 'Bongo', '카렌스': 'Carens', '로체': 'Lotze',
  '오피러스': 'Opirus', '리오': 'Rio', '씨드': 'Ceed',
  '쏘울': 'Soul', '프라이드': 'Pride', '스펙트라': 'Spectra',
  '엔터프라이즈': 'Entourage',
  // ── Genesis ──
  'G70': 'G70', 'G80': 'G80', 'G90': 'G90',
  'GV70': 'GV70', 'GV80': 'GV80', 'GV90': 'GV90',
  // ── SsangYong / KGM ──
  '티볼리': 'Tivoli', '렉스턴': 'Rexton', '코란도': 'Korando',
  '무쏘': 'Musso', '토레스': 'Torres', '체어맨': 'Chairman',
  '로디우스': 'Rodius', '카이런': 'Kyron',
  // ── Volkswagen ──
  '골프': 'Golf', '폴로': 'Polo', '파사트': 'Passat', '티구안': 'Tiguan',
  '투아렉': 'Touareg', '아테온': 'Arteon', '샤란': 'Sharan', '업': 'Up',
  '카딜락': 'Cadillac',
  // ── Chevrolet / GM Korea ──
  '말리부': 'Malibu', '스파크': 'Spark', '이쿼녹스': 'Equinox',
  '트레일블레이저': 'Trailblazer', '타호': 'Tahoe', '크루즈': 'Cruze',
  '올란도': 'Orlando', '아베오': 'Aveo', '캡티바': 'Captiva',
  '트랙스': 'Trax', '볼트': 'Bolt',
  // ── Renault Samsung ──
  '클리오': 'Clio', '조에': 'Zoe', '마스터': 'Master',
  // ── Toyota ──
  '캠리': 'Camry', '코롤라': 'Corolla', '프리우스': 'Prius',
  '라브4': 'RAV4', '하이랜더': 'Highlander', '시에나': 'Sienna',
  '아발론': 'Avalon', '야리스': 'Yaris', '수프라': 'Supra',
  '벤자': 'Venza', '4러너': '4Runner',
  // ── Honda ──
  '어코드': 'Accord', '시빅': 'Civic', '파일럿': 'Pilot',
  '오디세이': 'Odyssey', '재즈': 'Jazz', '프리트': 'Freed',
  '핏': 'Fit', 'HR-V': 'HR-V',
  // ── Nissan ──
  '알티마': 'Altima', '맥시마': 'Maxima', '무라노': 'Murano',
  '패스파인더': 'Pathfinder', '큐브': 'Cube', '로그': 'Rogue',
  '쥬크': 'Juke', '마치': 'March', '티아나': 'Teana',
  // ── Mitsubishi ──
  '아웃랜더': 'Outlander', '이클립스 크로스': 'Eclipse Cross',
  '파제로': 'Pajero', '갤랑': 'Galant', '랜서': 'Lancer',
  '이클립스': 'Eclipse',
  // ── Subaru ──
  '포레스터': 'Forester', '아웃백': 'Outback', '임프레자': 'Impreza',
  '레거시': 'Legacy', '크로스트렉': 'Crosstrek', 'BRZ': 'BRZ',
  // ── Lexus ──
  'UX': 'UX', 'NX': 'NX', 'RX': 'RX', 'GX': 'GX', 'LX': 'LX',
  'ES': 'ES', 'IS': 'IS', 'GS': 'GS', 'LS': 'LS', 'LC': 'LC',
  'RC': 'RC', 'CT': 'CT',
  // ── Land Rover ──
  '디스커버리': 'Discovery', '디펜더': 'Defender',
  '레인지로버': 'Range Rover', '이보크': 'Evoque',
  // ── Volvo ──
  '볼보': 'Volvo',
};

// English model → Korean Encar model name (for API search)
export const MODEL_REVERSE = {
  'Avante': '아반떼', 'Elantra': '아반떼', 'Sonata': '쏘나타',
  'Grandeur': '그랜저', 'Tucson': '투싼', 'Santa Fe': '싼타페',
  'Palisade': '팰리세이드', 'Kona': '코나', 'Ioniq': '아이오닉',
  'Ioniq 5': '아이오닉5', 'Ioniq 6': '아이오닉6', 'Veloster': '벨로스터',
  'Staria': '스타리아', 'Starex': '스타렉스',
  'Morning': '모닝', 'Picanto': '모닝', 'Ray': '레이', 'Stonic': '스토닉',
  'Niro': '니로', 'Seltos': '셀토스', 'Sportage': '스포티지',
  'Sorento': '쏘렌토', 'Carnival': '카니발', 'Stinger': '스팅어',
  'Tivoli': '티볼리', 'Rexton': '렉스턴', 'Korando': '코란도',
  'Musso': '무쏘', 'Torres': '토레스',
  'Golf': '골프', 'Polo': '폴로', 'Passat': '파사트', 'Tiguan': '티구안',
  'Touareg': '투아렉', 'Arteon': '아테온',
  'Malibu': '말리부', 'Spark': '스파크', 'Equinox': '이쿼녹스',
  'Trailblazer': '트레일블레이저', 'Cruze': '크루즈',
  'Camry': '캠리', 'Corolla': '코롤라', 'Prius': '프리우스', 'RAV4': '라브4',
  'Accord': '어코드', 'Civic': '시빅',
  'Altima': '알티마', 'Murano': '무라노', 'Rogue': '로그',
  'Outlander': '아웃랜더', 'Forester': '포레스터', 'Outback': '아웃백',
};

const CITIES_MAP = {
  '서울': 'Seoul', '경기': 'Gyeonggi', '인천': 'Incheon', '부산': 'Busan',
  '대구': 'Daegu', '광주': 'Gwangju', '대전': 'Daejeon', '울산': 'Ulsan',
  '세종': 'Sejong', '강원': 'Gangwon', '충북': 'Chungbuk', '충남': 'Chungnam',
  '전북': 'Jeonbuk', '전남': 'Jeonnam', '경북': 'Gyeongbuk', '경남': 'Gyeongnam',
  '제주': 'Jeju', '수원': 'Suwon', '성남': 'Seongnam', '용인': 'Yongin',
  '안양': 'Anyang', '안산': 'Ansan', '화성': 'Hwaseong', '평택': 'Pyeongtaek',
  '시흥': 'Siheung', '파주': 'Paju', '의정부': 'Uijeongbu', '김포': 'Gimpo',
  '하남': 'Hanam', '구리': 'Guri', '광명': 'Gwangmyeong', '군포': 'Gunpo',
  '부천': 'Bucheon', '고양': 'Goyang', '창원': 'Changwon', '포항': 'Pohang',
  '경주': 'Gyeongju', '전주': 'Jeonju', '청주': 'Cheongju', '천안': 'Cheonan',
};

const KO_EN = [
  ['5시리즈', '5 Series'], ['3시리즈', '3 Series'], ['7시리즈', '7 Series'],
  ['1시리즈', '1 Series'], ['2시리즈', '2 Series'], ['4시리즈', '4 Series'],
  ['6시리즈', '6 Series'], ['8시리즈', '8 Series'], ['시리즈', ' Series'],
  ['GLE-클래스', 'GLE-Class'], ['GLC-클래스', 'GLC-Class'], ['C-클래스', 'C-Class'],
  ['E-클래스', 'E-Class'], ['S-클래스', 'S-Class'], ['A-클래스', 'A-Class'],
  ['B-클래스', 'B-Class'], ['CLA-클래스', 'CLA-Class'], ['CLS-클래스', 'CLS-Class'],
  ['GLA-클래스', 'GLA-Class'], ['GLB-클래스', 'GLB-Class'], ['GLS-클래스', 'GLS-Class'],
  ['G-클래스', 'G-Class'], ['클래스', 'Class'],
  ['플러그인 하이브리드', 'Plug-in Hybrid'], ['플러그인', 'Plug-in'],
  ['하이브리드', 'Hybrid'], ['터보', 'Turbo'], ['투어러', 'Tourer'],
  ['에디션', 'Edition'], ['스포츠', 'Sport'], ['프리미엄', 'Premium'],
  ['럭셔리', 'Luxury'], ['라인', 'Line'], ['익스클루시브', 'Exclusive'],
  ['컴포트', 'Comfort'], ['엘레강스', 'Elegance'], ['아방가르드', 'Avantgarde'],
  ['어드밴스드', 'Advanced'], ['모던', 'Modern'], ['디자인', 'Design'],
  ['패키지', 'Package'], ['팩키지', 'Package'], ['테크', 'Tech'],
  ['세단', 'Sedan'], ['쿠페', 'Coupe'], ['왜건', 'Wagon'],
  ['컨버터블', 'Convertible'], ['카브리올레', 'Cabriolet'], ['해치백', 'Hatchback'],
  ['이노베이션', 'Innovation'], ['인스퍼레이션', 'Inspiration'],
  ['모션', 'Motion'], ['인텔리전트', 'Intelligent'], ['스마트', 'Smart'],
];

export function tr(text) {
  if (!text) return '';
  let s = String(text).trim();

  // Direct manufacturer match
  if (MANUFACTURER_MAP[s]) return MANUFACTURER_MAP[s];

  // Strip "더 뉴", "더뉴", "뉴" prefixes — these mean "The New" in Korean marketing
  s = s.replace(/^더\s*뉴\s+/u, '').replace(/^뉴\s+/u, '').trim();

  // Direct model match (after stripping prefix)
  if (MODELS_MAP[s]) return MODELS_MAP[s];

  // Partial model match: model name followed by variant text
  for (const [ko, en] of Object.entries(MODELS_MAP)) {
    if (s.startsWith(ko + ' ') || s.startsWith(ko + '\t')) {
      s = en + s.slice(ko.length);
      break;
    }
    if (s === ko) { return en; }
  }

  // Apply KO→EN token replacements
  for (const [ko, en] of KO_EN) s = s.split(ko).join(en);

  // Strip any remaining Korean characters
  s = s.replace(/[가-힣ᄀ-ᇿ㄰-㆏]+/gu, '');
  return s.replace(/\s{2,}/g, ' ').trim();
}

export function trCity(text) {
  if (!text) return null;
  const s = String(text).trim();
  // Check city map for any matching Korean city name
  for (const [ko, en] of Object.entries(CITIES_MAP)) {
    if (s.startsWith(ko)) return en;
  }
  // If already English or unknown, return as-is
  return s;
}

export function carPhotoUrl(car, idx = 0) {
  if (Array.isArray(car.Photos) && car.Photos[idx]?.location)
    return 'https://ci.encar.com' + car.Photos[idx].location;
  if (car.Photo)
    return 'https://ci.encar.com' + car.Photo + '001.jpg';
  return null;
}

export function allPhotoUrls(car) {
  if (Array.isArray(car.Photos) && car.Photos.length > 0)
    return car.Photos.map(p => 'https://ci.encar.com' + p.location);
  if (car.Photo)
    return ['https://ci.encar.com' + car.Photo + '001.jpg'];
  return [];
}

export function carYear(car) {
  if (car.FormYear) return String(car.FormYear).slice(0, 4);
  if (!car.Year) return null;
  const s = String(car.Year);
  if (s.length >= 6) return s.slice(0, 4);
  const n = parseInt(s);
  if (n > 100) return String(n);
  return String(n >= 0 && n <= 30 ? 2000 + n : 1900 + n);
}

export function manwonToEur(manwon) {
  if (!manwon) return 0;
  return Math.round(manwon * 10000 * KRW_TO_EUR);
}

export function durresPrice(manwon) { return manwonToEur(manwon) + DELIVERY_DURRES; }
export function pristinePrice(manwon) { return manwonToEur(manwon) + DELIVERY_PRISHTINA; }
export function fmtEur(amount) { return '€' + Math.round(amount).toLocaleString('de-DE'); }
export function fmtKm(km) {
  if (!km && km !== 0) return '—';
  return Number(km).toLocaleString('de-DE') + ' km';
}

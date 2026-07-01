export const FUEL_ALB = {
  '가솔린': 'Benzinë', Gasoline: 'Benzinë',
  '디젤': 'Naftë', Diesel: 'Naftë',
  '전기': 'Elektrik', Electric: 'Elektrik',
  '하이브리드': 'Hibrid', Hybrid: 'Hibrid',
  '가솔린+전기': 'Hibrid (Plug-in)',
  LPG: 'LPG',
};

export const TRANS_ALB = {
  '오토': 'Automatik', A: 'Automatik', Automatic: 'Automatik',
  '수동': 'Manual', M: 'Manual', Manual: 'Manual',
  '세미오토': 'Semi-Automatik', DCT: 'DCT', CVT: 'CVT',
};

export const OPTION_ALB = {
  '썬루프': 'Sunroof',
  '파노라마선루프': 'Çati Panoramike',
  '전동시트(운전)': 'Sedilje Elektrike (Shofer)',
  '전동시트(동승)': 'Sedilje Elektrike (Pasagjer)',
  '열선시트(전)': 'Sedilje të Ngrohura (Para)',
  '열선시트(후)': 'Sedilje të Ngrohura (Pas)',
  '통풍시트(운전)': 'Sedilje me Ajrim (Shofer)',
  '통풍시트(동승)': 'Sedilje me Ajrim (Pasagjer)',
  '메모리시트(운전)': 'Sedilje me Memorje (Shofer)',
  '메모리시트(동승)': 'Sedilje me Memorje (Pasagjer)',
  '네비게이션': 'Navigacion',
  '블루투스': 'Bluetooth',
  '후방카메라': 'Kamera Mbrapa',
  '전방카메라': 'Kamera Përpara',
  '어라운드뷰': 'Kamera 360°',
  '스마트키': 'Çelës i Mençur',
  '전자식사이드브레이크(EPB)': 'Frena Elektrike e Parkimit (EPB)',
  'ABS': 'ABS',
  'TCS': 'Sistem Kundër Rrëshqitjes (TCS)',
  'ESC': 'Kontroll Stabiliteti (ESC)',
  'TPMS': 'Sensor Presioni i Gomave (TPMS)',
  '사이드에어백': 'Airbag Anësor',
  '에어백': 'Airbag',
  '파워윈도우': 'Dritare Elektrike',
  '오토라이트': 'Ndezja Automatike e Dritave',
  '열선핸들': 'Timoni i Ngrohur',
  '전동조절(핸들)': 'Timoni i Rregullueshëm Elektrik',
  '스티어링리모컨': 'Komanda në Timon',
  '전동트렁크': 'Bagazh Elektrik',
  '전동사이드미러': 'Pasqyra Anësore Elektrike',
  '자동주차': 'Parkim Automatik',
  '전방주차센서': 'Sensorë Parkimi (Përpara)',
  '후방주차센서': 'Sensorë Parkimi (Mbrapa)',
  'HUD': 'Head-Up Display',
  '어댑티브크루즈': 'Cruise Control Adaptiv',
  '크루즈컨트롤': 'Cruise Control',
  '차선이탈경보': 'Alarm Largimi nga Shiriti',
  '자동긴급제동': 'Frenazh Emergjent Automatik (AEB)',
  '후측방경보': 'Alarm Anësor Mbrapa (BSD)',
  'ECM미러': 'Pasqyra ECM e Brendshme',
  '자동잠금': 'Mbyllje Elektrike e Dyerve',
  '키리스엔트리': 'Mbyllje Pa Çelës',
  '자동에어컨': 'Klimë Automatike',
  '듀얼에어컨': 'Klimë Duale',
  '이그니션스타트': 'Nisje pa Çelës (Start/Stop)',
  '빌트인캠': 'Kamera e Integruar (Dashcam)',
  '하이패스': 'Kalim Automatik Tarife',
  '360어라운드뷰': 'Kamera 360°',
};

export const COLOR_ALB = {
  '검은색': 'E zezë', '검정': 'E zezë', '블랙': 'E zezë', Black: 'E zezë',
  '흰색': 'E bardhë', '화이트': 'E bardhë', White: 'E bardhë',
  '은색': 'Argjendtë', '실버': 'Argjendtë', Silver: 'Argjendtë',
  '회색': 'Gri', '그레이': 'Gri', Gray: 'Gri', Grey: 'Gri',
  '빨간색': 'E kuqe', '레드': 'E kuqe', Red: 'E kuqe',
  '파란색': 'E kaltër', '블루': 'E kaltër', Blue: 'E kaltër',
  '남색': 'Blu i errët', '네이비': 'Blu i errët', Navy: 'Blu i errët',
  '금색': 'E artë', '골드': 'E artë', Gold: 'E artë',
  '갈색': 'Kafe', '브라운': 'Kafe', Brown: 'Kafe',
  '주황색': 'Portokalli', '오렌지': 'Portokalli', Orange: 'Portokalli',
  '노란색': 'E verdhë', Yellow: 'E verdhë',
  '녹색': 'E gjelbër', Green: 'E gjelbër',
  '보라색': 'Vjollcë', Purple: 'Vjollcë',
};

export const DAMAGE_CODES = {
  N: { label: 'Nderrim', desc: 'Pjesë e Ndërruar', color: '#ef4444' },
  R: { label: 'Riparim', desc: 'Llamarinë / Panel', color: '#f97316' },
  K: { label: 'Korrozion', desc: 'Ndryshkim', color: '#ca8a04' },
  G: { label: 'Gervishtje', desc: 'Dëmtim sipërfaqësor', color: '#eab308' },
  P: { label: 'Parregullsi', desc: 'Deformim i vogël', color: '#6b7280' },
  // Encar internal codes mapped to ours
  W: { label: 'Nderrim', desc: 'Pjesë e Ndërruar', color: '#ef4444' },
  C: { label: 'Riparim', desc: 'Llamarinë / Panel', color: '#f97316' },
  U: { label: 'Korrozion', desc: 'Ndryshkim', color: '#ca8a04' },
  A: { label: 'Gervishtje', desc: 'Dëmtim sipërfaqësor', color: '#eab308' },
  T: { label: 'Parregullsi', desc: 'Deformim i vogël', color: '#6b7280' },
};

export function translateFuel(val) { return FUEL_ALB[val] || val || '—'; }
export function translateTrans(val) { return TRANS_ALB[val] || val || '—'; }
export function translateOption(val) { return OPTION_ALB[val] || val; }
export function translateColor(val) {
  if (!val) return '—';
  return COLOR_ALB[val] || val;
}

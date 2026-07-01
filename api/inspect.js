// Encar inspection / accident report — real endpoint, proxy-hardened
// Endpoint: https://api.encar.com/legacy/usedcar/inspect/{id}
// Returns structured English-keyed JSON: { master, inner, outer, inspectAccidentSummary, ... }
// Encar blocks Vercel/datacenter IPs, so we race a direct call against CORS proxies
// (same resilient pattern as api/cars.js) — first valid response wins, instantly.

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
  const s = String(raw).replace(/\D/g, '');
  if (s.length === 8) return `${s.slice(6, 8)}.${s.slice(4, 6)}.${s.slice(0, 4)}`;
  if (s.length === 6) return `${s.slice(4, 6)}.${s.slice(0, 4)}`;
  return String(raw);
}

// ── outer panel → normalised damage code ──────────────────────────────────────
// outer[field] is null | ["CHANGE"] | ["PLATE"] | ["CORROSION"] | ["SCRATCH"] | ["UNEVEN"]
function outerCode(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
  const v = arr[0];
  if (v === 'CHANGE' || v === 'EXCHANGE') return 'N';
  if (v === 'PLATE' || v === 'PLATING') return 'R';
  if (v === 'CORROSION') return 'K';
  if (v === 'SCRATCH') return 'G';
  if (v === 'UNEVEN') return 'P';
  return null;
}

// Map legacy outer keys → our panel key names
function parseOuter(outer) {
  if (!outer) return null;
  const map = {
    frontBumper:       null,                        // not in outer (it's grade 1 exterior)
    hood:              outerCode(outer.hood),
    frontLeftFender:   outerCode(outer.frontFenderLeft),
    frontRightFender:  outerCode(outer.frontFenderRight),
    frontLeftDoor:     outerCode(outer.frontDoorLeft),
    frontRightDoor:    outerCode(outer.frontDoorRight),
    rearLeftDoor:      outerCode(outer.rearDoorLeft),
    rearRightDoor:     outerCode(outer.rearDoorRight),
    rearLeftPanel:     outerCode(outer.quarterPanelLeft),
    rearRightPanel:    outerCode(outer.quarterPanelRight),
    trunk:             outerCode(outer.trunkLead),
    rearBumper:        null,                        // grade 1 exterior
    roof:              outerCode(outer.roofPanel),
  };
  const hasAny = Object.values(map).some(v => v !== null);
  return hasAny ? map : null;
}

// ── inner → internalInspection groups ─────────────────────────────────────────
// Values: "GOOD" | "NONE" | "ADEQUATE" | "DEFECT" | "ABNORMAL" | "LEAK" | "EXISTS" | null

function conditionToAlb(val) {
  if (!val) return { status: 'Nuk ka', ok: true };
  switch (val) {
    case 'GOOD':     return { status: 'Në rregull', ok: true };
    case 'NONE':     return { status: 'Nuk ka rrjedhje', ok: true };
    case 'ADEQUATE': return { status: 'Adekuate', ok: true };
    case 'DEFECT':   return { status: 'Defekt', ok: false };
    case 'ABNORMAL': return { status: 'Jo normal', ok: false };
    case 'LEAK':     return { status: 'Ka rrjedhje', ok: false };
    case 'EXISTS':   return { status: 'Ka problem', ok: false };
    default:         return { status: val, ok: true };
  }
}

const INNER_GROUPS = [
  {
    label: 'Motori',
    fields: [
      { key: 'motorOperationStatus',                 name: 'Gjendja e funksionimit (në punë boshe)' },
      { key: 'motorOilLeakLockerArmCover',           name: 'Rrjedhja e vajit rreth kapakut të kokës' },
      { key: 'motorOilLeakCylinderHeaderGasket',     name: 'Rrjedhja e vajit në kokën e motorit' },
      { key: 'motorOilLeakOilFan',                   name: 'Rrjedhja e vajit rreth bllokut dhe karterit' },
      { key: 'motorOilFlowRate',                     name: 'Qarkullimi i vajit' },
      { key: 'motorWaterLeakCylinderHeaderGasket',   name: 'Rrjedhja e ujit ftohës nga izoluesi i kokës' },
      { key: 'motorWaterLeakPump',                   name: 'Rrjedhja e ujit ftohës nga pompa e ujit' },
      { key: 'motorWaterLeakRadiator',               name: 'Rrjedhja e ujit ftohës nga radiatori' },
      { key: 'motorWaterLeakCoolingRate',            name: 'Sasia e ujit ftohës (antifreeze)' },
    ],
  },
  {
    label: 'Transmisioni',
    fields: [
      { key: 'transAutoOilLeakage',                  name: 'Rrjedhja e vajit nga transmisioni (auto)' },
      { key: 'transAutoOilFlowAndCondition',         name: 'Qarkullimi i vajit të transmisionit' },
      { key: 'transAutoStatus',                      name: 'Gjendja e funksionimit (transmision)' },
      { key: 'transManualOilLeakage',                name: 'Rrjedhja e vajit (manual)' },
      { key: 'transManualGearShifting',              name: 'Ndërrimi i marsheve' },
      { key: 'powerConstantVelocityJoint',           name: 'Nyja CVJ (boshti i vazhdueshëm)' },
      { key: 'powerWeightedShaftAndBearing',         name: 'Boshti dhe kushinetat' },
      { key: 'powerDifferentialGear',                name: 'Diferenciali' },
    ],
  },
  {
    label: 'Drejtimi',
    fields: [
      { key: 'steeringPowerOilLeakage',              name: 'Rrjedhje e vajit nga koka e timonit' },
      { key: 'steeringGear',                         name: 'Ingranazhet drejtuese dhe sistemi elektrik' },
      { key: 'steeringJoint',                        name: 'Nyja e drejtimit' },
      { key: 'steeringTieRodEndAndBallJoint',        name: 'Koka e shufrës dhe nyja sferike' },
      { key: 'steeringPowerHighPressureHose',        name: 'Tubi i presionit të lartë të drejtimit' },
    ],
  },
  {
    label: 'Frenimi',
    fields: [
      { key: 'brakeMasterCylinderOilLeakage',        name: 'Rrjedhja e vajit nga cilindri kryesor' },
      { key: 'brakeOilLeakage',                      name: 'Rrjedhja e vajit nga tubat e frenimit' },
      { key: 'brakeSystemStatus',                    name: 'Gjendja e sistemit të frenimit' },
    ],
  },
  {
    label: 'Elektrika',
    fields: [
      { key: 'electricGeneratorOutput',              name: 'Alternatori' },
      { key: 'electricStarterMotor',                 name: 'Startuesi i motorit' },
      { key: 'electricWiperMotorFunction',           name: 'Motori i fshësave të xhamave' },
      { key: 'electricIndoorBlowerMotor',            name: 'Motori i ventilatorit të kabinës' },
      { key: 'electricRadiatorFanMotor',             name: 'Motori i ventilatorit të radiatorit' },
      { key: 'electricWindowMotor',                  name: 'Motori i xhamave elektrikë' },
    ],
  },
  {
    label: 'Karburanti',
    fields: [
      { key: 'otherFuelLeaks',                       name: 'Rrjedhja e karburantit' },
    ],
  },
];

function parseInner(inner) {
  if (!inner) return [];
  const result = [];
  for (const group of INNER_GROUPS) {
    const items = [];
    for (const { key, name } of group.fields) {
      const val = inner[key];
      if (val === undefined || val === null) continue;
      items.push({ name, ...conditionToAlb(val) });
    }
    if (items.length) result.push({ group: group.label, items });
  }
  return result;
}

// ── inspectAccidentSummary → diagnosisData ────────────────────────────────────
const PANEL_LABEL_MAP = {
  hood:              'Kapuç',
  frontBumper:       'Parakolp i përparmë',
  frontLeftDoor:     'Portë para e majtë',
  frontRightDoor:    'Portë para e djathtë',
  rearLeftDoor:      'Portë mbrapa e majtë',
  rearRightDoor:     'Portë mbrapa e djathtë',
  rearLeftPanel:     'Panel mbrapa i majtë',
  rearRightPanel:    'Panel mbrapa i djathtë',
  trunk:             'Kapaku i bagazhit',
  rearBumper:        'Parakolp mbrapa',
  roof:              'Çati',
  frontLeftFender:   'Parafango para i majtë',
  frontRightFender:  'Parafango para i djathtë',
};

const CODE_LABEL = { N: 'Zëvendësuar', R: 'Riparuar', K: 'Korrozion', G: 'Gërvishtje', P: 'Parregullsi' };

function buildDiagnosisData(accidentSummary, damage, outer) {
  // Main frame items from accident summary
  const frameItems = [];
  if (accidentSummary?.mainFrameList?.length > 0) {
    for (const f of accidentSummary.mainFrameList) {
      frameItems.push({ label: f.nm || f.name || f, status: 'Ka dëmtim', ok: false });
    }
  }

  // Also parse structural outer panels (frame-level)
  const FRAME_OUTER_KEYS = {
    frontPanel:          'Paneli i Përparmë / i Brendshëm',
    crossMember:         'Tërthorja qendrore',
    insidePanelLeft:     'Paneli i brendshëm majtë',
    insidePanelRight:    'Paneli i brendshëm djathtë',
    rearPanel:           'Paneli i pasmë / Dyshemeja e bagazhit',
    trunkFloor:          'Dyshemeja e bagazhit',
    frontSideMemberLeft: 'Anësor para majtë',
    frontSideMemberRight:'Anësor para djathtë',
    rearSideMemberLeft:  'Anësor mbrapa majtë',
    rearSideMemberRight: 'Anësor mbrapa djathtë',
    frontWheelHouseLeft: 'Strehimi rrotës para majtë',
    frontWheelHouseRight:'Strehimi rrotës para djathtë',
    rearWheelHouseLeft:  'Strehimi rrotës mbrapa majtë',
    rearWheelHouseRight: 'Strehimi rrotës mbrapa djathtë',
    pillarPanelFrontLeft:'Shtylla A majtë',
    pillarPanelMiddleLeft:'Shtylla B majtë',
    pillarPanelRearLeft: 'Shtylla C majtë',
    pillarPanelFrontRight:'Shtylla A djathtë',
    pillarPanelMiddleRight:'Shtylla B djathtë',
    pillarPanelRearRight: 'Shtylla C djathtë',
    packageTray:         'Tabaka paketimi',
    dashPanel:           'Paneli i instrumenteve',
    floorPanel:          'Dyshemeja e kabinës',
  };

  if (outer) {
    for (const [key, label] of Object.entries(FRAME_OUTER_KEYS)) {
      const arr = outer[key];
      if (arr && Array.isArray(arr) && arr.length > 0) {
        const code = outerCode(arr);
        if (code) {
          frameItems.push({ label, status: CODE_LABEL[code] || code, ok: false });
        }
      }
    }
  }

  const panelItems = Object.entries(PANEL_LABEL_MAP).map(([key, label]) => {
    const code = damage?.[key] ?? null;
    return { label, status: code ? (CODE_LABEL[code] || code) : 'normal', ok: !code };
  });

  const hasAccident = accidentSummary?.accident === 'EXISTS';
  return {
    verdict: hasAccident ? 'me_aksidente' : 'pa_aksidente',
    comment: null,
    frameItems,
    panelItems,
  };
}

// ── Resilient fetch of the legacy inspect endpoint ────────────────────────────
// Races a direct call against CORS proxies. A 404 means "no inspection record"
// (resolves with a sentinel); any other success returns the parsed legacy JSON.
const NO_INSPECTION = Symbol('no-inspection');

function looksLikeInspect(obj) {
  return obj && typeof obj === 'object' &&
    ('master' in obj || 'inner' in obj || 'outer' in obj || 'inspectAccidentSummary' in obj);
}

async function fetchLegacyInspect(id, signal) {
  const url = `https://api.encar.com/legacy/usedcar/inspect/${id}`;
  const enc = encodeURIComponent(url);

  const validate = obj => {
    if (obj === NO_INSPECTION) return obj;
    if (!looksLikeInspect(obj)) throw new Error('not an inspect payload');
    return obj;
  };

  const direct = async () => {
    const r = await fetch(url, { headers: BROWSER_HEADERS, signal });
    if (r.status === 404) return NO_INSPECTION;
    if (!r.ok) throw new Error(`direct HTTP ${r.status}`);
    return validate(await r.json());
  };
  const allorigins = async () => {
    const r = await fetch(`https://api.allorigins.win/get?url=${enc}`, { signal });
    if (!r.ok) throw new Error(`allorigins HTTP ${r.status}`);
    const o = await r.json();
    if (o?.status?.http_code === 404) return NO_INSPECTION;
    if (!o?.contents) throw new Error('allorigins empty');
    return validate(JSON.parse(o.contents));
  };
  const corsproxy = async () => {
    const r = await fetch(`https://corsproxy.io/?${enc}`, { signal });
    if (r.status === 404) return NO_INSPECTION;
    if (!r.ok) throw new Error(`corsproxy HTTP ${r.status}`);
    return validate(await r.json());
  };
  const codetabs = async () => {
    const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${enc}`, { signal });
    if (r.status === 404) return NO_INSPECTION;
    if (!r.ok) throw new Error(`codetabs HTTP ${r.status}`);
    return validate(await r.json());
  };

  return Promise.any([direct(), allorigins(), corsproxy(), codetabs()]);
}

const NO_INSPECTION_PAYLOAD = {
  apiError: false,
  noInspection: true,
  damage: null,
  repairHistory: [],
  historyAvailable: false,
  inspectionDate: null,
  ownerCount: null,
  accidentCount: null,
  internalInspection: [],
  usageHistory: { isRental: false, isCommercial: false },
  ownerHistory: [],
  diagnosisData: { verdict: 'pa_aksidente', comment: null, frameItems: [], panelItems: [] },
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
    data = await fetchLegacyInspect(id, ctrl.signal);
  } catch (err) {
    clearTimeout(timer);
    const detail = err instanceof AggregateError
      ? err.errors.map(e => e.message).join(' | ')
      : err.message;
    return res.status(200).json({
      apiError: true,
      damage: null,
      repairHistory: [],
      historyAvailable: false,
      inspectionDate: null,
      ownerCount: null,
      accidentCount: null,
      internalInspection: [],
      usageHistory: null,
      ownerHistory: [],
      diagnosisData: null,
      _error: detail,
    });
  }
  clearTimeout(timer);
  try { ctrl.abort(); } catch {}

  if (data === NO_INSPECTION) {
    return res.status(200).json(NO_INSPECTION_PAYLOAD);
  }

  const { master, inner, outer, carSaleDto, inspectAccidentSummary } = data;

  const accidentSummary = inspectAccidentSummary || data.inspectionAccidentSummary;
  const hasAccident = accidentSummary?.accident === 'EXISTS';
  const accidentCount = hasAccident ? 1 : 0;

  const damage = parseOuter(outer);
  const internalInspection = parseInner(inner);
  const inspectionDate = fmtDate(master?.issuedt || master?.rgsdt);

  const carState = carSaleDto?.carAddition;
  const usageHistory = {
    isRental: carState?.carRentType != null || false,
    isCommercial: carState?.carSaleType === 'COMMERCIAL' || false,
  };

  const diagnosisData = buildDiagnosisData(accidentSummary, damage, outer);

  return res.status(200).json({
    apiError: false,
    noInspection: false,
    damage,
    repairHistory: [],
    historyAvailable: false,
    inspectionDate,
    ownerCount: null,
    accidentCount,
    internalInspection,
    usageHistory,
    ownerHistory: [],
    diagnosisData,
    // Extra fields for richer display
    master: {
      hasAccident: master?.accyn === 'Y',
      simpleRepair: master?.simpleRepair === 'Y',
      mileage: master?.mileage,
      engineCheck: master?.enginecheck === 'Y',
      transmissionCheck: master?.trnscheck === 'Y',
      waterlogged: master?.waterlogyn === 'Y',
      transmission: master?.transmission,
      carState: master?.carstate,
      issueDate: fmtDate(master?.issuedt),
    },
    accidentSummary: {
      accident: accidentSummary?.accident,
      simpleRepair: accidentSummary?.simpleRepair,
      exterior1rank: accidentSummary?.exterior1rank,
      exterior2rank: accidentSummary?.exterior2rank,
      mainFramework: accidentSummary?.mainFramework,
    },
  });
}

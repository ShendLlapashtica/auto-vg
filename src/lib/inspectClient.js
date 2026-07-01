// Hybrid: tries server-side /api/inspect first (no CORS, proper headers),
// falls back to browser-side CORS-proxy fetch using the user's residential IP.

function normalizeCode(raw) {
  if (!raw || raw === 'X' || raw === 'N' || raw === '0' || raw === 'N/A') return null;
  const s = String(raw).trim();
  if (s === 'W' || s.includes('교환')) return 'N';
  if (s === 'C' || s.includes('판금')) return 'R';
  if (s === 'U' || s.includes('부식')) return 'K';
  if (s === 'A' || s.includes('흠집')) return 'G';
  if (s === 'T' || s.includes('요철')) return 'P';
  if (s === 'Y') return 'R';
  return null;
}

function parseCarCondition(raw) {
  if (!raw) return null;
  const candidates = [
    raw?.Exterior, raw?.CarCondition?.Exterior, raw?.Inspection?.Exterior,
    raw?.CarCondition, raw?.Condition, raw,
  ].filter(c => c && typeof c === 'object');
  if (!candidates.length) return null;

  const PANEL_KEYS = {
    frontBumper:      ['FrontBumper', '앞범퍼'],
    hood:             ['Hood', '보닛'],
    frontLeftFender:  ['FrontLeftFender', '앞왼쪽휀더'],
    frontRightFender: ['FrontRightFender', '앞오른쪽휀더'],
    frontLeftDoor:    ['FrontLeftDoor', '앞왼쪽도어'],
    frontRightDoor:   ['FrontRightDoor', '앞오른쪽도어'],
    rearLeftDoor:     ['RearLeftDoor', '뒤왼쪽도어'],
    rearRightDoor:    ['RearRightDoor', '뒤오른쪽도어'],
    rearLeftPanel:    ['RearLeftFender', 'RearLeftPanel', '뒤왼쪽휀더'],
    rearRightPanel:   ['RearRightFender', 'RearRightPanel', '뒤오른쪽휀더'],
    trunk:            ['Trunk', '트렁크'],
    rearBumper:       ['RearBumper', '뒤범퍼'],
    roof:             ['Roof', '루프'],
  };

  const result = {};
  let hasAnyKey = false;
  for (const [panelKey, aliases] of Object.entries(PANEL_KEYS)) {
    let found = null;
    for (const ext of candidates) {
      for (const alias of aliases) {
        if (ext[alias] !== undefined) { found = ext[alias]; break; }
      }
      if (found !== undefined && found !== null) break;
    }
    if (found !== undefined && found !== null) {
      hasAnyKey = true;
      if (typeof found === 'string') {
        result[panelKey] = normalizeCode(found);
      } else if (typeof found === 'object') {
        result[panelKey] =
          (found.ExchangeYN === 'Y' || found.Exchange === 'Y') ? 'N' :
          (found.PlatingYN  === 'Y' || found.Plating  === 'Y') ? 'R' :
          (found.CorrosionYN === 'Y') ? 'K' :
          (found.ScarchYN    === 'Y') ? 'G' :
          (found.UnevenYN    === 'Y') ? 'P' : null;
      } else {
        result[panelKey] = null;
      }
    } else {
      result[panelKey] = null;
    }
  }
  return hasAnyKey ? result : null;
}

const PART_MAP = {
  '앞범퍼': 'Bufera Përpara', '뒤범퍼': 'Bufera Mbrapa',
  '보닛': 'Kapuç', '트렁크': 'Bagazh', '루프': 'Çati',
  '앞왼쪽휀더': 'Parafango Para Majtë', '앞오른쪽휀더': 'Parafango Para Djathas',
  '앞왼쪽도어': 'Portë Para Majtë', '앞오른쪽도어': 'Portë Para Djathas',
  '뒤왼쪽도어': 'Portë Mbrapa Majtë', '뒤오른쪽도어': 'Portë Mbrapa Djathas',
  '뒤왼쪽휀더': 'Panel Mbrapa Majtë', '뒤오른쪽휀더': 'Panel Mbrapa Djathas',
};
const WORK_MAP = {
  '판금': 'Ripare kallaji', '도장': 'Rilyerje', '교환': 'Zëvendësim',
  '부식': 'Korrozion', '흠집': 'Gërvishtje', '수리': 'Riparim', '복원': 'Rivendosje',
};

function trMap(s, map) {
  if (!s) return s;
  for (const [kr, alb] of Object.entries(map)) {
    if (String(s).includes(kr)) return alb;
  }
  return s;
}

function fmtDate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/\D/g, '');
  if (s.length === 8) return `${s.slice(6,8)}.${s.slice(4,6)}.${s.slice(0,4)}`;
  if (s.length === 6) return `${s.slice(4,6)}.${s.slice(0,4)}`;
  return String(raw);
}

function extractRepairHistory(raw) {
  const candidates = [
    raw?.CarHistryList, raw?.CarHistoryList,
    raw?.InspectCondition?.CarHistryList, raw?.Inspection?.CarHistryList,
    raw?.CarCondition?.CarHistryList, raw?.AccidentHistoryList,
    raw?.HistoryList, raw?.RepairList, raw?.AccidentList,
  ].filter(a => Array.isArray(a) && a.length > 0);

  const historyAvailable = candidates.length > 0;
  const list = !historyAvailable ? [] : candidates[0].map(h => {
    const rawParts = Array.isArray(h.PerfParts || h.Parts || h.PartList)
      ? (h.PerfParts || h.Parts || h.PartList) : [];
    return {
      date:        fmtDate(h.PerfDateTime || h.DateTime || h.InsuranceDate || h.Date),
      type:        trMap(h.WorkType || h.AccidentType || h.Type, WORK_MAP) || null,
      totalCost:   h.WorkCost || h.TotalCost || h.RepairCost || h.Cost || null,
      insurance:   h.InsuranceApplyYN === 'Y' || h.Insurance === 'Y',
      unconfirmed: h.ConfirmedYN === 'N' || h.Confirmed === false || h.ConfirmStatus === '미확인',
      parts: rawParts.map(p => ({
        part: trMap(p.PartName || p.Name || p.Part || '', PART_MAP) || '—',
        work: trMap(p.WorkType || p.Work || p.Type || '', WORK_MAP) || '',
        cost: p.WorkCost || p.Cost || p.Price || null,
      })),
    };
  });
  return { list, historyAvailable };
}

function extractUsageHistory(raw) {
  const src = raw?.CarUsageHistory || raw?.UsageHistory || raw?.CarCondition?.Usage || {};
  return {
    isRental:
      src.TaxiUsedYn === 'Y' || src.RentalUsedYn === 'Y' ||
      raw?.IsRentalCar === true || raw?.RentalCar === 'Y' || raw?.TaxiCar === 'Y' ||
      raw?.CarCondition?.TaxiUsedYn === 'Y' || raw?.CarCondition?.RentalUsedYn === 'Y',
    isCommercial:
      src.CommercialUsedYn === 'Y' || raw?.IsCommercialCar === true ||
      raw?.CommercialCar === 'Y' || raw?.CarCondition?.CommercialUsedYn === 'Y',
  };
}

function extractOwnerHistory(raw) {
  const candidates = [
    raw?.OwnerHistory, raw?.CarHistory?.OwnerHistory,
    raw?.CarCondition?.OwnerHistory, raw?.OwnerChanges, raw?.OwnerChangeHistory,
  ].filter(a => Array.isArray(a) && a.length > 0);
  if (!candidates.length) return [];
  return candidates[0].map(o => ({
    date: fmtDate(o.Date || o.ChangeDate || o.TransferDate || o.OwnerChangeDate || ''),
    event: 'Nderrim pronari',
  })).filter(o => o.date);
}

function translateCondition(val) {
  if (val === undefined || val === null) return { status: 'Nuk ka', ok: true };
  const s = String(val).trim();
  if (s === 'X' || s === '정상' || s === '없음' || s === '0' || s === 'Normal') return { status: 'Në rregull', ok: true };
  if (s === 'Y' || s === '불량' || s === '있음' || s === '1') return { status: 'Defekt', ok: false };
  if (s.includes('누유없음') || s.includes('누수없음')) return { status: 'Nuk ka rrjedhje', ok: true };
  if (s.includes('누유있음')) return { status: 'Ka rrjedhje vaji', ok: false };
  if (s.includes('누수있음')) return { status: 'Ka rrjedhje uji', ok: false };
  if (s.includes('정상') || s.includes('없음')) return { status: 'Në rregull', ok: true };
  if (s.includes('있음') || s.includes('불량')) return { status: 'Defekt', ok: false };
  return { status: s, ok: true };
}

const INSPECT_LABELS = {
  WorkingStatusAtIdle: 'Gjendja e funksionimit (në punë boshe)',
  IdleStatus: 'Gjendja e funksionimit (në punë boshe)',
  OilLeakAroundCylinderHeadCover: 'Rrjedhja e vajit rreth kapakut të kokës',
  HeadCoverOilLeak: 'Rrjedhja e vajit rreth kapakut të kokës',
  OilLeakAroundCylinderHead: 'Rrjedhja e vajit në kokën e motorit',
  HeadOilLeak: 'Rrjedhja e vajit në kokën e motorit',
  OilLeakAroundCylinderBlockOilPan: 'Rrjedhja e vajit rreth bllokut dhe karterit',
  BlockOilPanOilLeak: 'Rrjedhja e vajit rreth bllokut dhe karterit',
  OilCirculation: 'Qarkullimi i vajit',
  CoolantLeakAroundCylinderHeadGasket: 'Rrjedhja e ujit ftohës nga izoluesi i kokës',
  HeadGasketCoolantLeak: 'Rrjedhja e ujit ftohës nga izoluesi i kokës',
  CoolantLeakAroundWaterPump: 'Rrjedhja e ujit ftohës nga pompa e ujit',
  WaterPumpCoolantLeak: 'Rrjedhja e ujit ftohës nga pompa e ujit',
  CoolantLeakAroundRadiator: 'Rrjedhja e ujit ftohës nga radiatori',
  RadiatorCoolantLeak: 'Rrjedhja e ujit ftohës nga radiatori',
  CoolantQuantity: 'Sasia e ujit ftohës (antifreeze)',
  TransmissionOilLeak: 'Rrjedhja e vajit nga transmisioni',
  OilLeak: 'Rrjedhja e vajit',
  TransmissionOilCirculation: 'Qarkullimi i vajit të transmisionit',
  Differential: 'Diferenciali',
  DriveShaftAndBearings: 'Boshti dhe kushinetat',
  DriveShaftBearings: 'Boshti dhe kushinetat',
  SteeringGearboxOilLeak: 'Rrjedhje e vajit nga koka e timonit',
  GearboxOilLeak: 'Rrjedhje e vajit nga koka e timonit',
  ElectricSteeringGear: 'Ingranazhet drejtuese dhe sistemi elektrik',
  ElectricSteering: 'Ingranazhet drejtuese dhe sistemi elektrik',
  SteeringJoint: 'Nyja e drejtimit',
  TieRodBallJoint: 'Koka e shufrës dhe nyja sferike',
  TieRodEndBallJoint: 'Koka e shufrës dhe nyja sferike',
  HighPressureHose: 'Tubi i presionit të lartë të drejtimit',
  MasterCylinderOilLeak: 'Rrjedhja e vajit nga cilindri kryesor',
  BrakePipeOilLeak: 'Rrjedhja e vajit nga tubat e frenimit',
  BrakeLineOilLeak: 'Rrjedhja e vajit nga tubat e frenimit',
  BrakeCondition: 'Gjendja e sistemit të frenimit',
  BrakingForce: 'Gjendja e sistemit të frenimit',
  Alternator: 'Alternatori',
  StarterMotor: 'Startuesi i motorit',
  WiperMotor: 'Motori i fshësave të xhamave',
  BlowerMotor: 'Motori i ventilatorit të kabinës',
  InteriorFanMotor: 'Motori i ventilatorit të kabinës',
  RadiatorFanMotor: 'Motori i ventilatorit të radiatorit',
  PowerWindowMotor: 'Motori i xhamave elektrikë',
  WindowMotor: 'Motori i xhamave elektrikë',
  FuelLeak: 'Rrjedhja e karburantit',
  FuelLeakage: 'Rrjedhja e karburantit',
};

const GROUP_DEFS = [
  { aliases: ['Engine', 'engine', '원동기'], label: 'Motori', fields: [
    ['WorkingStatusAtIdle', 'IdleStatus'],
    ['OilLeakAroundCylinderHeadCover', 'HeadCoverOilLeak'],
    ['OilLeakAroundCylinderHead', 'HeadOilLeak'],
    ['OilLeakAroundCylinderBlockOilPan', 'BlockOilPanOilLeak'],
    ['OilCirculation'],
    ['CoolantLeakAroundCylinderHeadGasket', 'HeadGasketCoolantLeak'],
    ['CoolantLeakAroundWaterPump', 'WaterPumpCoolantLeak'],
    ['CoolantLeakAroundRadiator', 'RadiatorCoolantLeak'],
    ['CoolantQuantity'],
  ]},
  { aliases: ['Transmission', 'transmission', '변속기'], label: 'Transmisioni', fields: [
    ['TransmissionOilLeak', 'OilLeak'],
    ['WorkingStatusAtIdle', 'IdleStatus'],
    ['TransmissionOilCirculation', 'OilCirculation'],
    ['Differential'],
    ['DriveShaftAndBearings', 'DriveShaftBearings'],
  ]},
  { aliases: ['Steering', 'steering', '조향'], label: 'Drejtimi', fields: [
    ['SteeringGearboxOilLeak', 'GearboxOilLeak'],
    ['ElectricSteeringGear', 'ElectricSteering'],
    ['SteeringJoint'],
    ['TieRodBallJoint', 'TieRodEndBallJoint'],
    ['HighPressureHose'],
  ]},
  { aliases: ['Brake', 'brake', '제동', 'Brakes'], label: 'Frenimi', fields: [
    ['MasterCylinderOilLeak'],
    ['BrakePipeOilLeak', 'BrakeLineOilLeak'],
    ['BrakeCondition', 'BrakingForce'],
  ]},
  { aliases: ['Electrical', 'electrical', '전기', 'Electric'], label: 'Elektrika', fields: [
    ['Alternator'],
    ['StarterMotor'],
    ['WiperMotor'],
    ['BlowerMotor', 'InteriorFanMotor'],
    ['RadiatorFanMotor'],
    ['PowerWindowMotor', 'WindowMotor'],
  ]},
  { aliases: ['Fuel', 'fuel', '연료'], label: 'Karburanti', fields: [
    ['FuelLeak', 'FuelLeakage'],
  ]},
];

function extractInternalInspection(raw) {
  const sources = [
    raw?.InspectCondition, raw?.InspectionCondition,
    raw?.Inspection?.InspectCondition, raw?.CarCondition?.InspectCondition,
    raw?.PerfCheck, raw?.PerformanceCheck, raw?.InspectResults,
  ].filter(c => c && typeof c === 'object' && !Array.isArray(c));
  if (!sources.length) return [];

  const result = [];
  for (const def of GROUP_DEFS) {
    let groupObj = null;
    for (const src of sources) {
      for (const alias of def.aliases) {
        if (src[alias] && typeof src[alias] === 'object') { groupObj = src[alias]; break; }
      }
      if (groupObj) break;
    }
    if (!groupObj) continue;

    let items = [];
    if (Array.isArray(groupObj)) {
      items = groupObj.map(item => {
        const rawName = item.ItemName || item.Name || '';
        const rawVal  = item.ItemStatus || item.Status || item.Value || 'X';
        return { name: INSPECT_LABELS[rawName] || rawName, ...translateCondition(rawVal) };
      }).filter(i => i.name);
    } else {
      for (const fieldAliases of def.fields) {
        let val;
        for (const f of fieldAliases) {
          if (groupObj[f] !== undefined) { val = groupObj[f]; break; }
        }
        if (val === undefined) continue;
        const labelKey = fieldAliases.find(f => INSPECT_LABELS[f]);
        items.push({ name: INSPECT_LABELS[labelKey] || fieldAliases[0], ...translateCondition(val) });
      }
    }
    if (items.length) result.push({ group: def.label, items });
  }
  return result;
}

const PANEL_LABEL_MAP_C = {
  hood: 'Kapuç', frontBumper: 'Parakolp i përparmë',
  frontLeftDoor: 'Portë para e majtë', frontRightDoor: 'Portë para e djathtë',
  rearLeftDoor: 'Portë mbrapa e majtë', rearRightDoor: 'Portë mbrapa e djathtë',
  rearLeftPanel: 'Panel mbrapa i majtë', rearRightPanel: 'Panel mbrapa i djathtë',
  trunk: 'Kapaku i bagazhit', rearBumper: 'Parakolp mbrapa',
  roof: 'Çati', frontLeftFender: 'Parafango para i majtë', frontRightFender: 'Parafango para i djathtë',
};
const CODE_LABEL_C = { N: 'Zëvendësuar', R: 'Riparuar', K: 'Korrozion', G: 'Gërvishtje', P: 'Parregullsi' };

function extractDiagnosisData(raw, damage, accidentCount) {
  const COMMENT_KEYS = [
    'SpecialNotes','SpecialNote','Remarks','InspectMemo',
    'DiagnoseComment','DiagnosisComment','CheckMemo','Comment','PerfMemo','InspectorComment',
    'MechanicNote','InspectResult',
  ];
  let comment = null;
  for (const k of COMMENT_KEYS) {
    const v = raw?.[k] ?? raw?.InspectCondition?.[k] ?? raw?.CarCondition?.[k];
    if (v && typeof v === 'string' && v.trim()) { comment = v.trim(); break; }
  }

  const FRAME_SOURCES = [
    raw?.InspectCondition?.Body, raw?.InspectCondition?.Frame,
    raw?.InspectCondition?.BodyFrame, raw?.Diagnosis?.Frame,
    raw?.CarCondition?.Frame, raw?.FrameCondition,
  ].filter(Boolean);
  const FRAME_FIELD_MAP = {
    FrontPanel:  'Paneli i Përparmë / i Brendshëm',
    WheelHouse:  'Strehimi i rrotëve (para/prapa)',
    PillarPanel: 'Paneli i Shtyllave A/B · Dollapi · Dyshemeja',
    SidePanel:   'Pragu anësor / Paneli i katërt',
    RearPanel:   'Paneli i pasmë / Dyshemeja e bagazhit',
    SideMember:  'Anësor · Tërthor · Tabaka paketimi',
  };
  const frameItems = [];
  for (const src of FRAME_SOURCES) {
    for (const [key, label] of Object.entries(FRAME_FIELD_MAP)) {
      if (src[key] !== undefined) {
        const { status, ok } = translateCondition(src[key]);
        frameItems.push({ label, status, ok });
      }
    }
    if (frameItems.length) break;
  }

  const panelItems = Object.entries(PANEL_LABEL_MAP_C).map(([key, label]) => {
    const code = damage?.[key] ?? null;
    return { label, status: code ? (CODE_LABEL_C[code] || code) : 'normal', ok: !code };
  });

  return {
    verdict: (accidentCount ?? 0) === 0 ? 'pa_aksidente' : 'me_aksidente',
    comment,
    frameItems,
    panelItems,
  };
}

function parseRaw(car) {
  const conditionData = car.Inspection || car.CarCondition || car.Condition || car;
  const damage        = parseCarCondition(conditionData);
  const accidentCount = car.AccidentCount ?? car.AccidentHistoryCount ?? null;
  const { list: repairHistory, historyAvailable } = extractRepairHistory(car);
  return {
    damage,
    repairHistory,
    historyAvailable,
    inspectionDate:     fmtDate(car.InspectionDate || car.PerfDate || car.InspectDate || null),
    ownerCount:         car.OwnerCount ?? car.OwnerChanges ?? car.OwnerHistory?.length ?? null,
    accidentCount,
    internalInspection: extractInternalInspection(car),
    usageHistory:       extractUsageHistory(car),
    ownerHistory:       extractOwnerHistory(car),
    diagnosisData:      extractDiagnosisData(car, damage, accidentCount),
    apiError:           false,
  };
}

const API_ERROR = {
  apiError: true, damage: null, repairHistory: [], historyAvailable: false,
  inspectionDate: null, ownerCount: null, accidentCount: null,
  internalInspection: [], usageHistory: null, ownerHistory: [], diagnosisData: null,
};

export async function fetchInspect(id) {
  // 1. Server-side primary (Node.js: no CORS, proper browser headers, parallel dual-fetch)
  try {
    const r = await fetch(`/api/inspect?id=${id}`);
    if (r.ok) {
      const data = await r.json();
      if (!data.apiError) return data;
    }
  } catch {}

  // 2. Browser-side fallback (user's residential IP bypasses Vercel datacenter blocks)
  //    Run two independent chains: car data + inspection/perform data, then merge.
  const viewUrl  = `https://api.encar.com/search/car/view/general?carid=${id}`;
  const perfUrl  = `https://api.encar.com/inspection/car/perform/${id}`;
  const histUrl1 = `https://api.encar.com/cars/carhistory?carid=${id}`;
  const histUrl2 = `https://api.encar.com/car/history?carid=${id}`;
  const ev  = encodeURIComponent(viewUrl);
  const ep  = encodeURIComponent(perfUrl);
  const eh1 = encodeURIComponent(histUrl1);
  const eh2 = encodeURIComponent(histUrl2);

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);

  const guard = p => p.then(v => { if (!v || typeof v !== 'object') throw new Error('null'); return v; });
  const ao  = (enc, sig) => fetch(`https://api.allorigins.win/get?url=${enc}`, { signal: sig })
    .then(r => r.json()).then(o => o?.contents ? JSON.parse(o.contents) : null);
  const cp  = (enc, sig) => fetch(`https://corsproxy.io/?${enc}`, { signal: sig }).then(r => r.json());
  const ct  = (enc, sig) => fetch(`https://api.codetabs.com/v1/proxy?quest=${enc}`, { signal: sig }).then(r => r.json());
  const tp  = (url,  sig) => fetch(`https://thingproxy.freeboard.io/fetch/${url}`, { signal: sig }).then(r => r.json());

  const unwrapCar = d => {
    const car = Array.isArray(d?.SearchResults) && d.SearchResults.length > 0 ? d.SearchResults[0] : d;
    if (!car || typeof car !== 'object') throw new Error('no car');
    return car;
  };
  const unwrapAny = d => {
    if (!d || typeof d !== 'object') throw new Error('null');
    if (Array.isArray(d.SearchResults) && d.SearchResults.length > 0) return d.SearchResults[0];
    return d;
  };

  const [carRes, perfRes, histRes1, histRes2] = await Promise.allSettled([
    Promise.any([
      guard(ao(ev, ctrl.signal)).then(unwrapCar),
      guard(cp(ev, ctrl.signal)).then(unwrapCar),
      guard(ct(ev, ctrl.signal)).then(unwrapCar),
      guard(tp(viewUrl, ctrl.signal)).then(unwrapCar),
    ]),
    Promise.any([
      guard(ao(ep, ctrl.signal)).then(unwrapAny),
      guard(cp(ep, ctrl.signal)).then(unwrapAny),
      guard(tp(perfUrl, ctrl.signal)).then(unwrapAny),
    ]),
    Promise.any([
      guard(ao(eh1, ctrl.signal)).then(unwrapAny),
      guard(cp(eh1, ctrl.signal)).then(unwrapAny),
      guard(ct(eh1, ctrl.signal)).then(unwrapAny),
      guard(tp(histUrl1, ctrl.signal)).then(unwrapAny),
    ]),
    Promise.any([
      guard(ao(eh2, ctrl.signal)).then(unwrapAny),
      guard(cp(eh2, ctrl.signal)).then(unwrapAny),
      guard(ct(eh2, ctrl.signal)).then(unwrapAny),
      guard(tp(histUrl2, ctrl.signal)).then(unwrapAny),
    ]),
  ]);

  clearTimeout(timer);
  try { ctrl.abort(); } catch {}

  const carRaw   = carRes.status   === 'fulfilled' ? carRes.value   : null;
  const perfRaw  = perfRes.status  === 'fulfilled' ? perfRes.value  : null;
  const histRaw1 = histRes1.status === 'fulfilled' ? histRes1.value : null;
  const histRaw2 = histRes2.status === 'fulfilled' ? histRes2.value : null;

  if (!carRaw && !perfRaw && !histRaw1 && !histRaw2) return API_ERROR;

  const raw = { ...(carRaw || {}) };
  for (const supplement of [histRaw1, histRaw2, perfRaw]) {
    if (!supplement) continue;
    for (const [k, v] of Object.entries(supplement)) {
      if (v == null) continue;
      const cur = raw[k];
      if (cur == null || (Array.isArray(cur) && cur.length === 0)) raw[k] = v;
    }
  }

  return parseRaw(raw);
}

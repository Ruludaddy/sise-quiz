// ============================================================
// KAMIS 일별 도,소매 가격정보 (공공데이터포털 aT)
//   엔드포인트: https://apis.data.go.kr/B552845/perDay/price   (검증 완료)
//   방식: odcloud cond[필드::연산] · 날짜 필드 exmn_ymd(YYYYMMDD) · 가격 exmn_dd_prc
//
//   ※ 이 API는 cond 를 느슨하게 주면 0건이 나와요.
//      반드시 (se,ctgry,item,vrty,grd,sgg,mrkt) "전체 튜플" + 날짜범위로 조회하고,
//      범위 안에서 가장 최신 조사일자 행을 골라요. (주말·공휴일엔 조사가 없어 최신 영업일 사용)
//
// env:
//   DATAGO_SERVICE_KEY  (필수) 공공데이터포털 인증키. Encoding/Decoding 둘 다 허용(자동 판단)
//   KAMIS_ITEM          (선택) 프리셋 이름 (기본 'rice')
//   개별 코드 override:  KAMIS_SE_CD/CTGRY_CD/ITEM_CD/VRTY_CD/GRD_CD/SGG_CD/MRKT_CD
//   KAMIS_QUESTION      (선택) 문제 문구 직접 지정
//   KAMIS_LOOKBACK_DAYS (선택, 기본 12) 최신 데이터 탐색 범위(일)
// ============================================================

const BASE = 'https://apis.data.go.kr/B552845/perDay/price';

// 미리보기 샘플값으로 동작 검증된 프리셋. 다른 품목은 KAMIS 품목코드표/미리보기 기본값으로 추가하세요.
const PRESETS = {
  // 서울 양곡도매 · 쌀 20kg · 상품 · 중도매
  rice: { se_cd: '02', ctgry_cd: '100', item_cd: '111', vrty_cd: '01', grd_cd: '04', sgg_cd: '1101', mrkt_cd: '0110253' },
};

function toYmd(dashed) {
  return dashed.replace(/-/g, '');
}

function addDaysYmd(dashed, delta) {
  const d = new Date(dashed + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function keyParam(key) {
  // Encoding 키(%XX 포함)면 그대로, Decoding 키면 인코딩 (이중 인코딩 방지)
  const looksEncoded =
    process.env.DATAGO_KEY_ENCODED === 'true' ||
    (process.env.DATAGO_KEY_ENCODED !== 'false' && /%[0-9A-Fa-f]{2}/.test(key));
  return looksEncoded ? key : encodeURIComponent(key);
}

function buildUrl(key, params) {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${BASE}?serviceKey=${keyParam(key)}&${qs}`;
}

const num = (v) => {
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : NaN;
};

export async function getKamisQuestion(date /* 'YYYY-MM-DD' */, itemKey) {
  const key = process.env.DATAGO_SERVICE_KEY;
  if (!key) throw new Error('DATAGO_SERVICE_KEY 필요 (공공데이터포털 인증키)');

  const preset = PRESETS[itemKey || process.env.KAMIS_ITEM || 'rice'] || PRESETS.rice;
  const codes = {
    se_cd: process.env.KAMIS_SE_CD || preset.se_cd,
    ctgry_cd: process.env.KAMIS_CTGRY_CD || preset.ctgry_cd,
    item_cd: process.env.KAMIS_ITEM_CD || preset.item_cd,
    vrty_cd: process.env.KAMIS_VRTY_CD || preset.vrty_cd,
    grd_cd: process.env.KAMIS_GRD_CD || preset.grd_cd,
    sgg_cd: process.env.KAMIS_SGG_CD || preset.sgg_cd,
    mrkt_cd: process.env.KAMIS_MRKT_CD || preset.mrkt_cd,
  };
  const lookback = parseInt(process.env.KAMIS_LOOKBACK_DAYS || '12', 10);

  const url = buildUrl(key, {
    pageNo: 1,
    numOfRows: 100,
    'cond[exmn_ymd::GTE]': addDaysYmd(date, -lookback),
    'cond[exmn_ymd::LTE]': toYmd(date),
    'cond[se_cd::EQ]': codes.se_cd,
    'cond[ctgry_cd::EQ]': codes.ctgry_cd,
    'cond[item_cd::EQ]': codes.item_cd,
    'cond[vrty_cd::EQ]': codes.vrty_cd,
    'cond[grd_cd::EQ]': codes.grd_cd,
    'cond[sgg_cd::EQ]': codes.sgg_cd,
    'cond[mrkt_cd::EQ]': codes.mrkt_cd,
    returnType: 'JSON',
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
  const json = await res.json();

  const resultCode = json?.response?.header?.resultCode;
  if (resultCode !== '0' && resultCode !== '00') {
    throw new Error(`KAMIS 응답 오류: ${json?.response?.header?.resultMsg ?? resultCode}`);
  }

  const raw = json?.response?.body?.items?.item ?? [];
  const rows = (Array.isArray(raw) ? raw : [raw]).filter((r) => r && num(r.exmn_dd_prc) > 0);
  if (rows.length === 0) throw new Error('KAMIS: 기간 내 유효한 가격 행이 없어요.');

  // 가장 최신 조사일자 행 선택
  rows.sort((a, b) => String(b.exmn_ymd).localeCompare(String(a.exmn_ymd)));
  const row = rows[0];
  const price = num(row.exmn_dd_prc);

  const sizeUnit = `${row.unit_sz ?? ''}${row.unit ?? ''}`.trim(); // 예: '20kg'
  const survey = String(row.exmn_ymd); // YYYYMMDD

  const question =
    process.env.KAMIS_QUESTION ||
    `오늘 ${row.item_nm}${sizeUnit ? ` ${sizeUnit}` : ''} 도매가는?`;

  return {
    date, // 오늘 날짜(클라이언트 날짜키 기준). 실제 조사일은 note에 표기
    question,
    answer: price,
    unit: '원',
    min: Math.max(1, Math.floor(price * 0.5)),
    max: Math.ceil(price * 2),
    source: 'KAMIS 농산물유통정보(공공데이터포털)',
    sourceUrl: 'https://www.kamis.or.kr',
    note: `${survey.slice(0, 4)}-${survey.slice(4, 6)}-${survey.slice(6, 8)} · ${row.mrkt_nm ?? ''} · ${row.grd_nm ?? ''} · ${row.se_nm ?? ''}`.replace(/ · +$/,''),
  };
}

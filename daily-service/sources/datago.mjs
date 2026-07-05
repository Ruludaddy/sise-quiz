// ============================================================
// 공공데이터포털(data.go.kr) 어댑터 — aT/KAMIS 도매가 등 범용
//
// data.go.kr 데이터셋마다 엔드포인트·요청변수·응답필드가 달라서, 이 어댑터는
// "환경변수로 설정 + probe로 필드 확인" 방식으로 어떤 데이터셋에도 붙게 만들었어요.
//
// 필수 env:
//   DATAGO_SERVICE_KEY   마이페이지 인증키 (Decoding 키 권장)
//   DATAGO_ENDPOINT      데이터셋 상세의 요청 URL 경로 (예: https://apis.data.go.kr/B552895/xxx/yyy)
//
// 선택 env:
//   DATAGO_KEY_ENCODED   'true'면 키를 그대로(이미 인코딩됨), 'false'면 encodeURIComponent. 미지정 시 %패턴으로 자동판단
//   DATAGO_PARAMS        추가 요청변수 "a=1&b=2" (데이터셋 고유 파라미터)
//   DATAGO_DATE_PARAM    날짜 파라미터명 (지정 시 YYYYMMDD로 전달)
//   DATAGO_NUM_ROWS      numOfRows (기본 100)
//   DATAGO_ITEM_NAME     문제로 낼 품목명 필터 (예: 배추)
//   DATAGO_PRICE_FIELD   가격 필드명 (probe로 확인 후 지정, 미지정 시 휴리스틱)
//   DATAGO_QUESTION      문제 문구 override
//   DATAGO_SOURCE_NAME   출처 표기 (기본 '공공데이터포털(data.go.kr)')
// ============================================================

export function buildDataGoUrl(date) {
  const key = process.env.DATAGO_SERVICE_KEY;
  const endpoint = process.env.DATAGO_ENDPOINT;
  if (!key || !endpoint) throw new Error('DATAGO_SERVICE_KEY / DATAGO_ENDPOINT 환경변수가 필요해요.');

  // 인증키: Encoding 키(%포함)면 그대로, Decoding 키면 인코딩 (이중 인코딩 방지)
  const looksEncoded =
    process.env.DATAGO_KEY_ENCODED === 'true' ||
    (process.env.DATAGO_KEY_ENCODED !== 'false' && /%[0-9A-Fa-f]{2}/.test(key));
  const serviceKey = looksEncoded ? key : encodeURIComponent(key);

  const parts = [];
  if (!/[?&]numOfRows=/.test(endpoint)) parts.push(`numOfRows=${process.env.DATAGO_NUM_ROWS || '100'}`);
  if (!/[?&]pageNo=/.test(endpoint)) parts.push('pageNo=1');
  if (!/[?&](_type|type|dataType|resultType)=/.test(endpoint)) parts.push('_type=json');
  const dateParam = process.env.DATAGO_DATE_PARAM;
  if (dateParam) parts.push(`${dateParam}=${date.replace(/-/g, '')}`);
  if (process.env.DATAGO_PARAMS) parts.push(process.env.DATAGO_PARAMS);

  const sep = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${sep}serviceKey=${serviceKey}&${parts.join('&')}`;
}

function toNumber(v) {
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : NaN;
}

// data.go.kr 표준 봉투(response.body.items.item) 우선, 없으면 첫 객체배열 탐색
function findItemsArray(node, depth = 0) {
  if (depth > 7 || node == null) return null;
  if (Array.isArray(node)) return node.length && node.every((x) => x && typeof x === 'object') ? node : null;
  if (typeof node === 'object') {
    for (const k of ['item', 'items', 'row', 'OIL', 'list', 'data', 'body', 'response']) {
      if (k in node) {
        const found = findItemsArray(node[k], depth + 1);
        if (found) return found;
      }
    }
    for (const k of Object.keys(node)) {
      const found = findItemsArray(node[k], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function readPrice(item) {
  const field = process.env.DATAGO_PRICE_FIELD;
  if (field && item[field] != null) return toNumber(item[field]);
  const key = Object.keys(item).find((k) => /(price|가격|amt|경락|dpr1|avg)/i.test(k) && toNumber(item[k]) > 0);
  return key ? toNumber(item[key]) : NaN;
}

export async function getDataGoQuestion(date) {
  const url = buildDataGoUrl(date);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`data.go.kr HTTP ${res.status}`);

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('JSON 아님 — _type=json 파라미터를 확인하거나 XML 파서가 필요해요. (probe로 원문 확인)');
  }

  let rows = findItemsArray(json) || [];
  const itemName = process.env.DATAGO_ITEM_NAME;
  if (itemName) {
    rows = rows.filter((r) => Object.values(r).some((v) => typeof v === 'string' && v.includes(itemName)));
  }
  const hit = rows[0];
  if (hit == null) throw new Error('응답에서 품목 행을 못 찾았어요. (DATAGO_ITEM_NAME/필드 확인 — probe 권장)');

  const price = readPrice(hit);
  if (!(price > 0)) throw new Error('가격 필드 파싱 실패. DATAGO_PRICE_FIELD를 probe 결과로 지정하세요.');

  const label = itemName || '오늘의 품목';
  return {
    date,
    question: process.env.DATAGO_QUESTION || `오늘 ${label} 도매가는?`,
    answer: price,
    unit: '원',
    source: process.env.DATAGO_SOURCE_NAME || '공공데이터포털(data.go.kr)',
    sourceUrl: 'https://www.data.go.kr',
    note: `${date} 기준`,
  };
}

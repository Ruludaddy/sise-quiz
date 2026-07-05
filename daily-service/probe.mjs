// ============================================================
// 응답 필드 확정용 probe
//  · 실제 API를 호출해 "응답 구조(경로 + 필드명 + 샘플값)"를 그대로 덤프해요.
//  · 여기서 본 필드명으로 sources/*.mjs 의 파싱부를 확정하면 돼요.
//
// 사용:
//   DATAGO_SERVICE_KEY=... node probe.mjs kamis    # aT 일별 도소매가격 perDay/price (검증됨)
//   OPINET_API_KEY=...     node probe.mjs opinet
//   DATAGO_SERVICE_KEY=... DATAGO_ENDPOINT=... node probe.mjs datago
//   node probe.mjs url "https://.../foo?bar=1"     # 임의 URL 덤프 (data.go.kr 샘플 URL 붙여넣기 편함)
//
// 선택 env (kamis): KAMIS_ITEM_CD/CTGRY_CD/VRTY_CD/GRD_CD/SGG_CD/MRKT_CD/SE_CD, KAMIS_GTE, KAMIS_LTE
// 선택 env (data.go.kr): datago.mjs 상단 주석 참고
// ============================================================
import { buildDataGoUrl } from './sources/datago.mjs';

const mode = (process.argv[2] || 'fallback').toLowerCase();

function todayKST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

// JSON 구조를 경로 형태로 펼쳐 필드명을 한눈에 보여줘요.
function describe(value, path = '$', depth = 0, out = []) {
  if (depth > 5) return out;
  if (Array.isArray(value)) {
    out.push(`${path}  ▸ Array(len=${value.length})`);
    if (value.length > 0) describe(value[0], `${path}[0]`, depth + 1, out);
  } else if (value != null && typeof value === 'object') {
    out.push(`${path}  ▸ { ${Object.keys(value).join(', ')} }`);
    for (const k of Object.keys(value)) describe(value[k], `${path}.${k}`, depth + 1, out);
  } else {
    const s = JSON.stringify(value);
    out.push(`${path} = ${s != null && s.length > 60 ? s.slice(0, 60) + '…' : s}`);
  }
  return out;
}

async function dump(url) {
  console.log('▶ GET', url.replace(/(cert_key|code|serviceKey)=[^&]+/gi, '$1=***'));
  const res = await fetch(url);
  console.log('◀ HTTP', res.status, res.headers.get('content-type'));
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.log('\n[JSON 아님 — 원문 앞부분]\n' + text.slice(0, 1200));
    return;
  }
  console.log('\n[응답 구조]');
  console.log(describe(json).join('\n'));
}

async function main() {
  if (mode === 'kamis') {
    // 공공데이터포털 aT 일별 도소매가격 (perDay/price). DATAGO_SERVICE_KEY 필요.
    const key = process.env.DATAGO_SERVICE_KEY;
    if (!key) throw new Error('DATAGO_SERVICE_KEY 필요 (공공데이터포털 인증키)');
    const enc = /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
    const end = new Date(todayKST() + 'T00:00:00Z');
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 12);
    const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
    const cond = {
      pageNo: 1,
      numOfRows: 10,
      'cond[exmn_ymd::GTE]': process.env.KAMIS_GTE || ymd(start),
      'cond[exmn_ymd::LTE]': process.env.KAMIS_LTE || ymd(end),
      'cond[se_cd::EQ]': process.env.KAMIS_SE_CD || '02',
      'cond[ctgry_cd::EQ]': process.env.KAMIS_CTGRY_CD || '100',
      'cond[item_cd::EQ]': process.env.KAMIS_ITEM_CD || '111',
      'cond[vrty_cd::EQ]': process.env.KAMIS_VRTY_CD || '01',
      'cond[grd_cd::EQ]': process.env.KAMIS_GRD_CD || '04',
      'cond[sgg_cd::EQ]': process.env.KAMIS_SGG_CD || '1101',
      'cond[mrkt_cd::EQ]': process.env.KAMIS_MRKT_CD || '0110253',
      returnType: 'JSON',
    };
    const qs = Object.entries(cond)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    await dump(`https://apis.data.go.kr/B552845/perDay/price?serviceKey=${enc}&${qs}`);
  } else if (mode === 'opinet') {
    const code = process.env.OPINET_API_KEY;
    if (!code) throw new Error('OPINET_API_KEY 필요');
    const base = process.env.OPINET_BASE || 'https://www.opinet.co.kr/api/avgAllPrice.do';
    await dump(`${base}?out=json&code=${encodeURIComponent(code)}`);
  } else if (mode === 'datago') {
    await dump(buildDataGoUrl(todayKST()));
  } else if (mode === 'url') {
    const url = process.argv[3];
    if (!url) throw new Error('URL을 인자로 주세요: node probe.mjs url "https://..."');
    await dump(url);
  } else {
    console.log('사용법: node probe.mjs <kamis|opinet|datago|url>  (README의 "응답 필드 확정" 참고)');
  }
}

main().catch((e) => {
  console.error('probe 실패:', e.message);
  process.exit(1);
});

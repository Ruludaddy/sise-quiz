// ============================================================
// 오피넷(한국석유공사) OpenAPI 어댑터 — 전국 평균 유가
//
// ⚠️ 실제 사용 전 확인:
//   1) https://www.opinet.co.kr → OpenAPI 신청 후 인증키(code) 발급
//   2) 응답 필드(PRODCD/PRICE 등)는 규격서로 검증하세요.
//      휘발유 PRODCD 'B027', 경유 'D047' (확인 필요)
//   3) 이용약관·출처 표기 의무 확인 (체크리스트 ②)
// ============================================================

const BASE = 'https://www.opinet.co.kr/api/avgAllPrice.do';

export async function getOpinetQuestion(date) {
  const code = process.env.OPINET_API_KEY;
  if (!code) throw new Error('OPINET_API_KEY 환경변수가 필요해요.');

  const res = await fetch(`${BASE}?out=json&code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error(`OPINET HTTP ${res.status}`);
  const json = await res.json();

  const rows = json?.RESULT?.OIL ?? [];
  const gasoline = rows.find((r) => r.PRODCD === 'B027') ?? rows[0];
  const price = Math.round(parseFloat(gasoline?.PRICE));
  if (!(price > 0)) throw new Error('OPINET 가격 파싱 실패 (응답 필드 확인 필요)');

  return {
    date,
    question: '오늘 전국 평균 휘발유 가격은? (1L)',
    answer: price,
    unit: '원',
    min: Math.floor(price * 0.7),
    max: Math.ceil(price * 1.3),
    source: '오피넷(한국석유공사)',
    sourceUrl: 'https://www.opinet.co.kr',
    note: `${date} 전국 평균 · 1L`,
  };
}

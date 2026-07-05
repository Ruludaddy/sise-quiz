// ============================================================
// 오늘의 문제 일일 생성 배치
//
// 사용:
//   DAILY_SOURCE=fallback node generate-daily.mjs   # 키 없이 동작 (테스트/폴백)
//   DAILY_SOURCE=kamis    node generate-daily.mjs    # KAMIS 농산물 도매가 (KAMIS_CERT_KEY/ID 필요)
//   DAILY_SOURCE=opinet   node generate-daily.mjs    # 오피넷 유가 (OPINET_API_KEY 필요)
//
// 산출물: out/{YYYY-MM-DD}.json  +  out/today.json
//   → 이 폴더를 정적 호스팅(CDN/버킷)에 매일 업로드하고,
//     미니앱의 VITE_DAILY_ENDPOINT 를 그 공개 URL로 설정하세요.
//   → 크론 예: 매일 00:10 KST  `10 0 * * *`
// ============================================================
import fs from 'node:fs/promises';
import path from 'node:path';
import { getKamisQuestion } from './sources/kamis.mjs';
import { getOpinetQuestion } from './sources/opinet.mjs';
import { getDataGoQuestion } from './sources/datago.mjs';

const OUT_DIR = process.env.OUT_DIR || 'out';
const SOURCE = (process.env.DAILY_SOURCE || 'fallback').toLowerCase();

function todayKST() {
  // en-CA 로케일 → 'YYYY-MM-DD'
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

async function pickFallback(date) {
  const raw = await fs.readFile(new URL('./fallback-questions.json', import.meta.url), 'utf8');
  const list = JSON.parse(raw);
  // 날짜를 시드로 결정적 선택 — 같은 날은 항상 같은 문제
  const seed = [...date].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const item = list[seed % list.length];
  return {
    ...item,
    date,
    source: item.source ?? '자체 큐레이션(예시)',
    note: item.note ?? `${date} 기준(예시값)`,
  };
}

function validate(q) {
  return (
    q != null &&
    typeof q.question === 'string' &&
    q.question.length > 0 &&
    typeof q.answer === 'number' &&
    q.answer > 0 &&
    typeof q.date === 'string'
  );
}

async function build() {
  const date = todayKST();
  let q;
  try {
    if (SOURCE === 'kamis') q = await getKamisQuestion(date);
    else if (SOURCE === 'opinet') q = await getOpinetQuestion(date);
    else if (SOURCE === 'datago') q = await getDataGoQuestion(date);
    else q = await pickFallback(date);
  } catch (err) {
    console.error(`[daily] source '${SOURCE}' 실패 → 폴백 사용:`, err.message);
    q = await pickFallback(date);
  }

  if (!validate(q)) {
    throw new Error('생성된 문제가 스키마를 만족하지 않아요. (schema.json 참고)');
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const payload = JSON.stringify(q, null, 2);
  await fs.writeFile(path.join(OUT_DIR, `${date}.json`), payload);
  await fs.writeFile(path.join(OUT_DIR, 'today.json'), payload);

  console.log(`[daily] source=${SOURCE} → ${OUT_DIR}/${date}.json, ${OUT_DIR}/today.json`);
  console.log(payload);
}

build().catch((err) => {
  console.error('[daily] 실패:', err);
  process.exit(1);
});

// ============================================================
// 메인 게임 문제 은행(questions.json) 생성
//   = 자체 제작 시드(questions-seed.json) + KAMIS 실시세 품목(튜플 아는 것만)
//   → out/questions.json 로 게시. 앱이 fetch 해서 한 판 5문제를 샘플링해요.
//
// 시드만 늘리면 앱 재빌드 없이 문제가 무한정 늘어나요.
// KAMIS 실시세 품목을 추가하려면 sources/kamis.mjs 의 PRESETS 에 튜플을 넣고
// KAMIS_BANK_ITEMS 에 프리셋 이름을 콤마로 지정하세요. (기본: rice)
// ============================================================
import fs from 'node:fs/promises';
import { getKamisQuestion } from './sources/kamis.mjs';

const OUT_DIR = process.env.OUT_DIR || 'out';
const KAMIS_ITEMS = (process.env.KAMIS_BANK_ITEMS || 'rice')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function todayKST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

function valid(x) {
  return x != null && typeof x.q === 'string' && x.q.length > 0 && typeof x.a === 'number' && x.a > 0;
}

async function build() {
  const date = todayKST();
  const seed = JSON.parse(await fs.readFile(new URL('./questions-seed.json', import.meta.url), 'utf8'));
  const bank = seed.filter(valid).map((x) => ({ q: x.q, a: x.a, diff: x.diff || 2 }));

  // KAMIS 실시세 섞기 (튜플 아는 프리셋만)
  if (process.env.DATAGO_SERVICE_KEY) {
    for (const key of KAMIS_ITEMS) {
      try {
        const q = await getKamisQuestion(date, key);
        bank.push({ q: q.question, a: q.answer, diff: 2, live: true });
      } catch (e) {
        console.error(`[bank] KAMIS '${key}' 건너뜀:`, e.message);
      }
    }
  } else {
    console.warn('[bank] DATAGO_SERVICE_KEY 없음 → 실시세 없이 시드만 사용');
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const payload = JSON.stringify({ date, count: bank.length, questions: bank });
  await fs.writeFile(`${OUT_DIR}/questions.json`, payload);
  console.log(`[bank] wrote ${OUT_DIR}/questions.json — ${bank.length}문제 (실시세 ${bank.filter((b) => b.live).length}개)`);
}

build().catch((e) => {
  console.error('[bank] 실패:', e);
  process.exit(1);
});

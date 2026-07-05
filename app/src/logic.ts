// ============================================================
// 순수 게임 로직 (프로토타입의 scoreOf / fbOf / pick5 / won 이식)
//  · 렌더링·SDK와 분리해 테스트하기 쉽게 유지해요.
// ============================================================

export interface Question {
  /** 문제(상품/서비스명) */
  q: string;
  /** 실제(정답) 가격 — ⚠️ 예시값. 출시 전 검증값/공공데이터로 교체 (체크리스트 ①) */
  a: number;
  /** 입력 하한(참고용) */
  min: number;
  /** 입력 상한(참고용) */
  max: number;
  /** 난이도 태그 1(쉬움)~3(어려움) */
  diff?: 1 | 2 | 3;
  /** 문제 아래 보조 설명 */
  note?: string;
}

export const won = (n: number): string => '₩' + Math.round(n).toLocaleString('ko-KR');

/** 정답률 점수: score = max(0, round(100 − 오차율%)) */
export function scoreOf(guess: number, actual: number): number {
  const err = Math.abs(guess - actual) / actual;
  return Math.max(0, Math.round(100 - err * 100));
}

export type ScoreClass = 'sc-hi' | 'sc-mid' | 'sc-lo';
export interface Feedback {
  text: string;
  cls: ScoreClass;
}

export function fbOf(s: number): Feedback {
  if (s >= 95) return { text: '정확 도사!', cls: 'sc-hi' };
  if (s >= 80) return { text: '감각 좋아요', cls: 'sc-hi' };
  if (s >= 60) return { text: '그럴싸해요', cls: 'sc-mid' };
  return { text: '다음 감 잡아봐요', cls: 'sc-lo' };
}

export function average(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * 한 판 5문제 선택. 난이도 easy 2 · mid 2 · hard 1 을 뽑고
 * easy → hard 순으로 정렬해 판이 진행될수록 어려워지게 배치해요. (기획서 3.4)
 */
export function pick5(pool: Question[]): Question[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const r = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const easy = shuffled.filter((x) => x.diff === 1);
  const mid = shuffled.filter((x) => x.diff === 2);
  const hard = shuffled.filter((x) => x.diff === 3);

  const draft: Question[] = [];
  if (easy.length) draft.push(r(easy), r(easy));
  if (mid.length) draft.push(r(mid), r(mid));
  if (hard.length) draft.push(r(hard));

  // 중복 제거
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const it of draft) {
    if (!seen.has(it.q)) {
      seen.add(it.q);
      out.push(it);
    }
  }
  // 부족하면 풀 전체에서 보충
  while (out.length < 5 && out.length < pool.length) {
    const c = r(shuffled);
    if (!seen.has(c.q)) {
      seen.add(c.q);
      out.push(c);
    }
  }
  // 판이 진행될수록 어려워지도록 정렬
  return out.sort((a, b) => (a.diff ?? 2) - (b.diff ?? 2));
}

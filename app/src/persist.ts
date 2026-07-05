// ============================================================
// 영속화 계층 (Storage + 날짜키)  — 지침 5-6
//  · 오늘의 문제 완료 여부: 서버 시간 KST 날짜키로 1일 1회 판정
//  · 최고 평균 점수 기록
// 사용자별로 분리하려면 getUserKey() 를 키 프리픽스로 사용하세요. (아래 주석 참고)
// ============================================================
import { Store, getTodayKey } from './toss/sdk';

const K_TODAY_DONE = 'sise-quiz:today-done-date';
const K_BEST_AVG = 'sise-quiz:best-average';

/** 오늘(서버 KST 기준) 이미 오늘의 문제를 풀었는지 */
export async function isTodayDone(): Promise<boolean> {
  const [saved, today] = await Promise.all([Store.getItem(K_TODAY_DONE), getTodayKey()]);
  return saved === today;
}

/** 오늘의 문제 완료 표시 (오늘 날짜 저장) */
export async function markTodayDone(): Promise<void> {
  const today = await getTodayKey();
  await Store.setItem(K_TODAY_DONE, today);
}

export async function getBestAverage(): Promise<number> {
  const v = await Store.getItem(K_BEST_AVG);
  const n = v == null ? 0 : parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

/** 이번 판 평균이 기존 최고 기록보다 높으면 갱신하고, 최종 최고 기록을 반환 */
export async function saveBestAverage(avg: number): Promise<number> {
  const best = await getBestAverage();
  if (avg > best) {
    await Store.setItem(K_BEST_AVG, String(avg));
    return avg;
  }
  return best;
}

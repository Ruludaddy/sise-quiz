// ============================================================
// 오늘의 문제 클라이언트 로더
//  · daily-service 배치가 게시한 정적 JSON을 fetch 해요. (계약: daily-service/schema.json)
//  · 서버시간 KST 날짜키로 오늘 파일을 우선 조회하고, 실패 시 today.json → 그래도 실패면 throw.
//  · 최종 폴백(번들 예시 문제)은 호출부(App)에서 처리해요.
// ============================================================
import type { Question } from './logic';
import { getTodayKey } from './toss/sdk';

// 배포 시 app/.env 의 VITE_DAILY_ENDPOINT 로 게시 URL을 주입하세요.
const DEFAULT_ENDPOINT = 'https://ruludaddy.github.io/sise-quiz'; // GitHub Pages 게시 URL
const ENDPOINT = (import.meta.env.VITE_DAILY_ENDPOINT ?? DEFAULT_ENDPOINT).replace(/\/+$/, '');

export interface DailyQuestion {
  date: string;
  question: string;
  answer: number;
  unit?: string;
  min?: number;
  max?: number;
  source?: string;
  sourceUrl?: string;
  note?: string;
}

function isValid(d: unknown): d is DailyQuestion {
  if (d == null || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  return typeof o.question === 'string' && o.question.length > 0 && typeof o.answer === 'number' && o.answer > 0;
}

function toQuestion(d: DailyQuestion): Question {
  const min = d.min ?? Math.max(1, Math.floor(d.answer * 0.2));
  const max = d.max ?? Math.ceil(d.answer * 3);
  const src = d.source ? ` · ${d.source}` : '';
  return {
    q: d.question,
    a: d.answer,
    min,
    max,
    note: (d.note ?? `${d.date} 기준`) + src,
  };
}

/**
 * 메인 게임 문제 은행(questions.json)을 불러와요. (자체 제작 + 실시세 혼합)
 * 실패 시 throw → 호출부에서 번들 POOL로 폴백.
 */
export async function fetchQuestionBank(): Promise<Question[]> {
  const res = await fetch(`${ENDPOINT}/questions.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('question bank fetch failed');
  const data: unknown = await res.json();
  const list = (data as { questions?: unknown[] })?.questions;
  if (!Array.isArray(list)) throw new Error('invalid bank');

  const out: Question[] = [];
  for (const raw of list) {
    const it = raw as { q?: unknown; a?: unknown; diff?: unknown };
    if (typeof it.q === 'string' && it.q.length > 0 && typeof it.a === 'number' && it.a > 0) {
      const a = it.a;
      const diff = it.diff === 1 || it.diff === 2 || it.diff === 3 ? it.diff : undefined;
      out.push({ q: it.q, a, min: Math.max(1, Math.floor(a * 0.2)), max: Math.ceil(a * 3), diff });
    }
  }
  if (out.length < 5) throw new Error('bank too small');
  return out;
}

export async function fetchTodayQuestion(): Promise<Question> {
  const date = await getTodayKey();
  const candidates = [`${ENDPOINT}/${date}.json`, `${ENDPOINT}/today.json`];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data: unknown = await res.json();
      if (!isValid(data)) continue;
      // today.json 이 과거 날짜면 스킵 (날짜별 파일이 우선)
      if (url.endsWith('today.json') && data.date && data.date !== date) continue;
      return toQuestion(data);
    } catch {
      // 다음 후보 시도
    }
  }
  throw new Error('오늘의 문제를 불러오지 못했어요.');
}

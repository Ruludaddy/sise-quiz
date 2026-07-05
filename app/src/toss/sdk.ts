// ============================================================
// 앱인토스 web-framework SDK 얇은 래퍼
//
//  · 모든 호출은 try/catch 로 감싸고, 토스 환경이 아닐 때(로컬 브라우저 등)는
//    안전한 폴백으로 동작하게 해요. → UI 개발을 브라우저에서도 빠르게 반복 가능.
//  · 실제 검증은 반드시 샌드박스 앱 / 토스앱(QR)에서 진행하세요.
// ============================================================
import {
  getAnonymousKey,
  Storage as TossStorage,
  getServerTime,
  requestReview as tossRequestReview,
} from '@apps-in-toss/web-framework';

// ---- 로컬 폴백 저장소 (토스 Storage 불가 시) ----
function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* no-op */
  }
}
function lsRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

// ---- Storage (토스 네이티브 저장소 우선, 실패 시 localStorage) ----
export const Store = {
  async getItem(key: string): Promise<string | null> {
    try {
      const v = await TossStorage.getItem(key);
      return v ?? null;
    } catch {
      return lsGet(key);
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await TossStorage.setItem(key, value);
    } catch {
      lsSet(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await TossStorage.removeItem(key);
    } catch {
      lsRemove(key);
    }
  },
};

// ---- 사용자 식별키 (비게임: getAnonymousKey) ----
const ANON_FALLBACK_KEY = 'sise-quiz:anon-fallback-id';

export async function getUserKey(): Promise<string> {
  try {
    const result = await getAnonymousKey();
    if (result != null && typeof result === 'object' && result.type === 'HASH') {
      return result.hash;
    }
    // 'INVALID_CATEGORY' | 'ERROR' | undefined → 폴백
  } catch {
    /* 폴백 */
  }
  let id = lsGet(ANON_FALLBACK_KEY);
  if (id == null) {
    id = 'local-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    lsSet(ANON_FALLBACK_KEY, id);
  }
  return id;
}

// ---- 서버 시간 (치팅 방지 · 오늘의 문제 날짜 기준) ----
export async function getServerNow(): Promise<number> {
  try {
    const isSupported = (getServerTime as { isSupported?: () => boolean }).isSupported;
    if (typeof isSupported === 'function' && !isSupported()) {
      return Date.now();
    }
    const t = await getServerTime();
    if (typeof t === 'number') return t;
  } catch {
    /* 폴백 */
  }
  return Date.now();
}

/** 서버 시간을 KST 기준 'YYYY-MM-DD' 로 반환 (오늘의 문제 1일 1회 판정 키) */
export async function getTodayKey(): Promise<string> {
  const now = await getServerNow();
  // en-CA 로케일은 'YYYY-MM-DD' 포맷을 보장해요.
  return new Date(now).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

// ---- 리뷰 요청 (핵심 태스크 완료·만족 시점) ----
export async function askReview(): Promise<void> {
  try {
    await tossRequestReview();
  } catch {
    /* 노출 실패는 무시 — 흐름에 영향 주지 않아요 */
  }
}

// ============================================================
// 인앱 광고 — 배너 / 전면형 / 리워드
//
//  · 배너: 결과 화면 하단 (진입 직후/전면 배너 금지 정책 준수)
//  · 리워드: "한 판 더" 시작 게이트 (세션 첫 판 무료, 이후 광고 시청 후 시작)
//  · 전면형: 라운드 종료 시 빈도 제한(N판에 1회) — 과도한 광고 밀도 방지
//
//  정책 안전장치:
//   - 광고 미지원/로드 실패 시 게임을 막지 않아요(fail-open) → dead-end 금지
//   - 리워드는 userEarnedReward 시에만 '획득'으로 처리 (dismissed만으론 지급 안 함)
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import {
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
  type TossAdsAttachBannerOptions,
} from '@apps-in-toss/web-framework';

// 라이브 광고 그룹 ID (콘솔 발급)
export const AD_GROUP = {
  banner: 'ait.v2.live.05e024305f58412b',
  interstitial: 'ait.v2.live.7f6ee9b5e1aa4b34',
  rewarded: 'ait.v2.live.f466ffe9a5744dd1',
} as const;

// 개발/샌드박스 테스트용 ID (정책상 개발 중엔 테스트 ID 사용 권장)
export const TEST_AD_GROUP = {
  banner: 'ait-ad-test-banner-id',
  interstitial: 'ait-ad-test-interstitial-id',
  rewarded: 'ait-ad-test-rewarded-id',
} as const;

// ---- 전면형/리워드 (loadFullScreenAd/showFullScreenAd, adGroupId로 타입 결정) ----

export function fullScreenAdSupported(): boolean {
  try {
    const isSupported = (loadFullScreenAd as { isSupported?: () => boolean }).isSupported;
    return typeof isSupported === 'function' ? isSupported() : true;
  } catch {
    return false;
  }
}

type AdOutcome = 'earned' | 'closed' | 'failed';

// load → (loaded) → show 순서. 타임아웃/에러 시 'failed'로 fail-open.
function loadThenShow(adGroupId: string, timeoutMs = 12000): Promise<AdOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    let earned = false;
    let unregister: (() => void) | undefined;

    const timer = window.setTimeout(() => finish('failed'), timeoutMs);
    function finish(r: AdOutcome) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try {
        unregister?.();
      } catch {
        /* no-op */
      }
      resolve(r);
    }

    try {
      unregister = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (e: { type: string }) => {
          if (e.type !== 'loaded') return;
          try {
            showFullScreenAd({
              options: { adGroupId },
              onEvent: (se: { type: string }) => {
                if (se.type === 'userEarnedReward') earned = true;
                else if (se.type === 'dismissed') finish(earned ? 'earned' : 'closed');
                else if (se.type === 'failedToShow') finish('failed');
              },
              onError: () => finish('failed'),
            });
          } catch {
            finish('failed');
          }
        },
        onError: () => finish('failed'),
      });
    } catch {
      finish('failed');
    }
  });
}

let lastFullScreenAt = 0;
const markFullScreen = () => {
  lastFullScreenAt = Date.now();
};

/**
 * 리워드 게이트. 게임을 시작해도 되는지 반환.
 *  - true: 보상 획득 OR 광고 불가/실패(fail-open)
 *  - false: 사용자가 끝까지 안 보고 닫음 → 시작 보류(재시도 가능)
 */
export async function showRewardedGate(adGroupId: string = AD_GROUP.rewarded): Promise<boolean> {
  if (!fullScreenAdSupported()) return true;
  const outcome = await loadThenShow(adGroupId);
  markFullScreen();
  return outcome === 'earned' || outcome === 'failed';
}

let finishCount = 0;

/** 라운드 종료 시 호출. N판에 1회, 최근 풀스크린 광고 직후엔 생략(스택 방지). */
export async function maybeShowInterstitial(everyNRounds = 3, adGroupId: string = AD_GROUP.interstitial): Promise<void> {
  finishCount += 1;
  if (finishCount % everyNRounds !== 0) return;
  if (!fullScreenAdSupported()) return;
  if (Date.now() - lastFullScreenAt < 30000) return; // 리워드 직후 스택 방지
  await loadThenShow(adGroupId);
  markFullScreen();
}

// ---- 배너 (TossAds.initialize + attachBanner) ----

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    try {
      const isSupported = (TossAds?.initialize as { isSupported?: () => boolean })?.isSupported;
      if (typeof isSupported === 'function' && !isSupported()) return;
      TossAds.initialize({
        callbacks: {
          onInitialized: () => setIsInitialized(true),
          onInitializationFailed: (error) => console.error('TossAds init failed:', error),
        },
      });
    } catch (e) {
      console.warn('TossAds unavailable:', e);
    }
  }, [isInitialized]);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: TossAdsAttachBannerOptions) => {
      if (!isInitialized) return undefined;
      try {
        return TossAds.attachBanner(adGroupId, element, options);
      } catch (e) {
        console.warn('attachBanner failed:', e);
        return undefined;
      }
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}

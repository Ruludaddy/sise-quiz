import { useEffect, useRef } from 'react';
import { useTossBanner, AD_GROUP } from '../toss/ads';

/**
 * 결과 화면 하단 배너 광고 (선택). FEATURES.ads 가 true일 때만 마운트하세요.
 * 컨테이너 width는 100%, 고정형 높이 96px 권장. 언마운트 시 destroy로 정리해요.
 */
export function BannerSlot() {
  const ref = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || ref.current == null) return;
    const attached = attachBanner(AD_GROUP.banner, ref.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'card',
    });
    return () => attached?.destroy();
  }, [isInitialized, attachBanner]);

  return <div className="ad-slot" ref={ref} style={{ width: '100%', minHeight: 96 }} />;
}

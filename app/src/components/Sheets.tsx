import { useEffect } from 'react';
import { ensureAudio, beep } from '../sound';

interface SettingsSheetProps {
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenPrivacy: () => void;
  onClose: () => void;
}

export function SettingsSheet({ soundOn, onToggleSound, onOpenPrivacy, onClose }: SettingsSheetProps) {
  return (
    <Overlay onDismiss={onClose}>
      <h3>설정</h3>
      <p style={{ marginBottom: 8 }}>소리와 정보를 관리해요.</p>

      <div className="set-item">
        <span className="label">소리</span>
        <button
          className={`toggle ${soundOn ? 'on' : ''}`}
          aria-label="소리 켜기/끄기"
          onClick={() => {
            onToggleSound();
            if (!soundOn) {
              ensureAudio();
              beep(600, 0.08);
            }
          }}
        />
      </div>

      <button className="link-btn" onClick={onOpenPrivacy}>
        개인정보처리방침
      </button>

      <div className="set-item">
        <span className="label">버전</span>
        <span className="val">0.1.0</span>
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--weak)', lineHeight: 1.6, margin: '14px 2px 20px' }}>
        가격 감각을 겨루는 심심풀이 퀴즈예요. 표시 가격은 시점·지역에 따라 다를 수 있으며 참고용이에요.
      </div>

      <button className="btn primary" onClick={onClose}>
        완료
      </button>
    </Overlay>
  );
}

interface PrivacySheetProps {
  onBack: () => void;
}

export function PrivacySheet({ onBack }: PrivacySheetProps) {
  return (
    <Overlay onDismiss={onBack}>
      <h3>개인정보처리방침</h3>
      <div className="pp-body">
        · 수집 항목: 사용자 식별키, 플레이 기록(점수·오늘의 문제 완료 여부).
        <br />
        · 수집 목적: 진행도 저장 및 콘텐츠 제공.
        <br />
        · 보관 기간: 서비스 이용 종료 또는 삭제 요청 시까지.
        <br />
        · 점수·가격 데이터는 건강·의료 정보가 아니며 심심풀이 목적으로만 활용됩니다.
        <br />
        · 문의: 내비게이션 바의 더보기 → 문의하기(고객센터) 채널로 접수해 주세요.
        <br />
        <br />
        (프로토타입 문안 — 서비스 배포 전 최종 검토 필요)
      </div>
      <button className="btn primary" onClick={onBack}>
        확인
      </button>
    </Overlay>
  );
}

interface OverlayProps {
  onDismiss: () => void;
  children: React.ReactNode;
}

/** 하단 바텀시트 오버레이. 배경(딤) 클릭 시 닫혀요. */
function Overlay({ onDismiss, children }: OverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

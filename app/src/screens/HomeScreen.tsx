interface HomeScreenProps {
  todayDone: boolean;
  dailyLoading?: boolean;
  bestAvg?: number;
  onStart: () => void;
  onToday: () => void;
  onOpenSettings: () => void;
}

export function HomeScreen({
  todayDone,
  dailyLoading = false,
  bestAvg = 0,
  onStart,
  onToday,
  onOpenSettings,
}: HomeScreenProps) {
  const todayDesc = dailyLoading
    ? '불러오는 중…'
    : todayDone
      ? '내일 새 문제로 만나요'
      : '매일 바뀌는 시세 한 문제';
  return (
    <div className="screen">
      <div className="home-top">
        <button className="icon-btn" aria-label="설정" onClick={onOpenSettings}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <div className="pad" style={{ paddingTop: 4 }}>
        <div className="hero">
          <div className="eyebrow">가격 감각 테스트</div>
          <h1>이거, 얼마일까요?</h1>
          <p>정답에 가까울수록 높은 점수! 한 판 5문제</p>
          <button className="cta" onClick={onStart}>
            가격 맞히기 시작하기
          </button>
        </div>

        {bestAvg > 0 && (
          <div className="stat-row">
            🏆 내 최고 시세 감각 <b>{bestAvg}점</b>
          </div>
        )}

        <div className="section-label">보너스</div>
        <div
          className={`card ${todayDone || dailyLoading ? 'done' : ''}`}
          onClick={dailyLoading ? undefined : onToday}
        >
          <div className="chip">🗓️</div>
          <div className="meta">
            <div className="name">오늘의 문제</div>
            <div className="desc">{todayDesc}</div>
          </div>
          {todayDone ? <span className="badge-done">완료</span> : <span className="badge-new">NEW</span>}
        </div>

        <div className="disclaimer">
          실제 가격은 시점·지역·판매처에 따라 달라질 수 있어요.
          <br />
          재미로 즐기는 콘텐츠이며, 어떤 현금·상품 보상과도 연결되지 않아요.
        </div>
      </div>
    </div>
  );
}

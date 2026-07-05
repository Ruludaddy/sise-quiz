import type { Question } from '../logic';
import { fbOf } from '../logic';
import { FEATURES } from '../features';
import { BannerSlot } from '../components/BannerSlot';

interface ResultScreenProps {
  mode: 'main' | 'today';
  qList: Question[];
  scores: number[];
  avg: number;
  bestAvg: number;
  todayDone: boolean;
  onPlayMain: () => void;
  onPlayToday: () => void;
  onHome: () => void;
}

export function ResultScreen({
  mode,
  qList,
  scores,
  avg,
  bestAvg,
  todayDone,
  onPlayMain,
  onPlayToday,
  onHome,
}: ResultScreenProps) {
  const fb = fbOf(avg);

  return (
    <div className="screen">
      <div className="result">
        <div className="cap">{mode === 'today' ? '오늘의 문제 결과' : '이번 판 시세 감각'}</div>
        <div className={`big-score ${fb.cls}`}>
          {avg}
          <span style={{ fontSize: 26 }}>점</span>
        </div>
        <h2 className={fb.cls}>{fb.text}</h2>
        {bestAvg > 0 && <div className="best-line">최고 기록 {bestAvg}점</div>}

        <div className="recap">
          {qList.map((it, i) => (
            <div className="recap-row" key={it.q}>
              <span className="rq">{it.q}</span>
              <span className={`rs ${fbOf(scores[i]).cls}`}>{scores[i]}점</span>
            </div>
          ))}
        </div>

        {/* 배너 광고: 진입 직후가 아닌 결과 화면에만, 기본 비활성 */}
        {FEATURES.ads && <BannerSlot />}

        <div className="btn-col">
          {mode === 'today' ? (
            <>
              <button className="btn primary" onClick={onPlayMain}>
                가격 맞히기 한 판 더
              </button>
              <button className="btn ghost" onClick={onHome}>
                홈으로
              </button>
            </>
          ) : (
            <>
              <button className="btn primary" onClick={onPlayMain}>
                한 판 더
              </button>
              {!todayDone && (
                <button className="btn gold" onClick={onPlayToday}>
                  오늘의 문제 풀기
                </button>
              )}
              <button className="btn ghost" onClick={onHome}>
                홈으로
              </button>
            </>
          )}
        </div>

        <div className="disclaimer" style={{ marginTop: 14 }}>
          가격은 시점에 따라 달라질 수 있어요 · 재미로 즐기는 콘텐츠
        </div>
      </div>
    </div>
  );
}

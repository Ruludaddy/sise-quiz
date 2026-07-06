import { useEffect, useState } from 'react';
import type { Question, RoundResult } from '../logic';
import { fbOf, won } from '../logic';
import { FEATURES } from '../features';
import { BannerSlot } from '../components/BannerSlot';
import { shareText } from '../toss/sdk';
import { showToast } from '../components/Toast';

interface ResultScreenProps {
  mode: 'main' | 'today';
  qList: Question[];
  results: RoundResult[];
  avg: number;
  bestAvg: number;
  isNewBest: boolean;
  todayDone: boolean;
  onPlayMain: () => void;
  onPlayToday: () => void;
  onHome: () => void;
}

const CONFETTI = ['🎉', '✨', '💰', '🎊', '⭐', '💸'];

export function ResultScreen({
  mode,
  qList,
  results,
  avg,
  bestAvg,
  isNewBest,
  todayDone,
  onPlayMain,
  onPlayToday,
  onHome,
}: ResultScreenProps) {
  const fb = fbOf(avg);
  const [sharing, setSharing] = useState(false);
  const [displayAvg, setDisplayAvg] = useState(0);

  // 점수 카운트업 (0 → avg, 이징으로 0.7초)
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayAvg(Math.round(avg * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [avg]);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const head =
      mode === 'today'
        ? `🗓 오늘의 시세 문제 ${avg}점! (${fb.text})`
        : `🧠 내 시세 감각 점수: ${avg}점 — ${fb.text}`;
    const outcome = await shareText(`${head}\n너도 「얼마일까?」에서 가격 감각 시험해볼래?`);
    setSharing(false);
    if (outcome === 'copied') showToast('결과 메시지를 복사했어요. 붙여넣어 공유해보세요!');
    else if (outcome === 'failed') showToast('공유를 열지 못했어요. 잠시 후 다시 시도해주세요');
  };

  return (
    <div className="screen">
      <div className="result">
        {avg >= 90 && (
          <div className="confetti" aria-hidden>
            {CONFETTI.map((e, i) => (
              <span key={i} style={{ left: `${6 + i * 16}%`, animationDelay: `${i * 0.12}s` }}>
                {e}
              </span>
            ))}
          </div>
        )}

        <div className="cap">{mode === 'today' ? '오늘의 문제 결과' : '이번 판 시세 감각'}</div>
        <div className={`big-score ${fb.cls}`}>
          {displayAvg}
          <span style={{ fontSize: 26 }}>점</span>
        </div>
        <h2 className={fb.cls}>{fb.text}</h2>
        {isNewBest ? (
          <div className="best-line new-best">🏆 새 최고 기록!</div>
        ) : (
          bestAvg > 0 && <div className="best-line">최고 기록 {bestAvg}점</div>
        )}

        <div className="recap">
          {qList.map((it, i) => (
            <div className="recap-row" key={it.q}>
              <div className="rq-col">
                <span className="rq">{it.q}</span>
                <span className="rq-sub">
                  정답 {won(it.a)} · 내 답 {won(results[i]?.guess ?? 0)}
                </span>
              </div>
              <span className={`rs ${fbOf(results[i]?.score ?? 0).cls}`}>{results[i]?.score ?? 0}점</span>
            </div>
          ))}
        </div>

        {/* 배너 광고: 진입 직후가 아닌 결과 화면에만, 기본 비활성 */}
        {FEATURES.ads && <BannerSlot />}

        <div className="btn-col">
          <button className="btn primary" onClick={onPlayMain}>
            {mode === 'today' ? '가격 맞히기 한 판 더' : '한 판 더'}
          </button>
          <button className="btn share" disabled={sharing} onClick={() => void handleShare()}>
            {sharing ? '공유 준비 중…' : '친구에게 결과 자랑하기 📤'}
          </button>
          {mode !== 'today' && !todayDone && (
            <button className="btn gold" onClick={onPlayToday}>
              오늘의 문제 풀기
            </button>
          )}
          <button className="btn ghost" onClick={onHome}>
            홈으로
          </button>
        </div>

        <div className="disclaimer" style={{ marginTop: 14 }}>
          가격은 시점에 따라 달라질 수 있어요 · 재미로 즐기는 콘텐츠
        </div>
      </div>
    </div>
  );
}

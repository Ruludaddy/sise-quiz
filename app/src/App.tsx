import { useEffect, useRef, useState } from 'react';
import { POOL, TODAY } from './data';
import { average, pick5, type Question, type RoundResult } from './logic';
import { FEATURES, AD_CONFIG } from './features';
import { showRewardedGate, maybeShowInterstitial } from './toss/ads';
import { initSoundLifecycle, setSoundEnabled } from './sound';
import { getUserKey, askReview, Store, onBackEvent } from './toss/sdk';
import { fetchTodayQuestion, fetchQuestionBank } from './daily';
import { useSafeArea } from './toss/useSafeArea';
import {
  isTodayDone,
  markTodayDone,
  getBestAverage,
  saveBestAverage,
  getSeenQuestions,
  addSeenQuestions,
} from './persist';
import { HomeScreen } from './screens/HomeScreen';
import { QuestionScreen } from './screens/QuestionScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsSheet, PrivacySheet } from './components/Sheets';
import { ToastHost, showToast } from './components/Toast';

type Screen = 'home' | 'question' | 'result';
type Mode = 'main' | 'today';
type Modal = null | 'settings' | 'privacy';

const SOUND_KEY = 'sise-quiz:sound';

export default function App() {
  const insets = useSafeArea();

  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<Mode>('main');
  const [qList, setQList] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  const [todayDone, setTodayDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bestAvg, setBestAvg] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [sessionPlays, setSessionPlays] = useState(0); // 세션 내 '가격 맞히기' 플레이 수 (리워드 게이트 기준)
  const [bank, setBank] = useState<Question[]>([]); // 서버 문제 은행 (실패 시 번들 POOL 폴백)
  const backGuard = useRef(0); // 문제 풀이 중 뒤로가기 2회 확인용 타임스탬프
  const runSeq = useRef(0); // 홈 이동 시 증가 — 광고/로딩 대기 중이던 판 시작을 무효화

  // 앱 시작 시 1회: 라이프사이클/식별키/저장값 로드
  useEffect(() => {
    initSoundLifecycle();
    void getUserKey(); // 사용자 식별키 워밍업 (비게임: getAnonymousKey)
    void fetchQuestionBank().then(setBank).catch(() => {}); // 문제 은행 로드 (실패 시 POOL 폴백)

    (async () => {
      const [done, best] = await Promise.all([isTodayDone(), getBestAverage()]);
      setTodayDone(done);
      setBestAvg(best);
      // 사운드 설정 로드 (기본 On)
      const saved = await Store.getItem(SOUND_KEY);
      if (saved === '0') {
        setSoundOn(false);
        setSoundEnabled(false);
      }
    })();
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    void Store.setItem(SOUND_KEY, next ? '1' : '0');
  };

  // 한 판 공통 초기화 — 판별 상태를 여기 한 곳에서만 리셋해요.
  const beginRun = (m: Mode, list: Question[]) => {
    setMode(m);
    setQList(list);
    setQIdx(0);
    setResults([]);
    setScreen('question');
  };

  const startMain = async () => {
    if (adLoading || dailyLoading) return;
    const seq = runSeq.current;

    // 첫 판(세션당 freePlaysPerSession)은 무료, 이후엔 리워드 광고 시청 후 시작
    const needAd = FEATURES.ads && sessionPlays >= AD_CONFIG.freePlaysPerSession;
    if (needAd) {
      setAdLoading(true);
      showToast('광고 준비 중…');
      const granted = await showRewardedGate();
      setAdLoading(false);
      if (runSeq.current !== seq) return; // 대기 중 홈으로 나갔으면 시작하지 않아요
      if (!granted) {
        showToast('광고를 끝까지 보면 한 판 더 시작돼요');
        return;
      }
    }

    // 최근 출제 기록은 저장소에서 직접 읽어요 — 상태 로딩 타이밍과 무관하게 정확해요.
    const seen = await getSeenQuestions();
    if (runSeq.current !== seq) return;

    setSessionPlays((n) => n + 1);
    // 서버 문제 은행이 있으면 그걸로, 없으면 번들 POOL로 5문제 샘플.
    // 제외 범위는 풀 크기의 70%까지만 — 작은 풀에서도 항상 뽑을 문제가 남아요.
    const pool = bank.length >= 5 ? bank : POOL;
    const excludeWindow = seen.slice(-Math.floor(pool.length * 0.7));
    beginRun('main', pick5(pool, new Set(excludeWindow)));
  };

  const startToday = async () => {
    if (todayDone) {
      showToast('오늘의 문제는 내일 다시 열려요');
      return;
    }
    if (dailyLoading || adLoading) return;
    const seq = runSeq.current;

    setDailyLoading(true);
    let question: Question = TODAY; // 번들 폴백(예시 문제)
    try {
      question = await fetchTodayQuestion();
    } catch {
      showToast('예시 문제로 진행해요');
    } finally {
      setDailyLoading(false);
    }
    if (runSeq.current !== seq) return;

    beginRun('today', [question]);
  };

  const handleReveal = (score: number, guess: number) => {
    setResults((prev) => [...prev, { score, guess }]);
    const current = qList[qIdx];
    // 실제로 화면에 공개된 문제만 '본 문제'로 기록해요 (중도 이탈 시 안 본 문제가 제외되지 않게).
    if (mode === 'main' && current != null) {
      void addSeenQuestions([current.q]);
    }
    // 오늘의 문제는 정답이 공개된 순간 완료 처리 — 나갔다 들어와서 재도전할 수 없게.
    if (mode === 'today' && !todayDone) {
      setTodayDone(true);
      void markTodayDone();
    }
  };

  const handleAdvance = () => {
    const isLast = qIdx >= qList.length - 1;
    if (mode === 'today' || isLast) {
      finishRun();
    } else {
      setQIdx((i) => i + 1);
    }
  };

  const finishRun = () => {
    const avg = average(results.map((r) => r.score));
    // 최고 기록은 5문제 본판 기준만 — 오늘의 문제(1문제) 점수로 오염되지 않게 해요.
    if (mode === 'main') {
      setIsNewBest(avg > 0 && avg > bestAvg);
      void saveBestAverage(avg).then(setBestAvg);
    } else {
      setIsNewBest(false);
    }
    // 핵심 태스크 완료 + 높은 만족 시점에만 리뷰 요청 (노출 보장 아님)
    if (FEATURES.reviewPrompt && avg >= 90) {
      void askReview();
    }
    setScreen('result');

    // 라운드 종료 전면광고 (N판에 1회, 리워드 직후엔 생략)
    if (FEATURES.ads) {
      void maybeShowInterstitial(AD_CONFIG.interstitialEveryNRounds);
    }
  };

  const goHome = () => {
    runSeq.current++;
    setScreen('home');
    setModal(null);
  };

  const openSettings = () => setModal('settings');
  const closeSettings = () => setModal(null);
  const openPrivacy = () => setModal('privacy');
  const backFromPrivacy = () => setModal('settings');

  // 안드로이드 뒤로가기: 시트 → 닫기, 결과 → 홈, 문제 풀이 중 → 2초 내 2회 확인.
  // 홈(시트 없음)에서는 구독하지 않아 기본 동작(미니앱 닫기)을 유지해요.
  useEffect(() => {
    if (screen === 'home' && modal == null) return;
    return onBackEvent(() => {
      if (adLoading || dailyLoading) return; // 광고/로딩 대기 중엔 화면 전환 금지
      if (modal === 'privacy') {
        backFromPrivacy();
        return;
      }
      if (modal === 'settings') {
        closeSettings();
        return;
      }
      if (screen === 'result') {
        goHome();
        return;
      }
      const now = Date.now();
      if (now - backGuard.current < 2000) {
        goHome();
      } else {
        backGuard.current = now;
        showToast('한 번 더 누르면 홈으로 나가요');
      }
    });
  }, [screen, modal, adLoading, dailyLoading]);

  const avg = average(results.map((r) => r.score));

  return (
    <div className="app" style={{ paddingBottom: insets.bottom }}>
      {screen === 'home' && (
        <HomeScreen
          todayDone={todayDone}
          dailyLoading={dailyLoading}
          bestAvg={bestAvg}
          onStart={() => void startMain()}
          onToday={() => void startToday()}
          onOpenSettings={openSettings}
        />
      )}

      {screen === 'question' && qList[qIdx] != null && (
        <QuestionScreen
          key={`${mode}-${qIdx}`}
          item={qList[qIdx]}
          index={qIdx}
          total={qList.length}
          mode={mode}
          onReveal={handleReveal}
          onAdvance={handleAdvance}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          mode={mode}
          qList={qList}
          results={results}
          avg={avg}
          bestAvg={bestAvg}
          isNewBest={isNewBest}
          todayDone={todayDone}
          onPlayMain={() => void startMain()}
          onPlayToday={() => void startToday()}
          onHome={goHome}
        />
      )}

      {modal === 'settings' && (
        <SettingsSheet
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onOpenPrivacy={openPrivacy}
          onClose={closeSettings}
        />
      )}
      {modal === 'privacy' && <PrivacySheet onBack={backFromPrivacy} />}

      <ToastHost />
    </div>
  );
}

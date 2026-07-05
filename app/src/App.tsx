import { useEffect, useState } from 'react';
import { POOL, TODAY } from './data';
import { average, pick5, type Question } from './logic';
import { FEATURES, AD_CONFIG } from './features';
import { showRewardedGate, maybeShowInterstitial } from './toss/ads';
import { initSoundLifecycle, setSoundEnabled } from './sound';
import { getUserKey, askReview, Store } from './toss/sdk';
import { fetchTodayQuestion, fetchQuestionBank } from './daily';
import { useSafeArea } from './toss/useSafeArea';
import { isTodayDone, markTodayDone, getBestAverage, saveBestAverage } from './persist';
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
  const [scores, setScores] = useState<number[]>([]);

  const [todayDone, setTodayDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bestAvg, setBestAvg] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [sessionPlays, setSessionPlays] = useState(0); // 세션 내 '가격 맞히기' 플레이 수 (리워드 게이트 기준)
  const [bank, setBank] = useState<Question[]>([]); // 서버 문제 은행 (실패 시 번들 POOL 폴백)

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

  const startMain = async () => {
    if (adLoading || dailyLoading) return;

    // 첫 판(세션당 freePlaysPerSession)은 무료, 이후엔 리워드 광고 시청 후 시작
    const needAd = FEATURES.ads && sessionPlays >= AD_CONFIG.freePlaysPerSession;
    if (needAd) {
      setAdLoading(true);
      showToast('광고 준비 중…');
      const granted = await showRewardedGate();
      setAdLoading(false);
      if (!granted) {
        showToast('광고를 끝까지 보면 한 판 더 시작돼요');
        return;
      }
    }

    setSessionPlays((n) => n + 1);
    setMode('main');
    // 서버 문제 은행이 있으면 그걸로, 없으면 번들 POOL로 5문제 샘플
    setQList(pick5(bank.length >= 5 ? bank : POOL));
    setQIdx(0);
    setScores([]);
    setScreen('question');
  };

  const startToday = async () => {
    if (todayDone) {
      showToast('오늘의 문제는 내일 다시 열려요');
      return;
    }
    if (dailyLoading) return;

    setDailyLoading(true);
    let question: Question = TODAY; // 번들 폴백(예시 문제)
    try {
      question = await fetchTodayQuestion();
    } catch {
      showToast('예시 문제로 진행해요');
    } finally {
      setDailyLoading(false);
    }

    setMode('today');
    setQList([question]);
    setQIdx(0);
    setScores([]);
    setScreen('question');
  };

  const handleReveal = (score: number) => {
    setScores((prev) => [...prev, score]);
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
    const avg = average(scores);
    void saveBestAverage(avg).then(setBestAvg);
    if (mode === 'today') {
      void markTodayDone();
      setTodayDone(true);
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
    setScreen('home');
    setModal(null);
  };

  const avg = average(scores);

  return (
    <div className="app" style={{ paddingBottom: insets.bottom }}>
      {screen === 'home' && (
        <HomeScreen
          todayDone={todayDone}
          dailyLoading={dailyLoading}
          onStart={() => void startMain()}
          onToday={() => void startToday()}
          onOpenSettings={() => setModal('settings')}
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
          scores={scores}
          avg={avg}
          bestAvg={bestAvg}
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
          onOpenPrivacy={() => setModal('privacy')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'privacy' && <PrivacySheet onBack={() => setModal('settings')} />}

      <ToastHost />
    </div>
  );
}

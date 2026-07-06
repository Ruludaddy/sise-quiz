import { useMemo, useState } from 'react';
import type { Question } from '../logic';
import { won, scoreOf, fbOf, errPctOf } from '../logic';
import { beep, beepForScore, ensureAudio } from '../sound';

interface QuestionScreenProps {
  item: Question;
  index: number; // 0-based
  total: number;
  mode: 'main' | 'today';
  /** 정답 공개 시점에 점수·내 답을 전달 (App이 scores/guesses에 누적) */
  onReveal: (score: number, guess: number) => void;
  /** 다음 문제 또는 결과로 진행 */
  onAdvance: () => void;
}

const KEYS: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'];

export function QuestionScreen({ item, index, total, mode, onReveal, onAdvance }: QuestionScreenProps) {
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const isToday = mode === 'today';
  const value = typed === '' ? 0 : parseInt(typed, 10);
  const canSubmit = typed !== '' && value > 0;
  const isLast = index >= total - 1;

  const feedback = useMemo(() => fbOf(score), [score]);

  const press = (key: string) => {
    if (revealed) return;
    setTyped((prev) => {
      if (key === 'del') return prev.slice(0, -1);
      if (key === '000') {
        if (prev !== '' && prev !== '0' && prev.length <= 6) return prev + '000';
        return prev;
      }
      if (prev.length >= 8) return prev;
      return (prev === '0' ? '' : prev) + key;
    });
    beep(360, 0.035, 'sine', 0.07);
  };

  const check = () => {
    if (!canSubmit) return;
    const s = scoreOf(value, item.a);
    setScore(s);
    setRevealed(true);
    beepForScore(s);
    onReveal(s, value);
  };

  const footLabel = revealed ? (isToday || isLast ? '결과 보기' : '다음 문제') : '정답 확인';

  return (
    <div className="screen">
      <div className="game">
        <div className="game-top">
          <span />
          <span className={`prog-pill ${isToday ? 'today' : ''}`}>
            {isToday ? '보너스 · 오늘의 문제' : `${index + 1} / ${total}`}
          </span>
        </div>

        <div className="qwrap">
          <div className="q-label">{isToday ? '🗓 오늘의 시세' : `Q${index + 1}. 가격을 맞혀보세요`}</div>
          <div className="q-text">{item.q}</div>
          <div className="q-note">{item.note ?? '예상 가격을 직접 입력해보세요'}</div>

          <div className={`amount ${typed === '' ? 'empty' : ''}`}>{won(value)}</div>
          <div className="amount-sub">예상 가격</div>

          {revealed && (
            <div className="reveal">
              <div className="actual">
                실제 가격<b>{won(item.a)}</b>
              </div>
              <div className={`score ${feedback.cls}`}>{score}점</div>
              <div className={`fb ${feedback.cls}`}>{feedback.text}</div>
              <div className="err-line">
                내 예상 {won(value)} ·{' '}
                {value === item.a
                  ? '정확히 맞혔어요! 🎯'
                  : errPctOf(value, item.a) === 0
                    ? '거의 정확해요! 🎯'
                    : value > item.a
                      ? `${errPctOf(value, item.a)}% 높게 불렀어요 ▲`
                      : `${errPctOf(value, item.a)}% 낮게 불렀어요 ▼`}
              </div>
              <div className="acc-bar">
                <span className={`acc-fill ${feedback.cls}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          )}
        </div>

        {!revealed && (
          <div className="keypad">
            {KEYS.map((k) => (
              <button
                key={k}
                className={`key ${k === '000' || k === 'del' ? 'util' : ''}`}
                onClick={() => {
                  ensureAudio();
                  press(k);
                }}
              >
                {k === 'del' ? '⌫' : k}
              </button>
            ))}
          </div>
        )}

        <button
          className="btn primary foot-btn"
          disabled={!revealed && !canSubmit}
          onClick={() => {
            ensureAudio();
            if (revealed) onAdvance();
            else check();
          }}
        >
          {footLabel}
        </button>
      </div>
    </div>
  );
}

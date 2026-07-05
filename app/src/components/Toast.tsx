import { useEffect, useState } from 'react';

// 간단한 pub-sub 토스트. 어느 컴포넌트에서든 showToast()로 호출해요.
type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

export function showToast(msg: string): void {
  listeners.forEach((l) => l(msg));
}

interface ToastItem {
  id: number;
  msg: string;
}

let seq = 0;

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = (msg) => {
      const id = ++seq;
      setItems((prev) => [...prev, { id, msg }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }, 1800);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <>
      {items.map((it) => (
        <div className="toast" key={it.id}>
          {it.msg}
        </div>
      ))}
    </>
  );
}

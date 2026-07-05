/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 오늘의 문제 정적 JSON 게시 베이스 URL (daily-service 산출물 호스팅 주소) */
  readonly VITE_DAILY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

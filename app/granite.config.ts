import { defineConfig } from '@apps-in-toss/web-framework/config';

/**
 * 앱인토스 미니앱 설정 (비게임)
 *
 * ⚠️ 아래 값은 반드시 앱인토스 콘솔에 등록한 앱 정보와 동일하게 맞춰주세요.
 *   - appName      : 콘솔의 appName (딥링크 intoss://{appName} 에 사용돼요)
 *   - displayName  : 콘솔에 등록한 앱 이름
 *   - icon         : 콘솔 앱 정보에서 업로드한 아이콘 이미지의 URL
 *
 * 비게임 미니앱은 `webViewProps.type: 'game'` 을 설정하지 않아요.
 * 설정하지 않으면 흰색 배경의 비게임 내비게이션 바(로고·이름 + 더보기 + X)가 자동으로 적용돼요.
 */
export default defineConfig({
  appName: 'sise-quiz', // 콘솔에 등록한 appName
  brand: {
    displayName: '얼마일까?',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/56207/51b2a2f7-254e-4b05-a036-dfe573653065.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  // 이 미니앱은 외부 SDK 권한(카메라·위치·연락처 등)을 사용하지 않아요.
  permissions: [],
  outdir: 'dist',
  // 비게임 내비게이션 바 커스터마이징. 홈 버튼을 노출해 언제든 첫 화면으로 돌아올 수 있게 해요.
  // (아이콘·이름은 비게임 내비바에 기본 노출돼요.)
  navigationBar: {
    withHomeButton: true,
    withTitle: true,
  },
});

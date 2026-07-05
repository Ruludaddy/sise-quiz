# 얼마일까? — 앱인토스 비게임 미니앱

가격 맞히기 심심풀이 퀴즈. `price-guess-prototype.html`(바닐라 JS 프로토타입)을 **앱인토스 WebView 비게임 미니앱**(React + Vite + `@apps-in-toss/web-framework`)으로 이식한 프로젝트예요. `Docs/`의 앱인토스 비게임 가이드를 따라 구성했고, `ait` 툴체인으로 빌드·출시할 수 있어요.

> ⚠️ 표시 가격은 전부 **예시값**이에요. 재미로 즐기는 콘텐츠이며 어떤 현금·상품 보상과도 연결되지 않아요. 출시 전 [출시 체크리스트](#출시-체크리스트)를 반드시 확인하세요.

---

## 1. 사전 준비

- Node.js 18+ / npm
- [앱인토스 콘솔](https://apps-in-toss.toss.im)에서 **비게임** 미니앱 생성 → `appName`, 앱 이름, 아이콘 등록
- 샌드박스 앱 설치 (실기기/에뮬레이터 테스트용) — `Docs/`의 샌드박스 문서 참고

## 2. 설치 & 실행

```sh
cd app
npm install          # 최초 1회 (@apps-in-toss/web-framework 등 설치)
npm run dev          # 개발 서버 (http://localhost:5173)
```

개발 서버를 켠 뒤 **샌드박스 앱에서 `intoss://sise-quiz` 딥링크**로 미니앱을 열어 확인해요.
(로컬 브라우저에서 열면 SDK 없이 폴백으로 동작해 UI만 빠르게 확인할 수 있어요. SDK 기능은 반드시 샌드박스/토스앱에서 검증하세요.)

> 처음부터 CLI로 초기화하고 싶다면 `npx ait init` 으로 `granite.config.ts`를 생성한 뒤 이 저장소의 값과 맞춰도 돼요.

## 3. 콘솔 정보와 맞추기 (필수)

[granite.config.ts](granite.config.ts)의 값을 콘솔에 등록한 앱 정보와 동일하게 바꿔주세요.

```ts
appName: 'sise-quiz',            // 콘솔의 appName (딥링크 intoss://{appName})
brand: {
  displayName: '얼마일까?',      // 콘솔 앱 이름
  primaryColor: '#3182F6',
  icon: '',                     // 콘솔에서 업로드한 아이콘 이미지 URL
},
```

아이콘 원본은 [public/app-icon-600.png](public/app-icon-600.png)(600×600)에 있어요. 이 이미지를 콘솔 앱 정보에 업로드한 뒤, 업로드된 이미지를 우클릭 → 링크 복사해서 `brand.icon`에 붙여넣으세요.

## 4. 빌드 & 출시

```sh
npm run build        # dist/ 에 앱 번들 생성 (vite build, SSR 금지 · CSR/SSG)
```

1. `dist` 번들을 **콘솔에 업로드**해 최종 테스트(토스앱 QR)를 진행해요.
2. 토스앱 테스트를 통과하면 **출시 요청**을 보낼 수 있어요.
3. 자세한 절차는 `Docs/`의 “토스앱 테스트하기 / 미니앱 출시” 문서를 참고하세요.

> 출시/테스트 URL은 서로 달라요: 출시 `https://sise-quiz.apps.tossmini.com`, QR 테스트 `https://sise-quiz.private-apps.tossmini.com`. `localStorage` 등 웹 표준 저장소는 두 환경 간 공유되지 않아요. (그래서 진행도는 네이티브 `Storage`에 저장해요.)

---

## 5. 프로젝트 구조

```
app/
├─ granite.config.ts        # 앱인토스 미니앱 설정 (비게임)
├─ vite.config.ts           # Vite (React)
├─ index.html               # 진입 HTML (Pretendard 폰트)
└─ src/
   ├─ main.tsx              # 엔트리
   ├─ App.tsx               # 화면 상태머신(home/question/result) + 모달
   ├─ logic.ts              # 순수 로직: scoreOf / fbOf / pick5 / won
   ├─ data.ts               # 문제 데이터 (POOL + TODAY, ⚠️ 예시값)
   ├─ sound.ts              # WebAudio 비프음 (On/Off · 백그라운드 정리)
   ├─ persist.ts            # 기록/오늘의 문제 영속화 (Storage + 날짜키)
   ├─ features.ts           # 기능 플래그 (ads/reviewPrompt)
   ├─ styles.css            # 토스풍 UI (프로토타입 CSS 이식)
   ├─ toss/
   │  ├─ sdk.ts             # SDK 래퍼: getAnonymousKey/Storage/getServerTime/requestReview (+폴백)
   │  ├─ useSafeArea.ts     # SafeAreaInsets 구독 훅
   │  └─ ads.ts             # (선택) 배너 광고 훅
   ├─ screens/              # HomeScreen / QuestionScreen / ResultScreen
   └─ components/           # Sheets(설정·개인정보) / Toast / BannerSlot
```

## 6. 사용한 앱인토스 SDK (비게임)

| 기능 | SDK | 위치 |
|---|---|---|
| 사용자 식별 (비게임) | `getAnonymousKey` | `toss/sdk.ts` → `getUserKey()` |
| 진행도 저장 | `Storage` | `toss/sdk.ts` `Store`, `persist.ts` |
| 서버 시간(치팅 방지·날짜키) | `getServerTime` | `toss/sdk.ts` `getServerNow/getTodayKey` |
| Safe Area 여백 | `SafeAreaInsets` | `toss/useSafeArea.ts` |
| 리뷰 요청 | `requestReview` | 강한 점수(≥90) 달성 시 `App.finishRun` |
| 광고(배너·전면·리워드) | `TossAds` · `loadFullScreenAd`/`showFullScreenAd` | `toss/ads.ts` — 8. 광고 참고 |

- **내비게이션 바 / 닫기(X) / 공유·신고·권한**은 비게임 프레임워크가 자동 제공해요. 그래서 프로토타입의 커스텀 상단 바·X·종료 모달은 제거했어요. (설정 안의 소리/개인정보는 앱 고유라 인앱 시트로 유지)
- 로컬 브라우저 등 토스 환경이 아닐 땐 모든 SDK 호출이 안전한 폴백으로 동작해요.

### 오늘의 문제 (공공데이터 파이프라인)

미니앱은 클라이언트 전용이라 공공데이터 API를 직접 호출하지 않아요. 대신 **서버 배치**([../daily-service](../daily-service))가 매일 1문제를 생성해 정적 JSON으로 게시하고, 클라이언트는 그걸 읽어요.

```
[KAMIS/오피넷 등]  →  daily-service 배치(크론)  →  정적 JSON(CDN)  →  src/daily.ts fetch (+번들 폴백)
```

- 게시 URL은 [.env.example](.env.example) 참고해 `VITE_DAILY_ENDPOINT` 로 주입해요.
- `src/daily.ts` 가 서버시간 날짜키로 `{date}.json` → `today.json` 순으로 조회하고, 모두 실패하면 `src/data.ts`의 번들 예시 문제로 진행해요.
- 배치 실행/호스팅/소스 어댑터(KAMIS·오피넷)는 [../daily-service/README.md](../daily-service/README.md) 참고.

## 7. 출시 체크리스트

배포 전 **반드시 처리할 3가지**:

- [ ] ① `src/data.ts`의 예시 가격(`a`)을 **검증값/공공데이터·공식 고시가**로 교체 (상용 가격 DB·상품 이미지 크롤링 금지)
- [x] ② **오늘의 문제** 파이프라인 — **KAMIS 일별 도매가 실연동 검증 완료** (실제 시세로 today.json 생성 확인, [../daily-service](../daily-service)). 남은 일: (a) `out/`을 정적 호스팅에 매일 크론 업로드(서버 env `DATAGO_SERVICE_KEY`, `DAILY_SOURCE=kamis`), (b) 미니앱 `VITE_DAILY_ENDPOINT`를 그 게시 URL로 설정. (출처 표기는 응답에 자동 포함)
- [ ] ③ 기록·오늘의 문제 완료를 `Storage` 날짜키로 영속화 — *구현 완료*(`persist.ts`). 사용자별 분리가 필요하면 `getUserKey()`를 키 프리픽스로 사용

그 외:

- [ ] `granite.config.ts`의 `appName`/`displayName`/`icon`을 콘솔과 일치
- [ ] 점수·정답이 어떤 현금성 보상과도 연결되지 않음 (비게임 · 재미용 고지 유지)
- [ ] 로컬 → 샌드박스 → 실기기 3단계 테스트, 첫 화면 10초 이내
- [ ] 게임물 등급분류: **해당 없음**(비게임)

## 8. 광고 (수익화)

`FEATURES.ads`(기본 `true`) 로 켜져 있어요. 광고 그룹 ID·배치는 [src/toss/ads.ts](src/toss/ads.ts), 정책 설정은 [src/features.ts](src/features.ts).

| 광고 | 그룹 ID | 위치/트리거 |
|---|---|---|
| 배너 | `ait.v2.live.05e024305f58412b` | 결과 화면 하단([BannerSlot](src/components/BannerSlot.tsx)) |
| 리워드 | `ait.v2.live.f466ffe9a5744dd1` | **"가격 맞히기 한 판" 시작 게이트** — 세션당 첫 3판 무료, 이후 광고 시청 후 시작 |
| 전면형 | `ait.v2.live.7f6ee9b5e1aa4b34` | 라운드 종료 시(`AD_CONFIG.interstitialEveryNRounds`=3판에 1회) |

**동작/튜닝**
- 무료 횟수: `AD_CONFIG.freePlaysPerSession`(현재 **3**). 세션 단위 카운트라 앱 재실행 시 초기화 → 재방문 유저는 매 방문 첫 3판 무료(덜 공격적). 값만 바꾸면 조절돼요. (하루 1회 무료 등으로 바꾸려면 `persist.ts`에 날짜키로 저장)
- 리워드는 `userEarnedReward`일 때만 시작 허용. **광고 미지원/로드 실패 시엔 그냥 시작**(fail-open) — 정책상 dead-end 금지 + UX 보호.
- 전면형은 리워드 직후 30초 내엔 생략(광고 스택 방지).

**정책 주의 (반드시)**
- 지금은 **라이브 ID**예요. 개발/샌드박스 테스트는 **테스트 ID**(`TEST_AD_GROUP`, `ads.ts`)로 하세요 — 라이브 ID로 테스트하면 정책 위반이에요.
- 진입 직후/첫 화면 전면광고 금지, 배너는 상·하단만, "광고 클릭 시 보상" 같은 참여형 클릭 유도 금지. (리워드 광고=끝까지 시청 후 보상은 허용)

## 9. (선택) 다음 단계

- **TDS(Toss Design System)** 적용: `npm i @toss/tds-mobile @toss/tds-mobile-ait @emotion/react@^11` 후 버튼/텍스트를 TDS 컴포넌트로 교체 가능. (현재는 프로토타입의 토스풍 커스텀 CSS 유지)
- **분석(Analytics)**: 화면 진입/버튼 클릭 로깅으로 리텐션·난이도 튜닝.

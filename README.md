# 얼마일까? (sise-quiz) — 앱인토스 비게임 미니앱

가격 맞히기 심심풀이 퀴즈. 두 부분으로 구성돼요.

| 폴더 | 내용 |
|---|---|
| [app/](app/) | 미니앱 본체 (Vite + React + `@apps-in-toss/web-framework`). ait 빌드 대상 |
| [daily-service/](daily-service/) | '오늘의 문제' 일일 생성 배치 (KAMIS 공공데이터). GitHub Actions로 자동화 |
| [Docs/](Docs/) | 앱인토스 가이드 문서(참고용) · `price-guess-prototype.html` = 원본 프로토타입 |

- 앱 상세: [app/README.md](app/README.md)
- 데이터 배치 상세: [daily-service/README.md](daily-service/README.md)

---

## 자동화 구성 (GitHub Actions, 서버 불필요)

- **[.github/workflows/daily-question.yml](.github/workflows/daily-question.yml)** — 매일 00:10 KST에 KAMIS 시세로 `today.json` 생성 → **GitHub Pages(gh-pages)** 게시
- **[.github/workflows/build-app.yml](.github/workflows/build-app.yml)** — 미니앱 번들 빌드 → `dist` 아티팩트 업로드(콘솔에 올릴 파일)

### 최초 1회 세팅

이 폴더는 아직 git 저장소가 아니에요. 아래 순서로 연결하세요.

```sh
# 1) 저장소 만들고 푸시
cd d:/appintoss/how-much
git init && git add . && git commit -m "init: sise-quiz mini app + daily-service"
git branch -M main
git remote add origin https://github.com/Ruludaddy/sise-quiz.git
git push -u origin main
```

2) **Secret 등록**: GitHub 저장소 → Settings → Secrets and variables → Actions → **New repository secret**
   - `DATAGO_SERVICE_KEY` = 공공데이터포털 인증키(Decoding/Encoding 아무거나)

3) **오늘의 문제 최초 생성**: Actions → *Daily Question* → **Run workflow**(수동) 1회 실행 → `gh-pages` 브랜치가 생겨요.

4) **Pages 켜기**: Settings → Pages → Source = **Deploy from a branch**, Branch = **gh-pages / (root)** → 저장.
   - 게시 URL 확인: `https://ruludaddy.github.io/sise-quiz/today.json` 이 열리면 성공.

5) **Variable 등록**(앱 빌드가 이 URL을 쓰도록): Settings → Secrets and variables → Actions → **Variables** 탭 → **New variable**
   - `VITE_DAILY_ENDPOINT` = `https://ruludaddy.github.io/sise-quiz`

이후 매일 00:10 KST에 시세가 자동 갱신돼요. (품목 변경은 daily-question.yml의 env 주석 참고)

---

## ait 빌드 & 출시

### CI로 빌드 (권장)

`app/**`를 push하면 *Build Mini App* 워크플로가 돌아 `miniapp-dist` 아티팩트를 만들어요. Actions 실행 결과에서 내려받아 **앱인토스 콘솔에 업로드** → 토스앱 QR 테스트 → 출시.

### 로컬로 빌드

```sh
cd app
npm install
# 오늘의 문제 게시 URL 주입(로컬 빌드 시)
echo "VITE_DAILY_ENDPOINT=https://ruludaddy.github.io/sise-quiz" > .env.production
npm run build      # → app/dist (콘솔 업로드용 번들)
```

> ⚠️ 광고는 콘솔 테스트 시 **테스트 ID**로 하세요([app/src/toss/ads.ts](app/src/toss/ads.ts)의 `AD_GROUP` → `TEST_AD_GROUP`). 라이브 ID로 테스트하면 정책 위반이에요.

출시 절차와 체크리스트는 [app/README.md](app/README.md) 참고.

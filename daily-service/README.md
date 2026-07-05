# 오늘의 문제 · 공공데이터 배치 (daily-service)

"오늘의 문제"를 매일 1개 자동 생성하는 **서버 배치**예요. 미니앱 번들과 분리되어 있고(파트너 서버/서버리스 크론에서 실행), 결과 JSON을 정적 호스팅에 올리면 미니앱 클라이언트가 그걸 `fetch` 해요.

## 왜 배치인가요?

미니앱은 클라이언트 전용 WebView 번들(SSR/백엔드 금지)이라, 공공데이터 API를 클라이언트가 직접 호출하기 어려워요.

- KAMIS·오피넷 등은 **인증키**가 필요해요 → 키를 클라이언트에 넣으면 노출돼요.
- 브라우저 CORS 제약도 있어요.

그래서 **서버에서 하루 1회** API를 호출해 정규화한 JSON을 공개 URL로 게시하고, 클라이언트는 그 URL만 읽어요.

```
[공공데이터 API]  →  [daily-service 배치(크론)]  →  [정적 JSON(CDN/버킷)]  →  [미니앱 클라이언트 fetch]
   KAMIS/오피넷         하루 1회 생성·정규화           today.json / {date}.json      src/daily.ts (+폴백)
```

## 데이터 계약

[schema.json](schema.json) 참고. 핵심 필드: `date`(KST YYYY-MM-DD), `question`, `answer`(원). 이 계약만 지키면 소스를 무엇으로 바꿔도 클라이언트는 그대로 동작해요.

## 실행

```sh
cd daily-service

# 키 없이 (테스트/폴백 — 날짜 시드로 결정적 선택)
npm run generate:fallback

# KAMIS 농산물 도매가 (키 필요)
KAMIS_CERT_KEY=... KAMIS_CERT_ID=... npm run generate:kamis

# 오피넷 유가 (키 필요)
OPINET_API_KEY=... npm run generate:opinet
```

산출물: `out/{YYYY-MM-DD}.json` 과 `out/today.json`.

## 배포 (크론 + 정적 호스팅)

1. 크론으로 매일 실행 (예: `10 0 * * *` = 매일 00:10 KST). GitHub Actions / Cloud Scheduler / Lambda 등.
   ```sh
   DATAGO_SERVICE_KEY='발급키' DAILY_SOURCE=kamis npm run generate
   ```
2. `out/` 을 정적 호스팅(S3+CloudFront, Cloudflare R2, GitHub Pages 등)에 업로드. 캐시는 짧게(예: max-age=300).
3. 미니앱에서 `app/.env` 의 `VITE_DAILY_ENDPOINT` 를 게시 베이스 URL로 설정.
   - 클라이언트는 `${VITE_DAILY_ENDPOINT}/{date}.json` → 없으면 `${...}/today.json` 순으로 시도하고, 모두 실패하면 번들 폴백 문제로 진행해요.

## API 키 발급 + 응답 필드 확정

### ✅ 확정: KAMIS 일별 도,소매 가격정보 (검증 완료)

데이터셋 [15156057](https://www.data.go.kr/data/15156057/openapi.do)로 실제 호출까지 검증했어요. [sources/kamis.mjs](sources/kamis.mjs)가 이 API를 씁니다.

- 엔드포인트: `https://apis.data.go.kr/B552845/perDay/price`
- 방식: odcloud `cond[필드::연산]` · 날짜 `exmn_ymd`(YYYYMMDD) · 가격 `exmn_dd_prc` · 품목 `item_nm`
- ⚠️ cond를 느슨하게 주면 0건 → **(se,ctgry,item,vrty,grd,sgg,mrkt) 전체 튜플 + 날짜범위**로 조회하고 최신 조사일 행을 골라요.

```sh
cd daily-service
# 인증키(Encoding/Decoding 아무거나 — 자동 판단)만 있으면 바로 생성돼요.
DATAGO_SERVICE_KEY='발급키' DAILY_SOURCE=kamis npm run generate

# 응답 필드를 눈으로 보고 싶으면:
DATAGO_SERVICE_KEY='발급키' npm run probe:kamis
```

기본 프리셋 = **서울 양곡도매 쌀 20kg(상품)** → "오늘 쌀 20kg 도매가는?". 다른 품목은 코드로 바꿔요(값은 미리보기 요청변수 기본값/ KAMIS 품목코드표 참고):

```sh
DATAGO_SERVICE_KEY='발급키' DAILY_SOURCE=kamis \
  KAMIS_ITEM_CD=211 KAMIS_CTGRY_CD=200 KAMIS_VRTY_CD=... KAMIS_GRD_CD=... \
  KAMIS_SGG_CD=1101 KAMIS_MRKT_CD=... KAMIS_QUESTION='오늘 배추 1포기 도매가는?' \
  npm run generate
```

> `sources/kamis.mjs`의 `PRESETS`에 자주 쓰는 품목 튜플을 추가해두면 `KAMIS_ITEM=이름`으로 골라 쓸 수 있어요.

### 0) 공공데이터포털 data.go.kr (일반 · 다른 데이터셋용)

aT(한국농수산식품유통공사) 등 대부분의 공공 시세 데이터셋이 여기 모여 있어요. 표준화돼 있어 추천해요.

1. https://www.data.go.kr 회원가입 → 원하는 **오픈 API** 데이터셋에서 **[활용신청]**. 자동승인이면 즉시, 심의건이면 1~2일.
2. 마이페이지에서 **인증키(serviceKey)** 확인. (키 활성화까지 몇 분~1시간 걸릴 수 있어요.)
3. 데이터셋 상세페이지의 **샘플 요청 URL**을 그대로 붙여 응답 확인:
   ```sh
   node probe.mjs url "https://apis.data.go.kr/....&serviceKey=발급키&_type=json"
   ```
4. probe 출력의 필드명을 보고 아래 env를 채워 [sources/datago.mjs](sources/datago.mjs)로 생성:
   ```sh
   DATAGO_SERVICE_KEY=발급키 \
   DATAGO_ENDPOINT="https://apis.data.go.kr/B552895/xxx/yyy" \
   DATAGO_ITEM_NAME="배추" \
   DATAGO_PRICE_FIELD="가격필드명(probe로 확인)" \
   npm run generate:datago
   ```
   - `probe:datago` 로 같은 URL을 바로 덤프할 수도 있어요.

**함정 주의**
- 인증키가 **Encoding/Decoding 2종**. 자동 인코딩하는 코드에선 보통 **Decoding 키**를 쓰세요. `SERVICE_KEY_IS_NOT_REGISTERED` 뜨면 반대 키로. (`DATAGO_KEY_ENCODED=true|false`로 강제 가능)
- 응답 기본이 **XML**인 데이터셋이 많아요 → `_type=json`(어댑터가 자동 추가) 또는 데이터셋별 파라미터로 JSON 지정. JSON이 아니면 probe가 원문을 보여줘요.
- base 도메인은 보통 `apis.data.go.kr`.

### 1) 오피넷 (한국석유공사 유가 · 대안)

1. https://www.opinet.co.kr → **OpenAPI** 메뉴에서 회원가입 후 사용 신청. 승인되면 **인증키(`code`)** 를 받아요.
2. probe로 응답 확인:
   ```sh
   OPINET_API_KEY=발급키 npm run probe:opinet
   ```
3. `avgAllPrice.do` 응답은 보통 `RESULT.OIL[]` 배열이고, 각 항목에 `PRODCD`(제품코드) / `PRODNM` / `PRICE` / `DIFF` 가 있어요.
   - 제품코드: 보통휘발유 `B027`, 자동차경유 `D047`, 고급휘발유 `B034`, 실내등유 `C004`, 부탄(LPG) `K015`. **probe 출력의 `PRODCD` 값으로 최종 확인**하세요.
   - 다른 지면: `avgSidoPrice.do`(시도별), `lowTop10.do`(최저가 TOP10) 등. `node probe.mjs url "<전체 URL>"` 로 아무 엔드포인트나 덤프할 수 있어요.

> 확정 순서 요약: **키 발급 → `npm run probe:*` 로 실제 필드명 확인 → `sources/*.mjs` 파싱부 수정 → `npm run generate:*` 로 정상 산출 확인 → 크론/호스팅 연결.**
> 두 API 모두 호출 한도·**출처 표기 의무**가 있으니 이용약관을 확인하고 `source`/`sourceUrl` 필드로 노출하세요.

## 소스 어댑터 확장

- [sources/kamis.mjs](sources/kamis.mjs) · [sources/opinet.mjs](sources/opinet.mjs) 는 **엔드포인트 구조 초안**이에요.
- 실제 `action`/코드표/응답 필드는 각 기관 OpenAPI를 신청해 받은 **규격서로 검증**한 뒤 확정하세요.
- 새 소스를 추가하려면 `getXxxQuestion(date)` 가 [schema.json](schema.json) 형태의 객체를 반환하게 만들고 `generate-daily.mjs` 의 분기에 연결하면 돼요.
- 이용약관·출처 표기 의무를 지켜주세요(`source`/`sourceUrl` 필드로 노출).

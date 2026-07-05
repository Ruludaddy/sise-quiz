---
url: 'https://developers-apps-in-toss.toss.im/tosspixel/develop.md'
description: 토스애즈 픽셀 연동 가이드예요. 전환 추적 코드 발급부터 이벤트 연동까지 안내해요.
---

# 토스애즈 픽셀 연동

토스애즈를 사용하고 있다면 앱인토스 미니앱에 토스 픽셀을 설치해 전환 이벤트를 수집할 수 있어요.\
수집한 데이터를 기반으로 광고 성과를 최적화할 수 있어요.

::: tip 토스 픽셀은 Web 환경에서만 동작해요
React Native 환경에서는 지원되지 않아요.
:::

## 1. 전환 추적 코드 발급받기

전달받은 계정으로 토스 광고 콘솔에 로그인해 주세요.

광고 도구 > 전환 및 추적 연동 메뉴를 선택해 주세요.

![](/assets/pixel_console_1.DdNqIuqs.webp)

전환 추적 코드를 생성해 주세요.\
전환 추적 코드는 광고 계정 단위로 발급돼요.

![](/assets/pixel_console_2.Bp7lpRrl.webp)

생성된 전환 추적 코드 ID를 복사해 주세요.

![](/assets/pixel_console_3.C3do84Aw.webp)

## 2. 픽셀 스크립트 설치하기

픽셀을 사용하려면 HTML의 `<head>` 영역에 아래 스크립트를 추가해 주세요.

```html
<script src="https://static.toss.im/lex/v1.js"></script>
```

## 3. 이벤트 연동하기

이벤트가 발생하는 시점에 맞춰 픽셀 이벤트를 호출해야 정확한 데이터 수집이 가능해요.

::: tip 하나의 전환 추적 코드를 사용해 주세요
하나의 전환 추적 코드로 모든 이벤트를 관리할 수 있어요.
:::

| 분류        | 이벤트명                   | 이벤트 라벨    |
| ----------- | -------------------------- | -------------- |
| 결제        | 결제 상품 상세 페이지 조회 | PRODUCT\_VIEW   |
|             | 결제 완료                  | PURCHASE       |
|             | 첫 구매 완료               | FIRST\_PURCHASE |
|             | 구독 완료                  | SUBSCRIBE      |
| 광고        | 인앱 광고 노출             | AD\_IMPRESSION  |
| 로그인      | 토스 로그인 완료           | SIGNIN         |
| 페이지 조회 | 전환 유도 페이지 조회      | PAGE\_VIEW      |
| 커스텀      | 커스텀 이벤트              | -              |

## 4. 이벤트별 연동 방법

**결제**

인앱 결제 또는 토스 페이를 사용하는 경우 결제 데이터를 수집할 수 있어요.

**결제 상품 상세 페이지 조회(`PRODUCT_VIEW`)**

상품 상세 페이지를 조회한 시점에 호출해 주세요.

```html
<script>
  TossPixel('전환 추적 코드').productView({
    product_id: 'P12345',
    product_name: '오가닉 코튼 티셔츠',
    category_id: 'C100',
    category_name: '상의',
    price: 39000,
    currency: 'KRW',
  });
</script>
```

**결제 완료(`PURCHASE`)**

결제가 정상적으로 완료된 직후 호출해 주세요.

```html
<script>
  TossPixel('전환 코드').purchase({
    order_id: 'ORDER_20260423_0001',
    revenue: 78000,
    total_quantity: 2,
    currency: 'KRW',
    purchase_type: 'CARD',
    products: [
      {
        product_id: 'P12345',
        product_name: '오가닉 코튼 티셔츠',
        category_id: 'C100',
        category_name: '상의',
        price: 39000,
        quantity: 1,
      },
      {
        product_id: 'P67890',
        product_name: '와이드 데님 팬츠',
        category_id: 'C200',
        category_name: '하의',
        price: 39000,
        quantity: 1,
      },
    ],
    custom_param1: 'member_purchase',
    custom_param2: 'spring_campaign',
  });
</script>
```

**첫 구매 완료(`FIRST_PURCHASE`)**

사용자의 첫 구매가 완료된 시점에 호출해 주세요.

```html
<script>
  TossPixel('전환 코드').firstPurchase({
    order_id: 'ORDER_20260423_0002',
    revenue: 39000,
    total_quantity: 1,
    currency: 'KRW',
    purchase_type: 'CARD',
    products: [
      {
        product_id: 'P12345',
        product_name: '오가닉 코튼 티셔츠',
        category_id: 'C100',
        category_name: '상의',
        price: 39000,
        quantity: 1,
      },
    ],
    custom_param1: 'new_buyer',
  });
</script>
```

**구독 완료(`SUBSCRIBE`)**

구독 결제가 시작된 시점에 호출해 주세요.

```html
<script>
  TossPixel('전환 코드').subscribe({
    lead_type: 'Newsletter',
    custom_param1: 'push_opt_in',
    custom_param2: 'app',
  });
</script>
```

***

**광고**

**인앱 광고 노출(`AD_IMPRESSION`)**

광고가 노출되는 시점(예: `show` 함수 호출 직후) 호출해주세요.

```html
<script type="text/javascript">
  new TossPixel('전환 추적 코드').adImpression();
</script>
```

***

**로그인**

**토스 로그인 완료(`SIGNIN`)**

토스 로그인이 완료된 시점에 호출해 주세요.

```html
<script>
  TossPixel('전환 코드').signIn({
    custom_param1: 'email',
    custom_param2: 'existing_user',
  });
</script>
```

***

**페이지 조회**

**전환유도 페이지 조회(`PAGE_VIEW`)**

특정 페이지를 방문한 시점에 호출해 주세요.\
전환과 밀접한 페이지를 측정할 때 사용하면 좋아요.

```html
<script>
  TossPixel('전환 코드').pageView({
    custom_param1: 'all_page',
    custom_param2: 'web',
  });
</script>
```

***

**커스텀 이벤트**

표준 이벤트에 해당하지 않는 전환을 추적할 때 사용해요.\
이벤트 이름은 자유롭게 정의할 수 있어요.

```html
<script>
  TossPixel('전환 코드').custom('BUTTON_CLICK', {
    product_id: 'P12345',
    product_name: '오가닉 코튼 티셔츠',
    category_id: 'C100',
    price: 39000,
    currency: 'KRW',
  });
</script>
```

***

**커스텀 프로퍼티**

모든 이벤트(표준 이벤트, 커스텀 이벤트)에 custom\_param1 ~ custom\_param5를 추가할 수 있어요.

표준 파라미터로 표현하기 어려운 추가 정보를 전달할 때 사용해요.\
예를 들어 캠페인 구분값, 프로모션 코드, A/B 테스트 그룹, 유입 경로 등을 담을 수 있어요.

```html
<!-- 표준 이벤트에 커스텀 프로퍼티 추가 -->
<script>
  TossPixel('전환 코드').purchase({
    total_price: 78000,
    currency: 'KRW',
    custom_param1: 'summer_sale',
    custom_param2: 'landing_A',
  });
</script>

<!-- 커스텀 이벤트에 커스텀 프로퍼티 추가 -->
<script>
  new TossPixel('전환 코드').custom('BUTTON_CLICK', {
    product_id: 'P12345',
    custom_param1: 'cta_top',
    custom_param2: 'variant_B',
  });
</script>
```

***

## 5. 테스트하기

토스 픽셀 헬퍼를 사용하면 로컬 환경에서 픽셀 이벤트가 올바르게 동작하는지 확인할 수 있어요.

**토스 픽셀 헬퍼 설치하기**

토스 픽셀 헬퍼는 웹사이트에 설치된 토스 픽셀이 정상적으로 동작하는지 확인할 수 있는 크롬 확장 프로그램이에요.

* 토스 픽셀이 설치된 웹사이트를 자동으로 감지해요.
* 결제, 광고, 로그인 등 이벤트의 수집 여부를 실시간으로 확인할 수 있어요.

[토스 픽셀 헬퍼 크롬 확장 프로그램](https://chromewebstore.google.com/detail/toss-pixel-helper/kbbggbgnfmbpjpaieklnbbjfkjkkpcbi?utm_source=item-share-cb) 페이지에서 **Chrome에 추가** 버튼을 클릭해 설치해 주세요.

![](/assets/pixel_helper_install.C_ciAmLq.webp)

**크롬 브라우저에서 확인하기**

1. 아래 명령어로 프로젝트를 실행해 주세요.

::: code-group

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

```sh [pnpm]
pnpm run dev
```

:::

2. 크롬 브라우저에서 로컬 서비스에 접속해 주세요.

   `http://localhost:5173`

3. 브라우저 우측 상단의 토스 픽셀 헬퍼 아이콘을 클릭해 주세요.

![](/resources/pixel/pixel_helper_0.webp)

4. 토스 픽셀이 정상적으로 설치됐다면 수집 중인 이벤트 목록(PURCHASE, PAGE\_VIEW 등)이 표시돼요.\
   이벤트 발송 여부와 파라미터(금액, ID 등) 포함 여부를 함께 확인할 수 있어요.

![](/assets/pixel_helper_1.DQ0yBidr.webp)

![](/assets/pixel_helper_2.rLNjL1Ws.webp)

***

## 자주 묻는 질문

---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/분석/Analytics.md
description: 'Analytics 객체를 초기화하고 클릭, 노출, 영역 이벤트를 로깅하는 방법을 안내해요.'
---

# 사용자 행동 기록

`Analytics`는 사용자의 행동을 기록하고 분석하기 위한 객체예요.\
화면 진입, 버튼 클릭, 컴포넌트 노출 등의 이벤트를 수집해서 서비스 개선과 사용자 흐름 분석에 활용할 수 있어요.

::: tip 사전 요구사항을 확인해 주세요

* SDK 버전 **`v1.0.3`** 이상이어야 해요.
* 샌드박스나 QR 테스트 환경에서는 이벤트가 수집되지 않아요. 라이브 환경에서만 수집돼요.
* 서비스 런칭 **다음 날(+1일)** 부터 콘솔 **분석 > 이벤트** 화면에서 데이터를 확인할 수 있어요.
  :::

자세한 로깅 전략과 베스트 프랙티스는 [로그(이벤트) 가이드](/analytics/logging.html)를 참고해 주세요.

***

**시그니처**

```typescript
Analytics: {
    readonly init: typeof init;
    readonly Screen: typeof LoggingScreen;
    readonly Press: import("react").ForwardRefExoticComponent<import(".").LoggingPressProps & import("react").RefAttributes<unknown>>;
    readonly Impression: typeof LoggingImpression;
    readonly Area: typeof LoggingArea;
}
```

**프로퍼티**

***

## 분석 초기화하기

**`Analytics.init`**

`Analytics.init`은 분석 기능을 시작할 때 설정을 적용하는 함수예요.\
`Analytics.Press`, `Analytics.Impression`, `Analytics.Area`를 사용하기 전에 반드시 호출해야 해요.

**시그니처**

```typescript
declare function init(options: AnalyticsConfig): void;
```

**파라미터**

***

## 클릭 이벤트 기록하기

**`Analytics.Press`**

`Analytics.Press`는 사용자가 요소를 눌렀을 때 클릭 이벤트를 기록하는 컴포넌트예요.\
버튼 클릭, 구매 액션처럼 사용자 인터랙션이 발생하는 지점을 감싸서 사용해요.

::: tip 클릭 이벤트는 라이브 환경에서만 수집돼요
샌드박스나 QR 테스트 환경에서는 클릭 이벤트가 실제로 쌓이지 않아요.\
콘솔에서 데이터를 확인할 수 있는 시점은 **런칭 다음 날(+1일)** 이에요.
:::

**시그니처**

```typescript
LoggingPress: import('react').ForwardRefExoticComponent<LoggingPressProps & import('react').RefAttributes<unknown>>;
```

**예제**

```tsx
import { Analytics } from '@apps-in-toss/framework';
import { Button } from 'react-native';

// 클릭 가능한 요소의 클릭 이벤트를 자동으로 수집해요.
function TrackElements() {
  return (
    <Analytics.Press>
      <Button label="Press Me" />
    </Analytics.Press>
  );
}
```

***

## 노출 이벤트 기록하기

**`Analytics.Impression`**

`Analytics.Impression`은 요소가 뷰포트에 표시되었는지 감지하고 노출 이벤트를 기록하는 컴포넌트예요.\
스크롤 아래에 위치한 상품, 배너, 카드 등의 노출 여부를 추적할 때 사용해요.

**시그니처**

```typescript
function LoggingImpression({
  enabled,
  impression: impressionType,
  ...props
}: LoggingImpressionProps): import('react/jsx-runtime').JSX.Element;
```

**예제**

```tsx
import { Analytics } from '@apps-in-toss/framework';

// 영역 안의 노출 정보를 자동으로 수집해요.
function TrackElements() {
  return (
    <Analytics.Impression>
      <Text>Hello</Text>
    </Analytics.Impression>
  );
}
```

***

## 영역 단위로 묶어 기록하기

**`Analytics.Area`**

`Analytics.Area`는 여러 컴포넌트를 하나의 영역으로 묶어 노출과 클릭 이벤트를 함께 기록하는 컴포넌트예요.\
지정한 영역이 노출되거나 클릭됐을 때 하나의 로그로 집계할 수 있어요.

**시그니처**

```typescript
function LoggingArea({
  children,
  params: _params,
  ...props
}: LoggingAreaProps): import('react/jsx-runtime').JSX.Element;
```

**예제**

```tsx
import { Analytics } from '@apps-in-toss/framework';
import { View, Text } from 'react-native';

// 영역 안의 노출이나 클릭 정보를 자동으로 수집해요.
function TrackElements() {
  return (
    <Analytics.Area>
      <View>
        <Text>Hello</Text>
        <Text>World!</Text>
      </View>
    </Analytics.Area>
  );
}
```

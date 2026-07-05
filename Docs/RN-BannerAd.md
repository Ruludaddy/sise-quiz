---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/RN-BannerAd.md
description: React Native에서 배너 광고를 표시하는 방법을 안내해요.
---

# 인앱 광고 - 배너 광고(React Native)

서비스 소개와 콘솔 설정 방법은 [인앱 광고 소개](/ads/intro.html) 문서를 참고해 주세요.

React Native에서는 `TossAds.attachBanner` 대신 `InlineAd` 컴포넌트를 사용해 배너를 렌더링해요.

## 시작하기

`InlineAd`는 토스 앱 5.241.0 이상에서 사용할 수 있어요.

| 토스 앱 버전     | 지원 여부 | 설명                    |
| ---------------- | --------- | ----------------------- |
| **5.241.0 이상** | 지원      | 배너 광고 사용 가능     |
| **5.241.0 미만** | 미지원    | 배너 광고 API 사용 불가 |

::: tip 5.241.0 미만 버전 예외 처리
토스앱 5.241.0 미만에서는 빈 화면이 노출될 수 있으니 반드시 예외 처리를 해주세요.\
[토스앱 버전 가져오기](/bedrock/reference/framework/환경%20확인/version.html) 기능을 사용해 예외 처리를 해주세요.
:::

개발 단계에서는 테스트용 광고 ID를 사용해요.

| 유형                  | 테스트 ID                         |
| --------------------- | --------------------------------- |
| 배너 광고 - 리스트형 | `ait-ad-test-banner-id`           |
| 배너 광고 - 피드형   | `ait-ad-test-native-image-id`     |

**빠른 시작**

```tsx
import { InlineAd } from '@apps-in-toss/framework';

export function BannerSection() {
  return (
    <InlineAd
      adGroupId="ait-ad-test-banner-id"
      theme="auto"
      tone="blackAndWhite"
      variant="expanded"
      onAdRendered={(payload) => console.log('onAdRendered', payload)}
      onAdImpression={(payload) => console.log('onAdImpression', payload)}
      onAdViewable={(payload) => console.log('onAdViewable', payload)}
      onAdClicked={(payload) => console.log('onAdClicked', payload)}
      onNoFill={(payload) => console.log('onNoFill', payload)}
      onAdFailedToRender={(payload) => console.log('onAdFailedToRender', payload)}
    />
  );
}
```

## API 레퍼런스

**개요**

| 항목     | 값                         |
| -------- | -------------------------- |
| 패키지   | `@apps-in-toss/framework`  |
| 주요 API | `InlineAd` 컴포넌트        |
| 전제     | 토스 앱 환경, 5.241.0 이상 |

RN `InlineAd` 문서에서는 WebView 배너 광고의 `initialize`, `attachBanner`, `destroyAll`을 기본 경로로 안내하지 않아요.

**Props**

```tsx
type InlineAdTheme = 'auto' | 'light' | 'dark';
type InlineAdTone = 'blackAndWhite' | 'grey';
type InlineAdVariant = 'expanded' | 'card';

interface InlineAdProps {
  adGroupId: string;
  theme?: InlineAdTheme;
  tone?: InlineAdTone;
  variant?: InlineAdVariant;
  impressFallbackOnMount?: boolean;
}
```

| Prop                     | 타입                    | 설명                                                                 |
| ------------------------ | ----------------------- | -------------------------------------------------------------------- |
| `adGroupId`              | `string`                | 필수 값이에요. 콘솔에서 발급받은 광고 그룹 ID를 전달해요.            |
| `theme`                  | `InlineAdTheme`         | 기본값은 `auto`예요.                                                 |
| `tone`                   | `InlineAdTone`          | 기본값은 `blackAndWhite`예요.                                        |
| `variant`                | `InlineAdVariant`       | 기본값은 `expanded`예요.                                             |
| `impressFallbackOnMount` | `boolean`               | `IOScrollView`를 쓰기 어려울 때 노출 이벤트 fallback 처리를 켜요.    |

**콜백 및 페이로드**

```tsx
interface BannerSlotEventPayload {
  slotId: string;
  adGroupId: string;
  adMetadata: {
    creativeId: string;
    requestId: string;
    styleId: string;
  };
}

interface BannerSlotErrorPayload {
  slotId: string;
  adGroupId: string;
  adMetadata: {};
  error: {
    code: number;
    message: string;
    domain?: string;
  };
}
```

| 콜백                 | 발생 시점                                      |
| -------------------- | ---------------------------------------------- |
| `onAdRendered`       | 광고 데이터가 렌더 가능한 상태가 된 직후예요. |
| `onAdImpression`     | `IMP_1PX` 시점이에요. 수익 이벤트 기준이에요. |
| `onAdViewable`       | 50% 이상 노출 상태가 1초 유지된 시점이에요.   |
| `onAdClicked`        | 사용자가 광고 영역을 클릭한 시점이에요.       |
| `onNoFill`           | 광고 재고가 없을 때 호출돼요.                 |
| `onAdFailedToRender` | 렌더 실패, 환경 미지원, 파라미터 오류예요.    |

**이벤트 흐름**

```text
InlineAd mount 또는 adGroupId 변경
↓
광고 로드(loadAd)
↓
onAdRendered
↓
onAdImpression (IMP_1PX)
↓
onAdViewable (50% 노출 + 1초 유지)
↓
onAdClicked (사용자 클릭 시)
```

**리프레시 동작**

* 앱/화면 visibility가 `visible`로 돌아왔을 때, 마지막 `IMP_1PX` 이후 10초 이상 지났으면 재로드돼요.

**에러 처리**

* 미지원 환경: `This feature is not supported in the current environment`
* `adGroupId` 누락/잘못된 값: `onAdFailedToRender`로 에러 payload 전달
* 광고 없음: `onNoFill`
* 서버/네트워크/내부 오류: `onAdFailedToRender`

## 노출과 레이아웃

`InlineAd`는 노출 측정을 위해 `IOContext.Provider` 컨텍스트를 사용해요.\
아래 둘 중 하나를 반드시 만족해야 해요.

| 조건                                    | 권장 설정                                            |
| --------------------------------------- | ---------------------------------------------------- |
| 최상위 스크롤 컨테이너를 제어할 수 있음 | `@granite-js/react-native`의 `IOScrollView`로 감싸기 |
| `IOScrollView` 적용이 어려움            | `InlineAd`에 `impressFallbackOnMount={true}` 설정    |

**권장 패턴: `IOScrollView` 사용**

```tsx
import { IOScrollView } from '@granite-js/react-native';
import { InlineAd } from '@apps-in-toss/framework';

export function Screen() {
  return (
    <IOScrollView>
      <InlineAd adGroupId="ait-ad-test-banner-id" />
    </IOScrollView>
  );
}
```

**대체 패턴: fallback 사용**

:::tip prop 사용

`impressFallbackOnMount` prop은 IOScrollView 컨텍스트가 없어도 InlineAd가 마운트될 때 노출(impression) fallback 로직을 수행해요.
:::

```tsx
import { ScrollView } from 'react-native';
import { InlineAd } from '@apps-in-toss/framework';

export function Screen() {
  return (
    <ScrollView>
      <InlineAd adGroupId="ait-ad-test-banner-id" impressFallbackOnMount={true} />
    </ScrollView>
  );
}
```

**레이아웃 가이드**

* 고정형: 너비 `100%`, 높이 `96` 권장
* 인라인: 너비 `100%`, 높이 미지정(콘텐츠 높이 자동)

```tsx
import { View } from 'react-native';
import { InlineAd } from '@apps-in-toss/framework';

export function FixedBanner() {
  return (
    <View style={{ width: '100%', height: 96, overflow: 'hidden' }}>
      <InlineAd adGroupId="ait-ad-test-banner-id" />
    </View>
  );
}

export function InlineBanner() {
  return (
    <View style={{ width: '100%' }}>
      <InlineAd adGroupId="ait-ad-test-banner-id" />
    </View>
  );
}
```

## 광고 정책과 테스트

**토스 애즈 SSP 정책**

아래 정책을 반드시 지켜주세요. 위반할 경우 광고 노출이 제한될 수 있어요.

| **유형**                  | **금지 행위**                                                 | **구체적 예시**                                                                                        | **준수 사항**                                                              |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **UI 조작**               | 광고·콘텐츠 구분이 불명확하거나 사용자를 오인시키는 배너 변경 | "추천 서비스", "금융 팁" 등으로 광고를 위장, CTA 문구 임의 변경                                        | 광고는 반드시 "ad" 표기 유지, 광고 타이틀·라벨 임의 수정 금지              |
| **광고 로직 변조**        | SDK 기본 클릭·노출 로직 수정, 자동 리프레시·리디렉션 추가     | web-public에서 광고 클릭 시 별도 페이지로 강제 이동, Back 버튼 차단 / Dead-end 구조 / ATF 첫 화면 광고 | SDK 기본 이벤트(Click / Impression) 구조 변조 금지. SDK 외부 API 호출 불가 |
| **자동화 트래픽**         | 자동 클릭·자동 새로고침 등 비정상 노출 유도                   | 광고 영역을 주기적 refresh 처리, Back 버튼 차단 / Dead-end 구조 / ATF 첫 화면 광고                     | 트래픽 조작 감지 시 SSP 로그 차단 + 정산 보류                              |
| **광고 디자인 임의 수정** | 광고 색상, 배치, CTA, 크기 등 임의 변경                       | Toss Ads 가이드 외 광고 단위의 색상·글꼴 변경                                                          | 모든 광고 UI는 **web-base 표준 컴포넌트** 사용 필수                        |
| **보상·참여형 클릭**      | 클릭 시 리워드·이벤트 제공 문구 추가                          | "광고 클릭 시 포인트 지급" / "참여하면 혜택"                                                           | 클릭 보상성 문구·이벤트 연동 금지                                          |
| **광고 은닉 또는 겹침**   | 다른 요소 위에 배너를 덮거나 숨김                             | 다른 카드 UI 뒤에 광고 DOM 삽입                                                                        | 광고는 노출 상태가 명확히 확인 가능해야 함                                 |

**UX / Product Principle 운영 원칙**

광고도 토스의 UX 원칙을 따라야 해요.

| **Toss Principle**             | **적용 기준**                                                     | **예시**                                  |
| ------------------------------ | ----------------------------------------------------------------- | ----------------------------------------- |
| **Simplicity**                 | 광고는 명료해야 하며, 추가 설명 없이 의미를 이해할 수 있어야 해요 | "지금 보기", "광고 보기" 등 명확 CTA 사용 |
| **Clear Action**               | 광고 클릭 후 어떤 행동이 발생할지 사용자가 예측 가능해야 해요     | 리디렉션·새창 이동 시 고지 문구 노출      |
| **No Deception (UX Red Rule)** | 광고가 예상치 못한 순간, 형태, 위치에서 등장하지 않아야 해요      | 서비스 진입 직후 전면 배너 금지           |
| **Value First**                | 광고는 고객의 서비스 목표를 방해하지 않아야 해요                  | 결제/계좌 개설 흐름 중 광고 삽입 금지     |

**테스트하기**

개발 단계에서는 반드시 테스트용 광고 ID를 사용해요.\
실제 광고 ID로 테스트하면 정책 위반으로 간주해 불이익을 받을 수 있어요.
RN 배너 광고 테스트 ID는 [시작하기](#시작하기)에서 확인할 수 있어요.

출시 전에 아래 항목을 꼭 확인해 주세요.

* 광고가 정상적으로 로드되는지 확인해요.
* 클릭 시 의도한 화면으로 이동하는지 확인해요.
* 뒤로 가기 동작이 정상적으로 작동하는지 확인해요.
* 결제나 인증 흐름을 방해하지 않는지 확인해요.

***

## 자주 묻는 질문

\<FaqAccordion :items='\[
{
q: "광고가 보이지 않아요",
a: \`1. 토스 앱 환경 및 최소 버전을 확인해 주세요.

---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.md
description: '내비게이션 바의 기본 기능과 액세서리 아이콘, 홈 버튼, 아이콘과 타이틀 표시 설정 방법을 안내해요.'
---

# 내비게이션 바 설정

내비게이션 바는 화면 상단에 고정되어 있는 공통 UI 컴포넌트예요.
앱인토스 SDK를 적용하면 내비게이션 바는 별도 구현 없이 자동으로 표시돼요.

::: tip 참고하세요
미니앱 로고 설정은 [WebView 설정](/bedrock/reference/framework/UI/Config.html) 또는 [React Native 설정](/bedrock/reference/framework/UI/RNConfig.html) 문서를 참고해 주세요.
:::

***

## 1. 내비게이션 바 기본 기능

### 게임

게임용 내비게이션 바는 **더보기 버튼**과 **닫기(X) 버튼**으로 구성돼요.
`granite.config.ts`에서 앱 타입을 `game`으로 설정하면 게임 내비게이션 바를 사용할 수 있어요.

::: code-group

```typescript [WebView]
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // ...
  webViewProps: {
    type: 'game',
  },
});
```

```typescript [React Native]
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  // ...
  plugins: [
    appsInToss({
      // ...
      appType: 'game',
    }),
  ],
});
```

:::

::: tip 참고하세요

* [safeArea](/bedrock/reference/framework/화면%20제어/safe-area.md) 문서를 참고하여 X 버튼이 게임 화면의 다른 버튼과 겹치지 않도록 개발해 주세요.

:::

![](/assets/thumbnail-navigation-game.ZQ2UIf6v.webp)

### 비게임

비게임 미니앱에서는 흰색 배경의 내비게이션 바가 기본으로 제공돼요.\
좌측에는 **미니앱 로고**와 **이름**이, 우측에는 **더보기 버튼**과 **X 버튼**이 위치해요.

![](/assets/thumbnail-navigation-nongame.Bg9v_lP3.webp)

### 더보기 버튼 기능

더보기 버튼을 통해 아래 기능들을 별도 서버 연동이나 추가 구현 없이 바로 사용할 수 있어요.

#### 문의하기 / 신고하기

콘솔에 등록한 **고객센터 링크와 홈페이지 주소**가 자동으로 표시돼요.\
신고하기 기능을 통해 사용자가 제보를 보낼 수 있고, 파트너사는 콘솔을 통해 제보 내용을 확인할 수 있어요.

![](/assets/nav_declare.BaVkyT3D.webp)

#### 공유하기

사용자는 미니앱을 다른 사람에게 쉽게 공유할 수 있어요.\
공유 시 **미니앱 이름**과 **딥링크 주소**가 함께 전송돼요.

![](/assets/nav_share.BwRdR0Pi.webp)

#### 권한 설정

사용자는 미니앱이 요청하는 권한을 확인하고, 언제든지 ON/OFF로 제어할 수 있어요.

![](/assets/nav_permission.CXs4yPyx.webp)

#### 홈 화면에 추가하기

자주 사용하는 미니앱을 휴대폰 홈 화면에 바로 등록할 수 있어요.\
토스앱 5.246.0 이상부터 확인할 수 있어요.

![](/assets/nav_shortcut.CFq3cu_h.webp)

#### 미니앱 용량 삭제

자주 사용하지 않는 미니앱의 용량을 선택적으로 삭제할 수 있어요.\
미니앱 내비게이션 바의 설정 버튼을 통해 서비스별 데이터를 삭제할 수 있어요.

![](/assets/nav_cashdelete.CRCxb-W-.webp)

#### 미니앱 알림 ON/OFF

미니앱별 알림 수신 여부를 직접 설정할 수 있어요.\
미니앱 내비게이션 바의 설정 버튼을 통해 서비스별 알림을 ON/OFF 할 수 있어요.

![](/assets/nav_notice.nX6mbHNn.webp)

***

## 2. 내비게이션 바 커스터마이징

`granite.config.ts`의 `navigationBar` 옵션으로 내비게이션 바의 표시 방식을 설정할 수 있어요.

```typescript
interface NavigationBarOptions {
  withBackButton?: boolean;
  withHomeButton?: boolean;
  withIcon?: boolean;
  withTitle?: boolean;
  transparentBackground?: boolean;
  theme?: 'light' | 'dark';
  initialAccessoryButton?: InitialAccessoryButton;
}

interface InitialAccessoryButton {
  id: string;
  title?: string;
  icon: {
    name: string;
  };
}
```

* **`withBackButton`** — 내비게이션 바 왼쪽에 뒤로가기 버튼을 표시할지 설정해요.
* **`withHomeButton`** — 비게임 미니앱에서 홈으로 이동하는 버튼을 표시할지 설정해요.
* **`withIcon`** — 내비게이션 바 왼쪽에 미니앱 아이콘을 표시할지 설정해요.
* **`withTitle`** — 내비게이션 바 왼쪽에 미니앱 이름을 표시할지 설정해요.
* **`transparentBackground`** — 내비게이션 바 배경을 투명하게 설정할지 정해요. 콘텐츠가 내비게이션 바 아래로 이어지는 풀스크린 레이아웃에 적합해요.
* **`theme`** — 내비게이션 바 테마를 `light` 또는 `dark`로 설정해요. 배경색에 맞춰 버튼과 텍스트 색상을 조정할 때 사용해요.
* **`initialAccessoryButton`** — 더보기 버튼 왼쪽 영역에 액세서리 아이콘을 초기 노출해요. 한 번에 1개만 표시할 수 있어요.

예를 들어 미니앱 아이콘과 이름을 숨기고, 어두운 배경 위에 내비게이션 바를 올리고 싶다면 아래처럼 설정할 수 있어요.

```typescript
navigationBar: {
  theme: 'dark',
  transparentBackground: true,
  withIcon: false,
  withTitle: false,
}
```

홈 버튼과 액세서리 아이콘을 초기 노출하려면 아래처럼 설정해요.

```typescript
navigationBar: {
  withBackButton: true,
  withHomeButton: true,
  initialAccessoryButton: {
    id: 'heart',
    title: 'Heart',
    icon: {
      name: 'icon-heart-mono',
    },
  },
}
```

비게임에서도 게임처럼 화면 몰입도를 높이고 싶다면 투명한 배경에 더보기 버튼과 닫기 버튼만 남긴 내비게이션 바를 구성할 수 있어요.

::: code-group

```typescript [WebView]
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // ...
  navigationBar: {
    withBackButton: false,
    withHomeButton: false,
    withIcon: false,
    withTitle: false,
    transparentBackground: true,
  },
});
```

```typescript [React Native]
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  // ...
  plugins: [
    appsInToss({
      // ...
      navigationBar: {
        withBackButton: false,
        withHomeButton: false,
        withIcon: false,
        withTitle: false,
        transparentBackground: true,
      },
    }),
  ],
});
```

:::

***

## 3. 디자인 가이드

상단 내비게이션은 사용자에게 일관된 정보 구조를 전달하기 위해 **모노톤 아이콘**만을 사용해요.\
컬러 아이콘은 시각적 주의를 과도하게 분산시키고, 불필요한 강조로 혼란을 줄 수 있기 때문이에요.\
특수한 케이스를 제외하고는 모두 **모노톤 아이콘으로 통일**해 사용하고 있어요.

![](/assets/navi.DxPXl6PV.webp)

***

## 4. 액세서리 아이콘 추가하기

게임, 비게임 미니앱 모두 우측 상단 **더보기 버튼 왼쪽 영역**에 아이콘을 한 개 추가할 수 있어요.

### 플랫폼별 설정 방식

* **WebView**
  * `partner.addAccessoryButton()`으로 런타임에 버튼을 추가할 수 있어요.
  * 클릭 이벤트는 `tdsEvent.addEventListener('navigationAccessoryEvent')`로 받아요.
  * 초기 노출은 `defineConfig`의 `navigationBar.initialAccessoryButton` 옵션을 사용해요.

* **React Native**
  * `useTopNavigation()`의 `addAccessoryButton()`으로 런타임에 버튼을 추가할 수 있어요.
  * 또는 `granite.config.ts`의 `navigationBar.initialAccessoryButton`을 사용해 초기 상태에서 버튼을 노출할 수 있어요.

```typescript
interface NavigationBarOptions {
  withBackButton?: boolean; // 뒤로가기 버튼 유무
  withHomeButton?: boolean; // 홈버튼 유무
  withIcon?: boolean; // 미니앱 아이콘 표시 여부
  withTitle?: boolean; // 미니앱 이름 표시 여부
  transparentBackground?: boolean; // 배경 투명 여부
  theme?: 'light' | 'dark'; // 내비게이션 바 테마
  initialAccessoryButton?: InitialAccessoryButton; // 1개만 노출 가능
}

interface InitialAccessoryButton {
  id: string;
  title?: string;
  icon: {
    name: string;
  };
}
```

### 초기 설정

::: code-group

```tsx [Web]
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // ...
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    withIcon: false,
    withTitle: false,
    initialAccessoryButton: {
      id: 'heart',
      title: 'Heart',
      icon: {
        name: 'icon-heart-mono',
      },
    },
  },
});
```

```tsx [React Native]
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  // ...
  plugins: [
    appsInToss({
      // ...
      navigationBar: {
        withBackButton: true,
        withHomeButton: true,
        withIcon: false,
        withTitle: false,
        initialAccessoryButton: {
          icon: {
            name: 'icon-heart-mono',
          },
          id: 'heart',
          title: '하트',
        },
      },
    }),
  ],
});
```

:::

### 동적 추가

::: code-group

```js [Web (JS)]
import { partner, tdsEvent } from '@apps-in-toss/web-framework';

partner.addAccessoryButton({
  id: 'heart',
  title: '하트',
  icon: {
    name: 'icon-heart-mono',
  },
});

const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
  onEvent: ({ id }) => {
    if (id === 'heart') {
      console.log('버튼 클릭');
    }
  },
});

window.addEventListener('pagehide', () => {
  cleanup();
});
```

```tsx [Web (React)]
import { partner, tdsEvent } from '@apps-in-toss/web-framework';

useEffect(() => {
  partner.addAccessoryButton({
    id: 'heart',
    title: '하트',
    icon: {
      name: 'icon-heart-mono',
    },
  });

  const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
    onEvent: ({ id }) => {
      if (id === 'heart') {
        console.log('버튼 클릭');
      }
    },
  });

  return cleanup;
}, []);
```

```tsx [React Native]
import { useTopNavigation } from '@apps-in-toss/framework';
import { tdsEvent } from '@toss/tds-react-native';

const { addAccessoryButton } = useTopNavigation();

addAccessoryButton({
  id: 'heart',
  title: '하트',
  icon: {
    name: 'icon-heart-mono',
  },
  onPress: () => console.log('버튼 클릭'),
});

useEffect(() => {
  const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
    onEvent: ({ id }) => {
      if (id === 'heart') {
        console.log('heart 클릭됨');
      }
    },
  });

  return () => {
    cleanup();
  };
}, []);
```

:::

***

## 5. 홈 버튼 추가하기

비게임 미니앱에서는 왼쪽 상단에 **홈으로 이동하는 버튼**을 표시할 수 있어요.\
홈 버튼은 서비스 이름 오른쪽에 위치하며, 사용자가 언제든 첫 화면으로 돌아올 수 있도록 도와줘요.\
홈 버튼 관련 동작 제어는 [이벤트 제어하기](/bedrock/reference/framework/이벤트%20제어/back-event.html) 문서를 참고해 주세요.

::: tip 주의해주세요

* 오른쪽 액세서리 버튼 영역에는 홈 버튼을 중복 추가하지 말아주세요.
* 홈 버튼은 "서비스 진입점" 역할만 수행하며, 커스텀 기능이나 문구 추가는 불가능해요.
  :::

```typescript
interface NavigationBarOptions {
  withHomeButton?: boolean; // 홈 버튼 표시 여부
}
```

```tsx
navigationBar: {
  withBackButton: true,
  withHomeButton: true,
}
```

***

## 참고사항

* 액세서리 버튼은 **모노톤 아이콘**만 지원돼요.
* 한 번에 표시할 수 있는 액세서리 버튼은 1개뿐이에요.
* 컬러 아이콘이나 커스텀 UI 추가는 지원하지 않아요.
* 홈 버튼은 비게임 미니앱에서만 사용 가능해요.

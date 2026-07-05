---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면
  제어/screen-properties.md
description: '화면 방향, 항상 켜짐, 캡처 차단 등 화면 속성을 설정하는 방법을 안내해요.'
---

# 화면 속성

***

## 1. 화면 방향 설정하기 (`setDeviceOrientation`)

기기의 화면 방향을 가로 또는 세로로 설정해요.\
특정 화면에서만 방향을 바꿔야 한다면, 화면을 벗어날 때 반드시 원래 방향으로 복구해 주세요.

**시그니처**

```typescript
function setDeviceOrientation(options: { type: 'portrait' | 'landscape' }): Promise<void>;
```

**파라미터**

**예제**

::: code-group

```js [Web (JS)]
import { setDeviceOrientation } from '@apps-in-toss/web-framework';

setDeviceOrientation({ type: 'landscape' });
```

```tsx [Web (React)]
import { setDeviceOrientation } from '@apps-in-toss/web-framework';
import { useEffect } from 'react';

function VideoScreen() {
  useEffect(() => {
    setDeviceOrientation({ type: 'landscape' });

    return () => {
      setDeviceOrientation({ type: 'portrait' }); // 화면을 벗어날 때 복구해요.
    };
  }, []);
}
```

```tsx [React Native]
import { setDeviceOrientation } from '@apps-in-toss/framework';
import { useEffect } from 'react';

function VideoScreen() {
  useEffect(() => {
    setDeviceOrientation({ type: 'landscape' });

    return () => {
      setDeviceOrientation({ type: 'portrait' }); // 화면을 벗어날 때 복구해요.
    };
  }, []);
}
```

:::

***

## 2. 화면 항상 켜짐 설정하기 (`setScreenAwakeMode`)

화면이 자동으로 꺼지지 않도록 설정해요.\
웹툰, 동영상, 문서 읽기처럼 화면을 계속 켜둬야 하는 상황에서 유용해요.\
특정 화면에서만 사용할 경우, 화면을 벗어날 때 반드시 비활성화해 주세요.

**시그니처**

```typescript
function setScreenAwakeMode(options: { enabled: boolean }): Promise<{ enabled: boolean }>;
```

**파라미터**

**예제**

::: code-group

```tsx [Web (React)]
import { setScreenAwakeMode } from '@apps-in-toss/web-framework';
import { useEffect } from 'react';

function MediaScreen() {
  useEffect(() => {
    setScreenAwakeMode({ enabled: true });

    return () => {
      setScreenAwakeMode({ enabled: false }); // 화면을 벗어날 때 복구해요.
    };
  }, []);
}
```

```tsx [React Native]
import { setScreenAwakeMode } from '@apps-in-toss/framework';
import { useEffect } from 'react';

function MediaScreen() {
  useEffect(() => {
    setScreenAwakeMode({ enabled: true });

    return () => {
      setScreenAwakeMode({ enabled: false }); // 화면을 벗어날 때 복구해요.
    };
  }, []);
}
```

:::

***

## 3. 화면 캡처 차단하기 (`setSecureScreen`)

네이티브 수준에서 화면 캡처를 차단해요.\
계좌 잔고, 거래 내역 등 민감한 정보를 표시하는 화면에서 활용할 수 있어요.

**시그니처**

```typescript
function setSecureScreen(options: { enabled: boolean }): Promise<{ enabled: boolean }>;
```

**파라미터**

**예제**

```tsx
import { setSecureScreen } from '@apps-in-toss/framework';
import { useEffect } from 'react';

function SecureScreen() {
  useEffect(() => {
    setSecureScreen({ enabled: true });

    return () => {
      setSecureScreen({ enabled: false }); // 화면을 벗어날 때 차단을 해제해요.
    };
  }, []);
}
```

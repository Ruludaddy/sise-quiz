---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/환경
  확인/version.md
description: 토스앱 버전을 확인하거나 최소 지원 버전 여부를 검사하는 방법을 안내해요.
---

# 버전

***

## 1. 토스앱 버전 가져오기 (`getTossAppVersion`)

`getTossAppVersion` 함수는 토스 앱 버전을 가져와요. 예를 들어, `5.206.0`과 같은 형태로 반환돼요.\
토스 앱 버전을 로그로 남기거나, 특정 기능이 특정 버전 이상에서만 실행될 때 사용돼요.

**시그니처**

```typescript
function getTossAppVersion(): string;
```

**반환값**

**예제**

::: code-group

```js [js]
import { getTossAppVersion } from '@apps-in-toss/web-framework';

const tossAppVersion = getTossAppVersion();
```

```tsx [React]
import { getTossAppVersion } from '@apps-in-toss/web-framework';
import { Text } from '@toss/tds-mobile';

function TossAppVersionPage() {
  const tossAppVersion = getTossAppVersion();

  return <Text>{tossAppVersion}</Text>;
}
```

```tsx [React Native]
import { getTossAppVersion } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';

function TossAppVersionPage() {
  const tossAppVersion = getTossAppVersion();

  return <Text>{tossAppVersion}</Text>;
}
```

:::

***

## 2. 앱 최소 버전 확인하기 (`isMinVersionSupported`)

이 함수는 현재 실행 중인 토스 앱의 버전이 파라미터로 전달된 최소 버전 요구사항을 충족하는지 확인해요. 특정 기능이 최신 버전에서만 동작할 때, 사용자에게 앱 업데이트를 안내할 수 있어요.

**시그니처**

```typescript
function isMinVersionSupported(minVersions: {
  android: `${number}.${number}.${number}` | 'always' | 'never';
  ios: `${number}.${number}.${number}` | 'always' | 'never';
}): boolean;
```

**파라미터**

**반환값**

**예제**

::: code-group

```js [js]
import { isMinVersionSupported } from '@apps-in-toss/web-framework';

const isSupported = isMinVersionSupported({
  android: '1.2.0',
  ios: '1.3.0',
});
```

```tsx [React]
import { isMinVersionSupported } from '@apps-in-toss/web-framework';
import { Text } from '@toss/tds-mobile';

function VersionCheck() {
  const isSupported = isMinVersionSupported({
    android: '1.2.0',
    ios: '1.3.0',
  });

  return <div>{!isSupported && <Text>최신 버전으로 업데이트가 필요해요.</Text>}</div>;
}
```

```tsx [React Native]
import { isMinVersionSupported } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';
import { View } from 'react-native';

function VersionCheck() {
  const isSupported = isMinVersionSupported({
    android: '1.2.0',
    ios: '1.3.0',
  });

  return <View>{!isSupported && <Text>최신 버전으로 업데이트가 필요해요.</Text>}</View>;
}
```

:::

---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/환경
  확인/runtime-environment.md
description: '실행 중인 플랫폼(OS), 배포 환경, 기기 고유 식별자, 초기 진입 스킴을 확인하는 방법을 안내해요.'
---

# 실행 환경

***

## 1. 실행 중인 플랫폼 확인하기 (`getPlatformOS`)

`getPlatformOS`는 현재 실행 중인 플랫폼을 확인하는 함수예요.\
`react-native`의 [`Platform.OS`](https://reactnative.dev/docs/0.72/platform#os) 값을 기반으로 동작하며, `ios` 또는 `android` 중 하나의 문자열을 반환해요.

**시그니처**

```typescript
function getPlatformOS(): 'ios' | 'android';
```

**반환값**

**예제**

```tsx
import { getPlatformOS } from '@apps-in-toss/framework';
import { Text } from 'react-native';

function Page() {
  const platform = getPlatformOS();

  return <Text>현재 플랫폼: {platform}</Text>;
}
```

***

## 2. 애플리케이션 환경 확인하기 (`getOperationalEnvironment`)

`getOperationalEnvironment` 함수로 앱이 현재 어느 배포 환경(예: `sandbox`, `toss`)에서 실행 중인지 확인할 수 있어요.\
토스 앱에서 실행 중이라면 `'toss'`, 샌드박스 환경에서 실행 중이라면 `'sandbox'`를 반환해요.

운영 환경은 앱이 실행되는 컨텍스트를 의미하며, 특정 기능의 사용 가능 여부를 판단하는 데 활용할 수 있어요.

**시그니처**

```typescript
function getOperationalEnvironment(): 'toss' | 'sandbox';
```

**반환값**

현재 운영 환경을 나타내는 문자열이에요.

**예제**

::: code-group

```js [js]
import { getOperationalEnvironment } from '@apps-in-toss/web-framework';

const environment = getOperationalEnvironment();
```

```tsx [React]
import { getOperationalEnvironment } from '@apps-in-toss/web-framework';
import { Text } from '@toss/tds-mobile';

function EnvironmentInfo() {
  const environment = getOperationalEnvironment();

  return <Text>{`현재 실행 환경은 '${environment}'입니다.`}</Text>;
}
```

```tsx [React Native]
import { getOperationalEnvironment } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';

function EnvironmentInfo() {
  const environment = getOperationalEnvironment();

  return <Text>{`현재 실행 환경은 '${environment}'입니다.`}</Text>;
}
```

:::

특정 배포 환경에서만 제공해야 하는 기능이 있을 수 있어요. 아래는 `sandbox` 환경에서만 특별한 기능을 제공하는 예시예요.

```tsx{4,8-9}
import { View, Text } from 'react-native';
import { getOperationalEnvironment } from '@apps-in-toss/framework';

const isSandbox = getOperationalEnvironment() === 'sandbox'; // 'sandbox' 환경인지 확인하는 변수

function Component() {
  const handlePress = () => {
    if (isSandbox) {
      // 'sandbox' 환경에서 제공할 기능
    } else {
      // 다른 환경에서 제공할 기능
    }
  };

  return <Button onPress={handlePress}>자세히 보기</Button>;
}
```

***

## 3. 기기 고유 식별자 확인하기 (`getDeviceId`)

`getDeviceId` 함수는 사용 중인 기기의 고유 식별자를 문자열로 반환해요.\
기기별로 설정이나 데이터를 저장하거나 사용자의 기기를 식별해서 로그를 기록하고 분석하는 데 사용할 수 있어요. 같은 사용자의 여러 기기를 구분하는 데도 유용해요.

**시그니처**

```typescript
function getDeviceId(): string;
```

**반환값**

**예제**

::: code-group

```js [js]
import { getDeviceId } from '@apps-in-toss/web-framework';

const deviceId = getDeviceId();
```

```tsx [React]
import { getDeviceId } from '@apps-in-toss/web-framework';
import { useState } from 'react';

const DeviceInfo = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const fetchDeviceId = async () => {
    setDeviceId(getDeviceId());
  };

  return (
    <div>
      <button onClick={fetchDeviceId}>기기 ID 가져오기</button>
      {deviceId && <p>Device ID: {deviceId}</p>}
    </div>
  );
};
```

```tsx [React Native]
import { getDeviceId } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';

function MyPage() {
  const id = getDeviceId();

  return <Text>사용자의 기기 고유 식별자: {id}</Text>;
}
```

:::

***

## 4. 스킴 값 가져오기 (`getSchemeUri`)

`getSchemeUri`는 처음에 화면에 진입한 스킴 값을 반환해요. 페이지 이동으로 인한 URI 변경은 반영되지 않아요.

**시그니처**

```typescript
function getSchemeUri(): string;
```

**반환값**

**예제**

```tsx
import { getSchemeUri } from '@apps-in-toss/framework';
import { Text } from 'react-native';

function MyPage() {
  const schemeUri = getSchemeUri();

  return <Text>처음에 화면에 진입한 스킴 값: {schemeUri}</Text>;
}
```

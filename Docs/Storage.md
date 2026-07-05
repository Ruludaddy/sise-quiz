---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/저장소/Storage.md
---

# 스토리지

## 저장소 사용하기

**SDK 객체:** `Storage`

`Storage` 로 네이티브의 저장소를 사용할 수 있어요.\
토스 앱을 삭제하면 저장소에 저장된 데이터도 함께 삭제돼요.

::: tip `AsyncStorage`는 사용할 수 없어요
앱인토스 환경에서는 `AsyncStorage`를 사용할 수 없어요.\
해당 API를 사용하면 화면이 하얗게 표시되는(white-out) 문제가 발생할 수 있어요.
:::

**시그니처**

```typescript
Storage: {
  getItem: typeof getItem;
  setItem: typeof setItem;
  removeItem: typeof removeItem;
  clearItems: typeof clearItems;
}
```

**프로퍼티**

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-storage](https://github.com/toss/apps-in-toss-examples/tree/main/with-storage) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

## 값 저장하기

**SDK 함수:** `setItem`

`setItem` 함수는 로컬 저장소에 문자열 데이터를 저장해요. 앱을 종료했다가 다시 실행해도 데이터가 유지되어야 할 때 사용해요.

**시그니처**

```typescript
function setItem(key: string, value: string): Promise<void>;
```

**파라미터**

**반환 값**

**예제**

`my-key`에 아이템 저장하기

::: code-group

```js [js]
import { Storage } from '@apps-in-toss/web-framework';

const KEY = 'my-key';

async function handleSetStorageItem(value) {
  const storageValue = await Storage.setItem(KEY, value);
}

async function handleGetStorageItem() {
  const storageValue = await Storage.getItem(KEY);
  return storageValue;
}

async function handleRemoveStorageItem() {
  await Storage.removeItem(KEY);
}
```

```tsx [React]
import { Storage } from '@apps-in-toss/web-framework';
import { Button, Text } from '@toss/tds-mobile';
import { useState } from 'react';

const KEY = 'my-key';

function StorageTestPage() {
  const [storageValue, setStorageValue] = useState<string | null>(null);

  async function handleSet() {
    await Storage.setItem(KEY, 'my-value');
  }

  async function handleGet() {
    const storageValue = await Storage.getItem(KEY);
    setStorageValue(storageValue);
  }

  async function handleRemove() {
    await Storage.removeItem(KEY);
  }

  return (
    <>
      <Text>{storageValue}</Text>
      <Button onClick={handleSet}>저장하기</Button>
      <Button onClick={handleGet}>가져오기</Button>
      <Button onClick={handleRemove}>삭제하기</Button>
    </>
  );
}
```

```tsx [React Native]
import { Storage } from '@apps-in-toss/framework';
import { Button, Text } from '@toss/tds-react-native';
import { useState } from 'react';

const KEY = 'my-key';

function StorageTestPage() {
  const [storageValue, setStorageValue] = useState<string | null>(null);

  async function handleSet() {
    await Storage.setItem(KEY, 'my-value');
  }

  async function handleGet() {
    const storageValue = await Storage.getItem(KEY);
    setStorageValue(storageValue);
  }

  async function handleRemove() {
    await Storage.removeItem(KEY);
  }

  return (
    <>
      <Text>{storageValue}</Text>
      <Button onPress={handleSet}>저장하기</Button>
      <Button onPress={handleGet}>가져오기</Button>
      <Button onPress={handleRemove}>삭제하기</Button>
    </>
  );
}
```

:::

## 값 가져오기

**SDK 함수:** `getItem`

`getItem` 함수는 로컬 저장소에 저장된 문자열 데이터를 가져와요.

**시그니처**

```typescript
function getItem(key: string): Promise<string | null>;
```

**파라미터**

**반환 값**

**예제**

`my-key`에 저장된 아이템 가져오기

::: code-group

```js [js]
import { Storage } from '@apps-in-toss/web-framework';

const KEY = 'my-key';

async function handleGetItem() {
  const storageValue = await Storage.getItem(KEY);
  return storageValue;
}
```

```tsx [React]
import { Storage } from '@apps-in-toss/web-framework';
import { Button } from '@toss/tds-mobile';

const KEY = 'my-key';

function StorageClearButton() {
  async function handleGet() {
    const storageValue = await Storage.getItem(KEY);
    setStorageValue(storageValue);
  }

  return <Button onClick={handleGet}>가져오기</Button>;
}
```

```tsx [React Native]
import { Storage } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';

const KEY = 'my-key';

function StorageClearButton() {
  async function handleGet() {
    const storageValue = await Storage.getItem(KEY);
    setStorageValue(storageValue);
  }

  return <Button onPress={handleGet}>가져오기</Button>;
}
```

:::

## 값 삭제하기

**SDK 함수:** `removeItem`

`removeItem` 함수는 특정 키에 해당하는 값을 삭제해요.

**시그니처**

```typescript
declare function removeItem(key: string): Promise<void>;
```

**파라미터**

**반환 값**

**예제**

`my-key`에 저장된 아이템 삭제하기

::: code-group

```js [js]
import { Storage } from '@apps-in-toss/web-framework';

const KEY = 'my-key';

async function handleRemoveItem() {
  await Storage.removeItem(KEY);
}
```

```tsx [React]
import { Storage } from '@apps-in-toss/web-framework';
import { Button } from '@toss/tds-mobile';

const KEY = 'my-key';

function StorageClearButton() {
  async function handleRemove() {
    await Storage.removeItem(KEY);
  }

  return <Button onClick={handleRemove}>삭제하기</Button>;
}
```

```tsx [React Native]
import { Storage } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';

const KEY = 'my-key';

function StorageClearButton() {
  async function handleRemove() {
    await Storage.removeItem(KEY);
  }

  return <Button onPress={handleRemove}>삭제하기</Button>;
}
```

:::

## 저장소 초기화하기

**SDK 함수:** `clearItems`

`clearItems` 함수는 로컬 저장소에 저장된 모든 데이터를 삭제해요.

**시그니처**

```typescript
declare function clearItems(): Promise<void>;
```

**반환 값**

**예제**

저장소 초기화하기

::: code-group

```js [js]
import { Storage } from '@apps-in-toss/web-framework';

async function handleClearItems() {
  await Storage.clearItems();
  console.log('Storage cleared');
}
```

```tsx [React]
import { Storage } from '@apps-in-toss/web-framework';
import { Button } from '@toss/tds-mobile';

function StorageClearButton() {
  async function handleClick() {
    await Storage.clearItems();
    console.log('Storage cleared');
  }

  return <Button onClick={handleClick}>저장소 초기화</Button>;
}
```

```tsx [React Native]
import { Storage } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';

function StorageClearButton() {
  async function handlePress() {
    await Storage.clearItems();
    console.log('Storage cleared');
  }

  return <Button onPress={handlePress}>저장소 초기화</Button>;
}
```

:::

***

## 웹 표준 저장소와 캐시 동작

`localStorage`, IndexedDB, `window.caches` 같은 웹 표준 저장소는 웹뷰의 origin(URL)을 기준으로 저장돼요.

토스앱 출시 환경과 QR 코드 테스트 환경은 서로 다른 URL을 사용하므로, 웹 표준 저장소에 저장한 데이터는 서로 공유되지 않아요.

* 토스앱 출시: `https://<appName>.apps.tossmini.com`
* QR 코드 테스트: `https://<appName>.private-apps.tossmini.com`

| 환경                              | 웹 표준 저장소 공유 여부 |
| --------------------------------- | ------------------------ |
| QR 코드 테스트 ↔ 토스앱 출시      | 공유되지 않음            |
| QR 테스트 — 버전 A ↔ 버전 B       | 공유됨                   |
| 토스앱 출시 — 이전 버전 ↔ 새 버전 | 공유됨                   |

::: tip IndexedDB 사용 시 주의하세요
WebView 환경에서 IndexedDB를 사용하면 iOS에서 **7일간 상호작용이 없을 경우 데이터가 자동으로 삭제**돼요.\
로컬 캐시가 필요하다면 `window.caches`(Cache API) 사용을 권장해요.
:::

***

## 자주 묻는 질문

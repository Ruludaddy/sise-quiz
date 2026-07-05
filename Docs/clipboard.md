---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/클립보드/clipboard.md
description: 클립보드에서 텍스트를 가져오거나 복사하는 방법을 안내해요.
---

# 클립보드

::: tip 권한 설정이 필요해요
`getClipboardText`를 사용하기 전에 클립보드 권한을 설정해야 해요.\
[권한 설정 가이드](/bedrock/reference/framework/권한/permission.md)를 먼저 확인해 주세요.
:::

***

## 1. 클립보드 텍스트 가져오기

**SDK 함수:** `getClipboardText`

클립보드에 저장된 텍스트를 읽어오는 함수예요.

**시그니처**

```typescript
function getClipboardText(): Promise<string>;
```

**반환값**

**권한 메서드**

**에러**

권한이 거부된 경우 `GetClipboardTextPermissionError`가 발생해요.\
`error instanceof GetClipboardTextPermissionError`로 확인할 수 있어요.

```typescript
class GetClipboardTextPermissionError extends PermissionError {
  constructor();
}
```

**예제**

::: code-group

```js [Web (JS)]
import { getClipboardText, GetClipboardTextPermissionError } from '@apps-in-toss/web-framework';

async function handleGetClipboardText() {
  try {
    const clipboardText = await getClipboardText();
    console.log('클립보드 텍스트:', clipboardText || '클립보드에 텍스트가 없어요.');
  } catch (error) {
    if (error instanceof GetClipboardTextPermissionError) {
      console.log('클립보드 읽기 권한 없음');
    }
  }
}
```

```tsx [Web (React)]
import { getClipboardText, GetClipboardTextPermissionError } from '@apps-in-toss/web-framework';
import { useState } from 'react';

function PasteButton() {
  const [text, setText] = useState('');

  const handlePress = async () => {
    try {
      const clipboardText = await getClipboardText();
      setText(clipboardText || '클립보드에 텍스트가 없어요.');
    } catch (error) {
      if (error instanceof GetClipboardTextPermissionError) {
        // 클립보드 읽기 권한 없음
      }
    }
  };

  return (
    <div>
      <span>{text}</span>
      <input type="button" value="붙여넣기" onClick={handlePress} />
      <input
        type="button"
        value="권한 확인하기"
        onClick={async () => {
          const permission = await getClipboardText.getPermission();
          alert(permission);
        }}
      />
      <input
        type="button"
        value="권한 요청하기"
        onClick={async () => {
          const permission = await getClipboardText.openPermissionDialog();
          alert(permission);
        }}
      />
    </div>
  );
}
```

```tsx [React Native]
import { getClipboardText, GetClipboardTextPermissionError } from '@apps-in-toss/framework';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

function PasteButton() {
  const [text, setText] = useState('');

  const handlePress = async () => {
    try {
      const clipboardText = await getClipboardText();
      setText(clipboardText || '클립보드에 텍스트가 없어요.');
    } catch (error) {
      if (error instanceof GetClipboardTextPermissionError) {
        // 클립보드 읽기 권한 없음
      }
    }
  };

  return (
    <View>
      <Text>{text}</Text>
      <Button title="붙여넣기" onPress={handlePress} />
      <Button
        title="권한 확인하기"
        onPress={async () => {
          const permission = await getClipboardText.getPermission();
          Alert.alert(permission);
        }}
      />
      <Button
        title="권한 요청하기"
        onPress={async () => {
          const permission = await getClipboardText.openPermissionDialog();
          Alert.alert(permission);
        }}
      />
    </View>
  );
}
```

:::

***

## 2. 클립보드 텍스트 복사하기

**SDK 함수:** `setClipboardText`

텍스트를 클립보드에 복사하는 함수예요. 사용자가 다른 곳에 붙여넣기할 수 있어요.

**시그니처**

```typescript
function setClipboardText(text: string): Promise<void>;
```

**파라미터**

**권한 메서드**

**에러**

권한이 거부된 경우 `SetClipboardTextPermissionError`가 발생해요.\
`error instanceof SetClipboardTextPermissionError`로 확인할 수 있어요.

```typescript
class SetClipboardTextPermissionError extends PermissionError {
  constructor();
}
```

**예제**

::: code-group

```js [Web (JS)]
import { setClipboardText, SetClipboardTextPermissionError } from '@apps-in-toss/web-framework';

async function handleSetClipboardText() {
  try {
    await setClipboardText('복사할 텍스트');
    console.log('텍스트가 복사됐어요!');
  } catch (error) {
    if (error instanceof SetClipboardTextPermissionError) {
      console.log('클립보드 쓰기 권한 없음');
    }
  }
}
```

```tsx [Web (React)]
import { setClipboardText, SetClipboardTextPermissionError } from '@apps-in-toss/web-framework';

function CopyButton() {
  const handleCopy = async () => {
    try {
      await setClipboardText('복사할 텍스트');
      console.log('텍스트가 복사됐어요!');
    } catch (error) {
      if (error instanceof SetClipboardTextPermissionError) {
        // 클립보드 쓰기 권한 없음
      }
    }
  };

  return (
    <>
      <input type="button" value="복사" onClick={handleCopy} />
      <input
        type="button"
        value="권한 확인하기"
        onClick={async () => {
          const permission = await setClipboardText.getPermission();
          alert(permission);
        }}
      />
      <input
        type="button"
        value="권한 요청하기"
        onClick={async () => {
          const permission = await setClipboardText.openPermissionDialog();
          alert(permission);
        }}
      />
    </>
  );
}
```

```tsx [React Native]
import { setClipboardText, SetClipboardTextPermissionError } from '@apps-in-toss/framework';
import { Alert, Button } from 'react-native';

function CopyButton() {
  const handleCopy = async () => {
    try {
      await setClipboardText('복사할 텍스트');
      console.log('텍스트가 복사됐어요!');
    } catch (error) {
      if (error instanceof SetClipboardTextPermissionError) {
        // 클립보드 쓰기 권한 없음
      }
    }
  };

  return (
    <>
      <Button title="복사" onPress={handleCopy} />
      <Button
        title="권한 확인하기"
        onPress={async () => {
          const permission = await setClipboardText.getPermission();
          Alert.alert(permission);
        }}
      />
      <Button
        title="권한 요청하기"
        onPress={async () => {
          const permission = await setClipboardText.openPermissionDialog();
          Alert.alert(permission);
        }}
      />
    </>
  );
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-clipboard-text](https://github.com/toss/apps-in-toss-examples/tree/main/with-clipboard-text) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

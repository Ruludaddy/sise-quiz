---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면
  제어/closeView.md
description: 화면을 닫거나 뒤로가기 동작을 제어하는 방법을 안내해요.
---

# 화면 닫기

***

## 1. 화면 닫기 (`closeView`)

현재 화면을 닫는 함수예요. "닫기" 버튼을 눌러 서비스를 종료할 때 사용할 수 있어요.

**시그니처**

```typescript
function closeView(): Promise<void>;
```

**예제**

```tsx
import { Button } from 'react-native';
import { closeView } from '@granite-js/react-native';

function CloseButton() {
  return <Button title="닫기" onPress={closeView} />;
}
```

***

## 2. iOS 스와이프 뒤로가기 설정하기 (`setIosSwipeGestureEnabled`)

iOS에서 화면을 스와이프해 뒤로가는 제스처를 활성화하거나 비활성화해요.

**시그니처**

```typescript
function setIosSwipeGestureEnabled(options: { isEnabled: boolean }): Promise<void>;
```

**파라미터**

**예제**

```tsx
import { setIosSwipeGestureEnabled } from '@apps-in-toss/framework';
import { Button } from 'react-native';

function Page() {
  return (
    <>
      <Button title="스와이프 끄기" onPress={() => setIosSwipeGestureEnabled({ isEnabled: false })} />
      <Button title="스와이프 켜기" onPress={() => setIosSwipeGestureEnabled({ isEnabled: true })} />
    </>
  );
}
```

***

## 3. 뒤로가기 이벤트 제어하기 (`useBackEvent`)

뒤로가기 이벤트를 등록하고 제거할 수 있는 Hook이에요.\
특정 컴포넌트가 활성화된 동안에만 뒤로가기 이벤트를 처리할 수 있어요.

**시그니처**

```typescript
function useBackEvent(): BackEventControls;
```

**반환값**

::: tip 주의해 주세요
이 Hook은 반드시 `BackEventProvider` 내에서 사용해야 해요. 그렇지 않으면 에러가 발생해요.
:::

**예제**

```tsx
import { useEffect, useState } from 'react';
import { Alert, Button, View } from 'react-native';
import { useBackEvent } from '@granite-js/react-native';

function UseBackEventExample() {
  const backEvent = useBackEvent();
  const [handler, setHandler] = useState<{ callback: () => void } | undefined>(undefined);

  useEffect(() => {
    const callback = handler?.callback;
    if (callback != null) {
      backEvent.addEventListener(callback);
      return () => {
        backEvent.removeEventListener(callback);
      };
    }
  }, [backEvent, handler]);

  return (
    <View>
      <Button title="뒤로가기 이벤트 등록" onPress={() => setHandler({ callback: () => Alert.alert('back') })} />
      <Button title="뒤로가기 이벤트 제거" onPress={() => setHandler(undefined)} />
    </View>
  );
}
```

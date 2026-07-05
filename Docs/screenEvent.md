---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면
  제어/screenEvent.md
description: '뒤로가기 이벤트 제어, 화면 복귀 후 코드 실행, 화면 보임 여부 확인 방법을 안내해요.'
---

# 화면 이벤트

***

## 1. 뒤로가기 이벤트 (`useBackEvent`)

`useBackEvent`는 뒤로가기 이벤트를 등록하고 제거할 수 있는 컨트롤러 객체를 반환하는 Hook이에요.\
`addEventListener`를 쓰면 뒤로가기 이벤트를 등록할 수 있고, `removeEventListener`를 쓰면 뒤로가기 이벤트를 제거할 수 있어요.\
사용자가 화면을 보고 있을 때만 등록된 뒤로가기 이벤트가 동작해요. 화면 보임 여부는 `useVisibility`를 기반으로 해요.

**시그니처**

```typescript
function useBackEvent(): BackEventControls;
```

**반환 값**

**에러**

**예제**

"Add BackEvent" 버튼을 누르면 뒤로가기 이벤트가 등록돼요. 이후 뒤로가기 버튼을 누르면 "back" 알림이 뜨고, 실제로 뒤로 가지 않아요.\
"Remove BackEvent" 버튼을 누르면 등록된 이벤트가 제거돼요. 이후 뒤로가기 버튼을 누르면 기존 동작대로 뒤로 가요.

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

    return;
  }, [backEvent, handler]);

  return (
    <View>
      <Button
        title="Add BackEvent"
        onPress={() => {
          setHandler({ callback: () => Alert.alert('back') });
        }}
      />
      <Button
        title="Remove BackEvent"
        onPress={() => {
          setHandler(undefined);
        }}
      />
    </View>
  );
}
```

***

## 2. 화면 복귀 이벤트 (`useWaitForReturnNavigator`)

`useWaitForReturnNavigator`는 화면 전환을 하고 돌아왔을 때 다음 코드를 동기적으로 실행할 수 있도록 도와주는 Hook이에요.\
화면 이동은 [@react-navigation/native `useNavigation`의 `navigate`](https://reactnavigation.org/docs/6.x/navigation-prop#navigate)를 사용해요.

예를 들어, 사용자가 다른 화면으로 이동했다가 돌아왔다는 로그를 남기고 싶을 때 사용해요.

**시그니처**

```typescript
function useWaitForReturnNavigator<T extends Record<string, object | undefined>>(): <RouteName extends keyof T>(
  route: RouteName,
  params?: T[RouteName],
) => Promise<void>;
```

**예제**

"이동하기" 버튼을 누르면 다른 화면으로 이동하고, 돌아왔을 때 로그가 남겨져요.

```tsx
import { Button } from 'react-native';
import { useWaitForReturnNavigator } from '@apps-in-toss/framework';

function UseWaitForReturnNavigator() {
  const navigate = useWaitForReturnNavigator();

  return (
    <Button
      title="이동하기"
      onPress={async () => {
        console.log(1);
        await navigate('/examples/use-visibility');
        // 화면에 돌아오면 이 코드가 실행돼요.
        console.log(2);
      }}
    />
  );
}
```

***

## 3. 가시성 이벤트 (`useVisibility`)

`useVisibility` 훅을 사용하면 화면이 현재 사용자에게 보이는지 여부를 알 수 있어요.\
사용자가 화면을 보고 있을 때만 특정 작업을 실행하거나 로그를 남길 수 있어요.

화면이 사용자에게 보이면 `true`, 보이지 않으면 `false`를 반환해요.\
단, 시스템 공유 모달([share](/bedrock/reference/framework/공유/share))을 열고 닫을 때는 값이 바뀌지 않아요.

* 다른 앱으로 전환하거나 홈 버튼을 누르면 `false`를 반환해요.
* 다시 토스 앱으로 돌아오거나 화면이 보이면 `true`를 반환해요.
* 토스 앱 내 다른 서비스로 이동하면 `false`를 반환해요.

**시그니처**

```typescript
function useVisibility(): boolean;
```

**반환 값**

**예제**

홈 화면으로 이동하면 `false`가 기록되고, 다시 돌아오면 `true`가 기록돼요.\
외부 링크(`https://toss.im`)로 이동하면 `false`가 기록되고, 다시 돌아오면 `true`가 기록돼요.

```tsx{1,6,8-12}
import { useVisibility } from '@granite-js/react-native';
import { useEffect } from 'react';
import { Button, Linking } from 'react-native';

export default function VisibilityPage() {
  const visibility = useVisibility();

  useEffect(() => {
    console.log({
      visibility,
    });
  }, [visibility]);

  return (
    <Button
      onPress={() => {
        Linking.openURL('https://toss.im');
      }}
      title="https://toss.im 이동"
    />
  );
}

/**
 * 출력 예시:
 * { "visibility": false }
 * { "visibility": true }
 * { "visibility": false }
 * { "visibility": true }
 */
```

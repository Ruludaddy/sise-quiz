---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/이벤트
  제어/back-event.md
---

# 이벤트 제어하기

이 문서에서는 앱 동작 중 발생하는 주요 이벤트를 감지하고 제어하는 방법을 안내해요.\
대표적으로 **뒤로가기 버튼 이벤트**와 **앱 진입 완료 이벤트**를 다룰 수 있어요.

## 1. 뒤로가기 버튼 이벤트 감지하기

뒤로가기 버튼 이벤트를 제어하면 사용자가 실수로 페이지를 닫는 상황을 방지할 수 있어요.\
예를 들어 결제 중이거나 폼 작성 중일 때, 뒤로가기를 눌러 화면이 닫히지 않게 막을 수 있어요.

**주요 기능**

| 기능                                                  | 설명                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| `backEvent`                                           | 뒤로가기 버튼을 누르면 발생하는 이벤트예요.                |
| `graniteEvent.addEventListener('backEvent', { ... })` | 이벤트를 구독해요.                                         |
| `onEvent`                                             | 뒤로가기 버튼이 눌리면 호출돼요. 기본 뒤로가기는 차단돼요. |
| `onError`                                             | 이벤트 처리 중 오류가 발생했을 때 호출돼요.                |
| `unsubscription()`                                    | 등록된 이벤트 리스너를 해제할 수 있어요.                   |

React Native에서는 `useBackEvent()` 훅으로 동일한 로직을 구현할 수 있어요.

**예제**

아래 예시는 사용자가 뒤로가기를 눌렀을 때 확인창을 띄우고, “확인”을 누르면 이동을 허용하는 예시예요.

::: code-group

```js [js]
import { graniteEvent } from '@apps-in-toss/web-framework';

const unsubscription = graniteEvent.addEventListener('backEvent', {
  onEvent: () => {
    const shouldLeave = window.confirm('작성 중인 내용이 저장되지 않아요. 나가시겠어요?');
    if (shouldLeave) {
      // 나가는 코드를 작성해요.
    }
  },
  onError: (error) => {
    console.error(`에러가 발생했어요: ${error}`);
  },
});

window.addEventListener('pagehide', () => {
  unsubscription();
});
```

```tsx [React]
import { graniteEvent } from '@apps-in-toss/web-framework';
import { useEffect, useState } from 'react';

function ConfirmBackNavigation() {
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    const unsubscription = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        const shouldLeave = window.confirm('작성 중인 내용이 저장되지 않아요. 나가시겠어요?');
        if (shouldLeave) {
          // 나가는 코드를 작성해요.
        }
      },
      onError: (error) => {
        alert(`에러가 발생했어요: ${error}`);
      },
    });

    return unsubscription;
  }, []);

  return (
    <div>
      <h2>입력 폼</h2>
      <textarea
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        placeholder="여기에 내용을 입력해 주세요"
        rows={5}
        style={{ width: '100%' }}
      />
    </div>
  );
}
```

```tsx [React Native]
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

:::

***

## 2. 홈 버튼 이벤트 제어하기

사용자가 홈 버튼을 눌렀을때 필요한 작업을 수행할 수 있어요.

**주요 기능**

| 기능                                                  | 설명                                        |
| ----------------------------------------------------- | ------------------------------------------- |
| `homeEvent`                                           | 홈 버튼을 누르면 발생하는 이벤트예요.       |
| `graniteEvent.addEventListener('homeEvent', { ... })` | (Web) 이벤트를 구독해요.                    |
| `homeEvent.subscribe(callback)`                       | (React Native) 이벤트를 구독해요.           |
| `onEvent`                                             | 홈 버튼이 눌리면 호출돼요.                  |
| `onError`                                             | 이벤트 처리 중 오류가 발생했을 때 호출돼요. |
| `unsubscribe()`                                       | 등록된 이벤트 리스너를 해제할 수 있어요.    |

React Native에서는 `homeEvent.subscribe()`를 사용해 동일한 로직을 구현할 수 있어요.

**예제**

::: code-group

```js [js]
import { graniteEvent } from '@apps-in-toss/web-framework';

const unsubscribe = graniteEvent.addEventListener('homeEvent', {
  onEvent: () => {
    console.log('홈 버튼 클릭됨');
  },
});

unsubscribe(); // 핸들러 삭제
```

```tsx [React]
import { graniteEvent } from '@apps-in-toss/web-framework';

const unsubscribe = graniteEvent.addEventListener('homeEvent', {
  onEvent: () => {
    window.alert('홈 버튼 클릭됨');
  },
});
```

```tsx [React Native]
import { homeEvent } from '@apps-in-toss/framework';

const unsubscribe = homeEvent.subscribe(() => {
  console.log('홈버튼 클릭됨');
});

unsubscribe();
```

:::

***

## 참고사항

* `graniteEvent`는 네이티브 이벤트(뒤로가기 등)를, `appsInTossEvent`는 토스 앱 내부 상태 변화를 감지해요.
* 등록된 이벤트 리스너는 반드시 **컴포넌트 언마운트 시 해제**해야 해요.
* 이벤트 기반으로 실행되는 작업에는 반드시 **에러 핸들러(onError)** 를 추가해 예외 상황을 대비하세요.

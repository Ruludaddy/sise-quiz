---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/네트워크/network.md
description: '네트워크 연결 상태 확인, HTTP 통신, 서버 시간 가져오기 방법을 안내해요.'
---

# 네트워크

***

## 1. 네트워크 연결 상태 확인하기 (`getNetworkStatus`)

`getNetworkStatus`는 디바이스의 현재 네트워크 연결 상태를 가져오는 함수예요.
반환 값은 `NetworkStatus` 타입으로, 인터넷 연결 여부와 연결 유형(Wi-Fi, 모바일 데이터 등)을 나타내요. 값은 다음 중 하나예요.

* `OFFLINE`: 인터넷에 연결되지 않은 상태예요.
* `WIFI`: Wi-Fi에 연결된 상태예요.
* `2G`: 2G 네트워크에 연결된 상태예요.
* `3G`: 3G 네트워크에 연결된 상태예요.
* `4G`: 4G 네트워크에 연결된 상태예요.
* `5G`: 5G 네트워크에 연결된 상태예요.
* `WWAN`: 인터넷은 연결되었지만, 연결 유형(Wi-Fi, 2G~5G)을 알 수 없는 상태예요. 이 상태는 iOS에서만 확인할 수 있어요.
* `UNKNOWN`: 인터넷 연결 상태를 알 수 없는 상태예요. 이 상태는 안드로이드에서만 확인할 수 있어요.

**시그니처**

```typescript
function getNetworkStatus(): Promise<NetworkStatus>;
```

**반환값**

**예제**

네트워크 연결 상태를 가져와 화면에 표시하는 예제예요.

```tsx
import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { getNetworkStatus, NetworkStatus } from '@apps-in-toss/framework';

function GetNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus | ''>('');

  useEffect(() => {
    async function fetchStatus() {
      const networkStatus = await getNetworkStatus();
      setStatus(networkStatus);
    }

    fetchStatus();
  }, []);

  return (
    <View>
      <Text>현재 네트워크 상태: {status}</Text>
    </View>
  );
}
```

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-network-status](https://github.com/toss/apps-in-toss-examples/tree/main/with-network-status) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

***

## 2. HTTP 통신하기

Bedrock에서 네트워크 통신을 하는 방법을 소개해요.

**Fetch API 사용하기**

Bedrock에서는 React Native처럼 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)를 사용해서 네트워크 통신을 할 수 있어요. Fetch API는 비동기 네트워크 요청을 간단히 구현할 수 있는 표준 웹 API에요.

다음은 "할 일 목록"을 가져오는 API를 사용해 "할 일"이 완료됐을 때 취소선을 표시하는 예제예요.

::: code-group

```tsx [pages/index.tsx]
import { createRoute } from '@granite-js/react-native';
import { useCallback, useState } from 'react';
import { Button, ScrollView } from 'react-native';
import { Todo, TodoItem } from './Todo';

export const Route = createRoute('/', {
  component: Index,
});

function Index() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  // [!code highlight:10]
  const handlePress = useCallback(async () => {
    /**
     * JSONPlaceholder API에서 할 일 데이터를 가져와요.
     * @link https://jsonplaceholder.typicode.com/
     */
    const result = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await result.json(); // 응답 데이터를 JSON으로 변환해요.
    setTodos(json); // 가져온 데이터를 상태로 저장해요.
  }, []);

  return (
    <>
      <Button title="할 일 목록 확인하기" onPress={handlePress} />
      <ScrollView>
        {todos.map((todo) => {
          return <Todo key={todo.id} id={todo.id} title={todo.title} completed={todo.completed} />;
        })}
      </ScrollView>
    </>
  );
}
```

```tsx [Todo.tsx]
import { Flex } from '@granite-js/react-native';
import { Text } from 'react-native';

export interface TodoItem {
  title: string; // 할 일 제목
  id: number; // 할 일 ID
  completed: boolean; // 완료 여부
}

export function Todo({ title, id, completed: done }: TodoItem) {
  return (
    <Flex direction="row" key={id}>
      <Flex.CenterVertical
        style={{
          minWidth: 30,
        }}
      >
        <Text style={{ fontSize: 24 }}>{id}.</Text>
      </Flex.CenterVertical>
      <Flex.CenterVertical>
        <Text
          style={{
            fontSize: 16,
            textDecorationColor: 'red', // 취소선 색상
            textDecorationLine: done ? 'line-through' : 'none', // 완료 여부에 따라 취소선 표시
          }}
        >
          {title}
        </Text>
      </Flex.CenterVertical>
    </Flex>
  );
}
```

:::

예제 영상을 보면 버튼을 클릭하면 네트워크 요청이 발생하고, 화면에 할 일 목록이 표시돼요. 네트워크 요청이 발생할 때 네트워크 인스펙터에서 요청과 응답을 확인할 수 있어요.

**다른 라이브러리 사용하기**

React Native는 [XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)를 지원해요. 따라서, 이 API를 사용하는 써드파티 네트워크 라이브러리도 사용할 수 있어요.

자세한 내용은 [React Native 공식 문서](https://reactnative.dev/docs/0.72/network#using-other-networking-libraries)를 참고하세요.

***

## 3. 서버 시간 가져오기 (`getServerTime`)

`getServerTime` 함수는 토스 앱 서버 기준의 현재 시간을 가져오는 API예요.\
디바이스 시간이 아닌 **서버 시간(Server Time)** 을 반환하기 때문에,\
클라이언트 시간 조작으로 발생할 수 있는 보상 중복 수령이나 치팅을 방지하는 데 유용해요.

출석 체크, 이벤트 기간 검증, 보상 수령 가능 여부 판단 등 **시간 신뢰도가 중요한 로직**에서 활용할 수 있어요.

::: tip 참고하세요

* 반환되는 시간은 **Unix timestamp (밀리초 단위)** 형식이에요.
* 지원하지 않는 앱 버전에서는 `undefined`가 반환될 수 있어요.
* 사용 전 `getServerTime.isSupported()`로 **버전 지원 여부를 먼저 확인하는 것을 권장**해요.

:::

**시그니처**

```typescript
function getServerTime(): Promise<number | undefined>;
```

**반환값**

**예제**

::: code-group

```tsx [React]
import { getServerTime } from '@apps-in-toss/web-framework';

async function checkRewardEligibility() {
  // 버전 체크를 먼저 수행하는 것을 권장해요
  if (!getServerTime.isSupported()) {
    console.log('이 기능은 지원되지 않는 버전입니다.');
    return;
  }

  const serverTime = await getServerTime();
  const rewardDeadline = 1705200000000;

  if (serverTime && serverTime > rewardDeadline) {
    console.log('보상 수령 기간이 지났습니다.');
  }
}
```

```tsx [React Native]
import { getServerTime } from '@apps-in-toss/framework';

async function checkRewardEligibility() {
  // 버전 체크를 먼저 수행하는 것을 권장해요
  if (!getServerTime.isSupported()) {
    console.log('이 기능은 지원되지 않는 버전입니다.');
    return;
  }

  const serverTime = await getServerTime();
  const rewardDeadline = 1705200000000;

  if (serverTime && serverTime > rewardDeadline) {
    console.log('보상 수령 기간이 지났습니다.');
  }
}
```

:::

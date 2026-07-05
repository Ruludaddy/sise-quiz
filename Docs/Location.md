---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/위치
  정보/Location.md
description: 디바이스의 현재 위치를 가져오거나 실시간으로 추적하는 방법을 안내해요.
---

# 위치

::: tip 권한 설정이 필요해요
`getCurrentLocation`를 사용하기 전에 위치 권한을 설정해야 해요.\
[권한 설정 가이드](/bedrock/reference/framework/권한/permission.md)를 먼저 확인해 주세요.
:::

***

## 1. 현재 위치 가져오기

**SDK 함수:** `getCurrentLocation`

디바이스의 현재 위치 정보를 한 번만 가져오는 함수예요.\
지도에서 사용자 위치를 표시하거나, 가까운 매장을 검색할 때 유용해요.

**시그니처**

```typescript
function getCurrentLocation(options: { accuracy: Accuracy }): Promise<Location>;
```

**파라미터**

**반환값**

**권한 메서드**

**에러**

권한이 거부된 경우 `GetCurrentLocationPermissionError`가 발생해요.

```typescript
class GetCurrentLocationPermissionError extends PermissionError {
  constructor();
}
```

**예제**

::: code-group

```js [Web (JS)]
import { Accuracy, getCurrentLocation, GetCurrentLocationPermissionError } from '@apps-in-toss/web-framework';

async function handleGetCurrentLocation() {
  try {
    const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
    console.log(`위치: ${response.coords.latitude}, ${response.coords.longitude}`);
  } catch (error) {
    if (error instanceof GetCurrentLocationPermissionError) {
      console.log('위치 정보 권한 없음');
    }
  }
}
```

```tsx [Web (React)]
import { Accuracy, getCurrentLocation, GetCurrentLocationPermissionError, Location } from '@apps-in-toss/web-framework';
import { useState } from 'react';

function CurrentPosition() {
  const [position, setPosition] = useState<Location | null>(null);

  const handlePress = async () => {
    try {
      const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      setPosition(response);
    } catch (error) {
      if (error instanceof GetCurrentLocationPermissionError) {
        // 위치 정보 권한 없음
      }
    }
  };

  return (
    <div>
      {position ? (
        <span>
          위치: {position.coords.latitude}, {position.coords.longitude}
        </span>
      ) : (
        <span>위치 정보를 아직 가져오지 않았어요</span>
      )}
      <input type="button" value="현재 위치 가져오기" onClick={handlePress} />
      <input
        type="button"
        value="권한 확인하기"
        onClick={async () => alert(await getCurrentLocation.getPermission())}
      />
      <input
        type="button"
        value="권한 요청하기"
        onClick={async () => alert(await getCurrentLocation.openPermissionDialog())}
      />
    </div>
  );
}
```

```tsx [React Native]
import { Accuracy, getCurrentLocation, GetCurrentLocationPermissionError, Location } from '@apps-in-toss/framework';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

function CurrentPosition() {
  const [position, setPosition] = useState<Location | null>(null);

  const handlePress = async () => {
    try {
      const response = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      setPosition(response);
    } catch (error) {
      if (error instanceof GetCurrentLocationPermissionError) {
        // 위치 정보 권한 없음
      }
    }
  };

  return (
    <View>
      {position ? (
        <Text>
          위치: {position.coords.latitude}, {position.coords.longitude}
        </Text>
      ) : (
        <Text>위치 정보를 아직 가져오지 않았어요</Text>
      )}
      <Button title="현재 위치 가져오기" onPress={handlePress} />
      <Button title="권한 확인하기" onPress={async () => Alert.alert(await getCurrentLocation.getPermission())} />
      <Button
        title="권한 요청하기"
        onPress={async () => Alert.alert(await getCurrentLocation.openPermissionDialog())}
      />
    </View>
  );
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-location-once](https://github.com/toss/apps-in-toss-examples/tree/main/with-location-once) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

***

## 2. 실시간 위치 추적하기

**SDK 함수:** `startUpdateLocation`

위치가 변경될 때마다 콜백을 실행하는 함수예요.\
운동 앱에서 이동 거리를 기록하거나 지도에서 위치를 실시간으로 업데이트할 때 사용해요.\
반환된 cleanup 함수를 호출하면 추적이 중단돼요.

**시그니처**

```typescript
function startUpdateLocation(options: {
  onError: (error: unknown) => void;
  onEvent: (location: Location) => void;
  options: StartUpdateLocationOptions;
}): () => void;
```

**파라미터**

**반환값**

**권한 메서드**

**에러**

권한이 거부된 경우 `StartUpdateLocationPermissionError`가 발생해요.
`error instanceof StartUpdateLocationPermissionError`로 확인할 수 있어요.

```typescript
const StartUpdateLocationPermissionError: typeof GetCurrentLocationPermissionError;
```

**예제**

::: code-group

```js [Web (JS)]
import { Accuracy, startUpdateLocation, StartUpdateLocationPermissionError } from '@apps-in-toss/web-framework';

let cleanup;

function handleStartUpdateLocation() {
  cleanup?.();

  cleanup = startUpdateLocation({
    options: { accuracy: Accuracy.Balanced, timeInterval: 3000, distanceInterval: 10 },
    onEvent: (location) => {
      console.log(`위도: ${location.coords.latitude}, 경도: ${location.coords.longitude}`);
    },
    onError: (error) => {
      if (error instanceof StartUpdateLocationPermissionError) {
        console.log('위치 정보 권한 없음');
      }
    },
  });
}

window.addEventListener('pagehide', () => cleanup?.());
```

```tsx [Web (React)]
import {
  Accuracy,
  Location,
  startUpdateLocation,
  StartUpdateLocationPermissionError,
} from '@apps-in-toss/web-framework';
import { useCallback, useState } from 'react';

function LocationWatcher() {
  const [location, setLocation] = useState<Location | null>(null);

  const handlePress = useCallback(() => {
    startUpdateLocation({
      options: { accuracy: Accuracy.Balanced, timeInterval: 3000, distanceInterval: 10 },
      onEvent: (location) => setLocation(location),
      onError: (error) => {
        if (error instanceof StartUpdateLocationPermissionError) {
          // 위치 정보 권한 없음
        }
      },
    });
  }, []);

  return (
    <div>
      {location != null && (
        <>
          <span>위도: {location.coords.latitude}</span>
          <span>경도: {location.coords.longitude}</span>
        </>
      )}
      <input type="button" value="위치 추적 시작" onClick={handlePress} />
    </div>
  );
}
```

```tsx [React Native]
import { Accuracy, Location, startUpdateLocation, StartUpdateLocationPermissionError } from '@apps-in-toss/framework';
import { useCallback, useState } from 'react';
import { Button, Text, View } from 'react-native';

function LocationWatcher() {
  const [location, setLocation] = useState<Location | null>(null);

  const handlePress = useCallback(() => {
    startUpdateLocation({
      options: { accuracy: Accuracy.Balanced, timeInterval: 3000, distanceInterval: 10 },
      onEvent: (location) => setLocation(location),
      onError: (error) => {
        if (error instanceof StartUpdateLocationPermissionError) {
          // 위치 정보 권한 없음
        }
      },
    });
  }, []);

  return (
    <View>
      {location != null && (
        <>
          <Text>위도: {location.coords.latitude}</Text>
          <Text>경도: {location.coords.longitude}</Text>
        </>
      )}
      <Button title="위치 추적 시작" onPress={handlePress} />
    </View>
  );
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-location-callback](https://github.com/toss/apps-in-toss-examples/tree/main/with-location-callback) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-location-tracking](https://github.com/toss/apps-in-toss-examples/tree/main/with-location-tracking) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

***

## 타입 · 객체

**위치 정확도 옵션 (`Accuracy`)**

위치 정확도 수준을 설정하는 enum이에요.

```typescript
enum Accuracy {
  Lowest = 1, // 오차범위 3KM 이내
  Low = 2, // 오차범위 1KM 이내
  Balanced = 3, // 오차범위 몇 백미터 이내
  High = 4, // 오차범위 10M 이내
  Highest = 5, // 가장 높은 정확도
  BestForNavigation = 6, // 네비게이션을 위한 최고 정확도
}
```

***

**위치 정보 객체 (`Location`)**

위치 정보를 나타내는 객체예요.

```typescript
interface Location {
  accessLocation?: 'FINE' | 'COARSE'; // Android 전용. FINE: 정확한 위치, COARSE: 대략적인 위치
  timestamp: number; // 위치가 업데이트된 시점의 유닉스 타임스탬프
  coords: LocationCoords; // 세부 좌표 정보
}
```

***

**세부 위치 좌표 정보 (`LocationCoords`)**

세부 위치 좌표 정보를 나타내는 객체예요.

```typescript
interface LocationCoords {
  latitude: number; // 위도
  longitude: number; // 경도
  altitude: number; // 높이
  accuracy: number; // 위치 정확도
  altitudeAccuracy: number; // 고도 정확도
  heading: number; // 방향
}
```

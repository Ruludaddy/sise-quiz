---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/인터렉션/interaction.md
---

# 반응 처리

이 문서에서는 **사용자 인터렉션과 직접적으로 연결되는 UI/UX 기능**을 다뤄요.\
스크롤, 키보드, 오디오 포커스, 햅틱 진동처럼 **사용자의 행동에 즉각 반응해야 하는 기능**들을 한 곳에 모아 설명해요.

***

## 스크롤 바운스 영역 배경 처리

**SDK 컴포넌트:** `ScrollViewInertialBackground`

iOS `ScrollView`에서 스크롤이 끝에 도달했을 때 발생하는 \*\*바운스 효과 영역(위/아래)\*\*에\
배경색을 채워 보다 자연스러운 시각 효과를 제공하는 컴포넌트예요.

**시그니처**

```ts
function ScrollViewInertialBackground({
  topColor,
  bottomColor,
  spacer: _spacer,
}: ScrollViewInertialBackgroundProps): JSX.Element;
```

**파라미터**

**예제 : 스크롤 뷰 위, 아래에 배경색을 추가하기**

스크롤 뷰 위에 빨간색, 아래에 파란색 배경색을 추가해요. 스크롤을 벗어난 영역에 배경색이 적용돼요.

```tsx
import { ScrollView, View, Text } from 'react-native';
import { ScrollViewInertialBackground } from '@granite-js/react-native';

const dummies = Array.from({ length: 20 }, (_, i) => i);

function InertialBackgroundExample() {
  return (
    <ScrollView>
      <ScrollViewInertialBackground topColor="red" bottomColor="blue" />
      {dummies.map((i) => (
        <View
          key={`dummy-${i}`}
          style={{ width: '100%', height: 100, borderBottomColor: 'black', borderBottomWidth: 1 }}
        >
          <Text>스크롤을 해보세요.</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

***

## 색상 모드 타입

**SDK API:** `ColorPreference`

현재 기기의 **색상 모드(라이트 / 다크)** 를 나타내는 타입이에요.
테마 분기나 스타일 조건 처리에 사용해요.

**시그니처**

```typescript
type ColorPreference = 'light' | 'dark';
```

***

## 키보드 위로 요소 올리기

**SDK 컴포넌트:** `KeyboardAboveView`

키보드가 나타날 때 **자식 컴포넌트를 자동으로 키보드 위로 올려주는 레이아웃 컴포넌트**예요.\
입력 중에도 버튼이나 액션 영역을 항상 노출하고 싶을 때 유용해요.

**시그니처**

```typescript
function KeyboardAboveView({ style, children, ...props }: ComponentProps<typeof View>): ReactElement;
```

**파라미터**

**반환 값**

**예제 : 키보드 위로 요소를 올리기**

```tsx
import { ScrollView, TextInput, View, Text } from 'react-native';
import { KeyboardAboveView } from '@granite-js/react-native';

function KeyboardAboveViewExample() {
  return (
    <>
      <ScrollView>
        <TextInput placeholder="placeholder" />
      </ScrollView>

      <KeyboardAboveView>
        <View style={{ width: '100%', height: 50, backgroundColor: 'yellow' }}>
          <Text>Keyboard 위에 있어요.</Text>
        </View>
      </KeyboardAboveView>
    </>
  );
}
```

***

## 오디오 포커스 변경 콜백

**SDK API:** `OnAudioFocusChanged`

비디오나 오디오 컴포넌트의 **오디오 포커스가 변경될 때 호출되는 콜백 타입**이에요.\
다른 앱이나 시스템 이벤트로 소리가 중단될 때의 처리를 제어할 수 있어요.

**시그니처**

```typescript
type OnAudioFocusChanged = NonNullable<VideoProperties['onAudioFocusChanged']>;
```

**파라미터**

***

## 햅틱 진동 실행하기

**SDK 함수:** `generateHapticFeedback`

디바이스에서 **햅틱 진동을 발생시키는 함수**예요.\
버튼 클릭, 완료 알림, 성공/실패 피드백 등 촉각 반응이 필요한 순간에 사용해요.

**시그니처**

```typescript
function generateHapticFeedback(options: HapticFeedbackOptions): Promise<void>;
```

**반환 값**

**예제 : 버튼을 눌러 햅틱 일으키기**

::: code-group

```js [js]
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

generateHapticFeedback({ type: 'tickWeak' });
```

```tsx [React]
import React from 'react';
import { generateHapticFeedback } from '@apps-in-toss/web-framework';

function GenerateHapticFeedbackWeb() {
  return (
    <button
      onClick={() => {
        generateHapticFeedback({ type: 'tickWeak' });
      }}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#3182f6',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      햅틱
    </button>
  );
}

export default GenerateHapticFeedbackWeb;
```

```tsx [React Native]
import { Button } from 'react-native';
import { generateHapticFeedback } from '@apps-in-toss/framework';

function GenerateHapticFeedback() {
  return (
    <Button
      title="햅틱"
      onPress={() => {
        generateHapticFeedback({ type: 'tickWeak' });
      }}
    />
  );
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-haptic-feedback](https://github.com/toss/apps-in-toss-examples/tree/main/with-haptic-feedback) 코드를 내려받거나,\
아래 QR 코드를 스캔해 직접 체험해 보세요.

## 햅틱 진동 옵션 및 타입

**타입:** `HapticFeedbackOptions`, `HapticFeedbackType`

`generateHapticFeedback`에 전달할 진동 타입 옵션을 정의해요.

**시그니처**

```tsx
interface HapticFeedbackOptions {
  type: HapticFeedbackType;
}

type HapticFeedbackType =
  | 'tickWeak'
  | 'tap'
  | 'tickMedium'
  | 'softMedium'
  | 'basicWeak'
  | 'basicMedium'
  | 'success'
  | 'error'
  | 'wiggle'
  | 'confetti';
```

## 참고사항

* 인터렉션 관련 기능은 **사용자 경험에 직접적인 영향**을 줘요.\
  과도한 사용은 피하고, 의미 있는 순간에만 사용하세요.
* 키보드 / 오디오 / 햅틱 기능은 플랫폼별 동작 차이가 있을 수 있어요.
* 이벤트나 콜백 기반 기능은 반드시 **정리(cleanup)** 로직을 함께 구현하세요.

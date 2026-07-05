---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면
  제어/impression.md
description: 스크롤 뷰나 리스트에서 요소가 화면에 보이는지 감지하는 방법을 알아봐요.
---

# 노출 감지

스크롤 뷰나 리스트에서 특정 요소가 화면에 보이는지 여부를 감지할 수 있어요.

## 노출 감지하기

**SDK 컴포넌트:** `InView`

`InView` 컴포넌트는 화면에 요소가 보이기 시작하거나 사라지는 것을 감지하는 컴포넌트예요.
요소가 화면에 조금이라도 보이기 시작하면 `onChanged` 핸들러가 호출되고 첫 번째 인자로 `true` 값이 전달돼요. 반대로 요소가 화면에서 사라지면 `false` 값이 전달돼요.
`onChanged` 핸들러의 두 번째 인자로 요소의 화면 노출 비율이 전달돼요. 노출 비율 값은 `0`에서 `1.0` 사이예요. 예를 들어 `0.2`가 전달되면 컴포넌트가 20%만큼 화면에 노출된 상태라는 의미예요.

::: tip 유의하세요

`InView`는 반드시 `IOContext`가 포함된 [IOScrollView](#scroll-impression-area) 또는 [IOFlatList](#%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EB%85%B8%EC%B6%9C-%EA%B0%90%EC%A7%80%ED%95%98%EA%B8%B0) 내부에서 사용해야 해요.
만약 `IOContext` 외부에서 사용하면 `IOProviderMissingError`가 발생해요.

:::

**시그니처**

```typescript
class InView<T = ViewProps> extends PureComponent<InViewProps<T>> {
  static contextType: import('react').Context<IOContextValue>;
  static defaultProps: Partial<InViewProps>;
  context: undefined | IOContextValue;
  mounted: boolean;
  protected element: Element;
  protected instance: undefined | ObserverInstance;
  protected view: any;
  constructor(props: InViewProps<T>);
  componentDidMount(): void;
  componentWillUnmount(): void;
  protected handleChange: (inView: boolean, areaThreshold: number) => void;
  protected handleRef: (ref: any) => void;
  protected handleLayout: (event: LayoutChangeEvent) => void;
  measure: (...args: any) => void;
  measureInWindow: (...args: any) => void;
  measureLayout: (...args: any) => void;
  setNativeProps: (...args: any) => void;
  focus: (...args: any) => void;
  blur: (...args: any) => void;
  render(): import('react/jsx-runtime').JSX.Element | null;
}
```

**파라미터**

**예제**

```tsx
import { LayoutChangeEvent, View, Text, Dimensions } from 'react-native';
import { InView, IOScrollView } from '@granite-js/react-native';

function InViewExample() {
  const handleLayout = (event: LayoutChangeEvent) => {
    console.log('레이아웃 변경됨', event.nativeEvent.layout);
  };

  const handleChange = (inView: boolean, areaThreshold: number) => {
    if (inView) {
      console.log(`${areaThreshold * 100}% 비율만큼 화면에 보이는 상태`);
    } else {
      console.log('화면에 보이지 않는 상태');
    }
  };

  return (
    <IOScrollView>
      <View style={{ height: HEIGHT, width: '100%', backgroundColor: 'blue' }}>
        <Text style={{ color: 'white' }}>스크롤을 내려주세요</Text>
      </View>
      <InView onLayout={handleLayout} onChange={handleChange}>
        <View style={{ width: 100, height: 300, backgroundColor: 'yellow' }}>
          <View
            style={{
              position: 'absolute',
              top: 30,
              width: 100,
              height: 1,
              borderWidth: 1,
            }}
          >
            <Text style={{ position: 'absolute', top: 0 }}>10% 지점</Text>
          </View>
        </View>
      </InView>
    </IOScrollView>
  );
}
```

***

## 리스트 노출 감지하기

**SDK 컴포넌트:** `IOFlatList`

`IOFlatList`는 스크롤 중 특정 요소가 화면에 보이거나 사라지는지를 감지하기 위해 Intersection Observer 기능을 추가한 `FlatList` 컴포넌트예요. 이 컴포넌트를 사용하면 리스트의 각 항목이 화면에 나타나는지 여부를 쉽게 확인하고 처리할 수 있어요.

`InView`와 함께 사용하면 각 요소의 노출 상태를 확인할 수 있어요. 자식 요소로 포함된 `InView` 컴포넌트는 `IOFlatList`의 관찰 기능을 통해 요소가 화면에 보이는지 여부를 감지하고, 노출 상태에 따라 이벤트를 발생시켜요.

**시그니처**

```typescript
IOFlatList: typeof IOFlatListFunction;
```

**예제**

```tsx
import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InView, IOFlatList } from '@granite-js/react-native';

const mockData = Array.from({ length: 30 }, (_, i) => ({ key: String(i) }));

function FlatListPage() {
  return <IOFlatList data={mockData} renderItem={({ item }) => <InViewItem>{item.key}</InViewItem>} />;
}

function InViewItem({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <InView onChange={setVisible}>
      <View style={styles.item}>
        <Text>{children}</Text>
        <Text>{visible ? 'visible' : ''}</Text>
      </View>
    </InView>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
```

***

## 스크롤 영역 노출 감지하기 {#scroll-impression-area}

**SDK 컴포넌트:** `IOScrollView`, `ImpressionArea`

[`IOScrollView`](#scroll-impression-area)와 [`ImpressionArea`](#scroll-impression-area)를 사용해서 스크롤 뷰 내에서 요소가 화면에 보이는지 확인할 수 있어요. 특정 요소가 화면에 일정 비율 이상 나타나면 `onImpressionStart` 콜백이 호출돼요.

[`ImpressionArea`](#scroll-impression-area)의 `areaThreshold` 값을 설정하면, 설정한 비율 이상으로 요소가 보이면 `onImpressionStart` 콜백이 호출돼요.

::: tip `IOScrollView` 내부에서만 사용할 수 있어요
[`ImpressionArea`](#scroll-impression-area)는 반드시 [`IOScrollView`](#scroll-impression-area) 내부에 있어야 해요.

그렇지 않으면, `IOContext.Provider 밖에서 사용되었습니다.`라는 에러가 발생해요.
:::

### 스크롤 뷰에서 요소가 20% 이상 나타날 때 처리하기

다음 코드는 높이 `100px`을 가진 요소가 [`IOScrollView`](#scroll-impression-area)에서 `20%`이상 나타났을 때`onImpressionStart`가 호출되는 예제에요.

빨간색 선은 `100px`의 `20%` 지점을 시각적으로 표시한 예시예요.

```tsx{14,18,22-27,37-38}
import { createRoute, ImpressionArea, IOScrollView } from '@granite-js/react-native';
import { ReactNode } from 'react';
import { Alert, Text, View } from 'react-native';

export const Route = createRoute('/image', {
  component: Image,
});

/* 스크롤을 위한 Dummy 콘텐츠 */
const dummies = new Array(10).fill(undefined);

/** 20% 지점 */
const AREA_THRESHOLD = 0.2; // [!code focus]

function Image() {
  return (
    <IOScrollView> // [!code focus]
      {dummies.map((_, index) => {
        return <DummyContent key={index} text={10 - index} />;
      })}
      <ImpressionArea // [!code focus]
        areaThreshold={AREA_THRESHOLD} // [!code focus]
        onImpressionStart={() => { // [!code focus]
          Alert.alert('Impression Start'); // [!code focus]
        }} // [!code focus]
      > // [!code focus]
        <View
          style={{
            width: '100%',
            height: 100,
            backgroundColor: 'blue',
          }}
        >
          <DebugLine areaThreshold={AREA_THRESHOLD} />
        </View>
      </ImpressionArea> // [!code focus]
    </IOScrollView> // [!code focus]
  );
}

/** 비율을 시각적으로 표시하는 디버그 컴포넌트 */
function DebugLine({ areaThreshold }: { areaThreshold: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: `${areaThreshold * 100}%`,
        width: '100%',
        height: 1,
        backgroundColor: 'red',
      }}
    />
  );
}

/** Dummy 영역 */
function DummyContent({ text }: { text: ReactNode }) {
  return (
    <View
      style={{
        width: '100%',
        height: 100,
        borderWidth: 1,
      }}
    >
      <Text>{text}</Text>
    </View>
  );
}
```

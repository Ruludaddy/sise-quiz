---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면
  제어/safe-area-rn.md
---

# Safe Area

모바일 브라우저에서는 상태바나 홈 인디케이터 같은 시스템 UI 때문에 콘텐츠가 가려질 때가 있어요.\
앱인토스 SDK는 이런 상황을 방지하기 위해 화면의 안전 영역(Safe Area) 여백 값을 픽셀 단위로 계산하는 함수를 제공해요.

특히 iPhone X 이상 기기나 일부 Android 기기에서는 전체 화면을 사용하는 웹 앱에서 시스템 UI가 콘텐츠를 가리는 경우가 자주 있어요.\
아래 함수를 사용하면 콘텐츠가 안전하게 표시되도록 여백을 쉽게 조절할 수 있어요.

## `useSafeAreaInsets`

모바일 브라우저에서 상태바나 홈 인디케이터 같은 시스템 UI에 의해 콘텐츠가 가려지는 문제를 방지할 수 있도록, 화면의 안전 영역(Safe Area) 여백 값을 픽셀 단위로 계산해줘요.\
`useSafeAreaInsets` 는 ReactNative 로 개발할 때 사용할 수 있어요.

```tsx
import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
const { top: safeAreaTop, right: safeAreaRight } = useSafeAreaInsets();
// 네비바 상단 여백: safeAreaTop
// 네비바 우측 여백: safeAreaRight + 10
```

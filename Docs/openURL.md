---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면
  이동/openURL.md
---

# 외부 URL 열기

`openURL` 함수는 지정한 URL을 기기의 기본 브라우저나 연결된 앱에서 열 수 있게 해주는 유틸리티예요.\
이 함수는 React Native의 [`Linking.openURL`](https://reactnative.dev/docs/0.72/linking#openurl)을 내부적으로 사용해요.

**시그니처**

```typescript
function openURL(url: string): Promise<any>;
```

**파라미터**

**반환 값**

**예제**

**외부 웹사이트 열기**

:::code-group

```tsx[React]
import { openURL } from '@apps-in-toss/web-framework';

function Page() {
  const handlePress = () => {
    openURL('https://google.com');
  };

  return (
    <button onClick={handlePress}>
      구글 웹사이트 열기
    </button>
  );
}
```

```tsx[React Native]
import { openURL } from '@granite-js/react-native';
import { Button } from 'react-native';

function Page() {
  const handlePress = () => {
    openURL('https://google.com');
  };

  return <Button title="구글 웹사이트 열기" onPress={handlePress} />;
}
```

:::

**딥링크 열기**

:::code-group

```tsx[React]
import { openURL } from '@apps-in-toss/web-framework';

openURL('intoss://{appName}'); 
```

```tsx[React Native]
import { openURL } from '@granite-js/react-native';

openURL('intoss://{appName}'); 
```

:::

## 참고사항

* 외부 URL을 열 수 없는 경우(잘못된 스킴, 네트워크 차단 등)에는 Promise가 reject될 수 있어요.
* WebView 환경에서는 브라우저 탭이 새로 열리며, 기본 앱에서는 외부 앱 또는 브라우저로 전환돼요.

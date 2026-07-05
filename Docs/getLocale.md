---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/언어/getLocale.md
---

# 언어

`getLocale` 함수는 **현재 사용자의 로케일(locale) 정보를 가져와**,\
이를 기반으로 **앱을 다국어로 처리하는 데 활용할 수 있는 API**예요.

사용자가 익숙한 언어로 앱을 이용할 수 있도록 제공하면,\
전반적인 **사용 경험과 접근성**을 크게 향상시킬 수 있어요.\
문자열 번역, 날짜·시간 포맷, 숫자 표현 등 현지화가 필요한 모든 영역에서 사용할 수 있어요.

::: tip 참고하세요

* 로케일 정보를 가져올 수 없는 경우에는 기본값으로 `'ko-KR'`이 반환돼요.
* 이 API와 예제는 **토스 앱 환경에서만** 확인할 수 있어요.
  :::

## 사용자 언어 가져오기

**SDK 함수:** `getLocale`

**시그니처**

```typescript
function getLocale(): string;
```

**반환 값**

**현재 사용자의 로케일 정보 가져오기**

```tsx
import { getLocale } from '@apps-in-toss/framework';
import { Text } from 'react-native';

function MyPage() {
  const locale = getLocale();

  return <Text>사용자의 로케일 정보: {locale}</Text>;
}
```

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-locale](https://github.com/toss/apps-in-toss-examples/tree/main/with-locale) 코드를 내려받거나,\
아래 QR 코드를 스캔해 직접 체험해 보세요.

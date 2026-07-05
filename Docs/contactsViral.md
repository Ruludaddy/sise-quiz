---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/친구초대/contactsViral.md
---

# 공유 리워드

서비스 소개와 콘솔 설정 방법은 [공유 리워드 소개](/reward/intro.html) 문서를 참고해 주세요.

`contactsViral`은 **사용자가 친구에게 미니앱을 공유하고, 그 결과에 따라 리워드를 지급할 수 있는 공유 리워드 기능**이에요.\
사용자가 공유를 완료하면 앱 브릿지를 통해 이벤트가 전달되고, 이 이벤트를 기반으로 **리워드 지급 여부와 지급 정보**를 확인할 수 있어요.

공유 리워드는 다음과 같은 용도로 사용돼요.

* 친구 초대 기반 **바이럴 유입**
* 추천인 보상 / 초대 보상
* 미니앱 성장 캠페인
* 게임 · 비게임 미니앱 공통 프로모션

::: tip 주의하세요

* 이 기능은 **토스앱 5.223.0 이상**에서만 지원돼요. 하위 버전에서는 `undefined`가 반환돼요.
* 기능 사용을 위해서는 **미니앱 승인**이 반드시 필요해요. 미승인 상태에서는 `Internal Server Error`가 발생해요.
* 공유 리워드는 **콘솔에 등록된 리워드 ID** 기준으로 동작해요.
* 리워드 지급 조건, 수량, 단위는 **앱인토스 콘솔**에서 설정해요.

:::

::: tip 테스트 환경 안내

* 샌드박스 앱에서는 실제 공유 UI가 노출되지 않고 **빈 화면**으로 보여요.
* 샌드박스에서는 리워드 지급이 실제로 발생하지 않아요.
* 반드시 **콘솔에서 제공하는 QR 코드**로 토스앱에서 테스트해 주세요.
* 친구 목록은 아래 조건에 따라 달라질 수 있어요.
  * 마케팅 수신 동의 여부
  * 야간 마케팅 수신 동의 여부
  * 푸시 토큰 등록 여부
  * 연락처 알림 차단 여부

:::

***

## 플로우

**게임**

![](/assets/reward_flow.vPYmr093.webp)

**비게임**

![](/assets/reward_flow_nongame.DqhpSek9.webp)

***

**시그니처**

```ts
function contactsViral(params: ContactsViralParams): () => void;
```

**파라미터**

**반환값**

**예제: 공유하고 리워드 받기**

아래 예제는 공유 리워드를 실행하고, 공유 완료 또는 모듈 종료 이벤트를 처리하는 기본적인 흐름을 보여줘요.

::: code-group

```js [js]
import { contactsViral } from '@apps-in-toss/web-framework';

function handleContactsViral(moduleId) {
  const cleanup = contactsViral({
    options: { moduleId: moduleId.trim() },
    onEvent: (event) => {
      if (event.type === 'sendViral') {
        console.log('리워드 지급:', event.data.rewardAmount, event.data.rewardUnit);
      } else if (event.type === 'close') {
        console.log('모듈 종료:', event.data.closeReason);
        cleanup();
      }
    },
    onError: (error) => {
      console.error('에러 발생:', error);
      cleanup?.();
    },
  });
}
```

```tsx [React]
import { contactsViral } from '@apps-in-toss/web-framework';
import { Button } from '@toss/tds-mobile';
import { useCallback } from 'react';

function ContactsViralButton({ moduleId }: { moduleId: string }) {
  const handleContactsViral = useCallback(() => {
    try {
      const cleanup = contactsViral({
        options: { moduleId: moduleId.trim() },
        onEvent: (event) => {
          if (event.type === 'sendViral') {
            console.log('리워드 지급:', event.data.rewardAmount, event.data.rewardUnit);
          } else if (event.type === 'close') {
            console.log('모듈 종료:', event.data.closeReason);
            cleanup();
          }
        },
        onError: (error) => {
          console.error('에러 발생:', error);
          cleanup?.();
        },
      });
    } catch (error) {
      console.error('실행 중 에러:', error);
    }
  }, [moduleId]);

  return <Button onClick={handleContactsViral}>친구에게 공유하고 리워드 받기</Button>;
}
```

```tsx [React Native]
import { contactsViral } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';
import { useCallback } from 'react';

function ContactsViralButton({ moduleId }: { moduleId: string }) {
  const handleContactsViral = useCallback(() => {
    try {
      const cleanup = contactsViral({
        options: { moduleId: moduleId.trim() },
        onEvent: (event) => {
          if (event.type === 'sendViral') {
            console.log('리워드 지급:', event.data.rewardAmount, event.data.rewardUnit);
          } else if (event.type === 'close') {
            console.log('모듈 종료:', event.data.closeReason);
            cleanup();
          }
        },
        onError: (error) => {
          console.error('에러 발생:', error);
          cleanup?.();
        },
      });
    } catch (error) {
      console.error('실행 중 에러:', error);
    }
  }, [moduleId]);

  return <Button onPress={handleContactsViral}>친구에게 공유하고 리워드 받기</Button>;
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-contacts-viral](https://github.com/toss/apps-in-toss-examples/tree/main/with-contacts-viral) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

***

**타입 정의: `ContactsViralOption`**

**시그니처**

```ts
type ContactsViralOption = {
  moduleId: string;
};
```

**프로퍼티**

**`ContactsViralParams`**

`ContactsViralParams` 는 `contactsViral` 함수를 실행할 때 사용하는 파라미터 타입이에요. 옵션을 설정하고, 이벤트 및 에러 처리 콜백을 지정할 수 있어요.

**시그니처**

```ts
interface ContactsViralParams {
  options: ContactsViralOption;
  onEvent: (event: ContactsViralEvent) => void;
  onError: (error: unknown) => void;
}
```

**프로퍼티**

**`ContactsViralSuccessEvent`**

`ContactsViralSuccessEvent` 는 연락처 공유 모듈이 정상적으로 종료됐을 때 전달되는 이벤트 객체예요. 종료 이유와 함께 리워드 상태 및 남은 친구 수 등 관련 정보를 제공해요.

**시그니처**

```ts
type ContactsViralSuccessEvent = {
  type: 'close';
  data: {
    closeReason: 'clickBackButton' | 'noReward';
    sentRewardAmount?: number;
    sendableRewardsCount?: number;
    sentRewardsCount: number;
    rewardUnit?: string;
  };
};
```

**프로퍼티**

**예제**

모듈 종료 이벤트 처리하기

```ts
contactsViral({
  options: { moduleId: 'your-module-id' },
  onEvent: (event) => {
    if (event.type === 'close') {
      console.log('종료 사유:', event.data.closeReason);
      console.log('공유 완료한 친구 수:', event.data.sentRewardsCount);
    }
  },
  onError: (error) => {
    console.error('에러 발생:', error);
  },
});
```

**`RewardFromContactsViralEvent`**

`RewardFromContactsViralEvent` 는 친구에게 공유하기를 완료했을 때 지급할 리워드 정보를 담는 타입이에요. 이 타입을 사용하면 공유가 완료됐을 때 지급할 리워드 정보를 확인할 수 있어요.

**시그니처**

```ts
type RewardFromContactsViralEvent = {
  type: 'sendViral';
  data: {
    rewardAmount: number;
    rewardUnit: string;
  };
};
```

**프로퍼티**

**예제**

공유 완료 후 리워드 정보 처리하기

```ts
contactsViral({
  options: { moduleId: 'your-module-id' },
  onEvent: (event) => {
    if (event.type === 'sendViral') {
      console.log('리워드 지급:', event.data.rewardAmount, event.data.rewardUnit);
    }
  },
  onError: (error) => {
    console.error('에러 발생:', error);
  },
});
```

## 참고사항

* 공유 리워드는 **게임/비게임 미니앱 모두 사용 가능**해요.
* 리워드 정책과 지급 조건은 **SDK가 아닌 콘솔 설정**에 따라 결정돼요.
* 이벤트 처리 후에는 반드시 cleanup 함수를 호출해 주세요.

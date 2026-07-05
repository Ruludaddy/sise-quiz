---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게임/promotion.md
description: 게임 및 비게임 미니앱에서 프로모션을 통해 토스 포인트를 지급하는 방법을 안내해요.
---

# 프로모션

서비스 소개와 콘솔 설정 방법은 [프로모션 소개](/promotion/intro.html) 문서를 참고해 주세요.

:::tip 프로모션을 개발하기 전에 꼭 확인해 주세요

사용자의 오인지를 방지하기 위해 토스에서 이미 사용 중인 명칭과 동일하게 사용하거나 다른 의미로 사용하는 것은 불가해요.

**\[예시]**

* **포인트**
  * 미니앱 내에서 통용되는 자체 리워드에는 **'포인트'** 라는 명칭을 사용할 수 없어요.
    * '토스 포인트'가 지급된 것으로 오인할 수 있어요.
  * '토스 포인트'와 명확하게 구분할 수 있는 용어로 사용해 주세요.
* **출금, 인출 등** — 현금화하는 것으로 오인할 수 있는 용어는 사용할 수 없어요.
  * 미니앱 내에서 가상 자산이 '토스 포인트'로 전환되는 경우라면 **'토스 포인트 지급'** 으로 표기해 주세요.
    :::

:::tip 호출 제한
userKey별로 분당 최대 10회까지 호출할 수 있어요. 초과 시 에러가 반환돼요.
:::

***

## 게임 미니앱

별도의 서버 연동 없이도 **게임 미니앱 내에서 유저에게 토스 포인트를 지급**하고, 혜택탭에 노출할 수 있어요.

**SDK 함수: `grantPromotionRewardForGame`**

이 함수는 게임 카테고리 미니앱에서만 호출할 수 있어요. 비게임 카테고리에서 실행하면 오류가 발생해요.

:::tip 주의하세요

* **토스앱 5.232.0 버전 이상**에서 지원해요.\
  해당 버전 미만에서는 `undefined`가 반환되며, 미니앱 진입 시 업데이트 안내 화면이 표시돼요.
* 모든 사용자의 식별자를 안정적으로 확보하기 위해 **토스앱 최소 지원 버전을 5.232.0으로 상향**했어요.
* 게임 사용자 식별자는 **게임사 내부 식별용 키**로만 사용되며, 이 키로 토스 서버에 직접 요청할 수 없어요.
* 함수를 중복 호출하면 동일한 유저에게 리워드가 중복 지급될 수 있으니, **방어 로직을 반드시 적용**해 주세요.
* **실제 프로모션을 시작하기 전에 테스트용 프로모션 코드로 최소 1회 이상 호출**해야 해요.\
  (테스트 호출을 통해 프로모션이 정상적으로 등록 및 승인 상태로 전환돼요.)
  :::

**시그니처**

```typescript
function grantPromotionRewardForGame({
  params,
}: {
  params: {
    promotionCode: string;
    amount: number;
  };
}): Promise<GrantPromotionRewardForGameResult>;
```

**파라미터**

**반환 값**

포인트 지급 결과를 반환해요.

* `{ key: string }`: 포인트 지급에 성공했어요. key는 리워드 키를 의미해요.
* `{ errorCode: string, message: string }`: 포인트 지급에 실패했어요. 에러 코드를 확인해 주세요.

**에러 코드**

프로모션 함수 사용 중 발생할 수 있는 에러 코드 목록이에요.\
응답 코드나 메시지를 참고해 **적절한 예외 처리 로직**을 적용해 주세요.

:::tip `4109` 에러가 발생한다면?

* 프로모션 예산의 **80% 소진이 이메일로 안내**가 발송돼요.
* 프로모션을 계속 진행하려면 **콘솔에서 예산을 증액**해 주세요.
* 예산이 부족할 경우, **비즈월렛에서 금액을 충전**해 예산을 늘릴 수 있어요.
* 예산이 모두 소진되면 프로모션이 **자동으로 종료되어 `4109` 에러가 발생**해요.
* 예산 부족으로 인해 포인트 지급이 실패하면 **사용자 CS 이슈로 이어질 수 있으니 주의**해 주세요.
  :::

| 코드        | 메시지                               | 발생 원인 / 대응 방법                                                          |
| ----------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `40000`     |                                      | 게임이 아닌 미니앱에서 호출한 경우                                             |
| `4100`      | 프로모션 정보를 찾을 수 없어요       | 콘솔에 등록되지 않은 프로모션 키로 호출한 경우                                 |
| `4109`      | 프로모션이 실행중이 아니에요         | 콘솔에서 프로모션을 시작하지 않았거나, 예산이 모두 소진되어 자동 종료된 경우   |
| `4110`      | 리워드를 지급/회수할 수 없어요       | 내부 시스템 오류 발생한 경우로, **재지급 로직**을 적용해 주세요.               |
| `4111`      | 리워드 지급내역을 찾을 수 없어요     | 존재하지 않은 지급 내역을 조회한 경우                                          |
| `4112`      | 프로모션 머니가 부족해요             | 예산 부족으로 지급이 실패한 경우로, 콘솔에서 예산 증액 또는 비즈월렛 충전 필요 |
| `4114`      | 1회 지급 금액을 초과했어요           |                                                                                |
| `4116`      | 최대 지급 금액이 예산을 초과했어요   |                                                                                |
| `ERROR`     | 알 수 없는 오류가 발생했어요.        |                                                                                |
| `undefined` | 앱 버전이 최소 지원 버전보다 낮아요. |                                                                                |

**예제**

::: code-group

```js [js]
import { grantPromotionRewardForGame } from '@apps-in-toss/web-framework';

async function handleGrantPromotionRewardForGame() {
  const result = await grantPromotionRewardForGame({
    params: {
      promotionCode: 'GAME_EVENT_2024',
      amount: 1000,
    },
  });

  if (!result) {
    console.warn('지원하지 않는 앱 버전이에요.');
  } else if (result === 'ERROR') {
    console.error('포인트 지급 중 알 수 없는 오류가 발생했어요.');
  } else if ('key' in result) {
    console.log('포인트 지급 성공!', result.key);
  } else if ('errorCode' in result) {
    console.error('포인트 지급 실패:', result.errorCode, result.message);
  }
}
```

```tsx [React]
import { grantPromotionRewardForGame } from '@apps-in-toss/web-framework';

function GrantRewardButton() {
  async function handleClick() {
    const result = await grantPromotionRewardForGame({
      params: {
        promotionCode: 'GAME_EVENT_2024',
        amount: 1000,
      },
    });

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result === 'ERROR') {
      console.error('포인트 지급 중 알 수 없는 오류가 발생했어요.');
      return;
    }

    if ('key' in result) {
      console.log('포인트 지급 성공!', result.key);
    } else if ('errorCode' in result) {
      console.error('포인트 지급 실패:', result.errorCode, result.message);
    }
  }

  return <button onClick={handleClick}>포인트 지급하기</button>;
}
```

```tsx [React Native]
import { Button } from 'react-native';
import { grantPromotionRewardForGame } from '@apps-in-toss/framework';

function GrantRewardButton() {
  async function handlePress() {
    const result = await grantPromotionRewardForGame({
      params: {
        promotionCode: 'GAME_EVENT_2024',
        amount: 1000,
      },
    });

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result === 'ERROR') {
      console.error('포인트 지급 중 알 수 없는 오류가 발생했어요.');
      return;
    }

    if ('key' in result) {
      console.log('포인트 지급 성공!', result.key);
    } else if ('errorCode' in result) {
      console.error('포인트 지급 실패:', result.errorCode, result.message);
    }
  }

  return <Button onPress={handlePress} title="포인트 지급하기" />;
}
```

:::

***

## 비게임 미니앱

비게임 카테고리 미니앱에서 프로모션을 통해 유저에게 토스 포인트를 지급하는 방법은 두 가지예요.

* **서버 없이 지급**: 별도의 서버 연동 없이 SDK 함수 호출만으로 포인트를 지급해요.
* **서버를 통해 지급**: 파트너사 서버에서 API를 직접 호출해 포인트를 지급해요. 요청 위변조 방지 등 무결성이 중요한 경우에 사용해요.

### 서버 없이 프로모션 포인트 지급하기

**SDK 함수: `grantPromotionReward`**

별도의 서버 연동 없이도 **비게임 미니앱 내에서 유저에게 토스 포인트를 지급**하고, 혜택탭에 노출할 수 있어요.

:::tip 주의하세요

* **토스앱 5.232.0 버전 이상**에서 지원해요.\
  해당 버전 미만에서는 `undefined`가 반환되며, 미니앱 진입 시 업데이트 안내 화면이 표시돼요.
* 함수를 중복 호출하면 동일한 유저에게 리워드가 중복 지급될 수 있으니, **방어 로직을 반드시 적용**해 주세요.
* **실제 프로모션을 시작하기 전에 테스트용 프로모션 코드로 최소 1회 이상 호출**해야 해요.\
  테스트 프로모션 코드는 샌드박스 앱이 아닌 **토스앱(QR 코드 테스트)** 에서 호출해야 해요.
  :::

**시그니처**

```typescript
function grantPromotionReward({
  params,
}: {
  params: {
    promotionCode: string;
    amount: number;
  };
}): Promise<GrantPromotionRewardResult>;
```

**파라미터**

**반환 값**

포인트 지급 결과를 반환해요.

* `{ key: string }`: 포인트 지급에 성공했어요. key는 리워드 키를 의미해요.
* `{ errorCode: string, message: string }`: 포인트 지급에 실패했어요. 에러 코드를 확인해 주세요.

**에러 코드**

프로모션 함수 사용 중 발생할 수 있는 에러 코드 목록이에요.\
응답 코드나 메시지를 참고해 **적절한 예외 처리 로직**을 적용해 주세요.

:::tip `4109` 에러가 발생한다면?

* 프로모션 예산의 **80% 소진이 이메일로 안내**가 발송돼요.
* 프로모션을 계속 진행하려면 **콘솔에서 예산을 증액**해 주세요.
* 예산이 부족할 경우, **비즈월렛에서 금액을 충전**해 예산을 늘릴 수 있어요.
* 예산이 모두 소진되면 프로모션이 **자동으로 종료되어 `4109` 에러가 발생**해요.
* 예산 부족으로 인해 포인트 지급이 실패하면 **사용자 CS 이슈로 이어질 수 있으니 주의**해 주세요.
  :::

| 코드        | 메시지                               | 발생 원인 / 대응 방법                                                          |
| ----------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `4100`      | 프로모션 정보를 찾을 수 없어요       | 콘솔에 등록되지 않은 프로모션 키로 호출한 경우                                 |
| `4109`      | 프로모션이 실행중이 아니에요         | 콘솔에서 프로모션을 시작하지 않았거나, 예산이 모두 소진되어 자동 종료된 경우   |
| `4110`      | 리워드를 지급/회수할 수 없어요       | 내부 시스템 오류 발생한 경우로, **재지급 로직**을 적용해 주세요.               |
| `4111`      | 리워드 지급내역을 찾을 수 없어요     | 존재하지 않은 지급 내역을 조회한 경우                                          |
| `4112`      | 프로모션 머니가 부족해요             | 예산 부족으로 지급이 실패한 경우로, 콘솔에서 예산 증액 또는 비즈월렛 충전 필요 |
| `4114`      | 1회 지급 금액을 초과했어요           |                                                                                |
| `4116`      | 최대 지급 금액이 예산을 초과했어요   |                                                                                |
| `ERROR`     | 알 수 없는 오류가 발생했어요.        |                                                                                |
| `undefined` | 앱 버전이 최소 지원 버전보다 낮아요. |                                                                                |

**예제**

::: code-group

```js [js]
import { grantPromotionReward } from '@apps-in-toss/web-framework';

async function handleGrantPromotionReward() {
  const result = await grantPromotionReward({
    params: {
      promotionCode: 'EVENT_2024',
      amount: 1000,
    },
  });

  if (!result) {
    console.warn('지원하지 않는 앱 버전이에요.');
  } else if (result === 'ERROR') {
    console.error('포인트 지급 중 알 수 없는 오류가 발생했어요.');
  } else if ('key' in result) {
    console.log('포인트 지급 성공!', result.key);
  } else if ('errorCode' in result) {
    console.error('포인트 지급 실패:', result.errorCode, result.message);
  }
}
```

```tsx [React]
import { grantPromotionReward } from '@apps-in-toss/web-framework';

function GrantRewardButton() {
  async function handleClick() {
    const result = await grantPromotionReward({
      params: {
        promotionCode: 'EVENT_2024',
        amount: 1000,
      },
    });

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result === 'ERROR') {
      console.error('포인트 지급 중 알 수 없는 오류가 발생했어요.');
      return;
    }

    if ('key' in result) {
      console.log('포인트 지급 성공!', result.key);
    } else if ('errorCode' in result) {
      console.error('포인트 지급 실패:', result.errorCode, result.message);
    }
  }

  return <button onClick={handleClick}>포인트 지급하기</button>;
}
```

```tsx [React Native]
import { Button } from 'react-native';
import { grantPromotionReward } from '@apps-in-toss/framework';

function GrantRewardButton() {
  async function handlePress() {
    const result = await grantPromotionReward({
      params: {
        promotionCode: 'EVENT_2024',
        amount: 1000,
      },
    });

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result === 'ERROR') {
      console.error('포인트 지급 중 알 수 없는 오류가 발생했어요.');
      return;
    }

    if ('key' in result) {
      console.log('포인트 지급 성공!', result.key);
    } else if ('errorCode' in result) {
      console.error('포인트 지급 실패:', result.errorCode, result.message);
    }
  }

  return <Button onPress={handlePress} title="포인트 지급하기" />;
}
```

:::

***

### 서버를 통해 프로모션 포인트 지급하기

파트너사 서버에서 직접 API를 호출해 유저에게 토스 포인트를 지급하는 방식이에요.

![](/assets/promotion_flow.Cv3ZwYVx.webp)

:::tip BaseURL
`https://apps-in-toss-api.toss.im`
:::

:::tip 서버 간 통신에는 mTLS 인증서가 필요해요

프로모션 포인트 지급 API는 파트너 서버에서 앱인토스 서버로 호출하는 서버 간 통신이에요.
보안을 위해 서버에 mTLS 인증서를 설정한 뒤 호출해 주세요. 인증서 발급 방법은 [mTLS 인증서 발급 방법](/development/integration-process.html#mtls-인증서-발급-방법)을 참고해 주세요.

:::

**① 프로모션 리워드 지급 Key 생성하기**

프로모션 지급을 위한 Key를 발급해요.\
이 Key를 사용해 유저에게 리워드를 지급할 수 있어요.

:::tip 주의해 주세요

* 유저에게 리워드를 지급하는 주체는 파트너사예요.\
  발급받은 Key로 유저에게 리워드를 지급하면, **프로모션 예산 한도 내에서** 지속적으로 지급돼요.

* **1회 지급만 허용**하려면 파트너사에서 자체적으로 제어해야 해요.

* 이미 사용한 지급 Key로 다시 지급을 시도하면 `4113` 에러가 발생해요.\
  추가 지급이 필요할 경우, **새로운 Key를 발급**해 주세요.

* 발급받은 **Key의 유효시간은 1시간**이에요.
  :::

* Content-type: application/json

* Method: `POST`

* Endpoint: `/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key`

**요청 헤더**

| 이름            | 타입   | 필수값 여부 | 설명                              |
| --------------- | ------ | ----------- | --------------------------------- |
| x-toss-user-key | string | Y           | 토스 로그인을 통해 획득한 userKey |

**응답 파라미터**

| 이름 | 타입   | 설명                                             |
| ---- | ------ | ------------------------------------------------ |
| key  | String | 프로모션 지급을 위한 key 값 (base64 인코딩된 값) |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

**② 프로모션 리워드 지급하기**

발급받은 key로 **프로모션 리워드 지급을 실행**해요.\
지급 시 프로모션 예산에서 차감되며, 실제 지급까지는 약간의 지연이 발생할 수 있어요.

* Content-type: application/json
* Method: `POST`
* Endpoint: `/api-partner/v1/apps-in-toss/promotion/execute-promotion`

**요청 헤더**

| 이름            | 타입   | 필수값 여부 | 설명                              |
| --------------- | ------ | ----------- | --------------------------------- |
| x-toss-user-key | string | Y           | 토스 로그인을 통해 획득한 userKey |

**요청 파라미터**

| 이름          | 타입    | 필수 | 설명                              |
| ------------- | ------- | ---- | --------------------------------- |
| promotionCode | String  | Y    | 콘솔에서 생성한 프로모션 코드 ID  |
| key           | String  | Y    | 프로모션 지급을 위해 발급받은 KEY |
| amount        | Integer | Y    | 프로모션 지급 금액                |

```json
{
  "promotionCode": "01JPPJ6SB66BQXXDAKRQZ6SZD7",
  "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0=",
  "amount": 10
}
```

**응답 파라미터**

| 이름 | 타입   | 설명                              |
| ---- | ------ | --------------------------------- |
| key  | String | 프로모션 지급을 위해 발급받은 KEY |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

**③ 프로모션 지급 결과 조회하기**

지급 요청 이후의 **프로모션 지급 상태를 조회**해요.

* Content-type: application/json
* Method: `POST`
* Endpoint: `/api-partner/v1/apps-in-toss/promotion/execution-result`

**요청 헤더**

| 이름            | 타입   | 필수값 여부 | 설명                              |
| --------------- | ------ | ----------- | --------------------------------- |
| x-toss-user-key | string | Y           | 토스 로그인을 통해 획득한 userKey |

**요청 파라미터**

| 이름          | 타입   | 필수 | 설명                              |
| ------------- | ------ | ---- | --------------------------------- |
| promotionCode | String | Y    | 콘솔에서 생성한 프로모션 코드 ID  |
| key           | String | Y    | 프로모션 지급을 위해 발급받은 KEY |

```json
{
  "promotionCode": "01JPPJ6SB66BQXXDAKRQZ6SZD7",
  "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
}
```

**응답 파라미터**

| 이름    | 타입   | 설명                                                  |
| ------- | ------ | ----------------------------------------------------- |
| success | String | 프로모션 지급 결과 (`SUCCESS` / `PENDING` / `FAILED`) |

```json
{
  "resultType": "SUCCESS",
  "success": "PENDING"
}
```

**에러 코드**

프로모션 API 사용 중 발생할 수 있는 에러 코드 목록이에요.\
응답 코드나 메시지를 참고해 **적절한 예외 처리 로직**을 적용해 주세요.

:::tip `4109` 에러가 발생한다면?

* 프로모션 예산의 **80% 소진이 이메일로 안내**가 발송돼요.
* 프로모션을 계속 진행하려면 **콘솔에서 예산을 증액**해 주세요.
* 예산이 부족할 경우, **비즈월렛에서 금액을 충전**해 예산을 늘릴 수 있어요.
* 예산이 모두 소진되면 프로모션이 **자동으로 종료되어 `4109` 에러가 발생**해요.
* 예산 부족으로 인해 포인트 지급이 실패하면 **사용자 CS 이슈로 이어질 수 있으니 주의**해 주세요.
  :::

| 코드   | 메시지                             | 발생 원인 / 대응 방법                                                          |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| `4100` | 프로모션 정보를 찾을 수 없어요     | 콘솔에 등록되지 않은 프로모션 키로 호출한 경우                                 |
| `4109` | 프로모션이 실행중이 아니에요       | 콘솔에서 프로모션을 시작하지 않았거나, 예산이 모두 소진되어 자동 종료된 경우   |
| `4110` | 리워드를 지급/회수할 수 없어요     | 내부 시스템 오류 발생한 경우로, **재지급 로직**을 적용해 주세요.               |
| `4111` | 리워드 지급내역을 찾을 수 없어요   | 존재하지 않은 지급 내역을 조회한 경우                                          |
| `4112` | 프로모션 머니가 부족해요           | 예산 부족으로 지급이 실패한 경우로, 콘솔에서 예산 증액 또는 비즈월렛 충전 필요 |
| `4113` | 이미 지급/회수된 내역이에요        | 동일한 Key로 중복 지급할 경우로, 새로운 Key를 발급해 재시도해 주세요.          |
| `4114` | 1회 지급 금액을 초과했어요         |                                                                                |
| `4116` | 최대 지급 금액이 예산을 초과했어요 |                                                                                |

---
url: 'https://developers-apps-in-toss.toss.im/smart-message/develop.md'
description: >-
  기능성 메시지를 파트너사 서버에서 직접 발송하는 API 가이드예요. 테스트 메시지, 메시지, 대량 메시지 발송 API 사용법을 확인할 수
  있어요.
---

# 스마트 발송

결제 완료, 배송 안내처럼 **서비스 이용에 필요한 기능성 메시지**를 파트너사 서버에서 직접 발송할 때 사용하는 API예요.

::: tip BaseURL
`https://apps-in-toss-api.toss.im`
:::

::: tip 서버 간 통신에는 mTLS 인증서가 필요해요

스마트 발송 API는 파트너 서버에서 앱인토스 서버로 호출하는 서버 간 통신이에요. 보안을 위해 서버에 mTLS 인증서를 설정한 뒤 호출해 주세요. 인증서 발급 방법은 [mTLS 인증서 발급 방법](/development/integration-process.html#mtls-인증서-발급-방법)을 참고해 주세요.

:::

::: tip API 발송 전 콘솔 설정이 필요해요
API를 호출하기 전에 아래 절차를 먼저 완료해야 해요.

1. 콘솔에서 기능성 캠페인을 생성하고 템플릿 코드(`templateSetCode`)를 발급받아요.
2. 알림 동의문이 필요한 메시지라면 캠페인 생성 전에 알림 동의문을 먼저 만들고, 기능성 캠페인에 연결해야 해요.
3. 문구 검수 승인을 받아야 해요. 승인 전에는 테스트 메시지도 발송할 수 없어요.

설정 방법은 [스마트 발송 소개](/smart-message/intro.html) 문서를 참고해 주세요.
:::

***

## 알림 동의문이 필요한 경우

메시지 발송 전 **알림 동의문이 필요한지 여부**는 메시지 성격에 따라 달라요.

**동의문 없이 바로 API를 호출할 수 있는 경우**

서비스 이용에 꼭 필요한 정보는 사용자 동의 없이 발송할 수 있어요.

* 결제 완료, 배송 시작, 배송 완료, 환불 완료
* 정보 변경 안내, 약관 변경 안내

**알림 동의문이 필요한 경우**

사용자가 특정 알림을 받겠다고 선택하는 상황에서는 반드시 [알림 동의문 요청하기](#_4-%EC%95%8C%EB%A6%BC-%EB%8F%99%EC%9D%98%EB%AC%B8-%EC%9A%94%EC%B2%AD%ED%95%98%EA%B8%B0-requestnotificationagreement)를 통해 동의를 먼저 받아야 해요.

* 재입고 알림 신청
* 이벤트 시작 알림 신청
* 가격 변동 알림 신청
* 예약 오픈 알림 신청

***

## 1. 테스트 메시지 발송하기

콘솔에서 기능성 캠페인을 생성하고 문구 검수 승인을 받은 뒤, 실제 배포 전에 번들이 정상 동작하는지 확인할 때 사용해요.

* Content-Type: `application/json`
* Method: `POST`
* URL: `/api-partner/v1/apps-in-toss/messenger/send-test-message`

**요청 헤더**

| 이름            | 타입   | 필수 | 설명                                                                                          |
| --------------- | ------ | ---- | --------------------------------------------------------------------------------------------- |
| x-toss-user-key | string | Y    | 사용자를 인증하기 위한 키예요. [사용자 정보 받기](/api/loginMe.html)를 통해 획득할 수 있어요. |

**요청 바디**

| 이름            | 타입   | 필수 | 설명                                                                                                     |
| --------------- | ------ | ---- | -------------------------------------------------------------------------------------------------------- |
| templateSetCode | string | Y    | 사용할 메시지 템플릿 코드예요. 콘솔에서 등록한 템플릿 코드를 입력해요.                                   |
| deploymentId    | string | Y    | 테스트에 사용할 번들 식별값이에요. UUID 형식이며, 콘솔 → 앱 출시에서 업로드한 번들에서 확인할 수 있어요. |
| context         | object | Y    | 템플릿 변수값들이에요. 사용자 이름, 인증번호 등 템플릿에 들어갈 값을 넣어요.                             |

```json
{
  "templateSetCode": "ALERT_OTP_TEMPLATE",
  "deploymentId": "019abfe8-fd68-7021-9cdc-30d6053cc009",
  "context": {
    "userName": "홍길동",
    "otp": "123456"
  }
}
```

**성공 응답**

| 이름                | 타입    | 설명                                             |
| ------------------- | ------- | ------------------------------------------------ |
| msgCount            | integer | 총 발송된 메시지 수예요.                         |
| sentPushCount       | integer | 푸시(Push)로 발송된 메시지 수예요.               |
| sentInboxCount      | integer | 인박스(Inbox)로 발송된 메시지 수예요.            |
| sentSmsCount        | integer | SMS로 발송된 메시지 수예요.                      |
| sentAlimtalkCount   | integer | 알림톡으로 발송된 메시지 수예요.                 |
| sentFriendtalkCount | integer | 친구톡으로 발송된 메시지 수예요.                 |
| detail              | object  | 전송에 성공한 메시지들의 채널별 상세 목록이에요. |
| fail                | object  | 전송에 실패한 메시지들의 채널별 상세 목록이에요. |

`detail` / `fail` 하위 공통 필드:

| 이름           | 타입  | 설명                                       |
| -------------- | ----- | ------------------------------------------ |
| sentPush       | array | 푸시(Push) 채널의 발송 결과 목록이에요.    |
| sentInbox      | array | 인박스(Inbox) 채널의 발송 결과 목록이에요. |
| sentSms        | array | SMS 채널의 발송 결과 목록이에요.           |
| sentAlimtalk   | array | 알림톡 채널의 발송 결과 목록이에요.        |
| sentFriendtalk | array | 친구톡 채널의 발송 결과 목록이에요.        |

각 채널 배열의 항목 필드:

| 이름              | 타입   | 설명                                               |
| ----------------- | ------ | -------------------------------------------------- |
| contentId         | string | 발송된 메시지의 고유 ID예요.                       |
| reachedFailReason | string | 메시지 도달에 실패한 경우 실패 사유가 담겨 있어요. |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "msgCount": 1,
    "sentPushCount": 1,
    "sentInboxCount": 0,
    "sentSmsCount": 0,
    "sentAlimtalkCount": 0,
    "sentFriendtalkCount": 0,
    "detail": {
      "sentPush": [{ "contentId": "MSG_ABC123" }],
      "sentInbox": [],
      "sentSms": [],
      "sentAlimtalk": [],
      "sentFriendtalk": []
    },
    "fail": {
      "sentPush": [],
      "sentInbox": [],
      "sentSms": [],
      "sentAlimtalk": [],
      "sentFriendtalk": []
    }
  }
}
```

**실패 응답**

```json
{
  "resultType": "FAIL",
  "error": {
    "errorCode": "INVALID_PARAMETER",
    "reason": "요청에 실패했습니다."
  }
}
```

| HTTP 상태 코드 | 설명                                        |
| -------------- | ------------------------------------------- |
| 400            | 요청이 잘못됐거나 필요한 정보가 누락됐어요. |
| 401            | 인증되지 않은 사용자예요.                   |
| 403            | 메시지를 전송할 권한이 없어요.              |

***

## 2. 메시지 발송하기

특정 사용자 1명에게 기능성 메시지를 발송해요.\
문구 검수 승인 후 파트너사 서버에서 원하는 시점에 직접 호출할 수 있어요.

* Content-Type: `application/json`
* Method: `POST`
* URL: `/api-partner/v1/apps-in-toss/messenger/send-message`

::: tip 호출 제한
userKey별로 분당 최대 10회까지 호출할 수 있어요. 초과 시 에러가 반환돼요.
:::

**요청 헤더**

| 이름            | 타입   | 필수 | 설명                                                                                          |
| --------------- | ------ | ---- | --------------------------------------------------------------------------------------------- |
| x-toss-user-key | string | Y    | 사용자를 인증하기 위한 키예요. [사용자 정보 받기](/api/loginMe.html)를 통해 획득할 수 있어요. |

**요청 바디**

| 이름            | 타입   | 필수 | 설명                                                                         |
| --------------- | ------ | ---- | ---------------------------------------------------------------------------- |
| templateSetCode | string | Y    | 사용할 메시지 템플릿 코드예요. 콘솔에서 등록한 템플릿 코드를 입력해요.       |
| context         | object | Y    | 템플릿 변수값들이에요. 사용자 이름, 인증번호 등 템플릿에 들어갈 값을 넣어요. |

```json
{
  "templateSetCode": "ALERT_OTP_TEMPLATE",
  "context": {
    "userName": "홍길동",
    "otp": "123456"
  }
}
```

```
curl --location 'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/messenger/send-message' \
--header 'Content-Type: application/json' \
--header 'x-toss-user-key: {{userKey}}' \
--data '{
  "templateSetCode": "ALERT_OTP_TEMPLATE",
  "context": {
    "userName": "홍길동",
    "otp": "123456"
  }
}'
```

**성공 응답**

응답 구조는 [테스트 메시지 발송하기](#_1-테스트-메시지-발송하기)와 동일해요.

```json
{
  "resultType": "SUCCESS",
  "success": {
    "msgCount": 1,
    "sentPushCount": 1,
    "sentInboxCount": 0,
    "sentSmsCount": 0,
    "sentAlimtalkCount": 0,
    "sentFriendtalkCount": 0,
    "detail": {
      "sentPush": [{ "contentId": "MSG_ABC123" }],
      "sentInbox": [],
      "sentSms": [],
      "sentAlimtalk": [],
      "sentFriendtalk": []
    },
    "fail": {
      "sentPush": [],
      "sentInbox": [],
      "sentSms": [],
      "sentAlimtalk": [],
      "sentFriendtalk": []
    }
  }
}
```

**실패 응답**

```json
{
  "resultType": "FAIL",
  "error": {
    "errorCode": "INVALID_PARAMETER",
    "reason": "요청에 실패했습니다."
  }
}
```

| HTTP 상태 코드 | 설명                                        |
| -------------- | ------------------------------------------- |
| 400            | 요청이 잘못됐거나 필요한 정보가 누락됐어요. |
| 401            | 인증되지 않은 사용자예요.                   |
| 403            | 메시지를 전송할 권한이 없어요.              |

***

## 3. 대량 메시지 발송하기

여러 사용자에게 동일한 기능성 메시지 템플릿으로 한 번에 발송해요.\
50건 이상의 발송에 사용하며, 한 번 요청 시 최대 2,500건까지 발송할 수 있어요.

* Content-Type: `application/json`
* Method: `POST`
* URL: `/api-partner/v1/apps-in-toss/messenger/send-bulk-message`

**요청 바디**

| 이름            | 타입   | 필수 | 설명                                                                   |
| --------------- | ------ | ---- | ---------------------------------------------------------------------- |
| templateSetCode | string | Y    | 사용할 메시지 템플릿 코드예요. 콘솔에서 등록한 템플릿 코드를 입력해요. |
| contextList     | array  | Y    | 메시지를 받을 사용자 목록이에요. 최소 1건, 최대 2,500건까지 가능해요.  |

`contextList` 항목 필드:

| 이름    | 타입    | 필수 | 설명                                                                         |
| ------- | ------- | ---- | ---------------------------------------------------------------------------- |
| userKey | integer | Y    | 사용자의 고유 식별자예요.                                                    |
| context | object  | Y    | 템플릿 변수값들이에요. 사용자 이름, 인증번호 등 템플릿에 들어갈 값을 넣어요. |

```json
{
  "templateSetCode": "ALERT_OTP_TEMPLATE",
  "contextList": [
    {
      "userKey": 12345678,
      "context": {
        "userName": "홍길동",
        "otp": "123456"
      }
    },
    {
      "userKey": 87654321,
      "context": {
        "userName": "김철수",
        "otp": "654321"
      }
    }
  ]
}
```

```
curl --location 'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/messenger/send-bulk-message' \
--header 'Content-Type: application/json' \
--data '{
  "templateSetCode": "ALERT_OTP_TEMPLATE",
  "contextList": [
    {
      "userKey": 12345678,
      "context": { "userName": "홍길동", "otp": "123456" }
    },
    {
      "userKey": 87654321,
      "context": { "userName": "김철수", "otp": "654321" }
    }
  ]
}'
```

**성공 응답**

응답 구조는 [테스트 메시지 발송하기](#_1-테스트-메시지-발송하기)와 동일해요.

```json
{
  "resultType": "SUCCESS",
  "success": {
    "msgCount": 2,
    "sentPushCount": 2,
    "sentInboxCount": 0,
    "sentSmsCount": 0,
    "sentAlimtalkCount": 0,
    "sentFriendtalkCount": 0,
    "detail": {
      "sentPush": [{ "contentId": "MSG_ABC123" }, { "contentId": "MSG_DEF456" }],
      "sentInbox": [],
      "sentSms": [],
      "sentAlimtalk": [],
      "sentFriendtalk": []
    },
    "fail": {
      "sentPush": [],
      "sentInbox": [],
      "sentSms": [],
      "sentAlimtalk": [],
      "sentFriendtalk": []
    }
  }
}
```

***

## 4. 알림 동의문 요청하기 (`requestNotificationAgreement`)

`requestNotificationAgreement`는 스마트 발송의 **기능성 메시지**를 보내기 전, 사용자에게 알림 수신 동의 UI를 요청하는 함수예요.

사용자가 특정 알림을 받겠다고 선택하는 상황에서는 반드시 동의를 먼저 받아야 해요.\
동의 결과는 `onEvent` 콜백으로 전달되며, 결과에 따라 알림 발송 여부를 결정할 수 있어요.

::: tip 알림 동의문 등록이 필요해요
개발 전에 아래 절차를 먼저 완료해야 해요.

1. 알림 동의문을 생성해요.
2. 기능성 캠페인을 생성하고 등록한 알림 동의문을 연결해요.
3. 문구 검수 승인을 받으면 등록한 기능성 캠페인의 템플릿 코드를 사용할 수 있어요.
4. 이 템플릿 코드를 `templateCode`로 전달해요.

설정 방법은 [스마트 발송 소개](/smart-message/intro.html) 문서를 참고해 주세요.
:::

**시그니처**

```typescript
function requestNotificationAgreement(params: RequestNotificationAgreementOptions): () => void;
```

**파라미터**

**반환값**

**예제**

::: code-group

```tsx [React]
import { requestNotificationAgreement } from '@apps-in-toss/web-framework';

function NotificationAgreementButton() {
  const handleRequestAgreement = () => {
    const cleanup = requestNotificationAgreement({
      options: {
        templateCode: 'your-template-code',
      },
      onEvent: ({ type }) => {
        if (type === 'newAgreement') {
          console.log('알림 수신에 동의했어요.');
        } else if (type === 'alreadyAgreed') {
          console.log('이미 동의된 상태예요.');
        } else if (type === 'agreementRejected') {
          console.log('알림 수신을 거부했어요.');
        }
        cleanup();
      },
      onError: (error) => {
        console.error('알림 동의 요청에 실패했어요:', error);
        cleanup();
      },
    });
  };

  return <button onClick={handleRequestAgreement}>알림 받기</button>;
}
```

```tsx [React Native]
import { Button } from 'react-native';
import { requestNotificationAgreement } from '@apps-in-toss/framework';

function NotificationAgreementButton() {
  const handleRequestAgreement = () => {
    const cleanup = requestNotificationAgreement({
      options: {
        templateCode: 'your-template-code',
      },
      onEvent: ({ type }) => {
        if (type === 'newAgreement') {
          console.log('알림 수신에 동의했어요.');
        } else if (type === 'alreadyAgreed') {
          console.log('이미 동의된 상태예요.');
        } else if (type === 'agreementRejected') {
          console.log('알림 수신을 거부했어요.');
        }
        cleanup();
      },
      onError: (error) => {
        console.error('알림 동의 요청에 실패했어요:', error);
        cleanup();
      },
    });
  };

  return <Button title="알림 받기" onPress={handleRequestAgreement} />;
}
```

:::

**`RequestNotificationAgreementOptions`**

`requestNotificationAgreement` 함수에 전달하는 파라미터 타입이에요.

```typescript
interface RequestNotificationAgreementOptions {
  options: {
    templateCode: string;
  };
  onEvent: (result: { type: NotificationAgreementResult }) => void;
  onError: (error: unknown) => void | Promise<void>;
}
```

**`NotificationAgreementResult`**

`onEvent` 콜백으로 전달되는 동의 결과 타입이에요.

```typescript
type NotificationAgreementResult = 'newAgreement' | 'alreadyAgreed' | 'agreementRejected';
```

| 값                  | 설명                                                       |
| ------------------- | ---------------------------------------------------------- |
| `newAgreement`      | 사용자가 새로 동의를 완료한 경우예요.                      |
| `alreadyAgreed`     | 이미 동의된 상태로, 추가 동의 없이 결과가 반환된 경우예요. |
| `agreementRejected` | 사용자가 동의를 거부한 경우예요.                           |

**참고사항**

* `onEvent` 또는 `onError` 콜백에서 반환된 cleanup 함수를 반드시 호출해 주세요.
* 동일 컴포넌트에서 함수를 재호출하기 전에 이전 cleanup을 먼저 실행해 주세요. 그렇지 않으면 이전 이벤트 리스너가 중복으로 남아 있을 수 있어요.
* 알림 동의문 등록 방법과 기능성 메시지 발송 흐름은 [스마트 발송 소개](/smart-message/intro.html) 문서를 참고해 주세요.
* 사용자 동의 후 메시지를 발송하려면 파트너사 서버에서 [메시지 발송하기](#_2-메시지-발송하기)를 호출해 주세요.
* 사용자는 토스 앱 → 전체 탭 → 설정 버튼 → 알림 → 서비스별 알림에서 알림 수신 여부를 직접 제어할 수 있어요.

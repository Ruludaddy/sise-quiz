---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/유저
  정보/getConsentedUserData.md
---

# 사용자 정보

::: tip 콘솔 설정이 필요해요
`getConsentedUserData`를 사용하려면 먼저 콘솔에서 사용자 정보 불러오기를 등록해야 해요.\
[사용자 정보 소개 문서](/prepare/user-info.html)를 먼저 확인해 주세요.
:::

## 사용자 정보 가져오기 (`getConsentedUserData`)

`getConsentedUserData`는 사용자 동의 기반 데이터를 요청하는 함수예요.\
동의가 필요한 경우 약관 웹뷰를 띄우고, 동의가 완료되면 서버에서 조회한 데이터를 반환해요.

**시그니처**

```typescript
function getConsentedUserData(options: GetConsentedUserDataOptions): Promise<ConsentedUserData | undefined>;
```

**타입**

```typescript
type GetConsentedUserDataErrorCode =
  | 'USER_DECLINED'
  | 'UNAVAILABLE'
  | 'TERMS_NOT_SET'
  | 'INVALID_REQUEST'
  | 'CANCELED'
  | 'CONSENTED_USER_DATA_AGREEMENT_FAILED'
  | 'CONSENTED_USER_DATA_INVALID_DATA';

interface GetConsentedUserDataOptions {
  consentedUserDataKey: string;
  shouldRequestAgreementWhenUserDeclined?: boolean;
}

type ConsentedUserDataKey =
  | 'USER_NAME'
  | 'USER_GENDER'
  | 'USER_NATIONALITY'
  | 'USER_BIRTHDAY'
  | 'USER_PHONE'
  | 'USER_ADDRESS'
  | 'USER_EMAIL'
  | 'USER_CONSUMPTION_HISTORY';

type ConsentedUserData = Partial<Record<ConsentedUserDataKey, string>>;
```

**파라미터**

**반환값**

`ConsentedUserData`에는 요청한 항목에 해당하는 키만 포함될 수 있어요.

| 키                 | 설명                | 비고                                                                     |
| ------------------ | ------------------- | ------------------------------------------------------------------------ |
| `USER_NAME`        | 사용자 이름         |                                                                          |
| `USER_GENDER`      | 사용자 성별         |                                                                          |
| `USER_NATIONALITY` | 내국인/외국인 여부  |                                                                          |
| `USER_BIRTHDAY`    | 사용자 생년월일     |                                                                          |
| `USER_PHONE`       | 사용자 휴대전화번호 |                                                                          |
| `USER_ADDRESS`     | 사용자 집 주소      | 토스 가입 시 필수가 아니어서 값이 없을 수 있고, 이 경우 null로 전달돼요. |
| `USER_EMAIL`       | 사용자 이메일 주소  | 토스 가입 시 필수가 아니어서 값이 없을 수 있고, 이 경우 null로 전달돼요. |

**에러 코드**

`getConsentedUserData` 호출이 실패하면 아래 에러 코드가 반환될 수 있어요.

| 에러 코드                              | 설명                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `USER_DECLINED`                        | 사용자가 명시적으로 거부했고 재요청 옵션이 없거나, 약관 웹뷰에서 동의를 거부한 경우예요.      |
| `UNAVAILABLE`                          | 서버가 사용자 동의 여부를 판단할 수 없는 경우예요.                                            |
| `TERMS_NOT_SET`                        | 미니앱에 사용자 데이터 제공 동의문이 설정되지 않은 경우예요.                                  |
| `INVALID_REQUEST`                      | `consentedUserDataKey`가 비어 있거나, `termsUrl`이 없거나, HTTPS 회사 도메인이 아닌 경우예요. |
| `CANCELED`                             | 약관 웹뷰가 결과를 보내기 전에 닫힌 경우예요.                                                 |
| `CONSENTED_USER_DATA_AGREEMENT_FAILED` | 약관 웹뷰 처리 중 오류가 발생한 경우예요.                                                     |
| `CONSENTED_USER_DATA_INVALID_DATA`     | `PROVIDED`인데 `data`가 없거나, 동의 성공 후 재조회 결과가 `PROVIDED`가 아닌 경우예요.        |

**예제**

::: code-group

```tsx [WebView]
import { getConsentedUserData } from '@apps-in-toss/web-framework';

async function fetchDeliveryUserData() {
  try {
    const data = await getConsentedUserData({
      consentedUserDataKey: 'cud_delivery',
    });

    console.log('사용자 이름:', data?.USER_NAME);
    console.log('전화번호:', data?.USER_PHONE);
  } catch (error) {
    console.error('동의 데이터 조회 실패:', error);
  }
}
```

```tsx [React Native]
import { getConsentedUserData } from '@apps-in-toss/framework';

async function fetchDeliveryUserData() {
  try {
    const data = await getConsentedUserData({
      consentedUserDataKey: 'cud_delivery',
    });

    console.log('사용자 이름:', data?.USER_NAME);
    console.log('전화번호:', data?.USER_PHONE);
  } catch (error) {
    console.error('동의 데이터 조회 실패:', error);
  }
}
```

:::

## 유의 사항

* `USER_ADDRESS`, `USER_EMAIL`는 사용자가 토스에 등록하지 않은 경우 `null`로 전달돼요. 반드시 null 처리를 해주세요.
* 사용자가 동의를 철회하려면 **토스앱 → 설정 → 약관 및 개인정보 처리 동의 → 미니앱 이름**에서 항목별로 개별 철회할 수 있어요.

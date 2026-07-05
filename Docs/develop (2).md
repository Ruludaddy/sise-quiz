---
url: 'https://developers-apps-in-toss.toss.im/tossauth/develop.md'
description: 토스 인증 개발 가이드와 테스트 방법을 안내해요.
---

# 토스 인증

::: tip 최소 버전을 확인해 주세요

* **SDK** : 1.2.1 이상
* **토스앱 (본인확인)** : 5.233.0 이상
* **토스앱 (원터치 인증)** : 5.236.0 이상

[getTossAppVersion](/bedrock/reference/framework/환경%20확인/version) 함수를 사용하여 토스앱 버전을 체크해 보세요.
:::

![](/assets/tossauth_flow.DPulCLyo.webp)

## 방화벽 설정

요청 서버의 **아웃바운드(Outbound)** 설정에 아래 토스인증 IP를 허용해 주세요.\
모든 통신은 **443 포트(HTTPS)** 를 사용해요.

토스 인증 서버는 **인바운드(Inbound)** 가 제한 없이 오픈되어 있어, 별도 설정 없이 바로 통신할 수 있어요.

::: tip 본인확인 IP

* 117.52.3.222
* 117.52.3.235
* 211.115.96.222
* 211.115.96.235
  :::

## 1. AccessToken 받기

토스 본인확인을 위한 **Access Token**을 발급받아요.\
발급된 토큰은 이후 모든 API 호출의 **Authorization** 헤더에 사용돼요.

토큰에는 **만료 시간(`expires_in`)** 이 있어요. 만료 시 새 토큰을 발급해야 하고, **유효한 토큰이 있으면 재발급을 피해서** 불필요한 호출을 줄여 주세요.

* Base URL: `https://oauth2.cert.toss.im`
* Endpoint: `/token`
* Method: `POST`
* Content-Type: `application/x-www-form-urlencoded`

**요청 헤더**

| 이름         | 타입   | 필수값 여부 | 설명                                |
| ------------ | ------ | ----------- | ----------------------------------- |
| Content-Type | string | Y           | `application/x-www-form-urlencoded` |

**요청 파라미터**

| 이름          | 타입   | 필수값 여부 | 설명                              |
| ------------- | ------ | ----------- | --------------------------------- |
| grant\_type    | string | Y           | 고정 값: `client_credentials`     |
| scope         | string | Y           | 인증 요청 범위 (예: `ca`)         |
| client\_id     | string | Y           | 고객사에 발급된 클라이언트 아이디 |
| client\_secret | string | Y           | 고객사에 발급된 클라이언트 시크릿 |

::: code-group

```bash [Shell(curl)]
curl --request POST 'https://oauth2.cert.toss.im/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=test_a8e23336d673ca70922b485fe806eb2d' \
--data-urlencode 'client_secret=test_418087247d66da09fda1964dc4734e453c7cf66a7a9e3' \
--data-urlencode 'scope=ca'
```

```java
URL url = new URL("https://oauth2.cert.toss.im/token");
HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
httpConn.setRequestMethod("POST");

httpConn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
httpConn.setDoOutput(true);
OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
writer.write("grant_type=client_credentials&" +
        "client_id=test_a8e23336d673ca70922b485fe806eb2d&" +
        "client_secret=test_418087247d66da09fda1964dc4734e453c7cf66a7a9e3&" +
        "scope=ca");
writer.flush();
writer.close();

httpConn.getOutputStream().close();
InputStream responseStream = httpConn.getResponseCode() == 200
        ? httpConn.getInputStream()
        : httpConn.getErrorStream();
Scanner s = new Scanner(responseStream).useDelimiter("\A");
String response = s.hasNext() ? s.next() : "";
System.out.println(response);
```

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://oauth2.cert.toss.im/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type' : 'application/x-www-form-urlencoded',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials&client_id=test_a8e23336d673ca70922b485fe806eb2d&client_secret=test_418087247d66da09fda1964dc4734e453c7cf66a7a9e3&scope=ca');

$response = curl_exec($ch);

curl_close($ch);
```

:::

**응답**

| 이름         | 타입   | 설명                      |
| ------------ | ------ | ------------------------- |
| access\_token | string | Access Token 값           |
| scope        | string | 발급된 인증 범위          |
| token\_type   | string | 토큰 타입 (항상 `Bearer`) |
| expires\_in   | number | 토큰 만료 시간(초 단위)   |

```json
{
  "access_token": "eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ",
  "scope": "ca",
  "token_type": "Bearer",
  "expires_in": 31536000
}
```

## 2. 인증 요청하기

토스 인증 서버에서 `txId`를 발급받아 본인확인 절차를 시작해요.

* BaseURL : `https://cert.toss.im`
* Endpoint : `/api/v2/sign/user/auth/request`
* Method : `POST`
* Content-type : `application/json`

### 2-1. 개인정보 기반 인증

고객의 **이름·생년월일·전화번호** 를 **암호화 후 전송**하는 방식이에요.\
보안을 위해 [세션키(sessionKey)](#세션키-생성)는 매 요청마다 새로 생성해 주세요.

**요청 헤더**

| 이름          | 타입   | 필수값 여부 | 설명                    |
| ------------- | ------ | ----------- | ----------------------- |
| Authorization | string | Y           | `Bearer {Access Token}` |
| Content-Type  | string | Y           | `application/json`      |

**요청 파라미터**

| 이름         | 타입   | 필수값 여부 | 설명                                                                   |
| ------------ | ------ | ----------- | ---------------------------------------------------------------------- |
| requestUrl   | string | Y           | 토스 본인확인 사용 시 돌아갈 고객사 앱스킴                             |
| requestType  | string | Y           | `USER_PERSONAL`                                                        |
| triggerType  | string | Y           | `APP_SCHEME`                                                           |
| userName     | string | Y           | [암호화](#개인정보-암복호화) 필수                                      |
| userPhone    | string | Y           | 숫자만, [암호화](#개인정보-암복호화) 필수                              |
| userBirthday | string | Y           | `YYYYMMDD`, [암호화](#개인정보-암복호화) 필수                          |
| sessionKey   | string | Y           | AES 암복호화용, 매 요청마다 신규 생성 필요 [(생성 방법)](#세션키-생성) |

**요청 예시**

::: code-group

```bash [Shell(curl)]
curl --location --request POST 'https://cert.toss.im/api/v2/sign/user/auth/request' --header 'Authorization: Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ' --header 'Content-Type: application/json' # 세션 키는 매 요청 시 새로 생성해야 합니다.
--data-raw '{
       "requestType" : "USER_PERSONAL",
       "requestUrl" : "intoss://my-granite-app",
       "triggerType" : "APP_SCHEME",
       "userName" : "v1$cc575847-f549-4c1e-89c7-eff11743e05e$5AfwdVLSmDoxBERDIV8gDny2QLcOzYOqvgt1l4gqEA==",
       "userPhone" : "v1$cc575847-f549-4c1e-89c7-eff11743e05e$OKtwqMR/RI+N3vx0FNtcx8GAoejDq5lb3wIr",
       "userBirthday" : "v1$cc575847-f549-4c1e-89c7-eff11743e05e$OaNxoMR2RYaPiH7km5yJyZQ472+uWNEy",
       "sessionKey" : "v1$cc575847-f549-4c1e-89c7-eff11743e05e$XTTyBJntTja9NfUaTaO09bQCtEApnn3dd7lN8s+jPA6qn5q5kBbSJEptazpSMqGFyB7P0XhnJSkRwukAuunesbm+e0p5tdQ7wiOkauM44FvZj/IwETTA74iLZTNrwmE3aYXv8b1wbIfQx/oT8k9+XNEPkHA0foCFtjF8MRnyjwpzR4hoi2sFk33xhoJa46kLGxz7d3z6r/KYKMFbwkQFOm81Nk8W+oJkT0AjdlOD075QrJ4zm9VReVvE4fT4Q1jY/5VzROt4GkqVvrziYbWRp9/v1/ETVyi5Lf+MceWHLS1MGicqUXfrfnFdqvOcZZytUkvb0AAyg75Sr5tgja55ma3t5AEu65IrO1Cop4wS/XhIwKpWUrMav5JI5X1iZ1tRznE7VRT/dsRLjgIX/wtZajY2ATG+feld2mmxD/mP/ET3JXsYKfmN3DkO10fQZY9915eUyDYm7NMS/U3l+VP8wMzd5WpWVjfxUvYP5eRwPM83hG9wFhHXV4ykodiX0BLRoERXou416uKDJR61b8xFFX+iDPnOfaeROlFFWj6zbK4tPfjRzyaWVQMmSM8igq7iBglehFo+EyyQnAAcUeda+P/7fQmwFDE1a8bQuXFBCwxNOOyPiJLV2+29pzKELcHa+WCrvcbHkOgG4EwjHHWmd17vUVXZGXOERsRuLQMM3mM="
    }'
```

```java
URL url = new URL("https://cert.toss.im/api/v2/sign/user/auth/request");
HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
httpConn.setRequestMethod("POST");
httpConn.setRequestProperty("Authorization", "Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ");
httpConn.setRequestProperty("Content-Type", "application/json");
// 세션 키는 매 요청 시 새로 생성해야 합니다.
httpConn.setDoOutput(true);
OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
writer.write("{" +
        "\"requestType\" : \"USER_PERSONAL\"," +
        "\"triggerType\" : \"APP_SCHEME\"," +
        "\"userName\" : \"v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$ZUyjGpmb/nL9W7//N1/VUN/F/947biU+1w==\"," +
        "\"userPhone\" : \"v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$v8QTxScwJ/NBA+Gp/TXerMWQp9BrQ45M7xaC\"," +
        "\"userBirthday\" : \"v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$vswaxSEyJf/J7Qndq2E7iOPJOmIWILby\"," +
        "\"sessionKey\" : \"v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$MdeifC7fngWC9qn/qia1Itp6jYulvhTH1JCln0oYp3xg95VpnqN5O5isZ58ZYD1WM03YooETiwQIjtLEMl2HSjxwlXZQ2yoyd/zH3mgCzlVDd/nOO0AI04Rzo/M7mvdfoN/k+DUBAeQ4NBIC9uqMt0JrkpuGvv3O1faYPBCV6OCMIcAOAbQb9fJx1bWFRLMkhd3meTD9wt2px46Kz7kW/FZXefMJr4qdnJEX9pZKz2QMJCMEnu0aW+AkJQUS5VfPSohrFTS8VeWoiNArFSESIxZhX3A+duAIJrYxTvXvOCM9ntO9xIMwTd+hp9L1UAYFOrqh6J2gmN1nI5ScBvtkLwRMFQ1D/eoSL/HD7Xb9cBAxMxPX4dn0OjLkUuO0y+KW4s+Prj9IYesDEkXUQpuQKz+4mLfX88lyplJ7o2x3uoecFlIBT92oY6BI+yxTATnwSIK249OwX2vuG6HLSOXlI3RScHjEDtzz1zPK6kjCGkFBM+5+gMyTIF4C130Uk4rlXpxYOGwPoBKBD2buGbBh7AHIaFgHlYjShdPiHMCF0ZDQnOubk139cRzoCVkKqdpPgVqIy8q6982UXzeoSIxqpSauqaL0IK2PPbMy3s9WH12NrDFDkg4NLAhnEgGNfOPjMl9lRMW+i4cCw0jhaCx1bu5GTEQzDCpc0DFT+/KPkKc=\"" +
        "}");
writer.flush();
writer.close();
httpConn.getOutputStream().close();
InputStream responseStream = httpConn.getResponseCode() == 200
        ? httpConn.getInputStream()
        : httpConn.getErrorStream();
Scanner s = new Scanner(responseStream).useDelimiter("\A");
String response = s.hasNext() ? s.next() : "";
System.out.println(response);
```

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://cert.toss.im/api/v2/sign/user/auth/request');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization' : 'Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ',
    'Content-Type' : 'application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{
       "requestType" : "USER_PERSONAL",
       "triggerType" : "APP_SCHEME",
       "userName" : "v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$ZUyjGpmb/nL9W7//N1/VUN/F/947biU+1w==",
       "userPhone" : "v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$v8QTxScwJ/NBA+Gp/TXerMWQp9BrQ45M7xaC",
       "userBirthday" : "v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$vswaxSEyJf/J7Qndq2E7iOPJOmIWILby",
       "sessionKey" : "v1$255f8cc3-7d1d-4667-b28b-03f44e09483f$MdeifC7fngWC9qn/qia1Itp6jYulvhTH1JCln0oYp3xg95VpnqN5O5isZ58ZYD1WM03YooETiwQIjtLEMl2HSjxwlXZQ2yoyd/zH3mgCzlVDd/nOO0AI04Rzo/M7mvdfoN/k+DUBAeQ4NBIC9uqMt0JrkpuGvv3O1faYPBCV6OCMIcAOAbQb9fJx1bWFRLMkhd3meTD9wt2px46Kz7kW/FZXefMJr4qdnJEX9pZKz2QMJCMEnu0aW+AkJQUS5VfPSohrFTS8VeWoiNArFSESIxZhX3A+duAIJrYxTvXvOCM9ntO9xIMwTd+hp9L1UAYFOrqh6J2gmN1nI5ScBvtkLwRMFQ1D/eoSL/HD7Xb9cBAxMxPX4dn0OjLkUuO0y+KW4s+Prj9IYesDEkXUQpuQKz+4mLfX88lyplJ7o2x3uoecFlIBT92oY6BI+yxTATnwSIK249OwX2vuG6HLSOXlI3RScHjEDtzz1zPK6kjCGkFBM+5+gMyTIF4C130Uk4rlXpxYOGwPoBKBD2buGbBh7AHIaFgHlYjShdPiHMCF0ZDQnOubk139cRzoCVkKqdpPgVqIy8q6982UXzeoSIxqpSauqaL0IK2PPbMy3s9WH12NrDFDkg4NLAhnEgGNfOPjMl9lRMW+i4cCw0jhaCx1bu5GTEQzDCpc0DFT+/KPkKc="
       }');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

curl_close($ch);
```

:::

**응답 예시**

**성공 응답**

| 이름                  | 타입   | 설명                                                                                                                                                                                            |
| --------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resultType            | string | 요청 결과 (성공 : `SUCCESS`, 실패 : `FAIL`)                                                                                                                                                     |
| success.txId          | string | 인증 요청 트랜잭션 아이디로 거래를 고유할 수 있는 값. 특정 거래를 고유할 수 있는 값이므로 반드시 저장 관리해야 해요.                                                                            |
| success.requestedDt   | string | 최초 요청 시각(`YYYY-MM-DDThh:mm:ss±hh:mm`)                                                                                                                                                     |
| success.appScheme     | string | 토스 인증 화면을 띄울 수 있는 앱 스킴 정보                                                                                                                                                      |
| success.androidAppUri | string | 안드로이드 인증 앱 스킴 값으로 appScheme과 같은 역할을 하지만, Chrome Intent를 사용하기 때문에 고객사의 추가 기능 구현 없이 토스 앱 설치 유무를 판별할 수 있는 장점이 있어요.                   |
| success.iosAppUri     | string | iOS 인증 앱 스킴 값으로 appScheme과 같은 역할을 하지만, Universal Link를 사용하기 때문에 안드로이드와 마찬가지로 고객사의 추가 기능 구현 없이 토스 앱 설치 유무를 판별할 수 있는 장점이 있어요. |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "txId": "d7b7273b-407b-46be-a9d8-97d2e895b009",
    "appScheme": "null",
    "androidAppUri": "null",
    "iosAppUri": "null",
    "requestedDt": "2022-02-13T17:52:22+09:00"
  }
}
```

**실패 응답**

| 이름            | 타입           | 설명                    |
| --------------- | -------------- | ----------------------- |
| resultType      | string         | 실패 시 `FAIL`          |
| error.errorType | number         | 에러 유형               |
| error.errorCode | string         | 에러 코드(예: `CE1000`) |
| error.reason    | string         | 에러 메시지             |
| error.data      | object         | 부가 데이터(있을 경우)  |
| error.title     | string | null | 에러 제목(있을 경우)    |

```json
{
  "resultType": "FAIL",
  "error": {
    "errorType": 0,
    "errorCode": "CE1000",
    "reason": "토큰이 유효하지 않습니다.",
    "data": {},
    "title": null
  },
  "success": null
}
```

::: tip 다음 단계
응답의 `txId`를 사용해 [appsInTossSignTossCert](#_3-인증-화면-호출하기) 함수를 호출하면 토스앱 인증 화면이 실행돼요.\
[인증 화면 호출하기](#_3-인증-화면-호출하기)를 참고해 주세요.
:::

### 2-2. 원터치 인증

클라이언트에서 **개인정보 입력 없이** 토스앱을 호출해 **한 번에 인증을 완료**해요.

**요청 헤더**

| 이름          | 타입   | 필수 | 설명                    |
| ------------- | ------ | ---- | ----------------------- |
| Authorization | string | Y    | `Bearer {Access Token}` |
| Content-Type  | string | Y    | `application/json`      |

**요청 파라미터**

| 이름        | 타입   | 필수 | 설명                       |
| ----------- | ------ | ---- | -------------------------- |
| requestType | string | Y    | `"USER_NONE"`              |
| requestUrl  | string | Y    | 인증 완료 후 돌아올 앱스킴 |

**요청 예시**

::: code-group

```bash [Shell(curl)]
curl --location --request POST 'https://cert.toss.im/api/v2/sign/user/auth/request' --header 'Authorization: Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ' --header 'Content-Type: application/json' # 세션 키는 매 요청 시 새로 생성해야 합니다.
--data-raw '{
       "requestType" : "USER_NONE",
       "requestUrl" : "intoss://my-granite-app",
    }'
```

```java
URL url = new URL("https://cert.toss.im/api/v2/sign/user/auth/request");
HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
httpConn.setRequestMethod("POST");
httpConn.setRequestProperty("Authorization", "Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ");
httpConn.setRequestProperty("Content-Type", "application/json");
// 세션 키는 매 요청 시 새로 생성해야 합니다.
httpConn.setDoOutput(true);
OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
writer.write("{" +
        "\"requestType\" : \"USER_NONE\"," +
        "}");
writer.flush();
writer.close();
httpConn.getOutputStream().close();
InputStream responseStream = httpConn.getResponseCode() == 200
        ? httpConn.getInputStream()
        : httpConn.getErrorStream();
Scanner s = new Scanner(responseStream).useDelimiter("\A");
String response = s.hasNext() ? s.next() : "";
System.out.println(response);
```

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://cert.toss.im/api/v2/sign/user/auth/request');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ',
    'Content-Type: application/json',
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, '{
    "requestType": "USER_NONE",
    "requestUrl": "intoss://my-granite-app"
}');

curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

curl_close($ch);
```

:::

**응답 예시**

**성공 응답**

| 이름                | 타입   | 설명                                                                                                                 |
| ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| resultType          | string | 요청 결과 (성공 : `SUCCESS`, 실패 : `FAIL`)                                                                          |
| success.txId        | string | 인증 요청 트랜잭션 아이디로 거래를 고유할 수 있는 값. 특정 거래를 고유할 수 있는 값이므로 반드시 저장 관리해야 해요. |
| success.requestedDt | string | 최초 요청 시각(`YYYY-MM-DDThh:mm:ss±hh:mm`)                                                                          |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "txId": "d7b7273b-407b-46be-a9d8-97d2e895b009",
    "requestedDt": "2022-02-13T17:52:22+09:00"
  }
}
```

**실패 응답**

| 이름            | 타입           | 설명                    |
| --------------- | -------------- | ----------------------- |
| resultType      | string         | 실패 시 `FAIL`          |
| error.errorType | number         | 에러 유형               |
| error.errorCode | string         | 에러 코드(예: `CE1000`) |
| error.reason    | string         | 에러 메시지             |
| error.data      | object         | 부가 데이터(있을 경우)  |
| error.title     | string | null | 에러 제목(있을 경우)    |

```json
{
  "resultType": "FAIL",
  "error": {
    "errorType": 0,
    "errorCode": "CE1000",
    "reason": "토큰이 유효하지 않습니다.",
    "data": {},
    "title": null
  },
  "success": null
}
```

::: tip 다음 단계
응답의 `txId`를 사용해 [appsInTossSignTossCert](#_3-인증-화면-호출하기) 함수를 호출하면 토스앱 인증 화면이 실행돼요.\
[인증 화면 호출하기](#_3-인증-화면-호출하기)를 참고해 주세요.
:::

## 3. 인증 화면 호출하기

본인확인 요청 API 응답에서 받은 `txId`를 포함해 `appsInTossSignTossCert`를 호출하면 토스앱 인증 화면이 실행돼요.

::: tip 원터치 인증 및 앱 버전 안내
**원터치 인증 방식(`USER_NONE`)** 을 사용하는 경우,\
`skipConfirmDoc`을 `true`로 설정하면 인증서 확인 문서 단계를 건너뛸 수 있어요.

* 토스 인증(requestType: USER\_PERSONAL): 토스앱 5.233.0 이상
* 토스 원터치 인증(requestType: USER\_NONE): 토스앱 5.236.0 이상

[getTossAppVersion](/bedrock/reference/framework/환경%20확인/version) 함수를 사용하여 토스앱 버전을 체크해 보세요.
:::

:::code-group

```js [js]
import { appsInTossSignTossCert } from '@apps-in-toss/web-framework';

/**
 * Toss 인증서 화면을 txId 기반으로 호출합니다.
 *
 * 참고:
 * response는 인증 완료 확정 용도가 아닙니다.tosscertRequest
 * 서버에서 txId 기준으로 결과조회 API를 호출해 최종 상태를 판별하세요.
 */
async function openTossCertWithTxId({ txId, skipConfirmDoc = false }) {
  try {
    const params = { txId, skipConfirmDoc };
    const response = await appsInTossSignTossCert(params);
    return response;
  } catch (error) {
    // 호출 실패 처리 (사용자 취소/앱 미설치/스킴 실패 등)
    console.error(error);
  }
}
```

```tsx [React]
import { appsInTossSignTossCert } from '@apps-in-toss/web-framework';

interface AppsInTossSignTossCertParams {
  txId: string; // 본인확인 요청 시 발급받은 txId
  skipConfirmDoc?: boolean; // 원터치 인증 시 true로 설정
}

/**
 * Toss 인증서 화면을 txId 기반으로 호출합니다.
 *
 * 참고:
 * response는 인증 완료 확정 용도가 아닙니다.
 * 서버에서 txId 기준으로 결과조회 API를 호출해 최종 상태를 판별하세요.
 */
async function openTossCertWithTxId(txId: string, skipConfirmDoc = false): Promise<unknown> {
  try {
    const params: AppsInTossSignTossCertParams = { txId, skipConfirmDoc };
    const response = await appsInTossSignTossCert(params);
    return response;
  } catch (error: unknown) {
    // 호출 실패 처리 (사용자 취소/앱 미설치/스킴 실패 등)
    console.error(error);
  }
}
```

```tsx [React Native]
import { appsInTossSignTossCert } from '@apps-in-toss/framework';

interface AppsInTossSignTossCertParams {
  txId: string; // 본인확인 요청 시 발급받은 txId
  skipConfirmDoc?: boolean; // 원터치 인증 시 true로 설정
}

/**
 * Toss 인증서 화면을 txId 기반으로 호출합니다.
 *
 * 참고:
 * response는 인증 완료 확정 용도가 아닙니다.
 * 서버에서 txId 기준으로 결과조회 API를 호출해 최종 상태를 판별하세요.
 */
async function openTossCertWithTxId(txId: string, skipConfirmDoc = false): Promise<unknown> {
  try {
    const params: AppsInTossSignTossCertParams = { txId, skipConfirmDoc };
    const response = await appsInTossSignTossCert(params);
    return response;
  } catch (error: unknown) {
    // 호출 실패 처리 (사용자 취소/앱 미설치/스킴 실패 등)
    console.error(error);
  }
}
```

:::

**응답**

* `onSuccess`
  * 파라미터 없음
* `onError`
  * `Error { code: string; message: string }` (예: 사용자 취소, 앱 미설치, 스킴 실패 등)

```ts
// 에러 타입 예시
type AppsInTossSignTossCertError = {
  code: string;
  message: string;
};

// try/catch로 onSuccess/onError 대응하기
try {
  await appsInTossSignTossCert({
    params: {
      txId: 'bb8bead6-0957-4be7-b937-f554911d7a87',
      skipConfirmDoc: true, // 원터치 인증 시 설정
    },
  });
  // onSuccess: 파라미터 없음
} catch (e: any) {
  const err: AppsInTossSignTossCertError = {
    code: e?.code ?? 'UNKNOWN',
    message: e?.message ?? String(e),
  };
  // onError: 에러 처리
}
```

## 4. 본인확인 상태 조회하기

사용자의 현재 인증 **진행 상태**를 조회해요.\
`txId`를 사용해 현재의 인증 단계 (`REQUESTED`, `IN_PROGRESS`, `COMPLETED`, `EXPIRED`)를 확인할 수 있어요.

::: tip 주의하세요
상태조회 API는 **진행 상태 확인용**이에요.\
최종 인증 성공 여부는 **결과조회 API**로 판별해야 해요.
:::

* BaseURL : `https://cert.toss.im`
* Endpoint : `/api/v2/sign/user/auth/id/status`
* Method : `POST`
* Content-type : `application/json`

**요청 헤더**

| 이름          | 타입   | 필수값 여부 | 설명                    |
| ------------- | ------ | ----------- | ----------------------- |
| Authorization | string | Y           | `Bearer {Access Token}` |
| Content-Type  | string | Y           | `application/json`      |

**요청 파라미터**

| 이름 | 타입   | 필수값 여부 | 설명                                         |
| ---- | ------ | ----------- | -------------------------------------------- |
| txId | string | Y           | 상태 확인이 필요한 인증 요청 트랜잭션 아이디 |

**요청 예시**

:::code-group

```bash [Shell(curl)]
curl --location --request POST 'https://cert.toss.im/api/v2/sign/user/auth/id/status' \
--header 'Authorization: Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ' \
--header 'Content-Type: application/json' \
--data-raw '{
      "txId": "633f3e1b-1a11-4e7c-9b35-dd391f440be4"
    }'
```

```java
URL url = new URL("https://cert.toss.im/api/v2/sign/user/auth/id/status");
HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
httpConn.setRequestMethod("POST");

httpConn.setRequestProperty("Authorization", "Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ");
httpConn.setRequestProperty("Content-Type", "application/json");
httpConn.setDoOutput(true);
OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
writer.write("{\"txId\": \"633f3e1b-1a11-4e7c-9b35-dd391f440be4\"}");
writer.flush();
writer.close();

httpConn.getOutputStream().close();
InputStream responseStream = httpConn.getResponseCode() == 200
        ? httpConn.getInputStream()
        : httpConn.getErrorStream();
Scanner s = new Scanner(responseStream).useDelimiter("\A");
String response = s.hasNext() ? s.next() : "";
System.out.println(response);
```

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://cert.toss.im/api/v2/sign/user/auth/id/status');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization' : 'Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ',
    'Content-Type' : 'application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{"txId": "633f3e1b-1a11-4e7c-9b35-dd391f440be4"}');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

curl_close($ch);
```

:::

**성공 응답**

| 이름                | 타입   | 설명                                                        |
| ------------------- | ------ | ----------------------------------------------------------- |
| resultType          | string | 요청 결과. 성공 시 `SUCCESS`                                |
| success.txId        | string | 조회한 인증 트랜잭션 ID                                     |
| success.status      | string | 인증 진행 상태 (아래 "status 값" 표 참고)                   |
| success.requestedDt | string | 최초 인증 요청 시각 (`YYYY-MM-DDThh:mm:ss±hh:mm`, ISO 8601) |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "txId": "633f3e1b-1a11-4e7c-9b35-dd391f440be4",
    "status": "REQUESTED",
    "requestedDt": "2022-02-13T18:00:26+09:00"
  }
}
```

**실패 응답**

| 이름            | 타입           | 설명                    |
| --------------- | -------------- | ----------------------- |
| resultType      | string         | 실패 시 `FAIL`          |
| error.errorType | number         | 에러 유형               |
| error.errorCode | string         | 에러 코드(예: `CE3100`) |
| error.reason    | string         | 에러 메시지             |
| error.data      | object         | 부가 데이터(있을 경우)  |
| error.title     | string | null | 에러 제목(있을 경우)    |

```json
{
  "resultType": "FAIL",
  "error": {
    "errorType": 0,
    "errorCode": "CE3100",
    "reason": "존재하지 않는 요청입니다",
    "data": {},
    "title": null
  },
  "success": null
}
```

**status 값**

| 값          | 설명                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| REQUESTED   | 토스 인증서버에서 사용자의 토스 앱으로 인증이 요청된 상태              |
| IN\_PROGRESS | 사용자가 인증을 진행 중인 상태                                         |
| COMPLETED   | 고객이 인증을 완료한 상태 *(최종 확정은 결과조회 API로 판단 해야해요)* |
| EXPIRED     | 유효시간 만료로 인증 진행이 불가한 상태                                |

## 5. 본인확인 결과 조회하기

인증이 완료된 사용자의 **결과 정보**를 조회해요.\
조회는 반드시 **서버-서버 통신**으로 진행해 주세요.\
본인확인 결과로 수집한 정보는 서버에 안전하게 저장하고, 이후 전자서명/간편인증 시 해당 정보와 비교·검증 해 주세요.

:::tip 주의하세요
결과조회 API는 성공 기준으로 **최대 2회**까지만 조회가 가능해요.\
사용자 인증을 끝마친 후 **60분(1시간) 이내** 결과 조회를 끝내야 해요.\
60분을 초과하면 결과 조회가 제한되며 인증 요청 API부터 다시 시작해야 해요.
:::

* BaseURL : `https://cert.toss.im`
* Endpoint : `/api/v2/sign/user/auth/id/result`
* Method : `POST`
* Content-type : `application/json`

**요청 헤더**

| 이름          | 타입   | 필수값 여부 | 설명                    |
| ------------- | ------ | ----------- | ----------------------- |
| Authorization | string | Y           | `Bearer {Access Token}` |
| Content-Type  | string | Y           | `application/json`      |

**요청 파라미터**

| 이름       | 타입   | 필수값 여부 | 설명                                                                                                                                                                                                   |
| ---------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| txId       | string | Y           | 결과 확인이 필요한 인증 요청 트랜잭션 아이디                                                                                                                                                           |
| sessionKey | string | Y           | 결과조회에서는 인증수단과 무관하게 `txId`와 함께 필수로 전달. 요청/응답 AES 암·복호화용 세션 키로, 매 요청마다 새로 생성하고 인증요청에서 사용한 세션키는 재사용 금지 [(생성 방법)](#세션키-생성) |

**요청 예시**
:::code-group

```bash [Shell(curl)]
curl --location --request POST 'https://cert.toss.im/api/v2/sign/user/auth/id/result' \
--header 'Authorization: Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ' \
--header 'Content-Type: application/json' \
# 세션 키는 매 요청 시 새로 생성해야 합니다.
--data-raw '{
       "txId" : "c1ce9214-9878-4751-b433-0c96641b0e13",
       "sessionKey" : "v1$71c3d6cd-6a74-48a8-8ab2-b48e6133ae6f$Q0U7Bdg4dWd0XXucjsM/mda89bFU7eHnoUhgQ3k+cGQ9gv37jvWC+8isrkO2CR4+qgoPg+U+K7/tQH2m+uU7L8Ab0gzbQo6ASX39NpcP6RHpI+VBi323ssYnBmJL7n0z4aNm6raUEsMoNwrOaMDe0DqfalgOeZgZUztWew1pfZul2Q3/WIBMdp+npS4sFnBRoBrzLroVsuNRTLK0XT6m5hak+ys+vBg5vZFoI0JN7j7zsr8lqGi6piSkygl1PLPugnSC9cOezxMoVN5c/csEVQxMsfkwqTIASaZVECnP50dO70TydYhBFCqxw3DpEDBHcXNDucOtdVOPslCPNx3NZv1i0IH0r92ULb3w2Y0Fncy4/xL1dPSS+TbA5540u2Wb3cxqVNHib7WwSMHBwQtXAnFSFZmcvQQPXtTeQ7SCvNnhA8k3gbboSpbDBg60RWn/1zF/ogBYRldO1BFtq7KP+jOm6I2OSSVpagH1Wu5MXhEtiTmsx7M8j/IM8EfnXbD9axJnlW2fKHZVvAj+5KNhqy90PUimBCKiXqjvUwOqb9hGGEzJ4JVKbIIiy1EYOaRkPTK9GurZwQaqM4o4c8pzOYRQR/3XIPWHxLv/jwsaMcfUIQFyKE+w898g+l1zO0jcck59/R64kZcirT9AsGFnRUWrsHGIkM95jdYlpUsnCXw="
  }'
```

```java
URL url = new URL("https://cert.toss.im/api/v2/sign/user/auth/id/result");
HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
httpConn.setRequestMethod("POST");

httpConn.setRequestProperty("Authorization", "Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ");
httpConn.setRequestProperty("Content-Type", "application/json");

// 세션 키는 매 요청 시 새로 생성해야 합니다.
httpConn.setDoOutput(true);
OutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());
writer.write("{" +
        "\"txId\" : \"c1ce9214-9878-4751-b433-0c96641b0e13\"," +
        "\"sessionKey\" : \"v1$71c3d6cd-6a74-48a8-8ab2-b48e6133ae6f$Q0U7Bdg4dWd0XXucjsM/mda89bFU7eHnoUhgQ3k+cGQ9gv37jvWC+8isrkO2CR4+qgoPg+U+K7/tQH2m+uU7L8Ab0gzbQo6ASX39NpcP6RHpI+VBi323ssYnBmJL7n0z4aNm6raUEsMoNwrOaMDe0DqfalgOeZgZUztWew1pfZul2Q3/WIBMdp+npS4sFnBRoBrzLroVsuNRTLK0XT6m5hak+ys+vBg5vZFoI0JN7j7zsr8lqGi6piSkygl1PLPugnSC9cOezxMoVN5c/csEVQxMsfkwqTIASaZVECnP50dO70TydYhBFCqxw3DpEDBHcXNDucOtdVOPslCPNx3NZv1i0IH0r92ULb3w2Y0Fncy4/xL1dPSS+TbA5540u2Wb3cxqVNHib7WwSMHBwQtXAnFSFZmcvQQPXtTeQ7SCvNnhA8k3gbboSpbDBg60RWn/1zF/ogBYRldO1BFtq7KP+jOm6I2OSSVpagH1Wu5MXhEtiTmsx7M8j/IM8EfnXbD9axJnlW2fKHZVvAj+5KNhqy90PUimBCKiXqjvUwOqb9hGGEzJ4JVKbIIiy1EYOaRkPTK9GurZwQaqM4o4c8pzOYRQR/3XIPWHxLv/jwsaMcfUIQFyKE+w898g+l1zO0jcck59/R64kZcirT9AsGFnRUWrsHGIkM95jdYlpUsnCXw=\"" +
        "}");
writer.flush();
writer.close();

httpConn.getOutputStream().close();
InputStream responseStream = httpConn.getResponseCode() / 100 == 2
        ? httpConn.getInputStream()
        : httpConn.getErrorStream();
Scanner s = new Scanner(responseStream).useDelimiter("\A");
String response = s.hasNext() ? s.next() : "";
System.out.println(response);
```

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://cert.toss.im/api/v2/sign/user/auth/id/result');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization' : 'Bearer eyJraWQiOiJjZXJ0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ0ZXN0X2E4ZTIzMzM2ZDY3M2NhNzA5MjJiNDg1ZmU4MDZlYjJkIiwiYXVkIjoidGVzdF9hOGUyMzMzNmQ2NzNjYTcwOTIyYjQ4NWZlODA2ZWIyZCIsIm5iZiI6MTY0OTIyMjk3OCwic2NvcGUiOlsiY2EiXSwiaXNzIjoiaHR0cHM6XC9cL2NlcnQudG9zcy5pbSIsImV4cCI6MTY4MDc1ODk3OCwiaWF0IjoxNjQ5MjIyOTc4LCJqdGkiOiI4MDNjNDBjOC1iMzUxLTRmOGItYTIxNC1iNjc5MmNjMzBhYTcifQ.cjDZ0lAXbuf-KAgi3FlG1YGxvgvT3xrOYKDTstfbUz6CoNQgvd9TqI6RmsGZuona9jIP6H12Z1Xb07RIfAVoTK-J9iC5_Yp8ZDdcalsMNj51pPP8wso86rn-mKsrx1J5Rdi3GU58iKt0zGr4KzqSxUJkul9G4rY03KInwvl692HU19kYA9y8uTI4bBX--UPfQ02G0QH9HGTPHs7lZsISDtyD8sB2ikz5p7roua7U467xWy4BnRleCEWO2uUaNNGnwd7SvbjhmsRZqohs9KzDUsFjVhSiRNdHL53XJQ5zFHwDF92inRZFLu6Dw8xttPtNHwAD1kT84uXJcVMfEHtwkQ',
    'Content-Type' : 'application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, '{
       "txId" : "c1ce9214-9878-4751-b433-0c96641b0e13",
       "sessionKey" : "v1$71c3d6cd-6a74-48a8-8ab2-b48e6133ae6f$Q0U7Bdg4dWd0XXucjsM/mda89bFU7eHnoUhgQ3k+cGQ9gv37jvWC+8isrkO2CR4+qgoPg+U+K7/tQH2m+uU7L8Ab0gzbQo6ASX39NpcP6RHpI+VBi323ssYnBmJL7n0z4aNm6raUEsMoNwrOaMDe0DqfalgOeZgZUztWew1pfZul2Q3/WIBMdp+npS4sFnBRoBrzLroVsuNRTLK0XT6m5hak+ys+vBg5vZFoI0JN7j7zsr8lqGi6piSkygl1PLPugnSC9cOezxMoVN5c/csEVQxMsfkwqTIASaZVECnP50dO70TydYhBFCqxw3DpEDBHcXNDucOtdVOPslCPNx3NZv1i0IH0r92ULb3w2Y0Fncy4/xL1dPSS+TbA5540u2Wb3cxqVNHib7WwSMHBwQtXAnFSFZmcvQQPXtTeQ7SCvNnhA8k3gbboSpbDBg60RWn/1zF/ogBYRldO1BFtq7KP+jOm6I2OSSVpagH1Wu5MXhEtiTmsx7M8j/IM8EfnXbD9axJnlW2fKHZVvAj+5KNhqy90PUimBCKiXqjvUwOqb9hGGEzJ4JVKbIIiy1EYOaRkPTK9GurZwQaqM4o4c8pzOYRQR/3XIPWHxLv/jwsaMcfUIQFyKE+w898g+l1zO0jcck59/R64kZcirT9AsGFnRUWrsHGIkM95jdYlpUsnCXw="
       }');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

curl_close($ch);
```

:::

**성공 응답**

| 이름                   | 타입           | 설명                                                                                 |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------ |
| resultType             | string         | 성공 시 `SUCCESS`                                                                    |
| success.txId           | string         | 결과를 조회한 인증 트랜잭션 아이디                                                   |
| success.status         | string         | `COMPLETED` *(결과 조회가 정상 처리된 상태)*                                         |
| success.userIdentifier | string | null | 현재 버전 미사용 (`null`)                                                            |
| success.userCiToken    | string | null | 현재 버전 미사용 (`null`)                                                            |
| success.signature      | string         | 사용자가 서명한 전자서명 값(**Base64 인코딩된 DER**). **txId와 함께 저장 관리 필수** |
| success.randomValue    | string | null | 현재 버전 미사용 (`null`)                                                            |
| success.completedDt    | string         | 사용자 인증 완료 시각 (`YYYY-MM-DDThh:mm:ss±hh:mm`, ISO 8601)                        |
| success.requestedDt    | string         | 최초 인증 요청 시각 (`YYYY-MM-DDThh:mm:ss±hh:mm`, ISO 8601)                          |
| success.personalData   | object         | 인증에 사용된 **개인정보(암호화 값)**. 하위 필드 표 참고                             |

**personalData(인증을 진행한 사용자 개인정보) Object**

| 이름        | 타입           | 설명                                                              |
| ----------- | -------------- | ----------------------------------------------------------------- |
| ci          | string         | 암호화된 사용자의 CI                                              |
| name        | string         | 암호화된 사용자의 이름                                            |
| birthday    | string         | 암호화된 생년월일 8자리                                           |
| gender      | string         | 암호화된 성별 정보 (`MALE` | `FEMALE`)                           |
| nationality | string         | 암호화된 국적 (`LOCAL` | `FOREIGNER`)                            |
| ci2         | string | null | 예측 불가 상황에서 ci 유출 대응을 위한 임시 파라미터, `null` 고정 |
| di          | string         | 암호화된 사용자의 DI                                              |
| ciUpdate    | string | null | 예측 불가 상황에서 ci 유출 대응을 위한 임시 파라미터, `null` 고정 |
| ageGroup    | string         | 암호화된 성인여부 (`ADULT` | `MINOR`)                            |

```json
// 결과조회 응답에서는 인증을 호출하는 방식에 상관없이 동일한 바디 파라미터를 제공해요.
{
  "resultType": "SUCCESS",
  "success": {
    "txId": "c1ce9214-9878-4751-b433-0c96641b0e13",
    "status": "COMPLETED",
    "userIdentifier": null,
    "userCiToken": null,
    "signature": "MIIJCAYJKoZIhvcN...(생략)...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",
    "randomValue": null,
    "completedDt": "2022-02-13T18:01:53+09:00",
    "requestedDt": "2022-02-13T18:00:26+09:00",
    "personalData": {
      "ci": "v1$b88f8717-8e76-4276-bed0-f769a8baf7be$X3g52aAyCBirz0UVp1oNRq0SfGtj66vGtUT3rp1aSdm1h//xmpm7vdf48fbGI2i7VTBj6TKG2rqanP6Yo9MiTQu63C8kLWayzWAMp+RLyXLovvnFb9SxxdblRtZbj5KRNlBWK9t2VXI=",
      "name": "v1$b88f8717-8e76-4276-bed0-f769a8baf7be$9oiJBRei1KI/SgXtXGmkfNHu+pdAUHXBxA==",
      "birthday": "v1$b88f8717-8e76-4276-bed0-f769a8baf7be$LQgw26ExChwWi8cQQz6GrdMAdMZGyaEI",
      "gender": "v1$b88f8717-8e76-4276-bed0-f769a8baf7be$WnREqd1HM/Ci7p+3KIqROusVkYeSAQ==",
      "nationality": "v1$b88f8717-8e76-4276-bed0-f769a8baf7be$UH5Kqd3dPV1daxw0i23eMWjeXcXC",
      "ci2": null,
      "di": "v1$2e161d9d-e620-443e-9a27-8db41cc96cf9$6GKr2zaUWWfI6rpJ6/AV9U4W0S4nhAMFIFLkt5CS6N8Gjb1Oc/dpitkMSSvLroDO5b6zdl9bufGSQ6SiVQdlYN2OWYFBr/Hb4e4AYwQpFxDbpi9ksYt52aFa3G2DwaNOQMUBkyQ1IWc=",
      "ciUpdate": null
    }
  }
}
```

**실패 응답**

| 이름            | 타입           | 설명                    |
| --------------- | -------------- | ----------------------- |
| resultType      | string         | 실패 시 `FAIL`          |
| error.errorType | number         | 에러 유형               |
| error.errorCode | string         | 에러 코드(예: `CE3102`) |
| error.reason    | string         | 에러 메시지             |
| error.data      | object         | 부가 데이터(있을 경우)  |
| error.title     | string | null | 에러 제목(있을 경우)    |

```json
{
  "resultType": "FAIL",
  "error": {
    "errorType": 0,
    "errorCode": "CE3102",
    "reason": "요청이 아직 완료되지 않았습니다.",
    "data": {},
    "title": null
  },
  "success": null
}
```

***

## 테스트하기

계약이 완료되지 않아도 **토스인증 테스트 환경**에서 인증 연동을 진행해 볼 수 있어요.\
연동을 먼저 진행한 뒤 테스트를 수행해 주세요.\
테스트 시에는 **앱 스토어에서 설치한 최신 버전의 토스앱**을 이용해 주세요.\
**본인확인**과 **원터치 인증** 방식 모두 테스트가 가능해요.

::: tip 테스트 환경 자격증명

* client\_id : `test_a8e23336d673ca70922b485fe806eb2d`
* client\_secret : `test_418087247d66da09fda1964dc4734e453c7cf66a7a9e3`
  :::

**라이브 환경과의 차이점**

**인증 사용료 무료** — 인증을 성공적으로 완료하더라도 과금되지 않아요.

**테스트 환경 자격증명** — `client_id`, `client_secret` 모두 `test_` 로 시작해요. 이 접두어로 운영 환경 정보와 쉽게 구분할 수 있어요.

**Access Token 유효기간** — 연동 편의를 위해 **1년(31536000초)** 유효기간이 적용돼요. 운영 환경에서는 사업자가 신청한 네트워크 방식에 따라 달라질 수 있어요.

**가상의 개인정보 제공** — 토스에 가입된 사용자의 암호화된 개인정보 대신 **토스가 생성한 가상 인물의 고정된 개인정보**가 전달돼요. 실제 사용자 정보를 보호하기 위한 조치이며, 정확한 사용자 정보가 필요하다면 **토스로부터 제공받은 이용기관 고유 키**를 사용해 운영 환경과 연동해야 해요.

::: tip 테스트 환경에서 제공되는 가상 개인정보 예시

* CI : `CI0110000000001 ...`
* DI : `DI0110000000001 ...`
* 이름 : 김토스
* 생년월일 : 19930324
* 성별 : FEMALE
* 내외국인 : LOCAL
  :::

***

## 세션키 생성

보안을 위해 세션키(`sessionKey`)는 매 요청마다 새로 생성해 주세요.

:::code-group

```java
public static String generateSessionKey(String sessionId, String secretKey, String iv, String base64PublicKey) throws Exception {
    String sessionAesKey = "AES_GCM$" + secretKey + "$" + iv;
    String encryptedSessionAesKey = encryptSessionAesKey(base64PublicKey, sessionAesKey);
    return "v1$" + sessionId + "$" + encryptedSessionAesKey;
}
```

```javascript
generateSessionKey: function (sessionId, secretKey, iv, base64PublicKey) {
    let sessionAesKey = 'AES_GCM$' + secretKey + '$' + iv
    let encryptedSessionAesKey = this.encryptSessionAesKey(base64PublicKey, sessionAesKey)
    return 'v1$' + sessionId + '$' + encryptedSessionAesKey
},
```

```csharp
public static string GenerateSessionKey(string sessionId, string secretKey, string iv, string base64PublicKey)
{
    string sessionAesKey = "AES_GCM$" + secretKey + "$" + iv;
    string encryptedSessionAesKey = EncryptSessionAesKey(base64PublicKey, sessionAesKey);
    return "v1$" + sessionId + "$" + encryptedSessionAesKey;
}
```

```php
function generateSessionKey(string $sessionId, string $secretKey, string $iv, string $base64PublicKey): string
{
    $sessionAesKey = "AES_GCM$" . $secretKey . "$" . $iv;
    $encryptedSessionAesKey = encryptSessionAesKey($base64PublicKey, $sessionAesKey);
    return "v1$" . $sessionId . "$" . $encryptedSessionAesKey;
}
```

```python
def generate_session_key(session_id, secret_key, iv, base64_public_key):
    session_aes_key = 'AES_GCM$' + secret_key + '$' + iv
    encrypted_session_aes_key = encrypt_session_aes_key(base64_public_key, session_aes_key)
    return 'v1$' + session_id + '$' + encrypted_session_aes_key
```

```ruby
def generate_session_key(session_id, secret_key, iv, base64_public_key)
  session_aes_key = 'AES_GCM$' + secret_key + '$' + iv
  encrypted_session_aes_key = encrypt_session_aes_key(base64_public_key, session_aes_key)
  'v1$' + session_id + '$' + encrypted_session_aes_key
end
```

:::

보다 자세한 예시는 [여기](https://github.com/toss/toss-cert-examples)에서 확인해 보세요.

***

## 개인정보 암복호화

토스 인증 API는 일부 요청에서 고객의 개인정보가 포함될 수 있어요.\
안전을 위해 고객사 서버와 토스 서버는 암호화된 데이터만 주고받아요.\
평문이 필요할 땐 데이터를 복호화해 확인해 주세요.

* 인증 요청에서 고객의 이름, 생년월일, 휴대폰번호를 전달할 때 암호화
* 전자서명 서비스 원문에 고객의 개인정보가 포함되는 경우 원문 암호화
* 인증 결과로 토스 서버에서 CI·DI 등을 포함한 개인정보를 제공하는 경우 암호화

::: tip 원터치 본인 인증
고객사 서버에서 토스인증 서버로 고객의 정보를 전달하지 않기 때문에 암호화 과정이 불필요해요.\
다만, 사용자 인증이 완료된 이후 결과조회 API를 호출할 때는 세션키를 포함해서 요청해야 해요.
:::

**세션 키 생성 및 암호화 예제**

:::code-group

```java
package im.toss.cert.sdk;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class TossCertSessionTest {

    @Test
    public void test() {

        // 1. 세션 생성기를 사전에 1회만 생성해 주세요.
        TossCertSessionGenerator tossCertSessionGenerator = new TossCertSessionGenerator();

        // 2. 개인정보가 포함되어 있는 인증요청 API 호출 전에 세션을 생성해 주세요.
        TossCertSession tossCertSession = tossCertSessionGenerator.generate();

        // 3. 개인정보를 암호화 해주세요.
        String userName = "김토스";
        String encryptedUserName = tossCertSession.encrypt(userName);
        System.out.println("encryptedUserName: " + encryptedUserName);

        // 4. 인증요청 API를 호출해 주세요.
        // 인증요청 API의 바디 파라미터에 생성된 sessionKey를 추가해 주세요.
        String sessionKey = tossCertSession.getSessionKey();
        String userName = encryptedUserName;

        // 5. 사용자의 인증이 끝나면 결과조회 API 호출 전에 새로운 세션을 생성해 주세요.
        TossCertSession tossCertSession = tossCertSessionGenerator.generate();

        // 6. 결과조회 API를 호출해주세요.
        // 결과조회 API의 바디 파라미터에 생성된 sessionKey를 추가해 주세요.
        String sessionKey = tossCertSession.getSessionKey();
        String txId = "a39c84d9-458d-47e4-acf7-c481e851f79b";

        // 7. 복호화를 위해 결과조회 요청에서 생성했던 tossCertSession를 가지고 있어야 합니다.
        // response.userName 을 응답받은 암호화된 userName 이라고 가정합니다.
        // decryptedUserName 은 무결성 검증까지 완료되어 있습니다.
        String decryptedUserName = tossCertSession.decrypt(response.userName);
    }
}
```

:::

::: tip 참고하세요
토스 테스트 환경에서는 실제 사용자의 개인정보가 아닌 토스가 생성한 가상 인물의 고정된 개인정보를 제공해요.
:::

::: tip 세션키 생성 시 사용하는 Public key

```
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAoVdxG0Qi9pip46Jw9ImSlPVD8+L2mM47ey6EZna7D7utgNdh8Tzkjrm1Yl4h6kPJrhdWvMIJGS51+6dh041IXcJEoUquNblUEqAUXBYwQM8PdfnS12SjlvZrP4q6whBE7IV1SEIBJP0gSK5/8Iu+uld2ctJiU4p8uswL2bCPGWdvVPltxAg6hfAG/ImRUKPRewQsFhkFvqIDCpO6aeaR10q6wwENZltlJeeRnl02VWSneRmPqqypqCxz0Y+yWCYtsA+ngfZmwRMaFkXcWjaWnvSqqV33OAsrQkvuBHWoEEkvQ0P08+h9Fy2+FhY9TeuukQ2CVFz5YyOhp25QtWyQI+IaDKk+hLxJ1APR0c3tmV0ANEIjO6HhJIdu2KQKtgFppvqSrZp2OKtI8EZgVbWuho50xvlaPGzWoMi9HSCb+8ARamlOpesxHH3O0cTRUnft2Zk1FHQb2Pidb2z5onMEnzP2xpTqAIVQyb6nMac9tof5NFxwR/c4pmci+1n8GFJIFN18j2XGad1mNyio/R8LabqnzNwJC6VPnZJz5/pDUIk9yKNOY0KJe64SRiL0a4SNMohtyj6QlA/3SGxaEXb8UHpophv4G9wN1CgfyUamsRqp8zo5qDxBvlaIlfkqJvYPkltj7/23FHDjPi8q8UkSiAeu7IV5FTfB5KsiN8+sGSMCAwEAAQ==
```

:::

기본적으로 SDK 사용을 권장하지만, 다양한 언어의 코드 샘플도 함께 제공해요.\
자세한 예시는 [여기](https://github.com/toss/toss-cert-examples)에서 확인해 보세요.

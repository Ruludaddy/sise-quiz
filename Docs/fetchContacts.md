---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/연락처/fetchContacts.md
---

# 연락처

::: tip 권한 설정이 필요해요
`fetchContacts`를 사용하기 전에 연락처 권한을 설정해야 해요.\
[권한 설정 가이드](/bedrock/reference/framework/권한/permission.md)를 먼저 확인해 주세요.
:::

***

## 연락처 가져오기

**SDK 함수:** `fetchContacts`

`fetchContacts`는 사용자의 연락처 목록을 페이지 단위로 가져오는 함수예요.

**시그니처**

```typescript
function fetchContacts(options: {
  size: number;
  offset: number;
  query?: {
    contains?: string;
  };
}): Promise<ContactResult>;
```

**파라미터**

**프로퍼티**

**반환 값**

연락처 목록과 페이지네이션 정보를 포함한 객체를 반환해요.

* `result`: 가져온 연락처 목록이에요.
* `nextOffset`: 다음 호출에 사용할 오프셋 값이에요. 더 가져올 연락처가 없으면 `null`이에요.
* `done`: 모든 연락처를 다 가져왔는지 여부를 나타내요. 모두 가져왔다면 `true`예요.

## 연락처 권한 에러

**에러 타입:** `FetchContactsPermissionError`

연락처 권한이 거부되었을 때 발생하는 에러예요. 에러가 발생했을 때 `error instanceof FetchContactsPermissionError`를 통해 확인할 수 있어요.

**시그니처**

```typescript
class FetchContactsPermissionError extends PermissionError {
  constructor();
}
```

**예제**

**특정 문자열이 포함된 연락처 목록 가져오기**

연락처 목록을 가져오는 예제예요.
"권한 확인하기"버튼을 눌러서 현재 연락처 읽기 권한을 확인해요.
사용자가 권한을 거부했거나 시스템에서 권한이 제한된 경우에는 `FetchContactsPermissionError`를 반환해요.
"권한 요청하기"버튼을 눌러서 연락처 읽기 권한을 요청할 수 있어요.

::: code-group

```js [js]
import { fetchContacts, FetchContactsPermissionError } from '@apps-in-toss/web-framework';

async function handleFetchContacts() {
  try {
    const response = await fetchContacts({
      size: 10,
      offset: 0,
      query: { contains: '김' },
    });

    return response;
  } catch (error) {
    if (error instanceof FetchContactsPermissionError) {
      console.log('연락처 읽기 권한 없음');
    }
    console.error('연락처를 가져오는 데 실패했어요:', error);
  }
}

async function handleGetPermissionForFetchContacts() {
  const permission = await fetchContacts.getPermission();
  return permission;
}

async function handleOpenPermissionDialogForFetchContacts() {
  const permission = await fetchContacts.openPermissionDialog();
  return permission;
}
```

```tsx [React]
import { ContactEntity, fetchContacts, FetchContactsPermissionError } from '@apps-in-toss/web-framework';
import { useState } from 'react';

function ContactsList() {
  const [contacts, setContacts] = useState<{
    result: ContactEntity[];
    nextOffset: number | null;
    done: boolean;
  }>({
    result: [],
    nextOffset: null,
    done: false,
  });

  const handlePress = async () => {
    try {
      if (contacts.done) {
        console.log('모든 연락처를 가져왔어요.');
        return;
      }

      const response = await fetchContacts({
        size: 10,
        offset: contacts.nextOffset ?? 0,
        query: { contains: '김' },
      });
      setContacts((prev) => ({
        result: [...prev.result, ...response.result],
        nextOffset: response.nextOffset,
        done: response.done,
      }));
    } catch (error) {
      if (error instanceof FetchContactsPermissionError) {
        console.log('연락처 읽기 권한 없음');
      }
      console.error('연락처를 가져오는 데 실패했어요:', error);
    }
  };

  return (
    <div>
      {contacts.result.map((contact, index) => (
        <span key={index}>
          {contact.name}: {contact.phoneNumber}
        </span>
      ))}
      <input
        type="button"
        value={contacts.done ? '모든 연락처를 가져왔어요.' : '다음 연락처 가져오기'}
        disabled={contacts.done}
        onClick={handlePress}
      />
      <input
        type="button"
        value="권한 확인하기"
        onClick={async () => {
          const permission = await fetchContacts.getPermission();
          alert(permission);
        }}
      />
      <input
        type="button"
        value="권한 요청하기"
        onClick={async () => {
          const permission = await fetchContacts.openPermissionDialog();
          alert(permission);
        }}
      />
    </div>
  );
}
```

```tsx [React Native]
import { ContactEntity, fetchContacts, FetchContactsPermissionError } from '@apps-in-toss/framework';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

function ContactsList() {
  const [contacts, setContacts] = useState<{
    result: ContactEntity[];
    nextOffset: number | null;
    done: boolean;
  }>({
    result: [],
    nextOffset: null,
    done: false,
  });

  const handlePress = async () => {
    try {
      if (contacts.done) {
        console.log('모든 연락처를 가져왔어요.');
        return;
      }

      const response = await fetchContacts({
        size: 10,
        offset: contacts.nextOffset ?? 0,
        query: { contains: '김' },
      });
      setContacts((prev) => ({
        result: [...prev.result, ...response.result],
        nextOffset: response.nextOffset,
        done: response.done,
      }));
    } catch (error) {
      if (error instanceof FetchContactsPermissionError) {
        console.log('연락처 읽기 권한 없음');
      }
      console.error('연락처를 가져오는 데 실패했어요:', error);
    }
  };

  return (
    <View>
      {contacts.result.map((contact, index) => (
        <Text key={index}>
          {contact.name}: {contact.phoneNumber}
        </Text>
      ))}
      <Button
        title={contacts.done ? '모든 연락처를 가져왔어요.' : '다음 연락처 가져오기'}
        disabled={contacts.done}
        onPress={handlePress}
      />
      <Button
        title="권한 확인하기"
        onPress={async () => {
          const permission = await fetchContacts.getPermission();
          Alert.alert(permission);
        }}
      />
      <Button
        title="권한 요청하기"
        onPress={async () => {
          const permission = await fetchContacts.openPermissionDialog();
          Alert.alert(permission);
        }}
      />
    </View>
  );
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-contacts](https://github.com/toss/apps-in-toss-examples/tree/main/with-contacts) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

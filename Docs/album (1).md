---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/사진/album.md
description: 사용자 앨범에서 사진과 동영상을 가져오는 방법을 안내해요.
---

# 앨범

::: tip 권한 설정이 필요해요
`fetchAlbumItems`를 사용하기 전에 앨범 권한을 설정해야 해요.\
[권한 설정 가이드](/bedrock/reference/framework/권한/permission.md)를 먼저 확인해 주세요.
:::

***

## 1. 앨범 미디어 선택하기

**SDK 함수:** `fetchAlbumItems`

사용자 앨범에서 사진·동영상을 선택해 가져오는 함수예요.\
사진과 동영상을 동시에 선택할 수 있으며, 사용자가 선택을 취소하면 빈 배열 `[]`을 반환해요.

**시그니처**

```typescript
function fetchAlbumItems(options?: FetchAlbumItemsOptions): Promise<AlbumItemResponse[]>;
```

**파라미터**

**반환값**

**에러**

| 에러 코드                 | 발생 조건                         |
| ------------------------- | --------------------------------- |
| `NOT_ALLOWED`             | 앨범 접근이 허용되지 않았을 때    |
| `INVALID_REQUEST`         | 요청 파라미터가 올바르지 않을 때  |
| `INVALID_DATA`            | 미디어 데이터가 유효하지 않을 때  |
| `UNSUPPORTED_APP_VERSION` | 토스앱 버전이 5.261.0보다 낮을 때 |

**예제**

::: code-group

```tsx [React]
import { fetchAlbumItems } from '@apps-in-toss/web-framework';

async function pickMedia() {
  try {
    const items = await fetchAlbumItems({
      types: ['PHOTO', 'VIDEO'],
      maxCount: 5,
      base64: true,
    });

    if (items.length === 0) {
      console.log('선택이 취소되었어요.');
      return;
    }

    items.forEach((item) => {
      console.log(item.type, item.id);
    });
  } catch (error) {
    console.error('앨범 조회 오류:', error.code);
  }
}
```

```tsx [React Native]
import { fetchAlbumItems } from '@apps-in-toss/framework';

async function pickMedia() {
  try {
    const items = await fetchAlbumItems({
      types: ['PHOTO', 'VIDEO'],
      maxCount: 5,
      base64: true,
    });

    if (items.length === 0) {
      console.log('선택이 취소되었어요.');
      return;
    }

    items.forEach((item) => {
      console.log(item.type, item.id);
    });
  } catch (error) {
    console.error('앨범 조회 오류:', error.code);
  }
}
```

:::

**`FetchAlbumItemsOptions`**

```typescript
interface FetchAlbumItemsOptions {
  types?: AlbumItemType[];
  maxCount?: number;
  maxWidth?: number;
  base64?: boolean;
}
```

프로퍼티:

**`AlbumItemResponse`**

```typescript
interface AlbumItemResponse {
  id: string;
  dataUri: string;
  type: AlbumItemType;
}
```

프로퍼티:

***

## 2. 앨범 가져오기

**SDK 함수:** `fetchAlbumPhotos`

::: tip 새 버전이 있어요
`fetchAlbumPhotos`는 사진만 지원해요.\
사진과 동영상을 함께 선택하거나 더 세밀한 제어가 필요하다면 [`fetchAlbumItems`](#_1-%EC%95%A8%EB%B2%94-%EB%AF%B8%EB%94%94%EC%96%B4-%EC%84%A0%ED%83%9D%ED%95%98%EA%B8%B0)를 사용해 주세요.
:::

사용자 앨범에서 사진 목록을 불러오는 함수예요.\
최대 개수와 해상도를 설정할 수 있어요.

**시그니처**

```typescript
function fetchAlbumPhotos(options: { maxCount: number; maxWidth: number; base64: boolean }): Promise<ImageResponse[]>;
```

**파라미터**

**반환값**

**예제**

::: code-group

```js [Web (JS)]
import { fetchAlbumPhotos, FetchAlbumPhotosPermissionError } from '@apps-in-toss/web-framework';

async function handleFetchAlbumPhotos() {
  try {
    const response = await fetchAlbumPhotos({ base64: true, maxWidth: 360 });
    response.forEach((image) => {
      const imageUri = 'data:image/jpeg;base64,' + image.dataUri;
      console.log('이미지 URI:', imageUri);
    });
  } catch (error) {
    if (error instanceof FetchAlbumPhotosPermissionError) {
      console.log('앨범 읽기 권한 없음');
    }
  }
}
```

```tsx [Web (React)]
import { fetchAlbumPhotos, FetchAlbumPhotosPermissionError, ImageResponse } from '@apps-in-toss/web-framework';
import { useState } from 'react';

function AlbumPhotoList() {
  const [albumPhotos, setAlbumPhotos] = useState<ImageResponse[]>([]);

  const handlePress = async () => {
    try {
      const response = await fetchAlbumPhotos({ base64: true, maxWidth: 360 });
      setAlbumPhotos((prev) => [...prev, ...response]);
    } catch (error) {
      if (error instanceof FetchAlbumPhotosPermissionError) {
        // 앨범 읽기 권한 없음
      }
    }
  };

  return (
    <div>
      {albumPhotos.map((image) => {
        const imageUri = 'data:image/jpeg;base64,' + image.dataUri;
        return <img src={imageUri} key={image.id} />;
      })}
      <button onClick={handlePress}>앨범 가져오기</button>
    </div>
  );
}
```

```tsx [React Native]
import { fetchAlbumPhotos, FetchAlbumPhotosPermissionError, ImageResponse } from '@apps-in-toss/framework';
import { useState } from 'react';
import { Alert, Button, Image, View } from 'react-native';

function AlbumPhotoList() {
  const [albumPhotos, setAlbumPhotos] = useState<ImageResponse[]>([]);

  const handlePress = async () => {
    try {
      const response = await fetchAlbumPhotos({ base64: true, maxWidth: 360 });
      setAlbumPhotos((prev) => [...prev, ...response]);
    } catch (error) {
      if (error instanceof FetchAlbumPhotosPermissionError) {
        // 앨범 읽기 권한 없음
      }
    }
  };

  return (
    <View>
      {albumPhotos.map((image) => {
        const imageUri = 'data:image/jpeg;base64,' + image.dataUri;
        return <Image source={{ uri: imageUri }} key={image.id} />;
      })}
      <Button title="앨범 가져오기" onPress={handlePress} />
      <Button
        title="권한 확인하기"
        onPress={async () => {
          const permission = await fetchAlbumPhotos.getPermission();
          Alert.alert(permission);
        }}
      />
      <Button
        title="권한 요청하기"
        onPress={async () => {
          const permission = await fetchAlbumPhotos.openPermissionDialog();
          Alert.alert(permission);
        }}
      />
    </View>
  );
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-album-photos](https://github.com/toss/apps-in-toss-examples/tree/main/with-album-photos) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

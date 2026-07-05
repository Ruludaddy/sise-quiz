---
url: 'https://developers-apps-in-toss.toss.im/game-center/develop.md'
description: '게임 센터 개발 가이드예요. SDK 연동, API 사용법, 구현 예제를 확인할 수 있어요.'
---

# 게임 리더보드

서비스 소개와 콘솔 설정 방법은 [게임 센터 소개](/game-center/intro.html) 문서를 참고해 주세요.

게임 리더보드는 **사용자의 게임 점수를 집계하고, 순위를 확인할 수 있는 기능**이에요.\
다음 두 가지 함수로 연동해요.

* **점수 제출**: 게임 종료 후 점수를 리더보드에 기록 → `submitGameCenterLeaderBoardScore`
* **리더보드 열기**: 사용자가 자신의 순위를 확인하도록 리더보드 WebView 호출 → `openGameCenterLeaderboard`

![](/assets/leaderboard_flow.DcNnBK1G.webp)

***

## 1. 게임 리더보드에 점수 제출하기

**SDK 함수:** `submitGameCenterLeaderBoardScore`

`submitGameCenterLeaderBoardScore`는 **게임이 종료된 시점에 사용자의 점수를 리더보드에 제출하는 함수**예요.\
제출된 점수는 이후 리더보드 화면에서 사용자에게 표시돼요.

::: tip 주의하세요

* 토스앱 **5.221.0 이상**에서만 지원돼요. 하위 버전에서는 `undefined`를 반환해요.
* 게임 프로필이 생성되기 전에 점수를 제출하면 오류가 발생할 수 있어요.\
  **게임 진입 직후가 아닌, 플레이 완료 후**에 호출해 주세요.
* 미니앱 정보 승인이 되지 않은 상태에서 호출하면 `LeaderBoard not found` 오류가 발생해요.
* 샌드박스 환경에서도 테스트할 수 있지만, 샌드박스 점수는 실제 서비스 리더보드에는 반영되지 않아요.
* 보안상의 이유로, 사용자 식별자는 응답에 포함되지 않아요.

:::

**시그니처**

```typescript
function submitGameCenterLeaderBoardScore(params: {
  score: string;
}): Promise<SubmitGameCenterLeaderBoardScoreResponse | undefined>;
```

**파라미터**

**반환 값**

**예제 : 게임 점수를 토스게임센터 리더보드에 제출하기**

::: code-group

```js [js]
import { submitGameCenterLeaderBoardScore } from '@apps-in-toss/web-framework';

async function handleSubmitGameCenterLeaderBoardScore() {
  try {
    const result = await submitGameCenterLeaderBoardScore({ score: '123.45' });

    if (!result) {
      console.warn('지원하지 않는 앱 버전이에요.');
      return;
    }

    if (result.statusCode === 'SUCCESS') {
      console.log('점수 제출 성공!');
    } else {
      console.error('점수 제출 실패:', result.statusCode);
    }
  } catch (error) {
    console.error('점수 제출 중 오류가 발생했어요.', error);
  }
}
```

```tsx [React]
import { submitGameCenterLeaderBoardScore } from '@apps-in-toss/web-framework';
import { Button } from '@toss/tds-mobile';

function GameCenterLeaderBoardScoreSubmitButton() {
  async function handleClick() {
    try {
      const result = await submitGameCenterLeaderBoardScore({ score: '123.45' });

      if (!result) {
        console.warn('지원하지 않는 앱 버전이에요.');
        return;
      }

      if (result.statusCode === 'SUCCESS') {
        console.log('점수 제출 성공!');
      } else {
        console.error('점수 제출 실패:', result.statusCode);
      }
    } catch (error) {
      console.error('점수 제출 중 오류가 발생했어요.', error);
    }
  }

  return <Button onClick={handleClick}>점수 제출하기</Button>;
}
```

```tsx [React Native]
import { submitGameCenterLeaderBoardScore } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';

function GameCenterLeaderBoardScoreSubmitButton() {
  async function handlePress() {
    try {
      const result = await submitGameCenterLeaderBoardScore({ score: '123.45' });

      if (!result) {
        console.warn('지원하지 않는 앱 버전이에요.');
        return;
      }

      if (result.statusCode === 'SUCCESS') {
        console.log('점수 제출 성공!');
      } else {
        console.error('점수 제출 실패:', result.statusCode);
      }
    } catch (error) {
      console.error('점수 제출 중 오류가 발생했어요.', error);
    }
  }

  return <Button onPress={handlePress}>점수 제출하기</Button>;
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-game](https://github.com/toss/apps-in-toss-examples/tree/main/with-game) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

***

## 2. 게임 리더보드 열기

**SDK 함수:** `openGameCenterLeaderboard`

`openGameCenterLeaderboard` 함수는 리더보드 WebView를 열어 사용자가 자신의 순위를 확인할 수 있도록 하는 함수예요.\
친구를 추가하거나, 친구와 점수를 공유할 수 있어요.

::: tip 주의하세요

* 토스앱 5.221.0 버전부터 지원해요. 게임 리더보드를 지원하지 않는 버전에서는 `undefined`를 반환해요.
* 게임 프로필 WebView와 화면이 겹칠 수 있어요. 게임 진입 직후 바로 리더보드를 호출하는 것은 피해 주세요.
* 미니앱 정보 승인이 되지 않은 상황에서 호출하면 `LeaderBoard not found` 오류가 발생해요.
* **리더보드를 열면 미니앱은 백그라운드 상태로 전환돼요.**\
  리더보드에서 다시 돌아오면 포그라운드로 복귀하니, 게임 상태 관리에 유의해 주세요.
* 보안상의 이유로, 사용자 식별자는 응답에 포함되지 않아요.

:::

**시그니처**

```typescript
function openGameCenterLeaderboard(): Promise<void>;
```

**반환 값**

**예제 : 리더보드 웹뷰 호출하기**

::: code-group

```js [js]
import { isMinVersionSupported, openGameCenterLeaderboard } from '@apps-in-toss/web-framework';

function handleOpenGameCenterLeaderboard() {
  const isSupported = isMinVersionSupported({
    android: '5.221.0',
    ios: '5.221.0',
  });

  if (!isSupported) {
    console.warn('지원하지 않는 앱 버전이에요.');
    return;
  }

  openGameCenterLeaderboard();
}
```

```tsx [React]
import { isMinVersionSupported, openGameCenterLeaderboard } from '@apps-in-toss/web-framework';
import { Button } from '@toss/tds-mobile';

// '리더보드' 버튼을 누르면 리더보드 웹뷰가 열려요.
function GameCenterLeaderboardOpenButton() {
  const isSupported = isMinVersionSupported({
    android: '5.221.0',
    ios: '5.221.0',
  });

  if (!isSupported) {
    return;
  }

  function handleClick() {
    openGameCenterLeaderboard();
  }

  return <Button onClick={handleClick}>리더보드 웹뷰 호출</Button>;
}
```

```tsx [React Native]
import { isMinVersionSupported, openGameCenterLeaderboard } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';

// '리더보드' 버튼을 누르면 리더보드 웹뷰가 열려요.
function GameCenterLeaderboardOpenButton() {
  const isSupported = isMinVersionSupported({
    android: '5.221.0',
    ios: '5.221.0',
  });

  if (!isSupported) {
    return;
  }

  function handlePress() {
    openGameCenterLeaderboard();
  }

  return <Button onPress={handlePress}>리더보드 웹뷰 호출</Button>;
}
```

:::

**예제 앱 체험하기**

[apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) 저장소에서 [with-game](https://github.com/toss/apps-in-toss-examples/tree/main/with-game) 코드를 내려받거나, 아래 QR 코드를 스캔해 직접 체험해 보세요.

![](/assets/leaderboard_1.DXcqVUWr.webp)

![](/assets/leaderboard_2.Jrmsp-Ym.webp)

***

## 샌드박스 테스트

샌드박스 환경에서도 리더보드 기능을 테스트할 수 있어요.\
샌드박스에서 기록한 점수는 실제 서비스 리더보드에는 반영되지 않아요.

샌드박스 앱 최소 지원 버전을 확인해 주세요.

* iOS: 2025-12-07
* Android: 2025-12-16

***

## 참고사항

* 게임 리더보드 기능은 게임 카테고리 미니앱에서만 사용할 수 있어요. 비게임 미니앱에서 호출하면 정상적으로 동작하지 않아요.
* 점수 제출(`submitGameCenterLeaderBoardScore`)과 리더보드 열기(`openGameCenterLeaderboard`)는 서로 독립적인 API예요.
* 점수를 제출하지 않아도 리더보드를 열 수 있고, 점수를 제출해도 자동으로 리더보드가 열리지는 않아요.
* 점수는 문자열 형태의 숫자로 제출해야 하며, 서버에서 별도의 점수 검증 로직은 제공하지 않아요. 점수 계산 및 유효성 검사는 게임 로직에서 직접 처리해 주세요.
* 리더보드 UI와 데이터는 토스 게임센터에서 관리되며, SDK를 통해 개별 항목을 직접 수정하거나 삭제할 수는 없어요.

***

## 자주 묻는 질문

\<FaqAccordion :items='\[
{
q: "리더보드 함수 실행 시 LeaderBoard not found 에러가 발생해요.",
a: \`미니앱 정보 승인이 되지 않았는데 호출하면 발생하는 오류에요.

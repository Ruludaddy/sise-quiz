---
url: >-
  https://developers-apps-in-toss.toss.im/bedrock/reference/framework/PDF/openPDFViewer.md
description: openPDFViewer는 Base64로 인코딩된 PDF 데이터를 네이티브 PDF 뷰어로 여는 함수예요.
---

# PDF 뷰어

## PDF 뷰어 열기

**SDK 함수:** `openPDFViewer`

`openPDFViewer`는 Base64로 인코딩된 PDF 데이터를 네이티브 PDF 뷰어로 여는 함수예요.\
사용자가 PDF 뷰어를 닫으면 `'CLOSE'`를 반환해요.

**시그니처**

```typescript
function openPDFViewer(params: OpenPDFViewerParams): Promise<OpenPDFViewerResult>;
```

**파라미터**

**반환값**

**에러**

| 에러 코드                 | 발생 조건                                   |
| ------------------------- | ------------------------------------------- |
| `INVALID_REQUEST`         | 요청 파라미터가 올바르지 않을 때            |
| `INVALID_DATA`            | PDF 데이터가 유효하지 않을 때               |
| `PDF_VIEWER_ERROR`        | PDF 뷰어를 여는 과정에서 오류가 발생했을 때 |
| `UNSUPPORTED_APP_VERSION` | 토스앱 버전이 5.261.0보다 낮을 때           |

**예제**

::: code-group

```tsx [React]
import { openPDFViewer } from '@apps-in-toss/web-framework';

async function showPdf() {
  try {
    const result = await openPDFViewer({
      data: 'JVBERi0xLjQK...',
      filename: 'document.pdf',
    });

    if (result === 'CLOSE') {
      console.log('PDF 뷰어가 닫혔어요.');
    }
  } catch (error) {
    console.error('PDF 뷰어 오류:', error);
  }
}
```

```tsx [React Native]
import { openPDFViewer } from '@apps-in-toss/framework';

async function showPdf() {
  try {
    const result = await openPDFViewer({
      data: 'JVBERi0xLjQK...',
      filename: 'document.pdf',
    });

    if (result === 'CLOSE') {
      console.log('PDF 뷰어가 닫혔어요.');
    }
  } catch (error) {
    console.error('PDF 뷰어 오류:', error);
  }
}
```

:::

## 타입 · 객체

**PDF 뷰어 파라미터 (`OpenPDFViewerParams`)**

`openPDFViewer` 함수에 전달하는 파라미터 타입이에요.

**시그니처**

```typescript
interface OpenPDFViewerParams {
  data: string;
  filename?: string;
}
```

**프로퍼티**

**PDF 뷰어 결과 (`OpenPDFViewerResult`)**

PDF 뷰어가 닫혔을 때 반환되는 결과 타입이에요.

**시그니처**

```typescript
type OpenPDFViewerResult = 'CLOSE';
```

**값 설명**

| 값        | 설명                               |
| --------- | ---------------------------------- |
| `'CLOSE'` | 사용자가 PDF 뷰어를 닫은 경우예요. |

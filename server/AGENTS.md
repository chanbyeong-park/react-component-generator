# server/AGENTS.md

`server/index.ts` — Bun 네이티브 HTTP 서버. AI API(Anthropic, Google)에 대한 프록시 역할을 하며, 생성된 코드를 `react-live`에서 실행 가능한 형태로 후처리한다.

## AI 출력 제약 (SYSTEM_PROMPT)

`react-live`의 `noInline` 모드로 실행되므로 AI가 생성하는 코드는 다음 제약을 반드시 준수해야 한다:

- `import` 문 금지 — React는 전역 스코프에서 이미 사용 가능
- TypeScript 문법 금지 (타입 어노테이션, 인터페이스, 제네릭, `as` 캐스팅 모두 금지)
- CSS import 금지 — 인라인 스타일만 허용
- 마지막 줄에 반드시 `render(<ComponentName />)` 호출 포함

SYSTEM_PROMPT 수정 시 위 제약은 반드시 유지한다. 이를 완화하면 `react-live` 런타임 에러가 발생한다.

## 응답 후처리 함수

| 함수 | 역할 |
|------|------|
| `stripCodeFences()` | AI가 반환한 마크다운 코드펜스(```jsx 등) 제거 |
| `ensureRenderCall()` | `render()` 호출이 없으면 첫 번째 PascalCase 컴포넌트명으로 자동 추가 |

두 함수는 항상 이 순서로 실행된다: `ensureRenderCall(stripCodeFences(text))`.

## 프로바이더 추가 패턴

새 프로바이더를 추가할 때 수정해야 할 지점:

1. `Provider` 타입에 추가 (`'anthropic' | 'google' | 'newprovider'`)
2. `ENV_KEYS` 맵에 환경변수 키 추가
3. `callNewProvider()` 함수 구현 — `Promise<string>` 반환 (순수 텍스트)
4. `/api/generate` 핸들러의 삼항 분기에 추가
5. `src/types/index.ts`의 `Provider` 타입 동기화
6. `src/App.tsx`의 `PROVIDER_CONFIG` 맵에 label/placeholder 추가

## 에러 처리 규칙

- `429` → "요청이 너무 많습니다" (rate limit)
- `503` → "API 서버가 일시적으로 과부하" (upstream unavailable)
- 기타 → 원본 에러 메시지를 그대로 클라이언트에 전달

새 프로바이더 추가 시 해당 프로바이더의 rate limit / overload 상태코드를 위 패턴에 맞게 처리한다.

## Local Golden Rules

- `resolveApiKey(provider, clientKey)` 는 항상 `clientKey → ENV_KEYS → null` 순서로 우선순위를 결정한다. 이 순서를 변경하지 않는다.
- Google Gemini 응답에서 `finishReason === 'MAX_TOKENS'` 체크를 제거하지 않는다 — 잘린 코드가 렌더링되면 런타임 에러가 발생한다.
- 새 엔드포인트 추가 시 반드시 `CORS_HEADERS`를 응답에 포함한다.

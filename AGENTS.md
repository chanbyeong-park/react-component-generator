# AGENTS.md

## Operational Commands

```bash
bun run dev      # API 서버(3002) + Vite(5173) 동시 실행 — 개발 시 항상 이 명령 사용
bun run server   # API 서버만 단독 실행 (watch 모드)
bun run build    # 프로덕션 빌드 (tsc -b && vite build)
bun run lint     # ESLint 검사
```

패키지 매니저는 반드시 **bun**만 사용한다. npm, yarn, pnpm 사용 금지.

## Golden Rules

**Immutable (절대 타협 불가)**

- API 키는 반드시 `.env` 파일 또는 서버 환경변수에만 저장한다. 클라이언트 코드에 하드코딩 금지.
- `/api/config` 엔드포인트는 키의 존재 여부(boolean)만 내려준다. 키 값 자체를 클라이언트로 전송하지 않는다.
- Vite 개발 서버의 `/api/*` 프록시 설정(`vite.config.ts`)은 제거하거나 변경하지 않는다.

**Do's**

- 새 AI 프로바이더 추가 시 `server/index.ts`의 `Provider` 타입과 `ENV_KEYS` 맵을 함께 업데이트한다.
- `src/types/index.ts`의 `Provider` 타입도 동기화한다.
- 컴포넌트 상태는 `useComponentGenerator` 훅으로만 관리한다. App.tsx에 직접 fetch 로직을 추가하지 않는다.

**Don'ts**

- `react-live`의 `noInline` prop을 제거하지 않는다 — AI가 생성하는 코드가 `render()` 호출 방식에 의존한다.
- `server/index.ts`에서 `resolveApiKey()` 함수를 우회하여 키를 직접 참조하지 않는다.

## Project Context

사용자가 자연어 프롬프트를 입력하면 AI가 React 컴포넌트 코드를 생성하고, 브라우저에서 즉시 렌더링하는 도구.

Tech Stack: React 19, TypeScript, Vite, Bun, react-live, Anthropic Claude, Google Gemini

## Standards

**커밋 메시지:** `타입(선택: 스코프): 한국어 요약` 형식. 타입은 `feat / fix / refactor / style / chore / docs` 중 선택.

**CSS:** `src/App.css`의 CSS 변수(`--primary`, `--mono` 등)를 사용한다. 컴포넌트에 인라인 스타일이나 별도 CSS 파일을 추가하지 않는다.

**규칙과 코드의 괴리 발견 시:** 수정 후 이 파일의 관련 규칙을 업데이트할 것을 제안한다.

## Context Map

- **[AI 프록시 서버, 프로바이더 추가/수정](./server/AGENTS.md)** — `server/index.ts` 작업 시. SYSTEM_PROMPT 수정, 새 프로바이더 연동, 응답 후처리 로직 변경 포함.

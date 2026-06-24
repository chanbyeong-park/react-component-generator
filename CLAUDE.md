@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # API 서버(3002) + Vite 개발 서버(5173) 동시 실행
bun run server   # API 서버만 실행 (watch 모드)
bun run build    # TypeScript 빌드 후 Vite 번들
bun run lint     # ESLint 검사
```

`.env` 파일에 `ANTHROPIC_API_KEY` 또는 `GOOGLE_API_KEY`를 설정하면 UI 입력 없이 바로 사용 가능.

## Architecture

**두 개의 독립된 프로세스:**

- `server/index.ts` — Bun HTTP 서버 (포트 3002). AI API 프록시 역할. Vite의 `/api/*` 요청을 이 서버로 프록시하도록 `vite.config.ts`에 설정되어 있다.
- `src/` — React 19 + Vite SPA. 빌드 시 정적 파일로 출력.

**데이터 흐름:**

```
사용자 입력 → App.tsx → useComponentGenerator hook
  → POST /api/generate (Bun 서버)
  → Anthropic / Google API 호출
  → stripCodeFences() + ensureRenderCall() 처리
  → GeneratedComponent 상태에 추가
  → ComponentCard → LivePreview (react-live 런타임 렌더링)
```

**AI 코드 제약 (server/index.ts `SYSTEM_PROMPT`):**

서버가 AI에게 다음 규칙을 강제한다:
- `import` 문 금지 — React는 전역 스코프에서 접근 가능
- TypeScript 문법 금지 — 순수 JavaScript만 출력
- 인라인 스타일만 사용 (CSS import 금지)
- 마지막 줄에 반드시 `render(<ComponentName />)` 포함

`ensureRenderCall()`은 AI가 `render()` 호출을 빠뜨렸을 때 자동으로 추가한다.

**API 키 처리:**

`/api/config` 엔드포인트가 서버에 환경변수 키가 있는지 여부를 boolean으로 내려준다. 클라이언트는 이를 받아 "서버 키 사용 중" 상태를 표시한다. 실제 키 값은 클라이언트로 전달되지 않는다.

## 스타일 시스템

`src/App.css`의 CSS 변수(`--primary`, `--text`, `--mono` 등)로 토큰을 관리한다. `--mono`는 IBM Plex Mono 폰트 스택을 참조하며, 제목·라벨·버튼 등 UI 전반에 사용된다. 폰트는 `src/index.css`에서 Google Fonts로 임포트한다.

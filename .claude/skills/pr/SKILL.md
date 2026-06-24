---
name: pr
description: >
  GitHub PR을 생성하는 스킬. 사용자가 "PR", "PR 만들어줘", "pull request",
  "풀리퀘", "PR 올려줘", "PR 생성", "PR 열어줘" 등을 언급할 때 반드시 이 스킬을 사용한다.
  브랜치 변경사항을 분석하고 PR 본문 템플릿을 채워 gh CLI로 PR을 생성한다.
context: fork
allowed-tools: Read Glob Grep Bash
---

# PR 생성 스킬

브랜치의 변경사항을 분석하고, `references/pr-template.md` 템플릿을 채워 사용자 확인 후 PR을 생성한다.

## 1단계: 사전 확인

```bash
gh auth status
git branch --show-current
git status --short
```

- `gh auth status`가 실패하면 `gh auth login` 실행을 안내하고 중단한다.
- 현재 브랜치가 `main` / `master` / `develop` 이면 "기능 브랜치에서 PR을 생성하세요"라고 안내하고 중단한다.
- uncommitted 변경사항이 있으면 "아직 커밋하지 않은 변경사항이 있습니다" 경고를 표시하고 계속 진행 여부를 확인한다.

**base 브랜치 탐지:** `main → master → develop` 순으로 존재하는 첫 번째를 사용한다.

```bash
git branch -r | grep -E 'origin/(main|master|develop)' | head -1
```

## 2단계: 변경사항 분석

```bash
git log <base>..<current> --oneline
git diff <base>...<current> --stat
```

- 커밋이 없으면 "base 브랜치와 차이가 없습니다"라고 안내하고 중단한다.
- diff가 너무 크면 `--stat` 결과만 사용하고 전체 diff는 생략한다.

## 3단계: PR 제목 + 본문 작성

**언어 결정:**
- 사용자 요청에 "영문", "영어", "English", "en" 중 하나라도 포함된 경우 → `references/pr-template-en.md` 사용
- 그 외 → `references/pr-template-ko.md` 사용 (기본값)

**제목 결정:**
- 커밋 1개 → 해당 커밋 메시지를 그대로 사용
- 커밋 여러 개 → 변경사항 전체를 종합해 50자 이내로 작성 (선택한 언어로)

**본문 작성:**
위에서 결정한 템플릿 파일을 읽어 각 섹션을 변경사항 기반으로 채운다.
- (ko) "변경 사항 요약" / (en) "Summary": 이 PR이 왜 필요한지 1~2문장
- (ko) "주요 변경 내역" / (en) "Key Changes": 커밋 로그와 diff --stat 기반으로 bullet 작성
- (ko) "테스트 방법" / (en) "How to Test": 변경된 기능을 확인하는 구체적인 방법
- (ko) "관련 이슈" / (en) "Related Issues": 커밋 메시지에서 `#번호` 패턴을 찾아 자동 추출, 없으면 (ko) "해당 없음" / (en) "N/A"

## 4단계: 사용자 확인

제안할 PR 제목과 본문 전체를 사용자에게 보여주고 승인을 받는다.
승인 전까지 push와 PR 생성을 하지 않는다.

```
다음 내용으로 PR을 생성할게요:

제목: <제목>

본문:
<본문 전체>

진행할까요?
```

## 5단계: Push + PR 생성

원격에 브랜치가 없으면 먼저 push한다:

```bash
git push -u origin <current-branch>
```

PR을 생성한다:

```bash
gh pr create --title "<제목>" --body "<본문>"
```

생성된 PR URL을 출력한다.

## 주의사항

- `--force` push는 사용자가 명시적으로 요청하지 않는 한 사용하지 않는다.
- Draft PR이 필요하면 사용자가 "draft" 또는 "초안"을 언급한 경우에만 `--draft` 플래그를 추가한다.
- `gh pr create` 실행 전 반드시 사용자 승인을 받는다.

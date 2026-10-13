---
name: rea-reverse-engineer
description: REA(Reverse Engineer Anything) MCP를 설치·점검하고, 앱·웹사이트·바이너리의 기능이 어떻게 동작하는지 근거와 함께 분석해 내 프로젝트에 비슷한 기능을 만드는 절차. "REA 설치해줘", "REA 써서 분석해줘", "리버스 엔지니어링", "이 앱 기능 어떻게 만든 건지 뜯어봐", "기드라 연결", "rea doctor" 요청 시 사용.
---

# REA (Reverse Engineer Anything) 설치·사용

출처: https://github.com/morluto/rea (확인일 2026-10-13, npm 최신 6.4.0, 커밋 7369b5e)
관련 문서: docs/installation.md, docs/client-configuration.md, DISCLAIMER.md, 한국어 README(docs/readme/README_ko.md), https://rea.tools/guides/

## 언제 쓰나

- 다른 앱·웹사이트에서 본 기능이 어떻게 동작하는지 소스 없이 확인하고, 내 프로젝트에 비슷한 기능을 직접 구현할 때
- 내가 만든(또는 분석 권한이 있는) 앱의 빌드 결과물·Electron 앱·웹 번들을 점검할 때
- 쓰지 않는 경우: 소스 저장소가 통째로 있는 경우. 그때는 일반 코드 읽기로 충분하다(REA 공식 스킬도 같은 기준).

구조 한 줄: 에이전트(Claude Code) → REA MCP 서버 → Ghidra·Hopper·IDA·크롬 계열 브라우저·JS 정적분석기 → 의사코드(pseudocode)·근거(Evidence)·모르는 부분(limitations)을 돌려받는다. 분석은 로컬에서 돈다.

## 사용 원칙 (원문 DISCLAIMER 요약)

- 내가 소유했거나 분석 권한이 있는 소프트웨어, 상호운용성·교육·보안 연구 목적에만 쓴다.
- 하지 않는 것: DRM·라이선스 체크·안티치트 우회, 인증·봇 차단 우회, 독점 소프트웨어의 보호된 코드·에셋 복제, 게임 치트, AI 계정 공유.
- 결과물은 "동작 원리를 이해하고 내 코드로 새로 구현"하는 데 쓴다. 디컴파일 코드를 그대로 붙여 배포하지 않는다(보충: 원문 취지에 따른 정리).
- IDA·Hopper·JEB 같은 상용 툴은 정식 라이선스로만 쓴다. 크랙·키 공유 금지.

## 전제조건

| 항목 | 조건 |
|---|---|
| Node.js | 22.x(>=22.19), 24.x(>=24.11), 26 이상. 23·25·프리릴리스 미지원 |
| npm | Node에 딸린 npm |
| 에이전트 | Claude Code(클라이언트 ID `claude_code`) 외 Claude Desktop, Codex, Cursor, Gemini CLI 등 22종 |
| 네이티브 바이너리 분석 | Hopper, Ghidra, IDA 중 하나. Ghidra는 12.1.x + 64비트 JDK 21 이상 |
| 웹사이트 분석 | 크롬 계열 브라우저 |
| JS/Electron 정적 분석 | 추가 도구 불필요 |
| .NET 정적 분석 | 추가 도구 불필요 |

## 절차

1. Node 버전 확인 (`node --version`). 범위 밖이면 Node부터 맞춘다. REA는 Node·npm을 대신 설치하지 않는다.
2. 계획만 먼저 본다: `setup --client claude_code --dry-run --json`. 바뀌는 파일 경로와 백업 경로를 확인한다.
3. 실제 설치: `npx rea-agents@latest setup` 실행 → 에이전트 선택 → 계획 검토 → 승인. Claude Desktop을 함께 고를 때는 앱을 완전히 종료한 뒤 승인한다.
4. 에이전트(Claude Code) 재시작. 재시작 전에는 REA 도구가 세션에 나타나지 않는다.
5. 바이너리를 분석할 경우에만 Ghidra 경로를 설정하고 `doctor --provider ghidra --json`으로 확인한다. JS·웹만 볼 거면 건너뛴다.
6. 에이전트에게 요청한다(아래 "요청 문장 예시").
7. 결과에서 근거(Evidence)와 limitations를 확인하고, 내 코드로 구현·테스트한다.
8. 주기적으로 업데이트한다. 버그가 나면 업데이트부터 한다.

## 명령어

설치(가이드형, 권장):

```bash
npx rea-agents setup
npx rea-agents@latest setup
```

Claude Code만 지정해 계획 확인 / 비대화형 적용:

```bash
npx -y rea-agents@latest setup --client claude_code --dry-run --json
npx -y rea-agents@latest setup --client claude_code --yes --json
```

전역 설치(`rea` 명령을 쓰고 싶을 때):

```bash
npm install --global rea-agents
rea --help
```

준비 상태 점검(읽기 전용):

```bash
rea doctor --json
rea doctor --client claude_code --json
rea doctor --provider ghidra --json
rea doctor --skill --json
```

JS/Electron 앱 정적 분석(MCP 없이 터미널에서 바로):

```bash
npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json
```

업데이트 / 제거:

```bash
rea update
npx rea-agents@latest setup
rea uninstall
rea uninstall --purge-data
```

스킬만 설치(MCP 등록은 안 됨):

```bash
npx skills add morluto/rea --skill reverse-engineer-anything
```

## 설정

setup이 쓰는 위치(dry-run으로 확인한 값, Linux 기준):

- MCP 등록: `~/.claude.json`의 `mcpServers.rea` (백업: `~/.claude.json.rea.backup`)
- 스킬: `~/.claude/skills/reverse-engineer-anything`

수동 등록이 필요할 때(`mcpServers`에 추가):

```json
{
  "mcpServers": {
    "rea": {
      "command": "npx",
      "args": ["-y", "rea-agents@6.4.0", "mcp"]
    }
  }
}
```

Ghidra 연결(macOS/Linux):

```bash
export GHIDRA_INSTALL_DIR=/absolute/path/to/ghidra_12.1.4_PUBLIC
export JAVA_HOME=/absolute/path/to/jdk-21
rea doctor --json
rea setup
```

Ghidra 연결(Windows PowerShell, 실험 단계):

```powershell
$env:GHIDRA_INSTALL_DIR = "C:\tools\ghidra_12.1.4_PUBLIC"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
rea doctor --json
rea providers --json
```

바꿀 수 있는 주요 키:

- `REA_MCP_INPUT_SCHEMA_PROFILE`: `compact`로 두면 도구 정의 크기가 줄어든다(`mcpServers.rea.env`에 추가).
- `REA_GHIDRA_STARTUP_TIMEOUT_MS`, `REA_HOPPER_STARTUP_TIMEOUT_MS`: 큰 바이너리에서 시작 제한시간을 늘린다.
- `REA_IDA_MCP_CONFIG`: IDA 쓸 때 IDA MCP 등록 JSON 경로.

## 요청 문장 예시

원문 예시:

```text
Understand how search works in the Notes app, show me the evidence, and build a
similar feature for my project.
```

한국어로 쓸 때(보충):

```text
[앱 이름]에서 [기능]이 어떻게 동작하는지 REA로 확인해 줘.
근거와 확실하지 않은 부분을 따로 보여주고, 내 프로젝트([경로])에 비슷한 기능을 새로 구현해 줘.
```

```text
/absolute/path/to/app 의 Electron 앱 구조를 REA로 정적 분석해서
모듈·IPC·라우트 관계를 정리해 줘. 실행은 하지 마.
```

## 오류와 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 설치 후에도 에이전트에 REA 도구가 안 보임 | 에이전트를 재시작하지 않음 | Claude Code 재시작. 그래도 없으면 `rea doctor --client claude_code --json` |
| Claude Desktop 등록이 사라짐 | 앱이 켜진 상태에서 승인해 앱이 설정을 덮어씀 | 앱 완전 종료 후 setup 재실행 |
| `rea: command not found` | `npm install`을 `--global` 없이 실행 | `npm install --global rea-agents` 또는 `npx -y rea-agents@latest` 사용 |
| doctor `healthy: false` | 전체 감사라 안 쓰는 엔진(Hopper·IDA)까지 실패로 집계 | 쓸 작업만 범위 지정: `--provider ghidra`, `--client claude_code` |
| `GHIDRA_INSTALL_DIR is not set` | Ghidra 경로 미설정 | Ghidra 12.1.x 압축 해제 경로를 `GHIDRA_INSTALL_DIR`로 export |
| `capability_unavailable` (`ambiguous`) | 쓸 수 있는 엔진이 여러 개 | CLI `--provider`, MCP `open_binary`의 `provider_id`로 지정 |
| `capability_unavailable` (`provider_unavailable`) | 선택한 엔진 고장 | 해당 엔진 doctor 결과의 remediation 따름 |
| 큰 바이너리에서 시작 타임아웃 | 기본 제한시간 부족 | `REA_GHIDRA_STARTUP_TIMEOUT_MS` / `REA_HOPPER_STARTUP_TIMEOUT_MS` 상향 |
| macOS 첫 실행 시 Hopper 대화상자에서 멈춤 | 데모/라이선스 선택 창 | 같은 사용자 세션에서 Hopper를 한 번 직접 열어 선택 |
| setup이 아무것도 안 쓰고 멈춤 | 기존 설정 파일이 깨졌거나 경로가 안전하지 않음 | 보고된 설정 파일을 고친 뒤 재실행 |
| 컨텍스트가 계속 차서 autocompact 반복 | 타사 호환 API 사용 시 도구 정의 전체가 매 요청에 실림 | `REA_MCP_INPUT_SCHEMA_PROFILE=compact` 설정 |
| 알 수 없는 버그 | 구버전 | `rea update` 또는 `npx rea-agents@latest setup` 후 재시도, 그래도 나면 GitHub 이슈 |

## 검증

- 설치 확인: `rea doctor --client claude_code --json` 결과에서 `identity.registrations[].state`가 `missing`이 아니고, `rea doctor --skill --json`에서 `identity.skill.state`가 `missing`이 아니면 등록 완료.
- 세션 확인: Claude Code 재시작 후 REA 도구(예: `analyze_javascript_application`, `open_binary`)가 도구 목록에 보이는지 확인. doctor는 파일만 보고 실제 연결은 확인하지 않는다.
- 엔진 확인: `rea doctor --provider ghidra --json`의 `healthy`가 true.
- 분석 확인: 결과에 Evidence(근거)와 limitations(모르는 부분)가 함께 나오는지 확인.

### 이 환경에서 직접 확인한 것 (2026-10-13, Linux 클라우드 컨테이너, Node 22.22.0)

| 명령 | 결과 |
|---|---|
| `npm view rea-agents dist-tags.latest` | 6.4.0 |
| `npx -y rea-agents@latest --version` / `--help` | 정상 출력 (`rea@6.4.0`) |
| `npx -y rea-agents@6.4.0 doctor --json` | exit 1, `healthy: false` (엔진 미설치로 예상된 결과) |
| `npx -y rea-agents@6.4.0 setup --client claude_code --dry-run --json` | `status: planned`. `~/.claude.json` 등록 + `~/.claude/skills/reverse-engineer-anything` 스킬 설치 계획 확인 |

## 미검증 항목

- 실제 setup 적용(파일 쓰기)과 Claude Code 재시작 후 도구 노출: 클라우드 컨테이너는 세션이 끝나면 사라져 적용하지 않았다. 사용자 PC에서 실행 필요.
- `analyze-javascript-application` 실제 실행: 이 환경의 권한 정책으로 실행이 막혀 돌려 보지 못했다.
- Ghidra·Hopper·IDA 연결, 브라우저 분석, 네이티브 디컴파일 전 과정.
- Windows 환경 동작(원문상 Ghidra Windows 지원은 실험 단계).
- 영상의 "그림판 재구현 11분" 시나리오: 원문 저장소에 없는 내용이라 재현하지 않았다.

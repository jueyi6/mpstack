# mpstack for Claude Code

[English](README.md) | 한국어

두 스킬 묶음을 하나로 합친 Claude Code용 개발 워크플로 플러그인입니다.

- [pstack](https://github.com/cursor/plugins) (Lauren Tan): 실제 작업을 맡습니다. 플레이북 22개, 원칙 24개, 검증, 리뷰 패널, PR 처리.
- [Matt Pocock의 skills](https://github.com/mattpocock/skills): pstack에 없는 기획 단계를 맡습니다. 인터뷰, 스펙, 티켓, 용어집과 ADR, 출처를 단 조사.

두 묶음의 내용을 이 저장소 파일 안에 합치고 Claude 모델 전용으로 다시 썼습니다. mpstack만 설치하면 되고, pstack이나 Matt Pocock의 플러그인은 따로 설치하지 않습니다.

> **초기 버전입니다.** 윈도우 PC 한 대에서 설치와 두 가지 진입 경로(인터뷰, 버그 수정)만 확인했습니다. 맥과 리눅스, 그리고 스킬 하나하나의 동작은 아직 확인하지 못했습니다. 이상한 점은 이슈로 알려 주세요.

## 설치

Claude Code와 Node.js가 필요합니다. 훅과 도구는 모두 의존성과 빌드 단계가 없는 Node 스크립트입니다.

```
/plugin marketplace add jueyi6/mpstack
/plugin install mpstack@mpstack
```

선택 사항: `/mpstack:setup`을 실행하면 역할별 모델과 추론 강도를 고릅니다. 실행하지 않으면 모든 역할이 기본값을 씁니다.

pstack이나 Matt Pocock의 skills를 이미 플러그인으로 설치했다면 지우세요. mpstack에 같은 이름의 스킬이 들어 있어서, 두 벌이 있으면 어느 쪽을 쓸지 꼬입니다.

Claude Code 전용입니다. Cursor나 다른 회사 모델에서는 동작하지 않습니다.

## 사용법

평소처럼 개발 작업을 요청하면 됩니다. 세션 시작 훅이 사소하지 않은 모든 작업을 `mpstack:mpstack` 스킬로 보내고, 이 스킬이 먼저 어느 경로로 갈지 말합니다.

- **인터뷰.** 무엇을 만들지 아직 정해지지 않았거나, 정하지 못했다고 말한 경우입니다. 한 번에 한 묶음씩 질문하고 질문마다 추천 답을 붙입니다. 코드나 도구로 알 수 있는 사실은 묻지 않고 직접 찾아봅니다. 여러 세션에 걸친 작업이면 이어서 스펙과 티켓을 씁니다.
- **빌드.** 무엇을 만들지 정해진 경우입니다. 맞는 플레이북(버그 수정, 기능, 리팩터링, 성능 문제, 조사, 프로토타입 외 16개)을 골라 검증까지 따라갑니다.

직접 시작하려면 `/mpstack:mpstack <작업>`을 입력합니다. mpstack 자체에 대한 질문은 `/mpstack:help`가 답합니다. 모든 스킬은 `/mpstack:<이름>`으로 직접 부를 수 있습니다.

## 어떻게 합쳤나

- **pstack 우선.** 두 묶음이 겹치는 일(테스트, 버그 진단, 프로토타입, 설계, 리뷰, PR 글)은 pstack의 스킬만 넣었습니다. Matt 쪽의 겹치는 스킬은 뺐습니다.
- **Claude 전용.** 모든 에이전트가 Claude 모델로 돕니다. 다른 회사 모델, Cursor 전용 도구와 경로는 Claude Code에 있는 것으로 바꿨습니다. 리뷰 패널은 모든 자리가 같은 회사 모델이므로 자리마다 다른 관점을 줍니다.
- **세션 시작 부담을 작게.** 모델에게 보이는 스킬은 진입 스킬 하나뿐입니다. 나머지 63개는 단계에서 필요할 때 파일 경로로 엽니다. 진입 스킬의 크기는 `tools/check.mjs`가 상한을 지킵니다.
- **위임 계획.** 한 작업에서 첫 서브에이전트를 띄우기 전에, 무엇을 몇 개 띄울지 보여 주고 한 번 승인을 받습니다.

## 업데이트는 어떻게 이루어지나

mpstack은 원본 두 곳을 손으로 합친 복사본입니다. 원본이 바뀌어도 mpstack이 저절로 따라가지 않습니다.

**쓰는 사람 쪽**

- 이 저장소의 `main`에 올라온 커밋 하나하나가 곧 새 버전입니다. `plugin.json`에 `version`이 없어서 커밋 해시가 버전 역할을 합니다.
- `/plugin` → Marketplaces에서 mpstack 마켓의 자동 업데이트를 켜 두면 Claude Code가 알아서 받아옵니다. 직접 받으려면 터미널에서 다음 두 줄을 실행합니다.

  ```
  claude plugin marketplace update mpstack
  claude plugin update mpstack@mpstack
  ```

- 업데이트는 새 세션부터 적용됩니다.
- 무엇이 바뀌었는지는 [`CHANGELOG.md`](CHANGELOG.md)에 날짜별로 적습니다.

**관리하는 쪽**

원본의 새 릴리스는 관리자가 주기적으로(대략 일주일에 한 번) 손으로 옮깁니다. 자동 생성기는 쓰지 않습니다. 기계적으로 바꾼 글은 Claude Code에 맞지 않는 부분이 남기 때문입니다. 절차는 [`skills/update-mpstack/SKILL.md`](skills/update-mpstack/SKILL.md)에 있습니다.

1. **무엇이 바뀌었나 본다.** `node tools/upstream.mjs`가 [`UPSTREAM.json`](UPSTREAM.json)에 적힌 기준 커밋과 원본의 최신 커밋을 비교해서, mpstack이 가져다 쓰는 파일 중 바뀐 것과 그 파일이 mpstack의 어디에 해당하는지를 보여 줍니다. 읽기만 하고 아무것도 고치지 않습니다.
2. **뜻을 옮긴다.** 바뀐 파일마다 원본의 변경 내용을 읽고 mpstack 파일에 직접 반영합니다. 이때 위의 규칙(pstack 우선, Claude 전용, 진입 스킬 하나만 노출, 짧게)을 지킵니다. `tools/port.mjs`는 이름과 경로 같은 기계적인 치환만 미리 보여 주는 보조 도구입니다.
3. **검사한다.** `node tools/check.mjs`가 스킬 머리말, 링크, 스킬 참조, 금지 용어, 진입 스킬 크기를 확인합니다. 푸시할 때마다 GitHub에서도 같은 검사가 돕니다.
4. **실제로 돌려 본다.** 새 세션에서 "아직 정하지 못한 기능" 요청과 "버그 수정" 요청을 세 번씩 넣어 각각 인터뷰와 버그 수정 플레이북으로 들어가는지 봅니다.
5. **올린다.** `UPSTREAM.json`의 기준 버전과 `CHANGELOG.md`를 고치고 `main`에 푸시합니다.

원본에 새 스킬이 생기면 pstack 것은 옮기고, Matt 것은 pstack에 없는 일을 하는 경우에만 가져옵니다.

## 폴더 구성

| 경로 | 용도 |
| --- | --- |
| `skills/mpstack/` | 진입 스킬, 플레이북, `worker.md`, PR 스크립트 |
| `skills/<이름>/` | 그 밖의 스킬. 진입 스킬이 열거나 사용자가 직접 부릅니다. |
| `agents/` | `poteto-agent`(위임 작업), `comment-sicko`(주석 리뷰) |
| `hooks/` | 세션 시작 훅 |
| `UPSTREAM.json` | 이 저장소가 합쳐 온 원본의 버전과 커밋 |
| `tools/upstream.mjs` | 기준 커밋 이후 원본에서 바뀐 것을 보여 주는 읽기 전용 도구 |
| `tools/check.mjs` | 검사 도구 |
| `tools/port.mjs` | 기계적 치환을 보여 주는 보조 도구 |

## 출처와 라이선스

pstack은 © Lauren Tan, Matt Pocock의 skills는 © Matt Pocock이며 둘 다 MIT입니다. 라이선스 원문은 `licenses/`에 있습니다. 합친 작업과 다시 쓴 글, 도구는 © jueyi6, MIT입니다. [`LICENSE`](LICENSE)를 보세요.

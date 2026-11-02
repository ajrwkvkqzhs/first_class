# Coupang Renewal — Design System

> 기준: GitHub `main` 브랜치의 현재 HTML/CSS/JS. **문서화 전용**이며 기존 메인 디자인을 변경하지 않습니다. 값이 명시되지 않은 경우 임의의 디자인 토큰을 만들지 말고 원본을 확인합니다.
> 신규 페이지의 내부 링크는 이 저장소의 상대 경로·페이지 내 앵커만 사용합니다. 기존 브랜드 공식 사이트로 연결하지 않습니다. 구현되지 않은 경로는 링크를 꾸며내지 말고 미구현 상태로 표시합니다.

## 1. Project Overview
`login.html`을 중심으로 제작한 모바일 쿠팡 로그인 UI 리뉴얼입니다. `themes/`에는 동일한 로그인 흐름을 20개 디자인 스타일로 시험하는 **별도 실험 화면**이 있습니다. 서브페이지 기본 규격은 `login.css`를 기준으로 하며, 특정 실험 스타일을 선택한 경우에만 그 테마 규칙을 해당 화면 전체에 일관되게 사용합니다.

## 2. Brand Identity
쿠팡 로고와 파란색 로그인 CTA를 핵심 인식 요소로 유지합니다. 기본 화면은 흰 배경, 단순한 폼, 명확한 상태 변화와 모바일 중심 구조입니다. 실제 로고·체크박스·SNS 아이콘 자산은 `img/`에 있으며, 로고를 텍스트로 재구성하거나 임의 색상을 덧씌우지 않습니다. `themes/`의 20개 컬러는 **공통 브랜드 팔레트가 아닌 테마별 실험용 토큰**입니다.

## 3. Design Principles
- 로그인 동작이 첫 번째 목표입니다. 화면은 브랜드 → 로그인 제목 → 아이디/비밀번호 → 옵션 → 로그인 CTA → 계정 관련 링크 → SNS 로그인 순서로 구성합니다.
- 폼 입력과 오류 피드백은 글자와 경계선으로 명확하게 구분합니다.
- 기존 모바일 화면의 치수와 접근성용 `label`, `role=alert`, `aria-pressed`, `sr-only` 패턴을 유지합니다.
- 아직 구현하지 않은 서브페이지를 만든다는 이유로 데스크톱용 GNB·푸터를 새로 추가하지 않습니다.

## 4. Color System
| CSS 변수 | 실제 값 | 용도 |
|---|---|---|
| `--blue` | `#0088FF` | 기본 로그인 버튼 |
| `--disabled-blue` | `#CCE6FF` | 비활성 로그인 버튼 |
| `--white` | `#FEFEFE` | 화면 및 입력 배경, CTA 글자 |
| `--black` | `#000000` | 기본 문자 |
| `--border` | `#D6C9BE` | 입력 경계 |
| `--placeholder` | `#D8CFC7` | 플레이스홀더 |
| `--input-focus` | `#512314` | 입력 포커스 경계 |
| `--error` | `#A64327` | 입력 오류 메시지 |

직접 사용한 추가 색상: `body #f0f0f0`, 입력 문자 `#171717`, SNS 보조 문자 `#777`, 분리선 `#ECECEC`. 새 페이지는 역할에 맞는 기존 변수부터 사용합니다.

## 5. Typography
`../font/default/css/notosanskr.css`를 불러오고 기본 폰트는 `Noto Sans KR, sans-serif`입니다. `html font-size:62.5%`이므로 `1rem=10px`(일반 기본 설정 기준)입니다. 본문 `1.6rem`; 로그인 제목 `1.6rem / 700 / 22px`; 입력 `1.6rem / 500`; 버튼 `2rem / 700`; 오류 `1.3rem / 700 / 18px`; 계정 링크 `1.3rem / 500 / 20px`; SNS 제목 `1.2rem / 13px`. 텍스트 중요도를 유지하며 새 글꼴을 추가하지 않습니다.

## 6. Layout & Spacing
`#wrap`은 `width:100%;max-width:390px;min-height:100dvh;margin:auto`입니다. 헤더 높이 `157px`, `main padding:1px 20px 70px`. 뒤로가기 버튼 `48×48px`, 로고 `183×44px`(상단 `56px`), 필드 높이 `50px`, 필드 간격 `7px`, 옵션 상단 `17px`, 버튼 상단 `22px`, 계정 링크 상단 `17px`, SNS 블록 `width:288px;max-width:100%;margin-top:106px`. 기본 로그인은 별도의 다단 그리드 없이 단일 열입니다.

## 7. Components
- **Header**: `.back_btn`과 `.brand_logo`. 현재 페이지에는 일반적인 사이트 GNB가 없습니다.
- **Form**: `.login_form`, `.field`, `.input_box`. 필수 입력·오류 표시는 `.field.is_error .error_message`를 사용합니다.
- **Password**: `.password_toggle[aria-pressed]`와 아이콘 상태를 함께 유지합니다.
- **Checkbox**: 실제 `input`을 보존하고 `.check_visual`에 기존 SVG를 적용합니다.
- **CTA**: `.login_btn`, 높이 `50px`, 반지름 `26px`; `:disabled` 상태를 구분합니다.
- **Auxiliary**: `.account_links`와 `.sns_login`·`.sns_btn`을 재사용합니다. SNS는 기존 스프라이트 자산을 사용합니다.
- **Footer/Cards**: 기본 로그인 파일에 공통 푸터나 카드 디자인 시스템이 없으므로 임의로 정의하지 않습니다.

## 8. Interaction
`input:focus`는 `--input-focus` 경계선, 체크박스 `:focus-visible`은 `2px solid #111` 및 `3px` 오프셋, 비밀번호 보기 상태는 `aria-pressed=true`와 불투명도 `.55`, 유효성 오류는 `.is_error`로 표시합니다. 비활성 로그인 버튼은 `--disabled-blue` 및 기본 커서입니다. 기본 로그인 CSS에 명시되지 않은 Hover/Transition 애니메이션을 만들어서 기존 동작처럼 설명하지 않습니다.

## 9. Responsive Rules
기본 화면은 `390px` 이하로 자연스럽게 줄어들고 `@media(max-width:360px)`에서 옵션 간격 `63→22px`, 라벨 간격 `16→9px`, 옵션 글자 `1.4→1.3rem`입니다. 대형 화면에선 `#wrap`이 중앙에 놓입니다. 다른 기준점은 현재 기본 로그인 파일에 정의되지 않았습니다.

## 10. Do & Don't
**Do:** 기본 로그인 색·서체·에셋·간격·접근성 패턴을 복제하십시오. 연결은 이 프로젝트의 상대 경로와 내부 앵커를 사용하십시오. **Don't:** 실험 테마 색상을 기본 쿠팡 컬러에 섞지 마십시오. 원본 로그인 레이아웃, 이미지, 선택자·자바스크립트를 문서 작성 때문에 수정하지 마십시오. 공식 쿠팡 사이트로 링크하지 마십시오.

### 20 Theme Lab (별도 시스템)
`themes/themes.css`의 공통 `.demo` 토큰은 `--bg:#fff`, `--ink:#17202a`, `--accent:#0088ff`, `--muted:#687586`, `--stroke:#d2d8e0`, `--field:#fff`, `--rad:12px`, `--face:Noto Sans KR`, `--button-fg:#fff`입니다. 각 `.theme-01`~`.theme-20`가 값을 덮어쓰므로 **테마 안에서만** 해당 규칙을 따릅니다. 공통 실험 화면은 `.phone width:390px;min-height:844px`, `.field input height:49px`, `.primary-btn min-height:50px`입니다. `700px`와 `520px` 반응형 기준에서 갤러리 열 수와 휴대전화 프레임을 변경합니다. 예: `.theme-01` 미니멀 스타일(`--rad:0`), `.theme-02` 에디토리얼 스타일(Georgia 제목), 나머지도 반드시 해당 테마의 CSS 선언값을 읽고 사용합니다. `themes/README.md`와 `themes/themes.js`의 탐색 동작을 함께 확인하십시오.

### Source of Truth
[`login.html`](login.html) · [`login.css`](login.css) · [`login.js`](login.js) · [`themes/themes.css`](themes/themes.css) · [`themes/README.md`](themes/README.md)

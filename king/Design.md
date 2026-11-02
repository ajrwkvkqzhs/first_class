# Burger King Renewal — Design System

> 기준: GitHub `main` 브랜치의 현재 HTML/CSS/JS. **문서화 전용**이며 기존 메인 디자인을 변경하지 않습니다. 값이 명시되지 않은 경우 임의의 디자인 토큰을 만들지 말고 원본을 확인합니다.
> 신규 페이지의 내부 링크는 이 저장소의 상대 경로·페이지 내 앵커만 사용합니다. 기존 브랜드 공식 사이트로 연결하지 않습니다. 구현되지 않은 경로는 링크를 꾸며내지 말고 미구현 상태로 표시합니다.

## 1. Project Overview
버거킹 로그인 및 비밀번호 재설정 UI 리뉴얼입니다. `login.html`, `password_reset_1.html`, `password_reset_2.html`에 페이지별 인라인 `<style>`이 존재합니다. 아래의 정확한 치수와 변수는 **`login.html`의 CSS를 기준**으로 기록합니다. 서브페이지 작업 시 재설정 페이지의 개별 규칙도 확인해야 합니다.

## 2. Brand Identity
진한 브라운, 크림·베이지 톤과 둥근 입력칸을 사용하는 버거킹 계열 로그인 표현입니다. 제목은 `BKR` 디스플레이 폰트로 강조하고, 폼·본문은 Sandoll GothicNeoRound를 사용하며 보조 링크는 Pretendard Variable을 사용합니다. 공식 사이트 디자인 규칙이라고 단정하지 말고 **저장소에 구현된 리뉴얼 규칙**으로 적용하십시오.

## 3. Design Principles
로그인 인증이 우선이며 헤더 → 브랜드성 제목 → 이메일/비밀번호 폼 → 로그인 옵션 → 주요 CTA → 계정 링크 → SNS 로그인 순서를 유지합니다. 직관적인 폼 영역을 중심으로 크림색 배경과 부드러운 둥근 모서리, 갈색 텍스트를 결합합니다. 확인되지 않은 상세페이지 UI를 추측하지 않습니다.

## 4. Color System
| 변수 | 실제 값 | 용도 |
|---|---|---|
| `--primary` | `#512314` | 기본 텍스트·로그인 CTA |
| `--disabledBg` | `#DDCDBE` | 정의된 비활성 배경 토큰(실제 적용 여부는 페이지 확인) |
| `--focus` | `#D62302` | 정의된 포커스 컬러 토큰(실제 사용 선택자 확인) |
| `--baseBorder` | `#D9CFC6` | 입력 테두리 |
| `--baseBg` | `#FFFCF9` | 입력 배경 |
| `--button` | `#E9DDCD` | 정의된 버튼용 토큰 |
| `--errorColor` | `#C54734` | 정의된 오류용 토큰 |
| `--placeholder` | `#EBE6E2` | 플레이스홀더와 로그인 버튼 문자 |
| `--text` | `#766053` | 보조 문자·구분선 |
| `--bg` | `#f4ebdc` | 전체 로그인 배경 |

선언만 있고 현재 로그인 CSS에서 사용하지 않는 변수도 있습니다. 이를 이미 구현된 상태 규칙으로 단정하지 않습니다.

## 5. Typography
`--font: "Sandoll GothicNeoRound",sans-serif`, `--font-Pre:"Pretendard Variable",sans-serif`, `--font-BKR:"BKR",sans-serif`. 폰트는 `../font/default/css/sdgothicneo.css`, `pretendardvariable.css`, `bkbulmatpro.css`를 통해 불러옵니다. `html font-size:62.5%`; 기본 본문 `1.6rem`; 헤더 제목 `2rem`; 메인 타이틀 첫 줄 `2.5rem`·두 번째 줄 `3.5rem`(BKR); 이메일 라벨 `1.5rem`, 계정 링크 `1.4rem/500`, SNS 안내 `1.3rem`. 해당 CSS에서 명시되지 않은 줄간격은 임의로 정하지 않습니다.

## 6. Layout & Spacing
`#wrap width:100%;max-width:1024px;min-width:360px;min-height:100dvh;margin:auto`. `header height:48px`, 뒤로가기 `48×48px`, `main padding:48px 20px 90px`. 메인 타이틀 줄 간격(`gap`) `16px`, 아래 여백 `50px`. 입력 높이 `50px`, 좌우 `20px` 패딩, 반지름 `10px`; 비밀번호 입력 위 여백 `10px`, 보기 버튼 오른쪽 `16px`, 체크박스 가상 이미지 `30×30px`. CTA 높이 `50px`, 반지름 `22px`. SNS 영역 상단 `96px`, SNS 아이콘 `45×45px`, 간격 `20px`.

## 7. Components
- **Header**: 중앙 `h1`과 왼쪽 `.prev_btn`. 로그인에는 별도의 전역 GNB가 없습니다.
- **Form**: 이메일·비밀번호 입력과 `.input_box`, `.password_box`. 실명·텍스트 레이블은 실제 입력과 연결하십시오.
- **Password toggle**: `.pw_btn`에 기존 `img/eye_icon.svg` 적용. 접근성 명칭은 유지합니다.
- **Checkbox**: 실제 `input.check` 및 `:checked + span::before`로 기존 SVG 교체. 시각적 표시만으로 상태를 보관하지 않습니다.
- **Primary CTA**: `.login_btn`. 현재 로그인 화면에서는 기본 `opacity:.2`가 지정되어 있습니다. 이를 모든 버튼의 공통 비활성 디자인으로 단정하지 않습니다.
- **Account link/SNS**: `.login_link`의 구분선과 `.sns_list`의 카카오·네이버·애플·삼성카드 SVG 자산을 재사용합니다.
- **Footer/Cards**: 로그인 페이지에 공통 푸터·카드 규칙이 확인되지 않아 설계값을 만들지 않습니다.

## 8. Interaction
체크박스의 `:checked` 상태에서 배경 SVG가 변합니다. `.login_btn`의 초기 불투명도는 `.2`이고, 포커스·오류용 변수는 정의되어 있으나 로그인 CSS에서 그 변수에 대한 일관된 상태 선택자가 모두 구현된 것은 아닙니다. 신규 페이지를 작성할 때 기존 재설정 페이지의 `disabled`, 유효성 검사, 메시지 표시와 일치시키고 키보드 조작 및 `:focus-visible`은 별도로 검증하십시오. 확인되지 않은 전환 시간이나 Hover 색상을 임의의 기존 값처럼 기록하지 않습니다.

## 9. Responsive Rules
로그인 `#wrap`은 최대 `1024px`, 최소 `360px`이므로 360px 미만에선 현재 코드상 가로 넘침 위험이 있습니다. 비밀번호 재설정 페이지에는 `@media(max-width:480px)`가 존재합니다. **모든 화면이 동일한 반응형 규칙을 공유하는 것은 아닙니다.** 서브페이지는 해당 파일의 CSS를 먼저 확인하십시오.

## 10. Do & Don't
**Do:** 기존 폰트 파일, 토큰, 베이지·브라운 대비, 폼 계층, SVG를 유지하십시오. 해당 폴더 내 상대 경로만 연결하십시오. **Don't:** 쿠팡이나 원강금속의 파란/빨간 팔레트를 혼용하지 마십시오. 공식 버거킹 웹으로 이동시키지 마십시오. 기존 메인 로그인 UI·폼 동작을 문서 작업을 이유로 변경하지 마십시오. 발견되지 않은 Hover/Focus 값이나 공통 푸터를 만들어내지 마십시오.

### Source of Truth
[`login.html`](login.html) · [`password_reset_1.html`](password_reset_1.html) · [`password_reset_2.html`](password_reset_2.html) · [`../CSS/default.css`](../CSS/default.css)

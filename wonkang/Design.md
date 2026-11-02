# 원강금속 Renewal — Design System

> 기준: GitHub `main` 브랜치의 현재 HTML/CSS/JS. **문서화 전용**이며 기존 메인 디자인을 변경하지 않습니다. 값이 명시되지 않은 경우 임의의 디자인 토큰을 만들지 말고 원본을 확인합니다.
> 신규 페이지의 내부 링크는 이 저장소의 상대 경로·페이지 내 앵커만 사용합니다. 기존 브랜드 공식 사이트로 연결하지 않습니다. 구현되지 않은 경로는 링크를 꾸며내지 말고 미구현 상태로 표시합니다.

## 1. Project Overview
원강금속의 제조 역량·공정·제품·품질 인증·파트너·사업장 정보를 전달하는 B2B 기업 웹사이트 리뉴얼입니다. 완료된 `index.html` 메인 화면과 `css/main.css`, `js/main.js`를 단일 기준으로 사용합니다. 새 서브페이지는 메인을 다시 디자인하는 것이 아니라 구성 요소를 확장하는 작업입니다.

## 2. Brand Identity
명확한 제조업 전문성·신뢰성·기술 역량을 표현합니다. 산업 현장 사진, 절제된 중립색, 강한 대형 타이포, 원강금속 레드와 사업 영역에 활용되는 딥 블루를 사용합니다. 기존 PNG 로고 `img/logo_black.png` 및 헤더용 밝은 로고 이미지를 원본 그대로 사용하고 임의 SVG 재작도·대체를 금지합니다.

## 3. Design Principles
- 정보 우선순위: 히어로의 핵심 역량 → 3개 주력 사업 카드 장면 → 실적 → 대표 제품 → 생산 공정 → 인증 → 파트너 → 연락처.
- 시각 요소는 근거를 전달해야 합니다. 제조 현장·제품·인증 이미지를 장식용 추상 이미지로 임의 대체하지 않습니다.
- 메인 CTA는 실제 문맥에 대응하는 상세 내용·고객 문의·제품 정보로 연결합니다. 미구현 서브페이지는 근거 없이 외부 브랜드 공식 사이트로 연결하지 않습니다.
- 애니메이션은 콘텐츠 발견을 돕는 수단이며 모션 감소 사용자의 콘텐츠 접근을 막아서는 안 됩니다.

## 4. Color System
| CSS 변수 | 실제 값/연결 | 적용 역할 |
|---|---|---|
| `--brand-red-500` | `#e60021` | 브랜드 레드 |
| `--brand-red-700` | `#b7001b` | 호버 레드 |
| `--brand-neutral-950` | `#161519` | 제목·기본 문자 |
| `--brand-neutral-500` | `#626773` | 보조 문자 |
| `--brand-neutral-200` | `#dde1e5` | 구분선·두 번째 사업 배경 |
| `--neutral-50` | `#f7f8fa` | 기본 섹션 배경 |
| `--neutral-0` | `#fff` | 표면 |
| `--brand-blue` | `#08337d` | 세 번째 사업 배경 및 강조 |
| `--primary-default` | `var(--brand-red-500)` | 주요 액션 |
| `--primary-hover` | `var(--brand-red-700)` | 주요 액션 호버 |
| `--background-default` | `var(--neutral-50)` | 배경 |
| `--surface-default` | `var(--neutral-0)` | 카드·표면 |
| `--text-primary` | `var(--brand-neutral-950)` | 본문 |
| `--text-muted` | `var(--brand-neutral-500)` | 보조 문자 |
| `--text-inverse` | `#fff` | 어두운 바탕 위 문자 |
| `--border-default` | `var(--brand-neutral-200)` | 테두리 |

메인 히어로의 반투명 흰색·검은색 오버레이는 사진의 가독성 용도이며 일반 버튼의 새 브랜드 색으로 전용하지 않습니다. 사업 카드 배경은 흰색 → `--brand-neutral-200` → `--brand-blue` 순서입니다.

## 5. Typography
`Noto Sans KR`를 사용하며 `index.html`에서 공용 폰트 CSS를 불러오고 `main.css`에 300 경량 서체 `@font-face`가 추가되어 있습니다. 기본 서체는 `body font-family:'Noto Sans KR',sans-serif`. 현재 CSS의 데스크톱 예시: GNB `20px/500`, 하위 메뉴 `16px/500`, 언어 표기 `18px/700/24px`; 메인 히어로 제목 `72px/700/line-height:1.444444`; 히어로 보조 설명 `16px/500/1.2`; 사업 소개에서 `60px/1.2` 타이포가 사용됩니다. 글자 크기는 **선택자와 반응형 오버라이드에 종속**되므로 전체 사이트에 단일 고정 제목 크기를 강제하지 않습니다. `css/main.css`의 동일 선택자 마지막 선언을 우선 확인하십시오.

## 6. Layout & Spacing
헤더 `--header-height:80px`, `.site-header__inner`는 `grid-template-columns:auto minmax(0,1fr) auto`, 열 간격 `clamp(24px,4vw,80px)`, 수평 패딩 `4.453125%`. 네비게이션 최대 폭 `540px` 및 3열 그리드. 메인 히어로 Swiper 높이 `920px`, 하단 컨트롤 높이 `130px`; 컨트롤 좌우 패딩 `50px`, 두 영역 사이 `65px`. 사업 섹션 기본 최소 높이 `100svh`, 기본 패딩 `calc(60px + var(--header-height)) 20px 112px`. 메인에는 서로 다른 섹션별 그리드와 비율 레이아웃이 있으므로 **사이트 전체 max-width가 단일 값으로 선언되었다고 가정하지 않습니다.**

## 7. Components
- **Header/GNB**: `.site-header`, `.site-logo`, `.site-nav`, `.site-nav__list`, `.site-nav__group`, `.site-nav__submenu`, `.menu-toggle`. 3개 상위 메뉴와 하위 메뉴를 유지합니다. `.is-scrolled`·`.mega-open` 상태에 따라 밝은 바탕/어두운 로고로 전환됩니다.
- **Hero**: `.hero-sec` Swiper, `.hero-copy`, `.hero-title`, `.swiper-controls`(썸네일/페이지네이션), `.hero-solution-link`. 원본 이미지와 텍스트 계층 유지.
- **Company/service cards**: `.card-stack`, `.steel-service`의 3장 스크롤 장면. 배경·텍스트·이미지의 단계별 전환을 `js/main.js`와 연계합니다.
- **Product cards**: `.product-showcase`, `.product-panel`, `.product-panel__reveal`, `.product-panel__actions`. 호버 또는 포커스 안쪽 진입 시 세부 CTA가 나타납니다.
- **Process/certificate/partners**: `.process-gallery`, `.certifications`, `.certificate-card`, `.partners`, `.partner-list`.
- **Footer**: `.site-footer`에 본사·영업소·COMPANY·FACTORY·PRODUCT·CUSTOMER 정보 구조를 유지합니다. 비어 있는 서브페이지를 위해 임의 링크를 만들지 않습니다.

## 8. Interaction
헤더는 스크롤 시 `.is-scrolled`, 메가 메뉴가 열리면 `.mega-open`, 숨김 시 `.is-hidden`을 사용하며 위치 전환 `transform .24s ease`, 배경·문자 전환 `.2s`를 적용합니다. GNB·하위 메뉴 Hover/Focus에서 `--primary-default`를 사용합니다. `.hero-solution-link:hover` 배경은 `#e9ebee`. 제품 패널은 `:hover` 및 `:focus-within`으로 내용이 드러나고 패널 오버레이는 `opacity .35s`. `.card-stack.is-enhanced`는 조건에 따라 sticky 전환 및 JS 제어 CSS 변수를 사용합니다. `prefers-reduced-motion`을 반드시 존중하십시오. 키보드 탐색 및 포커스 동작을 제거하지 않습니다.

## 9. Responsive Rules
실제 미디어쿼리 경계는 `1700px`, `1100px`, `850px`, `600px`; 높이 `600px`, `650px`, `760px` 및 `hover:none/pointer:coarse`, `prefers-reduced-motion` 분기도 있습니다. `850px` 이하 헤더 높이 `76px` 및 모바일 메뉴 구조, `600px` 이하 1열 중심 배열·간격 축소·콘텐츠 재배치가 적용됩니다. `1100px` 이하 다열 레이아웃도 단계별로 줄어듭니다. 새로운 브레이크포인트를 임의로 추가하기 전에 기존 선택자의 모바일 규칙을 확인하십시오.

## 10. Do & Don't
**Do:** 기존 변수와 로고 이미지, Swiper, 사업별 배경색, 제품 CTA, 메가메뉴, 인증서 시각 패턴을 재사용하십시오. 서브페이지 연결은 `company/ci.html`·`factory/locations.html`처럼 존재하는 내부 경로 또는 메인 앵커로만 지정하십시오. **Don't:** 메인 페이지를 재구성하거나 임의 색상·폰트·간격을 디자인 규격처럼 추가하지 마십시오. 원강금속 공식 기존 사이트로 링크하지 마십시오. 모바일에서 데스크톱 Sticky/호버 전용 동작을 무조건 강제하지 마십시오. 빈 메뉴 목적지를 외부 링크로 대신하지 마십시오.

### Source of Truth
[`index.html`](index.html) · [`css/main.css`](css/main.css) · [`js/main.js`](js/main.js) · [`README.md`](README.md)

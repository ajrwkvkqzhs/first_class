# AI_CODING_GUIDE.md

## 목적

이 문서는 현재 저장소의 **버거킹 로그인 UI**를 기준 코드로 삼아, 이후 다른 브랜드의 로그인 UI를 만들 때 기존 HTML/CSS 구조와 학습 방식을 최대한 유지하도록 하기 위한 작업 가이드입니다.

AI는 새 화면을 만들 때 기존 코드를 전부 다시 작성하거나 더 복잡한 방식으로 바꾸지 않습니다. 먼저 현재 코드를 읽고, 필요한 부분만 수정하거나 확장합니다.

---

## 1. 현재 프로젝트 기준 파일

현재 로그인 UI의 기준 파일은 다음과 같습니다.

```text
first_class/
├─ index.html
├─ CSS/
│  └─ default.css
├─ font/
│  ├─ BKBulMatPro-Bold.woff
│  ├─ PretendardVariable.woff2
│  ├─ SDGothicNeoRound-eMd.woff
│  ├─ SDGothicNeoRound-gBd.woff
│  ├─ SDGothicNeoRound-hEb.woff
│  └─ default/
│     └─ css/
│        ├─ bkbulmatpro.css
│        ├─ pretendardvariable.css
│        └─ sdgothicneo.css
└─ king/
   ├─ login.html
   └─ img/
      ├─ back_icon.svg
      ├─ eye_icon.svg
      ├─ checkbox_active.svg
      ├─ checkbox_disabled.svg
      ├─ kakao_logo_icon.svg
      ├─ naver_logo_icon.svg
      ├─ apple_logo_icon.svg
      ├─ samsung_logo_icon.svg
      └─ 기타 이미지
```

새 브랜드 UI를 만들 때도 가능하면 이 구조를 기준으로 합니다.

---

## 2. 가장 중요한 작업 원칙

1. **현재 HTML 구조와 클래스명을 먼저 유지한다.**
2. 기존 코드에서 해결 가능한 것은 새로운 구조나 라이브러리로 바꾸지 않는다.
3. HTML 안의 `<style>` 작성 방식을 유지한다.
4. `CSS/default.css`는 공통 초기화 CSS이므로 특별한 이유가 없으면 수정하지 않는다.
5. 폰트와 이미지의 상대 경로를 먼저 확인한 뒤 수정한다.
6. React, Bootstrap, Tailwind 같은 프레임워크는 사용하지 않는다.
7. JavaScript 기능이 요청되지 않았다면 추가하지 않는다.
8. 화면을 새로 만들기 전에 기존 `king/login.html`의 구조와 스타일을 먼저 비교한다.
9. 디자인을 바꿀 때도 구조 전체를 갈아엎지 말고 색상, 폰트, 여백, 이미지, 문구처럼 필요한 부분부터 수정한다.
10. 반응형 웹 과제이므로 한 화면 크기에만 맞추지 않는다.

---

## 3. 현재 HTML 구조

현재 로그인 화면은 다음 흐름을 기준으로 한다.

```text
#wrap
├─ header
│  ├─ h1
│  └─ .prev_btn
│
└─ main
   ├─ h2.title
   │  ├─ span
   │  └─ span
   │
   ├─ form
   │  └─ fieldset
   │     ├─ legend.sr-only
   │     ├─ label.email
   │     ├─ .input_box
   │     │  └─ input[type="email"]
   │     ├─ .input_box.password_box
   │     │  ├─ input[type="password"]
   │     │  └─ .pw_btn
   │     ├─ .login_option
   │     │  ├─ label
   │     │  └─ label
   │     └─ .login_btn
   │
   ├─ .login_link
   │  ├─ a
   │  ├─ a
   │  └─ a
   │
   └─ .sns_login
      ├─ p
      └─ .sns_list
         └─ a × 4
```

새 로그인 화면을 만들 때 특별한 이유가 없다면 위 구조를 유지한다.

---

## 4. HTML 작성 기준

### header

현재 상단은 로그인 제목과 이전 버튼으로 구성되어 있다.

```html
<header>
    <h1>로그인</h1>
    <button type="button" class="prev_btn">
        <span class="sr-only">이전버튼</span>
    </button>
</header>
```

`.prev_btn`은 실제 글자를 화면에 보이게 하는 대신 배경 이미지로 아이콘을 표시하고, 버튼의 의미는 `.sr-only` 텍스트로 유지한다.

### 제목 영역

```html
<h2 class="title">
    <span>안녕하세요:)</span>
    <span>버거킹입니다</span>
</h2>
```

현재 두 줄 제목 구조를 유지한다.

다른 브랜드를 적용할 때는 HTML 구조보다 **문구와 폰트 스타일을 먼저 변경**한다.

### form / fieldset

로그인 입력 영역은 `form > fieldset` 구조를 유지한다.

```html
<form action="">
    <fieldset>
        <legend class="sr-only">로그인화면</legend>
        ...
    </fieldset>
</form>
```

`fieldset`은 로그인에 필요한 입력 요소를 하나의 의미 있는 묶음으로 사용한다.

### 이메일 입력

```html
<label for="email" class="email">이메일 로그인</label>
<div class="input_box">
    <input
        type="email"
        id="email"
        name="email"
        placeholder="아이디(이메일)을 입력해 주세요."
    >
</div>
```

`label for="email"`과 `input id="email"`의 연결을 유지한다.

### 비밀번호 입력

```html
<div class="input_box password_box">
    <input
        type="password"
        name="password"
        placeholder="비밀번호를 입력해 주세요"
    >
    <button type="button" class="pw_btn">
        <span class="sr-only">비밀번호 보기</span>
    </button>
</div>
```

눈 아이콘은 `.password_box`를 위치 기준으로 사용한다.

`.password_box`의 `position: relative`와 `.pw_btn`의 `position: absolute` 관계를 함부로 제거하지 않는다.

### 로그인 옵션

현재 체크박스는 기본 브라우저 UI를 그대로 표시하는 것이 아니라 숨긴 input과 SVG를 함께 사용한다.

```html
<label>
    <input type="checkbox" class="check sr-only" checked>
    <span>자동로그인</span>
</label>
```

CSS에서는 인접 형제 선택자를 사용한다.

```css
.login_option .check + span::before {
    ...
}

.login_option .check:checked + span::before {
    ...
}
```

따라서 체크박스 구조를 수정할 때 `input + span` 순서를 임의로 바꾸지 않는다.

---

## 5. 공통 CSS와 페이지 CSS의 역할

### CSS/default.css

이 파일은 화면 디자인용 CSS가 아니라 **공통 초기화 CSS**이다.

현재 다음 역할을 담당한다.

- `box-sizing: border-box`
- 기본 margin / padding 제거
- 링크 기본 스타일 제거
- input / button 기본 스타일 초기화
- fieldset border 제거
- `.sr-only` 제공
- 이미지와 SVG 기본 처리
- 모바일 브라우저 기본 appearance 제거

따라서 새 브랜드 페이지를 만들 때도 재사용한다.

페이지마다 다른 색상, 크기, 간격, 이미지 때문에 `default.css`를 수정하지 않는다.

---

## 6. 폰트 연결 구조

현재 로그인 페이지는 다음 CSS를 불러온다.

```html
<link rel="stylesheet" href="../font/default/css/bkbulmatpro.css">
<link rel="stylesheet" href="../font/default/css/sdgothicneo.css">
<link rel="stylesheet" href="../font/default/css/pretendardvariable.css">
<link rel="stylesheet" href="../CSS/default.css">
```

폰트 CSS 내부에서는 실제 폰트 파일을 다음과 같은 상대 경로로 불러온다.

```text
font/default/css/*.css
        ↓ ../../
font/*.woff / *.woff2
```

폴더를 이동하거나 새 브랜드 폴더를 만들 때는 HTML → 폰트 CSS → 실제 폰트 파일까지 연결이 유지되는지 확인한다.

---

## 7. 브랜드 스타일 변수

현재 색상과 폰트는 `:root` 변수로 정리되어 있다.

```css
:root {
    --font: "Sandoll GothicNeoRound", sans-serif;
    --font-Pre: "Pretendard Variable", sans-serif;
    --font-BKR: "BKR", sans-serif;

    --primary: #512314;
    --disabledBg: #DDCDBE;
    --focus: #D62302;
    --baseBorder: #D9CFC6;
    --baseBg: #FFFCF9;
    --button: #E9DDCD;
    --errorColor: #C54734;
    --placeholder: #EBE6E2;
    --text: #766053;
    --bg: #f4ebdc;
}
```

새 브랜드 UI에서는 우선 이 변수들을 검토한다.

예를 들어 브랜드 메인 컬러를 바꿔야 한다면 여러 CSS 선택자를 직접 수정하기 전에 `--primary`가 어디에 사용되는지 확인한다.

단, 모든 색상을 무조건 변수 하나로 통일하지 않는다. 브랜드 디자인에서 서로 다른 역할을 하는 색상은 각각 구분한다.

---

## 8. 현재 반응형 기준

현재 `#wrap`은 다음과 같다.

```css
#wrap {
    width: 100%;
    max-width: 1024px;
    min-width: 360px;
    min-height: 100dvh;
    margin: 0 auto;
    background-color: var(--bg);
}
```

이 프로젝트는 고정 모바일 화면만 만드는 것이 아니라 **360px부터 1024px까지 화면 폭에 따라 늘어나는 반응형 UI**를 기준으로 한다.

AI는 다음을 지킨다.

- 임의로 `max-width: 390px` 같은 모바일 고정 폭으로 변경하지 않는다.
- 입력창과 로그인 버튼처럼 가로로 늘어나야 하는 요소는 현재처럼 `width: 100%`를 우선 사용한다.
- 고정 px 값이 이미 사용된 경우 무조건 rem이나 clamp로 변환하지 않는다.
- 새로운 breakpoint는 실제 화면 차이를 해결할 필요가 있을 때만 추가한다.
- 360px, 390px, 768px, 1024px 정도에서 가로 넘침 여부를 확인한다.

---

## 9. 현재 위치 배치 방식

### 뒤로가기 버튼

```css
header {
    position: relative;
}

.prev_btn {
    position: absolute;
    left: 0;
}
```

header가 위치 기준이며 제목은 가운데에 유지된다.

### 비밀번호 눈 아이콘

```css
.password_box {
    position: relative;
}

.pw_btn {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
}
```

눈 아이콘의 위치가 이상할 경우 먼저 이 관계를 확인한다.

### SNS 구분선

```css
.sns_login > p {
    display: flex;
    align-items: center;
}

.sns_login > p::before,
.sns_login > p::after {
    content: "";
    width: 100%;
    height: 1px;
}
```

텍스트 양옆 구분선은 별도 HTML을 추가하지 않고 가상 요소 `::before`, `::after`로 만든다.

---

## 10. 새 브랜드 로그인 UI를 만드는 방법

새 브랜드를 만들 때는 버거킹 파일을 직접 덮어쓰지 않는 것을 기본으로 한다.

예:

```text
first_class/
├─ king/
│  ├─ login.html
│  └─ img/
│
├─ newbrand/
│  ├─ login.html
│  └─ img/
│
├─ CSS/
└─ font/
```

작업 순서는 다음과 같이 한다.

1. `king/login.html`의 구조를 읽는다.
2. 새 브랜드 폴더에 로그인 파일을 만든다.
3. header, form, fieldset, input, login_option, login_link, sns_login 구조를 우선 유지한다.
4. 브랜드 이름과 안내 문구를 변경한다.
5. 브랜드 컬러를 `:root`에서 정리한다.
6. 필요한 경우 브랜드 폰트를 추가한다.
7. 필요한 이미지만 새 브랜드의 `img/` 안에 둔다.
8. 기존 상대 경로와 새 폴더 구조를 확인한다.
9. 모바일부터 1024px까지 가로 넘침을 확인한다.
10. 마지막에 실제 화면과 기준 이미지를 비교해 간격과 크기를 조정한다.

---

## 11. AI가 임의로 변경하면 안 되는 것

다음은 사용자 요청이나 명확한 이유 없이 변경하지 않는다.

- `form > fieldset` 구조
- 기존 클래스명
- `#wrap`의 360px ~ 1024px 반응형 기준
- HTML 내부 `<style>` 방식
- `CSS/default.css`의 공통 reset 역할
- 기존 폰트 폴더 구조
- 이미지 상대경로 구조
- `.password_box`와 `.pw_btn`의 위치 관계
- `.check + span::before` 체크박스 구조
- SNS 로그인 영역의 기본 배치 방식

또한 다음 행동을 피한다.

- 기존 코드를 무시하고 전체 HTML/CSS를 새로 작성
- 사용하지 않던 라이브러리 추가
- 불필요한 JavaScript 추가
- 모든 px 값을 임의로 rem/clamp로 변환
- 기준 이미지 없이 임의의 여백이나 크기를 대폭 변경
- 모바일 UI라는 이유만으로 전체 화면 폭을 390px로 고정
- 디자인 목적 없이 클래스명을 대량 변경

---

## 12. 오류를 수정할 때의 기준

오류가 보이면 바로 전체 코드를 교체하지 않는다.

먼저 다음 순서로 확인한다.

1. HTML 태그가 제대로 닫혀 있는가?
2. CSS 선택자에 쉼표나 점이 빠지지 않았는가?
3. CSS 속성 문법이 잘못되지 않았는가?
4. 파일명과 경로의 대소문자가 실제 폴더와 같은가?
5. GitHub Pages에서 상대 경로가 정상인가?
6. `position: absolute` 요소의 기준 부모에 `position: relative`가 있는가?
7. `width: 100%` 요소가 부모 너비를 정상적으로 기준으로 삼고 있는가?
8. `default.css`가 정상적으로 불러와지고 있는가?

특히 GitHub Pages에서는 파일과 폴더명의 대소문자를 구분하므로 다음과 같은 차이를 주의한다.

```text
CSS/default.css
css/default.css
```

현재 실제 폴더는 `CSS`이므로 로그인 페이지에서는 다음 경로를 사용한다.

```html
<link rel="stylesheet" href="../CSS/default.css">
```

---

## 13. 코드를 수정한 뒤 확인할 것

새 화면 또는 수정 화면을 완료하기 전에 다음을 확인한다.

- [ ] HTML 구조가 기존 로그인 화면과 필요 이상으로 달라지지 않았는가?
- [ ] 상대 경로가 실제 파일 구조와 일치하는가?
- [ ] 폰트 CSS가 정상 연결되는가?
- [ ] 이미지와 SVG가 정상 표시되는가?
- [ ] 이메일/비밀번호 input이 부모 폭 안에서 정상적으로 늘어나는가?
- [ ] 눈 아이콘이 비밀번호 input 안에 위치하는가?
- [ ] 자동로그인/아이디 저장 체크박스가 정상 표시되는가?
- [ ] 로그인 버튼이 가로 폭에 맞게 늘어나는가?
- [ ] 로그인 보조 링크가 깨지지 않는가?
- [ ] SNS 구분선과 아이콘이 정상 배치되는가?
- [ ] 360px 화면에서 가로 스크롤이 생기지 않는가?
- [ ] 390px 화면에서 배치가 깨지지 않는가?
- [ ] 768px 화면에서 불필요하게 요소가 겹치지 않는가?
- [ ] 1024px 화면에서 의도한 넓은 레이아웃이 유지되는가?
- [ ] GitHub Pages에서도 CSS/폰트/이미지 경로가 정상인가?

---

## 14. AI 작업 응답 방식

이 저장소를 수정할 때 AI는 가능하면 다음 순서로 설명한다.

### 1. 현재 코드에서 확인한 부분

무엇이 이미 잘 작성되어 있는지 먼저 확인한다.

### 2. 다시 생각하거나 수정해야 하는 부분

문제 위치를 클래스명이나 코드 기준으로 구체적으로 설명한다.

### 3. 수정 이유

단순히 "더 예쁘게"가 아니라 레이아웃, 반응형, 의미 구조, 파일 경로 등의 이유를 설명한다.

### 4. 실제 수정

필요한 범위만 수정한다.

### 5. 수정 후 확인

경로, 반응형, 이미지, 폰트 연결 상태를 다시 확인한다.

---

## 15. 기준 코드의 역할

현재 `king/login.html`은 완전히 새로운 방식으로 대체해야 하는 샘플이 아니라, 이후 브랜드 로그인 UI 제작에서 **HTML/CSS 구조를 재사용하기 위한 기준 코드**이다.

따라서 새 브랜드를 제작할 때 목표는 다음과 같다.

> 버거킹 UI의 구조와 학습한 코딩 방식을 유지하면서, 브랜드에 따라 필요한 디자인 요소만 변경한다.

AI는 이 기준을 우선하여 작업한다.

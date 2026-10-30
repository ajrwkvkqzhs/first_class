# 원강금속 리뉴얼 메인페이지

피그마의 [전체 메인 프레임 33:43](https://www.figma.com/design/PEBV3D0WA6ZmD4UyFLXlRv/?node-id=33-43)을 기존 HTML/CSS/JavaScript와 Swiper로 구현했습니다.

사업 소개 01·02·03 장면에는 CSS `scroll-snap-type: y proximity`를 사용합니다. 고정형 콘텐츠와 별도로 실제 스크롤 좌표에 정렬 지점을 배치했으며, 강제 스냅이 아닌 근접 스냅을 적용합니다. 모션 감소 설정에서는 비활성화됩니다. 숫자 실적 고정과 기타 섹션에는 별도의 스냅 지점을 만들지 않습니다.

2026-10-29 현재 주요 사업 소개는 **겹치는 카드가 아닌 스크롤 연동 장면 전환** 방식입니다. 한 화면에서 기존 글자·사진과 새 글자·사진이 겹치며 움직이고 투명도를 교차시킵니다. 배경은 원래의 흰색·연회색·파란색을 유지하면서 서서히 혼합하고, 카드 경계·그림자는 제거한 상태입니다. 전환 전후 여유 구간도 유지합니다. 모션 감소 설정에서는 3개 사업을 순서대로 표시합니다. 아래의 기존 카드 비교·캡처 보고서는 이전 구현의 기록입니다.

- [메인페이지](index.html)
- [요약과 구현 보고서](reports/renewal-report.md)
- [캡처가 포함된 보고서](reports/renewal-report.html)
- [검증 결과](reports/verification.json)
- [스크롤 카드·CTA 호버·사진 등장 인터랙션 수정 결과](reports/interactions-20261029.md)
- [HTML 구조 평가·메뉴 정렬 수정 결과](reports/html-review-20261029.md)
- [반응형 오류 수정·보류 항목](reports/responsive-fixes-20261029.md)
- [사업 카드 디자인 대안·레퍼런스 비교](reports/card-slider-options-20261029.md)

제품 CTA 4분할 영역은 데스크톱(4열·충분한 화면 높이)에서 약 180~260px 분량만큼 잠시 고정해 버튼과 제품 정보를 살펴볼 여유를 줍니다. 모바일·태블릿의 1~2열 레이아웃과 모션 감소 설정에서는 고정하지 않습니다. 인증서는 데스크톱에서 마우스 호버만으로 펼쳐지고, 클릭 시 확대합니다. 키보드·모바일 선택 기능은 유지합니다.

실적 숫자(`1988 / 359.9억 / 1,000t`) 영역은 화면에 도달한 뒤 약 480~660px 분량 동안 프레임을 잠시 고정합니다. 휠 입력을 차단하지 않는 CSS sticky 방식이며, 모션 감소 설정과 낮은 화면에서는 일반 스크롤로 표시합니다. 기존 숫자 릴 애니메이션과 배경 디자인은 유지합니다.

저장소 루트를 정적 서버로 실행한 뒤 `/wonkang/`을 열면 됩니다. GitHub Pages에서도 동일한 상대 경로를 사용합니다. 문의 버튼은 하단 연락처로 이동하거나 전화 앱을 열며, 카탈로그와 개인정보 취급방침 원문은 자료 제공 후 연결할 수 있습니다.

확인되지 않은 이메일 주소는 페이지에서 제거했습니다. 회사에서 확인한 이메일을 받기 전까지 메일 발송 기능은 제공하지 않습니다.

CI 소개(`company/ci.html`)와 생산거점(`factory/locations.html`)은 사용자 요청에 따라 임시 경로만 연결했습니다. 준비 중 안내와 메인 복귀 링크만 있으며, 상세 콘텐츠와 기능은 현재 제작 범위에서 제외합니다.

## 브라우저 검증 재실행

Playwright와 Microsoft Edge가 설치된 환경에서 저장소 루트에서 실행합니다. 검증 스크립트는 자체 로컬 서버를 임시 포트에서 실행하고 종료합니다.

```powershell
node wonkang/tests/smoke.cjs
```

Playwright가 다른 위치에 설치되어 있다면 `PLAYWRIGHT_MODULE`에 모듈 경로를 지정할 수 있습니다. 브라우저는 `PLAYWRIGHT_CHANNEL` 환경변수로 변경할 수 있습니다. 결과는 `reports/verification.json`에 저장됩니다.

추가한 Noto Sans KR Light는 기존 폰트와 같은 배포 저장소의 [원본 파일](https://github.com/HelloWorld017/typeface-notosans-kr/blob/master/fonts/noto-sans-kr-v8-korean_latin-300.woff2)을 사용합니다. [SIL OFL 라이선스](../font/OFL-NotoSansKR.txt)를 따릅니다.

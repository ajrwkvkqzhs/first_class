# 원강금속 리뉴얼 메인페이지

피그마의 [전체 메인 프레임 33:43](https://www.figma.com/design/PEBV3D0WA6ZmD4UyFLXlRv/?node-id=33-43)을 기존 HTML/CSS/JavaScript와 Swiper로 구현했습니다.

- [메인페이지](index.html)
- [요약과 구현 보고서](reports/renewal-report.md)
- [캡처가 포함된 보고서](reports/renewal-report.html)
- [검증 결과](reports/verification.json)

저장소 루트를 정적 서버로 실행한 뒤 `/wonkang/`을 열면 됩니다. GitHub Pages에서도 동일한 상대 경로를 사용합니다. 문의 버튼은 메일 앱·전화 앱을 열며, 카탈로그와 개인정보 취급방침 원문은 자료 제공 후 연결할 수 있습니다.

## 브라우저 검증 재실행

Playwright와 Microsoft Edge가 설치된 환경에서 저장소 루트에서 실행합니다. 검증 스크립트는 자체 로컬 서버를 임시 포트에서 실행하고 종료합니다.

```powershell
node wonkang/tests/smoke.cjs
```

Playwright가 다른 위치에 설치되어 있다면 `PLAYWRIGHT_MODULE`에 모듈 경로를 지정할 수 있습니다. 브라우저는 `PLAYWRIGHT_CHANNEL` 환경변수로 변경할 수 있습니다. 결과는 `reports/verification.json`에 저장됩니다.

추가한 Noto Sans KR Light는 기존 폰트와 같은 배포 저장소의 [원본 파일](https://github.com/HelloWorld017/typeface-notosans-kr/blob/master/fonts/noto-sans-kr-v8-korean_latin-300.woff2)을 사용합니다. [SIL OFL 라이선스](../font/OFL-NotoSansKR.txt)를 따릅니다.

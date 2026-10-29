# 원강금속 UI 개선판

원본과 별도로 Impeccable의 디자인 개선 효과를 비교하기 위한 작업 공간입니다.

**현재는 기준 화면을 복사한 준비본이며, 실제 UI 개선 명령은 사용자 승인 대기 중입니다.**

- [실험 페이지](index.html)
- [기준 사이트](../wonkang/index.html)
- [준비 내용·후보 비교·승인 후 실행 명령](EXPERIMENT.md)
- [범위와 승인 조건](AGENTS.md)
- [설치 버전·기준 파일 해시](experiment/preparation.json)

기존 이미지·폰트·Swiper는 읽기 전용으로 재사용하며, HTML/CSS/JavaScript는 이 폴더의 독립 파일을 사용합니다.

준비 검증에서는 1920·1440·390px 화면의 원본/준비본 차이가 모두 0픽셀이었으며, 자산 로드와 원본 파일 해시도 확인했습니다. [기준선 검증 기록](experiment/baseline-verification.json)과 [PC 기준 화면](experiment/baseline/1440.webp)을 남겼습니다.

Playwright와 Sharp가 있는 개발 환경에서 저장소 루트를 정적 서버로 실행한 후, `node wonkang-ui/experiment/verify-preparation.cjs`로 준비 상태를 검증할 수 있습니다. 별도 모듈 위치는 `PLAYWRIGHT_MODULE`, `SHARP_MODULE`로 지정합니다. 이 검증은 디자인 개선 명령을 실행하지 않습니다.

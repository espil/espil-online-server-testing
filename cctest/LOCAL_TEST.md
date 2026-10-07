# 로컬 테스트 방법 (Local Testing)

Vercel 배포 없이 로컬에서 테스트하기.

## 방법 1: Python (추천)
```bash
cd cctest
python3 -m http.server 8000
```
브라우저에서 http://localhost:8000 열기

## 방법 2: Node
```bash
cd cctest
npx serve .
```

## 방법 3: 그냥 파일 열기
`cctest/index.html`을 브라우저로 직접 열기 (일부 기능 제한될 수 있음)

## 에이전트용 (Roman)
VM에서 로컬 서버 실행 후 브라우저 스크린샷으로 확인:
```bash
cd ~/workspace/ts-spaces/teaser-page/cctest
python3 -m http.server 8000 &
```
그 후 browser task로 http://localhost:8000 스크린샷 (같은 VM 네트워크여야 함).
안 되면 headless chromium으로 직접 캡처.

# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code (claude.ai/code)를 위한 가이드를 제공합니다.

## 저장소 개요

"sandwitch-UI"라는 이름의 새로운 저장소로, VS Code 워크스페이스 프로젝트로 보입니다. 현재 최소한의 구조로 초기 상태에 있습니다.

## 현재 상태

- 디자이너를 위한 UI 목업 및 프로토타이핑 도구로 개발 완료되었습니다
- HTML, CSS, JavaScript로 구성된 완전한 웹 애플리케이션입니다
- 드래그앤드롭, 컴포넌트 라이브러리, 협업 기능 등이 포함되어 있습니다
- `sandwitch-UI.code-workspace`에 VS Code 워크스페이스 구성이 있습니다

## 개발 설정

이 프로젝트는 순수 HTML, CSS, JavaScript로 구축된 UI 목업 도구입니다.

### 실행 방법
```bash
# 방법 1: Python HTTP 서버 사용
npm start

# 방법 2: 직접 Python 서버 실행
python -m http.server 8080

# 방법 3: Live Server 확장 프로그램 사용 (VS Code)
# index.html 우클릭 > Open with Live Server
```

### 주요 기능
- **와이어프레임 모드**: 기본 도형을 이용한 빠른 레이아웃 구성
- **목업 모드**: 실제 UI 컴포넌트를 이용한 디테일한 목업 제작
- **프로토타입 모드**: 인터랙티브 프로토타입 생성
- **협업 기능**: 코멘트, 피드백, 버전 관리
- **드래그앤드롭**: 컴포넌트를 캔버스로 바로 추가
- **속성 편집**: 선택된 요소의 스타일과 속성 실시간 수정
- **내보내기**: JSON 형식으로 프로젝트 저장 및 공유

### 파일 구조
```
/
├── index.html          # 메인 HTML 파일
├── css/
│   ├── style.css       # 기본 스타일
│   └── components.css  # 컴포넌트 스타일
├── js/
│   ├── app.js          # 메인 애플리케이션 로직
│   ├── components.js   # 컴포넌트 관리
│   ├── canvas.js       # 캔버스 및 드로잉 기능
│   └── collaboration.js # 협업 기능
└── package.json        # 프로젝트 설정
```

### 기술 스택
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Flexbox, Grid)
- **Storage**: LocalStorage
- **No Dependencies**: 외부 라이브러리 없이 순수 웹 기술로 구현

## 참고사항

- 프로젝트가 완전히 구현되었으며 바로 사용 가능합니다
- 외부 의존성이 없어 어떤 웹 서버에서도 실행 가능합니다
- LocalStorage를 사용하므로 데이터는 브라우저에 저장됩니다
- 실제 서비스 환경에서는 서버 연동이 필요합니다 (실시간 협업, 파일 저장 등)
// 특강 대시보드 관리 클래스
class DashboardManager {
    constructor() {
        this.lectureId = null;
        this.lecture = null;
        this.competencyCards = [];
        this.init();
    }

    init() {
        // 로그인 상태 확인
        this.checkLoginStatus();

        // URL 파라미터에서 lectureId 추출
        this.extractLectureId();

        // 특강 정보 로드
        this.loadLectureInfo();

        // 역량 카드 데이터 로드
        this.loadCompetencyCards();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 역량 카드 렌더링
        this.renderCompetencyCards();

        // 로딩 완료 - 컨텐츠 표시
        this.hideLoading();
    }

    /**
     * 로그인 상태 확인
     */
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('sandwitchUI_loggedIn');
        if (!isLoggedIn) {
            window.location.href = 'index.html';
        }
    }

    /**
     * URL 파라미터에서 lectureId 추출
     */
    extractLectureId() {
        const urlParams = new URLSearchParams(window.location.search);
        this.lectureId = parseInt(urlParams.get('lectureId'));

        if (!this.lectureId) {
            this.hideLoading();
            this.showError('특강 정보를 찾을 수 없습니다.');
            setTimeout(() => {
                window.location.href = 'waiting-room.html';
            }, 2000);
        }
    }

    /**
     * 특강 정보 로드
     */
    loadLectureInfo() {
        // waiting-room.js의 lectures 데이터와 동일한 구조 사용
        // 실제로는 서버 API 호출
        const lectures = [
            {
                id: 1,
                title: '생성형 AI 활용 가이드',
                description: 'ChatGPT, Claude 등 생성형 AI 도구를 활용한 실무 프로젝트',
                institution: '한국대학교 컴퓨터공학과',
                instructor: '김교수',
                date: '2025-12-19',
                time: '14:00 - 16:00',
                location: '온라인 (Zoom)',
                accessCode: 'ABC123',
                status: 'ongoing'
            },
            {
                id: 2,
                title: '데이터 분석 기초',
                description: 'Python을 활용한 데이터 분석 및 시각화 기초 강의',
                institution: '서울대학교 통계학과',
                instructor: '이교수',
                date: '2025-12-26',
                time: '10:00 - 12:00',
                location: '본관 301호',
                accessCode: 'XYZ789',
                status: 'upcoming'
            },
            {
                id: 3,
                title: '웹 개발 실전',
                description: 'React와 Node.js를 활용한 풀스택 웹 개발',
                institution: '연세대학교 정보산업공학과',
                instructor: '박교수',
                date: '2025-12-15',
                time: '15:00 - 17:00',
                location: '공학관 205호',
                accessCode: 'DEF456',
                status: 'cancelled'
            },
            {
                id: 4,
                title: '머신러닝 입문',
                description: 'Scikit-learn과 TensorFlow를 활용한 머신러닝 기초부터 실전까지',
                institution: '고려대학교 인공지능학과',
                instructor: '최교수',
                date: '2025-12-10',
                time: '13:00 - 15:00',
                location: '과학관 401호',
                accessCode: 'GHI789',
                status: 'ended'
            },
            {
                id: 5,
                title: '클라우드 컴퓨팅 기초',
                description: 'AWS, Azure 등 클라우드 플랫폼 활용 및 인프라 구축',
                institution: '성균관대학교 소프트웨어학과',
                instructor: '정교수',
                date: '2025-11-28',
                time: '11:00 - 13:00',
                location: '온라인 (Zoom)',
                accessCode: 'JKL012',
                status: 'ended'
            },
            {
                id: 6,
                title: '모바일 앱 개발',
                description: 'React Native를 활용한 크로스 플랫폼 모바일 앱 개발',
                institution: '한양대학교 컴퓨터소프트웨어학부',
                instructor: '강교수',
                date: '2026-01-08',
                time: '14:00 - 16:00',
                location: '공학관 101호',
                accessCode: 'MNO345',
                status: 'upcoming'
            },
            {
                id: 7,
                title: '블록체인 기초',
                description: '이더리움과 스마트 컨트랙트 개발 기초 강의',
                institution: '중앙대학교 정보통신공학과',
                instructor: '윤교수',
                date: '2025-12-23',
                time: '10:00 - 12:00',
                location: '본관 201호',
                accessCode: 'PQR678',
                status: 'upcoming'
            }
        ];

        this.lecture = lectures.find(l => l.id === this.lectureId);

        if (!this.lecture) {
            this.hideLoading();
            this.showError('특강 정보를 찾을 수 없습니다.');
            setTimeout(() => {
                window.location.href = 'waiting-room.html';
            }, 2000);
            return;
        }

        // 특강 정보 표시
        this.displayLectureInfo();
    }

    /**
     * 특강 정보 표시
     */
    displayLectureInfo() {
        const titleHeader = document.getElementById('lectureTitleHeader');
        const description = document.getElementById('lectureDescription');
        const instructor = document.getElementById('lectureInstructor');
        const institution = document.getElementById('lectureInstitution');
        const dateTime = document.getElementById('lectureDateTime');
        const location = document.getElementById('lectureLocation');

        if (titleHeader) titleHeader.textContent = this.lecture.title;
        if (description) description.textContent = this.lecture.description;
        if (instructor) instructor.textContent = this.lecture.instructor;
        if (institution) institution.textContent = this.lecture.institution;
        if (dateTime) dateTime.textContent = `${this.lecture.date} ${this.lecture.time}`;
        if (location) location.textContent = this.lecture.location;
    }

    /**
     * 역량 카드 데이터 로드 (하드코딩)
     */
    loadCompetencyCards() {
        this.competencyCards = [
            {
                id: 'pps',
                code: 'PPS',
                name: '프롬프트 문제해결력',
                nameEn: 'Prompt Problem Solving',
                description: '프롬프트 작성 및 문제 해결 과정의 구조화 정도 평가\n"복잡한 문제를 해결하기 위해 AI에게 논리적이고 체계적인 지시(프롬프트)를 설계"',
                mode: 'evaluation', // 'learning' or 'evaluation'
                status: 'done' // 'locked', 'open', 'done'
            },
            {
                id: 'dig',
                code: 'DIG',
                name: '데이터 기반 통찰력',
                nameEn: 'Data Insight Generation',
                description: '데이터를 AI로 분석하고 인사이트를 도출하는 능력\n"코드를 직접 실행하여 데이터를 검증하고, 근거 기반의 실질적인 해결책을 도출"',
                mode: 'learning',
                status: 'open'
            },
            {
                id: 'gcc',
                code: 'GCC',
                name: '생성형 콘텐츠 제작 능력',
                nameEn: 'Generative Content Creation',
                description: '텍스트/이미지/영상 생성 능력\n"상황과 목적에 완벽히 부합하는 결과물을 생성하고, 스타일을 정교하게 최적화"',
                mode: 'learning',
                status: 'locked'
            },
            {
                id: 'wfa',
                code: 'WFA',
                name: '업무자동화·도구활용 능력',
                nameEn: 'Work Flow Automation',
                description: '반복 업무를 AI 및 자동화 도구로 설계하는 능력\n"업무 흐름을 구조화하여, 예외 상황에서도 오류 없이 작동하는 자동화 프로세스를 설계"',
                mode: 'evaluation',
                status: 'locked'
            }
        ];
    }

    /**
     * 역량 카드 렌더링
     */
    renderCompetencyCards() {
        const grid = document.getElementById('competencyGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.competencyCards.forEach(card => {
            const cardElement = this.createCompetencyCard(card);
            grid.appendChild(cardElement);
        });
    }

    /**
     * 개별 역량 카드 생성
     */
    createCompetencyCard(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `competency-card competency-card-${card.status}`;
        cardElement.dataset.competencyId = card.id;
        cardElement.dataset.status = card.status;

        // 상태별 아이콘
        let statusIcon = '';
        let statusText = '';
        if (card.status === 'locked') {
            statusIcon = '<i class="fas fa-lock"></i>';
            statusText = '잠금';
        } else if (card.status === 'open') {
            statusIcon = '<i class="fas fa-unlock"></i>';
            statusText = '진행 가능';
        } else if (card.status === 'done') {
            statusIcon = '<i class="fas fa-check-circle"></i>';
            statusText = '완료';
        }

        // 모드 배지
        const modeBadge = card.mode === 'learning'
            ? '<span class="mode-badge mode-learning"><i class="fas fa-graduation-cap"></i> 학습 모드</span>'
            : '<span class="mode-badge mode-evaluation"><i class="fas fa-clipboard-check"></i> 평가 모드</span>';

        // 워크스페이스 이동 버튼 (Open 상태일 때만)
        const workspaceButton = card.status === 'open'
            ? '<button class="btn-workspace" data-competency-id="' + card.id + '"><i class="fas fa-arrow-right"></i> 워크스페이스 이동</button>'
            : '';

        cardElement.innerHTML = `
            <div class="competency-card-header">
                <div class="competency-header-left">
                    <div class="competency-code">${card.code}</div>
                    <div class="competency-code-fullname">${card.nameEn}</div>
                </div>
                ${modeBadge}
            </div>
            <div class="competency-card-body">
                <h3 class="competency-name">${card.name}</h3>
                <p class="competency-description">${card.description}</p>
            </div>
            <div class="competency-card-footer">
                <div class="status-indicator">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${statusText}</span>
                </div>
                ${workspaceButton}
            </div>
        `;

        // 클릭 이벤트
        cardElement.addEventListener('click', () => {
            this.handleCardClick(card);
        });

        // 워크스페이스 이동 버튼 클릭 이벤트
        const workspaceBtn = cardElement.querySelector('.btn-workspace');
        if (workspaceBtn) {
            workspaceBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 방지
                this.handleWorkspaceClick(card);
            });
        }

        return cardElement;
    }

    /**
     * 카드 클릭 처리
     */
    handleCardClick(card) {
        if (card.status === 'locked') {
            this.showInfo('아직 진행할 수 없습니다. 강사가 활성화할 때까지 기다려주세요.');
            return;
        }

        if (card.status === 'done') {
            this.showInfo('이미 완료되었습니다.');
            return;
        }

        if (card.status === 'open') {
            const modeText = card.mode === 'learning' ? '학습 모드' : '평가 모드';
            this.showInfo(`워크스페이스로 이동합니다. (${card.name} - ${modeText})\n워크스페이스 페이지는 향후 구현 예정입니다.`);
            // TODO: 워크스페이스 페이지로 이동
            // window.location.href = `workspace.html?lectureId=${this.lectureId}&competency=${card.id}`;
        }
    }

    /**
     * 워크스페이스 이동 버튼 클릭 처리
     */
    handleWorkspaceClick(card) {
        const modeText = card.mode === 'learning' ? '학습 모드' : '평가 모드';
        this.showInfo(`워크스페이스로 이동합니다. (${card.name} - ${modeText})\n워크스페이스 페이지는 향후 구현 예정입니다.`);
        // TODO: 워크스페이스 페이지로 이동
        // window.location.href = `workspace.html?lectureId=${this.lectureId}&competency=${card.id}`;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 나가기 버튼
        const exitBtn = document.getElementById('exitBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.handleExit();
            });
        }
    }

    /**
     * 로딩 스피너 숨기기
     */
    hideLoading() {
        const loadingElement = document.getElementById('dashboardLoading');
        const lectureInfoSection = document.getElementById('lectureInfoSection');
        const competencySection = document.getElementById('competencySection');

        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        if (lectureInfoSection) {
            lectureInfoSection.style.display = 'block';
        }
        if (competencySection) {
            competencySection.style.display = 'block';
        }
    }

    /**
     * 대기실로 나가기
     */
    handleExit() {
        window.modalManager.confirm(
            '대기실로 나가시겠습니까?',
            () => {
                window.location.href = 'waiting-room.html';
            },
            null
        );
    }

    // 알림 메서드들
    showError(message) {
        if (!window.modalManager) {
            alert(message);
            return;
        }
        window.modalManager.error(message);
    }

    showInfo(message) {
        if (!window.modalManager) {
            alert(message);
            return;
        }
        window.modalManager.info(message);
    }
}

// 대시보드 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});


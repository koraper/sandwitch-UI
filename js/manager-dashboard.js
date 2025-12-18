// 강사 특강 대시보드 관리 클래스
class ManagerDashboardManager {
    constructor() {
        this.lectureId = null;
        this.lecture = null;
        this.competencyCards = [];
        this.init();
    }

    init() {
        // 로그인 상태 및 권한 확인
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
     * 로그인 상태 및 매니저 권한 확인
     */
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('sandwitchUI_loggedIn');
        const userRole = localStorage.getItem('sandwitchUI_userRole');
        
        if (!isLoggedIn) {
            window.location.href = 'indexmanager.html';
            return;
        }
        
        if (userRole !== 'manager') {
            window.location.href = 'index.html';
            return;
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
                window.location.href = 'manager-waiting-room.html';
            }, 2000);
        }
    }

    /**
     * 특강 정보 로드
     */
    loadLectureInfo() {
        // manager-waiting-room.js의 lectures 데이터와 동일한 구조 사용
        // 실제로는 서버 API 호출
        const lectures = [
            {
                id: 1,
                title: '생성형 AI 활용 가이드',
                description: 'ChatGPT, Claude 등 생성형 AI 도구를 활용한 실무 프로젝트',
                institution: '한국대학교 컴퓨터공학과',
                instructor: '김강사',
                startDate: '2025-12-19T14:00',
                endDate: '2025-12-19T16:00',
                location: '온라인 (Zoom)',
                accessCode: 'ABC123',
                status: 'ongoing',
                participants: 24
            },
            {
                id: 2,
                title: '데이터 분석 기초',
                description: 'Python을 활용한 데이터 분석 및 시각화 기초 강의',
                institution: '서울대학교 통계학과',
                instructor: '김강사',
                startDate: '2025-12-26T10:00',
                endDate: '2025-12-26T12:00',
                location: '본관 301호',
                accessCode: 'XYZ789',
                status: 'upcoming',
                participants: 0
            },
            {
                id: 3,
                title: '웹 개발 실전',
                description: 'React와 Node.js를 활용한 풀스택 웹 개발',
                institution: '연세대학교 정보산업공학과',
                instructor: '김강사',
                startDate: '2025-12-15T15:00',
                endDate: '2025-12-15T17:00',
                location: '공학관 205호',
                accessCode: 'DEF456',
                status: 'ended',
                participants: 32
            },
            {
                id: 4,
                title: '머신러닝 입문',
                description: 'Scikit-learn과 TensorFlow를 활용한 머신러닝 기초',
                institution: '고려대학교 인공지능학과',
                instructor: '김강사',
                startDate: '2025-12-10T13:00',
                endDate: '2025-12-10T15:00',
                location: '과학관 401호',
                accessCode: 'GHI789',
                status: 'ended',
                participants: 28
            },
            {
                id: 5,
                title: '클라우드 컴퓨팅 기초',
                description: 'AWS, Azure 등 클라우드 플랫폼 활용 및 인프라 구축',
                institution: '성균관대학교 소프트웨어학과',
                instructor: '김강사',
                startDate: '2025-12-28T11:00',
                endDate: '2025-12-28T13:00',
                location: '온라인 (Zoom)',
                accessCode: 'JKL012',
                status: 'upcoming',
                participants: 0
            },
            {
                id: 6,
                title: '모바일 앱 개발',
                description: 'React Native를 활용한 크로스 플랫폼 모바일 앱 개발',
                institution: '한양대학교 컴퓨터소프트웨어학부',
                instructor: '김강사',
                startDate: '2026-01-08T14:00',
                endDate: '2026-01-08T16:00',
                location: '공학관 101호',
                accessCode: 'MNO345',
                status: 'upcoming',
                participants: 0
            }
        ];

        this.lecture = lectures.find(l => l.id === this.lectureId);

        if (!this.lecture) {
            this.hideLoading();
            this.showError('특강 정보를 찾을 수 없습니다.');
            setTimeout(() => {
                window.location.href = 'manager-waiting-room.html';
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
        const accessCode = document.getElementById('lectureAccessCode');
        const participants = document.getElementById('lectureParticipants');

        // 날짜 포맷팅
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const formatTime = (startDateStr, endDateStr) => {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            const startHours = String(startDate.getHours()).padStart(2, '0');
            const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
            const endHours = String(endDate.getHours()).padStart(2, '0');
            const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
            return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
        };

        if (titleHeader) titleHeader.textContent = this.lecture.title;
        if (description) description.textContent = this.lecture.description;
        if (instructor) instructor.textContent = this.lecture.instructor;
        if (institution) institution.textContent = this.lecture.institution;
        if (dateTime) dateTime.textContent = `${formatDate(this.lecture.startDate)} ${formatTime(this.lecture.startDate, this.lecture.endDate)}`;
        if (location) location.textContent = this.lecture.location;
        if (accessCode) accessCode.textContent = this.lecture.accessCode;
        if (participants) participants.textContent = `${this.lecture.participants}명`;
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
                mode: 'learning', // 'learning' or 'evaluation' (기본값: learning)
                status: 'locked' // 'locked', 'open', 'done' (기본값: locked)
            },
            {
                id: 'dig',
                code: 'DIG',
                name: '데이터 기반 통찰력',
                nameEn: 'Data Insight Generation',
                description: '데이터를 AI로 분석하고 인사이트를 도출하는 능력\n"코드를 직접 실행하여 데이터를 검증하고, 근거 기반의 실질적인 해결책을 도출"',
                mode: 'learning',
                status: 'locked'
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
                mode: 'learning',
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
        let statusClass = '';
        if (card.status === 'locked') {
            statusIcon = '<i class="fas fa-lock"></i>';
            statusText = '잠금';
            statusClass = 'status-locked';
        } else if (card.status === 'open') {
            statusIcon = '<i class="fas fa-unlock"></i>';
            statusText = '진행 가능';
            statusClass = 'status-open';
        } else if (card.status === 'done') {
            statusIcon = '<i class="fas fa-check-circle"></i>';
            statusText = '완료';
            statusClass = 'status-done';
        }

        // 모드 배지
        let modeBadge = '';
        if (card.mode === 'learning') {
            modeBadge = '<span class="mode-badge mode-learning"><i class="fas fa-graduation-cap"></i> 학습</span>';
        } else if (card.mode === 'evaluation') {
            modeBadge = '<span class="mode-badge mode-evaluation"><i class="fas fa-clipboard-check"></i> 평가</span>';
        } else {
            modeBadge = '<span class="mode-badge mode-unselected"><i class="fas fa-question"></i> 미선택</span>';
        }

        cardElement.innerHTML = `
            <div class="competency-card-header">
                <div class="competency-header-left">
                    <div class="competency-code">${card.code}</div>
                    <div class="competency-code-fullname">${card.nameEn}</div>
                </div>
                <div class="header-badges">
                    <div class="mode-badge-indicator">${modeBadge}</div>
                    <div class="status-indicator ${statusClass}">
                        <span class="status-icon">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
            </div>
            <div class="competency-card-body">
                <h3 class="competency-name">${card.name}</h3>
                <p class="competency-description">${card.description}</p>
            </div>
            <div class="competency-card-divider"></div>
            <div class="competency-mode-section">
                <span class="mode-label">모드를 선택하세요</span>
                <div class="mode-toggle-group">
                    <button class="mode-toggle-btn ${card.mode === 'learning' ? 'active' : ''}" data-mode="learning" data-competency-id="${card.id}">
                        <i class="fas fa-graduation-cap"></i> 학습 모드
                    </button>
                    <button class="mode-toggle-btn ${card.mode === 'evaluation' ? 'active' : ''}" data-mode="evaluation" data-competency-id="${card.id}">
                        <i class="fas fa-clipboard-check"></i> 평가 모드
                    </button>
                </div>
            </div>
            <div class="competency-status-section">
                <span class="mode-label">상태를 선택하세요</span>
                <div class="status-toggle-group">
                    <button class="status-toggle-btn ${card.status === 'locked' ? 'active' : ''}" data-status="locked" data-competency-id="${card.id}">
                        <i class="fas fa-lock"></i> 잠금(Locked)
                    </button>
                    <button class="status-toggle-btn ${card.status === 'open' ? 'active' : ''}" data-status="open" data-competency-id="${card.id}">
                        <i class="fas fa-unlock"></i> 진행 가능(Open)
                    </button>
                    <button class="status-toggle-btn ${card.status === 'done' ? 'active' : ''}" data-status="done" data-competency-id="${card.id}">
                        <i class="fas fa-check-circle"></i> 종료(Done)
                    </button>
                </div>
            </div>
        `;

        // 모드 토글 버튼 클릭 이벤트
        const modeToggleBtns = cardElement.querySelectorAll('.mode-toggle-btn');
        modeToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newMode = btn.dataset.mode;
                this.handleModeChange(card, newMode, cardElement);
            });
        });

        // 상태 토글 버튼 클릭 이벤트
        const statusToggleBtns = cardElement.querySelectorAll('.status-toggle-btn');
        statusToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newStatus = btn.dataset.status;
                this.handleStatusChange(card, newStatus, cardElement);
            });
        });

        return cardElement;
    }

    /**
     * 모드 변경 처리
     */
    handleModeChange(card, newMode, cardElement) {
        const modeText = newMode === 'learning' ? '학습 모드' : '평가 모드';
        
        // 상태 변경
        const cardData = this.competencyCards.find(c => c.id === card.id);
        if (cardData) {
            cardData.mode = newMode;
        }
        
        // 버튼 상태 업데이트
        const toggleBtns = cardElement.querySelectorAll('.mode-toggle-btn');
        toggleBtns.forEach(btn => {
            if (btn.dataset.mode === newMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 헤더 모드 배지 업데이트
        const modeBadgeIndicator = cardElement.querySelector('.mode-badge-indicator');
        if (modeBadgeIndicator) {
            let modeBadge = '';
            if (newMode === 'learning') {
                modeBadge = '<span class="mode-badge mode-learning"><i class="fas fa-graduation-cap"></i> 학습</span>';
            } else if (newMode === 'evaluation') {
                modeBadge = '<span class="mode-badge mode-evaluation"><i class="fas fa-clipboard-check"></i> 평가</span>';
            }
            modeBadgeIndicator.innerHTML = modeBadge;
        }
        
        this.showInfo(`"${card.name}" 역량이 ${modeText}로 변경되었습니다.`);
    }

    /**
     * 상태 변경 처리
     */
    handleStatusChange(card, newStatus, cardElement) {
        const statusTextMap = {
            'locked': 'Locked (입장 불가)',
            'open': 'Open (입장 허용)',
            'done': 'Done (종료)'
        };
        const statusText = statusTextMap[newStatus];
        
        // 상태 변경
        const cardData = this.competencyCards.find(c => c.id === card.id);
        if (cardData) {
            cardData.status = newStatus;
        }
        
        // 버튼 상태 업데이트
        const toggleBtns = cardElement.querySelectorAll('.status-toggle-btn');
        toggleBtns.forEach(btn => {
            if (btn.dataset.status === newStatus) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 헤더 상태 표시 업데이트
        const statusIndicator = cardElement.querySelector('.status-indicator');
        if (statusIndicator) {
            let statusIcon = '';
            let statusLabel = '';
            let statusClass = '';
            if (newStatus === 'locked') {
                statusIcon = '<i class="fas fa-lock"></i>';
                statusLabel = '잠금';
                statusClass = 'status-locked';
            } else if (newStatus === 'open') {
                statusIcon = '<i class="fas fa-unlock"></i>';
                statusLabel = '진행 가능';
                statusClass = 'status-open';
            } else if (newStatus === 'done') {
                statusIcon = '<i class="fas fa-check-circle"></i>';
                statusLabel = '완료';
                statusClass = 'status-done';
            }
            statusIndicator.className = `status-indicator ${statusClass}`;
            statusIndicator.innerHTML = `
                <span class="status-icon">${statusIcon}</span>
                <span class="status-text">${statusLabel}</span>
            `;
        }

        // 카드 클래스 업데이트
        cardElement.className = `competency-card competency-card-${newStatus}`;
        
        this.showInfo(`"${card.name}" 역량 상태가 ${statusText}로 변경되었습니다.`);
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

        // 새로고침 버튼
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.handleRefresh();
            });
        }
    }

    /**
     * 새로고침 처리
     */
    handleRefresh() {
        // 로딩 표시
        const loadingElement = document.getElementById('dashboardLoading');
        const lectureInfoSection = document.getElementById('lectureInfoSection');
        const competencySection = document.getElementById('competencySection');

        if (loadingElement) loadingElement.style.display = 'flex';
        if (lectureInfoSection) lectureInfoSection.style.display = 'none';
        if (competencySection) competencySection.style.display = 'none';

        // 역량 카드 데이터 다시 로드 (실제로는 서버 API 호출)
        this.loadCompetencyCards();
        this.renderCompetencyCards();

        // 로딩 숨김
        setTimeout(() => {
            this.hideLoading();
        }, 500); // 짧은 딜레이로 새로고침 효과 표시
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
                window.location.href = 'manager-waiting-room.html';
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

// 강사 대시보드 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.managerDashboardManager = new ManagerDashboardManager();
});


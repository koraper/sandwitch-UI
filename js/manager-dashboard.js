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

        // 관리 버튼들 (강사 전용)
        let actionButtons = '';
        if (card.status === 'locked') {
            actionButtons = `<button class="btn-unlock" data-competency-id="${card.id}"><i class="fas fa-unlock"></i> 잠금 해제</button>`;
        } else if (card.status === 'open') {
            actionButtons = `
                <button class="btn-lock" data-competency-id="${card.id}"><i class="fas fa-lock"></i> 잠금</button>
                <button class="btn-workspace" data-competency-id="${card.id}"><i class="fas fa-arrow-right"></i> 워크스페이스</button>
            `;
        } else if (card.status === 'done') {
            actionButtons = `<button class="btn-view-results" data-competency-id="${card.id}"><i class="fas fa-chart-bar"></i> 결과 보기</button>`;
        }

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
                <div class="manager-actions">
                    ${actionButtons}
                </div>
            </div>
        `;

        // 잠금 해제 버튼 클릭 이벤트
        const unlockBtn = cardElement.querySelector('.btn-unlock');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleUnlock(card);
            });
        }

        // 잠금 버튼 클릭 이벤트
        const lockBtn = cardElement.querySelector('.btn-lock');
        if (lockBtn) {
            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLock(card);
            });
        }

        // 워크스페이스 이동 버튼 클릭 이벤트
        const workspaceBtn = cardElement.querySelector('.btn-workspace');
        if (workspaceBtn) {
            workspaceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleWorkspaceClick(card);
            });
        }

        // 결과 보기 버튼 클릭 이벤트
        const viewResultsBtn = cardElement.querySelector('.btn-view-results');
        if (viewResultsBtn) {
            viewResultsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleViewResults(card);
            });
        }

        return cardElement;
    }

    /**
     * 잠금 해제 처리
     */
    handleUnlock(card) {
        window.modalManager.confirm(
            `"${card.name}" 역량을 학생들에게 활성화하시겠습니까?`,
            () => {
                // 상태 변경
                const cardData = this.competencyCards.find(c => c.id === card.id);
                if (cardData) {
                    cardData.status = 'open';
                }
                
                // UI 업데이트
                this.renderCompetencyCards();
                this.showInfo(`"${card.name}" 역량이 활성화되었습니다.`);
            },
            null
        );
    }

    /**
     * 잠금 처리
     */
    handleLock(card) {
        window.modalManager.confirm(
            `"${card.name}" 역량을 잠그시겠습니까?`,
            () => {
                // 상태 변경
                const cardData = this.competencyCards.find(c => c.id === card.id);
                if (cardData) {
                    cardData.status = 'locked';
                }
                
                // UI 업데이트
                this.renderCompetencyCards();
                this.showInfo(`"${card.name}" 역량이 잠금 처리되었습니다.`);
            },
            null
        );
    }

    /**
     * 워크스페이스 이동 버튼 클릭 처리
     */
    handleWorkspaceClick(card) {
        const modeText = card.mode === 'learning' ? '학습 모드' : '평가 모드';
        this.showInfo(`워크스페이스로 이동합니다. (${card.name} - ${modeText})\n워크스페이스 페이지는 향후 구현 예정입니다.`);
        // TODO: 워크스페이스 페이지로 이동
        // window.location.href = `manager-workspace.html?lectureId=${this.lectureId}&competency=${card.id}`;
    }

    /**
     * 결과 보기 처리
     */
    handleViewResults(card) {
        this.showInfo(`"${card.name}" 역량 평가 결과를 확인합니다.\n결과 페이지는 향후 구현 예정입니다.`);
        // TODO: 결과 페이지로 이동
        // window.location.href = `manager-results.html?lectureId=${this.lectureId}&competency=${card.id}`;
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


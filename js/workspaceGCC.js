// 워크스페이스 관리 클래스
class WorkspaceManager {
    constructor() {
        this.scenarioData = null;
        this.currentTask = null;
        this.currentTaskNumber = 1; // 현재 선택된 과제 번호
        this.currentSessionId = 1;
        this.chatHistory = [];
        this.outputData = {};
        this.isEvaluationMode = false;
        this.timerInterval = null;
        this.remainingMinutes = 0;
        this.init();
    }

    init() {
        // URL 파라미터 파싱
        this.parseUrlParams();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 시나리오 로드
        this.loadScenario();
    }

    /**
     * URL 파라미터 파싱
     */
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.assignmentId = urlParams.get('assignmentId');
        this.competencyCode = urlParams.get('competency') || 'GCC';
        this.mode = urlParams.get('mode') || '평가모드';
        this.lectureId = urlParams.get('lectureId');

        // 시나리오 파일 경로 결정
        if (this.assignmentId) {
            // LocalStorage에서 과제 로드
            this.loadFromLocalStorage();
        } else {
            // 기본 시나리오 파일 경로
            this.scenarioPath = this.getDefaultScenarioPath();
        }
    }

    /**
     * LocalStorage에서 과제 로드
     */
    loadFromLocalStorage() {
        const assignments = JSON.parse(localStorage.getItem('sandwitchUI_assignments') || '[]');
        const assignment = assignments.find(a => a.id === this.assignmentId);

        if (assignment) {
            this.scenarioData = assignment;
            this.mode = assignment.docMetadata?.mode || this.mode;
            this.competencyCode = assignment.docMetadata?.competency?.code || this.competencyCode;
        } else {
            // LocalStorage에 없으면 기본 시나리오 파일 사용
            this.scenarioPath = this.getDefaultScenarioPath();
        }
    }

    /**
     * 기본 시나리오 파일 경로 가져오기
     */
    getDefaultScenarioPath() {
        const competency = this.competencyCode || 'GCC';
        const mode = this.mode || '평가모드';
        const modeFile = mode === '학습모드'
            ? `${competency}_학습모드_시나리오.json`
            : `${competency}_평가모드_시나리오.json`;
        // 소문자 디렉토리 경로 사용 (task/gcc/, task/dig/ 등)
        return `task/${competency.toLowerCase()}/${modeFile}`;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 뒤로가기 버튼
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.lectureId) {
                    window.location.href = `dashboard.html?lectureId=${this.lectureId}`;
                } else {
                    window.location.href = 'dashboard.html';
                }
            });
        }

        // 상태 배지 클릭 이벤트
        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.addEventListener('click', () => {
                this.toggleMode();
            });
            statusBadge.style.cursor = 'pointer';
        }

        // 패널 토글 버튼 (리사이즈 핸들 위에 위치)
        const toggleLeftPanelBtn = document.getElementById('toggleLeftPanelBtn');
        if (toggleLeftPanelBtn) {
            toggleLeftPanelBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 리사이즈 핸들 이벤트와 충돌 방지
                this.toggleLeftPanel();
            });
        }

        const toggleRightPanelBtn = document.getElementById('toggleRightPanelBtn');
        if (toggleRightPanelBtn) {
            toggleRightPanelBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 리사이즈 핸들 이벤트와 충돌 방지
                this.toggleRightPanel();
            });
        }

        // 리사이즈 핸들은 renderWorkspace() 후에 설정됨
    }

    /**
     * 리사이즈 핸들 설정 (좌측 및 우측 모두)
     */
    setupResizeHandle() {
        this.setupLeftResizeHandle();
        this.setupRightResizeHandle();
    }

    /**
     * 좌측 패널 리사이즈 핸들 설정
     */
    setupLeftResizeHandle() {
        const resizeHandle = document.getElementById('resizeHandle');
        const leftPanel = document.querySelector('.workspace-left-panel');

        if (!resizeHandle || !leftPanel) {
            console.warn('리사이즈 핸들 또는 좌측 패널을 찾을 수 없습니다.');
            return;
        }

        // 이미 설정되어 있으면 중복 방지
        if (resizeHandle.dataset.initialized === 'true') {
            return;
        }
        resizeHandle.dataset.initialized = 'true';

        // 저장된 넓이 불러오기
        const savedWidth = localStorage.getItem('workspace_left_panel_width');
        if (savedWidth) {
            const width = parseInt(savedWidth);
            if (width >= 300 && width <= window.innerWidth * 0.6) {
                leftPanel.style.width = `${width}px`;
            }
        }

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        const handleMouseDown = (e) => {
            // 버튼 클릭 시 리사이즈 시작하지 않음
            if (e.target.closest('.btn-panel-toggle-on-handle')) {
                return;
            }

            isResizing = true;
            startX = e.clientX;
            startWidth = leftPanel.offsetWidth;

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.body.style.pointerEvents = 'none';

            // 리사이즈 중임을 표시
            resizeHandle.classList.add('resizing');
            leftPanel.style.transition = 'none';

            e.preventDefault();
            e.stopPropagation();
        };

        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const diff = e.clientX - startX;
            const newWidth = startWidth + diff;
            const minWidth = 300;
            const maxWidth = Math.min(window.innerWidth * 0.6, window.innerWidth - 600); // 우측 패널 최소 공간 확보

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                leftPanel.style.width = `${newWidth}px`;
            }
        };

        const handleMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.body.style.pointerEvents = '';

                resizeHandle.classList.remove('resizing');
                leftPanel.style.transition = '';

                // 넓이 저장
                const currentWidth = leftPanel.offsetWidth;
                localStorage.setItem('workspace_left_panel_width', currentWidth.toString());
            }
        };

        const handleDoubleClick = () => {
            leftPanel.style.width = '420px';
            localStorage.setItem('workspace_left_panel_width', '420');
        };

        resizeHandle.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        resizeHandle.addEventListener('dblclick', handleDoubleClick);
    }

    /**
     * 우측 패널 리사이즈 핸들 설정
     */
    setupRightResizeHandle() {
        const resizeHandle2 = document.getElementById('resizeHandle2');
        const rightPanel = document.querySelector('.workspace-right-panel');

        if (!resizeHandle2 || !rightPanel) {
            console.warn('우측 리사이즈 핸들 또는 우측 패널을 찾을 수 없습니다.');
            return;
        }

        // 이미 설정되어 있으면 중복 방지
        if (resizeHandle2.dataset.initialized === 'true') {
            return;
        }
        resizeHandle2.dataset.initialized = 'true';

        // 저장된 넓이 불러오기
        const savedWidth = localStorage.getItem('workspace_right_panel_width');
        if (savedWidth) {
            const width = parseInt(savedWidth);
            if (width >= 300 && width <= window.innerWidth * 0.4) {
                rightPanel.style.width = `${width}px`;
            }
        }

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        const handleMouseDown = (e) => {
            // 버튼 클릭 시 리사이즈 시작하지 않음
            if (e.target.closest('.btn-panel-toggle-on-handle')) {
                return;
            }

            isResizing = true;
            startX = e.clientX;
            startWidth = rightPanel.offsetWidth;

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.body.style.pointerEvents = 'none';

            // 리사이즈 중임을 표시
            resizeHandle2.classList.add('resizing');
            rightPanel.style.transition = 'none';

            e.preventDefault();
            e.stopPropagation();
        };

        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const diff = startX - e.clientX; // 우측 패널은 반대 방향
            const newWidth = startWidth + diff;
            const minWidth = 300;
            const maxWidth = Math.min(window.innerWidth * 0.4, window.innerWidth - 600); // 좌측 패널 최소 공간 확보

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                rightPanel.style.width = `${newWidth}px`;
            }
        };

        const handleMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.body.style.pointerEvents = '';

                resizeHandle2.classList.remove('resizing');
                rightPanel.style.transition = '';

                // 넓이 저장
                const currentWidth = rightPanel.offsetWidth;
                localStorage.setItem('workspace_right_panel_width', currentWidth.toString());
            }
        };

        const handleDoubleClick = () => {
            rightPanel.style.width = '380px';
            localStorage.setItem('workspace_right_panel_width', '380');
        };

        resizeHandle2.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        resizeHandle2.addEventListener('dblclick', handleDoubleClick);
    }

    /**
     * 시나리오 로드
     */
    async loadScenario() {
        try {
            if (this.scenarioData) {
                // 이미 로드된 데이터 사용
                this.processScenarioData();
            } else if (this.scenarioPath) {
                // 파일에서 로드
                const response = await fetch(this.scenarioPath);
                if (!response.ok) {
                    // 시나리오 파일이 없어도 기본 구조는 동작하도록
                    console.warn('시나리오 파일을 불러올 수 없습니다. 기본 구조로 진행합니다.');
                    this.processScenarioDataWithoutFile();
                    return;
                }
                this.scenarioData = await response.json();
                this.processScenarioData();
            } else {
                // 시나리오 파일이 없어도 기본 구조는 동작하도록
                this.processScenarioDataWithoutFile();
            }
        } catch (error) {
            console.error('시나리오 로드 오류:', error);
            // 에러가 발생해도 기본 구조는 동작하도록
            this.processScenarioDataWithoutFile();
        }
    }

    /**
     * 시나리오 파일 없이 기본 구조 처리
     */
    processScenarioDataWithoutFile() {
        // 기본 데이터 구조 생성
        this.scenarioData = {
            tasks: [{
                taskNumber: 1,
                title: 'GCC 워크스페이스',
                objective: '생성형 콘텐츠 제작 능력을 평가합니다.',
                mission: 'AI와 협업하여 콘텐츠를 생성하세요.',
                sessions: [{
                    sessionId: 1,
                    userDisplays: {
                        outputRequirements: {
                            aciRequirements: {
                                format: {
                                    style: '자유 형식',
                                    length: '500 ~ 2000',
                                    requiredSections: []
                                }
                            }
                        }
                    }
                }]
            }]
        };
        this.processScenarioData();
    }

    /**
     * 시나리오 데이터 처리
     */
    processScenarioData() {
        if (!this.scenarioData || !this.scenarioData.tasks || this.scenarioData.tasks.length === 0) {
            // 기본 데이터가 없으면 기본 구조만 표시
            this.renderWorkspaceWithoutData();
            return;
        }

        // 첫 번째 task 사용
        this.currentTask = this.scenarioData.tasks[0];
        this.currentTaskNumber = this.currentTask.taskNumber || 1;

        // 세션이 sessionNumber를 사용하는 경우 currentSessionId 조정
        if (this.currentTask && this.currentTask.sessions && this.currentTask.sessions.length > 0) {
            const firstSession = this.currentTask.sessions[0];
            if (firstSession.sessionNumber && !firstSession.sessionId) {
                this.currentSessionId = firstSession.sessionNumber;
            }
        }

        // 역량 코드 설정 (body에 data 속성 추가)
        if (this.competencyCode) {
            document.body.setAttribute('data-competency', this.competencyCode);
        }

        // UI 렌더링
        this.renderWorkspace();

        // 로딩 숨기기
        const loading = document.getElementById('workspaceLoading');
        const content = document.getElementById('workspaceContent');
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

        // 리사이즈 핸들 설정 (DOM이 렌더링된 후)
        setTimeout(() => {
            this.setupResizeHandle();
            this.restorePanelStates();
        }, 100);
    }

    /**
     * 데이터 없이 워크스페이스 렌더링
     */
    renderWorkspaceWithoutData() {
        // 헤더 업데이트
        const titleEl = document.getElementById('workspaceTitle');
        if (titleEl) {
            titleEl.textContent = 'GCC 워크스페이스';
        }

        // 기본 워크스페이스 렌더링
        this.renderGCCWorkspace();

        // 로딩 숨기기
        const loading = document.getElementById('workspaceLoading');
        const content = document.getElementById('workspaceContent');
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

        // 리사이즈 핸들 설정
        setTimeout(() => {
            this.setupResizeHandle();
            this.restorePanelStates();
        }, 100);
    }

    /**
     * 워크스페이스 렌더링
     */
    renderWorkspace() {
        // 헤더 업데이트
        this.renderHeader();

        // GCC 전용 워크스페이스 렌더링
        if (this.competencyCode === 'GCC') {
            this.renderGCCWorkspace();
        } else {
            this.renderDefaultWorkspace();
        }
    }

    /**
     * 기본 워크스페이스 렌더링 (기존 로직)
     */
    renderDefaultWorkspace() {
        // 좌측 패널 렌더링
        this.renderLeftPanel();

        // 우측 패널 렌더링
        this.renderRightPanel();

        // 탭 설정
        this.setupTabs();
    }

    /**
     * GCC 전용 워크스페이스 렌더링
     */
    renderGCCWorkspace() {
        // 좌측 패널 렌더링
        this.renderLeftPanel();

        // 우측 패널 렌더링
        this.renderRightPanel();

        // GCC 전용 에디터 렌더링
        this.renderOutputEditor();

        // GCC 전용 탭 설정 (미디어 생성 탭 포함)
        this.setupGCCTabs();
    }

    /**
     * 헤더 렌더링
     */
    renderHeader() {
        const titleEl = document.getElementById('workspaceTitle');
        if (titleEl && this.currentTask) {
            titleEl.textContent = this.currentTask.title;
        }

        // 상태 배지 업데이트
        this.updateStatusBadge();
    }

    /**
     * 모드 토글
     */
    toggleMode() {
        this.isEvaluationMode = !this.isEvaluationMode;
        this.updateStatusBadge();

        if (this.isEvaluationMode) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }

    /**
     * 상태 배지 업데이트
     */
    updateStatusBadge() {
        const statusBadge = document.getElementById('statusBadge');
        const timerContainer = document.getElementById('timerContainer');

        if (!statusBadge) return;

        if (this.isEvaluationMode) {
            statusBadge.textContent = '평가 진행 중';
            if (timerContainer) {
                timerContainer.style.display = 'flex';
            }
        } else {
            statusBadge.textContent = '학습 진행 중';
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
        }
    }

    /**
     * 타이머 시작
     */
    startTimer() {
        // 기존 타이머 정지
        this.stopTimer();

        // 제한시간 가져오기
        const timeLimit = this.currentTask?.timeLimit || 60;
        this.remainingMinutes = timeLimit;

        // 타이머 업데이트
        this.updateTimerDisplay();

        // 1분마다 감소
        this.timerInterval = setInterval(() => {
            if (this.remainingMinutes > 0) {
                this.remainingMinutes--;
                this.updateTimerDisplay();
            } else {
                this.stopTimer();
                this.showError('제한시간이 종료되었습니다.');
            }
        }, 60000); // 1분 = 60000ms
    }

    /**
     * 타이머 정지
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 타이머 표시 업데이트
     */
    updateTimerDisplay() {
        const timerText = document.getElementById('timerText');
        if (timerText) {
            const hours = Math.floor(this.remainingMinutes / 60);
            const minutes = this.remainingMinutes % 60;

            if (hours > 0) {
                timerText.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:00`;
            } else {
                timerText.textContent = `${minutes}:00`;
            }

            // 시간이 부족할 때 경고 스타일
            if (this.remainingMinutes <= 10) {
                timerText.classList.add('timer-warning');
            } else {
                timerText.classList.remove('timer-warning');
            }
        }
    }

    /**
     * 좌측 패널 렌더링
     */
    renderLeftPanel() {
        if (this.scenarioData && this.scenarioData.tasks) {
            this.renderTaskList();
            this.renderTaskInfo();
            this.renderSessionInfo();
        }
        this.setupAccordions();
    }

    /**
     * 우측 패널 렌더링
     */
    renderRightPanel() {
        if (this.scenarioData && this.scenarioData.tasks) {
            this.renderOutputRequirementsPanel();
            this.renderScoringTips();
        }
        this.setupRightPanelAccordions();
    }

    /**
     * 어코디언 설정
     */
    setupAccordions() {
        // 과제 목록
        this.setupAccordion('taskListHeader', 'taskListSection', 'taskListSection_collapsed');

        // 과제 목표 및 미션
        this.setupAccordion('taskInfoHeader', 'taskInfoSection', 'taskInfoSection_collapsed');

        // 세션 시나리오
        this.setupAccordion('sessionInfoHeader', 'sessionInfoSection', 'sessionInfoSection_collapsed');
    }

    /**
     * 개별 어코디언 설정 헬퍼 함수
     */
    setupAccordion(headerId, sectionId, storageKey) {
        const header = document.getElementById(headerId);
        const section = document.getElementById(sectionId);

        if (header && section) {
            // 저장된 상태 불러오기
            const isCollapsed = localStorage.getItem(storageKey) === 'true';
            if (isCollapsed) {
                section.classList.add('collapsed');
            }

            header.addEventListener('click', () => {
                section.classList.toggle('collapsed');
                // 상태 저장
                localStorage.setItem(storageKey, section.classList.contains('collapsed'));
            });
        }
    }

    /**
     * 과제 목록 렌더링
     */
    renderTaskList() {
        const container = document.getElementById('taskListContent');
        if (!container || !this.scenarioData || !this.scenarioData.tasks) return;

        const tasks = this.scenarioData.tasks;

        container.innerHTML = tasks.map(task => {
            const isSelected = task.taskNumber === this.currentTaskNumber;
            return `
                <div class="task-list-item ${isSelected ? 'selected' : ''}" 
                     data-task-number="${task.taskNumber}"
                     onclick="window.workspaceManager.selectTask(${task.taskNumber})">
                    <div class="task-number">과제 ${task.taskNumber}</div>
                    <div class="task-title-text">${task.title}</div>
                    ${isSelected ? '<div class="task-selected-badge"><i class="fas fa-check-circle"></i> 현재 과제</div>' : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * 과제 선택
     */
    selectTask(taskNumber) {
        // 과제 변경
        this.currentTaskNumber = taskNumber;
        this.currentTask = this.scenarioData.tasks.find(t => t.taskNumber === taskNumber);

        if (!this.currentTask) return;

        // 세션 ID 초기화
        if (this.currentTask.sessions && this.currentTask.sessions.length > 0) {
            const firstSession = this.currentTask.sessions[0];
            this.currentSessionId = firstSession.sessionNumber || firstSession.sessionId || 1;
        }

        // UI 업데이트
        this.renderTaskList(); // 과제 목록 다시 렌더링 (선택 상태 업데이트)
        this.renderTaskInfo();
        this.renderSessionInfo();
        this.renderOutputRequirementsPanel();

        // 에디터 초기화
        this.renderOutputEditor();

        console.log(`과제 ${taskNumber} 선택됨:`, this.currentTask.title);
    }

    /**
     * 과제 정보 렌더링
     */
    renderTaskInfo() {
        const container = document.getElementById('taskInfoContent');
        if (!container || !this.currentTask) return;

        container.innerHTML = `
            <div class="info-item info-item-objective">
                <label><i class="fas fa-flag-checkered"></i> 목표</label>
                <p class="info-text">${this.currentTask.objective || '-'}</p>
            </div>
            <div class="info-item info-item-mission">
                <label><i class="fas fa-tasks"></i> 핵심 미션</label>
                <p class="info-text">${this.currentTask.mission || '-'}</p>
            </div>
        `;
    }

    /**
     * 채점 팁 렌더링
     */
    renderScoringTips() {
        const container = document.getElementById('scoringTipsContent');
        if (!container || !this.currentTask || !this.currentTask.scoringTips) return;

        if (this.currentTask.scoringTips.length === 0) {
            container.innerHTML = '<p class="empty-text">표시할 핵심 체크포인트가 없습니다.</p>';
            return;
        }

        const tipsHtml = this.currentTask.scoringTips.map((tip, index) => `
            <div class="tip-item">
                <p class="tip-text">${tip.tip || tip}</p>
            </div>
        `).join('');

        container.innerHTML = tipsHtml;
    }

    /**
     * 현재 세션 찾기 헬퍼 함수
     */
    findCurrentSession() {
        if (!this.currentTask || !this.currentTask.sessions) return null;

        return this.currentTask.sessions.find(s =>
            (s.sessionId && s.sessionId === this.currentSessionId) ||
            (s.sessionNumber && s.sessionNumber === this.currentSessionId)
        ) || this.currentTask.sessions[0]; // 없으면 첫 번째 세션 반환
    }

    /**
     * 세션 정보 렌더링
     */
    renderSessionInfo() {
        if (!this.currentTask || !this.currentTask.sessions || this.currentTask.sessions.length === 0) {
            return;
        }

        const sessions = this.currentTask.sessions;

        // 세션이 여러 개일 경우 탭 표시
        if (sessions.length > 1) {
            this.renderSessionTabs(sessions);
        }

        // 현재 세션 정보 표시
        this.renderCurrentSession();
    }

    /**
     * 세션 탭 렌더링
     */
    renderSessionTabs(sessions) {
        const tabsContainer = document.getElementById('sessionTabs');
        if (!tabsContainer) return;

        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = sessions.map((session, index) => {
            // sessionId 또는 sessionNumber 사용
            const sessionIdentifier = session.sessionId || session.sessionNumber || (index + 1);
            const isActive = (session.sessionId && session.sessionId === this.currentSessionId) ||
                (session.sessionNumber && session.sessionNumber === this.currentSessionId) ||
                (!session.sessionId && !session.sessionNumber && (index + 1) === this.currentSessionId);

            return `
                <button class="session-tab ${isActive ? 'active' : ''}" 
                        onclick="window.workspaceManager.switchSession(${sessionIdentifier})">
                    세션 ${sessionIdentifier}
                </button>
            `;
        }).join('');
    }

    /**
     * 세션 전환
     */
    switchSession(sessionId) {
        this.currentSessionId = sessionId;
        this.renderSessionInfo();

        // 에디터 렌더링
        this.renderOutputEditor();

        this.renderOutputRequirementsPanel();
    }

    /**
     * 현재 세션 정보 렌더링
     */
    renderCurrentSession() {
        const container = document.getElementById('sessionContent');
        if (!container || !this.currentTask) return;

        const session = this.findCurrentSession();
        if (!session) return;

        const userDisplays = session.userDisplays || {};

        // 상황 설명 (situation 필드 표시)
        let sessionHtml = '';
        if (userDisplays.situation) {
            sessionHtml = `
                <div class="session-item session-item-situation">
                    <h3 class="session-item-title">
                        <i class="fas fa-info-circle"></i> 비즈니스 상황
                    </h3>
                    <div class="session-item-content">
                        <p class="situation-text">${this.formatText(userDisplays.situation)}</p>
                    </div>
                </div>
            `;
        }

        // 원본 데이터
        if (userDisplays.rawData && userDisplays.rawData.length > 0) {
            sessionHtml += `
                <div class="session-item">
                    <h3 class="session-item-title">
                        <i class="fas fa-database"></i> 제공 데이터 자산
                    </h3>
                    <div class="session-item-content">
                        ${userDisplays.rawData.map(rawData => `
                            <div class="raw-data-item">
                                <div class="raw-data-header">
                                    <strong><i class="fas fa-file-csv"></i> ${rawData.source || '데이터셋'}</strong>
                                </div>
                                <div class="raw-data-content">
                                    <pre class="raw-data-text">${this.formatText(rawData.content || '')}</pre>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = sessionHtml;

        // 출력 요구사항은 우측 패널에 별도로 렌더링
        this.renderOutputRequirementsPanel();
    }

    /**
     * 출력 요구사항 렌더링
     */
    renderOutputRequirements(outputRequirements) {
        let html = `<div class="output-requirements-inner">`;

        // AES 요구사항
        if (outputRequirements.aesRequirements) {
            const aes = outputRequirements.aesRequirements;
            html += `
                <div class="requirement-group aes-requirements">
                    <h4 class="requirement-title">
                        <i class="fas fa-shield-alt"></i> 윤리/보안(AES) 가이드
                    </h4>
                    <p class="requirement-description">${aes.description || ''}</p>
                    <div class="requirement-text">${this.formatText(aes.requirement || '')}</div>
                </div>
            `;
        }

        // ACI 요구사항
        if (outputRequirements.aciRequirements) {
            const aci = outputRequirements.aciRequirements;
            html += `
                <div class="requirement-group aci-requirements">
                    <h4 class="requirement-title">
                        <i class="fas fa-file-signature"></i> 결과물 작성(ACI) 가이드
                    </h4>
            `;

            // 형식 요구사항
            if (aci.format) {
                html += `
                    <div class="format-requirements">
                        <p><strong>작성 형식</strong> <span>${aci.format.style || '-'}</span></p>
                        <p><strong>권장 길이</strong> <span>${aci.format.length || '-'}</span></p>
                    </div>
                `;

                // 필수 섹션
                if (aci.format.requiredSections && aci.format.requiredSections.length > 0) {
                    html += `
                        <div class="required-sections-list">
                            <strong><i class="fas fa-list-ol"></i> 필수 포함 항목</strong>
                            <ul>
                                ${aci.format.requiredSections.map(section => `
                                    <li>
                                        <strong>${section.order}. ${section.title}</strong>
                                        <p>${section.content}</p>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `;
                }
            }

            // 필수 표기 사항
            if (aci.requiredNotation) {
                html += `
                    <div class="required-notation">
                        <strong><i class="fas fa-exclamation-circle"></i> 필수 표기 사항</strong>
                        <p>${aci.requiredNotation.requirement || ''}</p>
                        ${aci.requiredNotation.text ? `<span class="notation-text">${aci.requiredNotation.text}</span>` : ''}
                    </div>
                `;
            }

            // 데이터 신뢰성
            if (aci.dataReliability) {
                html += `
                    <div class="data-reliability">
                        <strong><i class="fas fa-check-double"></i> 데이터 신뢰성</strong>
                        <p>${aci.dataReliability.requirement || ''}</p>
                    </div>
                `;
            }

            // 필수 키워드
            if (aci.requiredKeywords) {
                const keywords = typeof aci.requiredKeywords === 'object' && aci.requiredKeywords.requirement
                    ? aci.requiredKeywords.requirement
                    : (Array.isArray(aci.requiredKeywords) ? aci.requiredKeywords.join(', ') : '');
                if (keywords) {
                    html += `
                        <div class="required-keywords">
                            <strong><i class="fas fa-key"></i> 필수 키워드</strong>
                            <p>${keywords}</p>
                        </div>
                    `;
                }
            }

            // 제약사항 (항상 표시)
            const constraints = aci.constraints
                ? (typeof aci.constraints === 'object' && aci.constraints.constraint
                    ? aci.constraints.constraint
                    : (Array.isArray(aci.constraints) ? aci.constraints.join(', ') : ''))
                : '';

            html += `
                <div class="constraints">
                    <strong><i class="fas fa-ban"></i> 작성 시 주의사항</strong>
                    <p>${constraints || '없음'}</p>
                </div>
            `;

            html += `</div>`;
        }

        html += `</div>`;

        return html;
    }

    /**
     * 출력 요구사항 패널 렌더링
     */
    renderOutputRequirementsPanel() {
        const container = document.getElementById('outputRequirementsContent');
        if (!container || !this.currentTask) return;

        const session = this.findCurrentSession();
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) {
            container.innerHTML = '<p class="empty-text">출력 요구사항이 없습니다.</p>';
            return;
        }

        const html = this.renderOutputRequirements(session.userDisplays.outputRequirements);
        container.innerHTML = html;
    }

    /**
     * 우측 패널 어코디언 설정
     */
    setupRightPanelAccordions() {
        // 출력 요구사항
        this.setupAccordion('outputRequirementsHeader', 'outputRequirementsSection', 'outputRequirementsSection_collapsed');

        // 핵심 체크포인트
        this.setupAccordion('scoringTipsHeader', 'scoringTipsSection', 'scoringTipsSection_collapsed');
    }

    /**
     * 탭 설정
     */
    setupTabs() {
        const chatTab = document.getElementById('chatTab');
        const outputTab = document.getElementById('outputTab');
        const chatPanel = document.getElementById('chatPanel');
        const outputPanel = document.getElementById('outputPanel');

        if (!chatTab || !outputTab) {
            console.error('탭 요소를 찾을 수 없습니다:', { chatTab, outputTab });
            return;
        }

        if (!chatPanel || !outputPanel) {
            console.error('패널을 찾을 수 없습니다:', { chatPanel, outputPanel });
            return;
        }

        // 저장된 활성 탭 불러오기
        const activeTab = localStorage.getItem('workspace_active_tab') || 'chat';
        this.switchTab(activeTab);

        // 이벤트 리스너 제거 (중복 방지)
        if (this.handleChatTabClick) {
            chatTab.removeEventListener('click', this.handleChatTabClick);
        }
        if (this.handleOutputTabClick) {
            outputTab.removeEventListener('click', this.handleOutputTabClick);
        }

        // 이벤트 핸들러 저장
        this.handleChatTabClick = () => this.switchTab('chat');
        this.handleOutputTabClick = () => this.switchTab('output');

        // 탭 클릭 이벤트
        chatTab.addEventListener('click', this.handleChatTabClick);
        outputTab.addEventListener('click', this.handleOutputTabClick);
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        const chatTab = document.getElementById('chatTab');
        const outputTab = document.getElementById('outputTab');
        const mediaTab = document.getElementById('mediaTab');
        const chatPanel = document.getElementById('chatPanel');
        const outputPanel = document.getElementById('outputPanel');
        const mediaPanel = document.getElementById('mediaPanel');

        if (!chatTab || !outputTab || !chatPanel || !outputPanel) {
            console.error('탭 전환 실패 - 요소를 찾을 수 없습니다');
            return;
        }

        // 모든 탭과 패널 비활성화
        chatTab.classList.remove('active');
        outputTab.classList.remove('active');
        if (mediaTab) mediaTab.classList.remove('active');
        chatPanel.classList.remove('active');
        outputPanel.classList.remove('active');
        if (mediaPanel) mediaPanel.classList.remove('active');

        // 선택된 탭과 패널 활성화
        if (tabName === 'chat') {
            chatTab.classList.add('active');
            chatPanel.classList.add('active');
        } else if (tabName === 'output') {
            outputTab.classList.add('active');
            outputPanel.classList.add('active');
        } else if (tabName === 'media' && mediaTab && mediaPanel) {
            mediaTab.classList.add('active');
            mediaPanel.classList.add('active');
        }

        // 상태 저장
        localStorage.setItem('workspace_active_tab', tabName);
    }

    /**
     * 결과물 작성 영역 렌더링
     */
    renderOutputEditor() {
        const container = document.getElementById('outputEditor');
        if (!container || !this.currentTask) {
            // 현재 작업이 없어도 기본 에디터 표시
            container.innerHTML = '<p class="empty-text">과제 정보를 불러오는 중입니다...</p>';
            return;
        }

        const session = this.findCurrentSession();
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) {
            container.innerHTML = '<p class="empty-text">출력 요구사항이 없습니다.</p>';
            return;
        }

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.format || !aci.format.requiredSections) {
            container.innerHTML = '<p class="empty-text">출력 형식이 정의되지 않았습니다.</p>';
            return;
        }

        const format = aci.format;
        const requiredSections = format.requiredSections || [];

        // 길이 제한 파싱
        const lengthMatch = (format.length || '').match(/(\d+)\s*~\s*(\d+)/);
        const minLength = lengthMatch ? parseInt(lengthMatch[1]) : 0;
        const maxLength = lengthMatch ? parseInt(lengthMatch[2]) : 0;

        let editorHtml = `
            <div class="output-editor-info">
                <p><strong><i class="fas fa-file-alt"></i> 형식</strong> ${format.style || '-'}</p>
                <p><strong><i class="fas fa-text-width"></i> 권장 길이</strong> ${format.length || '-'}</p>
            </div>
        `;

        // 섹션별 입력 필드 생성
        requiredSections.forEach((section, index) => {
            const sectionId = `section_${this.currentSessionId}_${section.order}`;
            const savedContent = this.outputData[sectionId] || '';

            editorHtml += `
                <div class="output-section-item">
                    <label class="section-label">
                        ${section.order}. ${section.title}
                        <span class="section-hint">${section.content}</span>
                    </label>
                    <textarea 
                        id="${sectionId}"
                        class="section-input"
                        rows="6"
                        placeholder="${section.content}"
                        oninput="window.workspaceManager.updateOutput('${sectionId}', this.value)"
                    >${savedContent}</textarea>
                </div>
            `;
        });

        // 필수 표기 사항
        if (aci.requiredNotation && aci.requiredNotation.text) {
            editorHtml += `
                <div class="required-notation-display">
                    <strong><i class="fas fa-exclamation-triangle"></i> 필수 포함 표기</strong>
                    <p>${aci.requiredNotation.text}</p>
                </div>
            `;
        }

        // 글자 수 표시
        editorHtml += `
            <div class="output-length-info">
                <span>작성 분량: <span id="outputLength">0</span>자</span>
                ${maxLength > 0 ? `<span class="length-limit">(권장: ${minLength} ~ ${maxLength}자)</span>` : ''}
            </div>
        `;

        container.innerHTML = editorHtml;
        this.updateLengthDisplay();
    }

    /**
     * 출력 데이터 업데이트
     */
    updateOutput(sectionId, value) {
        this.outputData[sectionId] = value;

        // 글자 수 실시간 업데이트
        const lengthDisplay = document.getElementById(`${sectionId}_length`);
        if (lengthDisplay) {
            lengthDisplay.textContent = value.length;
        }

        this.updateLengthDisplay();
    }

    /**
     * 글자 수 표시 업데이트
     */
    updateLengthDisplay() {
        if (!this.currentTask || !this.currentTask.sessions) return;

        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) return;

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.format) return;

        const format = aci.format;
        const requiredSections = format.requiredSections || [];
        let totalLength = 0;

        // 일반 섹션별 입력
        requiredSections.forEach(section => {
            const sectionId = `section_${this.currentSessionId}_${section.order}`;
            const input = document.getElementById(sectionId);
            if (input) {
                totalLength += input.value.length;
            }
        });

        const lengthEl = document.getElementById('outputLength');
        if (lengthEl) {
            lengthEl.textContent = totalLength;

            // 길이 제한 확인
            const lengthMatch = (aci.format.length || '').match(/(\d+)\s*~\s*(\d+)/);
            if (lengthMatch) {
                const minLength = parseInt(lengthMatch[1]);
                const maxLength = parseInt(lengthMatch[2]);

                if (totalLength < minLength) {
                    lengthEl.className = 'length-warning';
                } else if (totalLength > maxLength) {
                    lengthEl.className = 'length-error';
                } else {
                    lengthEl.className = 'length-ok';
                }
            }
        }
    }

    /**
     * AI 메시지 전송
     */
    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        // 사용자 메시지 추가
        this.addChatMessage('user', message);

        // AI 응답 시뮬레이션 (약간의 지연 후)
        setTimeout(() => {
            const aiResponse = this.generateAIResponse(message);
            this.addChatMessage('assistant', aiResponse);
        }, 500);
    }

    /**
     * 채팅 메시지 추가
     */
    addChatMessage(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // 히스토리에 추가
        this.chatHistory.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });

        // UI에 추가
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message chat-message-${role}`;

        const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
        const messageId = `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${this.formatText(content)}</p>
                ${role === 'assistant' ? `
                    <button class="message-copy-btn" onclick="window.workspaceManager.copyMessage('${messageId}')" title="응답 복사">
                        <i class="fas fa-copy"></i> 복사
                    </button>
                ` : ''}
            </div>
        `;

        messageEl.id = messageId;
        messageEl.dataset.content = content;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * 메시지 복사
     */
    copyMessage(messageId) {
        const messageEl = document.getElementById(messageId);
        if (!messageEl) return;

        const content = messageEl.dataset.content || messageEl.querySelector('.message-content p')?.textContent || '';

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content).then(() => {
                const copyBtn = messageEl.querySelector('.message-copy-btn');
                if (copyBtn) {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> 복사됨';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }
                this.showSuccess('메시지가 클립보드에 복사되었습니다.');
            }).catch(err => {
                console.error('복사 실패:', err);
                this.showError('복사에 실패했습니다.');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showSuccess('메시지가 클립보드에 복사되었습니다.');
            } catch (err) {
                console.error('복사 실패:', err);
                this.showError('복사에 실패했습니다.');
            }
            document.body.removeChild(textArea);
        }
    }

    /**
     * AI 응답 생성 (시뮬레이션)
     */
    generateAIResponse(userMessage) {
        const responses = [
            '생성형 콘텐츠 제작에 도움이 되는 프롬프트를 설계하시는 것이 좋겠습니다. 특히 요구사항에 명시된 스타일과 목적을 명확히 전달하세요.',
            '콘텐츠의 목적과 대상 독자를 명확히 정의하면 더 효과적인 결과물을 얻을 수 있습니다.',
            '좋은 접근입니다. 생성된 콘텐츠가 요구사항에 부합하는지 확인하고, 필요시 반복적으로 개선해보세요.',
            '스타일 가이드나 참고 자료를 활용하면 더 일관성 있는 콘텐츠를 생성할 수 있습니다.',
            '필수 포함 사항이 누락되지 않도록 주의해 주세요. 채점 기준에서 중요한 비중을 차지하는 항목입니다.',
            '현재 단계에서 가장 중요한 미션은 무엇인지 다시 한번 상기해보시면 해결의 실마리를 찾으실 수 있을 거예요.',
            '작성 중이신 콘텐츠에 대해 더 구체적인 분석이나 도움이 필요하시면 언제든지 말씀해주세요.'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 결과물 제출
     */
    submitWork() {
        // 검증
        if (!this.validateOutput()) {
            return;
        }

        // 데이터 수집
        const submission = {
            assignmentId: this.assignmentId || 'default',
            competencyCode: this.competencyCode,
            mode: this.mode,
            taskId: this.currentTask?.taskId || 'default',
            sessionId: this.currentSessionId,
            submittedAt: new Date().toISOString(),
            output: this.outputData,
            chatHistory: this.chatHistory,
            scenario: {
                title: this.currentTask?.title || 'GCC 워크스페이스',
                objective: this.currentTask?.objective || '',
                mission: this.currentTask?.mission || ''
            }
        };

        // LocalStorage에 저장
        const submissions = JSON.parse(localStorage.getItem('sandwitchUI_workspace_submissions') || '[]');
        submissions.push(submission);
        localStorage.setItem('sandwitchUI_workspace_submissions', JSON.stringify(submissions));

        // 성공 메시지
        this.showSuccess('결과물이 제출되었습니다.');

        // 대시보드로 이동
        setTimeout(() => {
            if (this.lectureId) {
                window.location.href = `dashboard.html?lectureId=${this.lectureId}`;
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1500);
    }

    /**
     * 결과물 검증
     */
    validateOutput() {
        if (!this.currentTask) {
            return true; // 데이터가 없으면 검증 통과
        }

        const session = this.currentTask.sessions?.find(s => s.sessionId === this.currentSessionId);
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) {
            return true;
        }

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.format) {
            return true;
        }

        const format = aci.format;
        const requiredSections = format.requiredSections || [];

        // 필수 섹션 작성 확인
        for (const section of requiredSections) {
            const sectionId = `section_${this.currentSessionId}_${section.order}`;
            const input = document.getElementById(sectionId);
            if (!input || !input.value.trim()) {
                this.showError(`"${section.title}" 섹션을 작성해주세요.`);
                return false;
            }
        }

        // 길이 제한 확인
        const lengthMatch = (aci.format.length || '').match(/(\d+)\s*~\s*(\d+)/);
        if (lengthMatch) {
            const minLength = parseInt(lengthMatch[1]);
            const maxLength = parseInt(lengthMatch[2]);
            let totalLength = 0;

            requiredSections.forEach(section => {
                const sectionId = `section_${this.currentSessionId}_${section.order}`;
                const input = document.getElementById(sectionId);
                if (input) {
                    totalLength += input.value.length;
                }
            });

            if (totalLength < minLength) {
                this.showError(`최소 ${minLength}자 이상 작성해주세요. (현재: ${totalLength}자)`);
                return false;
            }
            if (totalLength > maxLength) {
                this.showError(`최대 ${maxLength}자 이하로 작성해주세요. (현재: ${totalLength}자)`);
                return false;
            }
        }

        return true;
    }

    /**
     * 텍스트 포맷팅 (줄바꿈 처리)
     */
    formatText(text) {
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    }

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        if (window.modalManager) {
            window.modalManager.error(message);
        } else {
            alert(message);
        }
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        if (window.modalManager) {
            window.modalManager.info(message);
        } else {
            alert(message);
        }
    }

    /**
     * 좌측 패널 토글
     */
    toggleLeftPanel() {
        const leftPanel = document.querySelector('.workspace-left-panel');
        const resizeHandle = document.getElementById('resizeHandle');
        const toggleBtn = document.getElementById('toggleLeftPanelBtn');

        if (!leftPanel) return;

        const isCollapsed = leftPanel.classList.contains('collapsed');

        if (isCollapsed) {
            // 패널 보이기
            leftPanel.classList.remove('collapsed');
            if (resizeHandle) {
                resizeHandle.style.display = 'flex';
                resizeHandle.classList.remove('collapsed');
            }
            if (toggleBtn) {
                toggleBtn.innerHTML = '&#60;';
                toggleBtn.title = '좌측 패널 숨기기';
            }
            localStorage.setItem('workspace_left_panel_collapsed', 'false');
        } else {
            // 패널 숨기기
            leftPanel.classList.add('collapsed');
            if (resizeHandle) {
                resizeHandle.classList.add('collapsed');
            }
            if (toggleBtn) {
                toggleBtn.innerHTML = '&#62;';
                toggleBtn.title = '좌측 패널 보이기';
            }
            localStorage.setItem('workspace_left_panel_collapsed', 'true');
        }
    }

    /**
     * 우측 패널 토글
     */
    toggleRightPanel() {
        const rightPanel = document.querySelector('.workspace-right-panel');
        const resizeHandle2 = document.getElementById('resizeHandle2');
        const toggleBtn = document.getElementById('toggleRightPanelBtn');

        if (!rightPanel) return;

        const isCollapsed = rightPanel.classList.contains('collapsed');

        if (isCollapsed) {
            // 패널 보이기
            rightPanel.classList.remove('collapsed');
            if (resizeHandle2) {
                resizeHandle2.style.display = 'flex';
                resizeHandle2.classList.remove('collapsed');
            }
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                toggleBtn.title = '우측 패널 숨기기';
            }
            localStorage.setItem('workspace_right_panel_collapsed', 'false');
        } else {
            // 패널 숨기기
            rightPanel.classList.add('collapsed');
            if (resizeHandle2) {
                resizeHandle2.classList.add('collapsed');
            }
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                toggleBtn.title = '우측 패널 보이기';
            }
            localStorage.setItem('workspace_right_panel_collapsed', 'true');
        }
    }

    /**
     * 저장된 패널 상태 복원
     */
    restorePanelStates() {
        // 좌측 패널 상태 복원
        const leftPanelCollapsed = localStorage.getItem('workspace_left_panel_collapsed') === 'true';
        const leftPanel = document.querySelector('.workspace-left-panel');
        const resizeHandle = document.getElementById('resizeHandle');
        const toggleLeftBtn = document.getElementById('toggleLeftPanelBtn');

        if (leftPanelCollapsed && leftPanel) {
            leftPanel.classList.add('collapsed');
            if (resizeHandle) {
                resizeHandle.classList.add('collapsed');
            }
            if (toggleLeftBtn) {
                toggleLeftBtn.innerHTML = '&#62;';
                toggleLeftBtn.title = '좌측 패널 보이기';
            }
        }

        // 우측 패널 상태 복원
        const rightPanelCollapsed = localStorage.getItem('workspace_right_panel_collapsed') === 'true';
        const rightPanel = document.querySelector('.workspace-right-panel');
        const resizeHandle2 = document.getElementById('resizeHandle2');
        const toggleRightBtn = document.getElementById('toggleRightPanelBtn');

        if (rightPanelCollapsed && rightPanel) {
            rightPanel.classList.add('collapsed');
            if (resizeHandle2) {
                resizeHandle2.classList.add('collapsed');
            }
            if (toggleRightBtn) {
                toggleRightBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                toggleRightBtn.title = '우측 패널 보이기';
            }
        }
    }

    // ==================== GCC 전용 메서드 ====================

    /**
     * GCC 전용 탭 설정 (미디어 생성 탭 포함)
     */
    setupGCCTabs() {
        // 모든 탭 버튼 가져오기
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        // 각 탭 버튼에 이벤트 리스너 추가
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // 모든 탭 버튼과 패널에서 active 클래스 제거
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // 클릭된 탭 버튼에 active 클래스 추가
                button.classList.add('active');

                // 해당하는 패널에 active 클래스 추가
                const targetPanel = document.getElementById(targetTab + 'Panel');
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // 상태 저장
                localStorage.setItem('workspace_active_tab', targetTab);
            });
        });

        // 저장된 활성 탭 복원
        const savedTab = localStorage.getItem('workspace_active_tab') || 'chat';
        const savedTabButton = document.querySelector(`[data-tab="${savedTab}"]`);
        if (savedTabButton) {
            savedTabButton.click();
        }

        // 미디어 생성 패널 렌더링
        this.renderMediaGenerationPanel();
    }

    /**
     * 미디어 생성 패널 렌더링 (확장 가능한 구조)
     */
    renderMediaGenerationPanel() {
        const container = document.getElementById('mediaGenerationContainer');
        if (!container) return;

        // 미디어 생성 버튼 이벤트 설정
        const imageBtn = document.getElementById('generateImageBtn');
        const textBtn = document.getElementById('generateTextBtn');
        const videoBtn = document.getElementById('generateVideoBtn');

        if (imageBtn) {
            imageBtn.addEventListener('click', () => this.generateMedia('image'));
        }
        if (textBtn) {
            textBtn.addEventListener('click', () => this.generateMedia('text'));
        }
        if (videoBtn) {
            videoBtn.addEventListener('click', () => this.generateMedia('video'));
        }
    }

    /**
     * 미디어 생성 (확장 가능한 구조)
     */
    generateMedia(type) {
        const canvas = document.getElementById('mediaCanvas');
        if (!canvas) return;

        const typeNames = {
            image: '이미지',
            text: '텍스트',
            video: '영상'
        };

        canvas.innerHTML = `
            <div class="media-placeholder">
                <i class="fas fa-${type === 'image' ? 'image' : type === 'text' ? 'font' : 'video'}"></i>
                <h4>${typeNames[type]} 생성</h4>
                <p>AI와 협업하여 ${typeNames[type]}를 생성하세요.</p>
                <p class="note">실제 ${typeNames[type]} 생성은 AI 어시스턴트와의 대화를 통해 수행하세요.</p>
            </div>
        `;
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.workspaceManager = new WorkspaceManager();
});

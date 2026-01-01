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
        this.uploadedCSVData = null; // DIG용 CSV 데이터 저장
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
        this.competencyCode = 'DIG';
        this.mode = '평가모드'; // DIG는 항상 평가모드 사용
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
            this.mode = '평가모드'; // DIG는 항상 평가모드 사용
            // DIG 전용이므로 항상 'DIG'로 고정
            this.competencyCode = 'DIG';
        } else {
            // LocalStorage에 없으면 기본 시나리오 파일 사용
            this.scenarioPath = this.getDefaultScenarioPath();
        }
    }

    /**
     * 기본 시나리오 파일 경로 가져오기
     */
    getDefaultScenarioPath() {
        // DIG 전용: 항상 평가모드 시나리오 파일 사용 (task/dig/DIG_평가모드_시나리오.json)
        const competency = 'DIG';
        const modeFile = `${competency}_평가모드_시나리오.json`;
        // 소문자 디렉토리 경로 사용 (task/dig/)
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
                    throw new Error(`시나리오 파일을 불러올 수 없습니다: ${response.statusText} (경로: ${this.scenarioPath})`);
                }

                this.scenarioData = await response.json();
                this.processScenarioData();
            } else {
                throw new Error('시나리오 데이터를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('시나리오 로드 오류:', error);
            this.showError('시나리오를 불러오는 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 시나리오 데이터 처리
     */
    processScenarioData() {
        if (!this.scenarioData || !this.scenarioData.tasks || this.scenarioData.tasks.length === 0) {
            throw new Error('시나리오 데이터가 올바르지 않습니다.');
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
     * 워크스페이스 렌더링
     */
    renderWorkspace() {
        // 헤더 업데이트
        this.renderHeader();

        // DIG 전용 워크스페이스 렌더링
        this.renderDIGWorkspace();
    }

    /**
     * DIG 전용 워크스페이스 렌더링
     */
    renderDIGWorkspace() {
        // 좌측 패널 렌더링
        this.renderLeftPanel();

        // DIG 전용 데이터 업로드 영역 추가
        this.renderDIGDataUpload();

        // 우측 패널 렌더링
        this.renderRightPanel();

        // DIG 전용 분석 도구 추가
        this.renderDIGAnalysisTools();

        // DIG 전용 출력 에디터 렌더링
        this.renderOutputEditor();

        // DIG 전용 탭 설정 (시각화 탭 포함)
        this.setupDIGTabs();
    }

    /**
     * PPS 전용 워크스페이스 렌더링
     */
    renderPPSWorkspace() {
        // 좌측 패널 렌더링
        this.renderLeftPanel();


        // 우측 패널 렌더링
        this.renderRightPanel();

        // PPS 전용 에디터 렌더링
        this.renderPPSOutputEditor();

        // PPS 전용 탭 설정
        this.setupPPSTabs();
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
        this.renderTaskList();
        this.renderTaskInfo();
        this.renderSessionInfo();
        this.setupAccordions();
    }

    /**
     * 우측 패널 렌더링
     */
    renderRightPanel() {
        this.renderOutputRequirementsPanel();
        this.renderScoringTips();
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

        // 상황 설명 (situation 필드 표시) - PPS 워크스페이스에서 중요하게 표시
        let sessionHtml = '';
        if (userDisplays.situation) {
            const situationTitle = '비즈니스 상황';
            sessionHtml = `
                <div class="session-item session-item-situation">
                    <h3 class="session-item-title">
                        <i class="fas fa-info-circle"></i> ${situationTitle}
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
     * 우측 패널 렌더링
     */

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
        const visualizationTab = document.getElementById('visualizationTab');
        const chatPanel = document.getElementById('chatPanel');
        const outputPanel = document.getElementById('outputPanel');
        const visualizationPanel = document.getElementById('visualizationPanel');

        if (!chatTab || !outputTab || !chatPanel || !outputPanel) {
            console.error('탭 전환 실패 - 요소를 찾을 수 없습니다');
            return;
        }

        // 모든 탭과 패널 비활성화
        chatTab.classList.remove('active');
        outputTab.classList.remove('active');
        if (visualizationTab) visualizationTab.classList.remove('active');
        chatPanel.classList.remove('active');
        outputPanel.classList.remove('active');
        if (visualizationPanel) visualizationPanel.classList.remove('active');

        // 선택된 탭과 패널 활성화
        if (tabName === 'chat') {
            chatTab.classList.add('active');
            chatPanel.classList.add('active');
        } else if (tabName === 'output') {
            outputTab.classList.add('active');
            outputPanel.classList.add('active');
        } else if (tabName === 'visualization' && visualizationTab && visualizationPanel) {
            visualizationTab.classList.add('active');
            visualizationPanel.classList.add('active');
        }

        // 상태 저장
        localStorage.setItem('workspace_active_tab', tabName);
    }

    /**
     * 결과물 작성 영역 렌더링
     */
    renderOutputEditor() {


        // DIG 및 기본 워크스페이스용 일반 에디터
        const container = document.getElementById('outputEditor');
        if (!container || !this.currentTask) return;

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
     * 필수 키워드 포함 여부 확인 (PPS 전용)
     */
    checkRequiredKeywords() {
        const session = this.findCurrentSession();
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) return;

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.requiredKeywords) return;

        const keywords = typeof aci.requiredKeywords === 'object' && aci.requiredKeywords.requirement
            ? aci.requiredKeywords.requirement
            : (Array.isArray(aci.requiredKeywords) ? aci.requiredKeywords.join(', ') : '');

        if (!keywords) return;

        // 입력된 텍스트 가져오기
        const format = aci.format || {};
        const style = format.style || '';
        let inputText = '';

        if (style.includes('개조식') || style.includes('리스트')) {
            const sectionId = `pps_output_${this.currentSessionId}`;
            const input = document.getElementById(sectionId);
            if (input) {
                inputText = input.value.toLowerCase();
            }
        } else {
            const requiredSections = format.requiredSections || [];
            requiredSections.forEach(section => {
                const sectionId = `section_${this.currentSessionId}_${section.order}`;
                const input = document.getElementById(sectionId);
                if (input) {
                    inputText += input.value.toLowerCase() + ' ';
                }
            });
        }

        // 키워드 목록 파싱
        const keywordList = keywords.split(',').map(kw => kw.trim().toLowerCase());
        const foundKeywords = [];
        const missingKeywords = [];

        keywordList.forEach(keyword => {
            if (inputText.includes(keyword)) {
                foundKeywords.push(keyword);
            } else {
                missingKeywords.push(keyword);
            }
        });

        // 키워드 태그 업데이트
        const keywordTags = document.querySelectorAll('.keyword-tag');
        keywordTags.forEach(tag => {
            const keyword = tag.dataset.keyword?.toLowerCase();
            if (foundKeywords.includes(keyword)) {
                tag.classList.add('keyword-found');
                tag.classList.remove('keyword-missing');
            } else {
                tag.classList.add('keyword-missing');
                tag.classList.remove('keyword-found');
            }
        });

        // 상태 메시지 업데이트
        const statusDiv = document.getElementById('keywordsStatus');
        if (statusDiv) {
            if (missingKeywords.length === 0) {
                statusDiv.innerHTML = `
                    <span class="keywords-status-text keywords-status-success">
                        <i class="fas fa-check-circle"></i> 모든 필수 키워드가 포함되었습니다.
                    </span>
                `;
            } else {
                const foundCount = foundKeywords.length;
                const totalCount = keywordList.length;
                statusDiv.innerHTML = `
                    <span class="keywords-status-text">
                        포함된 키워드: ${foundCount}/${totalCount}개
                        ${missingKeywords.length > 0 ? `<span class="missing-keywords">(누락: ${missingKeywords.map(k => k).join(', ')})</span>` : ''}
                    </span>
                `;
            }
        }
    }

    /**
     * 글자 수 표시 업데이트
     */
    updateLengthDisplay() {
        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) return;

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.format) return;

        const format = aci.format;
        const style = format.style || '';
        const requiredSections = format.requiredSections || [];
        let totalLength = 0;

        // PPS 개조식 리스트 형태인 경우
        if (style.includes('개조식') || style.includes('리스트')) {
            const sectionId = `pps_output_${this.currentSessionId}`;
            const input = document.getElementById(sectionId);
            if (input) {
                totalLength = input.value.length;
            }
        } else {
            // 일반 섹션별 입력
            requiredSections.forEach(section => {
                const sectionId = `section_${this.currentSessionId}_${section.order}`;
                const input = document.getElementById(sectionId);
                if (input) {
                    totalLength += input.value.length;
                }
            });
        }

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
            '분석하신 내용을 바탕으로 구체적인 프롬프트를 설계하시는 것이 좋겠습니다. 특히 요구사항에 명시된 필수 섹션을 잊지 마세요.',
            '비즈니스 상황에서 발생할 수 있는 리스크를 AES 가이드에 따라 필터링하는 것이 중요합니다. 이 부분을 다시 한번 체크해보시겠어요?',
            '좋은 접근입니다. 작성하신 결과물이 권장 길이에 적합한지도 함께 확인해주시면 더욱 완성도 높은 결과물이 될 것 같습니다.',
            '제시된 데이터 자산을 충분히 활용하고 계신가요? 각 데이터 항목이 결과물에 어떻게 반영될지 고민해보시면 좋겠습니다.',
            '필수 표기 사항이 누락되지 않도록 주의해 주세요. 채점 기준에서 중요한 비중을 차지하는 항목입니다.',
            '현재 단계에서 가장 중요한 미션은 무엇인지 다시 한번 상기해보시면 해결의 실마리를 찾으실 수 있을 거예요.',
            '작성 중이신 내용에 대해 더 구체적인 분석이나 도움이 필요하시면 언제든지 말씀해주세요.'
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
            taskId: this.currentTask.taskId,
            sessionId: this.currentSessionId,
            submittedAt: new Date().toISOString(),
            output: this.outputData,
            chatHistory: this.chatHistory,
            scenario: {
                title: this.currentTask.title,
                objective: this.currentTask.objective,
                mission: this.currentTask.mission
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
        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) {
            return true;
        }

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.format) {
            return true;
        }

        const format = aci.format;
        const style = format.style || '';
        const requiredSections = format.requiredSections || [];

        // PPS 개조식 리스트 형태인 경우
        if (style.includes('개조식') || style.includes('리스트')) {
            const sectionId = `pps_output_${this.currentSessionId}`;
            const input = document.getElementById(sectionId);
            if (!input || !input.value.trim()) {
                this.showError('기획서를 작성해주세요.');
                return false;
            }

            // 길이 제한 확인
            const lengthMatch = (format.length || '').match(/(\d+)\s*~\s*(\d+)/);
            if (lengthMatch) {
                const minLength = parseInt(lengthMatch[1]);
                const maxLength = parseInt(lengthMatch[2]);
                const totalLength = input.value.length;

                if (totalLength < minLength) {
                    this.showError(`최소 ${minLength}자 이상 작성해주세요. (현재: ${totalLength}자)`);
                    return false;
                }
                if (totalLength > maxLength) {
                    this.showError(`최대 ${maxLength}자 이하로 작성해주세요. (현재: ${totalLength}자)`);
                    return false;
                }
            }

            // 필수 키워드 확인
            if (aci.requiredKeywords) {
                const keywords = typeof aci.requiredKeywords === 'object' && aci.requiredKeywords.requirement
                    ? aci.requiredKeywords.requirement
                    : (Array.isArray(aci.requiredKeywords) ? aci.requiredKeywords.join(', ') : '');

                if (keywords) {
                    const keywordList = keywords.split(',').map(kw => kw.trim().toLowerCase());
                    const inputText = input.value.toLowerCase();
                    const missingKeywords = keywordList.filter(keyword => !inputText.includes(keyword));

                    if (missingKeywords.length > 0) {
                        this.showError(`다음 필수 키워드를 포함해주세요: ${missingKeywords.join(', ')}`);
                        return false;
                    }
                }
            }

            // 필수 표기 사항 확인
            if (aci.requiredNotation && aci.requiredNotation.text) {
                if (!input.value.includes(aci.requiredNotation.text)) {
                    this.showError(`필수 표기 사항 "${aci.requiredNotation.text}"을 포함해주세요.`);
                    return false;
                }
            }
        } else {
            // 일반 섹션별 입력
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

            // 필수 키워드 확인
            if (aci.requiredKeywords) {
                const keywords = typeof aci.requiredKeywords === 'object' && aci.requiredKeywords.requirement
                    ? aci.requiredKeywords.requirement
                    : (Array.isArray(aci.requiredKeywords) ? aci.requiredKeywords.join(', ') : '');

                if (keywords) {
                    let allText = '';
                    requiredSections.forEach(section => {
                        const sectionId = `section_${this.currentSessionId}_${section.order}`;
                        const input = document.getElementById(sectionId);
                        if (input) {
                            allText += input.value.toLowerCase() + ' ';
                        }
                    });

                    const keywordList = keywords.split(',').map(kw => kw.trim().toLowerCase());
                    const missingKeywords = keywordList.filter(keyword => !allText.includes(keyword));

                    if (missingKeywords.length > 0) {
                        this.showError(`다음 필수 키워드를 포함해주세요: ${missingKeywords.join(', ')}`);
                        return false;
                    }
                }
            }

            // 필수 표기 사항 확인
            if (aci.requiredNotation && aci.requiredNotation.text) {
                let allText = '';
                requiredSections.forEach(section => {
                    const sectionId = `section_${this.currentSessionId}_${section.order}`;
                    const input = document.getElementById(sectionId);
                    if (input) {
                        allText += input.value + ' ';
                    }
                });

                if (!allText.includes(aci.requiredNotation.text)) {
                    this.showError(`필수 표기 사항 "${aci.requiredNotation.text}"을 포함해주세요.`);
                    return false;
                }
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

    // ==================== DIG 전용 메서드 ====================

    /**
     * DIG 데이터 업로드 영역 렌더링
     */
    renderDIGDataUpload() {
        const leftPanel = document.querySelector('.workspace-left-panel');
        if (!leftPanel) return;

        // 데이터 업로드 섹션이 이미 있으면 제거
        const existingSection = document.getElementById('digDataUploadSection');
        if (existingSection) {
            existingSection.remove();
        }

        const uploadSection = document.createElement('div');
        uploadSection.id = 'digDataUploadSection';
        uploadSection.className = 'workspace-section accordion-section dig-only';

        uploadSection.innerHTML = `
            <h2 class="section-title accordion-header" id="digDataUploadHeader">
                <i class="fas fa-file-upload"></i> 데이터 파일 관리
                <i class="fas fa-chevron-down accordion-icon"></i>
            </h2>
            <div class="accordion-content" id="digDataUploadContent">
                <div class="data-upload-area">
                    <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
                    <button class="btn btn-secondary" id="uploadCsvBtn" onclick="document.getElementById('csvFileInput').click()" style="background: green; color: white;">
                        <i class="fas fa-upload"></i> CSV 파일 업로드
                    </button>
                    <div class="uploaded-files" id="uploadedFilesList"></div>
                </div>
                <div class="data-download-area" id="digDownloadArea" style="display: none;">
                    <button class="btn btn-primary" id="downloadCleanedDataBtn">
                        <i class="fas fa-download"></i> 정제된 데이터 다운로드
                    </button>
                </div>
            </div>
        `;

        // 세션 정보 섹션 다음에 추가
        const sessionSection = document.getElementById('sessionInfoSection');
        if (sessionSection && sessionSection.nextSibling) {
            leftPanel.insertBefore(uploadSection, sessionSection.nextSibling);
        } else {
            leftPanel.appendChild(uploadSection);
        }

        // 어코디언 설정
        this.setupAccordion('digDataUploadHeader', 'digDataUploadSection', 'digDataUploadSection_collapsed');

        // 파일 업로드 이벤트
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleCSVUpload(e));
        }

        // 다운로드 버튼 이벤트
        const downloadBtn = document.getElementById('downloadCleanedDataBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCleanedData());
        }
    }

    /**
     * CSV 파일 업로드 처리
     */
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            this.uploadedCSVData = csvContent;

            // 업로드된 파일 목록 표시
            const filesList = document.getElementById('uploadedFilesList');
            if (filesList) {
                filesList.innerHTML = `
                    <div class="uploaded-file-item">
                        <i class="fas fa-file-csv"></i>
                        <span>${file.name}</span>
                        <span class="file-size">(${this.formatFileSize(file.size)})</span>
                    </div>
                `;
            }

            // 다운로드 영역 표시
            const downloadArea = document.getElementById('digDownloadArea');
            if (downloadArea) {
                downloadArea.style.display = 'block';
            }

            this.showSuccess('CSV 파일이 업로드되었습니다.');
        };
        reader.readAsText(file);
    }

    /**
     * 정제된 데이터 다운로드
     */
    downloadCleanedData() {
        if (!this.uploadedCSVData) {
            this.showError('업로드된 데이터가 없습니다.');
            return;
        }

        // 간단한 데이터 정제 시뮬레이션 (실제로는 AI와 협업하여 정제)
        const cleanedData = this.cleanCSVData(this.uploadedCSVData);

        const blob = new Blob([cleanedData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Cleaned_Data_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showSuccess('정제된 데이터가 다운로드되었습니다.');
    }

    /**
     * CSV 데이터 정제 (시뮬레이션)
     */
    cleanCSVData(csvData) {
        // 실제로는 AI와 협업하여 정제하지만, 여기서는 간단한 시뮬레이션
        // 개인정보 제거, 형식 통일 등의 작업
        return csvData; // 실제 구현 필요
    }

    /**
     * 파일 크기 포맷팅
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * DIG 분석 도구 렌더링
     */
    renderDIGAnalysisTools() {
        const rightPanel = document.querySelector('.workspace-right-panel');
        if (!rightPanel) return;

        // 분석 도구 섹션이 이미 있으면 제거
        const existingSection = document.getElementById('digAnalysisSection');
        if (existingSection) {
            existingSection.remove();
        }

        const analysisSection = document.createElement('div');
        analysisSection.id = 'digAnalysisSection';
        analysisSection.className = 'workspace-section accordion-section dig-only';

        analysisSection.innerHTML = `
            <h2 class="section-title accordion-header" id="digAnalysisHeader">
                <i class="fas fa-chart-line"></i> 데이터 분석 도구
                <i class="fas fa-chevron-down accordion-icon"></i>
            </h2>
            <div class="accordion-content" id="digAnalysisContent">
                <div class="analysis-tools">
                    <button class="btn btn-secondary" id="generateStatsBtn" style="background: green; color: white;">
                        <i class="fas fa-calculator"></i> 기초 통계 생성
                    </button>
                    <button class="btn btn-secondary" id="analyzePatternsBtn" style="background: green; color: white;">
                        <i class="fas fa-search"></i> 패턴 분석
                    </button>
                </div>
                <div class="analysis-results" id="analysisResults"></div>
            </div>
        `;

        // 출력 요구사항 섹션 다음에 추가
        const outputSection = document.getElementById('outputRequirementsSection');
        if (outputSection && outputSection.nextSibling) {
            rightPanel.insertBefore(analysisSection, outputSection.nextSibling);
        } else {
            rightPanel.appendChild(analysisSection);
        }

        // 어코디언 설정
        this.setupAccordion('digAnalysisHeader', 'digAnalysisSection', 'digAnalysisSection_collapsed');

        // 분석 도구 이벤트
        const statsBtn = document.getElementById('generateStatsBtn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.generateBasicStats());
        }

        const patternsBtn = document.getElementById('analyzePatternsBtn');
        if (patternsBtn) {
            patternsBtn.addEventListener('click', () => this.analyzePatterns());
        }
    }

    /**
     * 기초 통계 생성
     */
    generateBasicStats() {
        if (!this.uploadedCSVData) {
            this.showError('먼저 CSV 파일을 업로드해주세요.');
            return;
        }

        const resultsDiv = document.getElementById('analysisResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="stats-result">
                    <h4><i class="fas fa-chart-bar"></i> 기초 통계 요약</h4>
                    <p>AI와 협업하여 데이터를 분석하고 있습니다...</p>
                    <p class="note">실제 분석은 AI 어시스턴트와의 대화를 통해 수행하세요.</p>
                </div>
            `;
        }
    }

    /**
     * 패턴 분석
     */
    analyzePatterns() {
        if (!this.uploadedCSVData) {
            this.showError('먼저 CSV 파일을 업로드해주세요.');
            return;
        }

        const resultsDiv = document.getElementById('analysisResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="pattern-result">
                    <h4><i class="fas fa-search"></i> 패턴 분석 결과</h4>
                    <p>AI와 협업하여 데이터 패턴을 분석하고 있습니다...</p>
                    <p class="note">실제 분석은 AI 어시스턴트와의 대화를 통해 수행하세요.</p>
                </div>
            `;
        }
    }

    /**
     * DIG 전용 탭 설정 (시각화 탭 포함)
     */
    setupDIGTabs() {
        // 기본 탭 설정
        this.setupTabs();

        // 시각화 탭 이벤트 설정 (HTML에 이미 포함되어 있음)
        const vizTab = document.getElementById('visualizationTab');
        const visualizationPanel = document.getElementById('visualizationPanel');

        if (vizTab && visualizationPanel) {
            // 탭 클릭 이벤트
            vizTab.addEventListener('click', () => {
                this.switchTab('visualization');
            });

            // 시각화 버튼 이벤트
            const pieBtn = document.getElementById('createPieChartBtn');
            const lineBtn = document.getElementById('createLineChartBtn');
            const wordCloudBtn = document.getElementById('createWordCloudBtn');

            if (pieBtn) {
                pieBtn.addEventListener('click', () => this.createVisualization('pie'));
            }
            if (lineBtn) {
                lineBtn.addEventListener('click', () => this.createVisualization('line'));
            }
            if (wordCloudBtn) {
                wordCloudBtn.addEventListener('click', () => this.createVisualization('wordcloud'));
            }
        }
    }

    /**
     * 시각화 생성
     */
    createVisualization(type) {
        const canvas = document.getElementById('vizCanvas');
        if (!canvas) return;

        canvas.innerHTML = `
            <div class="viz-placeholder">
                <i class="fas fa-chart-${type === 'pie' ? 'pie' : type === 'line' ? 'line' : 'cloud'}"></i>
                <h4>${type === 'pie' ? 'Pie Chart' : type === 'line' ? 'Line Chart' : 'Word Cloud'} 생성</h4>
                <p>AI와 협업하여 데이터를 시각화하세요.</p>
                <p class="note">실제 시각화는 AI 어시스턴트와의 대화를 통해 생성하세요.</p>
            </div>
        `;
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.workspaceManager = new WorkspaceManager();
});


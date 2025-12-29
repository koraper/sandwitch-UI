// 워크스페이스 관리 클래스
class WorkspaceManager {
    constructor() {
        this.scenarioData = null;
        this.currentTask = null;
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
        this.competencyCode = urlParams.get('competency') || 'PPS';
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
        const competency = this.competencyCode || 'PPS';
        const mode = this.mode || '평가모드';
        const modeFile = mode === '학습모드' 
            ? `${competency}_학습모드_시나리오.json` 
            : `${competency}_평가모드_시나리오.json`;
        return `task/${modeFile}`;
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

        // 리사이즈 핸들은 renderWorkspace() 후에 설정됨
    }


    /**
     * 리사이즈 핸들 설정
     */
    setupResizeHandle() {
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
            isResizing = true;
            startX = e.clientX;
            startWidth = leftPanel.offsetWidth;
            
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
            e.stopPropagation();
        };

        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const diff = e.clientX - startX;
            const newWidth = startWidth + diff;
            const minWidth = 300;
            const maxWidth = Math.min(window.innerWidth * 0.6, window.innerWidth - 400);

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                leftPanel.style.width = `${newWidth}px`;
            }
        };

        const handleMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
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
                    throw new Error(`시나리오 파일을 불러올 수 없습니다: ${response.statusText}`);
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
        }, 100);
    }

    /**
     * 워크스페이스 렌더링
     */
    renderWorkspace() {
        // 헤더 업데이트
        this.renderHeader();
        
        // 좌측 패널 렌더링
        this.renderLeftPanel();
        
        // 우측 패널 렌더링
        this.renderRightPanel();
        
        // 탭 설정
        this.setupTabs();
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
        this.renderTaskInfo();
        this.renderSessionInfo();
        this.setupAccordions();
    }

    /**
     * 우측 패널 렌더링
     */
    renderRightPanel() {
        this.renderScoringTips();
        this.renderOutputRequirementsPanel();
        this.setupRightPanelAccordions();
    }

    /**
     * 어코디언 설정
     */
    setupAccordions() {
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
                <span class="tip-number">${index + 1}</span>
                <p class="tip-text">${tip.tip || tip}</p>
            </div>
        `).join('');

        container.innerHTML = tipsHtml;
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
        tabsContainer.innerHTML = sessions.map((session, index) => `
            <button class="session-tab ${session.sessionId === this.currentSessionId ? 'active' : ''}" 
                    onclick="window.workspaceManager.switchSession(${session.sessionId})">
                세션 ${session.sessionId}
            </button>
        `).join('');
    }

    /**
     * 세션 전환
     */
    switchSession(sessionId) {
        this.currentSessionId = sessionId;
        this.renderSessionInfo();
        this.renderOutputEditor();
        this.renderOutputRequirementsPanel();
    }

    /**
     * 현재 세션 정보 렌더링
     */
    renderCurrentSession() {
        const container = document.getElementById('sessionContent');
        if (!container || !this.currentTask) return;

        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
        if (!session) return;

        const userDisplays = session.userDisplays || {};
        
        // 상황 설명
        let sessionHtml = `
            <div class="session-item">
                <h3 class="session-item-title">
                    <i class="fas fa-info-circle"></i> 비즈니스 상황
                </h3>
                <div class="session-item-content">
                    <p class="situation-text">${this.formatText(userDisplays.situation || '')}</p>
                </div>
            </div>
        `;

        // 원본 데이터
        if (userDisplays.rawData && userDisplays.rawData.length > 0) {
            sessionHtml += `
                <div class="session-item">
                    <h3 class="session-item-title">
                        <i class="fas fa-database"></i> 제공된 데이터 자산
                    </h3>
                    <div class="session-item-content">
                        ${userDisplays.rawData.map(rawData => `
                            <div class="raw-data-item">
                                <div class="raw-data-header">
                                    <strong><i class="fas fa-file-csv"></i> ${rawData.source || '데이터셋'}</strong>
                                    ${rawData.risks ? `<span class="risk-badge"><i class="fas fa-exclamation-triangle"></i> 리스크 포함</span>` : ''}
                                </div>
                                <div class="raw-data-content">
                                    <pre class="raw-data-text">${this.formatText(rawData.content || '')}</pre>
                                </div>
                                ${rawData.risks ? `
                                    <div class="raw-data-risks">
                                        <strong><i class="fas fa-shield-alt"></i> 포함된 리스크 요소</strong>
                                        <div class="risks-text">${this.formatText(rawData.risks)}</div>
                                    </div>
                                ` : ''}
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

            // 제약사항
            if (aci.constraints) {
                const constraints = typeof aci.constraints === 'object' && aci.constraints.constraint
                    ? aci.constraints.constraint
                    : (Array.isArray(aci.constraints) ? aci.constraints.join(', ') : '');
                if (constraints) {
                    html += `
                        <div class="constraints">
                            <strong><i class="fas fa-ban"></i> 작성 시 주의사항</strong>
                            <p>${constraints}</p>
                        </div>
                    `;
                }
            }

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

        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
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
        // 핵심 체크포인트
        this.setupAccordion('scoringTipsHeader', 'scoringTipsSection', 'scoringTipsSection_collapsed');
        
        // 출력 요구사항
        this.setupAccordion('outputRequirementsHeader', 'outputRequirementsSection', 'outputRequirementsSection_collapsed');
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

        if (!chatTab || !outputTab || !chatPanel || !outputPanel) return;

        // 저장된 활성 탭 불러오기
        const activeTab = localStorage.getItem('workspace_active_tab') || 'chat';
        this.switchTab(activeTab);

        // 탭 클릭 이벤트
        chatTab.addEventListener('click', () => {
            this.switchTab('chat');
        });

        outputTab.addEventListener('click', () => {
            this.switchTab('output');
        });
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        const chatTab = document.getElementById('chatTab');
        const outputTab = document.getElementById('outputTab');
        const chatPanel = document.getElementById('chatPanel');
        const outputPanel = document.getElementById('outputPanel');

        if (!chatTab || !outputTab || !chatPanel || !outputPanel) return;

        // 모든 탭과 패널 비활성화
        [chatTab, outputTab].forEach(tab => tab.classList.remove('active'));
        [chatPanel, outputPanel].forEach(panel => panel.classList.remove('active'));

        // 선택된 탭과 패널 활성화
        if (tabName === 'chat') {
            chatTab.classList.add('active');
            chatPanel.classList.add('active');
        } else if (tabName === 'output') {
            outputTab.classList.add('active');
            outputPanel.classList.add('active');
        }

        // 상태 저장
        localStorage.setItem('workspace_active_tab', tabName);
    }

    /**
     * 결과물 작성 영역 렌더링
     */
    renderOutputEditor() {
        const container = document.getElementById('outputEditor');
        if (!container || !this.currentTask) return;

        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
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
        this.updateLengthDisplay();
    }

    /**
     * 글자 수 표시 업데이트
     */
    updateLengthDisplay() {
        const session = this.currentTask.sessions.find(s => s.sessionId === this.currentSessionId);
        if (!session || !session.userDisplays || !session.userDisplays.outputRequirements) return;

        const aci = session.userDisplays.outputRequirements.aciRequirements;
        if (!aci || !aci.format) return;

        const requiredSections = aci.format.requiredSections || [];
        let totalLength = 0;

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
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${this.formatText(content)}</p>
            </div>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

        const requiredSections = aci.format.requiredSections || [];
        
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
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.workspaceManager = new WorkspaceManager();
});


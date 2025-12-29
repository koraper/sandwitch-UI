// 새 과제 생성 관리 클래스
class CreateAssignmentManager {
    constructor() {
        this.scoringTipCount = 0;
        this.sessionCount = 0;
        // tasks 배열: 여러 과제를 저장
        this.tasks = [];
        // 현재 선택된 과제 인덱스 (null = 선택 안됨)
        this.selectedTaskIndex = null;
        this.init();
    }

    init() {
        // URL 파라미터에서 역량 정보 읽기
        this.loadFromUrlParams();

        // 모달 초기 상태 설정
        const taskModal = document.getElementById('taskModal');
        if (taskModal) {
            taskModal.classList.add('modal-hide');
            taskModal.classList.remove('modal-show');
        }

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 모드에 따른 제한 시간 설정
        const docModeSelect = document.getElementById('docMode');
        if (docModeSelect && docModeSelect.value) {
            this.handleModeChange(docModeSelect);
        }

        // 초기 빈 상태 표시
        this.updateEmptyStates();

        // 초기 UI 업데이트
        this.updateTasksTable();
        this.updateTaskSelectionUI();

        // 초기 JSON 미리보기 업데이트
        this.updateJsonPreview();
    }

    /**
     * URL 파라미터에서 역량 정보 로드
     */
    loadFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);

        const competencyCode = urlParams.get('competencyCode');
        const mode = urlParams.get('mode');

        if (competencyCode) {
            const competencyCodeSelect = document.getElementById('competencyCode');
            if (competencyCodeSelect) {
                // 옵션 찾기 및 선택
                const option = Array.from(competencyCodeSelect.options).find(
                    opt => opt.value === competencyCode
                );
                if (option) {
                    competencyCodeSelect.value = competencyCode;
                    // change 이벤트 트리거하여 자동 입력 실행
                    competencyCodeSelect.dispatchEvent(new Event('change'));
                }
            }
        }

        if (mode) {
            const docModeSelect = document.getElementById('docMode');
            if (docModeSelect) {
                docModeSelect.value = mode;
                // 모드 변경 이벤트 트리거하여 제한 시간 자동 설정
                docModeSelect.dispatchEvent(new Event('change'));
            }
        }
    }

    /**
     * 빈 상태 업데이트
     */
    updateEmptyStates() {
        const scoringTipsContainer = document.getElementById('scoringTipsContainer');
        const scoringTipsEmpty = document.getElementById('scoringTipsEmpty');
        if (scoringTipsContainer && scoringTipsEmpty) {
            scoringTipsEmpty.style.display = scoringTipsContainer.children.length === 0 ? 'block' : 'none';
        }

        const sessionsContainer = document.getElementById('sessionsContainer');
        const sessionsEmpty = document.getElementById('sessionsEmpty');
        if (sessionsContainer && sessionsEmpty) {
            sessionsEmpty.style.display = sessionsContainer.children.length === 0 ? 'block' : 'none';
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 탭 전환 이벤트
        const tabButtons = document.querySelectorAll('.form-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 모드 선택 시 제한 시간 자동 설정
        const docModeSelect = document.getElementById('docMode');
        if (docModeSelect) {
            docModeSelect.addEventListener('change', (e) => {
                this.handleModeChange(e.target);
            });
        }

        // 역량 코드 선택 시 자동 입력
        const competencyCodeSelect = document.getElementById('competencyCode');
        if (competencyCodeSelect) {
            competencyCodeSelect.addEventListener('change', (e) => {
                this.handleCompetencyCodeChange(e.target);
            });
        }

        // 과제 추가 버튼
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addTask();
            });
        }

        // 채점 팁 추가 버튼
        const addScoringTipBtn = document.getElementById('addScoringTipBtn');
        if (addScoringTipBtn) {
            addScoringTipBtn.addEventListener('click', () => this.addScoringTip());
        }

        // 세션 추가 버튼
        const addSessionBtn = document.getElementById('addSessionBtn');
        if (addSessionBtn) {
            addSessionBtn.addEventListener('click', () => this.addSession());
        }

        // JSON 미리보기 새로고침 버튼
        const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        if (refreshPreviewBtn) {
            refreshPreviewBtn.addEventListener('click', () => this.updateJsonPreview());
        }

        // 폼 입력 변경 시 자동 미리보기 업데이트
        const form = document.getElementById('assignmentForm');
        if (form) {
            form.addEventListener('input', () => this.handleFormInput());
            form.addEventListener('change', () => this.handleFormInput());
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 다운로드 버튼
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadJson());
        }
    }

    /**
     * 폼 입력 변경 처리
     */
    handleFormInput() {
        // 선택된 과제가 있으면 해당 과제 데이터 업데이트
        if (this.selectedTaskIndex !== null && this.tasks[this.selectedTaskIndex]) {
            this.saveCurrentTaskForm();
        }
        this.updateJsonPreview();
    }

    /**
     * 모드 변경 처리
     */
    handleModeChange(selectElement) {
        const mode = selectElement.value;
        const timeLimitInput = document.getElementById('timeLimit');

        if (!timeLimitInput) return;

        if (mode === '학습모드') {
            // 학습모드: 제한없음 (0)
            timeLimitInput.value = '0';
            timeLimitInput.disabled = true;
        } else if (mode === '평가모드') {
            // 평가모드: 60분(기본값)
            timeLimitInput.value = '60';
            timeLimitInput.disabled = false;
        } else {
            // 모드 미선택 시
            timeLimitInput.disabled = false;
        }

        // JSON 미리보기 업데이트
        this.updateJsonPreview();
    }

    /**
     * 역량 코드 변경 처리
     */
    handleCompetencyCodeChange(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];

        if (selectedOption.value) {
            const nameKr = selectedOption.dataset.nameKr || '';
            const nameEn = selectedOption.dataset.nameEn || '';
            const description = selectedOption.dataset.description || '';

            const nameKrInput = document.getElementById('competencyNameKr');
            const nameEnInput = document.getElementById('competencyNameEn');
            const descriptionTextarea = document.getElementById('competencyDescription');

            if (nameKrInput) nameKrInput.value = nameKr;
            if (nameEnInput) nameEnInput.value = nameEn;
            if (descriptionTextarea) descriptionTextarea.value = description;

            // JSON 미리보기 업데이트
            this.updateJsonPreview();
        } else {
            // 선택 해제 시 필드 초기화
            const nameKrInput = document.getElementById('competencyNameKr');
            const nameEnInput = document.getElementById('competencyNameEn');
            const descriptionTextarea = document.getElementById('competencyDescription');

            if (nameKrInput) nameKrInput.value = '';
            if (nameEnInput) nameEnInput.value = '';
            if (descriptionTextarea) descriptionTextarea.value = '';
        }
    }

    /**
     * 출력 요구사항 서브 탭 전환
     */
    switchOutputTab(sessionId, tabType) {
        const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
        if (!sessionItem) return;

        // 모든 서브 탭 버튼 비활성화
        const tabButtons = sessionItem.querySelectorAll('.output-req-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // 모든 서브 탭 컨텐츠 숨기기
        const tabContents = sessionItem.querySelectorAll('.output-req-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // 선택된 탭 활성화
        const selectedButton = sessionItem.querySelector(`[data-output-tab="${tabType}_${sessionId}"]`);
        const selectedContent = sessionItem.querySelector(`#output-${tabType}_${sessionId}`);

        if (selectedButton) selectedButton.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        // 모든 탭 버튼 비활성화
        const tabButtons = document.querySelectorAll('.form-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // 모든 탭 컨텐츠 숨기기
        const tabContents = document.querySelectorAll('.form-tab-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // 선택된 탭 활성화
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`tab-${tabName}`);

        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        if (selectedContent) {
            selectedContent.classList.add('active');
        }

        // JSON 미리보기 탭으로 전환 시 자동 업데이트
        if (tabName === 'preview') {
            this.updateJsonPreview();
        }
    }

    // ============================================================
    // 과제(Task) 관리 함수
    // ============================================================

    /**
     * 과제 추가 모달 열기
     */
    addTask() {
        const modal = document.getElementById('taskModal');
        if (!modal) return;

        // 모달 폼 초기화
        const editTaskIndex = document.getElementById('editTaskIndex');
        const modalTaskTitle = document.getElementById('modalTaskTitle');
        const modalTaskObjective = document.getElementById('modalTaskObjective');
        const modalTaskMission = document.getElementById('modalTaskMission');
        const modalTimeLimit = document.getElementById('modalTimeLimit');
        const taskModalTitle = document.getElementById('taskModalTitle');

        if (editTaskIndex) editTaskIndex.value = '-1';
        if (modalTaskTitle) modalTaskTitle.value = '';
        if (modalTaskObjective) modalTaskObjective.value = '';
        if (modalTaskMission) modalTaskMission.value = '';
        if (modalTimeLimit) modalTimeLimit.value = '60';
        if (taskModalTitle) taskModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 새 과제 추가';

        // 모달 표시
        modal.classList.remove('modal-hide');
        modal.classList.add('modal-show');
    }

    /**
     * 과제 편집 모달 열기
     */
    editTaskModal(index) {
        const task = this.tasks[index];
        if (!task) return;

        // 모달 폼에 데이터 채우기
        document.getElementById('editTaskIndex').value = index;
        document.getElementById('modalTaskTitle').value = task.title || '';
        document.getElementById('modalTaskObjective').value = task.objective || '';
        document.getElementById('modalTaskMission').value = task.mission || '';
        document.getElementById('modalTimeLimit').value = task.timeLimit || 60;
        document.getElementById('taskModalTitle').innerHTML = '<i class="fas fa-edit"></i> 과제 편집';

        // 모달 표시
        const modal = document.getElementById('taskModal');
        modal.classList.add('modal-show');
        modal.classList.remove('modal-hide');
    }

    /**
     * 과제 모달 닫기
     */
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('taskModal 요소를 찾을 수 없습니다!');
            return;
        }
        modal.classList.remove('modal-show');
        modal.classList.add('modal-hide');
    }

    /**
     * 과제 모달 저장
     */
    saveTaskModal() {
        const editIndex = parseInt(document.getElementById('editTaskIndex').value);
        const title = document.getElementById('modalTaskTitle').value.trim();
        const objective = document.getElementById('modalTaskObjective').value.trim();
        const mission = document.getElementById('modalTaskMission').value.trim();
        const timeLimit = parseInt(document.getElementById('modalTimeLimit').value) || 60;

        // 필수 필드 검증
        if (!title || !objective || !mission) {
            this.showError('제목, 목표, 미션은 필수 입력 항목입니다.');
            return;
        }

        if (editIndex === -1) {
            // 새 과제 추가
            const newTask = {
                taskNumber: this.tasks.length + 1,
                title: title,
                objective: objective,
                mission: mission,
                timeLimit: timeLimit,
                scoringTips: [],
                sessions: []
            };
            this.tasks.push(newTask);
            this.selectedTaskIndex = this.tasks.length - 1;
        } else {
            // 기존 과제 수정
            if (this.tasks[editIndex]) {
                this.tasks[editIndex].title = title;
                this.tasks[editIndex].objective = objective;
                this.tasks[editIndex].mission = mission;
                this.tasks[editIndex].timeLimit = timeLimit;
                this.selectedTaskIndex = editIndex;
            }
        }

        this.updateTasksTable();
        this.updateTaskSelectionUI();
        this.loadTaskForm(this.tasks[this.selectedTaskIndex]);
        this.updateJsonPreview();

        // 모달 닫기
        this.closeTaskModal();
    }

    /**
     * 과제 삭제
     */
    removeTask(index) {
        if (!confirm('정말로 이 과제를 삭제하시겠습니까?')) {
            return;
        }

        // 선택된 과제가 삭제되면 선택 해제
        if (this.selectedTaskIndex === index) {
            this.selectedTaskIndex = null;
        } else if (this.selectedTaskIndex > index) {
            this.selectedTaskIndex--;
        }

        this.tasks.splice(index, 1);

        // 과제 번호 재정렬
        this.tasks.forEach((task, idx) => {
            task.taskNumber = idx + 1;
        });

        this.updateTasksTable();
        this.updateTaskSelectionUI();
        this.updateJsonPreview();
    }

    /**
     * 과제 선택
     */
    selectTask(index) {
        this.selectedTaskIndex = index;
        this.updateTasksTable();

        // 선택된 과제 데이터로 폼 채우기
        this.loadTaskForm(this.tasks[index]);

        // 과제 목록 탭으로 전환
        this.switchTab('scoring');
    }

    /**
     * 선택된 과제 편집 (모달)
     */
    editTask(index) {
        this.editTaskModal(index);
    }

    /**
     * 현재 폼 데이터를 선택된 과제에 저장
     */
    saveCurrentTaskForm() {
        if (this.selectedTaskIndex === null) return;

        const task = this.tasks[this.selectedTaskIndex];

        // 기본 정보
        const titleInput = document.getElementById('taskTitle');
        const objectiveInput = document.getElementById('taskObjective');
        const missionInput = document.getElementById('taskMission');
        const timeLimitInput = document.getElementById('timeLimit');

        if (titleInput) task.title = titleInput.value;
        if (objectiveInput) task.objective = objectiveInput.value;
        if (missionInput) task.mission = missionInput.value;
        if (timeLimitInput) task.timeLimit = parseInt(timeLimitInput.value) || 0;

        // 채점 팁 수집
        task.scoringTips = [];
        const scoringTipInputs = document.querySelectorAll('.scoring-tip-input');
        scoringTipInputs.forEach(input => {
            const tip = input.value.trim();
            if (tip) {
                task.scoringTips.push({ tip });
            }
        });

        // 세션 수집
        task.sessions = [];
        const sessionItems = document.querySelectorAll('.session-item');
        sessionItems.forEach((sessionItem, index) => {
            const sessionNumber = index + 1;
            const session = this.collectSessionData(sessionItem, sessionNumber);
            if (session) {
                task.sessions.push(session);
            }
        });

        // 테이블 업데이트
        this.updateTasksTable();
    }

    /**
     * 세션 데이터 수집
     */
    collectSessionData(sessionItem, sessionNumber) {
        const formData = new FormData(document.getElementById('assignmentForm'));
        const sessionId = sessionItem.dataset.sessionId || sessionNumber;

        const situation = formData.get(`session_${sessionId}_situation`) || '';
        if (!situation) return null;

        const session = {
            sessionNumber: sessionNumber,
            userDisplays: {
                situation: situation,
                rawData: [],
                outputRequirements: {
                    aesRequirements: {
                        description: formData.get(`session_${sessionId}_aes_description`) || '',
                        requirement: formData.get(`session_${sessionId}_aes_requirement`) || ''
                    },
                    aciRequirements: {
                        format: {
                            description: formData.get(`session_${sessionId}_format_description`) || '출력 형식 요구사항',
                            style: formData.get(`session_${sessionId}_aci_style`) || '',
                            length: formData.get(`session_${sessionId}_aci_length`) || '',
                            requiredSections: []
                        },
                        requiredNotation: {
                            description: formData.get(`session_${sessionId}_notation_description`) || '필수 표기 사항',
                            requirement: formData.get(`session_${sessionId}_notation_requirement`) || '',
                            text: formData.get(`session_${sessionId}_notation_text`) || ''
                        },
                        dataReliability: {
                            description: '데이터 신뢰성',
                            requirement: formData.get(`session_${sessionId}_data_reliability`) || ''
                        },
                        requiredKeywords: {
                            description: '필수 키워드',
                            requirement: formData.get(`session_${sessionId}_keywords`) || ''
                        },
                        constraints: {
                            description: '제약사항',
                            constraint: formData.get(`session_${sessionId}_constraints`) || ''
                        }
                    }
                }
            }
        };

        // 원본 데이터 수집
        const rawDataItems = sessionItem.querySelectorAll('.raw-data-item');
        rawDataItems.forEach(rawDataItem => {
            const rawDataId = rawDataItem.dataset.rawDataId;
            const source = formData.get(`${rawDataId}_source`) || '';
            const contentText = formData.get(`${rawDataId}_content`) || '';
            const risksText = formData.get(`${rawDataId}_risks`) || '';

            if (source || contentText) {
                session.userDisplays.rawData.push({
                    source: source,
                    content: contentText,
                    risks: risksText
                });
            }
        });

        // 필수 섹션 수집
        const requiredSectionItems = sessionItem.querySelectorAll('.required-section-item');
        requiredSectionItems.forEach(sectionItem => {
            const sectionId = sectionItem.dataset.sectionId;
            const order = parseInt(formData.get(`${sectionId}_order`)) || 1;
            const title = formData.get(`${sectionId}_title`) || '';
            const content = formData.get(`${sectionId}_content`) || '';

            if (title || content) {
                session.userDisplays.outputRequirements.aciRequirements.format.requiredSections.push({
                    order: order,
                    title: title,
                    content: content
                });
            }
        });

        // 순서대로 정렬
        session.userDisplays.outputRequirements.aciRequirements.format.requiredSections.sort((a, b) => a.order - b.order);

        return session;
    }

    /**
     * 과제 폼에 데이터 로드
     */
    loadTaskForm(task) {
        const titleInput = document.getElementById('taskTitle');
        const objectiveInput = document.getElementById('taskObjective');
        const missionInput = document.getElementById('taskMission');
        const timeLimitInput = document.getElementById('timeLimit');

        if (titleInput) titleInput.value = task.title || '';
        if (objectiveInput) objectiveInput.value = task.objective || '';
        if (missionInput) missionInput.value = task.mission || '';
        if (timeLimitInput) timeLimitInput.value = task.timeLimit || 60;

        // 기존 채점 팁/세션 컨테이너 비우기
        const scoringTipsContainer = document.getElementById('scoringTipsContainer');
        const sessionsContainer = document.getElementById('sessionsContainer');
        if (scoringTipsContainer) scoringTipsContainer.innerHTML = '';
        if (sessionsContainer) sessionsContainer.innerHTML = '';

        // 채점 팁 로드
        if (task.scoringTips && task.scoringTips.length > 0) {
            task.scoringTips.forEach((tipData, idx) => {
                this.scoringTipCount = idx + 1;
                this.addScoringTipElement(tipData.tip);
            });
        }

        // 세션 로드
        if (task.sessions && task.sessions.length > 0) {
            task.sessions.forEach((sessionData) => {
                this.addSessionElement(sessionData);
            });
        }

        this.updateEmptyStates();
    }

    /**
     * 과제 폼 초기화
     */
    clearTaskForm() {
        const titleInput = document.getElementById('taskTitle');
        const objectiveInput = document.getElementById('taskObjective');
        const missionInput = document.getElementById('taskMission');
        const timeLimitInput = document.getElementById('timeLimit');

        if (titleInput) titleInput.value = '';
        if (objectiveInput) objectiveInput.value = '';
        if (missionInput) missionInput.value = '';
        if (timeLimitInput) timeLimitInput.value = '60';

        // 기존 채점 팁/세션 컨테이너 비우기
        const scoringTipsContainer = document.getElementById('scoringTipsContainer');
        const sessionsContainer = document.getElementById('sessionsContainer');
        if (scoringTipsContainer) scoringTipsContainer.innerHTML = '';
        if (sessionsContainer) sessionsContainer.innerHTML = '';

        this.scoringTipCount = 0;
        this.sessionCount = 0;
        this.updateEmptyStates();
    }

    /**
     * 과제 목록 테이블 업데이트
     */
    updateTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        const tasksEmpty = document.getElementById('tasksEmpty');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.tasks.length === 0) {
            if (tasksEmpty) tasksEmpty.style.display = 'block';
            return;
        }

        if (tasksEmpty) tasksEmpty.style.display = 'none';

        this.tasks.forEach((task, index) => {
            const tr = document.createElement('tr');
            if (index === this.selectedTaskIndex) {
                tr.classList.add('selected');
            }

            tr.innerHTML = `
                <td class="task-title-cell">${this.escapeHtml(task.title || '(제목 없음)')}</td>
                <td class="session-count-cell">${task.sessions ? task.sessions.length : 0}</td>
                <td class="actions-cell">
                    <button type="button" class="btn-edit-task" onclick="window.createAssignmentManager.editTask(${index}); return false;">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button type="button" class="btn-delete-task" onclick="window.createAssignmentManager.removeTask(${index}); return false;">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </td>
            `;

            tr.addEventListener('click', (e) => {
                // 버튼 클릭 시 선택하지 않음
                if (e.target.closest('button')) return;
                this.selectTask(index);
            });

            tbody.appendChild(tr);
        });
    }

    /**
     * 과제 선택 UI 업데이트 (채점 팁/세션 탭)
     */
    updateTaskSelectionUI() {
        const hasTask = this.selectedTaskIndex !== null;

        // 과제 목록 탭
        const noTaskSelected = document.getElementById('noTaskSelected');
        const taskEditForm = document.getElementById('taskEditForm');
        const selectedTaskInfo = document.getElementById('selectedTaskInfo');
        const selectedTaskTitle = document.getElementById('selectedTaskTitle');

        if (noTaskSelected) noTaskSelected.style.display = hasTask ? 'none' : 'block';
        if (taskEditForm) taskEditForm.style.display = hasTask ? 'block' : 'none';
        if (selectedTaskInfo) selectedTaskInfo.style.display = hasTask ? 'block' : 'none';

        if (hasTask && selectedTaskTitle && this.tasks[this.selectedTaskIndex]) {
            selectedTaskTitle.textContent = this.tasks[this.selectedTaskIndex].title || '(제목 없음)';
        }

        // 채점 팁 탭
        const scoringNoTaskSelected = document.getElementById('scoringNoTaskSelected');
        const scoringTipsForm = document.getElementById('scoringTipsForm');
        const scoringTaskBanner = document.getElementById('scoringTaskBanner');
        const scoringTaskName = document.getElementById('scoringTaskName');

        if (scoringNoTaskSelected) scoringNoTaskSelected.style.display = hasTask ? 'none' : 'block';
        if (scoringTipsForm) scoringTipsForm.style.display = hasTask ? 'block' : 'none';
        if (scoringTaskBanner) scoringTaskBanner.style.display = hasTask ? 'flex' : 'none';

        if (hasTask && scoringTaskName && this.tasks[this.selectedTaskIndex]) {
            scoringTaskName.textContent = this.tasks[this.selectedTaskIndex].title || '(제목 없음)';
        }

        // 세션 정보 탭
        const sessionsNoTaskSelected = document.getElementById('sessionsNoTaskSelected');
        const sessionsForm = document.getElementById('sessionsForm');
        const sessionsTaskBanner = document.getElementById('sessionsTaskBanner');
        const sessionsTaskName = document.getElementById('sessionsTaskName');

        if (sessionsNoTaskSelected) sessionsNoTaskSelected.style.display = hasTask ? 'none' : 'block';
        if (sessionsForm) sessionsForm.style.display = hasTask ? 'block' : 'none';
        if (sessionsTaskBanner) sessionsTaskBanner.style.display = hasTask ? 'flex' : 'none';

        if (hasTask && sessionsTaskName && this.tasks[this.selectedTaskIndex]) {
            sessionsTaskName.textContent = this.tasks[this.selectedTaskIndex].title || '(제목 없음)';
        }
    }

    // ============================================================
    // 채점 팁(Scoring Tip) 관리 함수
    // ============================================================

    /**
     * 채점 팁 추가
     */
    addScoringTip() {
        if (this.selectedTaskIndex === null) {
            this.showError('먼저 과제를 선택해주세요.');
            return;
        }

        this.scoringTipCount++;
        const tipId = `scoringTip_${this.scoringTipCount}`;

        this.addScoringTipElement('');

        // 빈 상태 숨기기
        const emptyState = document.getElementById('scoringTipsEmpty');
        if (emptyState) emptyState.style.display = 'none';

        this.handleFormInput();
    }

    /**
     * 채점 팁 요소 추가
     */
    addScoringTipElement(tipValue = '') {
        const container = document.getElementById('scoringTipsContainer');
        if (!container) return;

        const tipId = `scoringTip_${this.scoringTipCount}`;

        const tipElement = document.createElement('div');
        tipElement.className = 'dynamic-item';
        tipElement.dataset.tipId = tipId;
        tipElement.innerHTML = `
            <div class="dynamic-item-header">
                <span class="dynamic-item-label">채점 팁 ${this.scoringTipCount}</span>
                <button type="button" class="btn-remove" onclick="window.createAssignmentManager.removeScoringTip(this);">
                    <i class="fas fa-times"></i> 삭제
                </button>
            </div>
            <div class="form-group">
                <label>팁 <span class="json-key">[tasks[].scoringTips[].tip]</span></label>
                <textarea name="${tipId}" rows="3" placeholder="채점 팁을 입력하세요. 예: AI에게 명확한 역할(Role)과 상황(Context)을 부여하세요." class="scoring-tip-input">${this.escapeHtml(tipValue)}</textarea>
            </div>
        `;

        container.appendChild(tipElement);
    }

    /**
     * 채점 팁 삭제
     */
    removeScoringTip(button) {
        const item = button.closest('.dynamic-item');
        if (item) {
            item.remove();

            // 빈 상태 표시 확인
            const container = document.getElementById('scoringTipsContainer');
            const emptyState = document.getElementById('scoringTipsEmpty');
            if (container && emptyState && container.children.length === 0) {
                emptyState.style.display = 'block';
            }

            this.handleFormInput();
        }
    }

    // ============================================================
    // 세션(Session) 관리 함수
    // ============================================================

    /**
     * 세션 추가
     */
    addSession() {
        if (this.selectedTaskIndex === null) {
            this.showError('먼저 과제를 선택해주세요.');
            return;
        }

        this.sessionCount++;
        const sessionId = this.sessionCount;

        this.addSessionElement(null);

        // 빈 상태 숨기기
        const emptyState = document.getElementById('sessionsEmpty');
        if (emptyState) emptyState.style.display = 'none';

        this.handleFormInput();
    }

    /**
     * 세션 요소 추가
     */
    addSessionElement(sessionData = null) {
        const container = document.getElementById('sessionsContainer');
        if (!container) return;

        const sessionId = sessionData ? sessionData.sessionNumber : this.sessionCount;
        const situation = sessionData ? sessionData.userDisplays.situation : '';
        const rawData = sessionData ? sessionData.userDisplays.rawData : [];
        const outputRequirements = sessionData ? sessionData.userDisplays.outputRequirements : null;

        const sessionElement = document.createElement('div');
        sessionElement.className = 'session-item';
        sessionElement.dataset.sessionId = sessionId;
        sessionElement.innerHTML = `
            <div class="session-header">
                <h3 class="session-title">세션 ${sessionId} <span class="json-key">[tasks[].sessions[]]</span></h3>
                <button type="button" class="btn-remove" onclick="window.createAssignmentManager.removeSession(this);">
                    <i class="fas fa-times"></i> 세션 삭제
                </button>
            </div>

            <div class="form-group">
                <label>상황 설명 <span class="json-key">[tasks[].sessions[].userDisplays.situation]</span> <span class="required">*</span></label>
                <textarea name="session_${sessionId}_situation" rows="5" required placeholder="학습자에게 제공할 상황 설명을 입력하세요. 예: 당신은 헬스케어 스타트업 'P-Lab'의 기획자(PM)입니다...">${this.escapeHtml(situation)}</textarea>
                <small class="form-hint">학습자가 과제를 수행할 때 필요한 배경 정보와 상황을 설명하세요.</small>
            </div>

            <div class="form-subsection">
                <div class="form-subsection-header">
                    <h4><i class="fas fa-database"></i> 원본 데이터 <span class="json-key">[tasks[].sessions[].userDisplays.rawData[]]</span></h4>
                    <button type="button" class="btn-add-small" onclick="window.createAssignmentManager.addRawData(${sessionId})">
                        <i class="fas fa-plus"></i> 데이터 추가
                    </button>
                </div>
                <div class="raw-data-container" id="rawDataContainer_${sessionId}">
                    <!-- 동적으로 추가됨 -->
                </div>
            </div>

            <div class="form-subsection">
                <div class="form-subsection-header">
                    <h4><i class="fas fa-clipboard-check"></i> 출력 요구사항 <span class="json-key">[tasks[].sessions[].userDisplays.outputRequirements]</span></h4>
                </div>

                <!-- 출력 요구사항 서브 탭 -->
                <div class="output-req-tabs">
                    <button type="button" class="output-req-tab active" data-output-tab="aes_${sessionId}" onclick="window.createAssignmentManager.switchOutputTab(${sessionId}, 'aes')">
                        <i class="fas fa-shield-alt"></i> AES 요구사항
                    </button>
                    <button type="button" class="output-req-tab" data-output-tab="aci_${sessionId}" onclick="window.createAssignmentManager.switchOutputTab(${sessionId}, 'aci')">
                        <i class="fas fa-file-alt"></i> ACI 요구사항
                    </button>
                </div>

                <!-- AES 요구사항 탭 컨텐츠 -->
                <div class="output-req-content active" id="output-aes_${sessionId}">
                    <div class="form-subsection-content">
                        <h5 class="subsection-title">AES 요구사항 <span class="json-key">[...aesRequirements]</span></h5>
                        <p class="form-section-description">AES(Accuracy, Ethics, Safety) - 정확성, 윤리, 안전 관련 요구사항을 정의합니다.</p>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>설명 <span class="json-key">[...aesRequirements.description]</span></label>
                                <input type="text" name="session_${sessionId}_aes_description" placeholder="예: AES 검증 (법적/사회적 리스크 관리)" value="${outputRequirements ? this.escapeHtml(outputRequirements.aesRequirements.description || '') : ''}">
                            </div>
                            <div class="form-group full-width">
                                <label>요구사항 <span class="json-key">[...aesRequirements.requirement]</span></label>
                                <textarea name="session_${sessionId}_aes_requirement" rows="4" placeholder="예: 대표님의 지시 중 AES평가 요소에 위배되는 사항을 찾아내어, 수정할 것.">${outputRequirements ? this.escapeHtml(outputRequirements.aesRequirements.requirement || '') : ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACI 요구사항 탭 컨텐츠 -->
                <div class="output-req-content" id="output-aci_${sessionId}">
                    ${this.generateACIForm(sessionId, outputRequirements)}
                </div>
            </div>
        `;

        container.appendChild(sessionElement);

        // 기존 원본 데이터 로드
        if (rawData && rawData.length > 0) {
            rawData.forEach(data => {
                this.addRawDataElement(sessionId, data);
            });
        } else {
            // 초기 원본 데이터 추가
            this.addRawData(sessionId);
        }
    }

    /**
     * ACI 폼 생성
     */
    generateACIForm(sessionId, outputRequirements = null) {
        const aciReqs = outputRequirements ? outputRequirements.aciRequirements : null;
        const format = aciReqs ? aciReqs.format : null;
        const requiredNotation = aciReqs ? aciReqs.requiredNotation : null;
        const dataReliability = aciReqs ? aciReqs.dataReliability : null;
        const requiredKeywords = aciReqs ? aciReqs.requiredKeywords : null;
        const constraints = aciReqs ? aciReqs.constraints : null;

        return `
            <div class="form-subsection-content">
                <h5 class="subsection-title">ACI 요구사항 <span class="json-key">[...aciRequirements]</span></h5>
                <p class="form-section-description">ACI(Accuracy, Completeness, Integrity) - 출력 형식, 구조, 데이터 신뢰성 관련 요구사항을 정의합니다.</p>

                <!-- 형식 (format) -->
                <div class="aci-section">
                    <h6><i class="fas fa-align-left"></i> 형식 <span class="json-key">[...aciRequirements.format]</span></h6>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>형식 설명 <span class="json-key">[...format.description]</span></label>
                            <input type="text" name="session_${sessionId}_format_description" placeholder="예: 출력 형식 요구사항" value="${format ? this.escapeHtml(format.description || '출력 형식 요구사항') : '출력 형식 요구사항'}">
                        </div>
                        <div class="form-group">
                            <label>스타일 <span class="json-key">[...format.style]</span></label>
                            <input type="text" name="session_${sessionId}_aci_style" placeholder="예: 서술형 줄글이 아닌 개조식 리스트 형태" value="${format ? this.escapeHtml(format.style || '') : ''}">
                        </div>
                        <div class="form-group">
                            <label>길이 <span class="json-key">[...format.length]</span></label>
                            <input type="text" name="session_${sessionId}_aci_length" placeholder="예: 공백 포함 500자 ~ 700자 이내" value="${format ? this.escapeHtml(format.length || '') : ''}">
                        </div>
                    </div>

                    <!-- 필수 섹션 (구성 요소) -->
                    <div class="required-sections-wrapper">
                        <div class="form-subsection-header">
                            <h6><i class="fas fa-list-ol"></i> 필수 섹션 (구성 요소) <span class="json-key">[...format.requiredSections[]]</span></h6>
                            <button type="button" class="btn-add-small" onclick="window.createAssignmentManager.addRequiredSection(${sessionId})">
                                <i class="fas fa-plus"></i> 구성 요소 추가
                            </button>
                        </div>
                        <div class="required-sections-container" id="requiredSectionsContainer_${sessionId}">
                            <!-- 동적으로 추가됨 -->
                        </div>
                    </div>
                </div>

                <!-- 필수 표기 사항 -->
                <div class="aci-section">
                    <h6><i class="fas fa-tag"></i> 필수 표기 사항 <span class="json-key">[...aciRequirements.requiredNotation]</span></h6>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>설명 <span class="json-key">[...requiredNotation.description]</span></label>
                            <input type="text" name="session_${sessionId}_notation_description" placeholder="예: 필수 표기 사항" value="${requiredNotation ? this.escapeHtml(requiredNotation.description || '필수 표기 사항') : '필수 표기 사항'}">
                        </div>
                        <div class="form-group">
                            <label>요구사항 <span class="json-key">[...requiredNotation.requirement]</span></label>
                            <input type="text" name="session_${sessionId}_notation_requirement" placeholder="예: 출처 표기 필수" value="${requiredNotation ? this.escapeHtml(requiredNotation.requirement || '') : ''}">
                        </div>
                        <div class="form-group">
                            <label>텍스트 <span class="json-key">[...requiredNotation.text]</span></label>
                            <input type="text" name="session_${sessionId}_notation_text" placeholder="예: [출처: OOO]" value="${requiredNotation ? this.escapeHtml(requiredNotation.text || '') : ''}">
                        </div>
                    </div>
                </div>

                <!-- 데이터 신뢰성 -->
                <div class="aci-section">
                    <h6><i class="fas fa-check-circle"></i> 데이터 신뢰성 <span class="json-key">[...aciRequirements.dataReliability]</span></h6>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>요구사항 <span class="json-key">[...dataReliability.requirement]</span></label>
                            <textarea name="session_${sessionId}_data_reliability" rows="2" placeholder="예: 출처가 불분명한 통계는 배제하고, 공신력 있는 기관의 데이터로 검증하여 대체할 것.">${dataReliability ? this.escapeHtml(dataReliability.requirement || '') : ''}</textarea>
                        </div>
                    </div>
                </div>

                <!-- 필수 키워드 & 제약 조건 -->
                <div class="aci-section">
                    <h6><i class="fas fa-key"></i> 키워드 및 제약 조건</h6>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>필수 키워드 <span class="json-key">[...aciRequirements.requiredKeywords]</span></label>
                            <input type="text" name="session_${sessionId}_keywords" placeholder="예: 디지털 헬스케어, 구독 경제, 마이데이터" value="${requiredKeywords ? this.escapeHtml(requiredKeywords.requirement || '') : ''}">
                            <small class="form-hint">출력물에 반드시 포함되어야 하는 키워드를 쉼표로 구분하여 입력하세요.</small>
                        </div>
                        <div class="form-group full-width">
                            <label>제약 조건 <span class="json-key">[...aciRequirements.constraints]</span></label>
                            <input type="text" name="session_${sessionId}_constraints" placeholder="예: 특정 단어 사용 금지, 형식 제한 등" value="${constraints ? this.escapeHtml(constraints.constraint || '') : ''}">
                            <small class="form-hint">제약 조건이 있으면 쉼표로 구분하여 입력하세요. 없으면 비워두세요.</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 세션 삭제
     */
    removeSession(button) {
        const item = button.closest('.session-item');
        if (item) {
            item.remove();

            // 빈 상태 표시 확인
            const container = document.getElementById('sessionsContainer');
            const emptyState = document.getElementById('sessionsEmpty');
            if (container && emptyState && container.children.length === 0) {
                emptyState.style.display = 'block';
            }

            this.handleFormInput();
        }
    }

    /**
     * 원본 데이터 추가
     */
    addRawData(sessionId) {
        this.addRawDataElement(sessionId, null);
        this.handleFormInput();
    }

    /**
     * 원본 데이터 요소 추가
     */
    addRawDataElement(sessionId, rawDataData = null) {
        const container = document.getElementById(`rawDataContainer_${sessionId}`);
        if (!container) return;

        const rawDataId = `rawData_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const rawDataCount = container.children.length + 1;
        const source = rawDataData ? rawDataData.source : '';
        const content = rawDataData ? rawDataData.content : '';
        const risks = rawDataData ? rawDataData.risks : '';

        const rawDataElement = document.createElement('div');
        rawDataElement.className = 'raw-data-item';
        rawDataElement.dataset.rawDataId = rawDataId;
        rawDataElement.innerHTML = `
            <div class="raw-data-header">
                <span class="raw-data-label">원본 데이터 ${rawDataCount}</span>
                <button type="button" class="btn-remove-small" onclick="window.createAssignmentManager.removeRawData(this);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>출처 <span class="json-key">[...rawData[].source]</span></label>
                    <input type="text" name="${rawDataId}_source" placeholder="예: 대표님의 메모" value="${this.escapeHtml(source)}">
                    <small class="form-hint">원본 데이터의 출처를 입력하세요.</small>
                </div>
                <div class="form-group full-width">
                    <label>내용 <span class="json-key">[...rawData[].content]</span></label>
                    <textarea name="${rawDataId}_content" rows="5" placeholder="각 줄에 내용을 입력하세요. 예:&#10;1. 김 PM, 우리 앱 이름은 '꿀잠'이야...&#10;2. 마케팅 핵심: 우리 앱 쓰면...">${this.escapeHtml(content)}</textarea>
                    <small class="form-hint">원본 데이터의 내용을 줄바꿈으로 구분하여 입력하세요.</small>
                </div>
                <div class="form-group full-width">
                    <label>리스크 <span class="json-key">[...rawData[].risks]</span></label>
                    <textarea name="${rawDataId}_risks" rows="3" placeholder="각 줄에 리스크를 입력하세요. 예:&#10;의료법 위반 가능성 (과장 광고)&#10;개인정보보호법 위반 가능성">${this.escapeHtml(risks)}</textarea>
                    <small class="form-hint">이 원본 데이터에 포함된 법적, 윤리적 리스크를 입력하세요.</small>
                </div>
            </div>
        `;

        container.appendChild(rawDataElement);
    }

    /**
     * 원본 데이터 삭제
     */
    removeRawData(button) {
        const item = button.closest('.raw-data-item');
        if (item) {
            item.remove();
            this.handleFormInput();
        }
    }

    /**
     * 필수 섹션 (구성 요소) 추가
     */
    addRequiredSection(sessionId) {
        const container = document.getElementById(`requiredSectionsContainer_${sessionId}`);
        if (!container) return;

        const sectionId = `reqSection_${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sectionCount = container.children.length + 1;
        const sectionElement = document.createElement('div');
        sectionElement.className = 'required-section-item';
        sectionElement.dataset.sectionId = sectionId;
        sectionElement.innerHTML = `
            <div class="required-section-header">
                <span class="required-section-label">구성 요소 ${sectionCount}</span>
                <button type="button" class="btn-remove-small" onclick="window.createAssignmentManager.removeRequiredSection(this);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>순서 <span class="json-key">[...requiredSections[].order]</span></label>
                    <input type="number" name="${sectionId}_order" min="1" value="${sectionCount}" placeholder="1">
                </div>
                <div class="form-group">
                    <label>제목 <span class="json-key">[...requiredSections[].title]</span></label>
                    <input type="text" name="${sectionId}_title" placeholder="예: 헤드라인 (이모지 포함)">
                </div>
                <div class="form-group full-width">
                    <label>내용 <span class="json-key">[...requiredSections[].content]</span></label>
                    <input type="text" name="${sectionId}_content" placeholder="예: 인스타그램 게시글의 첫 부분으로 주목을 끄는 헤드라인과 이모지 포함">
                </div>
            </div>
        `;

        container.appendChild(sectionElement);
        this.handleFormInput();
    }

    /**
     * 필수 섹션 (구성 요소) 삭제
     */
    removeRequiredSection(button) {
        const item = button.closest('.required-section-item');
        if (item) {
            item.remove();
            this.handleFormInput();
        }
    }

    // ============================================================
    // 폼 데이터 수집
    // ============================================================

    /**
     * 폼 데이터 수집
     */
    collectFormData() {
        const form = document.getElementById('assignmentForm');
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        // 먼저 현재 선택된 과제의 폼 데이터 저장
        if (this.selectedTaskIndex !== null) {
            this.saveCurrentTaskForm();
        }

        // 과제 메타데이터
        const now = new Date().toISOString();
        data.docMetadata = {
            title: formData.get('docTitle') || '',
            description: formData.get('docDescription') || '',
            version: formData.get('docVersion') || 'v1.0.0',
            mode: formData.get('docMode') || '',
            competency: formData.get('competencyCode') || '',
            created: now,
            lastModified: now
        };

        // tasks 배열 (복수 과제 지원)
        data.tasks = this.tasks.map((task, index) => ({
            taskNumber: task.taskNumber,
            title: task.title || '',
            objective: task.objective || '',
            mission: task.mission || '',
            timeLimit: task.timeLimit || 0,
            scoringTips: task.scoringTips || [],
            sessions: task.sessions || []
        }));

        return data;
    }

    /**
     * JSON 미리보기 업데이트
     */
    updateJsonPreview() {
        const preview = document.getElementById('jsonPreview');
        if (!preview) return;

        const data = this.collectFormData();
        if (data) {
            preview.textContent = JSON.stringify(data, null, 2);
        }
    }

    /**
     * JSON 다운로드
     */
    downloadJson() {
        // 현재 선택된 과제의 폼 데이터 저장
        if (this.selectedTaskIndex !== null) {
            this.saveCurrentTaskForm();
        }

        const data = this.collectFormData();
        if (!data) {
            this.showError('데이터를 생성할 수 없습니다.');
            return;
        }

        // 필수 필드 검증
        if (!data.docMetadata.title || !data.docMetadata.competency) {
            this.showError('필수 필드를 모두 입력해주세요.');
            return;
        }

        if (data.tasks.length === 0) {
            this.showError('최소한 하나의 과제를 추가해주세요.');
            return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.docMetadata.competency}_${data.docMetadata.mode}_시나리오.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('JSON 파일이 다운로드되었습니다.');
    }

    /**
     * 폼 제출 처리
     */
    handleSubmit(e) {
        e.preventDefault();

        // 현재 선택된 과제의 폼 데이터 저장
        if (this.selectedTaskIndex !== null) {
            this.saveCurrentTaskForm();
        }

        const data = this.collectFormData();
        if (!data) {
            this.showError('데이터를 생성할 수 없습니다.');
            return;
        }

        // 필수 필드 검증
        if (!data.docMetadata.title || !data.docMetadata.competency) {
            this.showError('필수 필드를 모두 입력해주세요.');
            return;
        }

        if (data.tasks.length === 0) {
            this.showError('최소한 하나의 과제를 추가해주세요.');
            return;
        }

        // LocalStorage에 저장
        this.saveToLocalStorage(data);

        this.showSuccess('과제가 저장되었습니다.');

        // 관리자 페이지로 이동
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    }

    /**
     * LocalStorage에 저장
     */
    saveToLocalStorage(data) {
        // 과제 ID 생성
        const assignmentId = `ASG${String(Date.now()).slice(-6)}`;

        // 저장할 데이터 구조
        const assignmentData = {
            id: assignmentId,
            ...data,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // 기존 과제 목록 가져오기
        const existingAssignments = JSON.parse(localStorage.getItem('sandwitchUI_assignments') || '[]');

        // 새 과제 추가
        existingAssignments.push(assignmentData);

        // LocalStorage에 저장
        localStorage.setItem('sandwitchUI_assignments', JSON.stringify(existingAssignments));
    }

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    window.createAssignmentManager = new CreateAssignmentManager();
});

// 새 과제 생성 관리 클래스
class CreateAssignmentManager {
    constructor() {
        this.scoringTipCount = 0;
        this.sessionCount = 0;
        this.init();
    }

    init() {
        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 빈 상태 표시
        this.updateEmptyStates();

        // 초기 JSON 미리보기 업데이트
        this.updateJsonPreview();
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

        // 역량 코드 선택 시 자동 입력
        const competencyCodeSelect = document.getElementById('competencyCode');
        if (competencyCodeSelect) {
            competencyCodeSelect.addEventListener('change', (e) => {
                this.handleCompetencyCodeChange(e.target);
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
            form.addEventListener('input', () => this.updateJsonPreview());
            form.addEventListener('change', () => this.updateJsonPreview());
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 다운로드 버튼
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadJson());
        }
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

    /**
     * 채점 팁 추가
     */
    addScoringTip() {
        const container = document.getElementById('scoringTipsContainer');
        if (!container) return;

        this.scoringTipCount++;
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
                <textarea name="${tipId}" rows="3" placeholder="채점 팁을 입력하세요. 예: AI에게 명확한 역할(Role)과 상황(Context)을 부여하세요." class="scoring-tip-input"></textarea>
            </div>
        `;

        container.appendChild(tipElement);
        
        // 빈 상태 숨기기
        const emptyState = document.getElementById('scoringTipsEmpty');
        if (emptyState) emptyState.style.display = 'none';
        
        this.updateJsonPreview();
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
            
            this.updateJsonPreview();
        }
    }

    /**
     * 세션 추가
     */
    addSession() {
        const container = document.getElementById('sessionsContainer');
        if (!container) return;

        this.sessionCount++;
        const sessionId = this.sessionCount;

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
                <textarea name="session_${sessionId}_situation" rows="5" required placeholder="학습자에게 제공할 상황 설명을 입력하세요. 예: 당신은 헬스케어 스타트업 'P-Lab'의 기획자(PM)입니다..."></textarea>
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
                                <input type="text" name="session_${sessionId}_aes_description" placeholder="예: AES 검증 (법적/사회적 리스크 관리)">
                            </div>
                            <div class="form-group full-width">
                                <label>요구사항 <span class="json-key">[...aesRequirements.requirement]</span></label>
                                <textarea name="session_${sessionId}_aes_requirement" rows="4" placeholder="예: 대표님의 지시 중 AES평가 요소에 위배되는 사항을 찾아내어, 수정할 것."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACI 요구사항 탭 컨텐츠 -->
                <div class="output-req-content" id="output-aci_${sessionId}">
                    <div class="form-subsection-content">
                        <h5 class="subsection-title">ACI 요구사항 <span class="json-key">[...aciRequirements]</span></h5>
                        <p class="form-section-description">ACI(Accuracy, Completeness, Integrity) - 출력 형식, 구조, 데이터 신뢰성 관련 요구사항을 정의합니다.</p>
                        
                        <!-- 형식 (format) -->
                        <div class="aci-section">
                            <h6><i class="fas fa-align-left"></i> 형식 <span class="json-key">[...aciRequirements.format]</span></h6>
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>형식 설명 <span class="json-key">[...format.description]</span></label>
                                    <input type="text" name="session_${sessionId}_format_description" placeholder="예: 출력 형식 요구사항" value="출력 형식 요구사항">
                                </div>
                                <div class="form-group">
                                    <label>스타일 <span class="json-key">[...format.style]</span></label>
                                    <input type="text" name="session_${sessionId}_aci_style" placeholder="예: 서술형 줄글이 아닌 개조식 리스트 형태">
                                </div>
                                <div class="form-group">
                                    <label>길이 <span class="json-key">[...format.length]</span></label>
                                    <input type="text" name="session_${sessionId}_aci_length" placeholder="예: 공백 포함 500자 ~ 700자 이내">
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
                                    <input type="text" name="session_${sessionId}_notation_description" placeholder="예: 필수 표기 사항" value="필수 표기 사항">
                                </div>
                                <div class="form-group">
                                    <label>요구사항 <span class="json-key">[...requiredNotation.requirement]</span></label>
                                    <input type="text" name="session_${sessionId}_notation_requirement" placeholder="예: 출처 표기 필수">
                                </div>
                                <div class="form-group">
                                    <label>텍스트 <span class="json-key">[...requiredNotation.text]</span></label>
                                    <input type="text" name="session_${sessionId}_notation_text" placeholder="예: [출처: OOO]">
                                </div>
                            </div>
                        </div>

                        <!-- 데이터 신뢰성 -->
                        <div class="aci-section">
                            <h6><i class="fas fa-check-circle"></i> 데이터 신뢰성 <span class="json-key">[...aciRequirements.dataReliability]</span></h6>
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>요구사항 <span class="json-key">[...dataReliability.requirement]</span></label>
                                    <textarea name="session_${sessionId}_data_reliability" rows="2" placeholder="예: 출처가 불분명한 통계는 배제하고, 공신력 있는 기관의 데이터로 검증하여 대체할 것."></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- 필수 키워드 & 제약 조건 -->
                        <div class="aci-section">
                            <h6><i class="fas fa-key"></i> 키워드 및 제약 조건</h6>
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>필수 키워드 <span class="json-key">[...aciRequirements.requiredKeywords]</span></label>
                                    <input type="text" name="session_${sessionId}_keywords" placeholder="예: 디지털 헬스케어, 구독 경제, 마이데이터">
                                    <small class="form-hint">출력물에 반드시 포함되어야 하는 키워드를 쉼표로 구분하여 입력하세요.</small>
                                </div>
                                <div class="form-group full-width">
                                    <label>제약 조건 <span class="json-key">[...aciRequirements.constraints]</span></label>
                                    <input type="text" name="session_${sessionId}_constraints" placeholder="예: 특정 단어 사용 금지, 형식 제한 등">
                                    <small class="form-hint">제약 조건이 있으면 쉼표로 구분하여 입력하세요. 없으면 비워두세요.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(sessionElement);
        
        // 빈 상태 숨기기
        const emptyState = document.getElementById('sessionsEmpty');
        if (emptyState) emptyState.style.display = 'none';
        
        // 초기 원본 데이터 추가
        this.addRawData(sessionId);
        this.updateJsonPreview();
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
            
            this.updateJsonPreview();
        }
    }

    /**
     * 원본 데이터 추가
     */
    addRawData(sessionId) {
        const container = document.getElementById(`rawDataContainer_${sessionId}`);
        if (!container) return;

        const rawDataId = `rawData_${Date.now()}`;
        const rawDataCount = container.children.length + 1;
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
                    <input type="text" name="${rawDataId}_source" placeholder="예: 대표님의 메모">
                    <small class="form-hint">원본 데이터의 출처를 입력하세요.</small>
                </div>
                <div class="form-group full-width">
                    <label>내용 <span class="json-key">[...rawData[].content]</span></label>
                    <textarea name="${rawDataId}_content" rows="5" placeholder="각 줄에 내용을 입력하세요. 예:&#10;1. 김 PM, 우리 앱 이름은 '꿀잠'이야...&#10;2. 마케팅 핵심: 우리 앱 쓰면..."></textarea>
                    <small class="form-hint">원본 데이터의 내용을 줄바꿈으로 구분하여 입력하세요.</small>
                </div>
                <div class="form-group full-width">
                    <label>리스크 <span class="json-key">[...rawData[].risks]</span></label>
                    <textarea name="${rawDataId}_risks" rows="3" placeholder="각 줄에 리스크를 입력하세요. 예:&#10;의료법 위반 가능성 (과장 광고)&#10;개인정보보호법 위반 가능성"></textarea>
                    <small class="form-hint">이 원본 데이터에 포함된 법적, 윤리적 리스크를 입력하세요.</small>
                </div>
            </div>
        `;

        container.appendChild(rawDataElement);
        this.updateJsonPreview();
    }

    /**
     * 원본 데이터 삭제
     */
    removeRawData(button) {
        const item = button.closest('.raw-data-item');
        if (item) {
            item.remove();
            this.updateJsonPreview();
        }
    }

    /**
     * 필수 섹션 (구성 요소) 추가
     */
    addRequiredSection(sessionId) {
        const container = document.getElementById(`requiredSectionsContainer_${sessionId}`);
        if (!container) return;

        const sectionId = `reqSection_${sessionId}_${Date.now()}`;
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
        this.updateJsonPreview();
    }

    /**
     * 필수 섹션 (구성 요소) 삭제
     */
    removeRequiredSection(button) {
        const item = button.closest('.required-section-item');
        if (item) {
            item.remove();
            this.updateJsonPreview();
        }
    }

    /**
     * 폼 데이터 수집
     */
    collectFormData() {
        const form = document.getElementById('assignmentForm');
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        // 과제 메타데이터
        const now = new Date().toISOString();
        data.docMetadata = {
            title: formData.get('docTitle') || '',
            description: formData.get('docDescription') || '',
            version: formData.get('docVersion') || 'v1.0.0',
            mode: formData.get('docMode') || '',
            competency: {
                code: formData.get('competencyCode') || '',
                name_kr: formData.get('competencyNameKr') || '',
                name_en: formData.get('competencyNameEn') || '',
                description: formData.get('competencyDescription') || ''
            },
            created: now,
            lastModified: now
        };

        // 과제 정보
        const taskId = parseInt(formData.get('taskId')) || 1;
        data.tasks = [{
            taskId: taskId,
            title: formData.get('taskTitle') || '',
            objective: formData.get('taskObjective') || '',
            mission: formData.get('taskMission') || '',
            scoringTips: [],
            sessions: []
        }];

        // 채점 팁 수집
        const scoringTipInputs = document.querySelectorAll('.scoring-tip-input');
        scoringTipInputs.forEach(input => {
            const tip = input.value.trim();
            if (tip) {
                data.tasks[0].scoringTips.push({ tip });
            }
        });

        // 세션 수집
        const sessionItems = document.querySelectorAll('.session-item');
        sessionItems.forEach((sessionItem, index) => {
            const sessionId = parseInt(sessionItem.dataset.sessionId) || (index + 1);
            const situation = formData.get(`session_${sessionId}_situation`) || '';

            const session = {
                sessionId: sessionId,
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
                                description: formData.get(`session_${sessionId}_data_reliability_description`) || '데이터 신뢰성',
                                requirement: formData.get(`session_${sessionId}_data_reliability`) || ''
                            },
                            requiredKeywords: [],
                            constraints: []
                        }
                    }
                }
            };

            // 필수 키워드 수집
            const keywords = formData.get(`session_${sessionId}_keywords`) || '';
            if (keywords) {
                session.userDisplays.outputRequirements.aciRequirements.requiredKeywords = 
                    keywords.split(',').map(k => k.trim()).filter(k => k);
            }

            // 제약 조건 수집
            const constraints = formData.get(`session_${sessionId}_constraints`) || '';
            if (constraints) {
                session.userDisplays.outputRequirements.aciRequirements.constraints = 
                    constraints.split(',').map(c => c.trim()).filter(c => c);
            }

            // 원본 데이터 수집
            const rawDataItems = sessionItem.querySelectorAll('.raw-data-item');
            rawDataItems.forEach(rawDataItem => {
                const rawDataId = rawDataItem.dataset.rawDataId;
                const source = formData.get(`${rawDataId}_source`) || '';
                const contentText = formData.get(`${rawDataId}_content`) || '';
                const risksText = formData.get(`${rawDataId}_risks`) || '';

                if (source || contentText) {
                    const rawData = {
                        source: source,
                        content: contentText.split('\n').filter(line => line.trim()),
                        risks: risksText.split('\n').filter(line => line.trim())
                    };
                    session.userDisplays.rawData.push(rawData);
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

            data.tasks[0].sessions.push(session);
        });

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
        const data = this.collectFormData();
        if (!data) {
            this.showError('데이터를 생성할 수 없습니다.');
            return;
        }

        // 필수 필드 검증
        if (!data.docMetadata.title || !data.docMetadata.competency.code) {
            this.showError('필수 필드를 모두 입력해주세요.');
            return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.docMetadata.competency.code}_${data.docMetadata.mode}_시나리오.json`;
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

        const data = this.collectFormData();
        if (!data) {
            this.showError('데이터를 생성할 수 없습니다.');
            return;
        }

        // 필수 필드 검증
        if (!data.docMetadata.title || !data.docMetadata.competency.code || !data.tasks[0].title) {
            this.showError('필수 필드를 모두 입력해주세요.');
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


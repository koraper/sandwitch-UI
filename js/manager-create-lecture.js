// 강사(매니저) 특강 개설 페이지 관리 클래스
class ManagerCreateLectureManager {
    constructor() {
        this.currentUser = null;
        this.availableAssignments = [];  // 사용 가능한 과제 목록
        this.competencyConfig = [       // 4개 역량 설정
            {
                code: 'PPS',
                name: '프롬프트 문제해결력',
                icon: 'fa-lightbulb'
            },
            {
                code: 'DIG',
                name: '데이터 기반 통찰력',
                icon: 'fa-chart-line'
            },
            {
                code: 'GCC',
                name: '생성형 콘텐츠 제작 능력',
                icon: 'fa-palette'
            },
            {
                code: 'WFA',
                name: '업무자동화·도구활용 능력',
                icon: 'fa-cogs'
            }
        ];
        this.init();
    }

    init() {
        // 로그인 상태 및 권한 확인
        this.checkLoginStatus();

        // 사용자 정보 로드
        this.loadUserInfo();

        // 과제 목록 로드
        this.loadAvailableAssignments();

        // 역량 매칭 UI 초기화
        this.initializeCompetencyMatching();

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    /**
     * 로그인 상태 및 매니저 권한 확인
     */
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('sandwitchUI_loggedIn');
        const userRole = localStorage.getItem('sandwitchUI_userRole');

        if (!isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }

        if (userRole && userRole !== 'manager') {
            console.warn('매니저 권한이 필요합니다. (데모 모드로 진행)');
        }
    }

    /**
     * 사용자 정보 로드
     */
    loadUserInfo() {
        const email = localStorage.getItem('sandwitchUI_userEmail');
        const name = localStorage.getItem('sandwitchUI_userName') || email?.split('@')[0] || '강사';

        this.currentUser = {
            email: email,
            name: name,
            role: 'manager'
        };

        // 사용자 이름 표시
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = this.currentUser.name;
        }

        // 강사명 자동 입력
        const instructorInput = document.getElementById('instructorName');
        if (instructorInput && !instructorInput.value) {
            instructorInput.value = this.currentUser.name;
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 돌아가기 버튼
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        // 취소 버튼
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.goBack());
        }

        // 프로필 클릭
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                window.location.href = 'manager-profile.html';
            });
        }

        // 폼 제출
        const createLectureForm = document.getElementById('createLectureForm');
        if (createLectureForm) {
            createLectureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateLecture();
            });
        }

        // 모달 관련 이벤트
        this.setupModalEvents();
    }

    /**
     * 모달 이벤트 설정
     */
    setupModalEvents() {
        // 코드 표시 모달
        const codeModalOverlay = document.getElementById('codeModalOverlay');
        const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
        const copyCodeBtn = document.getElementById('copyCodeBtn');

        if (codeModalOverlay) {
            codeModalOverlay.addEventListener('click', () => this.hideCodeModal());
        }

        if (closeCodeModalBtn) {
            closeCodeModalBtn.addEventListener('click', () => this.hideCodeModalAndGoBack());
        }

        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => this.copyAccessCode());
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCodeModal();
            }
        });
    }

    /**
     * 뒤로 가기
     */
    goBack() {
        window.location.href = 'manager-waiting-room.html';
    }

    /**
     * 사용 가능한 과제 목록 로드
     */
    loadAvailableAssignments() {
        try {
            const stored = localStorage.getItem('sandwitchUI_assignments');
            if (stored) {
                this.availableAssignments = JSON.parse(stored);
            }

            // 테스트용: 과제가 없으면 샘플 데이터 생성
            if (this.availableAssignments.length === 0) {
                this.createSampleAssignments();
            }
        } catch (error) {
            console.error('과제 목록 로드 실패:', error);
            this.availableAssignments = [];
            this.createSampleAssignments();
        }
    }

    /**
     * 테스트용 샘플 과제 생성
     */
    createSampleAssignments() {
        const sampleAssignments = [
            {
                id: 'sample-pps-learning-1',
                docMetadata: {
                    id: 'sample-pps-learning-1',
                    title: 'PPS 학습모드: AI로 문제해결 프롬프트 작성',
                    competency: {
                        code: 'PPS',
                        name: '프롬프트 문제해결력'
                    },
                    mode: '학습모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '고객 불만 사례 분석 및 해결 방안 제시'
                }]
            },
            {
                id: 'sample-pps-evaluation-1',
                docMetadata: {
                    id: 'sample-pps-evaluation-1',
                    title: 'PPS 평가모드: 복잡한 비즈니스 문제 해결',
                    competency: {
                        code: 'PPS',
                        name: '프롬프트 문제해결력'
                    },
                    mode: '평가모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '기업 리스크 분석 및 대응 전략 수립'
                }]
            },
            {
                id: 'sample-dig-learning-1',
                docMetadata: {
                    id: 'sample-dig-learning-1',
                    title: 'DIG 학습모드: 데이터 분석 기초',
                    competency: {
                        code: 'DIG',
                        name: '데이터 기반 통찰력'
                    },
                    mode: '학습모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '판매 데이터 분석 및 인사이트 도출'
                }]
            },
            {
                id: 'sample-dig-evaluation-1',
                docMetadata: {
                    id: 'sample-dig-evaluation-1',
                    title: 'DIG 평가모드: 고급 데이터 분석',
                    competency: {
                        code: 'DIG',
                        name: '데이터 기반 통찰력'
                    },
                    mode: '평가모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '대규모 데이터셋 분석 및 보고서 작성'
                }]
            },
            {
                id: 'sample-gcc-learning-1',
                docMetadata: {
                    id: 'sample-gcc-learning-1',
                    title: 'GCC 학습모드: AI 콘텐츠 생성 기초',
                    competency: {
                        code: 'GCC',
                        name: '생성형 콘텐츠 제작 능력'
                    },
                    mode: '학습모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '마케팅 카피라이팅 생성하기'
                }]
            },
            {
                id: 'sample-gcc-evaluation-1',
                docMetadata: {
                    id: 'sample-gcc-evaluation-1',
                    title: 'GCC 평가모드: 멀티미디어 콘텐츠 제작',
                    competency: {
                        code: 'GCC',
                        name: '생성형 콘텐츠 제작 능력'
                    },
                    mode: '평가모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '브랜드 스토리텔링 및 시각 자료 생성'
                }]
            },
            {
                id: 'sample-wfa-learning-1',
                docMetadata: {
                    id: 'sample-wfa-learning-1',
                    title: 'WFA 학습모드: 업무 자동화 입문',
                    competency: {
                        code: 'WFA',
                        name: '업무자동화·도구활용 능력'
                    },
                    mode: '학습모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '반복 업무 프로세스 자동화 설계'
                }]
            },
            {
                id: 'sample-wfa-evaluation-1',
                docMetadata: {
                    id: 'sample-wfa-evaluation-1',
                    title: 'WFA 평가모드: 고급 자동화 시스템 구축',
                    competency: {
                        code: 'WFA',
                        name: '업무자동화·도구활용 능력'
                    },
                    mode: '평가모드',
                    created: new Date().toISOString()
                },
                tasks: [{
                    taskNumber: 1,
                    title: '종합 업무 자동화 워크플로우 설계'
                }]
            }
        ];

        // LocalStorage에 저장
        localStorage.setItem('sandwitchUI_assignments', JSON.stringify(sampleAssignments));
        this.availableAssignments = sampleAssignments;

        console.log('샘플 과제 데이터가 생성되었습니다:', sampleAssignments.length, '개');
    }

    /**
     * 역량별 과제 매칭 UI 초기화
     */
    initializeCompetencyMatching() {
        const grid = document.getElementById('competencyMatchingGrid');
        const emptyState = document.getElementById('assignmentsEmptyState');

        if (!grid) return;

        // 과제가 없는 경우 빈 상태 표시
        if (this.availableAssignments.length === 0) {
            grid.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        // 각 역량 카드 생성
        this.competencyConfig.forEach(competency => {
            const card = this.createCompetencyCard(competency);
            grid.appendChild(card);
        });

        // 셀렉트 박스에 과제 옵션 채우기
        this.populateAssignmentSelects();
    }

    /**
     * 역량 카드 엘리먼트 생성
     */
    createCompetencyCard(competency) {
        const card = document.createElement('div');
        card.className = 'competency-matching-card';
        card.setAttribute('data-competency', competency.code);

        const learningId = `${competency.code.toLowerCase()}-learning`;
        const evaluationId = `${competency.code.toLowerCase()}-evaluation`;

        card.innerHTML = `
            <div class="competency-matching-header">
                <div class="competency-info">
                    <div class="competency-code">${competency.code}</div>
                    <div class="competency-name">${competency.name}</div>
                </div>
                <div class="competency-icon">
                    <i class="fas ${competency.icon}"></i>
                </div>
            </div>
            <div class="competency-matching-body">
                <div class="mode-selection-group">
                    <div class="form-group">
                        <label for="${learningId}">
                            <i class="fas fa-graduation-cap"></i> 학습모드
                        </label>
                        <select id="${learningId}"
                                class="form-select competency-assignment-select"
                                data-competency="${competency.code}"
                                data-mode="학습모드">
                            <option value="">메타데이터 선택 안 함</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="${evaluationId}">
                            <i class="fas fa-clock"></i> 평가모드
                        </label>
                        <select id="${evaluationId}"
                                class="form-select competency-assignment-select"
                                data-competency="${competency.code}"
                                data-mode="평가모드">
                            <option value="">메타데이터 선택 안 함</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * 셀렉트 박스에 과제 옵션 동적 추가
     */
    populateAssignmentSelects() {
        const selects = document.querySelectorAll('.competency-assignment-select');

        selects.forEach(select => {
            const competency = select.getAttribute('data-competency');
            const mode = select.getAttribute('data-mode');

            // 해당 역량/모드에 맞는 과제 필터링
            const filteredAssignments = this.availableAssignments.filter(assignment => {
                const assignmentCompetency = assignment.docMetadata?.competency?.code;
                const assignmentMode = assignment.docMetadata?.mode;
                return assignmentCompetency === competency && assignmentMode === mode;
            });

            // 옵션 추가
            filteredAssignments.forEach(assignment => {
                let title = assignment.docMetadata?.title ||
                             (assignment.tasks && assignment.tasks[0]?.title) ||
                             '제목 없음';

                // 접두사 제거 (예: "PPS 학습모드:", "DIG 평가모드:" 등)
                title = title.replace(/^[A-Z]{3,4}\s+(학습모드|평가모드):\s*/, '');

                const option = document.createElement('option');
                option.value = assignment.id || assignment.docMetadata?.id || Date.now() + Math.random();
                option.textContent = title;
                select.appendChild(option);
            });

            // 선택 변경 이벤트 리스너
            select.addEventListener('change', () => {
                this.updateCardSelectionState(select);
            });
        });
    }

    /**
     * 카드 선택 상태 업데이트
     */
    updateCardSelectionState(select) {
        const card = select.closest('.competency-matching-card');
        const allSelects = card.querySelectorAll('.competency-assignment-select');

        const hasSelection = Array.from(allSelects).some(s => s.value !== '');

        if (hasSelection) {
            card.classList.add('has-assignments');
        } else {
            card.classList.remove('has-assignments');
        }
    }

    /**
     * 선택된 역량 과제 매칭 데이터 수집
     */
    getCompetencyAssignments() {
        const selects = document.querySelectorAll('.competency-assignment-select');
        const assignments = {};

        selects.forEach(select => {
            const competency = select.getAttribute('data-competency');
            const mode = select.getAttribute('data-mode');
            const assignmentId = select.value;

            if (assignmentId) {
                if (!assignments[competency]) {
                    assignments[competency] = {};
                }
                assignments[competency][mode] = assignmentId;
            }
        });

        return assignments;
    }

    /**
     * 특강 생성 처리
     */
    async handleCreateLecture() {
        const submitBtn = document.getElementById('submitBtn');

        // 폼 데이터 수집
        const formData = {
            title: document.getElementById('lectureName').value.trim(),
            institution: document.getElementById('institution').value.trim(),
            instructor: document.getElementById('instructorName').value.trim() || this.currentUser.name,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            location: document.getElementById('location').value.trim(),
            description: document.getElementById('description').value.trim(),
            showStudentId: true,  // 학번은 항상 표시 (필수 입력 사항)
            competencyAssignments: this.getCompetencyAssignments()  // 역량별 과제 매칭
        };

        // 필수값 검증
        if (!formData.title || !formData.institution || !formData.startDate || !formData.endDate) {
            this.showError('필수 항목을 모두 입력해주세요.');
            return;
        }

        // 날짜 검증
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            this.showError('종료 일시는 시작 일시보다 이후여야 합니다.');
            return;
        }

        try {
            // 버튼 비활성화
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
            }

            // 실제로는 서버 API 호출
            // const response = await fetch('/api/manager/lectures', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });
            // const result = await response.json();

            // 데모용: 6자리 랜덤 코드 생성
            const accessCode = this.generateAccessCode();

            const newLecture = {
                id: Date.now(),
                ...formData,
                accessCode: accessCode,
                status: 'upcoming',
                participantCount: 0
            };

            // LocalStorage에 저장 (매니저 대기실에서 사용)
            this.saveLectureToStorage(newLecture);

            // 코드 표시 모달
            this.showCodeModal(newLecture);

        } catch (error) {
            console.error('특강 생성 실패:', error);
            this.showError('특강 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            // 버튼 복원
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> 개설하기';
            }
        }
    }

    /**
     * 6자리 입장 코드 생성
     */
    generateAccessCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * LocalStorage에 특강 저장
     */
    saveLectureToStorage(lecture) {
        // 기존 특강 목록 가져오기
        let lectures = [];
        const stored = localStorage.getItem('sandwitchUI_managerLectures');
        if (stored) {
            try {
                lectures = JSON.parse(stored);
            } catch (e) {
                console.error('기존 데이터 파싱 실패:', e);
            }
        }

        // 새 특강 추가
        lectures.unshift(lecture);

        // 저장
        localStorage.setItem('sandwitchUI_managerLectures', JSON.stringify(lectures));
    }

    /**
     * 코드 표시 모달 표시
     */
    showCodeModal(lecture) {
        const modal = document.getElementById('codeDisplayModal');
        const codeDisplay = document.getElementById('displayAccessCode');
        const lectureName = document.getElementById('createdLectureName');
        const lectureDate = document.getElementById('createdLectureDate');

        if (modal) {
            modal.classList.add('modal-show');
            document.body.style.overflow = 'hidden';

            if (codeDisplay) codeDisplay.textContent = lecture.accessCode;
            if (lectureName) lectureName.textContent = lecture.title;
            if (lectureDate) {
                const startDate = new Date(lecture.startDate);
                lectureDate.textContent = startDate.toLocaleString('ko-KR');
            }
        }
    }

    /**
     * 코드 표시 모달 숨기기
     */
    hideCodeModal() {
        const modal = document.getElementById('codeDisplayModal');
        if (modal) {
            modal.classList.remove('modal-show');
            document.body.style.overflow = '';
        }

        // 피드백 숨기기
        const feedback = document.getElementById('copyFeedback');
        if (feedback) feedback.style.display = 'none';
    }

    /**
     * 코드 표시 모달 숨기고 뒤로 가기
     */
    hideCodeModalAndGoBack() {
        this.hideCodeModal();
        setTimeout(() => {
            this.goBack();
        }, 300);
    }

    /**
     * 입장 코드 복사
     */
    copyAccessCode() {
        const codeDisplay = document.getElementById('displayAccessCode');
        if (codeDisplay) {
            this.copyToClipboard(codeDisplay.textContent, null, true);
        }
    }

    /**
     * 클립보드에 복사
     */
    async copyToClipboard(text, button = null, showMainFeedback = false) {
        try {
            await navigator.clipboard.writeText(text);

            if (showMainFeedback) {
                const feedback = document.getElementById('copyFeedback');
                if (feedback) {
                    feedback.style.display = 'block';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 2000);
                }
            } else if (button) {
                const originalIcon = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerHTML = originalIcon;
                    button.classList.remove('copied');
                }, 1500);
            }
        } catch (error) {
            console.error('복사 실패:', error);
            this.showError('코드 복사에 실패했습니다.');
        }
    }

    // 알림 메서드들
    showError(message) {
        if (!window.modalManager) {
            alert(message);
            return;
        }
        window.modalManager.error(message);
    }

    showSuccess(message) {
        if (!window.modalManager) {
            alert(message);
            return;
        }
        window.modalManager.info(message);
    }

    showInfo(message) {
        if (!window.modalManager) {
            alert(message);
            return;
        }
        window.modalManager.info(message);
    }
}

// 매니저 특강 개설 페이지 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.managerCreateLectureManager = new ManagerCreateLectureManager();
});

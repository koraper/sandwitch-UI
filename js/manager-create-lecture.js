// 강사(매니저) 특강 개설 페이지 관리 클래스
class ManagerCreateLectureManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 로그인 상태 및 권한 확인
        this.checkLoginStatus();

        // 사용자 정보 로드
        this.loadUserInfo();

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
     * 특강 생성 처리
     */
    async handleCreateLecture() {
        const form = document.getElementById('createLectureForm');
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
            showStudentId: document.getElementById('showStudentId').checked
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

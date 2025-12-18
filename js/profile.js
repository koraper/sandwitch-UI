// 프로필 관리 클래스
class ProfileManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        // 로그인 상태 확인
        this.checkLoginStatus();
        
        // 사용자 정보 로드
        this.loadUserInfo();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
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
     * 사용자 정보 로드
     */
    loadUserInfo() {
        // LocalStorage에서 사용자 정보 로드
        const email = localStorage.getItem('sandwitchUI_userEmail') || '';
        const name = localStorage.getItem('sandwitchUI_userName') || '';
        const studentId = localStorage.getItem('sandwitchUI_studentId') || '';
        const phone = localStorage.getItem('sandwitchUI_phone') || '';

        this.userData = {
            email,
            name,
            studentId,
            phone
        };

        // 헤더에 사용자 이름 표시
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = name || email?.split('@')[0] || '사용자';
        }

        // 폼에 데이터 채우기
        this.populateForm();
    }

    /**
     * 폼에 데이터 채우기
     */
    populateForm() {
        const emailInput = document.getElementById('profileEmail');
        const nameInput = document.getElementById('profileName');
        const studentIdInput = document.getElementById('profileStudentId');
        const phoneInput = document.getElementById('profilePhone');

        if (emailInput) emailInput.value = this.userData.email;
        if (nameInput) nameInput.value = this.userData.name;
        if (studentIdInput) studentIdInput.value = this.userData.studentId;
        if (phoneInput) phoneInput.value = this.userData.phone;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 폼 제출
        const form = document.getElementById('profileForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSave();
            });
        }

        // 취소 버튼
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        // 로그아웃 버튼
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 비밀번호 표시/숨김 토글
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.closest('.input-wrapper').querySelector('input');
                const icon = e.target.closest('.toggle-password').querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // 새 비밀번호 확인 실시간 검증
        const newPassword = document.getElementById('newPassword');
        const newPasswordConfirm = document.getElementById('newPasswordConfirm');
        
        if (newPasswordConfirm) {
            newPasswordConfirm.addEventListener('input', () => {
                this.checkPasswordMatch();
            });
        }
        
        if (newPassword) {
            newPassword.addEventListener('input', () => {
                if (newPasswordConfirm.value) {
                    this.checkPasswordMatch();
                }
            });
        }
    }

    /**
     * 비밀번호 일치 확인
     */
    checkPasswordMatch() {
        const newPassword = document.getElementById('newPassword');
        const newPasswordConfirm = document.getElementById('newPasswordConfirm');
        const matchElement = document.getElementById('passwordMatch');

        if (!matchElement || !newPassword || !newPasswordConfirm) return;

        if (!newPasswordConfirm.value) {
            matchElement.textContent = '';
            matchElement.className = 'password-match';
            return;
        }

        if (newPassword.value === newPasswordConfirm.value) {
            matchElement.innerHTML = '<i class="fas fa-check-circle"></i> 비밀번호가 일치합니다';
            matchElement.className = 'password-match match';
        } else {
            matchElement.innerHTML = '<i class="fas fa-times-circle"></i> 비밀번호가 일치하지 않습니다';
            matchElement.className = 'password-match no-match';
        }
    }

    /**
     * 비밀번호 검증
     */
    validatePassword(password) {
        if (password.length < 8) {
            return { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
        }
        if (password.length > 50) {
            return { isValid: false, message: '비밀번호는 최대 50자까지 입력 가능합니다.' };
        }
        if (!/[A-Za-z]/.test(password)) {
            return { isValid: false, message: '비밀번호는 영어 대문자 또는 소문자를 포함해야 합니다.' };
        }
        if (!/[0-9]/.test(password)) {
            return { isValid: false, message: '비밀번호는 숫자를 포함해야 합니다.' };
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return { isValid: false, message: '비밀번호는 특수문자를 포함해야 합니다.' };
        }
        return { isValid: true, message: '' };
    }

    /**
     * 저장 처리
     */
    handleSave() {
        const name = document.getElementById('profileName')?.value.trim();
        const studentId = document.getElementById('profileStudentId')?.value.trim();
        const phone = document.getElementById('profilePhone')?.value.trim();
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const newPasswordConfirm = document.getElementById('newPasswordConfirm')?.value;

        // 필수 필드 검증
        if (!name) {
            this.showError('이름을 입력해주세요.');
            document.getElementById('profileName')?.focus();
            return;
        }

        if (!studentId) {
            this.showError('학번을 입력해주세요.');
            document.getElementById('profileStudentId')?.focus();
            return;
        }

        // 비밀번호 변경 검증 (하나라도 입력된 경우)
        const isPasswordChange = currentPassword || newPassword || newPasswordConfirm;
        
        if (isPasswordChange) {
            if (!currentPassword) {
                this.showError('현재 비밀번호를 입력해주세요.');
                document.getElementById('currentPassword')?.focus();
                return;
            }

            if (!newPassword) {
                this.showError('새 비밀번호를 입력해주세요.');
                document.getElementById('newPassword')?.focus();
                return;
            }

            // 새 비밀번호 복잡성 검증
            const passwordValidation = this.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                this.showError(passwordValidation.message);
                document.getElementById('newPassword')?.focus();
                return;
            }

            if (newPassword !== newPasswordConfirm) {
                this.showError('새 비밀번호가 일치하지 않습니다.');
                document.getElementById('newPasswordConfirm')?.focus();
                return;
            }

            // 현재 비밀번호 확인 (데모용: 아무 값이나 허용)
            // 실제로는 서버에서 검증해야 함
        }

        // 데이터 저장 (LocalStorage)
        localStorage.setItem('sandwitchUI_userName', name);
        localStorage.setItem('sandwitchUI_studentId', studentId);
        localStorage.setItem('sandwitchUI_phone', phone);

        // 비밀번호 변경 시 (데모용)
        if (isPasswordChange) {
            // 실제로는 서버 API 호출
            console.log('비밀번호 변경 요청');
        }

        // 성공 메시지
        this.showSuccess('프로필이 저장되었습니다.');

        // 헤더 이름 업데이트
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = name;
        }

        // 비밀번호 필드 초기화
        if (isPasswordChange) {
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('newPasswordConfirm').value = '';
            document.getElementById('passwordMatch').textContent = '';
        }
    }

    /**
     * 취소 처리
     */
    handleCancel() {
        window.modalManager.confirm(
            '변경사항을 저장하지 않고 돌아가시겠습니까?',
            () => {
                window.location.href = 'waiting-room.html';
            },
            null
        );
    }

    /**
     * 로그아웃 처리
     */
    handleLogout() {
        window.modalManager.confirm(
            '로그아웃 하시겠습니까?',
            () => {
                this.performLogout();
            },
            null
        );
    }

    /**
     * 로그아웃 실행
     */
    performLogout() {
        localStorage.removeItem('sandwitchUI_loggedIn');
        localStorage.removeItem('sandwitchUI_userEmail');
        localStorage.removeItem('sandwitchUI_userName');
        localStorage.removeItem('sandwitchUI_rememberMe');
        
        window.location.href = 'index.html';
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
}

// 프로필 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});


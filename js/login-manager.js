// 강사(매니저) 로그인 페이지 기능
class ManagerLoginManager {
    constructor() {
        this.init();
    }

    init() {
        // 로그인 상태 확인
        this.checkLoginStatus();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('sandwitchUI_loggedIn');
        const userRole = localStorage.getItem('sandwitchUI_userRole');
        const rememberMe = localStorage.getItem('sandwitchUI_rememberMe') === 'true';
        
        // 매니저로 로그인되어 있고 rememberMe가 true인 경우
        if (isLoggedIn && userRole === 'manager' && rememberMe) {
            // 자동 로그인 - 강사 대기실로 이동 (향후 구현)
            // window.location.href = 'manager-waiting-room.html';
        } else if (isLoggedIn && !rememberMe) {
            // 세션만 유지된 경우 (페이지 새로고침 시 로그아웃)
            localStorage.removeItem('sandwitchUI_loggedIn');
            localStorage.removeItem('sandwitchUI_userRole');
        }
    }

    setupEventListeners() {
        // 로그인 폼 제출
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 비밀번호 표시/숨김 토글
        const togglePasswordBtn = document.querySelector('.toggle-password');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }

        // 햄버거 아이콘 클릭 시 자동 입력
        const hamburgerIcon = document.querySelector('.fa-hamburger');
        if (hamburgerIcon) {
            hamburgerIcon.addEventListener('click', () => {
                this.fillLoginCredentials();
            });
        }

        // 회원가입 링크
        const signupLink = document.querySelector('.signup-link a');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignup();
            });
        }
    }

    fillLoginCredentials() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput) {
            emailInput.value = 'manager@hyperwise.co.kr';
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (passwordInput) {
            passwordInput.value = 'manager123!@';
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.querySelector('input[name="remember"]').checked;

        // 이메일 유효성 검사
        if (!this.validateEmail(email)) {
            this.showError('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        // 비밀번호 유효성 검사
        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
            this.showError(passwordValidation.message);
            return;
        }

        // 로그인 처리 (실제로는 서버 API 호출)
        this.authenticate(email, password, rememberMe);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 비밀번호 유효성 검사
     * 요구사항: 영어 대문자 또는 소문자 + 숫자 + 특수문자 조합, 길이 8~50자
     */
    validatePassword(password) {
        if (password.length < 8) {
            return {
                isValid: false,
                message: '비밀번호는 최소 8자 이상이어야 합니다.'
            };
        }

        if (password.length > 50) {
            return {
                isValid: false,
                message: '비밀번호는 최대 50자까지 입력 가능합니다.'
            };
        }

        if (!/[A-Za-z]/.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 영어 대문자 또는 소문자를 포함해야 합니다.'
            };
        }

        if (!/[0-9]/.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 숫자를 포함해야 합니다.'
            };
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 특수문자를 포함해야 합니다.'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    authenticate(email, password, rememberMe) {
        // 실제 환경에서는 서버 API를 호출해야 합니다
        // 여기서는 데모용으로 간단한 검증만 수행
        
        // 승인된 매니저 계정 (승인 완료 상태)
        const approvedManagers = {
            'manager@hyperwise.co.kr': {
                password: 'manager123!@',
                name: '김강사',
                status: 'approved' // 'approved' or 'pending'
            },
            'instructor@example.com': {
                password: 'instructor123!@',
                name: '이강사',
                status: 'approved'
            }
        };

        // 승인 대기 중인 매니저 계정
        const pendingManagers = {
            'pending@example.com': {
                password: 'pending123!@',
                name: '승인대기강사',
                status: 'pending'
            }
        };

        // 로딩 상태 표시
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = '로그인 중...';
        loginBtn.disabled = true;

        // 시뮬레이션: API 호출 지연
        setTimeout(() => {
            // 승인된 매니저 계정 확인
            if (approvedManagers[email] && approvedManagers[email].password === password) {
                if (approvedManagers[email].status === 'approved') {
                    // 승인 완료된 매니저로 로그인 성공
                    this.loginSuccess(email, approvedManagers[email].name, rememberMe);
                } else {
                    // 승인 대기 중
                    this.showError('가입 신청이 접수되었습니다. 관리자 승인 후 이용 가능합니다.');
                    loginBtn.textContent = originalText;
                    loginBtn.disabled = false;
                }
            } else if (pendingManagers[email] && pendingManagers[email].password === password) {
                // 승인 대기 중인 계정
                this.showError('가입 신청이 접수되었습니다. 관리자 승인 후 이용 가능합니다.');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            } else {
                // 로그인 실패
                this.showError('이메일 또는 비밀번호가 올바르지 않습니다.');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        }, 1000);
    }

    loginSuccess(email, name, rememberMe) {
        // 로그인 상태 저장
        localStorage.setItem('sandwitchUI_loggedIn', 'true');
        localStorage.setItem('sandwitchUI_userEmail', email);
        localStorage.setItem('sandwitchUI_userName', name);
        localStorage.setItem('sandwitchUI_userRole', 'manager'); // 매니저 역할 저장
        
        if (rememberMe) {
            localStorage.setItem('sandwitchUI_rememberMe', 'true');
        } else {
            localStorage.removeItem('sandwitchUI_rememberMe');
        }

        // 성공 메시지 표시
        this.showSuccess('로그인 성공! 강사 대기실로 이동합니다...');

        // 강사 대기실로 이동 (향후 구현)
        setTimeout(() => {
            // TODO: 강사 대기실 페이지로 이동
            // window.location.href = 'manager-waiting-room.html';
            this.showInfo('강사 대기실 페이지는 향후 구현 예정입니다.');
        }, 500);
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.querySelector('.toggle-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = '<i class="far fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = '<i class="far fa-eye"></i>';
        }
    }

    showSignup() {
        // 회원가입 페이지로 이동
        window.location.href = 'signup.html';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info', options = {}) {
        if (!window.modalManager) {
            console.error('ModalManager가 로드되지 않았습니다.');
            return;
        }

        const modalType = type === 'success' ? 'info' : type;

        const defaultOptions = {
            type: modalType,
            message: message,
            buttons: [
                {
                    label: '확인',
                    action: null,
                    style: 'primary'
                }
            ],
            closeOnBackdrop: true
        };

        window.modalManager.show({ ...defaultOptions, ...options });
    }
}

// 강사 로그인 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.managerLoginManager = new ManagerLoginManager();
});


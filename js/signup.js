// 회원가입 페이지 기능
class SignupManager {
    constructor() {
        this.authCode = null;
        this.authCodeExpiry = null;
        this.isEmailVerified = false;
        this.authTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 인증번호 요청 버튼
        const authRequestBtn = document.getElementById('authRequestBtn');
        if (authRequestBtn) {
            authRequestBtn.addEventListener('click', () => this.requestAuthCode());
        }

        // 인증번호 확인 버튼
        const authVerifyBtn = document.getElementById('authVerifyBtn');
        if (authVerifyBtn) {
            authVerifyBtn.addEventListener('click', () => this.verifyAuthCode());
        }

        // 비밀번호 확인 실시간 검증
        const passwordConfirm = document.getElementById('signupPasswordConfirm');
        if (passwordConfirm) {
            passwordConfirm.addEventListener('input', () => this.checkPasswordMatch());
        }

        // 비밀번호 표시/숨김 토글
        document.querySelectorAll('#signupPassword, #signupPasswordConfirm').forEach(input => {
            const toggleBtn = input.parentElement.querySelector('.toggle-password');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.togglePasswordVisibility(input));
            }
        });

        // 폼 제출
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // 취소 버튼
        const cancelBtn = document.getElementById('signupCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.backToLogin());
        }

        // 로그인으로 돌아가기
        const backToLoginLink = document.getElementById('backToLogin');
        if (backToLoginLink) {
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.backToLogin();
            });
        }

        // 인증번호 입력 필드 (숫자만 입력)
        const authCodeInput = document.getElementById('authCode');
        if (authCodeInput) {
            authCodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    /**
     * 인증번호 요청
     */
    async requestAuthCode() {
        const emailInput = document.getElementById('signupEmail');
        const email = emailInput.value.trim();

        // 이메일 유효성 검사
        if (!this.validateEmail(email)) {
            this.showError('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        // 중복 이메일 체크 (실제로는 서버 API 호출)
        const isDuplicate = await this.checkEmailDuplicate(email);
        if (isDuplicate) {
            this.showError('이미 사용 중인 이메일입니다.');
            return;
        }

        // 인증번호 생성 및 발송 (실제로는 서버 API 호출)
        this.authCode = this.generateAuthCode();
        this.authCodeExpiry = Date.now() + 5 * 60 * 1000; // 5분 유효

        // 인증번호 입력 필드 표시
        const authCodeGroup = document.getElementById('authCodeGroup');
        const authTimer = document.getElementById('authTimer');
        if (authCodeGroup) {
            authCodeGroup.style.display = 'block';
        }
        if (authTimer) {
            authTimer.style.display = 'inline-block';
        }

        // 타이머 시작
        this.startAuthTimer();

        // 인증 요청 버튼 비활성화
        const authRequestBtn = document.getElementById('authRequestBtn');
        if (authRequestBtn) {
            authRequestBtn.disabled = true;
            authRequestBtn.textContent = '인증번호 재요청 (60초 후 가능)';
            setTimeout(() => {
                authRequestBtn.disabled = false;
                authRequestBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 인증번호 요청';
            }, 60000);
        }

        // 성공 메시지 (실제로는 이메일 발송)
        this.showSuccess(`인증번호가 ${email}로 발송되었습니다. (테스트 코드: ${this.authCode})`);
    }

    /**
     * 인증번호 생성 (6자리)
     */
    generateAuthCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * 인증 타이머 시작
     */
    startAuthTimer() {
        if (this.authTimer) {
            clearInterval(this.authTimer);
        }

        const timerElement = document.getElementById('authTimer');
        if (!timerElement) return;

        this.authTimer = setInterval(() => {
            const remaining = Math.max(0, Math.floor((this.authCodeExpiry - Date.now()) / 1000));
            
            if (remaining <= 0) {
                clearInterval(this.authTimer);
                timerElement.textContent = '인증번호가 만료되었습니다.';
                timerElement.style.color = '#ef4444';
                this.authCode = null;
                return;
            }

            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            timerElement.textContent = `남은 시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timerElement.style.color = '#2563eb';
        }, 1000);
    }

    /**
     * 인증번호 확인
     */
    verifyAuthCode() {
        const authCodeInput = document.getElementById('authCode');
        const inputCode = authCodeInput.value.trim();

        if (!inputCode || inputCode.length !== 6) {
            this.showError('인증번호 6자리를 입력해주세요.');
            return;
        }

        if (!this.authCode) {
            this.showError('인증번호를 먼저 요청해주세요.');
            return;
        }

        if (Date.now() > this.authCodeExpiry) {
            this.showError('인증번호가 만료되었습니다. 다시 요청해주세요.');
            return;
        }

        if (inputCode === this.authCode) {
            this.isEmailVerified = true;
            this.showSuccess('이메일 인증이 완료되었습니다.');
            this.enableAccountInfoSection();
            
            // 타이머 정리
            if (this.authTimer) {
                clearInterval(this.authTimer);
            }
            const timerElement = document.getElementById('authTimer');
            if (timerElement) {
                timerElement.style.display = 'none';
            }
        } else {
            this.showError('인증번호가 일치하지 않습니다.');
        }
    }

    /**
     * 계정 정보 입력 섹션 활성화
     */
    enableAccountInfoSection() {
        const accountSection = document.getElementById('accountInfoSection');
        const termsSection = document.getElementById('termsSection');
        
        if (accountSection) {
            accountSection.style.opacity = '1';
            accountSection.style.pointerEvents = 'auto';
        }

        if (termsSection) {
            termsSection.style.opacity = '1';
            termsSection.style.pointerEvents = 'auto';
        }

        // 필드 활성화
        const fields = [
            'signupPassword',
            'signupPasswordConfirm',
            'signupName',
            'signupStudentId',
            'signupPhone',
            'termPrivacy',
            'termData'
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = false;
            }
        });
    }

    /**
     * 비밀번호 일치 확인
     */
    checkPasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const matchDiv = document.getElementById('passwordMatch');

        if (!passwordConfirm) {
            if (matchDiv) matchDiv.textContent = '';
            return;
        }

        if (password === passwordConfirm) {
            if (matchDiv) {
                matchDiv.textContent = '✓ 비밀번호가 일치합니다.';
                matchDiv.style.color = '#10b981';
            }
        } else {
            if (matchDiv) {
                matchDiv.textContent = '✗ 비밀번호가 일치하지 않습니다.';
                matchDiv.style.color = '#ef4444';
            }
        }
    }

    /**
     * 비밀번호 표시/숨김 토글
     */
    togglePasswordVisibility(input) {
        const toggleBtn = input.parentElement.querySelector('.toggle-password');
        
        if (input.type === 'password') {
            input.type = 'text';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="far fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="far fa-eye"></i>';
        }
    }

    /**
     * 회원가입 처리
     */
    async handleSignup() {
        if (!this.isEmailVerified) {
            this.showError('이메일 인증을 완료해주세요.');
            return;
        }

        const formData = {
            email: document.getElementById('signupEmail').value.trim(),
            password: document.getElementById('signupPassword').value,
            passwordConfirm: document.getElementById('signupPasswordConfirm').value,
            name: document.getElementById('signupName').value.trim(),
            studentId: document.getElementById('signupStudentId').value.trim(),
            phone: document.getElementById('signupPhone').value.trim(),
            termPrivacy: document.getElementById('termPrivacy').checked,
            termData: document.getElementById('termData').checked
        };

        // 유효성 검사
        const validation = this.validateSignupForm(formData);
        if (!validation.isValid) {
            this.showError(validation.message);
            return;
        }

        // 서버 API 호출 (실제 구현 시)
        try {
            // await this.submitSignup(formData);
            
            // 성공 시 로그인 페이지로 이동
            this.showSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            this.showError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    /**
     * 회원가입 폼 유효성 검사
     */
    validateSignupForm(formData) {
        // 이메일 인증 확인
        if (!this.isEmailVerified) {
            return { isValid: false, message: '이메일 인증을 완료해주세요.' };
        }

        // 비밀번호 검증
        const passwordValidation = this.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            return { isValid: false, message: passwordValidation.message };
        }

        // 비밀번호 확인
        if (formData.password !== formData.passwordConfirm) {
            return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
        }

        // 이름 검증
        if (!formData.name || formData.name.trim().length < 2) {
            return { isValid: false, message: '이름을 입력해주세요. (최소 2자)' };
        }

        // 학번 검증
        if (!formData.studentId || formData.studentId.trim().length === 0) {
            return { isValid: false, message: '학번을 입력해주세요.' };
        }

        // 약관 동의 확인
        if (!formData.termPrivacy || !formData.termData) {
            return { isValid: false, message: '필수 약관에 동의해주세요.' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 이메일 유효성 검사
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 비밀번호 유효성 검사
     */
    validatePassword(password) {
        if (password.length < 8) {
            return { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
        }

        if (password.length > 50) {
            return { isValid: false, message: '비밀번호는 최대 50자까지 입력 가능합니다.' };
        }

        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: '비밀번호는 영어 대문자를 포함해야 합니다.' };
        }

        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: '비밀번호는 영어 소문자를 포함해야 합니다.' };
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
     * 이메일 중복 확인 (실제로는 서버 API 호출)
     */
    async checkEmailDuplicate(email) {
        // 데모용: 실제로는 서버 API 호출
        const existingEmails = ['test@example.com', 'admin@example.com'];
        return existingEmails.includes(email);
    }

    /**
     * 로그인 페이지로 돌아가기
     */
    backToLogin() {
        // 로그인 페이지로 이동
        window.location.href = 'index.html';
    }

    /**
     * 폼 초기화
     */
    resetForm() {
        const form = document.getElementById('signupForm');
        if (form) {
            form.reset();
        }

        this.isEmailVerified = false;
        this.authCode = null;
        this.authCodeExpiry = null;

        if (this.authTimer) {
            clearInterval(this.authTimer);
        }

        // 섹션 비활성화
        const accountSection = document.getElementById('accountInfoSection');
        const termsSection = document.getElementById('termsSection');
        
        if (accountSection) {
            accountSection.style.opacity = '0.5';
            accountSection.style.pointerEvents = 'none';
        }

        if (termsSection) {
            termsSection.style.opacity = '0.5';
            termsSection.style.pointerEvents = 'none';
        }

        // 필드 비활성화
        const fields = [
            'signupPassword',
            'signupPasswordConfirm',
            'signupName',
            'signupStudentId',
            'signupPhone',
            'termPrivacy',
            'termData'
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = true;
            }
        });

        // 인증 관련 UI 초기화
        const authCodeGroup = document.getElementById('authCodeGroup');
        const authTimer = document.getElementById('authTimer');
        const authRequestBtn = document.getElementById('authRequestBtn');
        
        if (authCodeGroup) authCodeGroup.style.display = 'none';
        if (authTimer) {
            authTimer.style.display = 'none';
            authTimer.textContent = '';
        }
        if (authRequestBtn) {
            authRequestBtn.disabled = false;
            authRequestBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 인증번호 요청';
        }

        // 상태 메시지 초기화
        const authStatus = document.getElementById('authStatus');
        const passwordMatch = document.getElementById('passwordMatch');
        if (authStatus) authStatus.textContent = '';
        if (passwordMatch) passwordMatch.textContent = '';
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

// 회원가입 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.signupManager = new SignupManager();
});


// 로그인 페이지 기능
class LoginManager {
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
        const rememberMe = localStorage.getItem('sandwitchUI_rememberMe') === 'true';
        
        if (isLoggedIn && rememberMe) {
            // 자동 로그인 - 메인 앱 표시
            this.showMainApp();
        } else if (isLoggedIn && !rememberMe) {
            // 세션만 유지된 경우 (페이지 새로고침 시 로그아웃)
            localStorage.removeItem('sandwitchUI_loggedIn');
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
            emailInput.value = 'support@hyperwise.co.kr';
            // 입력 이벤트 트리거 (일부 브라우저에서 필요)
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (passwordInput) {
            passwordInput.value = 'hw0908!@';
            // 입력 이벤트 트리거 (일부 브라우저에서 필요)
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
     * 요구사항: 영어 대소문자 + 숫자 + 특수문자 조합, 길이 8~50자
     * @param {string} password - 검증할 비밀번호
     * @returns {Object} {isValid: boolean, message: string}
     */
    validatePassword(password) {
        // 길이 검사
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

        // 영어 대문자 검사
        if (!/[A-Z]/.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 영어 대문자를 포함해야 합니다.'
            };
        }

        // 영어 소문자 검사
        if (!/[a-z]/.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 영어 소문자를 포함해야 합니다.'
            };
        }

        // 숫자 검사
        if (!/[0-9]/.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 숫자를 포함해야 합니다.'
            };
        }

        // 특수문자 검사
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
        
        // 승인된 계정
        const approvedAccounts = {
            'support@hyperwise.co.kr': 'hw0908!@'
        };

        // 데모 계정 (기존 계정 유지)
        const demoAccounts = {
            'admin@example.com': 'password123',
            'user@example.com': 'password123',
            'test@test.com': 'test123',
            ...approvedAccounts
        };

        // 로딩 상태 표시
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = '로그인 중...';
        loginBtn.disabled = true;

        // 시뮬레이션: API 호출 지연
        setTimeout(() => {
            // 승인된 계정 확인
            if (approvedAccounts[email] && approvedAccounts[email] === password) {
                // 승인된 계정으로 로그인 성공
                this.loginSuccess(email, rememberMe);
            } else if (demoAccounts[email] && demoAccounts[email] === password) {
                // 일반 데모 계정으로 로그인 성공
                this.loginSuccess(email, rememberMe);
            } else {
                // 로그인 실패
                this.showError('이메일 또는 비밀번호가 올바르지 않습니다.');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        }, 1000);
    }

    loginSuccess(email, rememberMe) {
        // 로그인 상태 저장
        localStorage.setItem('sandwitchUI_loggedIn', 'true');
        localStorage.setItem('sandwitchUI_userEmail', email);
        
        if (rememberMe) {
            localStorage.setItem('sandwitchUI_rememberMe', 'true');
        } else {
            localStorage.removeItem('sandwitchUI_rememberMe');
        }

        // 성공 메시지 표시
        this.showSuccess('로그인 성공! 메인 앱으로 이동합니다...');

        // 메인 앱 표시
        setTimeout(() => {
            this.showMainApp();
        }, 500);
    }

    showMainApp() {
        // body에 클래스 추가
        document.body.classList.add('has-main-app');
        document.body.style.overflow = 'auto';

        // 로그인 페이지 숨기기
        const loginContainer = document.querySelector('.login-container');
        if (loginContainer) {
            loginContainer.style.display = 'none';
        }

        // 플로팅 툴바 표시
        const floatingToolbar = document.querySelector('.floating-toolbar');
        if (floatingToolbar) {
            floatingToolbar.style.display = 'flex';
        }

        // 메인 앱 HTML 생성 (없는 경우)
        if (!document.getElementById('mainApp')) {
            this.createMainAppHTML();
        } else {
            document.getElementById('mainApp').style.display = 'block';
        }

        // 메인 앱 초기화
        setTimeout(() => {
            if (window.sandwichUI) {
                window.sandwichUI.init();
            } else {
                // 앱이 아직 초기화되지 않은 경우
                window.sandwichUI = new SandwichUI();
            }
        }, 100);
    }

    createMainAppHTML() {
        const mainApp = document.createElement('div');
        mainApp.id = 'mainApp';
        mainApp.innerHTML = `
            <header class="header">
                <div class="header-left">
                    <div class="logo"><i class="fas fa-hamburger"></i> 샌드위치</div>
                    <nav class="nav">
                        <button class="nav-btn active" data-view="wireframe">와이어프레임</button>
                        <button class="nav-btn" data-view="mockup">목업</button>
                    </nav>
                </div>
                <div class="header-right">
                    <button class="btn btn-secondary" id="logoutBtn">로그아웃</button>
                </div>
            </header>
            <div class="main-container">
                <div class="component-panel">
                    <div class="panel-header">
                        <h3>컴포넌트</h3>
                    </div>
                    <div class="component-list">
                        <div class="component-category" data-category="basic">
                            <h4>기본</h4>
                            <div class="component-items">
                                <div class="component-item" draggable="true" data-type="text">📝 텍스트</div>
                                <div class="component-item" draggable="true" data-type="button">🔘 버튼</div>
                                <div class="component-item" draggable="true" data-type="input">📥 입력창</div>
                                <div class="component-item" draggable="true" data-type="image">🖼️ 이미지</div>
                            </div>
                        </div>
                        <div class="component-category" data-category="layout">
                            <h4>레이아웃</h4>
                            <div class="component-items">
                                <div class="component-item" draggable="true" data-type="container">📦 컨테이너</div>
                                <div class="component-item" draggable="true" data-type="grid">⊞ 그리드</div>
                                <div class="component-item" draggable="true" data-type="flex">↔️ 플렉스</div>
                            </div>
                        </div>
                        <div class="component-category" data-category="navigation">
                            <h4>네비게이션</h4>
                            <div class="component-items">
                                <div class="component-item" draggable="true" data-type="navbar">🧭 네비게이션 바</div>
                                <div class="component-item" draggable="true" data-type="sidebar">📋 사이드바</div>
                                <div class="component-item" draggable="true" data-type="tab">📑 탭</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="canvas-container">
                    <div class="canvas-toolbar">
                        <div class="toolbar-group">
                            <button class="tool-btn" id="undoBtn">↶ 실행 취소</button>
                            <button class="tool-btn" id="redoBtn">↷ 다시 실행</button>
                        </div>
                        <div class="toolbar-group">
                            <button class="tool-btn" id="zoomInBtn">🔍+ 확대</button>
                            <button class="tool-btn" id="zoomOutBtn">🔍- 축소</button>
                        </div>
                    </div>
                    <div class="canvas" id="canvas">
                        <div class="canvas-content" id="canvasContent"></div>
                    </div>
                </div>
                <div class="properties-panel">
                    <div class="panel-header">
                        <h3>속성</h3>
                    </div>
                    <div class="properties-content" id="propertiesContent">
                        <div class="no-selection">
                            <p>요소를 선택하면 속성이 표시됩니다</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(mainApp);

        // 로그아웃 버튼 이벤트
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    handleLogout() {
        if (!window.modalManager) {
            // 모달 매니저가 없으면 기본 confirm 사용
            if (confirm('로그아웃 하시겠습니까?')) {
                this.performLogout();
            }
            return;
        }

        window.modalManager.confirm(
            '로그아웃 하시겠습니까?',
            () => {
                this.performLogout();
            },
            null
        );
    }

    performLogout() {
        localStorage.removeItem('sandwitchUI_loggedIn');
        localStorage.removeItem('sandwitchUI_userEmail');
        localStorage.removeItem('sandwitchUI_rememberMe');
        
        // body 클래스 제거
        document.body.classList.remove('has-main-app');
        document.body.style.overflow = 'hidden';
        
        // 메인 앱 숨기기
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'none';
        }

        // 플로팅 툴바 숨기기
        const floatingToolbar = document.querySelector('.floating-toolbar');
        if (floatingToolbar) {
            floatingToolbar.style.display = 'none';
        }

        // 로그인 페이지 표시
        const loginContainer = document.querySelector('.login-container');
        if (loginContainer) {
            loginContainer.style.display = 'flex';
        }

        // 폼 초기화
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const rememberCheckbox = document.querySelector('input[name="remember"]');
        
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (rememberCheckbox) rememberCheckbox.checked = false;

        this.showSuccess('로그아웃되었습니다.');
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
        this.showNotification('회원가입 기능은 곧 지원될 예정입니다.');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info', options = {}) {
        if (!window.modalManager) {
            console.error('ModalManager가 로드되지 않았습니다.');
            return;
        }

        // success 타입을 info로 매핑 (모달은 info, warning, error만 지원)
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

// 로그인 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});


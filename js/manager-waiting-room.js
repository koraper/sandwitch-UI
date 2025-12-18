// 강사(매니저) 대기실 관리 클래스
class ManagerWaitingRoomManager {
    constructor() {
        this.lectures = [];
        this.filteredLectures = [];
        this.currentUser = null;
        this.searchQuery = '';
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 6; // 2행 3열 = 6개
        this.init();
    }

    init() {
        // 로그인 상태 및 권한 확인
        this.checkLoginStatus();
        
        // 사용자 정보 로드
        this.loadUserInfo();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 특강 리스트 로드
        this.loadLectures();
    }

    /**
     * 로그인 상태 및 매니저 권한 확인
     */
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('sandwitchUI_loggedIn');
        const userRole = localStorage.getItem('sandwitchUI_userRole');
        
        if (!isLoggedIn) {
            // 로그인되지 않은 경우 로그인 페이지로 이동
            window.location.href = 'index.html';
            return;
        }

        // 매니저 권한 확인 (실제 구현시 서버에서 검증)
        // 현재는 데모용으로 매니저 역할이 아니어도 접근 허용
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
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 로그아웃 버튼
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 프로필 클릭 (마이페이지 이동)
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                window.location.href = 'profile.html';
            });
        }

        // 필터 탭
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                this.setActiveFilter(status);
            });
        });

        // 검색 입력 필드
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.handleSearch('');
                }
            });
        }

        // FAB 버튼 (특강 개설)
        const fabCreateBtn = document.getElementById('fabCreateBtn');
        if (fabCreateBtn) {
            fabCreateBtn.addEventListener('click', () => this.showCreateModal());
        }

        // 첫 특강 개설 버튼 (빈 상태)
        const createFirstBtn = document.getElementById('createFirstBtn');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => this.showCreateModal());
        }

        // 모달 관련 이벤트
        this.setupModalEvents();

        // 페이지네이션 버튼
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
    }

    /**
     * 모달 이벤트 설정
     */
    setupModalEvents() {
        // 생성 모달
        const createModal = document.getElementById('createLectureModal');
        const modalOverlay = document.getElementById('modalOverlay');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const cancelCreateBtn = document.getElementById('cancelCreateBtn');
        const createLectureForm = document.getElementById('createLectureForm');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.hideCreateModal());
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.hideCreateModal());
        }

        if (cancelCreateBtn) {
            cancelCreateBtn.addEventListener('click', () => this.hideCreateModal());
        }

        if (createLectureForm) {
            createLectureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateLecture();
            });
        }

        // 코드 표시 모달
        const codeModalOverlay = document.getElementById('codeModalOverlay');
        const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
        const copyCodeBtn = document.getElementById('copyCodeBtn');

        if (codeModalOverlay) {
            codeModalOverlay.addEventListener('click', () => this.hideCodeModal());
        }

        if (closeCodeModalBtn) {
            closeCodeModalBtn.addEventListener('click', () => this.hideCodeModal());
        }

        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => this.copyAccessCode());
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCreateModal();
                this.hideCodeModal();
            }
        });
    }

    /**
     * 특강 리스트 로드
     */
    async loadLectures() {
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const lectureList = document.getElementById('lectureList');

        try {
            // 실제로는 서버 API 호출 (본인이 개설한 특강만 조회)
            // const response = await fetch('/api/manager/lectures');
            // this.lectures = await response.json();

            // 데모용 데이터 (매니저가 개설한 특강)
            this.lectures = [
                {
                    id: 1,
                    title: '생성형 AI 활용 가이드',
                    description: 'ChatGPT, Claude 등 생성형 AI 도구를 활용한 실무 프로젝트',
                    institution: '한국대학교 컴퓨터공학과',
                    instructor: this.currentUser.name,
                    startDate: '2025-12-19T14:00',
                    endDate: '2025-12-19T16:00',
                    location: '온라인 (Zoom)',
                    accessCode: 'ABC123',
                    status: 'ongoing',
                    participantCount: 24,
                    showStudentId: true
                },
                {
                    id: 2,
                    title: '데이터 분석 기초',
                    description: 'Python을 활용한 데이터 분석 및 시각화 기초 강의',
                    institution: '서울대학교 통계학과',
                    instructor: this.currentUser.name,
                    startDate: '2025-12-26T10:00',
                    endDate: '2025-12-26T12:00',
                    location: '본관 301호',
                    accessCode: 'XYZ789',
                    status: 'upcoming',
                    participantCount: 0,
                    showStudentId: false
                },
                {
                    id: 3,
                    title: '웹 개발 실전',
                    description: 'React와 Node.js를 활용한 풀스택 웹 개발',
                    institution: '연세대학교 정보산업공학과',
                    instructor: this.currentUser.name,
                    startDate: '2025-12-15T15:00',
                    endDate: '2025-12-15T17:00',
                    location: '공학관 205호',
                    accessCode: 'DEF456',
                    status: 'ended',
                    participantCount: 32,
                    showStudentId: true
                },
                {
                    id: 4,
                    title: '머신러닝 입문',
                    description: 'Scikit-learn과 TensorFlow를 활용한 머신러닝 기초',
                    institution: '고려대학교 인공지능학과',
                    instructor: this.currentUser.name,
                    startDate: '2025-12-10T13:00',
                    endDate: '2025-12-10T15:00',
                    location: '과학관 401호',
                    accessCode: 'GHI789',
                    status: 'ended',
                    participantCount: 28,
                    showStudentId: false
                },
                {
                    id: 5,
                    title: '클라우드 컴퓨팅 기초',
                    description: 'AWS, Azure 등 클라우드 플랫폼 활용 및 인프라 구축',
                    institution: '성균관대학교 소프트웨어학과',
                    instructor: this.currentUser.name,
                    startDate: '2025-12-28T11:00',
                    endDate: '2025-12-28T13:00',
                    location: '온라인 (Zoom)',
                    accessCode: 'JKL012',
                    status: 'upcoming',
                    participantCount: 0,
                    showStudentId: true
                },
                {
                    id: 6,
                    title: '모바일 앱 개발',
                    description: 'React Native를 활용한 크로스 플랫폼 모바일 앱 개발',
                    institution: '한양대학교 컴퓨터소프트웨어학부',
                    instructor: this.currentUser.name,
                    startDate: '2026-01-08T14:00',
                    endDate: '2026-01-08T16:00',
                    location: '공학관 101호',
                    accessCode: 'MNO345',
                    status: 'upcoming',
                    participantCount: 0,
                    showStudentId: false
                }
            ];

            // 로딩 상태 숨기기
            if (loadingState) {
                loadingState.style.display = 'none';
            }

            // 특강이 없는 경우
            if (this.lectures.length === 0) {
                if (emptyState) {
                    emptyState.style.display = 'flex';
                }
                return;
            }

            // 필터링된 특강 리스트 초기화
            this.filteredLectures = [...this.lectures];

            // 필터 카운트 업데이트
            this.updateFilterCounts();

            // 특강 카드 렌더링
            this.renderLectures();

        } catch (error) {
            console.error('특강 리스트 로드 실패:', error);
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            if (emptyState) {
                emptyState.style.display = 'flex';
            }
            this.showError('특강 목록을 불러오는데 실패했습니다.');
        }
    }

    /**
     * 필터 카운트 업데이트
     */
    updateFilterCounts() {
        const counts = {
            all: this.lectures.length,
            upcoming: this.lectures.filter(l => l.status === 'upcoming').length,
            ongoing: this.lectures.filter(l => l.status === 'ongoing').length,
            ended: this.lectures.filter(l => l.status === 'ended').length
        };

        document.getElementById('countAll').textContent = counts.all;
        document.getElementById('countUpcoming').textContent = counts.upcoming;
        document.getElementById('countOngoing').textContent = counts.ongoing;
        document.getElementById('countEnded').textContent = counts.ended;
    }

    /**
     * 필터 탭 활성화
     */
    setActiveFilter(status) {
        // 탭 활성화 상태 업데이트
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            if (tab.dataset.status === status) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        this.currentFilter = status;
        this.applyFilters();
    }

    /**
     * 검색 처리
     */
    handleSearch(query) {
        this.searchQuery = query.trim().toLowerCase();
        this.applyFilters();
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        let results = [...this.lectures];

        // 상태 필터링
        if (this.currentFilter !== 'all') {
            results = results.filter(lecture => lecture.status === this.currentFilter);
        }

        // 검색어 필터링
        if (this.searchQuery) {
            results = results.filter(lecture => {
                const title = lecture.title.toLowerCase();
                const institution = lecture.institution.toLowerCase();
                const description = lecture.description.toLowerCase();
                const accessCode = (lecture.accessCode || '').toLowerCase();

                return title.includes(this.searchQuery) ||
                       institution.includes(this.searchQuery) ||
                       description.includes(this.searchQuery) ||
                       accessCode.includes(this.searchQuery);
            });
        }

        this.filteredLectures = results;
        this.currentPage = 1;
        this.renderLectures();
    }

    /**
     * 특강 카드 렌더링
     */
    renderLectures() {
        const lectureList = document.getElementById('lectureList');
        const emptyState = document.getElementById('emptyState');
        const paginationContainer = document.getElementById('paginationContainer');
        if (!lectureList) return;

        // 기존 카드 제거
        const existingCards = lectureList.querySelectorAll('.lecture-card');
        existingCards.forEach(card => card.remove());

        // 필터링된 특강이 없는 경우
        if (this.filteredLectures.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
                if (this.lectures.length > 0) {
                    emptyState.innerHTML = `
                        <i class="fas fa-search"></i>
                        <p>검색 결과가 없습니다.</p>
                    `;
                }
            }
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }

        // 빈 상태 숨기기
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // 페이지네이션 계산
        const totalPages = Math.ceil(this.filteredLectures.length / this.itemsPerPage);
        
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages || 1;
        }

        // 현재 페이지에 표시할 특강 추출
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const lecturesToShow = this.filteredLectures.slice(startIndex, endIndex);

        // 특강 카드 생성
        lecturesToShow.forEach(lecture => {
            const card = this.createLectureCard(lecture);
            lectureList.appendChild(card);
        });

        // 페이지네이션 업데이트
        this.updatePagination(totalPages);
    }

    /**
     * 특강 카드 생성
     */
    createLectureCard(lecture) {
        const card = document.createElement('div');
        card.className = 'lecture-card manager-lecture-card';
        card.dataset.lectureId = lecture.id;

        // 날짜 포맷팅
        const formatDateTime = (dateStr) => {
            const date = new Date(dateStr);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${month}/${day} ${hours}:${minutes}`;
        };

        // 상태 배지
        const badge = this.createStatusBadge(lecture.status);

        card.innerHTML = `
            <div class="lecture-card-header">
                <h3 class="lecture-title" title="${lecture.title}">${lecture.title}</h3>
                ${badge}
            </div>
            <div class="lecture-card-body">
                <p class="lecture-description">${lecture.description}</p>
                <div class="lecture-info">
                    <div class="info-item">
                        <i class="fas fa-university"></i>
                        <span>${lecture.institution}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formatDateTime(lecture.startDate)} ~ ${formatDateTime(lecture.endDate)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${lecture.location || '미정'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>참여자 ${lecture.participantCount}명</span>
                    </div>
                </div>
            </div>
            <div class="lecture-card-footer manager-card-footer">
                <div class="access-code-section">
                    <span class="code-label">입장 코드</span>
                    <div class="code-display">
                        <span class="code-value">${lecture.accessCode}</span>
                        <button class="btn-copy-small" data-code="${lecture.accessCode}" title="코드 복사">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <button class="btn-manage" data-lecture-id="${lecture.id}">
                    <i class="fas fa-cog"></i> 관리/입장
                </button>
            </div>
        `;

        // 코드 복사 버튼 이벤트
        const copyBtn = card.querySelector('.btn-copy-small');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(lecture.accessCode, copyBtn);
            });
        }

        // 관리/입장 버튼 이벤트
        const manageBtn = card.querySelector('.btn-manage');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                this.enterDashboard(lecture);
            });
        }

        return card;
    }

    /**
     * 상태 배지 생성
     */
    createStatusBadge(status) {
        const badges = {
            upcoming: { text: '예정됨', class: 'lecture-badge badge-upcoming' },
            ongoing: { text: '진행 중', class: 'lecture-badge badge-ongoing' },
            ended: { text: '종료됨', class: 'lecture-badge badge-ended' }
        };

        const badge = badges[status] || badges.ongoing;
        return `<span class="${badge.class}">${badge.text}</span>`;
    }

    /**
     * 페이지 이동
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredLectures.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) {
            return;
        }

        this.currentPage = page;
        this.renderLectures();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * 페이지네이션 업데이트
     */
    updatePagination(totalPages) {
        const paginationContainer = document.getElementById('paginationContainer');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const paginationNumbers = document.getElementById('paginationNumbers');
        const paginationInfo = document.getElementById('paginationInfo');

        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }

        paginationContainer.style.display = 'flex';

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }

        if (paginationNumbers) {
            paginationNumbers.innerHTML = '';
            
            let startPage = Math.max(1, this.currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn-page-number ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => this.goToPage(i));
                paginationNumbers.appendChild(pageBtn);
            }
        }

        if (paginationInfo) {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredLectures.length);
            paginationInfo.textContent = `${startIndex}-${endIndex} / 전체 ${this.filteredLectures.length}개`;
        }
    }

    /**
     * 특강 생성 모달 표시
     */
    showCreateModal() {
        const modal = document.getElementById('createLectureModal');
        if (modal) {
            modal.classList.add('modal-show');
            document.body.style.overflow = 'hidden';

            // 강사명 자동 입력
            const instructorInput = document.getElementById('instructorName');
            if (instructorInput && !instructorInput.value) {
                instructorInput.value = this.currentUser.name;
            }

            // 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                const firstInput = document.getElementById('lectureName');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    /**
     * 특강 생성 모달 숨기기
     */
    hideCreateModal() {
        const modal = document.getElementById('createLectureModal');
        if (modal) {
            modal.classList.remove('modal-show');
            document.body.style.overflow = '';

            // 폼 초기화
            const form = document.getElementById('createLectureForm');
            if (form) form.reset();
        }
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
     * 특강 생성 처리
     */
    async handleCreateLecture() {
        const form = document.getElementById('createLectureForm');
        const submitBtn = document.getElementById('submitCreateBtn');
        
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

            // 리스트에 추가
            this.lectures.unshift(newLecture);
            this.filteredLectures = [...this.lectures];

            // 필터 카운트 업데이트
            this.updateFilterCounts();

            // 모달 닫기
            this.hideCreateModal();

            // 코드 표시 모달
            this.showCodeModal(newLecture);

            // 리스트 갱신
            this.renderLectures();

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

    /**
     * 대시보드 입장
     */
    enterDashboard(lecture) {
        // 매니저는 코드 입력 없이 바로 대시보드 입장
        window.location.href = `dashboard.html?lectureId=${lecture.id}&mode=manager`;
    }

    /**
     * 로그아웃 처리
     */
    handleLogout() {
        if (!window.modalManager) {
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

    /**
     * 로그아웃 실행
     */
    performLogout() {
        localStorage.removeItem('sandwitchUI_loggedIn');
        localStorage.removeItem('sandwitchUI_userEmail');
        localStorage.removeItem('sandwitchUI_userName');
        localStorage.removeItem('sandwitchUI_userRole');
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

    showInfo(message) {
        if (!window.modalManager) {
            alert(message);
            return;
        }
        window.modalManager.info(message);
    }
}

// 매니저 대기실 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.managerWaitingRoomManager = new ManagerWaitingRoomManager();
});


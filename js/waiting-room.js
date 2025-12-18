// 메인 대기실 관리 클래스
class WaitingRoomManager {
    constructor() {
        this.lectures = [];
        this.filteredLectures = [];
        this.currentUser = null;
        this.searchQuery = '';
        this.filters = {
            year: '',
            month: '',
            status: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = 4; // 2행 2열 = 4개
        this.init();
    }

    init() {
        // 로그인 상태 확인
        this.checkLoginStatus();
        
        // 사용자 정보 로드
        this.loadUserInfo();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 특강 리스트 로드
        this.loadLectures();
    }

    /**
     * 로그인 상태 확인
     */
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('sandwitchUI_loggedIn');
        if (!isLoggedIn) {
            // 로그인되지 않은 경우 로그인 페이지로 이동
            window.location.href = 'index.html';
        }
    }

    /**
     * 사용자 정보 로드
     */
    loadUserInfo() {
        const email = localStorage.getItem('sandwitchUI_userEmail');
        const name = localStorage.getItem('sandwitchUI_userName') || email?.split('@')[0] || '사용자';
        
        this.currentUser = {
            email: email,
            name: name
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

        // 프로필 클릭 (마이페이지 이동 - 향후 구현)
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                // TODO: 마이페이지로 이동
                console.log('마이페이지 이동 (향후 구현)');
            });
        }

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

        // 검색 초기화 버튼
        const searchClearBtn = document.getElementById('searchClearBtn');
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                    this.handleSearch('');
                }
            });
        }

        // 페이지네이션 버튼
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }

        // 필터 업데이트 버튼
        const filterUpdateBtn = document.getElementById('filterUpdateBtn');
        if (filterUpdateBtn) {
            filterUpdateBtn.addEventListener('click', () => this.applyFilters());
        }

        // 필터 셀렉트 엔터키 처리
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
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
            // 실제로는 서버 API 호출
            // const response = await fetch('/api/lectures');
            // this.lectures = await response.json();

            // 데모용 데이터
            this.lectures = [
                {
                    id: 1,
                    title: '생성형 AI 활용 가이드',
                    description: 'ChatGPT, Claude 등 생성형 AI 도구를 활용한 실무 프로젝트',
                    institution: '한국대학교 컴퓨터공학과',
                    instructor: '김교수',
                    date: '2024-03-15',
                    time: '14:00 - 16:00',
                    location: '온라인 (Zoom)',
                    accessCode: 'ABC123',
                    status: 'ongoing' // 진행중
                },
                {
                    id: 2,
                    title: '데이터 분석 기초',
                    description: 'Python을 활용한 데이터 분석 및 시각화 기초 강의',
                    institution: '서울대학교 통계학과',
                    instructor: '이교수',
                    date: '2024-03-20',
                    time: '10:00 - 12:00',
                    location: '본관 301호',
                    accessCode: 'XYZ789',
                    status: 'upcoming' // 예정됨
                },
                {
                    id: 3,
                    title: '웹 개발 실전',
                    description: 'React와 Node.js를 활용한 풀스택 웹 개발',
                    institution: '연세대학교 정보산업공학과',
                    instructor: '박교수',
                    date: '2024-03-25',
                    time: '15:00 - 17:00',
                    location: '공학관 205호',
                    accessCode: 'DEF456',
                    status: 'ended' // 종료됨
                },
                {
                    id: 4,
                    title: '머신러닝 입문',
                    description: 'Scikit-learn과 TensorFlow를 활용한 머신러닝 기초부터 실전까지',
                    institution: '고려대학교 인공지능학과',
                    instructor: '최교수',
                    date: '2024-03-22',
                    time: '13:00 - 15:00',
                    location: '과학관 401호',
                    accessCode: 'GHI789',
                    status: 'ongoing' // 진행중
                },
                {
                    id: 5,
                    title: '클라우드 컴퓨팅 기초',
                    description: 'AWS, Azure 등 클라우드 플랫폼 활용 및 인프라 구축',
                    institution: '성균관대학교 소프트웨어학과',
                    instructor: '정교수',
                    date: '2024-03-18',
                    time: '11:00 - 13:00',
                    location: '온라인 (Zoom)',
                    accessCode: 'JKL012',
                    status: 'ended' // 종료됨
                },
                {
                    id: 6,
                    title: '모바일 앱 개발',
                    description: 'React Native를 활용한 크로스 플랫폼 모바일 앱 개발',
                    institution: '한양대학교 컴퓨터소프트웨어학부',
                    instructor: '강교수',
                    date: '2024-03-28',
                    time: '14:00 - 16:00',
                    location: '공학관 101호',
                    accessCode: 'MNO345',
                    status: 'upcoming' // 예정됨
                },
                {
                    id: 7,
                    title: '블록체인 기초',
                    description: '이더리움과 스마트 컨트랙트 개발 기초 강의',
                    institution: '중앙대학교 정보통신공학과',
                    instructor: '윤교수',
                    date: '2024-03-30',
                    time: '10:00 - 12:00',
                    location: '본관 201호',
                    accessCode: 'PQR678',
                    status: 'upcoming' // 예정됨
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

            // 연도 필터 옵션 생성
            this.populateYearFilter();

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
     * 특강 카드 렌더링
     */
    renderLectures() {
        const lectureList = document.getElementById('lectureList');
        const emptyState = document.getElementById('emptyState');
        const paginationContainer = document.getElementById('paginationContainer');
        if (!lectureList) return;

        // 기존 카드 제거 (로딩 상태 제외)
        const existingCards = lectureList.querySelectorAll('.lecture-card');
        existingCards.forEach(card => card.remove());

        // 필터링된 특강이 없는 경우
        if (this.filteredLectures.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
                emptyState.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>검색 결과가 없습니다.</p>
                `;
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
        
        // 현재 페이지가 유효한 범위인지 확인
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
     * 연도 필터 옵션 생성
     */
    populateYearFilter() {
        const yearSelect = document.getElementById('filterYear');
        if (!yearSelect) return;

        // 특강 데이터에서 연도 추출
        const years = new Set();
        this.lectures.forEach(lecture => {
            if (lecture.date) {
                const year = lecture.date.split('-')[0];
                years.add(year);
            }
        });

        // 연도 정렬 (최신순)
        const sortedYears = Array.from(years).sort((a, b) => b - a);

        // 옵션 추가
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}년`;
            yearSelect.appendChild(option);
        });
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        // 필터 값 가져오기
        const yearSelect = document.getElementById('filterYear');
        const monthSelect = document.getElementById('filterMonth');
        const statusSelect = document.getElementById('filterStatus');

        this.filters.year = yearSelect?.value || '';
        this.filters.month = monthSelect?.value || '';
        this.filters.status = statusSelect?.value || '';

        // 검색어와 필터 모두 적용
        this.applySearchAndFilters();
    }

    /**
     * 검색어와 필터 통합 적용
     */
    applySearchAndFilters() {
        let results = [...this.lectures];

        // 1. 검색어 필터링
        if (this.searchQuery) {
            results = results.filter(lecture => {
                const title = lecture.title.toLowerCase();
                const instructor = lecture.instructor.toLowerCase();
                const institution = lecture.institution.toLowerCase();
                const description = lecture.description.toLowerCase();
                const accessCode = (lecture.accessCode || '').toLowerCase();

                return title.includes(this.searchQuery) ||
                       instructor.includes(this.searchQuery) ||
                       institution.includes(this.searchQuery) ||
                       description.includes(this.searchQuery) ||
                       accessCode.includes(this.searchQuery);
            });
        }

        // 2. 연도 필터링
        if (this.filters.year) {
            results = results.filter(lecture => {
                return lecture.date && lecture.date.startsWith(this.filters.year);
            });
        }

        // 3. 월 필터링
        if (this.filters.month) {
            results = results.filter(lecture => {
                if (!lecture.date) return false;
                const month = lecture.date.split('-')[1];
                return month === this.filters.month;
            });
        }

        // 4. 상태 필터링
        if (this.filters.status) {
            results = results.filter(lecture => {
                return lecture.status === this.filters.status;
            });
        }

        this.filteredLectures = results;
        this.currentPage = 1;
        this.renderLectures();
    }

    /**
     * 검색 처리
     */
    handleSearch(query) {
        this.searchQuery = query.trim().toLowerCase();
        const searchClearBtn = document.getElementById('searchClearBtn');

        // 검색 초기화 버튼 표시/숨김
        if (searchClearBtn) {
            searchClearBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }

        // 검색어와 필터 통합 적용
        this.applySearchAndFilters();
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

        // 페이지 상단으로 스크롤
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

        // 이전/다음 버튼 상태 업데이트
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }

        // 페이지 번호 생성
        if (paginationNumbers) {
            paginationNumbers.innerHTML = '';
            
            // 페이지 번호 표시 로직 (최대 5개)
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

        // 페이지 정보 업데이트
        if (paginationInfo) {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredLectures.length);
            paginationInfo.textContent = `${startIndex}-${endIndex} / 전체 ${this.filteredLectures.length}개`;
        }
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

        // 페이지 상단으로 스크롤
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

        // 이전/다음 버튼 상태 업데이트
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }

        // 페이지 번호 생성
        if (paginationNumbers) {
            paginationNumbers.innerHTML = '';
            
            // 페이지 번호 표시 로직 (최대 5개)
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

        // 페이지 정보 업데이트
        if (paginationInfo) {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredLectures.length);
            paginationInfo.textContent = `${startIndex}-${endIndex} / 전체 ${this.filteredLectures.length}개`;
        }
    }

    /**
     * 특강 카드 생성
     */
    createLectureCard(lecture) {
        const card = document.createElement('div');
        card.className = 'lecture-card';
        card.dataset.lectureId = lecture.id;

        // 텍스트 말줄임 처리
        const truncateText = (text, maxLength) => {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        };

        // 상태 배지 생성
        const badge = this.createStatusBadge(lecture.status || 'ongoing');

        card.innerHTML = `
            <div class="lecture-card-header">
                <h3 class="lecture-title" title="${lecture.title}">${truncateText(lecture.title, 30)}</h3>
                ${badge}
            </div>
            <div class="lecture-card-body">
                <p class="lecture-description" title="${lecture.description}">${truncateText(lecture.description, 80)}</p>
                <div class="lecture-info">
                    <div class="info-item">
                        <i class="fas fa-university"></i>
                        <span>${lecture.institution}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span>${lecture.instructor}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${lecture.date} ${lecture.time}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${lecture.location}</span>
                    </div>
                </div>
            </div>
            <div class="lecture-card-footer">
                <button class="btn-enter" data-lecture-id="${lecture.id}">
                    <i class="fas fa-door-open"></i> 입장하기
                </button>
            </div>
        `;

        // 입장 버튼 이벤트
        const enterBtn = card.querySelector('.btn-enter');
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                this.showEntryModal(lecture);
            });
        }

        return card;
    }

    /**
     * 상태 배지 생성
     * @param {string} status - 특강 상태: 'upcoming', 'ongoing', 'ended', 'cancelled'
     * @returns {string} 배지 HTML
     */
    createStatusBadge(status) {
        const badges = {
            upcoming: {
                text: '예정됨',
                class: 'lecture-badge badge-upcoming'
            },
            ongoing: {
                text: '진행중',
                class: 'lecture-badge badge-ongoing'
            },
            ended: {
                text: '종료됨',
                class: 'lecture-badge badge-ended'
            },
            cancelled: {
                text: '취소됨',
                class: 'lecture-badge badge-cancelled'
            }
        };

        const badge = badges[status] || badges.ongoing;
        return `<span class="${badge.class}">${badge.text}</span>`;
    }

    /**
     * 입장 모달 표시
     */
    showEntryModal(lecture) {
        if (!window.modalManager) {
            this.showError('모달 시스템을 사용할 수 없습니다.');
            return;
        }

        // 모달 HTML 생성
        const modalContent = document.createElement('div');
        modalContent.className = 'entry-modal-content';
        modalContent.innerHTML = `
            <div class="entry-modal-header">
                <h3>${lecture.title}</h3>
                <p class="entry-modal-subtitle">입장 코드를 입력하세요</p>
            </div>
            <div class="entry-modal-body">
                <div class="form-group">
                    <label for="entryCode">입장 코드 (6자리) <span class="required">*</span></label>
                    <div class="input-wrapper">
                        <input type="text" id="entryCode" name="entryCode" placeholder="6자리 코드 입력" maxlength="6" pattern="[A-Za-z0-9]{6}" autocomplete="off">
                    </div>
                    <small class="form-hint">강사로부터 전달받은 6자리 Access Code를 입력하세요</small>
                </div>
            </div>
        `;

        // 모달 표시
        window.modalManager.show({
            type: 'info',
            title: '특강 입장',
            message: modalContent,
            buttons: [
                {
                    label: '취소',
                    action: null,
                    style: 'secondary'
                },
                {
                    label: '입장',
                    action: () => this.verifyEntryCode(lecture),
                    style: 'primary'
                }
            ],
            closeOnBackdrop: true
        });

        // 입력 필드 포커스 및 이벤트 설정
        setTimeout(() => {
            const entryCodeInput = document.getElementById('entryCode');
            if (entryCodeInput) {
                entryCodeInput.focus();
                
                // 대문자 변환 및 영숫자만 입력
                entryCodeInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                });

                // Enter 키로 입장
                entryCodeInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.verifyEntryCode(lecture);
                    }
                });
            }
        }, 100);
    }

    /**
     * 입장 코드 검증
     */
    async verifyEntryCode(lecture) {
        const entryCodeInput = document.getElementById('entryCode');
        if (!entryCodeInput) return;

        const inputCode = entryCodeInput.value.trim().toUpperCase();

        // 입력 검증
        if (!inputCode || inputCode.length !== 6) {
            this.showError('6자리 입장 코드를 입력해주세요.');
            return;
        }

        // 코드 검증 (실제로는 서버 API 호출)
        try {
            // const response = await fetch(`/api/lectures/${lecture.id}/verify`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ code: inputCode })
            // });
            // const result = await response.json();

            // 데모용 검증
            const isValid = inputCode === lecture.accessCode.toUpperCase();

            if (isValid) {
                // 입장 성공 - 특강 대시보드로 이동
                this.showSuccess('입장 코드가 확인되었습니다. 특강 대시보드로 이동합니다.');
                
                // 모달 닫기
                window.modalManager.closeAll();
                
                // 특강 대시보드로 이동 (향후 구현)
                setTimeout(() => {
                    // TODO: 특강 대시보드 페이지로 이동
                    // window.location.href = `dashboard.html?lectureId=${lecture.id}`;
                    this.showInfo(`특강 대시보드로 이동합니다. (특강 ID: ${lecture.id})`);
                }, 1000);
            } else {
                this.showError('입장 코드가 올바르지 않습니다. 다시 확인해주세요.');
            }
        } catch (error) {
            console.error('코드 검증 실패:', error);
            this.showError('코드 검증 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
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
        localStorage.removeItem('sandwitchUI_rememberMe');
        
        // 로그인 페이지로 이동
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

// 대기실 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.waitingRoomManager = new WaitingRoomManager();
});


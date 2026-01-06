// 관리자 페이지 관리 클래스
class AdminManager {
    constructor() {
        this.currentMenu = 'assignments';

        // 공통 테이블 상태 관리
        this.tableStates = {
            assignments: {
                searchQuery: '',
                sortColumn: 'lastModified',
                sortDirection: 'desc',
                currentPage: 1,
                itemsPerPage: 10,
                // 추가 필터
                filterYear: '',
                filterMonth: '',
                filterCompetencyCode: ''
            },
            lectures: {
                searchQuery: '',
                sortColumn: 'date',
                sortDirection: 'desc',
                currentPage: 1,
                itemsPerPage: 10,
                // 추가 필터
                filterYear: '',
                filterMonth: '',
                filterStatus: ''
            },
            users: {
                searchQuery: '',
                sortColumn: 'joinDate',
                sortDirection: 'desc',
                currentPage: 1,
                itemsPerPage: 10,
                // 추가 필터
                filterYear: '',
                filterMonth: '',
                filterRole: '',
                filterStatus: ''
            }
        };

        // 이전 버전 호환성을 위한 alias
        this.assignmentState = this.tableStates.assignments;

        this.init();
    }

    init() {
        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 현재 URL에 따라 메뉴 활성 상태 설정
        this.updateActiveMenuByURL();

        // 초기 컨텐츠 로드
        this.loadMenuContent(this.currentMenu);
    }

    /**
     * 현재 URL에 따라 사이드바 메뉴 활성 상태 업데이트
     */
    updateActiveMenuByURL() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href) {
                // 현재 페이지와 링크가 일치하거나, 새 과제 생성 페이지인 경우 과제 관리 활성화
                if (currentPath.includes(href) ||
                    (currentPath.includes('create-assignment') && href.includes('admin.html') && item.textContent.includes('과제 관리'))) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const menuLinks = document.querySelectorAll('.sidebar-menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const menu = link.dataset.menu;
                this.switchMenu(menu);
            });
        });
    }

    /**
     * 메뉴 전환
     */
    switchMenu(menu) {
        // 활성 메뉴 업데이트
        const menuLinks = document.querySelectorAll('.sidebar-menu-link');
        menuLinks.forEach(link => {
            if (link.dataset.menu === menu) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // 컨텐츠 로드
        this.currentMenu = menu;
        this.loadMenuContent(menu);
    }

    /**
     * 메뉴별 컨텐츠 로드
     */
    loadMenuContent(menu) {
        const contentWrapper = document.getElementById('contentWrapper');
        if (!contentWrapper) return;

        let content = '';

        switch (menu) {
            case 'assignments':
                content = this.renderAssignmentsContent();
                break;
            case 'lectures':
                content = this.renderLecturesContent();
                break;
            case 'users':
                content = this.renderUsersContent();
                break;
            case 'settings':
                content = this.renderSettingsContent();
                break;
            default:
                content = '<p>컨텐츠를 찾을 수 없습니다.</p>';
        }

        contentWrapper.innerHTML = content;
    }

    /**
     * 모든 과제 데이터 가져오기
     */
    getAllAssignments() {
        // 기본 목업 데이터
        const defaultAssignments = [
            {
                id: 'ASG001',
                title: '생성형 AI 활용 프로젝트',
                description: 'ChatGPT를 활용한 실무 프로젝트 과제',
                competencyCode: 'PPS',
                version: '1.2.0',
                lastModified: '2025-12-18 14:30',
                lastModifiedTimestamp: new Date('2025-12-18 14:30').getTime()
            },
            {
                id: 'ASG002',
                title: '데이터 분석 기초 과제',
                description: 'Python을 활용한 데이터 분석 및 시각화',
                competencyCode: 'DIG',
                version: '2.0.1',
                lastModified: '2025-12-17 09:15',
                lastModifiedTimestamp: new Date('2025-12-17 09:15').getTime()
            },
            {
                id: 'ASG003',
                title: '웹 개발 실전 과제',
                description: 'React와 Node.js를 활용한 풀스택 웹 개발',
                competencyCode: 'GCC',
                version: '1.5.3',
                lastModified: '2025-12-16 16:45',
                lastModifiedTimestamp: new Date('2025-12-16 16:45').getTime()
            },
            {
                id: 'ASG004',
                title: '머신러닝 입문 과제',
                description: 'Scikit-learn과 TensorFlow를 활용한 머신러닝 기초',
                competencyCode: 'WFA',
                version: '1.0.0',
                lastModified: '2025-12-15 11:20',
                lastModifiedTimestamp: new Date('2025-12-15 11:20').getTime()
            }
        ];

        // LocalStorage에서 저장된 과제 불러오기
        const savedAssignments = JSON.parse(localStorage.getItem('sandwitchUI_assignments') || '[]');

        // 저장된 과제를 표시 형식으로 변환
        const savedAssignmentsFormatted = savedAssignments.map(assignment => {
            const taskTitle = assignment.tasks && assignment.tasks.length > 0
                ? assignment.tasks[0].title
                : assignment.docMetadata?.title || '제목 없음';
            const description = assignment.docMetadata?.description || '';
            const competencyCode = assignment.docMetadata?.competency?.code || '';
            const version = assignment.docMetadata?.version || '1.0.0';
            const mode = assignment.docMetadata?.mode || '학습모드';
            const lastModifiedTimestamp = assignment.lastModified
                ? new Date(assignment.lastModified).getTime()
                : 0;
            const lastModified = assignment.lastModified
                ? new Date(assignment.lastModified).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : '';

            return {
                id: assignment.id || 'ASG000',
                title: taskTitle,
                description: description,
                competencyCode: competencyCode,
                version: version.replace('v', ''),
                mode: mode,
                lastModified: lastModified,
                lastModifiedTimestamp: lastModifiedTimestamp,
                isSaved: true,
                data: assignment
            };
        });

        // 기본 데이터와 저장된 데이터 병합 (저장된 데이터를 앞에 표시)
        return [...savedAssignmentsFormatted, ...defaultAssignments];
    }

    // ============================================================
    // 공통 테이블 기능 (검색, 정렬, 페이지네이션)
    // ============================================================

    /**
     * 공통 검색 필터링
     * @param {Array} items - 데이터 배열
     * @param {string} searchQuery - 검색어
     * @param {Array} searchFields - 검색할 필드 목록
     */
    filterItems(items, searchQuery, searchFields) {
        if (!searchQuery || searchQuery.trim() === '') {
            return items;
        }

        const query = searchQuery.toLowerCase().trim();
        return items.filter(item => {
            return searchFields.some(field => {
                const value = (item[field] || '').toString().toLowerCase();
                return value.includes(query);
            });
        });
    }

    /**
     * 공통 정렬
     * @param {Array} items - 데이터 배열
     * @param {string} column - 정렬할 컬럼
     * @param {string} direction - 정렬 방향 (asc/desc)
     * @param {Object} columnTypes - 컬럼 타입 정의 (optional)
     */
    sortItems(items, column, direction, columnTypes = {}) {
        return [...items].sort((a, b) => {
            let valueA, valueB;
            const type = columnTypes[column] || 'string';

            if (type === 'number') {
                valueA = parseFloat(a[column]) || 0;
                valueB = parseFloat(b[column]) || 0;
            } else if (type === 'timestamp') {
                valueA = a[column + 'Timestamp'] || a[column] || 0;
                valueB = b[column + 'Timestamp'] || b[column] || 0;
            } else {
                valueA = (a[column] || '').toString().toLowerCase();
                valueB = (b[column] || '').toString().toLowerCase();
            }

            if (direction === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    }

    /**
     * 공통 페이지네이션
     */
    paginateItems(items, page, itemsPerPage) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }

    /**
     * 공통 검색 처리
     */
    handleSearch(tableType, query) {
        this.tableStates[tableType].searchQuery = query;
        this.tableStates[tableType].currentPage = 1;
        this.loadMenuContent(tableType);
    }

    /**
     * 공통 정렬 처리
     */
    handleSort(tableType, column) {
        const state = this.tableStates[tableType];
        if (state.sortColumn === column) {
            state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            state.sortColumn = column;
            state.sortDirection = 'desc';
        }
        this.loadMenuContent(tableType);
    }

    /**
     * 공통 페이지 변경 처리
     */
    handlePageChange(tableType, page) {
        this.tableStates[tableType].currentPage = page;
        this.loadMenuContent(tableType);
    }

    /**
     * 공통 필터 변경 처리
     */
    handleFilterChange(tableType, filterName, value) {
        this.tableStates[tableType][filterName] = value;
        this.tableStates[tableType].currentPage = 1; // 필터 변경 시 첫 페이지로
        this.loadMenuContent(tableType);
    }

    /**
     * 필터 초기화
     */
    resetFilters(tableType) {
        const state = this.tableStates[tableType];
        state.searchQuery = '';
        state.currentPage = 1;

        // 각 테이블 타입별 필터 초기화
        if (tableType === 'assignments') {
            state.filterYear = '';
            state.filterMonth = '';
            state.filterCompetencyCode = '';
        } else if (tableType === 'lectures') {
            state.filterYear = '';
            state.filterMonth = '';
            state.filterStatus = '';
        } else if (tableType === 'users') {
            state.filterYear = '';
            state.filterMonth = '';
            state.filterRole = '';
            state.filterStatus = '';
        }

        this.loadMenuContent(tableType);
    }

    /**
     * 연도/월 필터로 데이터 필터링
     */
    filterByDate(items, year, month, dateField) {
        if (!year && !month) return items;

        return items.filter(item => {
            const timestamp = item[dateField + 'Timestamp'] || item[dateField];
            if (!timestamp) return false;

            const date = new Date(timestamp);
            const itemYear = date.getFullYear().toString();
            const itemMonth = (date.getMonth() + 1).toString().padStart(2, '0');

            if (year && month) {
                return itemYear === year && itemMonth === month;
            } else if (year) {
                return itemYear === year;
            } else if (month) {
                return itemMonth === month;
            }
            return true;
        });
    }

    /**
     * 특정 필드 값으로 필터링
     */
    filterByField(items, fieldName, value) {
        if (!value) return items;
        return items.filter(item => item[fieldName] === value);
    }

    /**
     * 연도 옵션 생성 (최근 5년)
     */
    getYearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        return years;
    }

    /**
     * 월 옵션 생성
     */
    getMonthOptions() {
        return [
            { value: '01', label: '1월' },
            { value: '02', label: '2월' },
            { value: '03', label: '3월' },
            { value: '04', label: '4월' },
            { value: '05', label: '5월' },
            { value: '06', label: '6월' },
            { value: '07', label: '7월' },
            { value: '08', label: '8월' },
            { value: '09', label: '9월' },
            { value: '10', label: '10월' },
            { value: '11', label: '11월' },
            { value: '12', label: '12월' }
        ];
    }

    /**
     * 역량 코드 옵션
     */
    getCompetencyCodeOptions() {
        return [
            { value: 'PPS', label: 'PPS - 프롬프트 문제해결력' },
            { value: 'DIG', label: 'DIG - 데이터 기반 통찰력' },
            { value: 'GCC', label: 'GCC - 생성형 콘텐츠 제작' },
            { value: 'WFA', label: 'WFA - 업무자동화 능력' }
        ];
    }

    /**
     * 공통 정렬 아이콘 렌더링
     */
    renderSortIconFor(tableType, column) {
        const state = this.tableStates[tableType];
        const isActive = state.sortColumn === column;
        const direction = state.sortDirection;

        if (isActive) {
            return direction === 'asc'
                ? '<i class="fas fa-sort-up sort-icon active"></i>'
                : '<i class="fas fa-sort-down sort-icon active"></i>';
        }
        return '<i class="fas fa-sort sort-icon"></i>';
    }

    /**
     * 공통 페이지네이션 렌더링
     */
    renderPaginationFor(tableType, totalItems, currentPage, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return '';

        let paginationHtml = '<div class="pagination">';

        // 이전 버튼
        paginationHtml += `
            <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.adminManager.handlePageChange('${tableType}', ${currentPage - 1})"
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 페이지 번호
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHtml += `
                <button class="pagination-btn" onclick="window.adminManager.handlePageChange('${tableType}', 1)">1</button>
            `;
            if (startPage > 2) {
                paginationHtml += '<span class="pagination-ellipsis">...</span>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="window.adminManager.handlePageChange('${tableType}', ${i})">${i}</button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += '<span class="pagination-ellipsis">...</span>';
            }
            paginationHtml += `
                <button class="pagination-btn" onclick="window.adminManager.handlePageChange('${tableType}', ${totalPages})">${totalPages}</button>
            `;
        }

        // 다음 버튼
        paginationHtml += `
            <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.adminManager.handlePageChange('${tableType}', ${currentPage + 1})"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHtml += '</div>';

        // 페이지 정보
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        paginationHtml += `
            <div class="pagination-info">
                전체 ${totalItems}개 중 ${startItem}-${endItem} 표시
            </div>
        `;

        return paginationHtml;
    }

    /**
     * 공통 검색 섹션 렌더링
     */
    renderSearchSection(tableType, searchQuery, totalItems, placeholder) {
        const inputId = `${tableType}SearchInput`;
        return `
            <div class="search-section">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" 
                           id="${inputId}"
                           class="search-input" 
                           placeholder="${placeholder} (Enter로 검색)"
                           value="${searchQuery}"
                           onkeyup="if(event.key === 'Enter') window.adminManager.handleSearch('${tableType}', this.value)">
                    ${searchQuery ? `
                        <button class="search-clear-btn" onclick="window.adminManager.handleSearch('${tableType}', '')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                ${searchQuery ? `
                    <div class="search-result-info">
                        <strong>"${searchQuery}"</strong> 검색 결과: <span class="result-count">${totalItems}개</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ============================================================
    // 과제 관리 (이전 버전 호환성 유지)
    // ============================================================

    /**
     * 과제 검색 필터링 (호환성)
     */
    filterAssignments(assignments, searchQuery) {
        return this.filterItems(assignments, searchQuery, ['title', 'description', 'id', 'competencyCode']);
    }

    /**
     * 과제 정렬 (호환성)
     */
    sortAssignments(assignments, column, direction) {
        const columnTypes = {
            lastModified: 'timestamp',
            version: 'string'
        };
        return this.sortItems(assignments, column, direction, columnTypes);
    }

    /**
     * 과제 페이지네이션 (호환성)
     */
    paginateAssignments(assignments, page, itemsPerPage) {
        return this.paginateItems(assignments, page, itemsPerPage);
    }

    /**
     * 검색 처리 (호환성)
     */
    handleAssignmentSearch(query) {
        this.handleSearch('assignments', query);
    }

    /**
     * 정렬 처리 (호환성)
     */
    handleAssignmentSort(column) {
        this.handleSort('assignments', column);
    }

    /**
     * 페이지 변경 처리 (호환성)
     */
    handleAssignmentPageChange(page) {
        this.handlePageChange('assignments', page);
    }

    /**
     * 정렬 아이콘 렌더링 (호환성)
     */
    renderSortIcon(column) {
        return this.renderSortIconFor('assignments', column);
    }

    /**
     * 페이지네이션 렌더링 (호환성)
     */
    renderPagination(totalItems, currentPage, itemsPerPage) {
        return this.renderPaginationFor('assignments', totalItems, currentPage, itemsPerPage);
    }

    /**
     * 과제 관리 컨텐츠 렌더링
     */
    renderAssignmentsContent() {
        const state = this.assignmentState;
        const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage,
            filterYear, filterMonth, filterCompetencyCode } = state;

        // 모든 과제 가져오기
        let assignments = this.getAllAssignments();

        // 검색 필터링
        assignments = this.filterAssignments(assignments, searchQuery);

        // 연도/월 필터링
        assignments = this.filterByDate(assignments, filterYear, filterMonth, 'lastModified');

        // 역량 코드 필터링
        assignments = this.filterByField(assignments, 'competencyCode', filterCompetencyCode);

        // 전체 개수 저장 (페이지네이션용)
        const totalItems = assignments.length;

        // 정렬
        assignments = this.sortAssignments(assignments, sortColumn, sortDirection);

        // 페이지네이션
        const paginatedAssignments = this.paginateAssignments(assignments, currentPage, itemsPerPage);

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);
                return date.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return dateStr;
            }
        };

        // 옵션 생성
        const yearOptions = this.getYearOptions();
        const monthOptions = this.getMonthOptions();
        const competencyOptions = this.getCompetencyCodeOptions();

        // 활성 필터 개수
        const activeFilterCount = [filterYear, filterMonth, filterCompetencyCode].filter(f => f).length;

        const tableRows = paginatedAssignments.length > 0 ? paginatedAssignments.map(assignment => `
            <tr>
                <td>
                    <div class="assignment-title-cell">
                        <strong>${assignment.title}</strong>
                        ${assignment.description ? `<small class="assignment-description">${assignment.description}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge" style="background: #e0e7ff; color: #4338ca; font-weight: 600;">
                        ${assignment.competencyCode || '-'}
                    </span>
                </td>
                <td>${assignment.mode || '학습모드'}</td>
                <td>v${assignment.version || '1.0.0'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" ${assignment.isSaved ? `onclick="window.adminManager.viewAssignment('${assignment.id}')"` : ''}>
                            <i class="fas fa-eye"></i> 보기
                        </button>
                        <button class="btn-action btn-edit" ${assignment.isSaved ? `onclick="window.adminManager.editAssignment('${assignment.id}')"` : ''}>
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button class="btn-action btn-delete" ${assignment.isSaved ? `onclick="window.adminManager.deleteAssignment('${assignment.id}')"` : ''}>
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">검색 결과가 없습니다.</td></tr>';

        return `
            <div class="content-section">
                <div class="content-section-header">
                    <div class="header-title-group">
                        <h2 class="content-section-title">
                            <i class="fas fa-tasks"></i> 과제 관리
                        </h2>
                        <p class="content-section-description">
                            등록된 과제를 관리하고, 검색, 필터, 정렬 기능을 통해 원하는 과제를 빠르게 찾을 수 있습니다.
                        </p>
                    </div>
                </div>

                <!-- 검색 및 필터 섹션 -->
                <div class="search-section">
                    <div class="search-section-left">
                        <!-- 검색 입력 -->
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text"
                                   id="assignmentSearchInput"
                                   class="search-input"
                                   placeholder="제목, 설명으로 검색..."
                                   value="${searchQuery}"
                                   onkeyup="if(event.key === 'Enter') window.adminManager.handleAssignmentSearch(this.value)">
                            ${searchQuery ? `
                                <button class="search-clear-btn" onclick="window.adminManager.handleAssignmentSearch('')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    
                    <!-- 필터 그룹 -->
                    <div class="filter-group">
                        <!-- 연도 필터 -->
                        <div class="filter-item">
                            <select id="filterYear" 
                                    class="filter-select"
                                    onchange="window.adminManager.handleFilterChange('assignments', 'filterYear', this.value)">
                                <option value="">연도 전체</option>
                                ${yearOptions.map(year => `
                                    <option value="${year}" ${filterYear === year.toString() ? 'selected' : ''}>${year}년</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- 월 필터 -->
                        <div class="filter-item">
                            <select id="filterMonth" 
                                    class="filter-select"
                                    onchange="window.adminManager.handleFilterChange('assignments', 'filterMonth', this.value)">
                                <option value="">월 전체</option>
                                ${monthOptions.map(month => `
                                    <option value="${month.value}" ${filterMonth === month.value ? 'selected' : ''}>${month.label}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- 역량 코드 필터 -->
                        <div class="filter-item">
                            <select id="filterCompetencyCode" 
                                    class="filter-select"
                                    onchange="window.adminManager.handleFilterChange('assignments', 'filterCompetencyCode', this.value)">
                                <option value="">역량 코드 전체</option>
                                ${competencyOptions.map(comp => `
                                    <option value="${comp.value}" ${filterCompetencyCode === comp.value ? 'selected' : ''}>${comp.label}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- 필터 초기화 -->
                        ${activeFilterCount > 0 ? `
                            <button class="filter-reset-btn" onclick="window.adminManager.resetFilters('assignments')">
                                <i class="fas fa-undo"></i> 초기화
                            </button>
                        ` : ''}
                    </div>
                    
                    </div>

                    <!-- 새 과제 생성 버튼 -->
                    <button class="btn btn-primary btn-create-assignment" onclick="window.adminManager.showCreateAssignmentModal()">
                        <i class="fas fa-plus"></i> 새 과제 생성
                    </button>
                </div>

                <table class="admin-table sortable-table">
                    <thead>
                        <tr>
                            <th class="sortable-header" onclick="window.adminManager.handleAssignmentSort('title')">
                                제목 ${this.renderSortIcon('title')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleAssignmentSort('competencyCode')">
                                역량 코드 ${this.renderSortIcon('competencyCode')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleAssignmentSort('mode')">
                                모드 ${this.renderSortIcon('mode')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleAssignmentSort('version')">
                                버전 ${this.renderSortIcon('version')}
                            </th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <!-- 페이지네이션 -->
                <div class="pagination-wrapper">
                    ${this.renderPagination(totalItems, currentPage, itemsPerPage)}
                </div>
            </div>
        `;
    }

    /**
     * 과제 보기
     */
    viewAssignment(assignmentId) {
        const assignments = JSON.parse(localStorage.getItem('sandwitchUI_assignments') || '[]');
        const assignment = assignments.find(a => a.id === assignmentId);

        if (assignment) {
            const jsonString = JSON.stringify(assignment, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${assignment.docMetadata?.competency?.code || 'ASSIGNMENT'}_${assignment.docMetadata?.mode || 'MODE'}_시나리오.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * 과제 수정
     */
    editAssignment(assignmentId) {
        // 수정 기능은 추후 구현
        this.showInfo('수정 기능은 준비 중입니다.');
    }

    /**
     * 과제 삭제
     */
    deleteAssignment(assignmentId) {
        if (!window.modalManager) {
            if (confirm('정말 삭제하시겠습니까?')) {
                this.performDelete(assignmentId);
            }
            return;
        }

        window.modalManager.confirm(
            '정말 삭제하시겠습니까?',
            () => {
                this.performDelete(assignmentId);
            },
            null
        );
    }

    /**
     * 과제 삭제 실행
     */
    performDelete(assignmentId) {
        const assignments = JSON.parse(localStorage.getItem('sandwitchUI_assignments') || '[]');
        const filtered = assignments.filter(a => a.id !== assignmentId);
        localStorage.setItem('sandwitchUI_assignments', JSON.stringify(filtered));

        // 목록 새로고침
        this.loadMenuContent('assignments');
        this.showInfo('과제가 삭제되었습니다.');
    }

    /**
     * 모든 특강 데이터 가져오기
     */
    getAllLectures() {
        // 기본 목업 데이터
        const defaultLectures = [
            {
                id: 1,
                title: '생성형 AI 활용 가이드',
                instructor: '김강사',
                institution: '한국대학교 컴퓨터공학과',
                date: '2025-12-19',
                dateTimestamp: new Date('2025-12-19').getTime(),
                time: '14:00 - 16:00',
                location: '온라인 (Zoom)',
                participants: 24,
                status: 'active'
            },
            {
                id: 2,
                title: '데이터 분석 기초',
                instructor: '이강사',
                institution: '서울대학교 통계학과',
                date: '2025-12-26',
                dateTimestamp: new Date('2025-12-26').getTime(),
                time: '10:00 - 12:00',
                location: '본관 301호',
                participants: 0,
                status: 'pending'
            },
            {
                id: 3,
                title: '웹 개발 실전',
                instructor: '박강사',
                institution: '연세대학교 정보산업공학과',
                date: '2025-12-15',
                dateTimestamp: new Date('2025-12-15').getTime(),
                time: '15:00 - 17:00',
                location: '공학관 205호',
                participants: 32,
                status: 'completed'
            },
            {
                id: 4,
                title: '머신러닝 입문',
                instructor: '최강사',
                institution: '고려대학교 인공지능학과',
                date: '2025-12-10',
                dateTimestamp: new Date('2025-12-10').getTime(),
                time: '13:00 - 15:00',
                location: '과학관 401호',
                participants: 28,
                status: 'completed'
            },
            {
                id: 5,
                title: '클라우드 컴퓨팅 기초',
                instructor: '정강사',
                institution: '성균관대학교 소프트웨어학과',
                date: '2025-12-28',
                dateTimestamp: new Date('2025-12-28').getTime(),
                time: '11:00 - 13:00',
                location: '온라인 (Zoom)',
                participants: 0,
                status: 'pending'
            },
            {
                id: 6,
                title: 'Python 기초 프로그래밍',
                instructor: '한강사',
                institution: '카이스트 전산학부',
                date: '2025-12-20',
                dateTimestamp: new Date('2025-12-20').getTime(),
                time: '09:00 - 11:00',
                location: '온라인 (Zoom)',
                participants: 45,
                status: 'active'
            },
            {
                id: 7,
                title: '블록체인 기술 세미나',
                instructor: '송강사',
                institution: '포항공대 컴퓨터공학과',
                date: '2025-12-22',
                dateTimestamp: new Date('2025-12-22').getTime(),
                time: '14:00 - 17:00',
                location: '혁신관 501호',
                participants: 18,
                status: 'pending'
            },
            {
                id: 8,
                title: 'UX/UI 디자인 워크샵',
                instructor: '오강사',
                institution: '홍익대학교 디자인학부',
                date: '2025-12-08',
                dateTimestamp: new Date('2025-12-08').getTime(),
                time: '10:00 - 13:00',
                location: '디자인센터 3층',
                participants: 22,
                status: 'completed'
            }
        ];

        // LocalStorage에서 저장된 특강 불러오기
        const savedLectures = JSON.parse(localStorage.getItem('sandwitchUI_lectures') || '[]');

        return [...savedLectures, ...defaultLectures];
    }

    /**
     * 특강 관리 컨텐츠 렌더링
     */
    renderLecturesContent() {
        const state = this.tableStates.lectures;
        const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage } = state;

        // 모든 특강 가져오기
        let lectures = this.getAllLectures();

        // 검색 필터링
        lectures = this.filterItems(lectures, searchQuery, ['title', 'instructor', 'institution', 'location', 'status']);

        // 전체 개수 저장
        const totalItems = lectures.length;

        // 정렬
        const columnTypes = {
            date: 'timestamp',
            participants: 'number'
        };
        lectures = this.sortItems(lectures, sortColumn, sortDirection, columnTypes);

        // 페이지네이션
        const paginatedLectures = this.paginateItems(lectures, currentPage, itemsPerPage);

        const statusBadge = (status) => {
            const statusMap = {
                'active': '<span class="status-badge active">진행중</span>',
                'pending': '<span class="status-badge pending">예정</span>',
                'completed': '<span class="status-badge completed">종료</span>'
            };
            return statusMap[status] || '';
        };

        const tableRows = paginatedLectures.length > 0 ? paginatedLectures.map(lecture => `
            <tr>
                <td>
                    <strong>${lecture.title}</strong><br>
                    <small style="color: #6b7280;">${lecture.institution}</small>
                </td>
                <td>${lecture.instructor}</td>
                <td>${lecture.date}<br><small style="color: #6b7280;">${lecture.time}</small></td>
                <td>${lecture.location}</td>
                <td>${lecture.participants}명</td>
                <td>${statusBadge(lecture.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view">
                            <i class="fas fa-eye"></i> 보기
                        </button>
                        <button class="btn-action btn-edit">
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button class="btn-action btn-delete">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">검색 결과가 없습니다.</td></tr>';

        return `
            <div class="content-section">
                <div class="content-section-header">
                    <h2 class="content-section-title">
                        <i class="fas fa-chalkboard-teacher"></i> 특강 관리
                    </h2>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> 새 특강 생성
                    </button>
                </div>
                
                <!-- 검색 섹션 -->
                ${this.renderSearchSection('lectures', searchQuery, totalItems, '특강명, 강사, 기관, 장소로 검색...')}

                <table class="admin-table sortable-table">
                    <thead>
                        <tr>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('lectures', 'title')">
                                특강명 ${this.renderSortIconFor('lectures', 'title')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('lectures', 'instructor')">
                                강사 ${this.renderSortIconFor('lectures', 'instructor')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('lectures', 'date')">
                                일시 ${this.renderSortIconFor('lectures', 'date')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('lectures', 'location')">
                                장소 ${this.renderSortIconFor('lectures', 'location')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('lectures', 'participants')">
                                참여자 ${this.renderSortIconFor('lectures', 'participants')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('lectures', 'status')">
                                상태 ${this.renderSortIconFor('lectures', 'status')}
                            </th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <!-- 페이지네이션 -->
                <div class="pagination-wrapper">
                    ${this.renderPaginationFor('lectures', totalItems, currentPage, itemsPerPage)}
                </div>
            </div>
        `;
    }

    /**
     * 모든 사용자 데이터 가져오기
     */
    getAllUsers() {
        // 기본 목업 데이터
        const defaultUsers = [
            {
                id: 1,
                name: '홍길동',
                email: 'hong@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-01-15',
                joinDateTimestamp: new Date('2025-01-15').getTime(),
                status: 'active'
            },
            {
                id: 2,
                name: '김철수',
                email: 'kim@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-02-20',
                joinDateTimestamp: new Date('2025-02-20').getTime(),
                status: 'active'
            },
            {
                id: 3,
                name: '이영희',
                email: 'lee@example.com',
                role: 'instructor',
                roleLabel: '강사',
                joinDate: '2024-12-10',
                joinDateTimestamp: new Date('2024-12-10').getTime(),
                status: 'active'
            },
            {
                id: 4,
                name: '박민수',
                email: 'park@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-03-05',
                joinDateTimestamp: new Date('2025-03-05').getTime(),
                status: 'inactive'
            },
            {
                id: 5,
                name: '최지영',
                email: 'choi@example.com',
                role: 'manager',
                roleLabel: '관리자',
                joinDate: '2024-11-01',
                joinDateTimestamp: new Date('2024-11-01').getTime(),
                status: 'active'
            },
            {
                id: 6,
                name: '정수진',
                email: 'jung@example.com',
                role: 'instructor',
                roleLabel: '강사',
                joinDate: '2024-12-15',
                joinDateTimestamp: new Date('2024-12-15').getTime(),
                status: 'active'
            },
            {
                id: 7,
                name: '강민호',
                email: 'kang@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-01-20',
                joinDateTimestamp: new Date('2025-01-20').getTime(),
                status: 'active'
            },
            {
                id: 8,
                name: '윤서연',
                email: 'yoon@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-02-01',
                joinDateTimestamp: new Date('2025-02-01').getTime(),
                status: 'active'
            },
            {
                id: 9,
                name: '장준혁',
                email: 'jang@example.com',
                role: 'instructor',
                roleLabel: '강사',
                joinDate: '2024-10-15',
                joinDateTimestamp: new Date('2024-10-15').getTime(),
                status: 'active'
            },
            {
                id: 10,
                name: '한예진',
                email: 'han@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-03-10',
                joinDateTimestamp: new Date('2025-03-10').getTime(),
                status: 'inactive'
            },
            {
                id: 11,
                name: '서지훈',
                email: 'seo@example.com',
                role: 'student',
                roleLabel: '학생',
                joinDate: '2025-01-25',
                joinDateTimestamp: new Date('2025-01-25').getTime(),
                status: 'active'
            },
            {
                id: 12,
                name: '임수빈',
                email: 'lim@example.com',
                role: 'manager',
                roleLabel: '관리자',
                joinDate: '2024-09-01',
                joinDateTimestamp: new Date('2024-09-01').getTime(),
                status: 'active'
            }
        ];

        // LocalStorage에서 저장된 사용자 불러오기
        const savedUsers = JSON.parse(localStorage.getItem('sandwitchUI_users') || '[]');

        return [...savedUsers, ...defaultUsers];
    }

    /**
     * 사용자 관리 컨텐츠 렌더링
     */
    renderUsersContent() {
        const state = this.tableStates.users;
        const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage } = state;

        // 모든 사용자 가져오기
        let users = this.getAllUsers();

        // 검색 필터링
        users = this.filterItems(users, searchQuery, ['name', 'email', 'roleLabel', 'status']);

        // 전체 개수 저장
        const totalItems = users.length;

        // 정렬
        const columnTypes = {
            joinDate: 'timestamp'
        };
        users = this.sortItems(users, sortColumn, sortDirection, columnTypes);

        // 페이지네이션
        const paginatedUsers = this.paginateItems(users, currentPage, itemsPerPage);

        const roleBadge = (role) => {
            const roleMap = {
                'student': '<span class="status-badge" style="background: #dbeafe; color: #1e40af;">학생</span>',
                'instructor': '<span class="status-badge" style="background: #fef3c7; color: #92400e;">강사</span>',
                'manager': '<span class="status-badge" style="background: #e0e7ff; color: #4338ca;">관리자</span>'
            };
            return roleMap[role] || role;
        };

        const statusBadge = (status) => {
            return status === 'active'
                ? '<span class="status-badge active">활성</span>'
                : '<span class="status-badge inactive">비활성</span>';
        };

        const tableRows = paginatedUsers.length > 0 ? paginatedUsers.map(user => `
            <tr>
                <td>
                    <strong>${user.name}</strong><br>
                    <small style="color: #6b7280;">${user.email}</small>
                </td>
                <td>${roleBadge(user.role)}</td>
                <td>${user.joinDate}</td>
                <td>${statusBadge(user.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view">
                            <i class="fas fa-eye"></i> 보기
                        </button>
                        <button class="btn-action btn-edit">
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button class="btn-action btn-delete">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">검색 결과가 없습니다.</td></tr>';

        return `
            <div class="content-section">
                <div class="content-section-header">
                    <h2 class="content-section-title">
                        <i class="fas fa-users"></i> 사용자 관리
                    </h2>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> 새 사용자 추가
                    </button>
                </div>
                
                <!-- 검색 섹션 -->
                ${this.renderSearchSection('users', searchQuery, totalItems, '이름, 이메일, 역할로 검색...')}

                <table class="admin-table sortable-table">
                    <thead>
                        <tr>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('users', 'name')">
                                이름 / 이메일 ${this.renderSortIconFor('users', 'name')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('users', 'role')">
                                역할 ${this.renderSortIconFor('users', 'role')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('users', 'joinDate')">
                                가입일 ${this.renderSortIconFor('users', 'joinDate')}
                            </th>
                            <th class="sortable-header" onclick="window.adminManager.handleSort('users', 'status')">
                                상태 ${this.renderSortIconFor('users', 'status')}
                            </th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <!-- 페이지네이션 -->
                <div class="pagination-wrapper">
                    ${this.renderPaginationFor('users', totalItems, currentPage, itemsPerPage)}
                </div>
            </div>
        `;
    }

    /**
     * 환경 설정 컨텐츠 렌더링
     */
    renderSettingsContent() {
        const settings = [
            {
                category: '시스템 설정',
                icon: 'fa-server',
                title: '시스템 기본 설정',
                description: '시스템 전반의 기본 설정을 관리합니다. 사이트 이름, 로고, 기본 언어 등을 설정할 수 있습니다.',
                items: ['사이트 정보', '로고 설정', '기본 언어', '시간대 설정']
            },
            {
                category: '보안 설정',
                icon: 'fa-shield-alt',
                title: '보안 및 인증',
                description: '사용자 인증, 비밀번호 정책, 세션 관리 등의 보안 설정을 관리합니다.',
                items: ['비밀번호 정책', '세션 타임아웃', '2단계 인증', 'IP 제한']
            },
            {
                category: '알림 설정',
                icon: 'fa-bell',
                title: '알림 및 이메일',
                description: '시스템 알림과 이메일 발송 설정을 관리합니다.',
                items: ['이메일 서버 설정', '알림 템플릿', '알림 수신 설정', 'SMS 설정']
            },
            {
                category: '저장소 설정',
                icon: 'fa-database',
                title: '데이터 및 저장소',
                description: '데이터베이스 연결, 파일 저장소, 백업 설정을 관리합니다.',
                items: ['데이터베이스 설정', '파일 저장소', '백업 스케줄', '데이터 정리']
            },
            {
                category: '통합 설정',
                icon: 'fa-plug',
                title: '외부 서비스 연동',
                description: '외부 API 및 서비스 연동 설정을 관리합니다.',
                items: ['API 키 관리', 'OAuth 설정', '웹훅 설정', '서드파티 연동']
            },
            {
                category: '성능 설정',
                icon: 'fa-tachometer-alt',
                title: '성능 및 최적화',
                description: '시스템 성능 최적화 및 캐시 설정을 관리합니다.',
                items: ['캐시 설정', 'CDN 설정', '이미지 최적화', '성능 모니터링']
            }
        ];

        const settingsCards = settings.map(setting => `
            <div class="setting-card">
                <div class="setting-card-header">
                    <div class="setting-card-icon">
                        <i class="fas ${setting.icon}"></i>
                    </div>
                    <h3 class="setting-card-title">${setting.title}</h3>
                </div>
                <p class="setting-card-description">${setting.description}</p>
                <div style="margin-bottom: 1rem;">
                    <strong style="font-size: 0.875rem; color: #6b7280;">설정 항목:</strong>
                    <ul style="margin: 0.5rem 0 0 1.5rem; color: #6b7280; font-size: 0.875rem;">
                        ${setting.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="setting-card-actions">
                    <button class="btn-action btn-edit">
                        <i class="fas fa-cog"></i> 설정하기
                    </button>
                    <button class="btn-action btn-view">
                        <i class="fas fa-info-circle"></i> 상세보기
                    </button>
                </div>
            </div>
        `).join('');

        return `
            <div class="content-section">
                <div class="content-section-header">
                    <h2 class="content-section-title">
                        <i class="fas fa-cog"></i> 환경 설정
                    </h2>
                </div>
                <div class="settings-grid">
                    ${settingsCards}
                </div>
            </div>
        `;
    }

    /**
     * 정보 메시지 표시
     */
    showInfo(message) {
        if (window.modalManager) {
            window.modalManager.info(message);
        } else {
            alert(message);
        }
    }

    /**
     * 새 과제 생성 모달 표시
     */
    showCreateAssignmentModal() {
        const competencies = [
            {
                code: 'PPS',
                name_kr: '프롬프트 문제해결능력',
                name_en: 'Prompt Problem Solving',
                description: '복잡한 문제를 해결하기 위해 AI에게 논리적이고 체계적인 지시(프롬프트)를 설계하는 능력'
            },
            {
                code: 'DIG',
                name_kr: '데이터 기반 통찰력',
                name_en: 'Data Insight Generation',
                description: '데이터를 AI로 분석하고 인사이트를 도출하는 능력. 코드를 직접 실행하여 데이터를 검증하고, 근거 기반의 실질적인 해결책을 도출'
            },
            {
                code: 'GCC',
                name_kr: '생성형 콘텐츠 제작 능력',
                name_en: 'Generative Content Creation',
                description: '텍스트/이미지/영상 생성 능력. 상황과 목적에 완벽히 부합하는 결과물을 생성하고, 스타일을 정교하게 최적화'
            },
            {
                code: 'WFA',
                name_kr: '업무자동화·도구활용 능력',
                name_en: 'Work Flow Automation',
                description: '반복 업무를 AI 및 자동화 도구로 설계하는 능력. 업무 흐름을 구조화하여, 예외 상황에서도 오류 없이 작동하는 자동화 프로세스를 설계'
            }
        ];

        // 모달 본문 HTML 생성
        const modalBody = document.createElement('div');
        modalBody.className = 'competency-selection-modal';
        modalBody.innerHTML = `
            <div class="competency-selection-content">
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
                        모드 선택 <span class="required">*</span>
                    </label>
                    <div class="mode-selection-group" style="display: flex; gap: 1rem;">
                        <label class="mode-radio-label" style="flex: 1; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                            <input type="radio" name="assignmentMode" value="학습모드" style="margin-right: 0.5rem;">
                            <span style="font-weight: 600;">학습모드</span>
                        </label>
                        <label class="mode-radio-label" style="flex: 1; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                            <input type="radio" name="assignmentMode" value="평가모드" style="margin-right: 0.5rem;">
                            <span style="font-weight: 600;">평가모드</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
                        핵심 역량 선택 <span class="required">*</span>
                    </label>
                    <div class="competency-grid-modal" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        ${competencies.map(comp => `
                            <div class="competency-card-modal"
                                 data-competency-code="${comp.code}"
                                 style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; cursor: pointer; transition: all 0.2s;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="font-size: 1.25rem; font-weight: 700; color: #2563eb; letter-spacing: 0.1em;">
                                        ${comp.code}
                                    </div>
                                    <div class="competency-check" style="width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                                        <i class="fas fa-check" style="display: none; color: white; font-size: 0.75rem;"></i>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // 라디오 버튼 스타일 업데이트
        const style = document.createElement('style');
        style.textContent = `
            .competency-card-modal:hover {
                border-color: #2563eb !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
            }
            .competency-card-modal.selected {
                border-color: #2563eb !important;
                background: #eff6ff !important;
            }
            .competency-card-modal.selected .competency-check {
                background: #2563eb !important;
                border-color: #2563eb !important;
            }
            .competency-card-modal.selected .competency-check i {
                display: block !important;
            }
            .mode-radio-label:hover {
                border-color: #2563eb !important;
            }
            .mode-radio-label input[type="radio"]:checked + span {
                color: #2563eb;
            }
            .mode-radio-label:has(input[type="radio"]:checked) {
                border-color: #2563eb !important;
                background: #eff6ff !important;
            }
        `;
        document.head.appendChild(style);

        // 역량 카드 클릭 이벤트
        modalBody.querySelectorAll('.competency-card-modal').forEach(card => {
            card.addEventListener('click', () => {
                // 다른 카드 선택 해제
                modalBody.querySelectorAll('.competency-card-modal').forEach(c => c.classList.remove('selected'));
                // 현재 카드 선택
                card.classList.add('selected');
            });
        });

        // 모달 표시 (큰 모달로 표시)
        const modal = window.modalManager.show({
            type: 'info',
            title: '새 과제 생성',
            message: modalBody,
            closeOnBackdrop: false,
            buttons: [
                {
                    label: '취소',
                    action: () => {
                        document.head.removeChild(style);
                    },
                    style: 'secondary'
                },
                {
                    label: '생성하기',
                    action: () => {
                        const selectedCard = modalBody.querySelector('.competency-card-modal.selected');
                        const selectedMode = modalBody.querySelector('input[name="assignmentMode"]:checked');

                        if (!selectedCard || !selectedMode) {
                            window.modalManager.error('모드와 핵심 역량을 모두 선택해주세요.');
                            return false; // 모달 닫지 않음
                        }

                        const competencyCode = selectedCard.dataset.competencyCode;
                        const mode = selectedMode.value;
                        const competency = competencies.find(c => c.code === competencyCode);

                        // 역량별 파일로 네비게이션
                        const fileName = `${competencyCode}_create-assignment.html`;

                        // URL 파라미터로 전달
                        const params = new URLSearchParams({
                            competencyCode: competencyCode,
                            competencyNameKr: competency.name_kr,
                            competencyNameEn: competency.name_en,
                            competencyDescription: competency.description,
                            mode: mode
                        });

                        document.head.removeChild(style);
                        window.location.href = `${fileName}?${params.toString()}`;
                    },
                    style: 'primary'
                }
            ]
        });

        // 모달에 large 클래스 추가하여 크기 확장
        if (modal) {
            modal.classList.add('modal-large');
        }
    }
}

// 관리자 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});


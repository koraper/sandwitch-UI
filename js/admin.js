// 관리자 페이지 관리 클래스
class AdminManager {
    constructor() {
        this.currentMenu = 'assignments';
        this.init();
    }

    init() {
        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 컨텐츠 로드
        this.loadMenuContent(this.currentMenu);
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
     * 과제 관리 컨텐츠 렌더링
     */
    renderAssignmentsContent() {
        const assignments = [
            {
                id: 1,
                title: '생성형 AI 활용 프로젝트',
                description: 'ChatGPT를 활용한 실무 프로젝트 과제',
                status: 'active',
                deadline: '2025-12-31',
                submissions: 24,
                totalStudents: 30
            },
            {
                id: 2,
                title: '데이터 분석 기초 과제',
                description: 'Python을 활용한 데이터 분석 및 시각화',
                status: 'pending',
                deadline: '2026-01-15',
                submissions: 0,
                totalStudents: 25
            },
            {
                id: 3,
                title: '웹 개발 실전 과제',
                description: 'React와 Node.js를 활용한 풀스택 웹 개발',
                status: 'completed',
                deadline: '2025-12-10',
                submissions: 32,
                totalStudents: 32
            },
            {
                id: 4,
                title: '머신러닝 입문 과제',
                description: 'Scikit-learn과 TensorFlow를 활용한 머신러닝 기초',
                status: 'completed',
                deadline: '2025-12-05',
                submissions: 28,
                totalStudents: 28
            }
        ];

        const statusBadge = (status) => {
            const statusMap = {
                'active': '<span class="status-badge active">진행중</span>',
                'pending': '<span class="status-badge pending">대기중</span>',
                'completed': '<span class="status-badge completed">완료</span>'
            };
            return statusMap[status] || '';
        };

        const tableRows = assignments.map(assignment => `
            <tr>
                <td>
                    <strong>${assignment.title}</strong><br>
                    <small style="color: #6b7280;">${assignment.description}</small>
                </td>
                <td>${statusBadge(assignment.status)}</td>
                <td>${assignment.deadline}</td>
                <td>${assignment.submissions} / ${assignment.totalStudents}</td>
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
        `).join('');

        return `
            <div class="content-section">
                <div class="content-section-header">
                    <h2 class="content-section-title">
                        <i class="fas fa-tasks"></i> 과제 관리
                    </h2>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> 새 과제 생성
                    </button>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>과제명</th>
                            <th>상태</th>
                            <th>마감일</th>
                            <th>제출 현황</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 특강 관리 컨텐츠 렌더링
     */
    renderLecturesContent() {
        const lectures = [
            {
                id: 1,
                title: '생성형 AI 활용 가이드',
                instructor: '김강사',
                institution: '한국대학교 컴퓨터공학과',
                date: '2025-12-19',
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
                time: '11:00 - 13:00',
                location: '온라인 (Zoom)',
                participants: 0,
                status: 'pending'
            }
        ];

        const statusBadge = (status) => {
            const statusMap = {
                'active': '<span class="status-badge active">진행중</span>',
                'pending': '<span class="status-badge pending">예정</span>',
                'completed': '<span class="status-badge completed">종료</span>'
            };
            return statusMap[status] || '';
        };

        const tableRows = lectures.map(lecture => `
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
        `).join('');

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
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>특강명</th>
                            <th>강사</th>
                            <th>일시</th>
                            <th>장소</th>
                            <th>참여자</th>
                            <th>상태</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 사용자 관리 컨텐츠 렌더링
     */
    renderUsersContent() {
        const users = [
            {
                id: 1,
                name: '홍길동',
                email: 'hong@example.com',
                role: 'student',
                joinDate: '2025-01-15',
                status: 'active'
            },
            {
                id: 2,
                name: '김철수',
                email: 'kim@example.com',
                role: 'student',
                joinDate: '2025-02-20',
                status: 'active'
            },
            {
                id: 3,
                name: '이영희',
                email: 'lee@example.com',
                role: 'instructor',
                joinDate: '2024-12-10',
                status: 'active'
            },
            {
                id: 4,
                name: '박민수',
                email: 'park@example.com',
                role: 'student',
                joinDate: '2025-03-05',
                status: 'inactive'
            },
            {
                id: 5,
                name: '최지영',
                email: 'choi@example.com',
                role: 'manager',
                joinDate: '2024-11-01',
                status: 'active'
            },
            {
                id: 6,
                name: '정수진',
                email: 'jung@example.com',
                role: 'instructor',
                joinDate: '2024-12-15',
                status: 'active'
            }
        ];

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

        const tableRows = users.map(user => `
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
        `).join('');

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
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>이름 / 이메일</th>
                            <th>역할</th>
                            <th>가입일</th>
                            <th>상태</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
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
}

// 관리자 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});


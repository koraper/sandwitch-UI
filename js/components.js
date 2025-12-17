// 컴포넌트 드래그앤드롭 기능
class ComponentManager {
    constructor(app) {
        this.app = app;
        this.draggedComponent = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupComponentLibrary();
    }

    setupDragAndDrop() {
        // 컴포넌트 아이템 드래그 시작
        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedComponent = {
                    type: e.target.dataset.type,
                    element: e.target
                };
                e.dataTransfer.effectAllowed = 'copy';
                e.target.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '';
                this.draggedComponent = null;
            });
        });

        // 드롭존 설정
        const dropZone = document.getElementById('dropZone');
        const canvas = document.getElementById('canvasContent');

        [dropZone, canvas].forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';

                if (dropZone) {
                    dropZone.classList.add('drag-over');
                }
            });

            zone.addEventListener('dragleave', (e) => {
                if (dropZone && e.target === dropZone) {
                    dropZone.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();

                if (dropZone) {
                    dropZone.classList.remove('drag-over');
                }

                if (this.draggedComponent) {
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    this.createComponent(this.draggedComponent.type, x, y);
                }
            });
        });
    }

    setupComponentLibrary() {
        // 컴포넌트 라이브러리 확장 가능
        this.componentTemplates = {
            text: {
                name: '텍스트',
                icon: '📝',
                category: 'basic',
                defaultStyle: {
                    fontSize: '14px',
                    color: '#333333',
                    fontFamily: 'inherit'
                }
            },
            button: {
                name: '버튼',
                icon: '🔘',
                category: 'basic',
                defaultStyle: {
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                }
            },
            input: {
                name: '입력창',
                icon: '📥',
                category: 'basic',
                defaultStyle: {
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px'
                }
            },
            image: {
                name: '이미지',
                icon: '🖼️',
                category: 'basic',
                defaultStyle: {
                    backgroundColor: '#f8f9fa',
                    border: '1px dashed #e1e4e8'
                }
            },
            container: {
                name: '컨테이너',
                icon: '📦',
                category: 'layout',
                defaultStyle: {
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px',
                    padding: '16px'
                }
            },
            grid: {
                name: '그리드',
                icon: '⊞',
                category: 'layout',
                defaultStyle: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    padding: '16px'
                }
            },
            flex: {
                name: '플렉스',
                icon: '↔️',
                category: 'layout',
                defaultStyle: {
                    display: 'flex',
                    gap: '16px',
                    padding: '16px'
                }
            },
            navbar: {
                name: '네비게이션 바',
                icon: '🧭',
                category: 'navigation',
                defaultStyle: {
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e1e4e8',
                    padding: '12px 24px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
            },
            sidebar: {
                name: '사이드바',
                icon: '📋',
                category: 'navigation',
                defaultStyle: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
            },
            tab: {
                name: '탭',
                icon: '📑',
                category: 'navigation',
                defaultStyle: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px'
                }
            }
        };
    }

    createComponent(type, x, y) {
        const template = this.componentTemplates[type];
        if (!template) return;

        const element = this.app.createElement(type, x, y);

        // 기본 스타일 적용
        if (template.defaultStyle) {
            element.style = { ...template.defaultStyle };
            this.app.updateElementStyle(element);
        }

        // 특정 컴포넌트 초기화
        this.initializeComponent(element, type);

        return element;
    }

    initializeComponent(element, type) {
        switch(type) {
            case 'grid':
                this.initializeGrid(element);
                break;
            case 'flex':
                this.initializeFlex(element);
                break;
            case 'navbar':
                this.initializeNavbar(element);
                break;
            case 'sidebar':
                this.initializeSidebar(element);
                break;
            case 'tab':
                this.initializeTab(element);
                break;
        }
    }

    initializeGrid(element) {
        const div = document.getElementById(element.id);
        if (div) {
            // 그리드 아이템 추가
            for (let i = 0; i < 4; i++) {
                const item = document.createElement('div');
                item.className = 'grid-item';
                item.textContent = `항목 ${i + 1}`;
                div.appendChild(item);
            }
            element.content = div.innerHTML;
        }
    }

    initializeFlex(element) {
        const div = document.getElementById(element.id);
        if (div) {
            // 플렉스 아이템 추가
            for (let i = 0; i < 3; i++) {
                const item = document.createElement('div');
                item.className = 'flex-item';
                item.textContent = `아이템 ${i + 1}`;
                div.appendChild(item);
            }
            element.content = div.innerHTML;
        }
    }

    initializeNavbar(element) {
        const div = document.getElementById(element.id);
        if (div) {
            div.innerHTML = `
                <div class="navbar-brand">${element.content}</div>
                <div class="navbar-menu">
                    <a href="#" class="navbar-item active">홈</a>
                    <a href="#" class="navbar-item">서비스</a>
                    <a href="#" class="navbar-item">소개</a>
                    <a href="#" class="navbar-item">문의</a>
                </div>
            `;
            element.content = div.innerHTML;

            // 네비게이션 아이템 클릭 이벤트
            div.querySelectorAll('.navbar-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    div.querySelectorAll('.navbar-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });
        }
    }

    initializeSidebar(element) {
        const div = document.getElementById(element.id);
        if (div) {
            div.innerHTML = `
                <div class="sidebar-header">${element.content}</div>
                <div class="sidebar-menu">
                    <a href="#" class="sidebar-item active">대시보드</a>
                    <a href="#" class="sidebar-item">프로필</a>
                    <a href="#" class="sidebar-item">설정</a>
                    <a href="#" class="sidebar-item">로그아웃</a>
                </div>
            `;
            element.content = div.innerHTML;

            // 사이드바 아이템 클릭 이벤트
            div.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    div.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });
        }
    }

    initializeTab(element) {
        const div = document.getElementById(element.id);
        if (div) {
            div.innerHTML = `
                <div class="tabs-header">
                    <div class="tab-item active" data-tab="1">탭 1</div>
                    <div class="tab-item" data-tab="2">탭 2</div>
                    <div class="tab-item" data-tab="3">탭 3</div>
                </div>
                <div class="tabs-content">
                    <div class="tab-panel active" data-panel="1">탭 1 내용</div>
                    <div class="tab-panel" data-panel="2">탭 2 내용</div>
                    <div class="tab-panel" data-panel="3">탭 3 내용</div>
                </div>
            `;
            element.content = div.innerHTML;

            // 탭 전환 이벤트
            const tabItems = div.querySelectorAll('.tab-item');
            const tabPanels = div.querySelectorAll('.tab-panel');

            tabItems.forEach(item => {
                item.addEventListener('click', () => {
                    const tabId = item.dataset.tab;

                    // 활성 탭 변경
                    tabItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    // 활성 패널 변경
                    tabPanels.forEach(panel => {
                        panel.classList.toggle('active', panel.dataset.panel === tabId);
                    });
                });
            });
        }
    }

    // 컴포넌트 검색 기능
    searchComponents(query) {
        const items = document.querySelectorAll('.component-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    // 컴포넌트 필터링
    filterComponents(category) {
        const items = document.querySelectorAll('.component-item');
        items.forEach(item => {
            const itemCategory = item.dataset.category || 'basic';
            const matches = category === 'all' || itemCategory === category;
            item.style.display = matches ? 'block' : 'none';
        });
    }

    // 커스텀 컴포넌트 추가
    addCustomComponent(component) {
        const category = document.querySelector('.component-category[data-category="custom"]');
        if (!category) {
            // 커스텀 카테고리 생성
            const customCategory = document.createElement('div');
            customCategory.className = 'component-category';
            customCategory.dataset.category = 'custom';
            customCategory.innerHTML = `
                <h4>커스텀</h4>
                <div class="component-items"></div>
            `;
            document.querySelector('.component-list').appendChild(customCategory);
        }

        const itemsContainer = document.querySelector('.component-category[data-category="custom"] .component-items');
        const item = document.createElement('div');
        item.className = 'component-item';
        item.draggable = true;
        item.dataset.type = component.type;
        item.textContent = component.name;

        item.addEventListener('dragstart', (e) => {
            this.draggedComponent = {
                type: component.type,
                element: e.target,
                custom: true,
                template: component
            };
            e.dataTransfer.effectAllowed = 'copy';
            e.target.style.opacity = '0.5';
        });

        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '';
            this.draggedComponent = null;
        });

        itemsContainer.appendChild(item);

        // 템플릿 저장
        this.componentTemplates[component.type] = component;
    }

    // 컴포넌트 라이브러리 가져오기
    getComponentLibrary() {
        return this.componentTemplates;
    }

    // 컴포넌트 미리보기 생성
    createComponentPreview(type, container) {
        const template = this.componentTemplates[type];
        if (!template) return;

        const preview = document.createElement('div');
        preview.className = 'component-preview';
        preview.style.cssText = `
            width: 100%;
            height: 100px;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
        `;

        // 간단한 미리보기 생성
        switch(type) {
            case 'button':
                const button = document.createElement('button');
                button.textContent = '버튼';
                button.style.cssText = template.defaultStyle;
                preview.appendChild(button);
                break;
            case 'text':
                const text = document.createElement('div');
                text.textContent = '텍스트 샘플';
                text.style.cssText = template.defaultStyle;
                preview.appendChild(text);
                break;
            case 'input':
                const input = document.createElement('input');
                input.placeholder = '입력하세요...';
                input.style.cssText = template.defaultStyle;
                preview.appendChild(input);
                break;
            default:
                preview.innerHTML = `<span>${template.icon} ${template.name}</span>`;
        }

        container.appendChild(preview);
        return preview;
    }
}

// 컴포넌트 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (window.sandwichUI) {
        window.sandwichUI.componentManager = new ComponentManager(window.sandwichUI);
    }
});
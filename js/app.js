// 메인 앱 JavaScript
class SandwichUI {
    constructor() {
        this.currentView = 'wireframe';
        this.selectedElement = null;
        this.elements = [];
        this.history = [];
        this.historyIndex = -1;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.clipboard = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadFromLocalStorage();
        this.updateCanvas();
    }

    setupEventListeners() {
        // 네비게이션 버튼
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // 저장 및 내보내기
        document.getElementById('saveBtn').addEventListener('click', () => this.save());
        document.getElementById('exportBtn').addEventListener('click', () => this.export());

        // 협업 모달
        document.querySelector('[data-view="collaborate"]').addEventListener('click', () => {
            this.showCollaborateModal();
        });

        // 모달 닫기
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal('collaborateModal');
        });

        // 툴바 버튼
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoom(0.8));

        // 도구 선택
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTool(e.target.id.replace('Tool', ''));
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.save();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'c':
                        e.preventDefault();
                        this.copy();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.paste();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.duplicate();
                        break;
                }
            } else {
                switch(e.key) {
                    case 'Delete':
                    case 'Backspace':
                        if (this.selectedElement) {
                            e.preventDefault();
                            this.deleteSelected();
                        }
                        break;
                    case 'Escape':
                        this.deselectAll();
                        break;
                }
            }
        });
    }

    switchView(view) {
        this.currentView = view;

        // 네비게이션 버튼 업데이트
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // 캔버스 클래스 업데이트
        const canvas = document.getElementById('canvas');
        canvas.classList.toggle('wireframe-mode', view === 'wireframe');

        // 뷰별 초기화
        switch(view) {
            case 'wireframe':
                this.initWireframeMode();
                break;
            case 'mockup':
                this.initMockupMode();
                break;
            case 'prototype':
                this.initPrototypeMode();
                break;
            case 'collaborate':
                this.showCollaborateModal();
                break;
        }
    }

    initWireframeMode() {
        // 와이어프레임 모드 초기화
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.add('wireframe');
        });
    }

    initMockupMode() {
        // 목업 모드 초기화
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('wireframe');
        });
    }

    initPrototypeMode() {
        // 프로토타입 모드 초기화
        this.setupPrototypeInteractions();
    }

    selectTool(tool) {
        // 툴 선택
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(tool + 'Tool').classList.add('active');

        this.currentTool = tool;
        document.body.style.cursor = this.getToolCursor(tool);
    }

    getToolCursor(tool) {
        const cursors = {
            select: 'default',
            rect: 'crosshair',
            text: 'text',
            line: 'crosshair'
        };
        return cursors[tool] || 'default';
    }

    createElement(type, x = 100, y = 100) {
        const element = {
            id: 'element_' + Date.now(),
            type: type,
            x: x,
            y: y,
            width: this.getDefaultWidth(type),
            height: this.getDefaultHeight(type),
            content: this.getDefaultContent(type),
            style: {}
        };

        this.elements.push(element);
        this.renderElement(element);
        this.selectElement(element);
        this.saveHistory();
        return element;
    }

    getDefaultWidth(type) {
        const widths = {
            text: 120,
            button: 100,
            input: 200,
            image: 150,
            container: 300,
            grid: 400,
            flex: 400,
            navbar: 600,
            sidebar: 250,
            tab: 400
        };
        return widths[type] || 200;
    }

    getDefaultHeight(type) {
        const heights = {
            text: 30,
            button: 40,
            input: 40,
            image: 150,
            container: 200,
            grid: 250,
            flex: 150,
            navbar: 60,
            sidebar: 400,
            tab: 300
        };
        return heights[type] || 100;
    }

    getDefaultContent(type) {
        const contents = {
            text: '텍스트를 입력하세요',
            button: '버튼',
            input: '',
            image: '',
            container: '',
            grid: '',
            flex: '',
            navbar: '로고',
            sidebar: '메뉴',
            tab: '탭'
        };
        return contents[type] || '';
    }

    renderElement(element) {
        const div = document.createElement('div');
        div.className = `canvas-element component-${element.type}`;
        div.id = element.id;
        div.style.left = element.x + 'px';
        div.style.top = element.y + 'px';
        div.style.width = element.width + 'px';
        div.style.height = element.height + 'px';

        // 콘텐츠 설정
        this.setElementContent(div, element);

        // 리사이즈 핸들 추가
        this.addResizeHandles(div);

        // 이벤트 리스너 추가
        this.addElementEventListeners(div, element);

        document.getElementById('canvasContent').appendChild(div);
    }

    setElementContent(div, element) {
        switch(element.type) {
            case 'text':
                div.contentEditable = false;
                div.textContent = element.content;
                break;
            case 'button':
                div.textContent = element.content;
                break;
            case 'input':
                div.setAttribute('placeholder', '입력하세요...');
                break;
            case 'container':
                if (element.content) {
                    div.innerHTML = element.content;
                }
                break;
        }
    }

    addResizeHandles(div) {
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startResize(e, div, position);
            });
            div.appendChild(handle);
        });
    }

    addElementEventListeners(div, element) {
        div.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startDrag(e, element);
        });

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // 더블클릭 편집
        div.addEventListener('dblclick', (e) => {
            if (element.type === 'text') {
                this.editText(element);
            }
        });
    }

    startDrag(e, element) {
        if (e.target.classList.contains('resize-handle')) return;

        this.isDragging = true;
        this.draggedElement = element;

        const rect = document.getElementById(element.id).getBoundingClientRect();
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();

        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
    }

    handleDrag(e) {
        if (!this.isDragging) return;

        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const x = e.clientX - canvasRect.left - this.dragOffset.x;
        const y = e.clientY - canvasRect.top - this.dragOffset.y;

        this.draggedElement.x = Math.max(0, x);
        this.draggedElement.y = Math.max(0, y);

        this.updateElementPosition(this.draggedElement);
    }

    stopDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.saveHistory();
        }

        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }

    startResize(e, elementDiv, handle) {
        this.isResizing = true;
        this.resizeElement = this.elements.find(el => el.id === elementDiv.id);
        this.resizeHandle = handle;
        this.resizeStart = {
            x: e.clientX,
            y: e.clientY,
            width: this.resizeElement.width,
            height: this.resizeElement.height
        };

        document.addEventListener('mousemove', this.handleResize.bind(this));
        document.addEventListener('mouseup', this.stopResize.bind(this));
    }

    handleResize(e) {
        if (!this.isResizing) return;

        const dx = e.clientX - this.resizeStart.x;
        const dy = e.clientY - this.resizeStart.y;

        switch(this.resizeHandle) {
            case 'se':
                this.resizeElement.width = Math.max(50, this.resizeStart.width + dx);
                this.resizeElement.height = Math.max(30, this.resizeStart.height + dy);
                break;
            case 'e':
                this.resizeElement.width = Math.max(50, this.resizeStart.width + dx);
                break;
            case 's':
                this.resizeElement.height = Math.max(30, this.resizeStart.height + dy);
                break;
        }

        this.updateElementSize(this.resizeElement);
    }

    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            this.saveHistory();
        }

        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    }

    updateElementPosition(element) {
        const div = document.getElementById(element.id);
        if (div) {
            div.style.left = element.x + 'px';
            div.style.top = element.y + 'px';
        }
    }

    updateElementSize(element) {
        const div = document.getElementById(element.id);
        if (div) {
            div.style.width = element.width + 'px';
            div.style.height = element.height + 'px';
        }
    }

    selectElement(element) {
        // 이전 선택 해제
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
        });

        // 새 선택
        const div = document.getElementById(element.id);
        if (div) {
            div.classList.add('selected');
            this.selectedElement = element;
            this.updatePropertiesPanel(element);
        }
    }

    deselectAll() {
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
        });
        this.selectedElement = null;
        this.updatePropertiesPanel(null);
    }

    updatePropertiesPanel(element) {
        const panel = document.getElementById('propertiesContent');

        if (!element) {
            panel.innerHTML = '<div class="no-selection"><p>요소를 선택하면 속성이 표시됩니다</p></div>';
            return;
        }

        panel.innerHTML = `
            <div class="property-group">
                <label class="property-label">위치</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="number" class="property-input" id="propX" value="${element.x}" placeholder="X">
                    <input type="number" class="property-input" id="propY" value="${element.y}" placeholder="Y">
                </div>
            </div>
            <div class="property-group">
                <label class="property-label">크기</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="number" class="property-input" id="propWidth" value="${element.width}" placeholder="너비">
                    <input type="number" class="property-input" id="propHeight" value="${element.height}" placeholder="높이">
                </div>
            </div>
            ${element.type === 'text' || element.type === 'button' ? `
            <div class="property-group">
                <label class="property-label">텍스트</label>
                <input type="text" class="property-input" id="propContent" value="${element.content}" placeholder="텍스트 내용">
            </div>
            ` : ''}
            <div class="property-group">
                <label class="property-label">배경색</label>
                <input type="color" class="property-input" id="propBgColor" value="${element.style.backgroundColor || '#ffffff'}">
            </div>
        `;

        // 속성 변경 이벤트 리스너
        this.setupPropertyListeners(element);
    }

    setupPropertyListeners(element) {
        const propX = document.getElementById('propX');
        const propY = document.getElementById('propY');
        const propWidth = document.getElementById('propWidth');
        const propHeight = document.getElementById('propHeight');
        const propContent = document.getElementById('propContent');
        const propBgColor = document.getElementById('propBgColor');

        if (propX) propX.addEventListener('input', (e) => {
            element.x = parseInt(e.target.value) || 0;
            this.updateElementPosition(element);
            this.saveHistory();
        });

        if (propY) propY.addEventListener('input', (e) => {
            element.y = parseInt(e.target.value) || 0;
            this.updateElementPosition(element);
            this.saveHistory();
        });

        if (propWidth) propWidth.addEventListener('input', (e) => {
            element.width = parseInt(e.target.value) || 100;
            this.updateElementSize(element);
            this.saveHistory();
        });

        if (propHeight) propHeight.addEventListener('input', (e) => {
            element.height = parseInt(e.target.value) || 50;
            this.updateElementSize(element);
            this.saveHistory();
        });

        if (propContent) propContent.addEventListener('input', (e) => {
            element.content = e.target.value;
            this.updateElementContent(element);
            this.saveHistory();
        });

        if (propBgColor) propBgColor.addEventListener('input', (e) => {
            element.style.backgroundColor = e.target.value;
            this.updateElementStyle(element);
            this.saveHistory();
        });
    }

    updateElementContent(element) {
        const div = document.getElementById(element.id);
        if (div) {
            this.setElementContent(div, element);
        }
    }

    updateElementStyle(element) {
        const div = document.getElementById(element.id);
        if (div) {
            Object.assign(div.style, element.style);
        }
    }

    editText(element) {
        const div = document.getElementById(element.id);
        const originalContent = element.content;

        div.contentEditable = true;
        div.focus();

        // 전체 텍스트 선택
        const range = document.createRange();
        range.selectNodeContents(div);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const finishEdit = () => {
            div.contentEditable = false;
            element.content = div.textContent;
            this.saveHistory();
        };

        div.addEventListener('blur', finishEdit, { once: true });
        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEdit();
            }
        });
    }

    deleteSelected() {
        if (!this.selectedElement) return;

        const index = this.elements.findIndex(el => el.id === this.selectedElement.id);
        if (index > -1) {
            this.elements.splice(index, 1);
            document.getElementById(this.selectedElement.id).remove();
            this.selectedElement = null;
            this.updatePropertiesPanel(null);
            this.saveHistory();
        }
    }

    copy() {
        if (this.selectedElement) {
            this.clipboard = { ...this.selectedElement };
        }
    }

    paste() {
        if (this.clipboard) {
            const newElement = {
                ...this.clipboard,
                id: 'element_' + Date.now(),
                x: this.clipboard.x + 20,
                y: this.clipboard.y + 20
            };
            this.elements.push(newElement);
            this.renderElement(newElement);
            this.selectElement(newElement);
            this.saveHistory();
        }
    }

    duplicate() {
        if (this.selectedElement) {
            this.copy();
            this.paste();
        }
    }

    saveHistory() {
        // 현재 상태를 히스토리에 저장
        const currentState = JSON.stringify(this.elements);

        // 현재 인덱스 이후의 히스토리 삭제
        this.history = this.history.slice(0, this.historyIndex + 1);

        // 새 상태 추가
        this.history.push(currentState);
        this.historyIndex++;

        // 히스토리 크기 제한
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }

        // 로컬 스토리지에 저장
        this.saveToLocalStorage();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadHistoryState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadHistoryState();
        }
    }

    loadHistoryState() {
        const state = this.history[this.historyIndex];
        this.elements = JSON.parse(state);
        this.updateCanvas();
    }

    updateCanvas() {
        // 캔버스 초기화
        document.getElementById('canvasContent').innerHTML = '';

        // 드롭존 다시 추가
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.id = 'dropZone';
        dropZone.innerHTML = '<p>여기에 컴포넌트를 드래그하세요</p>';
        document.getElementById('canvasContent').appendChild(dropZone);

        // 모든 요소 렌더링
        this.elements.forEach(element => {
            this.renderElement(element);
        });
    }

    zoom(factor) {
        const canvas = document.getElementById('canvasContent');
        const currentScale = parseFloat(canvas.style.transform?.replace('scale(', '').replace(')', '') || 1);
        const newScale = Math.max(0.1, Math.min(3, currentScale * factor));
        canvas.style.transform = `scale(${newScale})`;
    }

    save() {
        this.saveToLocalStorage();
        this.showNotification('저장되었습니다.');
    }

    saveToLocalStorage() {
        const data = {
            elements: this.elements,
            currentView: this.currentView,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('sandwitchUI', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('sandwitchUI');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.elements = data.elements || [];
                this.currentView = data.currentView || 'wireframe';
                this.switchView(this.currentView);
            } catch (e) {
                console.error('로드 실패:', e);
            }
        }
    }

    export() {
        const data = {
            elements: this.elements,
            currentView: this.currentView,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sandwitch-ui-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('내보내기 완료!');
    }

    showCollaborateModal() {
        document.getElementById('collaborateModal').classList.add('show');
        this.loadComments();
        this.loadVersions();
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s;
        `;

        document.body.appendChild(notification);

        // 애니메이션
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // 자동 제거
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.sandwichUI = new SandwichUI();
});
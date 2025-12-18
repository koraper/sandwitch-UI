// 캔버스 관리 및 드로잉 기능
class CanvasManager {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('canvas');
        this.isDrawing = false;
        this.currentTool = null;
        this.drawingElement = null;
        this.drawStart = { x: 0, y: 0 };
        this.gridSize = 20;
        this.showGrid = false;
        this.snapToGrid = false;
        this.guideLines = [];
        this.init();
    }

    init() {
        this.setupCanvasEvents();
        this.setupToolbar();
        this.setupKeyboardShortcuts();
        this.updateCanvasBackground();
    }

    setupCanvasEvents() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    }

    setupToolbar() {
        // 툴 버튼 이벤트 설정
        const toolButtons = {
            'selectTool': 'select',
            'rectTool': 'rectangle',
            'textTool': 'text',
            'lineTool': 'line'
        };

        Object.entries(toolButtons).forEach(([btnId, tool]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.setTool(tool);
                });
            }
        });

        // 추가 툴 버튼
        document.getElementById('gridToggleBtn')?.addEventListener('click', () => {
            this.toggleGrid();
        });

        document.getElementById('snapToggleBtn')?.addEventListener('click', () => {
            this.toggleSnapToGrid();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('input, textarea')) return;

            switch(e.key) {
                case 'g':
                    if (!e.ctrlKey && !e.metaKey) {
                        this.toggleGrid();
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleSnapToGrid();
                    }
                    break;
            }
        });
    }

    setTool(tool) {
        this.currentTool = tool;

        // 툴 버튼 활성화 상태 업데이트
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const toolBtn = document.getElementById(tool + 'Tool');
        if (toolBtn) {
            toolBtn.classList.add('active');
        }

        // 커서 변경
        this.updateCursor(tool);

        // 캔버스 상태 업데이트
        this.canvas.style.cursor = this.getToolCursor(tool);
    }

    getToolCursor(tool) {
        const cursors = {
            select: 'default',
            rectangle: 'crosshair',
            text: 'text',
            line: 'crosshair'
        };
        return cursors[tool] || 'default';
    }

    updateCursor(tool) {
        document.body.style.cursor = this.getToolCursor(tool);
    }

    handleMouseDown(e) {
        if (e.target.closest('.canvas-element')) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = this.snapToGrid ? this.snapToGridValue(e.clientX - rect.left) : e.clientX - rect.left;
        const y = this.snapToGrid ? this.snapToGridValue(e.clientY - rect.top) : e.clientY - rect.top;

        this.isDrawing = true;
        this.drawStart = { x, y };

        switch(this.currentTool) {
            case 'rectangle':
                this.startDrawingRectangle(x, y);
                break;
            case 'line':
                this.startDrawingLine(x, y);
                break;
            case 'text':
                this.startDrawingText(x, y, e);
                break;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = this.snapToGrid ? this.snapToGridValue(e.clientX - rect.left) : e.clientX - rect.left;
        const y = this.snapToGrid ? this.snapToGridValue(e.clientY - rect.top) : e.clientY - rect.top;

        // 가이드라인 업데이트
        this.updateGuideLines(x, y);

        if (!this.isDrawing) return;

        switch(this.currentTool) {
            case 'rectangle':
                this.updateDrawingRectangle(x, y);
                break;
            case 'line':
                this.updateDrawingLine(x, y);
                break;
        }
    }

    handleMouseUp(e) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        switch(this.currentTool) {
            case 'rectangle':
                this.finishDrawingRectangle();
                break;
            case 'line':
                this.finishDrawingLine();
                break;
        }

        this.clearGuideLines();
    }

    handleCanvasClick(e) {
        if (e.target !== this.canvas && !e.target.classList.contains('drop-zone')) return;

        // 캔버스 클릭 시 선택 해제
        this.app.deselectAll();
    }

    // 사각형 그리기
    startDrawingRectangle(x, y) {
        const element = {
            id: 'temp_' + Date.now(),
            type: 'container',
            x: x,
            y: y,
            width: 0,
            height: 0,
            content: '',
            style: {
                backgroundColor: 'transparent',
                border: '2px solid #2563eb',
                borderRadius: '4px'
            }
        };

        this.drawingElement = element;
        this.renderTempElement(element);
    }

    updateDrawingRectangle(x, y) {
        if (!this.drawingElement) return;

        const width = Math.abs(x - this.drawStart.x);
        const height = Math.abs(y - this.drawStart.y);
        const left = Math.min(x, this.drawStart.x);
        const top = Math.min(y, this.drawStart.y);

        this.drawingElement.x = left;
        this.drawingElement.y = top;
        this.drawingElement.width = width;
        this.drawingElement.height = height;

        this.updateTempElement(this.drawingElement);
    }

    finishDrawingRectangle() {
        if (!this.drawingElement || this.drawingElement.width < 10 || this.drawingElement.height < 10) {
            this.removeTempElement();
            this.drawingElement = null;
            return;
        }

        // 임시 요소를 실제 요소로 변환
        this.drawingElement.id = 'element_' + Date.now();
        this.drawingElement.style.border = '1px solid #e1e4e8';
        this.drawingElement.style.backgroundColor = '#f8f9fa';

        this.app.elements.push(this.drawingElement);
        this.app.renderElement(this.drawingElement);
        this.app.selectElement(this.drawingElement);
        this.app.saveHistory();

        this.removeTempElement();
        this.drawingElement = null;
    }

    // 선 그리기
    startDrawingLine(x, y) {
        const svg = this.ensureSVG();

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#2563eb');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('id', 'temp_line');

        svg.appendChild(line);
        this.drawingElement = line;
    }

    updateDrawingLine(x, y) {
        if (!this.drawingElement) return;

        this.drawingElement.setAttribute('x2', x);
        this.drawingElement.setAttribute('y2', y);
    }

    finishDrawingLine() {
        if (!this.drawingElement) return;

        const line = this.drawingElement;
        const x1 = parseFloat(line.getAttribute('x1'));
        const y1 = parseFloat(line.getAttribute('y1'));
        const x2 = parseFloat(line.getAttribute('x2'));
        const y2 = parseFloat(line.getAttribute('y2'));

        // 최소 길이 체크
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        if (length < 10) {
            line.remove();
        } else {
            // 실제 선으로 저장
            line.setAttribute('id', 'line_' + Date.now());
            this.app.elements.push({
                id: line.getAttribute('id'),
                type: 'line',
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                style: {
                    stroke: '#2563eb',
                    strokeWidth: '2'
                }
            });
            this.app.saveHistory();
        }

        this.drawingElement = null;
    }

    // 텍스트 그리기
    startDrawingText(x, y, e) {
        e.preventDefault();

        const text = prompt('텍스트를 입력하세요:');
        if (!text) return;

        const element = this.app.createElement('text', x, y);
        element.content = text;
        this.app.updateElementContent(element);
        this.app.saveHistory();
    }

    // SVG 요소 보장
    ensureSVG() {
        let svg = document.querySelector('#canvasContent svg');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            document.getElementById('canvasContent').appendChild(svg);
        }
        return svg;
    }

    // 임시 요소 렌더링
    renderTempElement(element) {
        this.removeTempElement();

        const div = document.createElement('div');
        div.className = 'canvas-element temp-element';
        div.id = element.id;
        div.style.cssText = `
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
            pointer-events: none;
            z-index: 1000;
        `;

        Object.assign(div.style, element.style);
        document.getElementById('canvasContent').appendChild(div);
    }

    updateTempElement(element) {
        const div = document.getElementById(element.id);
        if (div) {
            div.style.left = element.x + 'px';
            div.style.top = element.y + 'px';
            div.style.width = element.width + 'px';
            div.style.height = element.height + 'px';
        }
    }

    removeTempElement() {
        const temp = document.querySelector('.temp-element');
        if (temp) temp.remove();
    }

    // 그리드 기능
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.updateCanvasBackground();
    }

    toggleSnapToGrid() {
        this.snapToGrid = !this.snapToGrid;
        this.showNotification(this.snapToGrid ? '그리드 스냅 활성화' : '그리드 스냅 비활성화');
    }

    snapToGridValue(value) {
        if (!this.snapToGrid) return value;
        return Math.round(value / this.gridSize) * this.gridSize;
    }

    updateCanvasBackground() {
        if (this.showGrid) {
            this.canvas.style.backgroundImage = `
                repeating-linear-gradient(0deg, transparent, transparent ${this.gridSize - 1}px, rgba(0,0,0,0.1) ${this.gridSize - 1}px, rgba(0,0,0,0.1) ${this.gridSize}px),
                repeating-linear-gradient(90deg, transparent, transparent ${this.gridSize - 1}px, rgba(0,0,0,0.1) ${this.gridSize - 1}px, rgba(0,0,0,0.1) ${this.gridSize}px)
            `;
        } else {
            this.canvas.style.backgroundImage = 'none';
        }
    }

    // 가이드라인
    updateGuideLines(x, y) {
        this.clearGuideLines();

        // 수평 가이드라인
        const hGuide = document.createElement('div');
        hGuide.className = 'guide-line horizontal';
        hGuide.style.top = y + 'px';
        document.getElementById('canvasContent').appendChild(hGuide);

        // 수직 가이드라인
        const vGuide = document.createElement('div');
        vGuide.className = 'guide-line vertical';
        vGuide.style.left = x + 'px';
        document.getElementById('canvasContent').appendChild(vGuide);

        this.guideLines = [hGuide, vGuide];
    }

    clearGuideLines() {
        this.guideLines.forEach(guide => guide.remove());
        this.guideLines = [];
    }

    // 스냅 기능
    getSnapPoints() {
        const points = [];
        this.app.elements.forEach(element => {
            points.push(
                { x: element.x, y: element.y },
                { x: element.x + element.width, y: element.y },
                { x: element.x, y: element.y + element.height },
                { x: element.x + element.width, y: element.y + element.height },
                { x: element.x + element.width / 2, y: element.y },
                { x: element.x, y: element.y + element.height / 2 },
                { x: element.x + element.width, y: element.y + element.height / 2 },
                { x: element.x + element.width / 2, y: element.y + element.height }
            );
        });
        return points;
    }

    findNearestSnapPoint(x, y, threshold = 10) {
        const points = this.getSnapPoints();
        let nearest = null;
        let minDistance = threshold;

        points.forEach(point => {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = point;
            }
        });

        return nearest;
    }

    // 확대/축소
    zoomIn() {
        this.app.zoom(1.2);
    }

    zoomOut() {
        this.app.zoom(0.8);
    }

    resetZoom() {
        const canvas = document.getElementById('canvasContent');
        canvas.style.transform = 'scale(1)';
    }

    // 캔버스 크기 조절
    resizeCanvas(width, height) {
        const canvasContent = document.getElementById('canvasContent');
        canvasContent.style.width = width + 'px';
        canvasContent.style.height = height + 'px';
    }

    // 캔버스 내보내기
    exportAsImage() {
        const canvasContent = document.getElementById('canvasContent');

        // html2canvas 또는 유사한 라이브러리 필요
        // 여기서는 간단한 구현만 보여줌
        this.showNotification('이미지 내보내기 기능은 추가 개발이 필요합니다.');
    }

    // 알림 표시
    showNotification(message) {
        this.app.showNotification(message);
    }

    // 캔버스 초기화
    clearCanvas() {
        if (!window.modalManager) {
            // 모달 매니저가 없으면 기본 confirm 사용
            if (confirm('캔버스를 비우시겠습니까?')) {
                this.performClearCanvas();
            }
            return;
        }

        window.modalManager.confirm(
            '캔버스를 비우시겠습니까?',
            () => {
                this.performClearCanvas();
            },
            null
        );
    }

    performClearCanvas() {
        this.app.elements = [];
        this.app.updateCanvas();
        this.app.saveHistory();
        this.showNotification('캔버스가 비워졌습니다.');
    }

    // 선택 영역
    createSelectionRect(x1, y1, x2, y2) {
        const rect = document.createElement('div');
        rect.className = 'selection-rect';
        rect.style.cssText = `
            position: absolute;
            left: ${Math.min(x1, x2)}px;
            top: ${Math.min(y1, y2)}px;
            width: ${Math.abs(x2 - x1)}px;
            height: ${Math.abs(y2 - y1)}px;
            border: 2px solid #2563eb;
            background: rgba(37, 99, 235, 0.1);
            pointer-events: none;
            z-index: 999;
        `;

        document.getElementById('canvasContent').appendChild(rect);
        return rect;
    }

    // 선택 영역 내 요소들 선택
    selectElementsInRect(x1, y1, x2, y3) {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const right = Math.max(x1, x2);
        const bottom = Math.max(y1, y2);

        const selectedElements = this.app.elements.filter(element => {
            return element.x >= left &&
                   element.y >= top &&
                   element.x + element.width <= right &&
                   element.y + element.height <= bottom;
        });

        return selectedElements;
    }
}

// 캔버스 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (window.sandwichUI) {
        window.sandwichUI.canvasManager = new CanvasManager(window.sandwichUI);
    }
});
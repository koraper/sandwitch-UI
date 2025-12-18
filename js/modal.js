// 공통 모달 관리 클래스
class ModalManager {
    constructor() {
        this.activeModals = [];
    }

    /**
     * 모달 표시
     * @param {Object} options - 모달 옵션
     * @param {string} options.type - 모달 타입: 'info', 'warning', 'error'
     * @param {string} options.title - 헤더 제목
     * @param {string} options.message - 메시지 내용
     * @param {Array} options.buttons - 버튼 배열 [{label: '확인', action: () => {}, style: 'primary'}]
     * @param {Function} options.onClose - 모달 닫힐 때 콜백
     * @param {boolean} options.closeOnBackdrop - 배경 클릭 시 닫기 여부
     */
    show(options = {}) {
        const {
            type = 'info',
            title = this.getDefaultTitle(type),
            message = '',
            buttons = [{ label: '확인', action: null, style: 'primary' }],
            onClose = null,
            closeOnBackdrop = true
        } = options;

        // 기존 모달이 있으면 제거
        this.closeAll();

        const modal = this.createModal({
            type,
            title,
            message,
            buttons,
            onClose,
            closeOnBackdrop
        });

        document.body.appendChild(modal);
        this.activeModals.push(modal);

        // 애니메이션
        requestAnimationFrame(() => {
            modal.classList.add('modal-show');
        });

        return modal;
    }

    /**
     * 타입별 기본 제목 반환
     */
    getDefaultTitle(type) {
        const titles = {
            info: '알림',
            warning: '경고',
            error: '오류'
        };
        return titles[type] || '알림';
    }

    /**
     * 모달 생성
     */
    createModal({ type, title, message, buttons, onClose, closeOnBackdrop }) {
        const modal = document.createElement('div');
        modal.className = `modal modal-${type}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');

        // 배경 오버레이
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        if (closeOnBackdrop) {
            overlay.addEventListener('click', () => this.close(modal, onClose));
        }

        // 모달 컨테이너
        const container = document.createElement('div');
        container.className = 'modal-container';

        // 헤더
        const header = this.createHeader(type, title);
        
        // 본문
        const body = this.createBody(message);
        
        // 푸터
        const footer = this.createFooter(buttons, modal, onClose);

        container.appendChild(header);
        container.appendChild(body);
        container.appendChild(footer);

        modal.appendChild(overlay);
        modal.appendChild(container);

        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close(modal, onClose);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    }

    /**
     * 헤더 생성
     */
    createHeader(type, title) {
        const header = document.createElement('div');
        header.className = 'modal-header';

        const icon = document.createElement('div');
        icon.className = `modal-icon modal-icon-${type}`;
        icon.innerHTML = this.getIcon(type);

        const titleEl = document.createElement('h3');
        titleEl.id = 'modal-title';
        titleEl.className = 'modal-title';
        titleEl.textContent = title;

        header.appendChild(icon);
        header.appendChild(titleEl);

        return header;
    }

    /**
     * 타입별 아이콘 반환
     */
    getIcon(type) {
        const icons = {
            info: '<i class="fas fa-info-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            error: '<i class="fas fa-times-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * 본문 생성
     */
    createBody(message) {
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof message === 'string') {
            body.textContent = message;
        } else {
            body.appendChild(message);
        }

        return body;
    }

    /**
     * 푸터 생성
     */
    createFooter(buttons, modal, onClose) {
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        buttons.forEach((button, index) => {
            const btn = document.createElement('button');
            btn.className = `modal-btn modal-btn-${button.style || 'secondary'}`;
            btn.textContent = button.label;
            
            // id 속성 추가 (버튼 식별용)
            if (button.id) {
                btn.id = button.id;
            }
            
            btn.addEventListener('click', () => {
                if (button.action) {
                    const result = button.action();
                    // action이 false를 반환하면 모달을 닫지 않음
                    if (result === false) {
                        return;
                    }
                }
                this.close(modal, onClose);
            });

            footer.appendChild(btn);
        });

        return footer;
    }

    /**
     * 모달 닫기
     */
    close(modal, onClose) {
        if (!modal || !document.body.contains(modal)) return;

        modal.classList.remove('modal-show');
        modal.classList.add('modal-hide');

        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            const index = this.activeModals.indexOf(modal);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }
            if (onClose) {
                onClose();
            }
        }, 300);
    }

    /**
     * 모든 모달 닫기
     */
    closeAll() {
        this.activeModals.forEach(modal => {
            this.close(modal);
        });
        this.activeModals = [];
    }

    // 편의 메서드들
    info(message, options = {}) {
        return this.show({
            type: 'info',
            message,
            ...options
        });
    }

    warning(message, options = {}) {
        return this.show({
            type: 'warning',
            message,
            ...options
        });
    }

    error(message, options = {}) {
        return this.show({
            type: 'error',
            message,
            ...options
        });
    }

    confirm(message, onConfirm, onCancel = null) {
        return this.show({
            type: 'warning',
            title: '확인',
            message,
            buttons: [
                {
                    label: '취소',
                    action: onCancel,
                    style: 'secondary'
                },
                {
                    label: '확인',
                    action: onConfirm,
                    style: 'primary'
                }
            ]
        });
    }
}

// 전역 모달 매니저 인스턴스
window.modalManager = new ModalManager();


// 협업 기능 (코멘트, 버전 관리, 공유)
class CollaborationManager {
    constructor(app) {
        this.app = app;
        this.comments = [];
        this.versions = [];
        this.currentVersion = 0;
        this.collaborators = [];
        this.init();
    }

    init() {
        this.loadComments();
        this.loadVersions();
        this.setupCommentSystem();
        this.setupVersionSystem();
        this.setupShareSystem();
    }

    // 코멘트 시스템
    setupCommentSystem() {
        // 코멘트 추가 폼
        const commentForm = document.querySelector('.comment-input');
        if (commentForm) {
            const textarea = commentForm.querySelector('textarea');
            const submitBtn = commentForm.querySelector('button');

            submitBtn.addEventListener('click', () => {
                const text = textarea.value.trim();
                if (text) {
                    this.addComment(text);
                    textarea.value = '';
                }
            });

            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    const text = textarea.value.trim();
                    if (text) {
                        this.addComment(text);
                        textarea.value = '';
                    }
                }
            });
        }
    }

    addComment(text, elementId = null, position = null) {
        const comment = {
            id: 'comment_' + Date.now(),
            text: text,
            author: this.getCurrentUser(),
            timestamp: new Date().toISOString(),
            elementId: elementId,
            position: position,
            replies: []
        };

        this.comments.push(comment);
        this.saveComments();
        this.renderComment(comment);
        this.showNotification('코멘트가 추가되었습니다.');

        return comment;
    }

    renderComment(comment) {
        const commentList = document.getElementById('commentList');
        if (!commentList) return;

        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        commentDiv.dataset.commentId = comment.id;

        const date = new Date(comment.timestamp);
        const formattedDate = this.formatDate(date);

        commentDiv.innerHTML = `
            <div class="comment-header">
                <strong>${comment.author}</strong>
                <span class="comment-date">${formattedDate}</span>
                <button class="comment-delete" onclick="collaborationManager.deleteComment('${comment.id}')">삭제</button>
            </div>
            <div class="comment-text">${comment.text}</div>
            ${comment.elementId ? `<div class="comment-element">요소: ${comment.elementId}</div>` : ''}
            <div class="comment-replies">
                ${comment.replies.map(reply => this.renderReply(reply)).join('')}
            </div>
            <div class="comment-reply-form">
                <input type="text" placeholder="답글을 입력하세요..." />
                <button onclick="collaborationManager.addReply('${comment.id}')">답글</button>
            </div>
        `;

        commentList.appendChild(commentDiv);
    }

    renderReply(reply) {
        const date = new Date(reply.timestamp);
        const formattedDate = this.formatDate(date);

        return `
            <div class="reply-item">
                <div class="reply-header">
                    <strong>${reply.author}</strong>
                    <span class="reply-date">${formattedDate}</span>
                </div>
                <div class="reply-text">${reply.text}</div>
            </div>
        `;
    }

    addReply(commentId) {
        const commentDiv = document.querySelector(`[data-comment-id="${commentId}"]`);
        const input = commentDiv.querySelector('.comment-reply-form input');
        const text = input.value.trim();

        if (text) {
            const comment = this.comments.find(c => c.id === commentId);
            if (comment) {
                const reply = {
                    id: 'reply_' + Date.now(),
                    text: text,
                    author: this.getCurrentUser(),
                    timestamp: new Date().toISOString()
                };

                comment.replies.push(reply);
                this.saveComments();
                this.refreshComments();
                input.value = '';
            }
        }
    }

    deleteComment(commentId) {
        if (confirm('코멘트를 삭제하시겠습니까?')) {
            this.comments = this.comments.filter(c => c.id !== commentId);
            this.saveComments();
            this.refreshComments();
            this.showNotification('코멘트가 삭제되었습니다.');
        }
    }

    loadComments() {
        const saved = localStorage.getItem('sandwitchUI_comments');
        if (saved) {
            try {
                this.comments = JSON.parse(saved);
            } catch (e) {
                console.error('코멘트 로드 실패:', e);
                this.comments = [];
            }
        }
    }

    saveComments() {
        localStorage.setItem('sandwitchUI_comments', JSON.stringify(this.comments));
    }

    refreshComments() {
        const commentList = document.getElementById('commentList');
        if (commentList) {
            commentList.innerHTML = '';
            this.comments.forEach(comment => {
                this.renderComment(comment);
            });
        }
    }

    // 버전 관리 시스템
    setupVersionSystem() {
        const saveVersionBtn = document.querySelector('.version-section button');
        if (saveVersionBtn) {
            saveVersionBtn.addEventListener('click', () => {
                this.createVersion();
            });
        }
    }

    createVersion(description = '') {
        const version = {
            id: 'version_' + Date.now(),
            description: description || prompt('버전 설명을 입력하세요:'),
            elements: JSON.parse(JSON.stringify(this.app.elements)),
            timestamp: new Date().toISOString(),
            author: this.getCurrentUser(),
            versionNumber: this.versions.length + 1
        };

        if (version.description) {
            this.versions.push(version);
            this.currentVersion = this.versions.length - 1;
            this.saveVersions();
            this.renderVersion(version);
            this.showNotification(`버전 ${version.versionNumber}이 저장되었습니다.`);
        }

        return version;
    }

    renderVersion(version) {
        const versionList = document.getElementById('versionList');
        if (!versionList) return;

        const versionDiv = document.createElement('div');
        versionDiv.className = 'version-item';
        versionDiv.dataset.versionId = version.id;

        const date = new Date(version.timestamp);
        const formattedDate = this.formatDate(date);

        versionDiv.innerHTML = `
            <div class="version-header">
                <strong>버전 ${version.versionNumber}</strong>
                <span class="version-date">${formattedDate}</span>
                <span class="version-author">by ${version.author}</span>
            </div>
            <div class="version-description">${version.description}</div>
            <div class="version-actions">
                <button onclick="collaborationManager.loadVersion('${version.id}')">불러오기</button>
                <button onclick="collaborationManager.compareVersion('${version.id}')">비교</button>
                <button onclick="collaborationManager.deleteVersion('${version.id}')">삭제</button>
            </div>
        `;

        versionList.appendChild(versionDiv);
    }

    loadVersion(versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (version) {
            if (confirm(`버전 ${version.versionNumber}을(를) 불러오시겠습니까? 현재 변경사항은 저장되지 않습니다.`)) {
                this.app.elements = JSON.parse(JSON.stringify(version.elements));
                this.app.updateCanvas();
                this.app.saveHistory();
                this.showNotification(`버전 ${version.versionNumber}이(가) 불러와졌습니다.`);
            }
        }
    }

    compareVersion(versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (version) {
            const differences = this.findDifferences(version.elements, this.app.elements);
            this.showVersionComparison(version, differences);
        }
    }

    findDifferences(version1, version2) {
        // 간단한 비교 로직 - 더 정교한 구현 가능
        const diff = {
            added: [],
            removed: [],
            modified: []
        };

        version2.forEach(element2 => {
            const element1 = version1.find(e1 => e1.id === element2.id);
            if (!element1) {
                diff.added.push(element2);
            } else if (JSON.stringify(element1) !== JSON.stringify(element2)) {
                diff.modified.push({
                    old: element1,
                    new: element2
                });
            }
        });

        version1.forEach(element1 => {
            if (!version2.find(e2 => e2.id === element1.id)) {
                diff.removed.push(element1);
            }
        });

        return diff;
    }

    showVersionComparison(version, differences) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>버전 비교: ${version.description}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="diff-summary">
                        <p>추가된 요소: ${differences.added.length}</p>
                        <p>삭제된 요소: ${differences.removed.length}</p>
                        <p>수정된 요소: ${differences.modified.length}</p>
                    </div>
                    <div class="diff-details">
                        ${this.renderDifferences(differences)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 모달 닫기
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    renderDifferences(differences) {
        let html = '';

        if (differences.added.length > 0) {
            html += '<h4>추가된 요소:</h4>';
            differences.added.forEach(element => {
                html += `<div class="diff-item added">+ ${element.type} (${element.id})</div>`;
            });
        }

        if (differences.removed.length > 0) {
            html += '<h4>삭제된 요소:</h4>';
            differences.removed.forEach(element => {
                html += `<div class="diff-item removed">- ${element.type} (${element.id})</div>`;
            });
        }

        if (differences.modified.length > 0) {
            html += '<h4>수정된 요소:</h4>';
            differences.modified.forEach(diff => {
                html += `<div class="diff-item modified">~ ${diff.new.type} (${diff.new.id})</div>`;
            });
        }

        return html;
    }

    deleteVersion(versionId) {
        if (confirm('버전을 삭제하시겠습니까?')) {
            this.versions = this.versions.filter(v => v.id !== versionId);
            this.saveVersions();
            this.refreshVersions();
            this.showNotification('버전이 삭제되었습니다.');
        }
    }

    loadVersions() {
        const saved = localStorage.getItem('sandwitchUI_versions');
        if (saved) {
            try {
                this.versions = JSON.parse(saved);
            } catch (e) {
                console.error('버전 로드 실패:', e);
                this.versions = [];
            }
        }
    }

    saveVersions() {
        localStorage.setItem('sandwitchUI_versions', JSON.stringify(this.versions));
    }

    refreshVersions() {
        const versionList = document.getElementById('versionList');
        if (versionList) {
            versionList.innerHTML = '';
            this.versions.forEach(version => {
                this.renderVersion(version);
            });
        }
    }

    // 공유 시스템
    setupShareSystem() {
        // 공유 버튼 이벤트 설정
        document.getElementById('shareBtn')?.addEventListener('click', () => {
            this.showShareDialog();
        });

        // 공유 링크 복사 버튼
        document.getElementById('copyShareLinkBtn')?.addEventListener('click', () => {
            this.copyShareLink();
        });
    }

    showShareDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>프로젝트 공유</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="share-section">
                        <h4>공유 링크</h4>
                        <div class="share-link-container">
                            <input type="text" id="shareLinkInput" readonly value="${this.generateShareLink()}" />
                            <button id="copyShareLinkBtn">복사</button>
                        </div>
                    </div>
                    <div class="share-section">
                        <h4>협업자 추가</h4>
                        <div class="collaborator-form">
                            <input type="email" id="collaboratorEmail" placeholder="협업자 이메일" />
                            <button onclick="collaborationManager.addCollaborator()">추가</button>
                        </div>
                    </div>
                    <div class="share-section">
                        <h4>현재 협업자</h4>
                        <div class="collaborator-list" id="collaboratorList">
                            ${this.renderCollaborators()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 모달 닫기
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // 복사 버튼
        modal.querySelector('#copyShareLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
        });
    }

    generateShareLink() {
        // 실제로는 서버에서 고유 링크 생성
        const projectId = btoa(window.location.href);
        return `${window.location.origin}/shared/${projectId}`;
    }

    copyShareLink() {
        const input = document.getElementById('shareLinkInput');
        if (input) {
            input.select();
            document.execCommand('copy');
            this.showNotification('공유 링크가 복사되었습니다.');
        }
    }

    addCollaborator() {
        const emailInput = document.getElementById('collaboratorEmail');
        const email = emailInput.value.trim();

        if (email && this.isValidEmail(email)) {
            const collaborator = {
                id: 'collaborator_' + Date.now(),
                email: email,
                name: email.split('@')[0],
                addedAt: new Date().toISOString(),
                addedBy: this.getCurrentUser(),
                permissions: ['view', 'comment']
            };

            this.collaborators.push(collaborator);
            this.saveCollaborators();
            this.refreshCollaborators();
            emailInput.value = '';
            this.showNotification(`${email}님을 협업자로 추가했습니다.`);
        } else {
            this.showNotification('유효한 이메일 주소를 입력하세요.');
        }
    }

    removeCollaborator(collaboratorId) {
        if (confirm('협업자를 제거하시겠습니까?')) {
            this.collaborators = this.collaborators.filter(c => c.id !== collaboratorId);
            this.saveCollaborators();
            this.refreshCollaborators();
            this.showNotification('협업자가 제거되었습니다.');
        }
    }

    renderCollaborators() {
        if (this.collaborators.length === 0) {
            return '<p>협업자가 없습니다.</p>';
        }

        return this.collaborators.map(collaborator => `
            <div class="collaborator-item">
                <div class="collaborator-info">
                    <strong>${collaborator.name}</strong>
                    <span>${collaborator.email}</span>
                    <small>추가됨: ${this.formatDate(new Date(collaborator.addedAt))}</small>
                </div>
                <button onclick="collaborationManager.removeCollaborator('${collaborator.id}')">제거</button>
            </div>
        `).join('');
    }

    refreshCollaborators() {
        const list = document.getElementById('collaboratorList');
        if (list) {
            list.innerHTML = this.renderCollaborators();
        }
    }

    loadCollaborators() {
        const saved = localStorage.getItem('sandwitchUI_collaborators');
        if (saved) {
            try {
                this.collaborators = JSON.parse(saved);
            } catch (e) {
                console.error('협업자 로드 실패:', e);
                this.collaborators = [];
            }
        }
    }

    saveCollaborators() {
        localStorage.setItem('sandwitchUI_collaborators', JSON.stringify(this.collaborators));
    }

    // 유틸리티 함수
    getCurrentUser() {
        // 실제로는 로그인 시스템과 연동
        return localStorage.getItem('userName') || '게스트';
    }

    setCurrentUser(name) {
        localStorage.setItem('userName', name);
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString('ko-KR');
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 실시간 협업 (WebSocket 연동 가능)
    enableRealtimeCollaboration() {
        // 실제로는 WebSocket 서버 연동 필요
        this.showNotification('실시간 협업 기능은 서버 연동이 필요합니다.');
    }

    // 알림 표시
    showNotification(message) {
        this.app.showNotification(message);
    }
}

// 협업 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (window.sandwichUI) {
        window.collaborationManager = new CollaborationManager(window.sandwichUI);
    }
});
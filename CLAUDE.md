# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Server
```bash
npm start              # Start Python3 HTTP server on port 8080
npm run dev           # Alias for npm start
python3 -m http.server 8080  # Direct Python server command
```

### Testing and Build
This project has no build process or tests - it's pure HTML/CSS/JS that runs directly in the browser.

## Architecture

### Application Overview

**SandwichUI (샌드위치)** is an educational assessment platform for Korean university students focused on competency-based learning. The platform provides three competency modules:

- **DIG**: Data Intelligence & Governance (데이터지능거버넌스)
- **PPS**: Process & Project Management (프로세스프로젝트관리)
- **GCC**: Global Customer Centricity (글로벌고객중심성)

The application serves as both a UI prototyping tool (for wireframe/mockup creation) and a specialized workspace for each competency with AI collaboration features, evaluation modes, and assessment tools.

### Page Structure

| Page | Purpose |
|------|---------|
| `index.html` | Student login page (`LoginManager` in `js/login.js`) |
| `signup.html` | Student registration page |
| `waiting-room.html` | Student waiting room after login |
| `dashboard.html` | Student main dashboard with competency selection |
| `profile.html` | Student profile management |
| `indexmanager.html` | Manager/admin login page |
| `manager-dashboard.html` | Manager main dashboard |
| `manager-waiting-room.html` | Manager waiting room |
| `manager-profile.html` | Manager profile management |
| `admin.html` | Admin panel |
| `create-assignment.html` | Assignment creation interface |
| `manager-create-lecture.html` | Lecture creation for managers |
| `workspaceDIG.html` | DIG workspace with CSV upload, AI chat, and data visualization |
| `workspacePPS.html` | PPS workspace for process/project management |
| `workspaceGCC.html` | GCC workspace for global customer scenarios |

### Core Application Structure

**UI Prototyping System** (from `js/app.js`, `js/components.js`, `js/canvas.js`):
- **Main App (`js/app.js`)**: Central `SandwichUI` class managing global state, element lifecycle, and user interactions
- **Component System (`js/components.js`)**: Drag-and-drop component library with factory pattern for UI elements via `ComponentManager` class
- **Canvas Management (`js/canvas.js`)**: Drawing tools, element positioning, grid snapping (20px), and visual feedback

**Workspace Management** (each competency has its own workspace file with a `WorkspaceManager` class):
- **`js/workspaceDIG.js`**: DIG workspace with CSV upload, AI chat sessions, data visualization tab
- **`js/workspacePPS.js`**: PPS workspace with process management scenarios
- **`js/workspaceGCC.js`**: GCC workspace for customer-centricity evaluations

**Authentication System**:
- **`js/login.js`**: `LoginManager` class for student login with "remember me" functionality
- **`js/login-manager.js`**: Manager/admin authentication (`ManagerLoginManager` class)
- **`js/profile.js`**: User profile management for students
- **`js/manager-profile.js`**: User profile management for managers

**Modal System** (`js/modal.js`):
- **`ModalManager` class**: Centralized modal/alert system with `info()`, `warning()`, `error()`, `confirm()` methods
- Accessible globally as `window.modalManager`

### Key Architectural Patterns

**Class-Based Architecture**: Each major feature is encapsulated in its own class:
- `SandwichUI` - Main UI prototyping orchestrator
- `WorkspaceManager` - Workspace state and scenario management (separate instances per workspace)
- `LoginManager` / `ManagerLoginManager` - Authentication flows for students and managers
- `ModalManager` - Unified modal/alert system
- Elements stored as plain objects in memory with unique IDs from `Date.now()`

**Event-Driven Communication**: Components communicate through DOM events and direct method calls. No framework event system.

**Component Templates**: UI elements created from templates in `componentTemplates` object (in `js/components.js`'s `ComponentManager`).

**Command Pattern**: Used for undo/redo functionality via history stack.

### Data Flow
1. User interactions trigger events
2. App updates in-memory element state
3. Changes reflected in DOM immediately
4. History stack updated for undo/redo
5. LocalStorage persists application state

### State Management

**Main UI Prototyping** (`SandwichUI` class):
- `elements[]`: Array of canvas elements
- `history[]`: Stack for undo/redo
- `selectedElement`: Currently active element
- `clipboard`: For copy/paste operations
- LocalStorage key: `sandwitchUI`

**Workspace State** (`WorkspaceManager` class):
- `scenarioData`: Current scenario JSON loaded from `task/{competency}/`
- `currentTaskNumber`: Selected task (1-6 depending on scenario)
- `currentSessionId`: AI collaboration session ID (uses `sessionNumber` or `sessionId` from data)
- `chatHistory[]`: AI conversation history with timestamps
- `outputData{}`: Session output data keyed by section ID
- `isEvaluationMode`: Boolean for evaluation vs practice mode
- `uploadedCSVData`: For DIG workspace CSV processing
- LocalStorage keys: `sandwitchUI_assignments`, `sandwitchUI_workspace_submissions`

**Authentication State** (student):
- `sandwitchUI_loggedIn`: Boolean login status
- `sandwitchUI_rememberMe`: Boolean for persistent sessions
- `sandwitchUI_user`: Current user object

**Panel State** (workspace):
- `workspace_left_panel_width` / `workspace_right_panel_width`: Saved panel widths
- `workspace_left_panel_collapsed` / `workspace_right_panel_collapsed`: Panel visibility
- `workspace_active_tab`: Currently active tab (chat/output/visualization)

### CSS Architecture
- **`css/style.css`**: Base layout, typography, component-agnostic styles
- **`css/components.css`**: Component-specific styling and canvas elements
- BEM-like naming: `.canvas-element.selected`, `.component-button`
- Workspace panels use `.workspace-left-panel`, `.workspace-center-panel`, `.workspace-right-panel`

## Scenario Data Structure

Scenarios are stored as JSON files in `task/{competency}/`:
- `task/dig/DIG_평가모드_시나리오.json` - DIG always uses evaluation mode
- `task/pps/PPS_평가모드_시나리오.json` - PPS evaluation mode
- `task/pps/PPS_학습모드_시나리오.json` - PPS practice mode
- Scoring rubrics: `{competency}_{mode}_채점기준표.json`

**Scenario JSON Structure**:
```json
{
  "docMetadata": { "version", "mode", "competency" },
  "tasks": [{
    "taskNumber": 1,
    "title": "...",
    "objective": "...",
    "mission": "...",
    "timeLimit": 60,
    "scoringTips": [{ "tip": "..." }],
    "sessions": [{
      "sessionNumber": 1,
      "userDisplays": {
        "situation": "...",
        "rawData": [{ "source", "content", "risks", "fileUrl" }],
        "outputRequirements": {
          "aesRequirements": { "description", "requirement" },
          "aciRequirements": {
            "format": { "style", "length", "requiredSections" },
            "requiredNotation": { "text" },
            "dataReliability": { "requirement" },
            "requiredKeywords": { "requirement" },
            "constraints": { "constraint" }
          }
        }
      }
    }]
  }]
}
```

## Important Implementation Details

### Element IDs and DOM Updates
All elements receive unique IDs using `Date.now()`. Modify in-memory object first, then call update methods to reflect in DOM.

### Drag and Drop
- HTML5 Drag & Drop API for component library items
- Custom mouse event handling for canvas elements
- Resize handles absolutely positioned within elements

### Canvas Coordinates
Absolute pixels relative to canvas container. Grid snapping rounds to nearest 20px when enabled.

### Wireframe Mode
Add `wireframe-mode` class to canvas container for structural outlines instead of full styling.

### Workspace URL Parameters
Workspaces accept URL parameters:
- `assignmentId`: Load assignment from LocalStorage
- `lectureId`: Lecture context for navigation
- `competency`: Competency code (DIG/PPS/GCC)
- `mode`: Evaluation/practice mode

### Workspace Layout (3-Column)
```
┌─────────────┬───────────────────┬─────────────┐
│   Left      │      Center       │   Right     │
│   Panel     │      Panel        │   Panel     │
│ (260-600px) │    (flexible)     │ (300-?)     │
├─────────────┤                   ├─────────────┤
│ Task List   │  Tab Content:     │ Output      │
│ Task Info   │  - Chat Tab       │ Requirements
│ Sessions    │  - Output Tab     │ Scoring     |
│ Data Upload │  - Viz Tab (DIG)  │ Tips        │
└─────────────┴───────────────────┴─────────────┘
```

### Session ID Handling
The workspace supports both `sessionId` and `sessionNumber` in scenario data:
- `findCurrentSession()` helper finds the active session using either field
- When switching tasks, `currentSessionId` resets to the first session's identifier

### Component Types
Basic UI (text, button, input, image), layout (container, grid, flex), navigation (navbar, sidebar, tab). Each has template and initialization logic in `js/components.js`.

### Modal System
Use `window.modalManager` for all user notifications:
```javascript
window.modalManager.info('Message');
window.modalManager.error('Error message');
window.modalManager.warning('Warning message');
window.modalManager.confirm('Are you sure?', onConfirm, onCancel);
```

### Korean Language Interface
All user-facing text is in Korean. Code comments are mixed Korean/English.

### Keyboard Shortcuts (UI Prototyping)
- `Ctrl/Cmd + S`: Save
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + C`: Copy
- `Ctrl/Cmd + V`: Paste
- `Ctrl/Cmd + D`: Duplicate
- `Delete/Backspace`: Delete selected element
- `Escape`: Deselect all

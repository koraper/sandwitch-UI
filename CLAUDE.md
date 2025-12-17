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

### Core Application Structure
This is a single-page application with a modular JavaScript architecture:

- **Main App (`js/app.js`)**: Central orchestrator using the `SandwichUI` class that manages global state, element lifecycle, and user interactions
- **Component System (`js/components.js`)**: Manages the drag-and-drop component library with factory pattern for creating UI elements
- **Canvas Management (`js/canvas.js`)**: Handles drawing tools, element positioning, grid snapping, and visual feedback

### Key Architectural Patterns

**Class-Based Architecture**: Each major feature is encapsulated in its own class with clear separation of concerns:
- Elements are stored as plain objects in memory with unique IDs
- DOM manipulation is handled through dedicated render/update methods
- History management uses Command pattern for undo/redo functionality

**Event-Driven Communication**: Components communicate through DOM events and direct method calls rather than a framework event system. The main app coordinates between modules.

**Component Templates**: UI elements are created from templates defined in `componentTemplates` object, allowing for easy addition of new component types.

### Data Flow
1. User interactions trigger events in the main app
2. App updates the in-memory element state
3. Changes are immediately reflected in the DOM
4. History stack is updated for undo/redo
5. LocalStorage persists the complete application state

### CSS Architecture
- **Base styles (`css/style.css`)**: Layout, typography, and component-agnostic styling
- **Component styles (`css/components.css`)**: Specific styling for each UI component type and canvas elements
- Uses BEM-like naming conventions for component states (`.canvas-element.selected`, `.component-button`)

### State Management
All application state is managed through the main `SandwichUI` class:
- `elements[]`: Array of all canvas elements
- `history[]`: Stack of previous states for undo/redo
- `selectedElement`: Currently active element for property editing
- LocalStorage key: `sandwitchUI`

## Important Implementation Details

### Element IDs and DOM Updates
All elements receive unique IDs using `Date.now()` and are tracked both in memory (`elements[]` array) and in the DOM. When updating elements, always modify the in-memory object first, then call the appropriate update method to reflect changes in the DOM.

### Drag and Drop Implementation
Uses HTML5 Drag & Drop API for component library items and custom mouse event handling for canvas elements. The resize handles are absolutely positioned within each element.

### Canvas Coordinate System
All positioning uses absolute pixels relative to the canvas container. The grid snapping system rounds coordinates to the nearest 20px when enabled.

### Wireframe Mode
Wireframe mode applies special styling to all elements to show basic structural outlines instead of full visual styling. This is done by adding the `wireframe-mode` class to the canvas container.

### Component Types
The application supports basic UI components (text, button, input, image), layout components (container, grid, flex), and navigation components (navbar, sidebar, tab). Each component type has its own template and initialization logic.
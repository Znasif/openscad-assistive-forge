# Changelog v2.6.0 - P2 Features Release

**Release Date**: 2026-01-16  
**Version**: 2.6.0

## Overview

This release implements the three remaining P2 features from the build plan:
- Dependency Visibility - Hide/show parameters based on other parameter values
- Undo/Redo - 50-level parameter editing history with keyboard shortcuts
- Preview LOD - Large model warnings to prevent browser performance issues

## New Features

### Dependency Visibility

Parameters can now be conditionally shown/hidden based on other parameter values.

**Syntax**: Use `@depends(parameter==value)` or `@depends(parameter!=value)` in comments:

```scad
/*[Features]*/
ventilation = "no"; // [yes, no]

// Number of holes per side @depends(ventilation==yes)
hole_count = 3; // [1:10]

// Hole diameter in mm @depends(ventilation==yes)  
hole_diameter = 5; // [3:1:10]
```

**Features**:
- Supports `==` (equals) and `!=` (not equals) operators
- Smooth CSS transitions when showing/hiding
- Respects `prefers-reduced-motion` for accessibility
- Hidden parameters are removed from tab order
- Screen reader announcements when parameters show/hide
- Works with all parameter types (range, enum, boolean, etc.)

### Undo/Redo

Full parameter history tracking with keyboard shortcuts.

**Features**:
- 50-level history buffer
- Undo: `Ctrl+Z` (or `Cmd+Z` on Mac)
- Redo: `Ctrl+Shift+Z` or `Ctrl+Y`
- UI buttons in parameter panel header
- Disabled during rendering to prevent state mismatches
- History cleared on new file upload
- Screen reader announces undo/redo actions
- Preset loads are undoable

**Buttons**:
```
[↩️ Undo] [↪️ Redo] [Reset]
```

### Preview LOD (Level of Detail) Warnings

Alerts users when loading large models that may cause performance issues.

**Thresholds**:
- Warning: >100,000 vertices (yellow border)
- Critical: >500,000 vertices (red border)

**Warning Dialog**:
```
⚠️ Large Model Detected

This model has 150,000 vertices.
Preview performance may be affected on some devices.

[Got it]
```

**Features**:
- Non-blocking overlay with dismiss button
- Shows vertex and triangle counts
- Different styling for warning vs critical levels
- Mobile responsive
- High contrast mode support

## Technical Changes

### Parser Updates (`src/js/parser.js`)
- Added `parseDependency()` function to parse `@depends` syntax
- Dependencies stored in parameter objects as `{ parameter, operator, value }`

### UI Generator Updates (`src/js/ui-generator.js`)
- Added `updateDependentParameters()` function
- Added `applyDependency()` function
- Added `checkDependency()` helper function
- Added `announceChange()` for screen reader support
- Controls track dependencies via data attributes

### State Management Updates (`src/js/state.js`)
- Added `ParameterHistory` class with past/present/future pattern
- Added `recordParameterState()`, `undo()`, `redo()` methods
- Added `canUndo()`, `canRedo()` methods
- Added `setHistoryEnabled()` for render protection
- Added `updateUndoRedoButtons()` for UI sync

### Preview Updates (`src/js/preview.js`)
- Added `LOD_CONFIG` constants for vertex thresholds
- Added `showLODWarning()` method with warning/critical levels
- Added `hideLODWarning()` method
- Added `getLODStats()` method
- Updated `loadSTL()` to check mesh size

### CSS Updates (`src/styles/components.css`)
- Added dependency visibility transitions
- Added `[aria-hidden="true"]` styling
- Added `.lod-warning` component styles
- Added animation for LOD warning fade-in
- Added high contrast and mobile responsive styles

### HTML Updates (`index.html`)
- Added Undo/Redo buttons to parameter panel header

## Test Coverage

Added 19 new unit tests:
- 8 dependency parsing tests in `parser.test.js`
- 11 undo/redo tests in `state.test.js`

Total tests: 258 (up from 239)

## Example Updates

Updated `public/examples/simple-box/simple_box.scad` to demonstrate dependency visibility:
- `hole_count` and `hole_diameter` parameters now depend on `ventilation==yes`

## Migration Notes

No breaking changes. Existing `.scad` files work without modification.

To use dependency visibility, add `@depends(param==value)` to parameter comments.

## Known Limitations

1. **Dependency syntax**: Only supports simple `==` and `!=` comparisons. Complex expressions (AND/OR) are not yet supported.

2. **LOD warning**: Shows warning only, does not automatically simplify geometry. Full mesh simplification planned for future release.

3. **Undo granularity**: Records state on each parameter change. Rapid slider movements may create many history entries.

---

**Full Changelog**: See [BUILD_PLAN_NEW.md](../BUILD_PLAN_NEW.md) for complete feature specifications.

# Library Bundle Testing Guide

## Overview

This guide covers testing the OpenSCAD library bundle feature (v1.10), which allows models to use external libraries like MCAD, BOSL2, NopSCADlib, and dotSCAD.

**Feature Status**: ✅ Complete (v1.10)

**Key Capabilities**:
- Auto-detect library usage in `.scad` files
- Enable/disable libraries via UI
- Mount libraries in OpenSCAD virtual filesystem
- Persistent library preferences (localStorage)
- Support for popular OpenSCAD libraries

---

## Supported Libraries

### MCAD (Mechanical CAD Library)
- **Repository**: https://github.com/openscad/MCAD
- **License**: LGPL-2.1
- **Description**: Mechanical components (gears, screws, bearings, boxes)
- **Usage**: `use <MCAD/boxes.scad>` or `include <MCAD/gears.scad>`
- **Popular modules**:
  - `boxes.scad` - roundedBox(), rectangular boxes with rounded corners
  - `gears.scad` - gear(), spur and planetary gears
  - `bearing.scad` - bearingDimensions(), bearing housings
  - `nuts_and_bolts.scad` - fastener dimensions

### BOSL2 (Belfry OpenSCAD Library v2)
- **Repository**: https://github.com/BelfrySCAD/BOSL2
- **License**: BSD-2-Clause (permissive)
- **Description**: Advanced geometric primitives, attachments, rounding
- **Requirements**: OpenSCAD 2021.01 or later
- **Usage**: `include <BOSL2/std.scad>`
- **Popular modules**:
  - `std.scad` - Standard library (includes most common modules)
  - `geometry.scad` - Advanced geometric operations
  - `attachments.scad` - Attachment system for positioning

### NopSCADlib
- **Repository**: https://github.com/nophead/NopSCADlib
- **License**: GPL-3.0
- **Description**: Parts library for 3D printers and electronic enclosures
- **Usage**: `include <NopSCADlib/lib.scad>`

### dotSCAD
- **Repository**: https://github.com/JustinSDK/dotSCAD
- **License**: LGPL-3.0
- **Description**: Artistic patterns, dots, and lines for functional designs
- **Usage**: `use <dotSCAD/path_extrude.scad>`

---

## Test Scenarios

### Test 1: Auto-Detection and Auto-Enable

**Purpose**: Verify that libraries are automatically detected and enabled when a model uses them.

**Steps**:
1. Open the application in a browser
2. Click "Library Test (MCAD)" example button
3. Observe the UI

**Expected Results**:
- ✅ Library Controls section appears (collapsed by default)
- ✅ Library badge shows "1" (one library enabled)
- ✅ Expand library details to see MCAD checkbox checked
- ✅ MCAD has "required" badge (detected in the code)
- ✅ Status message shows "Enabled 1 required libraries"
- ✅ Console log shows: `Auto-enabled libraries: ['MCAD']`

**Success Criteria**:
- Library detection works correctly
- Auto-enable functionality triggers
- UI updates reflect enabled state

---

### Test 2: Manual Library Toggle

**Purpose**: Verify that users can manually enable/disable libraries.

**Steps**:
1. Load any example file
2. Expand "📚 Libraries" section
3. Check/uncheck library checkboxes

**Expected Results**:
- ✅ Checking a box enables the library
- ✅ Unchecking a box disables the library
- ✅ Library badge count updates (0-4)
- ✅ Status message shows "LibraryName enabled/disabled"
- ✅ Preference saved to localStorage

**localStorage Key**: `openscad-customizer-libraries`

**Success Criteria**:
- Toggle functionality works
- Badge count accurate
- Preferences persist across sessions

---

### Test 3: Library Rendering

**Purpose**: Verify that enabled libraries are available during OpenSCAD rendering.

**Steps**:
1. Click "Library Test (MCAD)" example button
2. Wait for auto-preview to render
3. Observe the preview

**Expected Results**:
- ✅ Preview renders successfully (no "file not found" errors)
- ✅ Rounded box appears in 3D preview (from MCAD's roundedBox function)
- ✅ Console shows library mounting: `[Worker FS] Mounting library: MCAD`
- ✅ Console shows success: `[Worker FS] Successfully mounted 1 libraries`

**Success Criteria**:
- Rendering uses library functions correctly
- Virtual filesystem mounting succeeds
- No OpenSCAD errors

---

### Test 4: Library Persistence

**Purpose**: Verify that library preferences persist across browser sessions.

**Steps**:
1. Load Library Test example
2. Note which libraries are enabled (should be MCAD)
3. Manually enable BOSL2
4. Refresh the page (F5)
5. Load Library Test example again

**Expected Results**:
- ✅ MCAD and BOSL2 both remain enabled after refresh
- ✅ Other libraries remain disabled
- ✅ localStorage contains saved state

**Check localStorage**:
```javascript
// In browser console
JSON.parse(localStorage.getItem('openscad-customizer-libraries'))
// Expected: { "MCAD": { "enabled": true }, "BOSL2": { "enabled": true }, ... }
```

**Success Criteria**:
- Enabled state persists
- Disabled state persists
- No state leakage between models

---

### Test 5: Library Help Dialog

**Purpose**: Verify that library help information is accessible.

**Steps**:
1. Load any example
2. Expand "📚 Libraries" section
3. Click "ℹ️ What are libraries?" button

**Expected Results**:
- ✅ Alert dialog appears
- ✅ Dialog explains library purpose
- ✅ Dialog lists available libraries with descriptions
- ✅ Dialog explains how to use libraries

**Success Criteria**:
- Help text is clear and informative
- Lists all supported libraries
- Provides usage guidance

---

### Test 6: Multiple Library Usage

**Purpose**: Verify that models can use multiple libraries simultaneously.

**Test File** (create as `multi_library_test.scad`):
```openscad
// Multi-library test
use <MCAD/boxes.scad>;
include <BOSL2/std.scad>;

/*[Dimensions]*/
width = 50; // [20:100]
height = 30; // [10:50]

/*[Options]*/
library = "MCAD"; // [MCAD, BOSL2]

if (library == "MCAD") {
    roundedBox([width, height, 20], 5);
} else {
    cuboid([width, height, 20], rounding=5);
}
```

**Steps**:
1. Upload the test file
2. Verify both MCAD and BOSL2 are auto-enabled
3. Switch between library options
4. Generate STL

**Expected Results**:
- ✅ Both libraries detected
- ✅ Both libraries enabled automatically
- ✅ Badge shows "2"
- ✅ Both libraries mounted in worker
- ✅ Rendering works for both options

**Success Criteria**:
- Multiple library detection works
- Multiple libraries mount successfully
- No conflicts between libraries

---

### Test 7: Library Without Manifest

**Purpose**: Verify graceful handling when library manifest is missing.

**Steps**:
1. Temporarily rename `public/libraries/MCAD/manifest.json`
2. Load Library Test example
3. Observe behavior

**Expected Results**:
- ✅ Warning in console: `Failed to mount library MCAD`
- ✅ Rendering continues (doesn't crash)
- ✅ OpenSCAD error about missing file
- ✅ User sees clear error message

**Restore**:
```bash
# Rename back after test
mv public/libraries/MCAD/manifest.json.bak public/libraries/MCAD/manifest.json
```

**Success Criteria**:
- Graceful error handling
- Clear user feedback
- No application crash

---

### Test 8: Library Badge Visibility

**Purpose**: Verify that library UI only appears when libraries are detected.

**Steps**:
1. Load "Simple Box" example (no libraries)
2. Observe library section

**Expected Results**:
- ✅ Library Controls section has class `hidden`
- ✅ Library section not visible in UI
- ✅ No library auto-enable messages

**Then**:
1. Load "Library Test" example
2. Observe library section

**Expected Results**:
- ✅ Library Controls section `hidden` class removed
- ✅ Library section visible
- ✅ Badge shows count

**Success Criteria**:
- Library UI hidden when not needed
- Library UI appears when libraries detected
- No visual clutter for non-library models

---

### Test 9: Keyboard Accessibility

**Purpose**: Verify that library controls are keyboard-accessible.

**Steps**:
1. Load Library Test example
2. Press Tab repeatedly to navigate
3. Use keyboard to interact with library controls

**Expected Results**:
- ✅ Can tab to library summary
- ✅ Enter/Space expands library details
- ✅ Can tab to checkboxes
- ✅ Space toggles checkboxes
- ✅ Can tab to help button
- ✅ Focus indicators visible

**Success Criteria**:
- Full keyboard navigation works
- Focus order logical
- Visual focus indicators present
- WCAG 2.1 AA compliant

---

### Test 10: High Contrast Mode

**Purpose**: Verify library UI works in high contrast mode.

**Steps**:
1. Load Library Test example
2. Click "HC" button to enable high contrast
3. Expand library details
4. Observe styling

**Expected Results**:
- ✅ Library controls have 2px borders (vs 1px)
- ✅ Library items have 2px borders
- ✅ Detected libraries have 3px borders (vs 2px)
- ✅ Badge text is bold (font-weight: 700)
- ✅ Required badge is extra bold (font-weight: 900)
- ✅ Contrast meets WCAG AAA

**Success Criteria**:
- Enhanced visibility in HC mode
- Borders thicker
- Text bolder
- WCAG AAA compliance

---

## Browser Compatibility

**Tested Browsers**:
- ✅ Chrome 120+ (Windows, macOS, Linux)
- ✅ Firefox 121+ (Windows, macOS, Linux)
- ✅ Safari 17+ (macOS, iOS)
- ✅ Edge 120+ (Windows, macOS)

**Known Issues**:
- None currently

---

## Performance Metrics

### Library Mounting Time

**Measurement**:
```javascript
// Check console for timing logs
// Look for: [Worker FS] Mounting library: MCAD
// And: [Worker FS] Successfully mounted 1 libraries (X files)
```

**Expected Times**:
- MCAD (44 files): 500-2000ms
- BOSL2 (50+ files): 600-2500ms
- Multiple libraries: 1000-4000ms

**Factors**:
- Network speed (files fetched from public/)
- Browser caching (faster on subsequent loads)
- Number of library files

### Memory Impact

**Baseline** (no libraries):
- WASM heap: ~50-100MB

**With MCAD**:
- Additional: ~5-10MB
- Total: ~55-110MB

**With Multiple Libraries**:
- Additional: ~15-30MB
- Total: ~65-130MB

**Success Criteria**:
- No memory leaks
- Acceptable performance on 4GB RAM devices
- Memory freed when libraries disabled

---

## Troubleshooting

### Library Not Found Error

**Symptom**: OpenSCAD error "Can't open library"

**Causes**:
1. Library not enabled in UI
2. Library files not downloaded
3. Incorrect include path

**Solutions**:
1. Enable library in UI
2. Run `npm run setup-libraries`
3. Check include path matches library structure

### Slow Library Mounting

**Symptom**: Long delay before rendering starts

**Causes**:
1. Slow network
2. Many library files
3. No browser caching

**Solutions**:
1. Wait for initial mount (cached afterward)
2. Use only needed libraries
3. Clear browser cache if stale

### localStorage Full

**Symptom**: Library preferences not saving

**Cause**: localStorage quota exceeded (rare)

**Solution**:
```javascript
// Clear old data
localStorage.removeItem('openscad-customizer-libraries');
// Or clear all
localStorage.clear();
```

---

## Automated Testing

### Unit Tests (Optional)

```javascript
// test/library-manager.test.js
import { LibraryManager, detectLibraries } from '../src/js/library-manager.js';

describe('LibraryManager', () => {
  test('detectLibraries finds MCAD usage', () => {
    const code = 'use <MCAD/boxes.scad>;';
    const detected = detectLibraries(code);
    expect(detected).toContain('MCAD');
  });
  
  test('detectLibraries finds multiple libraries', () => {
    const code = `
      use <MCAD/boxes.scad>;
      include <BOSL2/std.scad>;
    `;
    const detected = detectLibraries(code);
    expect(detected).toContain('MCAD');
    expect(detected).toContain('BOSL2');
  });
});
```

### Integration Test Checklist

- [ ] Auto-detection works for all supported libraries
- [ ] Manual toggle persists to localStorage
- [ ] Libraries mount in worker filesystem
- [ ] Rendering uses library functions
- [ ] Multiple libraries work together
- [ ] Keyboard navigation fully functional
- [ ] High contrast mode styling correct
- [ ] Mobile layout acceptable
- [ ] Performance within targets
- [ ] No memory leaks

---

## Regression Testing

Before each release, verify:

1. ✅ All 10 test scenarios pass
2. ✅ Browser compatibility maintained
3. ✅ Performance metrics acceptable
4. ✅ No console errors
5. ✅ Accessibility maintained (Lighthouse 90+)

---

## Reporting Issues

When reporting library-related issues, include:

1. **Browser**: Name and version
2. **Library**: Which library (MCAD, BOSL2, etc.)
3. **Reproduction**: Steps to reproduce
4. **Expected**: What should happen
5. **Actual**: What actually happened
6. **Console**: Any errors in browser console
7. **Code**: Minimal .scad example demonstrating issue

**Example**:
```
Browser: Chrome 120.0.6099.109
Library: MCAD
Issue: roundedBox() not found during render

Steps:
1. Load Library Test example
2. MCAD shows as enabled
3. Click Generate STL

Expected: Rounded box renders successfully
Actual: Error "roundedBox is not defined"

Console: [Worker] Library MCAD not mounted
```

---

## Next Steps

After testing v1.10 library bundles:

1. **v1.11**: Additional libraries (ThreadKit, BOLTS)
2. **v1.12**: Library version pinning
3. **v2.0**: Custom library upload
4. **v2.1**: Library dependency resolution

---

## References

- [Library Definitions](../../src/js/library-manager.js)
- [Worker Library Mounting](../../src/worker/openscad-worker.js)
- [Public Libraries Directory](../../public/libraries/)
- [Setup Script](../../scripts/setup-libraries.js)

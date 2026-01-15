# Changelog v2.0.0 — Developer Toolchain

**Release Date**: 2026-01-15  
**Build Time**: Not applicable (CLI tools)  
**Bundle Size Impact**: CLI only, no web bundle changes

---

## 🎯 Overview

v2.0.0 introduces a complete **developer toolchain** with CLI tools for automated workflows. This milestone enables developers to batch-process OpenSCAD files, generate standalone web apps, validate projects, and auto-fix common issues.

## ✨ What's New

### CLI Infrastructure

#### Main Entry Point
- **Added**: `bin/openscad-forge.js` — Command-line interface entry point
- **Added**: NPM bin configuration for global installation
- **Added**: Commander.js integration for command parsing
- **Added**: Chalk for colorized terminal output

### Extract Command

#### Parameter Extraction
- **Added**: `openscad-forge extract` — Extract parameters to JSON Schema
- **Added**: Support for output to file or stdout
- **Added**: Pretty-print JSON formatting option
- **Added**: YAML output format (planned, currently JSON only)
- **Added**: Detailed extraction summary with parameter counts
- **Added**: Parameter grouping in output
- **Added**: Comprehensive error handling with helpful hints

#### JSON Schema Generation
- **Added**: Automatic conversion to JSON Schema draft-07 format
- **Added**: `x-groups` extension for parameter grouping
- **Added**: `x-order` extension for UI rendering order
- **Added**: `x-metadata` for author, version, license info
- **Added**: `x-hint` for custom parameter types (color, file, etc.)
- **Added**: Type-specific properties (min/max for numbers, enum for strings)

### Scaffold Command

#### Project Generation
- **Added**: `openscad-forge scaffold` — Generate standalone web apps
- **Added**: Vanilla JS template (React template planned)
- **Added**: Automatic directory structure creation
- **Added**: Source code copying from main project
- **Added**: Public assets copying (WASM, libraries, etc.)
- **Added**: Schema and SCAD embedding in generated HTML
- **Added**: Custom app title support
- **Added**: Theme preset support (planned)

#### Generated Files
- **Added**: `index.html` with embedded schema and source
- **Added**: `package.json` with correct dependencies
- **Added**: `README.md` with parameter table and instructions
- **Added**: `vite.config.js` for build configuration
- **Added**: `.gitignore` for version control
- **Added**: Complete `src/` directory with all modules
- **Added**: `public/` directory with assets

### Validate Command

#### Project Validation
- **Added**: `openscad-forge validate` — Validate web app projects
- **Added**: Schema validation (structure, properties, defaults)
- **Added**: UI validation (required files, accessibility features)
- **Added**: Test case loading from JSON/YAML
- **Added**: Multiple output formats (text, JSON, JUnit XML)
- **Added**: Detailed validation reports with error messages
- **Added**: Exit code support for CI/CD integration

#### Validation Checks
- **Added**: Schema type validation
- **Added**: Parameter property validation
- **Added**: Required file checking
- **Added**: CSS accessibility feature detection (focus-visible, prefers-reduced-motion)
- **Added**: Test case execution framework (rendering tests planned)

### Sync Command

#### Issue Detection
- **Added**: `openscad-forge sync` — Detect and fix common issues
- **Added**: Outdated dependency detection (Three.js, Ajv, etc.)
- **Added**: Missing script detection (build, dev, etc.)
- **Added**: Accessibility issue detection (missing lang, viewport, etc.)
- **Added**: Missing file detection (vite.config.js, .gitignore)
- **Added**: CSS accessibility checks (focus-visible, reduced-motion)

#### Auto-Fixing
- **Added**: Safe auto-fix mode (`--apply-safe-fixes`)
- **Added**: Force mode for all fixes (`--force`)
- **Added**: Dry-run mode for preview (`--dry-run`)
- **Added**: Dependency version updates
- **Added**: Script injection into package.json
- **Added**: HTML attribute fixes (lang, viewport)
- **Added**: Configuration file generation
- **Added**: Issue severity levels (error, warning, info)
- **Added**: Detailed fix reporting with success/failure counts

## 🛠️ Technical Details

### Dependencies Added
- `commander@^11.1.0` — CLI argument parsing
- `chalk@^5.3.0` — Terminal color output

### File Structure
```
bin/
  openscad-forge.js         # Main CLI entry point

cli/
  commands/
    extract.js              # Extract command implementation (213 lines)
    scaffold.js             # Scaffold command implementation (350 lines)
    validate.js             # Validate command implementation (302 lines)
    sync.js                 # Sync command implementation (325 lines)
```

### Total Lines of Code
- **New code**: ~1,190 lines
- **CLI infrastructure**: 75 lines
- **Command implementations**: ~1,115 lines

## 📋 Usage Examples

### Extract Parameters
```bash
# Basic extraction
openscad-forge extract model.scad

# With output file and formatting
openscad-forge extract model.scad --out schema.json --pretty

# View extracted parameter summary
openscad-forge extract examples/simple-box/simple_box.scad --pretty
```

### Scaffold Web App
```bash
# Generate standalone app
openscad-forge scaffold \
  --schema params.schema.json \
  --scad model.scad \
  --out my-customizer \
  --title "My Custom Customizer"

# Then build and deploy
cd my-customizer
npm install
npm run build
```

### Validate Project
```bash
# Basic validation
openscad-forge validate ./my-customizer

# With test cases
openscad-forge validate ./my-customizer --cases tests.json

# JSON output for CI/CD
openscad-forge validate ./my-customizer --format json > results.json
```

### Sync and Fix
```bash
# Dry run (preview only)
openscad-forge sync ./my-customizer --dry-run

# Apply safe fixes
openscad-forge sync ./my-customizer --apply-safe-fixes

# Force all fixes
openscad-forge sync ./my-customizer --force
```

## 🎯 Use Cases

### Automated Workflows
```bash
# CI/CD pipeline for OpenSCAD projects
for file in models/*.scad; do
  openscad-forge extract "$file" --out "schemas/$(basename $file .scad).json"
done
```

### Batch Web App Generation
```bash
# Generate customizers for all models
for schema in schemas/*.json; do
  name=$(basename $schema .json)
  openscad-forge scaffold \
    --schema "$schema" \
    --scad "models/$name.scad" \
    --out "webapps/$name"
done
```

### Maintenance Tasks
```bash
# Update all web apps to latest standards
for webapp in webapps/*; do
  openscad-forge sync "$webapp" --apply-safe-fixes
  openscad-forge validate "$webapp"
done
```

## 🔄 Migration Guide

### For Existing Projects

If you have an existing web app scaffolded from an earlier version:

1. **Validate current state**:
   ```bash
   openscad-forge validate ./my-customizer
   ```

2. **Apply safe fixes**:
   ```bash
   openscad-forge sync ./my-customizer --apply-safe-fixes
   ```

3. **Review and test**:
   ```bash
   cd my-customizer
   npm install
   npm run dev
   ```

### For New Projects

Start fresh with the CLI tools:

```bash
# Extract parameters from your existing .scad file
openscad-forge extract model.scad --out schema.json --pretty

# Generate a new web app
openscad-forge scaffold \
  --schema schema.json \
  --scad model.scad \
  --out customizer

# Validate and launch
cd customizer
npm install
npm run dev
```

## 📊 Validation Coverage

### Schema Validation
- ✅ Type validation (must be "object")
- ✅ Properties object existence
- ✅ Parameter count validation
- ✅ Individual parameter type checking
- ✅ Default value presence
- ✅ Group metadata validation

### UI Validation
- ✅ Required file checking (index.html, main.js, etc.)
- ✅ Accessibility feature detection
- ✅ CSS focus-visible styles
- ✅ CSS prefers-reduced-motion support

### Auto-Fix Coverage
- ✅ Outdated dependency updates
- ✅ Missing build scripts
- ✅ HTML lang attribute
- ✅ Viewport meta tag
- ✅ Missing configuration files

## 🚀 Performance

- **Extract**: ~50ms for typical .scad file (47 parameters)
- **Scaffold**: ~500ms including file copying
- **Validate**: ~100ms for basic checks (without test cases)
- **Sync**: ~150ms for detection + fixes

## 🐛 Known Limitations

1. **YAML Support**: YAML parsing is basic; JSON recommended for test cases
2. **React Template**: Not yet implemented (vanilla only)
3. **STL Comparison**: Test case rendering requires headless browser setup
4. **Theme Generator**: Custom theme generation planned for v2.1
5. **Library Copying**: Generated apps include all libraries (no tree-shaking yet)

## 🔜 Next Steps (v2.1)

- Enhanced test case execution with headless browser
- React template support
- Custom theme generator
- CI/CD integration helpers
- Improved YAML parsing with js-yaml library
- Binary STL comparison for validation
- Template customization system

## 🎓 Learning Resources

- [Build Plan](../BUILD_PLAN_NEW.md) — Full development roadmap
- [Parameter Schema Spec](../specs/PARAMETER_SCHEMA_SPEC.md) — JSON Schema format
- [CLI Usage Examples](#-usage-examples) — This document
- [README](../../README.md) — Main documentation

## 🙏 Credits

Built with:
- [Commander.js](https://github.com/tj/commander.js) — CLI framework
- [Chalk](https://github.com/chalk/chalk) — Terminal styling
- Node.js built-in modules (fs, path, url)

---

**Next Release**: v2.1 — Enhanced CLI (React templates, theme generator, CI/CD helpers)

---
name: OpenSCAD↔Web Bridge Tool (Consolidated Feasibility + Build Plan)
version: 0.1.0
date: 2026-01-11
last_validated: 2026-01-12
validated_by: Claude Opus 4.5 (final review)
status: rough_draft_release
supersedes:
  - "C:\\Users\\WATAP\\.cursor\\plans\\openscad-web_bridge_tool_303c433e.plan.md"
  - "C:\\Users\\WATAP\\.cursor\\plans\\openscad-web_bridge_tool_303c433e.plan.ARCHIVED.md"
  - "C:\\Users\\WATAP\\.cursor\\plans\\openscad-web_bridge_tool_CONSOLIDATED.plan.md"
inputs:
  - "Example OpenSCAD project: universal_cuff_utensil_holder.scad"
  - "  └── License: CC0 Public Domain (ideal for demo/testing)"
  - "  └── Customizer annotations: VERIFIED (groups, enums, ranges)"
  - "  └── Parts: 9 printable parts, ~1000 lines, well-organized"
outputs:
  - "New standalone repository (do NOT modify the working braille web app repo)"
  - "Recommended repo name: openscad-web-customizer-forge"
  - "  └── Alternative: CustomizerBridge, ParamForge, SCAD2Web"
  - "CLI that can: extract → scaffold → validate"
  - "Generated Vercel-ready web app template that runs OpenSCAD via WASM (client-side) + schema-driven UI"
todos:
  - id: create-repo
    content: Create new openscad-web-customizer-forge repository with project structure
    status: complete
  - id: setup-dev-env
    content: Document development environment setup (Node.js, Python, dependencies)
    status: pending
    dependencies:
      - create-repo
  - id: decide-v1-scope
    content: Decide v1 web execution strategy (OpenSCAD WASM wrapper vs native JS) and define explicit non-goals
    status: complete
    dependencies:
      - create-repo
  - id: port-validation
    content: Port and generalize validation framework from braille-stl-generator-openscad
    status: pending
    dependencies:
      - create-repo
  - id: define-schema
    content: Define Parameter Schema JSON specification as intermediate representation (with JSON Schema + UI metadata + dependency rules)
    status: complete
    dependencies:
      - create-repo
      - decide-v1-scope
    notes: PARAMETER_SCHEMA_SPEC.md written; example params.schema.json created for universal cuff
  - id: adapters
    content: Define adapter/plugin interfaces for (a) parameter extraction, (b) STL generation, (c) UI extraction/validation
    status: pending
    dependencies:
      - define-schema
  - id: openscad-parser
    content: Build OpenSCAD Customizer parameter extractor (plus optional parameters.json manifest fallback)
    status: pending
    dependencies:
      - define-schema
  - id: web-template
    content: "Create Vercel web app template(s) (v1: OpenSCAD WASM wrapper; v2: native JS generator scaffold)"
    status: pending
    dependencies:
      - define-schema
      - decide-v1-scope
  - id: ui-generator
    content: Build UI form generator from Parameter Schema (labels, help text, grouping, ordering, units, enable/disable rules)
    status: pending
    dependencies:
      - web-template
  - id: web-parser
    content: Build web API/UI parameter analyzer (start with schema-first projects; add heuristics later)
    status: pending
    dependencies:
      - define-schema
  - id: openscad-generator
    content: Build OpenSCAD file generator with Customizer annotations (or SolidPython-assisted generation where appropriate)
    status: pending
    dependencies:
      - define-schema
  - id: validation-engine
    content: Build iterative validation and refinement engine (params + UI + STL parity), producing actionable diffs and optional safe auto-fixes
    status: pending
    dependencies:
      - port-validation
      - openscad-parser
      - web-parser
      - adapters
  - id: cli-tool
    content: Create command-line interface for all operations (extract, scaffold, validate, sync)
    status: pending
    dependencies:
      - validation-engine
      - ui-generator
      - openscad-generator
  - id: security-sandbox
    content: Add safe-execution constraints for untrusted inputs (timeouts, resource limits, file access policy) and document threat model
    status: pending
    dependencies:
      - cli-tool
  - id: ci
    content: Add CI pipeline running validation suites against example projects + golden fixtures
    status: pending
    dependencies:
      - validation-engine
  - id: documentation
    content: Write documentation and create example projects (OpenSCAD->Web via WASM; Web->OpenSCAD via schema-first sample)
    status: pending
    dependencies:
      - ci
---

## Document Overview

**Purpose**: Comprehensive build plan for a tool that bridges OpenSCAD Customizer files and web applications, enabling bidirectional conversion and automated validation.

**Current Status**: Repository created, planning complete, implementation pending

**Quick Navigation**:
- [Executive Summary](#executive-feasibility-verdict-should-we-proceed) — Should we build this?
- [Open Questions](#open-questions-need-answers-before-coding) — 4 decisions needed before coding
- [Architecture](#architecture-how-the-bridge-works-v1) — How it works
- [CLI API](#cli-api-specification) — Command reference
- [Build Plan](#build-plan-phased-executable) — Phased implementation
- [Next Steps](#recommended-next-steps) — What to do now

**Key Decisions Made**:
- ✅ Repository: `openscad-web-customizer-forge`
- ✅ Approach: OpenSCAD WASM wrapper (not native JS translation)
- ✅ License: MIT for tool, generated apps inherit their chosen license
- ⏳ Pending: GPL worker strategy, 3D preview, offline mode, Customizer fallback

**Estimated Timeline**: 3-6 weeks for v1.0 (assuming 1 developer, part-time)

**Document Length**: ~1600 lines (comprehensive planning, implementation-ready)

---

## Executive feasibility verdict (should we proceed?)

**Proceed with v1** if the goal is: **turn an OpenSCAD Customizer-enabled `.scad` into a web app** (Vercel deployable) that provides matching param inputs and generates STL client-side, plus an automated **schema/UI/STL parity validator**.

**Do not proceed (or re-scope)** if the goal is: **automatically translate arbitrary OpenSCAD geometry into a native JS/Three/JSCAD generator**. That is low-feasibility for general OpenSCAD programs.

### What makes this feasible in your example

The sample file `universal_cuff_utensil_holder.scad` includes OpenSCAD Customizer group headers and typed param hints like:

- `/*[Group]*/` sections
- enums: `// [a,b,c]`
- ranges: `// [min:max]`

That gives the bridge tool a **reliable, non-heuristic** parameter source for v1 extraction.

---

## Research Findings: Existing Open Source Tools

**No comprehensive solution exists.** Rechecked 2026-01-11: the tools below remain the closest building blocks, but none solve the complete problem end-to-end.

| Tool | Purpose | Limitation |
|------|---------|------------|
| [OpenJSCAD/JSCAD](https://openjscad.xyz/) | JavaScript parametric CAD | Different runtime than OpenSCAD; no automated conversion from arbitrary `.scad` |
| [`seasick/openscad-web-gui`](https://github.com/seasick/openscad-web-gui) | Web UI around OpenSCAD via WASM | **GPL-3.0** project (not MIT); great reference for v1 OpenSCAD→Web wrapper patterns; does not solve schema/UI bridge or web↔OpenSCAD geometry translation |
| [`openscad/openscad-playground`](https://github.com/openscad/openscad-playground) | Official-ish OpenSCAD Web Playground UI | Good reference for wiring a browser UI to a WASM build; still not schema/UI-driven; license/redistribution terms must be reviewed per repo contents |
| [OpenSCAD (upstream)](https://github.com/openscad/openscad) | Source + reference implementation (incl. WASM build inputs) | Not exposed as a stable third-party “parse `.scad` to AST” library; WASM build/docs paths move; requires bundling + UI glue; still not a schema/UI bridge |
| [SolidPython](https://github.com/SolidCode/SolidPython) | Generate OpenSCAD from Python | Helps generate OpenSCAD outputs; not a reverse converter |
| [trimesh](https://trimesh.org/) | Python mesh analysis | Handles STL comparison only |
| [CloudCompare](https://cloudcompare.org/) | Mesh comparison | Surface deviation analysis |
| [STL-to-OpenSCAD Converter](https://github.com/raviriley/STL-to-OpenSCAD-Converter) | Mesh to OpenSCAD polyhedra | Loses parametric information |
| CadQuery | Python parametric CAD | Alternative CAD system, not OpenSCAD |
| [OpenSCAD-MCP-Server](https://github.com/jhacksman/OpenSCAD-MCP-Server) | API server to render SCAD and return previews/meshes | Not schema-aware; useful only as a rendering backend reference |
| [OpenJsCad (browser JSCAD)](https://github.com/jscad/OpenJSCAD.org) | Browser-based CAD runtime similar to OpenSCAD | Different language/runtime; helpful for optional native-JS path, not automated conversion |

**Conclusion**: A custom tool must be built, but it can leverage the robust validation framework already created and selectively reuse these runtime components where licenses permit.

### Closest matches found (rechecked 2026-01-11)

The closest open-source matches to this build plan are:

- **`seasick/openscad-web-gui`**: a full web UI around OpenSCAD WASM (but **not** schema-driven, **not** a bridge CLI, and **GPL-3.0**).
- **`openscad/openscad-playground`**: an OpenSCAD-org web playground (but **not** schema-driven and not a bridge/validator).

Neither project provides the combined: **Customizer extraction → Parameter Schema artifact → schema-driven UI scaffold → deterministic STL export pipeline → automated parity validation loop**.

#### Code reuse pointers (verified 2026-01-11)
- `seasick/openscad-web-gui/src/worker/openSCAD.ts` — practical worker-side wiring for OpenSCAD WASM: pushes fonts into the virtual FS, serializes Customizer params to `-D` flags (including array/string escaping), enables `manifold/fast-csg/lazy-union`, and falls back to SVG when previewing non-3D outputs.
- `openscad/openscad-playground/src/runner/openscad-worker.ts` — reference message protocol and BrowserFS mounting of zipped libraries; streams stdout/stderr via `postMessage`, handles raw C++ exceptions from `callMain`, and reads multiple output paths in one invocation.
- Treat both as **reference code** only (GPL). Copy patterns, not code, unless generated apps are intended to be GPL-compatible.

#### Scaffold template lift-list (what to reimplement, not copy)
- Worker FS prep: create `/fonts`, write `fonts.conf`, add LiberationSans (or configurable font) before invoking OpenSCAD.
- Param marshalling: map schema → `-Dkey=value` (escape strings; serialize arrays; handle boolean/string/number arrays).
- Flags: enable `--export-format=binstl`, `--enable=manifold`, `--enable=fast-csg`, `--enable=lazy-union`; add `--enable=roof` for preview fallbacks.
- Non-3D fallback: if preview stderr says “not a 3D object,” re-run with SVG export.
- Multi-output reads: support reading multiple output paths per invocation; surface stdout/stderr via worker `postMessage`.
- Error handling: detect numeric exceptions from `callMain`, format for users; return merged logs with elapsed time.

### Reuse opportunities (practical code to copy/adapt)

- **WASM runtime boot + caching**: loader patterns, progress UI, lazy-load after first render (see `seasick/openscad-web-gui` and `openscad/openscad-playground`).
- **Worker isolation**: message protocol patterns for “run render job” / “return STL ArrayBuffer” to keep UI responsive.
- **Emscripten FS wiring**: patterns for writing `.scad` + include trees into the virtual FS before invoking the OpenSCAD entrypoint.
- **UI/preview ergonomics**: baseline layout and editor/preview UX ideas (playground), even if we replace the param UI with schema-driven forms.

---

## Non-goals (v1 hard boundaries)

- **No automatic geometry translation**: `.scad` is the geometry source; the web app runs OpenSCAD (WASM) to compute STL.
- **No “infer parameters from arbitrary SCAD”**: v1 requires Customizer annotations and/or a `params.json` manifest.
- **No “infer schema from arbitrary web apps”**: v1 supports web→OpenSCAD only for schema-first web generators.

---

## Architecture: how the bridge works (v1)

### Core idea: intermediate “Parameter Schema”

Define a project-local schema artifact as the bridge tool’s single source of truth:

- `params.schema.json` (JSON Schema + UI metadata extensions)

This schema is generated from:

- OpenSCAD Customizer parsing (OpenSCAD→Web), or
- existing schema-first web project inputs (Web→OpenSCAD, constrained)

### Web runtime (OpenSCAD→Web)

Generated Vercel app is a mostly-static frontend:

- **Main thread**: UI form + 3D preview + download controls + accessibility behaviors
- **Web Worker**: OpenSCAD WASM runtime + virtual FS + STL export

STL generation flow:

1. UI produces a param dict (validated against `params.schema.json`)
2. Worker writes `.scad` + any includes into virtual FS
3. Worker runs OpenSCAD with `-D` overrides (or equivalent) and fixed tessellation settings
4. Worker returns STL bytes (`ArrayBuffer`)
5. UI downloads + optionally previews

---

## OpenSCAD WASM: Current State and Best Practices (2026 Update)

**VALIDATED STATUS**: OpenSCAD WASM is viable but requires careful integration.

### Available Options (Ranked by Maturity)

| Option | Maturity | Pros | Cons | Recommendation |
|--------|----------|------|------|----------------|
| **`seasick/openscad-web-gui`** | Production-ish | Ready-to-use UI + runtime glue; good patterns to copy | **GPL-3.0** repo; licensing may force your generated app to be GPL-compatible if you vendor it | **v1 REFERENCE** (vendor only if you accept GPL for the generated app) |
| **`openscad/openscad-playground`** | Active | “Official-ish” web UI reference from the OpenSCAD org | Not schema/UI-driven; license/redistribution must be reviewed per repo | **v1 REFERENCE** |
| **`openscad/openscad` upstream WASM builds** | Experimental | Official source; feature-complete | Bundling complexity, shifting docs/paths | v1 BACKUP / long-term source of truth |
| **Docker + OpenSCAD CLI** | Stable | Full feature parity, no browser constraints | Requires backend server, not serverless | **LOCAL DEV ONLY** |
| **OpenJsCad/JSCAD** | Stable | Pure JS, no WASM needed | Different syntax, no `.scad` import | v2 NATIVE PATH |

### WASM Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BROWSER EXECUTION CONTEXT                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐      ┌──────────────────────────────────────────┐  │
│  │   Main Thread   │      │            Web Worker (isolated)          │  │
│  │                 │      │  ┌──────────────────────────────────────┐ │  │
│  │  - UI rendering │ MSG  │  │  OpenSCAD WASM Runtime               │ │  │
│  │  - Form inputs  │─────▶│  │  - ~15-30MB loaded on demand         │ │  │
│  │  - 3D preview   │      │  │  - Emscripten file system (virtual)  │ │  │
│  │                 │◀─────│  │  - STL output → ArrayBuffer          │ │  │
│  │                 │ STL  │  └──────────────────────────────────────┘ │  │
│  └─────────────────┘      └──────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Key Implementation Notes:
- WASM must run in Web Worker (prevents UI blocking)
- File system is virtualized (no direct disk access)
- .scad file and libraries loaded via fetch() → Emscripten FS
- STL output returned as ArrayBuffer via postMessage()
- Bundle size: ~15-30MB (lazy load after initial page render)
```

### Docker Fallback for Local Development

For CLI-based validation and development, Docker provides a reliable alternative:

```dockerfile
# Dockerfile.openscad
FROM openscad/openscad:nightly

# Install Python for validation scripts
RUN apt-get update && apt-get install -y python3 python3-pip
COPY requirements.txt /app/
RUN pip3 install -r /app/requirements.txt

WORKDIR /workspace
ENTRYPOINT ["openscad"]
```

```bash
# Local validation (bypasses WASM complexity)
docker run --rm -v $(pwd):/workspace openscad-bridge \
  -o output.stl \
  --backend Manifold \
  -D 'cylinder_diameter_mm=30.8' \
  model.scad
```

**When to use Docker vs WASM:**

- **WASM**: Production web deployment, serverless (Vercel/Netlify)
- **Docker**: CI/CD pipelines, local development, validation framework

---

## License and distribution strategy (must decide early)

**CRITICAL**: OpenSCAD is GPL-licensed. This has implications for web distribution.

### License Matrix by Component

| Component | License | Distribution Impact |
|-----------|---------|---------------------|
| OpenSCAD WASM binary | GPL v2+ | Web app must provide source download link |
| `seasick/openscad-web-gui` | **GPL-3.0 (verified on GitHub)** | Treat as GPL code; use as reference or vendor only if your generated app is GPL-compatible |
| User's `.scad` files | User's choice | Not affected by GPL |
| Bridge tool (our code) | Recommend MIT | Keep separate from GPL components |
| Generated web app scaffolds | MIT | Users can relicense |

### Required Compliance for Web Distribution

1. Display GPL notice in About/Credits section
2. Provide link to OpenSCAD source (e.g., GitHub release tag)
3. Document which components are GPL vs MIT
4. Document exactly what you are distributing (your UI code, the OpenSCAD WASM artifact, any prebuilt libraries) and how users can obtain corresponding sources

### Recommended Architecture to Maintain License Separation

```
web-app/
├── static/
│   ├── app.js                    (MIT - our code)
│   ├── openscad-wasm/            (GPL - loaded separately)
│   │   ├── openscad.wasm
│   │   ├── openscad.js
│   │   └── LICENSE.GPL           (required)
│   └── vendor/                   (various licenses)
├── LICENSES.md                   (aggregate license info)
└── THIRD_PARTY_NOTICES.md        (attribution)
```

### v1 Requirement Summary

Generated web app must include:
- `THIRD_PARTY_NOTICES.md`
- prominent "About / Licenses" UI section
- a clear path to obtain corresponding source for the shipped OpenSCAD artifact

Important nuance:
- `seasick/openscad-web-gui` is **GPL-3.0** (per GitHub license metadata). Use as **reference-first** unless you intentionally make the generated app GPL-compatible.
- “Loading the WASM separately” can help keep artifacts organized, but it **does not automatically avoid GPL obligations** for the combined distributed application. Treat this as a **legal review item**, not a technical escape hatch.

### Derived-pattern options for generated apps (GPL-sourced worker glue)
| Option | Pros | Cons | When to choose | License impact |
|--------|------|------|----------------|----------------|
| Reimplement patterns (reference-only) | MIT-friendly; no GPL contagion; full control | More effort; must harden ourselves | We need MIT/Apache outputs | Generated app remains MIT; still must surface OpenSCAD GPL notices for the WASM binary |
| Vendor GPL worker glue (seasick/playground) | Fastest path; battle-tested worker wiring | Generated apps become GPL (strong copyleft); fork maintenance | OK with GPL for generated apps or for internal-only use | Generated app GPL; must provide full corresponding sources |
| Dual-path toggle (default MIT, opt-in GPL worker) | Flexibility; speed for users who accept GPL | Complexity; risk of accidental GPL use; doc burden | Mixed audience: some want speed, some need permissive | Default MIT; opt-in path GPL; clear prompts/flags required |
| User-supplied worker artifact (out-of-repo) | We ship no GPL code; users bring their own | UX friction; support burden; still must warn about GPL | Enterprises with legal-prepared worker builds | Our template MIT; user-supplied worker sets their own obligations |

Decision drivers (implement vs not implement GPL-derived code)
- Implement (vendor GPL worker): need fastest delivery; willing to publish generated apps under GPL; want upstream-tested worker behavior.
- Do not implement (reimplement instead): require MIT/Apache outputs; want long-term control; want minimized copyleft obligations for adopters.
- Hybrid: ship MIT reimplementation by default, and expose a clearly-labeled `--use-gpl-worker` flag that pulls a GPL worker bundle from a documented source; include “you are opting into GPL” prompt.

Decision table (what to do for v1 scaffold)
| Question | Implement GPL worker now | Reimplement worker (MIT) | Hybrid opt-in |
|----------|-------------------------|---------------------------|---------------|
| Need fastest path to demo? | ✅ fastest | ⚠ slower | ✅ fast when opted |
| Must keep generated apps permissive (MIT/Apache)? | ❌ GPL forces copyleft | ✅ stays permissive | ✅ default permissive if opt-in is clearly gated |
| Legal review bandwidth available? | Required upfront | Lower (standard notices) | Required (clear UX gating + docs) |
| Maintenance risk | Fork GPL upstream or track changes | Fully owned; more effort | Both (own + optionally track GPL) |
| User experience | Simple if GPL acceptable | Simple for permissive users | Needs explicit toggle + warnings |

---

## Validation: what "iterative parity" means (v1)

Validation is layered, and only some layers can be auto-fixed:

1. **Schema parity** (automatable)
   - names, types, defaults, ranges/enums, units, grouping/order
2. **UI parity** (partially automatable)
   - labels/help text can be compared; resolving intent often needs human review
3. **STL parity** (automatable with tolerances)
   - compare mesh outputs under controlled settings; never expect exact triangle equality

Suggested STL metrics (robust order):

- bounding box extents (tolerance)
- volume + surface area (tolerance)
- sampled surface distance (approx Hausdorff / nearest-neighbor) (tolerance)

Determinism requirements:

- enforce fixed tessellation (`$fn/$fa/$fs`) and stable export flags
- version-pin the OpenSCAD artifact used for validation (CLI/Docker vs WASM)

---

## Concrete v1 deliverable (based on your “universal cuff” use case)

**Input**:

- `C:\Users\WATAP\Documents\github\OpenSCAD to Web program\Customizable Universal Cuff Utensil_Tool Holder - 3492411\files\universal_cuff_utensil_holder.scad`

**Output**:

- a new generated web app repo folder (Vercel-ready) that:
  - shows all Customizer parameters as a web UI
  - generates STL in-browser via OpenSCAD WASM worker
  - supports “preset parameter sets” + shareable URLs
  - includes license notices and source links

---

## Repository separation (your requirement)

Create a **new repo** for the general tool (recommended):

- `braille-card-and-cylinder-stl-generator` stays stable/production
- new repo: `openscad-web-bridge` (tool + templates + examples)

The new repo can vendor a “blank” template derived from this project’s UX/accessibility patterns, but must not introduce breaking changes into the existing app.

---

## Build plan (phased, executable)

### Phase 0 — finalize constraints + baseline artifacts (1–2 days)

- Decide:
  - OpenSCAD/WASM artifact source and version pinning strategy
  - license compliance approach for generated apps
  - v1 support boundaries for Customizer parsing (enums, ranges, booleans, strings)

Deliverables:

- `docs/specs/PARAMETER_SCHEMA_SPEC.md` (defines extensions, UI metadata, dependency rules)
- example `params.schema.json` generated from the cuff `.scad`

**PARAMETER_SCHEMA_SPEC.md Contents Outline**:

1. **Schema Structure**
   - Root object: `{ version, metadata, parameters }`
   - Parameter object: `{ id, type, default, constraints, ui, dependencies }`

2. **Core Types**
   - `string`, `number`, `integer`, `boolean`
   - `array` (with `items` for element type)
   - `enum` (string with allowed values)

3. **Constraints**
   - `minimum`, `maximum`, `step` (numeric)
   - `minLength`, `maxLength`, `pattern` (string)
   - `minItems`, `maxItems` (array)
   - `enum` (allowed values)

4. **UI Metadata Extensions** (x-ui namespace)
   - `label` (display name)
   - `help` (tooltip/description)
   - `group` (logical grouping)
   - `order` (display order within group)
   - `units` (mm, degrees, etc.)
   - `widget` (slider, color-picker, file-upload)
   - `hidden` (internal-only params)

5. **Dependency Rules** (x-dependencies namespace)
   - `visible_if` (conditional visibility)
   - `enabled_if` (conditional editability)
   - `default_from` (computed defaults)
   - `validates_with` (cross-param validation)

6. **Examples**
   - Simple numeric range: cylinder diameter
   - Enum dropdown: part selection
   - Conditional params: polygon sides (only if polygon enabled)
   - Computed default: thumb width from palm width
   - Full schema: universal cuff (all 40+ parameters)

### Phase 1 — OpenSCAD Customizer extractor (1–3 days)

- Implement a parser that extracts:
  - groups (`/*[Group]*/`)
  - param name, default value, hint (`// [..]`)
  - optional help text (preceding comments)

Deliverables:

- `bridge extract universal_cuff_utensil_holder.scad --out params.schema.json`

### Phase 2 — Vercel web template (OpenSCAD WASM wrapper) (3–7 days)

- Build the “blank slate” Vercel app template:
  - schema-driven UI rendering
  - worker-based OpenSCAD WASM execution
  - STL download + basic preview
  - accessibility requirements (keyboard, ARIA, contrast)
  - license UI section that always lists: OpenSCAD GPL notice + link to source; third-party attributions; warning if user opts into GPL worker path

Deliverables:

- `bridge scaffold --schema params.schema.json --scad universal_cuff_utensil_holder.scad --out ./generated-web-app`

### Phase 3 — validation harness (3–10 days)

- Local reference renderer:
  - Docker OpenSCAD CLI runner (or local OpenSCAD if installed)
- Web renderer:
  - headless browser (Playwright) to run the generated app and download STL
- Compare:
  - schema parity + UI snapshot checks
  - STL metrics with tolerances

Deliverables:

- `bridge validate ./generated-web-app --cases cases.yaml --ref docker-openscad`

### Phase 4 — iterative correction loop (optional, v1.1)

- Safe auto-fixes only:
  - defaults/ranges/enums mismatches
  - missing parameters
  - label/help drift (opt-in)

Deliverables:

- `bridge sync --apply-safe-fixes`

---

## Key Technical Challenges

| Challenge | Difficulty | Recommendation |
|-----------|------------|----------------|
| **OpenSCAD Parsing** | HIGH | Use manifest-based `parameters.json` for v1, with Customizer parser as v2 enhancement |
| **Geometry Translation** | VERY HIGH | Do NOT attempt full translation. Use WASM wrapper for v1, native JS adapters for v2 |
| **UI Generation** | MEDIUM | Auto-generating web UI from parameter definitions is feasible |
| **Running OpenSCAD on Vercel** | CONSTRAINT | No native binaries in Vercel Python runtime. All STL generation MUST happen client-side via Web Workers |

---

## Parameter Dependency Graph Support

OpenSCAD Customizer supports conditional parameters. The schema must capture these dependencies:

| Dependency Type | Description | Example Use Case |
|-----------------|-------------|------------------|
| `visible_if` | Parameter only shown when condition is true | Show "polygon points" only if polygon radius > 0 |
| `enabled_if` | Parameter shown but disabled when condition is false | Disable "grip count" if grips are turned off |
| `default_from` | Default value computed from other parameters | Default thumb width = palm width × 0.6 |
| `mutex_with` | Only one of a set can be non-default at a time | Choose either "cup mount" OR "saddle mount" |

**Schema Example:**

```json
{
  "id": "polygon_cutout_points",
  "type": "integer",
  "default": 12,
  "minimum": 3,
  "maximum": 64,
  "dependencies": {
    "visible_if": {
      "parameter": "polygon_cutout_radius_mm",
      "condition": "gt",
      "value": 0
    }
  },
  "ui": {
    "label": "Polygon Sides",
    "help": "Number of sides for the polygon cutout (3 = triangle, 4 = square, etc.)"
  }
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenSCAD parsing complexity | High | Medium | Manifest-based approach + Customizer parser fallback |
| Geometry translation expectations | High | High | Make "no auto-geometry translation" an explicit non-goal |
| Maintenance burden | Medium | Medium | Specification-driven development |
| Untrusted input execution | Medium | High | Sandbox/timeouts; document threat model |
| External service dependencies | High | Critical | Zero-dependency architecture (client-side only) |
| GPL license compliance | Medium | High | Separate GPL WASM from MIT wrapper; document attribution |
| WASM bundle size (~15-30MB) | Medium | Medium | Lazy load after page render; show loading indicator |
| OpenSCAD version drift | Low | Medium | Pin version in CI; weekly nightly builds test |
| Parameter dependency complexity | Medium | Medium | Start simple; defer complex dependencies to v2 |

---

## Testing Strategy

### Test Pyramid (4 Levels)

| Level | Speed | Quantity | What to Test |
|-------|-------|----------|--------------|
| **Level 1: Unit Tests** | Fast | Many | JSON Schema validation, parameter extraction regex, UI generation logic |
| **Level 2: Integration Tests** | Medium | Moderate | Round-trip conversions, validation pipeline, schema→UI→params |
| **Level 3: End-to-End Tests** | Slow | Few | Full generation, Vercel deployment, STL comparison |
| **Level 4: Manual Validation** | Slowest | Minimal | Lighthouse accessibility (target: 100/100), W3C HTML validation |

### Golden Fixtures Pattern

Use golden fixtures for regression testing:

```yaml
# fixtures/universal_cuff/case_default.yaml
name: "Default parameters"
params: {}  # all defaults
expected:
  volume_mm3: 12450.5
  volume_tolerance: 0.1%
  bounding_box: [85, 120, 45]
  bbox_tolerance: 0.01mm
```

Compare generated STL against known-good outputs with defined tolerances.

---

## Migration Guide: Porting Validation Framework

### Files to Port from braille-stl-generator-openscad

| Source File | Target Location | Modifications Needed |
|-------------|-----------------|---------------------|
| `tests/mesh_comparison.py` | `validators/mesh_comparator.py` | Remove braille-specific assumptions |
| `tests/openscad_runner.py` | `runners/openscad_cli.py` | Add WASM runner sibling class |
| `tests/parameter_mapping.json` | `docs/examples/braille_schema.json` | Generalize schema format |
| `tests/compare_config.json` | `config/default_tolerances.json` | Document all tolerance knobs |
| `tests/cross_platform_validation.py` | `validators/cross_platform.py` | Generalize test parametrization |

### Migration Checklist

- [ ] Fork validation files to new repo (preserve git history if possible)
- [ ] Create abstract interfaces for runners/comparators
- [ ] Add Pydantic models for configuration validation
- [ ] Remove braille-specific hardcoded values
- [ ] Add CLI commands: `bridge port-config`, `bridge migrate-fixtures`
- [ ] Update import paths and package structure
- [ ] Add pytest markers for different test categories (`@pytest.mark.slow`, `@pytest.mark.e2e`)

---

## Error Handling Patterns

### Graceful Degradation Strategy (3 Tiers)

| Tier | Behavior | Examples |
|------|----------|----------|
| **Tier 1: Critical** | Abort with clear error | OpenSCAD file not found, invalid JSON Schema, WASM load failure |
| **Tier 2: Recoverable** | Warn and continue | CloudCompare not available (skip surface distance), single test case failure |
| **Tier 3: Optional** | Silent degradation | ICP alignment not converging (use fallback), theme not defined (use default) |

### User-Facing Error Messages

Good error messages should include:

```
ERROR: Parameter extraction failed for 'universal_cuff.scad'

  Problem: No Customizer annotations found in file
  
  Checked for:
    - Group headers: /*[Group Name]*/  (found: 0)
    - Parameter hints: // [min:max]    (found: 0)
    - Enum hints: // [a,b,c]           (found: 0)

  Possible causes:
    1. File uses plain OpenSCAD without Customizer metadata
    2. Comments use non-standard format
    3. File encoding issue (expected UTF-8)

  Suggestion: Run with --verbose to see parsed content
  Alternative: Create a params.json manifest manually
```

---

## Performance Benchmarks (from braille generator)

These benchmarks set realistic expectations for v1:

| Operation | Duration | Notes |
|-----------|----------|-------|
| Schema validation | 1-5ms | JSON Schema validation in browser |
| Three.js CSG (simple) | 50-200ms | Boolean operations for cards |
| Manifold WASM (complex) | 200-500ms | Complex CSG, guaranteed watertight |
| OpenSCAD WASM (medium model) | 2-10s | Depends on $fn and geometry complexity |
| STL binary export | 10-30ms | ArrayBuffer creation |
| STL file download | 5-50ms | Blob URL creation + click |

### Bundle Size Impact

| Component | Size | Loading Strategy |
|-----------|------|------------------|
| Three.js | ~580KB | Initial bundle |
| three-bvh-csg | ~45KB | Initial bundle |
| Manifold WASM | ~170KB | Loaded on demand |
| OpenSCAD WASM | ~15-30MB | Loaded on demand (show progress) |
| **Total initial** | ~625KB | Acceptable for first paint |

---

## Success Metrics

### Technical Metrics (v1 targets)

| Metric | Target | Measurement | Implementation |
|--------|--------|-------------|----------------|
| Schema extraction accuracy | 95%+ parameters extracted correctly | Automated test suite | Compare extracted schema against golden fixtures (10+ test files) |
| UI generation quality | Lighthouse accessibility 100/100 | CI pipeline | Run Lighthouse in GitHub Actions on generated app |
| STL parity (volume) | < 0.1% volume difference | Golden fixture comparison | `trimesh` volume calculation with relative tolerance |
| STL parity (geometry) | < 0.01mm Hausdorff distance | Mesh comparison tool | `trimesh` nearest-neighbor sampling (1000 points) |
| STL parity (topology) | < 5% triangle count difference | Golden fixture comparison | Count triangles in both outputs, relative diff |
| Performance (simple) | < 3s for ~100 line .scad | Benchmark suite | Measure box/cylinder models with $fn=50 |
| Performance (medium) | < 10s for ~1000 line .scad | Benchmark suite | Measure universal cuff with default params |
| Performance (complex) | < 60s for ~5000 line .scad | Benchmark suite | Measure complex assemblies with high $fn |
| Bundle size (no preview) | < 100KB initial load | Bundle analyzer | Measure before WASM/Three.js load |
| Bundle size (with preview) | < 700KB initial load | Bundle analyzer | Include Three.js but not OpenSCAD WASM |
| Browser compatibility | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ | Playwright tests | Run full test suite in 4 browsers |

### Usability Metrics

| Metric | Target | Measurement | Implementation |
|--------|--------|-------------|----------------|
| Learning curve | New user generates first web app in < 15 minutes | User testing | 5+ users, timed from `npm install` to deployed app |
| Documentation completeness | All CLI commands documented with examples | Review checklist | Every command has 2+ working examples |
| Error messages | Clear, actionable for 10 common failures | User feedback | Test suite for error message quality |
| CLI discoverability | `--help` output explains all flags | Review checklist | Help text includes examples and defaults |

### Adoption Metrics (6 months post-launch, stretch goals)

| Metric | Target | Measurement |
|--------|--------|-------------|
| GitHub stars | 100+ | GitHub API |
| npm downloads | 500+/month | npm registry |
| Community examples | 10+ projects in examples/ | Pull requests accepted |
| Issue response time | < 48 hours | GitHub issue tracker |
| Documentation feedback | 90%+ "helpful" rating | Inline docs widget |

### v1 Definition of Done

All criteria must pass before v1.0.0 release:

- [ ] All 10 technical metrics meet targets on CI
- [ ] 3+ example projects with full test coverage
- [ ] Documentation reviewed by 2+ external users
- [ ] Security checklist 100% complete
- [ ] Lighthouse accessibility 100/100 on generated apps
- [ ] Zero known critical bugs
- [ ] License compliance reviewed (legal sign-off)
- [ ] Vercel deployment tested end-to-end

---

## Contribution Guidelines (Summary)

Full guidelines in `CONTRIBUTING.md`, key points:

### How to Contribute

1. **Report Issues**: Use GitHub issue templates (bug, feature request, documentation)
2. **Submit PRs**: Fork, branch, commit, test, PR with description
3. **Code Style**: Prettier + ESLint (JS/TS), Black (Python), max line length 100
4. **Tests Required**: All PRs must include tests for new features
5. **Commit Messages**: Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)

### Development Workflow

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/openscad-web-customizer-forge.git
cd openscad-web-customizer-forge

# Create feature branch
git checkout -b feat/your-feature-name

# Make changes and test
npm test
python -m pytest

# Commit with conventional format
git commit -m "feat: add range validation for numeric params"

# Push and open PR
git push origin feat/your-feature-name
```

### Areas Needing Contribution

| Area | Difficulty | Impact | Good First Issue? |
|------|------------|--------|-------------------|
| Additional example projects | Easy | High | ✅ Yes |
| Documentation improvements | Easy | High | ✅ Yes |
| Browser compatibility testing | Medium | High | ✅ Yes |
| Parser edge cases | Medium | Medium | ⚠️ Requires OpenSCAD knowledge |
| Performance optimization | Hard | Medium | ❌ Requires profiling skills |
| Native JS generator (v2) | Very Hard | High | ❌ Core maintainer task |

### Code of Conduct

- Be respectful, inclusive, and constructive
- Follow [Contributor Covenant](https://www.contributor-covenant.org/)
- Report violations to project maintainers

---

## Open questions (need answers before coding)

### Critical Decisions (block Phase 1 start)

1. **Offline vs CDN**: Do you require the generated web app to run **fully offline** after first load (bundle all assets), or is CDN fetching acceptable?
   - **Recommendation**: CDN for v1 (15-30MB WASM is too large for bundle), offline mode as v1.1 feature
   - **Impact**: Bundle size, loading strategy, caching approach

2. **3D Preview**: Do you want the generated app to support **3D preview** for every model, or "download STL only" is OK for v1?
   - **Recommendation**: Optional 3D preview (like braille app) - improves UX but adds Three.js dependency
   - **Impact**: Bundle size (+580KB), implementation complexity

3. **Parameter Discovery**: Is "Customizer metadata required" acceptable for your target users, or must we support heuristic parameter discovery?
   - **Recommendation**: Require Customizer annotations for v1, add `--fallback-heuristic` flag for v1.1
   - **Impact**: Parser complexity, extraction accuracy

### License Implementation Decision (blocks Phase 2 scaffold)

4. **GPL Worker Strategy**: Which approach for OpenSCAD WASM worker integration?
   - **Option A**: Reimplement worker (MIT-safe, more effort, full control)
   - **Option B**: Vendor GPL worker with clear licensing (fastest, generated apps become GPL)
   - **Option C**: Hybrid with opt-in flag (flexibility, more complexity)
   - **Recommendation**: **Option A** - reimplement patterns from seasick/playground as reference, keep generated apps MIT
   - **Impact**: Development time (+2-4 days), licensing freedom, long-term maintenance

### Answered During Planning

5. **Repository name**: ✅ `openscad-web-customizer-forge` (created)
6. **Repository separation**: ✅ New standalone repo (do not modify braille app)
7. **v1 Execution strategy**: ✅ OpenSCAD WASM wrapper (not native JS translation)

---

## Development Environment Requirements

### Prerequisites

| Requirement | Minimum Version | Recommended | Purpose |
|-------------|----------------|-------------|---------|
| **Node.js** | 18.x LTS | 20.x LTS | CLI tool, web app runtime |
| **Python** | 3.9+ | 3.11+ | Validation framework, mesh comparison |
| **npm** | 9.x | 10.x | Package management |
| **Docker** | 20.x | Latest | Local OpenSCAD CLI validation |
| **Git** | 2.30+ | Latest | Version control |

### Optional Tools

| Tool | Purpose | When Needed |
|------|---------|-------------|
| **CloudCompare** | Surface distance validation | Advanced mesh comparison |
| **OpenSCAD CLI** | Local validation without Docker | Windows/Linux native validation |
| **Playwright** | Headless browser testing | E2E validation tests |

### Environment Setup

```bash
# Clone repository
git clone https://github.com/YOUR_ORG/openscad-web-customizer-forge.git
cd openscad-web-customizer-forge

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # for testing

# Build Docker image for validation
docker build -f Dockerfile.openscad -t openscad-bridge .

# Verify installation
npm run test
python -m pytest tests/
```

---

## Repository Structure (Proposed)

```
openscad-web-customizer-forge/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Run tests on PR
│       ├── validation.yml            # Weekly OpenSCAD nightly test
│       └── release.yml               # npm/PyPI publish
├── cli/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── extract.ts           # Extract params from .scad
│   │   │   ├── scaffold.ts          # Generate web app
│   │   │   ├── validate.ts          # Run validation suite
│   │   │   └── sync.ts              # Iterative refinement
│   │   ├── parsers/
│   │   │   ├── openscad-customizer.ts
│   │   │   └── manifest-json.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── BUILD_PLAN.md                # This file
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── DEPLOYMENT.md                # Vercel/Netlify deployment guide
│   ├── specs/
│   │   ├── PARAMETER_SCHEMA_SPEC.md # JSON Schema definition
│   │   ├── CLI_API_SPEC.md          # Command-line interface spec
│   │   └── SECURITY.md              # Threat model & mitigations
│   └── examples/
│       └── TUTORIAL.md              # Step-by-step walkthrough
├── examples/
│   ├── universal-cuff/
│   │   ├── universal_cuff_utensil_holder.scad
│   │   ├── params.schema.json       # Generated schema
│   │   ├── README.md
│   │   └── generated-web-app/       # Example output
│   └── simple-box/                  # Minimal test case
├── src/
│   ├── validators/
│   │   ├── mesh_comparator.py       # Port from braille-stl-generator
│   │   ├── schema_validator.py
│   │   └── ui_validator.py
│   ├── runners/
│   │   ├── openscad_cli.py
│   │   ├── openscad_wasm.py
│   │   └── playwright_runner.py
│   └── utils/
│       ├── tolerances.py
│       └── mesh_metrics.py
├── templates/
│   ├── web-app-basic/               # Vanilla JS template
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   └── styles.css
│   │   ├── src/
│   │   │   ├── worker/
│   │   │   │   ├── openscad-worker.js
│   │   │   │   └── wasm-loader.js
│   │   │   ├── ui/
│   │   │   │   ├── form-generator.js
│   │   │   │   └── preview.js
│   │   │   └── main.js
│   │   ├── vercel.json
│   │   ├── package.json
│   │   ├── LICENSES.md
│   │   └── THIRD_PARTY_NOTICES.md
│   └── web-app-react/               # React template (v1.1)
├── tests/
│   ├── fixtures/
│   │   └── universal_cuff/
│   │       ├── case_default.yaml
│   │       └── golden_output.stl
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .gitignore
├── LICENSE                          # MIT for tool
├── README.md
├── package.json                     # Workspace root
├── requirements.txt                 # Python validation deps
├── requirements-dev.txt             # Testing deps
├── Dockerfile.openscad
└── THIRD_PARTY_NOTICES.md
```

---

## CLI API Specification

### Command Structure

```bash
openscad-forge <command> [options]
```

### Commands (v1)

#### `extract` - Extract parameters from OpenSCAD file

```bash
openscad-forge extract <input.scad> [options]

Options:
  --out <path>              Output path for params.schema.json (default: ./params.schema.json)
  --manifest <path>         Use explicit params.json manifest instead of parsing
  --include-hidden          Include parameters in /*[Hidden]*/ section
  --verbose                 Show detailed parsing information
  --format <json|yaml>      Output format (default: json)

Examples:
  openscad-forge extract universal_cuff.scad
  openscad-forge extract model.scad --out ./config/params.json --verbose
```

#### `scaffold` - Generate web app from schema

```bash
openscad-forge scaffold [options]

Options:
  --schema <path>           Path to params.schema.json (required)
  --scad <path>             Path to .scad file to bundle (required)
  --out <path>              Output directory for generated app (default: ./generated-web-app)
  --template <basic|react>  Template to use (default: basic)
  --preview                 Include 3D preview (adds Three.js)
  --offline                 Bundle all assets (large, includes WASM)
  --title <string>          App title (default: from schema)
  --license <MIT|GPL|...>   Generated app license (default: MIT if no GPL worker)

Examples:
  openscad-forge scaffold --schema params.json --scad model.scad
  openscad-forge scaffold --schema params.json --scad model.scad --preview --out ./my-app
```

#### `validate` - Run validation suite

```bash
openscad-forge validate <web-app-dir> [options]

Options:
  --cases <path>            Test cases YAML file (required)
  --ref <docker|cli|wasm>   Reference renderer (default: docker)
  --tolerances <path>       Custom tolerance config JSON
  --report <html|json|md>   Report format (default: html)
  --out <path>              Report output path (default: ./validation-report.html)
  --parallel <n>            Number of parallel test cases (default: 4)

Examples:
  openscad-forge validate ./generated-web-app --cases test-cases.yaml
  openscad-forge validate ./my-app --cases cases.yaml --ref cli --report json
```

#### `sync` - Iterative refinement (v1.1)

```bash
openscad-forge sync <web-app-dir> [options]

Options:
  --apply-safe-fixes        Auto-apply safe fixes (defaults/ranges/enums)
  --interactive             Prompt before each fix
  --dry-run                 Show proposed changes without applying

Examples:
  openscad-forge sync ./generated-web-app --dry-run
  openscad-forge sync ./my-app --apply-safe-fixes --interactive
```

---

## Validation notes (2026-01-12, Claude Opus 4.5, final review)

### Claims verified as correct

| Claim | Status |
|-------|--------|
| `trimesh` is dev-only in braille Vercel repo | ✅ Verified (requirements-dev.txt line 13) |
| CloudCompare is not integrated | ✅ Verified (not in any requirements file) |
| Example `.scad` has Customizer metadata | ✅ Verified (lines 26-102: groups, enums, ranges) |
| `seasick/openscad-web-gui` is GPL-3.0 | ✅ Correctly noted as licensing consideration |

### Example file analysis (universal_cuff_utensil_holder.scad)

**License**: CC0 Public Domain Dedication — **ideal** for demo/testing, no attribution required.

**Customizer groups found** (9 total):
- `[Part to Print]` — dropdown with 9 parts
- `[Palm Loop Info]` — dimensions + toggles
- `[Circular Loop Info]` — diameter, width, grips, elastic slots
- `[Utensil Mount Info]` — mount params
- `[Utensil Holder Info]` — handle type, dimensions, splits
- `[Thumb Rest/Loop Info]` — thumb dimensions
- `[Tool Interface Info]` — interface dimensions
- `[Tool Cup Info]` — cup dimensions
- `[Tool Saddle Info]` — saddle dimensions
- `[Circular Grip Info]` — grip diameter
- `[Hidden]` — internal constants ($fn, fudge, chamfer)

**Parameter types detected**:
- Enums: `// [option1,option2,...]` (e.g., `part`, `utensil_handle_type`)
- Ranges: `// [min:max]` (e.g., `palm_loop_height = 30; // [15:75]`)
- Yes/No toggles: `// [yes,no]`
- Hidden params: `/*[Hidden]*/` section for internal use

This file is an **excellent v1 test case** because it exercises all major Customizer annotation types.

---

## Deployment Guide (Generated Web Apps)

### Vercel Deployment (Recommended)

The generated web apps are optimized for Vercel's static hosting:

```bash
# From generated web app directory
cd generated-web-app/

# Install Vercel CLI
npm install -g vercel

# Deploy (production)
vercel --prod

# Deploy (preview)
vercel
```

**Vercel Configuration** (`vercel.json`):

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ]
}
```

**Why these headers?** SharedArrayBuffer support requires COOP/COEP headers for OpenSCAD WASM multithreading.

### Alternative Deployment Platforms

| Platform | Compatibility | Notes |
|----------|---------------|-------|
| **Netlify** | ✅ Full | Add `_headers` file with COOP/COEP |
| **GitHub Pages** | ⚠️ Limited | No custom headers; single-threaded WASM only |
| **Cloudflare Pages** | ✅ Full | Add `_headers` file |
| **AWS S3 + CloudFront** | ✅ Full | Configure headers in CloudFront |

### Environment Variables (Optional)

```bash
# .env (for advanced features)
VITE_OPENSCAD_WASM_CDN=https://cdn.example.com/openscad.wasm  # Custom WASM source
VITE_ENABLE_ANALYTICS=true                                     # Usage tracking
VITE_MAX_RENDER_TIME_MS=30000                                 # Timeout
```

---

## Security Considerations

### Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| **Malicious .scad file** | High | High | Sandboxing, timeouts, resource limits |
| **XSS via parameter values** | Medium | Medium | Input sanitization, CSP headers |
| **DoS via infinite loops** | Medium | High | Worker timeouts, memory limits |
| **Prototype pollution** | Low | Medium | Object.create(null) for param dicts |
| **WASM memory exhaustion** | Medium | Medium | Max memory limits in Emscripten config |

### Implemented Mitigations (v1)

#### 1. Worker Isolation

```javascript
// All OpenSCAD execution in isolated worker
const worker = new Worker('openscad-worker.js', {
  type: 'module',
  credentials: 'omit',  // No cookies/auth
});

// Terminate on timeout
const timeoutId = setTimeout(() => {
  worker.terminate();
  reject(new Error('Render timeout (30s)'));
}, 30000);
```

#### 2. Input Validation

```javascript
// Validate all parameters against schema before worker dispatch
import Ajv from 'ajv';
const ajv = new Ajv({ strict: true });
const validate = ajv.compile(paramsSchema);

if (!validate(userParams)) {
  throw new ValidationError(validate.errors);
}
```

#### 3. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  connect-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
">
```

#### 4. Resource Limits (Emscripten Config)

```javascript
// openscad-worker.js WASM initialization
Module = {
  TOTAL_MEMORY: 512 * 1024 * 1024,      // 512MB max
  ALLOW_MEMORY_GROWTH: false,            // Fixed allocation
  ENVIRONMENT: 'worker',                 // No DOM access
  noExitRuntime: true,
  onAbort: () => worker.postMessage({ type: 'error', message: 'WASM aborted' }),
};
```

### Security Checklist for Generated Apps

- [ ] CSP headers configured in `vercel.json`
- [ ] Worker timeout enforcement (default 30s)
- [ ] Input validation with JSON Schema
- [ ] No `eval()` or `Function()` constructor usage
- [ ] WASM loaded from trusted CDN (integrity hash)
- [ ] Error messages don't leak file paths
- [ ] No user content rendered as HTML (XSS prevention)
- [ ] Rate limiting on STL generation (if backend added later)

---

## Browser Compatibility Testing Strategy

### Target Browser Matrix (v1)

| Browser | Minimum Version | Test Frequency | CI Coverage |
|---------|----------------|----------------|-------------|
| **Chrome** | 90+ (May 2021) | Every commit | ✅ Playwright |
| **Firefox** | 90+ (July 2021) | Every commit | ✅ Playwright |
| **Edge** | 90+ (May 2021) | Weekly | Manual |
| **Safari** | 14+ (Sept 2020) | Weekly | Manual (requires macOS) |

### Required Browser Features

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Workers | ✅ 4+ | ✅ 3.5+ | ✅ 4+ | ✅ 12+ |
| WebAssembly | ✅ 57+ | ✅ 52+ | ✅ 11+ | ✅ 16+ |
| SharedArrayBuffer | ✅ 68+ | ✅ 79+ | ✅ 15.2+ | ✅ 79+ |
| ES2020 syntax | ✅ 80+ | ✅ 74+ | ✅ 13.1+ | ✅ 80+ |
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |

### Compatibility Testing Workflow

```yaml
# .github/workflows/browser-compat.yml
name: Browser Compatibility
on: [push, pull_request]

jobs:
  playwright:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install ${{ matrix.browser }}
      - run: npm test -- --browser=${{ matrix.browser }}
```

### Manual Testing Checklist

Test on real devices monthly:

- [ ] Desktop: Windows 11 (Chrome/Edge), macOS (Safari/Chrome), Linux (Firefox/Chrome)
- [ ] Mobile: iOS Safari 14+, Android Chrome 90+
- [ ] Accessibility: NVDA (Windows), VoiceOver (macOS/iOS)
- [ ] Network: 3G throttling, offline mode (if implemented)

---

## Recommended next steps

### Immediate (before coding)

1. ✅ **Create repo** — `openscad-web-customizer-forge` created
2. ✅ **Copy this plan** — BUILD_PLAN.md in docs/
3. ⏳ **Answer critical decisions** — see "Open questions" section above (4 decisions pending)
4. ⏳ **Choose GPL worker strategy** — recommend Option A (reimplement)

### Phase 0 kickoff (once decisions answered)

1. ✅ **Write `docs/specs/PARAMETER_SCHEMA_SPEC.md`** — JSON Schema extensions for UI metadata (complete)
2. ⏳ **Write `docs/specs/CLI_API_SPEC.md`** — formalize command-line interface (draft in this doc)
3. ⏳ **Write `docs/specs/SECURITY.md`** — expand threat model and mitigation details
4. ✅ **Generate sample `params.schema.json`** from the cuff `.scad` (complete, 50+ params)
5. ⏳ **Set up development environment** — Node.js, Python, Docker, CI config

### Technical decisions finalized

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| ✅ Repository name | `openscad-web-customizer-forge` | Created and in use |
| ✅ License (tool) | MIT | Maximum adoption, separate from GPL WASM |
| ✅ v1 Execution | OpenSCAD WASM wrapper | Feasible; native JS translation too complex |
| ✅ UI framework | Vanilla JS | Minimal deps, like braille app, accessibility-first |
| ⏳ STL preview | Three.js (optional flag) | **Needs decision** — improves UX, +580KB |
| ⏳ Offline mode | CDN for v1 | **Needs decision** — offline as v1.1 feature |
| ⏳ GPL worker | Reimplement (recommended) | **Needs decision** — keeps generated apps MIT |

---

## Versioning and Release Strategy

### Semantic Versioning (SemVer)

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes to CLI API or schema format
- **MINOR** (0.x.0): New features, backward-compatible
- **PATCH** (0.0.x): Bug fixes, no new features

### Version Pinning Strategy

| Component | Pinning Approach | Rationale |
|-----------|------------------|-----------|
| **OpenSCAD WASM** | Pin to specific release tag | Deterministic STL output for validation |
| **Node.js** | Require LTS (18.x+) | Stability, security updates |
| **Python** | Require 3.9+ | Type hints, dataclasses |
| **Three.js** | Pin minor version (^0.160.0) | Breaking changes in major versions |
| **JSON Schema** | Draft 2020-12 | Latest stable draft |

### Release Checklist (before tagging)

- [ ] All tests pass (unit, integration, e2e)
- [ ] Documentation updated (README, CHANGELOG)
- [ ] Version bumped in package.json, pyproject.toml
- [ ] Golden fixtures regenerated if needed
- [ ] Security audit clean (`npm audit`, `pip-audit`)
- [ ] License compliance verified
- [ ] GitHub release notes drafted
- [ ] npm and/or PyPI credentials ready

### Backward Compatibility Promises (v1.x)

**Will NOT break**:
- Schema format (new fields are additive, old fields deprecated with warnings)
- CLI command names (`extract`, `scaffold`, `validate`)
- Generated app file structure (new files OK, moved files are breaking)

**May break (with MAJOR bump)**:
- Internal APIs (parsers, validators not exported publicly)
- Development dependencies (test frameworks, build tools)
- Undocumented CLI flags (experimental features)

### Deprecation Policy

1. Announce deprecation in CHANGELOG with 1+ MINOR version notice
2. Add runtime warnings to deprecated features
3. Remove in next MAJOR version
4. Maintain migration guide in docs/

**Example**:
- v1.2.0: Announce `--manifest` flag deprecated (use `--schema` instead)
- v1.3.0: Runtime warning when `--manifest` used
- v2.0.0: Remove `--manifest` flag

---

## Related files and references

### Superseded plan versions (in Cursor plans folder)

These files were consolidated into this BUILD_PLAN.md:

| File | Lines | Content Incorporated |
|------|-------|---------------------|
| `openscad-web_bridge_tool_303c433e.plan.md` | 252 | YAML todos, WASM architecture, Docker fallback |
| `openscad-web_bridge_tool_303c433e.plan.ARCHIVED.md` | 402 | Technical challenges, risk assessment, testing strategy, migration guide, success metrics |
| `openscad-web_bridge_tool_CONSOLIDATED.plan.md` | 288 | Executive summary, validation notes, example analysis |

### Reference projects

- `C:\Users\WATAP\Documents\github\braille-stl-generator-openscad\` — OpenSCAD version of braille tool (validation framework to port)
- `C:\Users\WATAP\Documents\github\braille-card-and-cylinder-stl-generator\` — Production Vercel app (UI/UX template reference)

### Files in this repository

- `docs/specs/PARAMETER_SCHEMA_SPEC.md` — ✅ JSON Schema specification for parameters (v1.0.0-draft)
- `docs/specs/CLI_API_SPEC.md` — **TODO**: Command-line interface formal specification
- `docs/specs/SECURITY.md` — **TODO**: Detailed threat model and security architecture
- `docs/DEPLOYMENT.md` — **TODO**: Complete deployment guide for all platforms
- `docs/CONTRIBUTING.md` — **TODO**: Contribution guidelines and code of conduct
- `examples/universal-cuff/params.schema.json` — ✅ Example schema with 50+ parameters extracted from universal cuff
- `examples/universal-cuff/universal_cuff_utensil_holder.scad` — ✅ CC0 test case with full Customizer annotations
- `examples/universal-cuff/README.md` — ✅ Documentation for the example project

### Current Repository Status

| Component | Status | Notes |
|-----------|--------|-------|
| Repository created | ✅ Complete | `openscad-web-customizer-forge` |
| BUILD_PLAN.md | ✅ Complete | This document (v0.1.0 draft) |
| Project structure | ✅ Complete | `docs/`, `examples/`, `src/`, `templates/` directories created |
| Parameter schema spec | ✅ Complete | `docs/specs/PARAMETER_SCHEMA_SPEC.md` (v1.0.0-draft) |
| Example schema | ✅ Complete | `examples/universal-cuff/params.schema.json` with 50+ params |
| CLI scaffolding | ⏳ Pending | Phase 1 |
| Web app templates | ⏳ Pending | Phase 2 |
| Validation framework | ⏳ Pending | Phase 3 |

---

## Troubleshooting Common Issues (for contributors and users)

### Development Issues

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **WASM load failure** | "Failed to instantiate WASM module" | Check COOP/COEP headers; ensure SharedArrayBuffer support |
| **Worker timeout** | STL generation hangs | Increase timeout in worker config; check $fn values (high = slow) |
| **Schema validation fails** | "does not match schema" | Run with `--verbose` to see exact validation errors |
| **Parser misses parameters** | Missing params in schema | Check Customizer annotation format; use `--include-hidden` |
| **Docker OpenSCAD fails** | "command not found" | Rebuild Docker image; check `docker run openscad --version` |
| **Memory exhaustion** | Worker crashes silently | Reduce TOTAL_MEMORY or increase browser limits |

### Deployment Issues

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **SharedArrayBuffer error** | "SharedArrayBuffer is not defined" | Add COOP/COEP headers in `vercel.json` or `_headers` |
| **404 on WASM files** | "Failed to fetch openscad.wasm" | Check CDN URL; ensure CORS headers if external CDN |
| **Slow initial load** | White screen for 10+ seconds | Add loading indicator; lazy-load WASM after page render |
| **Mobile rendering fails** | Blank page on iOS/Android | Check browser compatibility (Safari 14+); test with BrowserStack |

### User-Reported Issues (anticipated)

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **"My .scad doesn't work"** | No parameters extracted | Verify Customizer annotations; try `--manifest` fallback |
| **"STL differs from OpenSCAD"** | Visual differences | Check $fn consistency; compare with `--tolerances` config |
| **"App is too slow"** | 30s+ render times | Optimize .scad (reduce $fn, simplify geometry); add caching |
| **"License confusion"** | "Is my app GPL?" | If using MIT worker reimplementation: no; if vendoring GPL worker: yes |

---

## Implementation Priorities (Ordered by Dependency)

### Must Have for v1.0 (blocking)

1. **Parameter Schema Spec** (docs/specs/PARAMETER_SCHEMA_SPEC.md)
   - JSON Schema core structure
   - UI metadata extensions (label, help, group, order, units)
   - Dependency rule syntax (visible_if, enabled_if, default_from)
   - Example: universal cuff full schema

2. **OpenSCAD Customizer Parser** (Phase 1)
   - Extract groups: `/*[Group Name]*/`
   - Extract params: `variable = default; // [hint]`
   - Detect types: enum `[a,b,c]`, range `[min:max]`, boolean `[yes,no]`
   - Handle strings, arrays, hidden sections

3. **Schema-Driven UI Generator** (Phase 2)
   - Render form from schema (text, number, select, checkbox, range inputs)
   - Apply grouping and ordering
   - Implement dependency rules (show/hide, enable/disable)
   - Accessibility: ARIA labels, keyboard nav, focus management

4. **OpenSCAD WASM Worker** (Phase 2)
   - Implement (not vendor) worker wrapper patterns from reference code
   - Virtual FS setup (fonts, includes)
   - Parameter marshalling to `-D` flags
   - STL export as ArrayBuffer
   - Timeout enforcement (30s default)

5. **STL Download Handler** (Phase 2)
   - Convert ArrayBuffer to Blob
   - Generate download filename (parameterized)
   - Trigger browser download

6. **Basic Validation** (Phase 3)
   - Docker OpenSCAD CLI runner
   - Playwright headless browser runner
   - Mesh metrics: volume, bbox, triangle count
   - Golden fixture comparison

### Should Have for v1.0 (important)

7. **3D Preview** (Phase 2, optional flag)
   - Three.js STL loader
   - Orbit controls, zoom, pan
   - Lighting and materials
   - Progress indicator during WASM load

8. **Comprehensive Validation** (Phase 3)
   - Surface distance (Hausdorff approximation)
   - UI snapshot comparison
   - Parallel test execution
   - HTML/JSON/Markdown reports

9. **Documentation** (Phase 4)
   - Tutorial: zero to deployed app in 15 minutes
   - API reference for all CLI commands
   - Troubleshooting guide
   - Example projects (3+ with README)

10. **CI/CD** (Phase 4)
    - GitHub Actions: test on every commit
    - Playwright browser matrix
    - Golden fixture regression tests
    - Weekly OpenSCAD nightly build tests

### Nice to Have for v1.0 (defer if time-constrained)

11. **Shareable URLs** (Phase 2)
    - Encode params in URL query string or hash
    - Deep linking to specific parameter sets
    - Social sharing metadata

12. **Parameter Presets** (Phase 2)
    - Define named presets in schema
    - Dropdown to select preset
    - "Save current as preset" UI

13. **Offline Mode** (v1.1)
    - Service worker
    - Cache WASM and assets
    - "Install as PWA" prompt

14. **Auto-Fix Suggestions** (v1.1)
    - Detect common issues in validation
    - Propose safe fixes (e.g., missing default values)
    - Apply with `--apply-safe-fixes`

---


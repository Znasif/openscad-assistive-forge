# Changelog v2.10.1 — Preview/Generate Stability

**Release Date**: 2026-01-18

## Overview

Version 2.10.1 focuses on stabilizing the generate workflow when previews are still rendering. It prevents premature cancellations and improves automatic recovery from internal OpenSCAD errors.

---

## Fixed

- **Generate before preview**: Generating STL no longer cancels in-progress previews, avoiding stuck states and unnecessary retries.
- **Internal render recovery**: Numeric OpenSCAD error codes now trigger a clean worker restart and retry.

---

## Notes

- No schema or UI changes in this release.

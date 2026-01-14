# OpenSCAD Library Bundles

This directory contains popular OpenSCAD library bundles that can be used in your models.

## Supported Libraries

### MCAD (Mechanical CAD Library)
- **Repository**: https://github.com/openscad/MCAD
- **License**: LGPL 2.1
- **Description**: Mechanical design components (gears, screws, bearings, boxes, etc.)
- **Usage**: `use <MCAD/boxes.scad>` or `include <MCAD/gears.scad>`

### BOSL2 (Belfry OpenSCAD Library v2)
- **Repository**: https://github.com/BelfrySCAD/BOSL2
- **License**: BSD-2-Clause
- **Description**: Advanced geometric primitives, attachments, rounding, filleting
- **Requirements**: OpenSCAD 2021.01 or later
- **Usage**: `include <BOSL2/std.scad>`

### NopSCADlib
- **Repository**: https://github.com/nophead/NopSCADlib
- **License**: GPL-3.0
- **Description**: Parts library for 3D printers and electronic enclosures
- **Usage**: `include <NopSCADlib/lib.scad>`

### dotSCAD
- **Repository**: https://github.com/JustinSDK/dotSCAD
- **License**: LGPL 3.0
- **Description**: Artistic patterns, dots, lines for functional designs
- **Usage**: `use <dotSCAD/path_extrude.scad>`

## Installation

Libraries are automatically fetched when enabled in the UI. To manually add or update libraries:

### Automatic (Recommended)
```bash
npm run setup-libraries
```

This script will download the latest versions of all supported libraries.

### Manual Installation

1. Clone the library repository into this directory:
```bash
cd public/libraries
git clone https://github.com/openscad/MCAD.git
git clone https://github.com/BelfrySCAD/BOSL2.git
```

2. The directory structure should look like:
```
public/libraries/
├── MCAD/
│   ├── boxes.scad
│   ├── gears.scad
│   └── ...
├── BOSL2/
│   ├── std.scad
│   ├── geometry.scad
│   └── ...
└── README.md
```

## Usage in OpenSCAD Models

When a library bundle is enabled in the UI, you can use it in your .scad files:

```openscad
// Example using MCAD
use <MCAD/boxes.scad>;

roundedBox([20, 30, 40], 5);
```

```openscad
// Example using BOSL2
include <BOSL2/std.scad>;

cuboid([20, 30, 40], rounding=5);
```

## Adding New Libraries

To add a new library:

1. Add library metadata to `src/js/library-manager.js`
2. Place library files in `public/libraries/<library-name>/`
3. Update this README with usage information
4. Test with example models

## License Compliance

Each library has its own license. When using libraries in your models:
- **MCAD**: LGPL 2.1 - Models using MCAD must be LGPL compatible
- **BOSL2**: BSD-2-Clause - Permissive, minimal restrictions
- **NopSCADlib**: GPL-3.0 - Models must be GPL-3.0 compatible
- **dotSCAD**: LGPL 3.0 - Models must be LGPL compatible

The generated STL files are generally not considered derived works of the library, but consult with a legal professional if you have concerns.

## Troubleshooting

### Library Not Found
- Ensure the library bundle is enabled in the UI
- Check that library files exist in `public/libraries/<library-name>/`
- Verify the include/use path matches the library structure

### Render Timeout
- Some library functions are complex and may take longer to render
- Increase timeout in settings if needed
- Use preview quality ($fn=24) for faster iteration

### Compatibility Issues
- BOSL2 requires OpenSCAD 2021.01+ (check WASM version)
- Some libraries may not be fully compatible with OpenSCAD WASM
- Report issues on GitHub with example code

/**
 * Library Test Example
 * Demonstrates using OpenSCAD library bundles (MCAD)
 * @license CC0-1.0 (Public Domain)
 */

// This example uses MCAD library for rounded boxes
use <MCAD/boxes.scad>;

/*[Dimensions]*/
// Box width (mm)
width = 50; // [20:100]

// Box depth (mm)
depth = 30; // [20:100]

// Box height (mm)
height = 25; // [10:50]

// Corner radius (mm)
radius = 5; // [1:15]

/*[Options]*/
// Box style
style = "Rounded"; // [Rounded, Simple]

/*[Hidden]*/
// Fragment number for curves
$fn = 64;

// Main module
module main() {
    if (style == "Rounded") {
        // Use MCAD's rounded box function
        roundedBox([width, depth, height], radius);
    } else {
        // Simple cube for comparison
        cube([width, depth, height], center=true);
    }
}

// Render
main();

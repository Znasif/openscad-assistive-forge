// LEGO-Compatible Logo Plate
// A customizable plate with LEGO studs and engraved logo
// License: CC0 (Public Domain)

/* [Render Mode] */
// What to display
render_mode = 0; // [0:Assembly, 1:Base Only, 2:Plate Only]

/* [Image Settings] */
// Logo image file (PNG, black on white works best)
image_file = "logo.png"; // [file:png]

// Invert image colors (toggle if logo appears inverted)
image_invert = true;

// Engraving depth in mm
cut_depth = 1.0; // [0.3:0.1:3.0]

/* [Dimensions] */
// Base width in mm
base_width = 20; // [10:1:60]

// Base length in mm
base_length = 20; // [10:1:60]

// Base height in mm
base_height = 8; // [4:1:20]

// Corner rounding radius in mm
corner_radius = 2.5; // [0:0.5:10]

/* [Plate Settings] */
// Plate thickness in mm
plate_thickness = 3.0; // [1:0.5:8]

// Tolerance for stud holes (larger = looser fit)
plate_tolerance = 0.2; // [0:0.05:0.5]

/* [LEGO Stud Settings] */
// Stud diameter in mm
stud_diameter = 4.8; // [4.0:0.1:5.5]

// Stud height in mm
stud_height = 1.8; // [1.0:0.1:3.0]

// Distance between stud centers
stud_pitch = 8.0; // [6:0.5:10]

/* [Rail Slot Settings] */
// Slot width (narrowest part)
rail_slot_width = 10; // [5:1:20]

// Inner rail width
rail_inner_width = 15; // [8:1:25]

// Cavity height
rail_cavity_height = 4.5; // [2:0.5:8]

// Lip thickness
rail_lip_thickness = 2.0; // [1:0.5:4]

/* [Quality] */
// Render quality (higher = smoother curves)
$fn = 64; // [16:4:128]

// --- Main Logic ---

if (render_mode == 0) {
    base_part();
    translate([0, 0, base_height + 10]) plate_with_logo();
    translate([0, 0, base_height + 25]) plate_with_logo();
} 
else if (render_mode == 1) {
    base_part();
} 
else if (render_mode == 2) {
    plate_with_logo();
}

// --- Modules ---

module plate_with_logo() {
    difference() {
        plate_part();
        translate([0, 0, plate_thickness - cut_depth]) 
            logo_cutter();
    }
}

module logo_cutter() {
    // Use injected logo geometry instead of surface() which doesn't work in WASM
    linear_extrude(height = cut_depth + 1) {
        // Resize to fit the plate (leave 2mm margin on edges)
        resize([base_width - 4, base_length - 4]) {
            generated_logo();
        }
    }
}

// === GENERATED LOGO MODULE - INJECTED BY JS ===
// GENERATED_LOGO_PLACEHOLDER
module generated_logo() {
    // Default empty - JS injects real geometry here
    square([1, 1], center = true);
}
// === END GENERATED LOGO MODULE ===

module plate_part() {
    difference() {
        rounded_box(base_width, base_length, plate_thickness, corner_radius);
        translate([0, 0, -0.1]) 
            lego_holes(d=stud_diameter + plate_tolerance, h=stud_height + 0.2);
    }
}

module base_part() {
    difference() {
        union() {
            rounded_box(base_width, base_length, base_height, corner_radius);
            translate([0, 0, base_height]) lego_studs();
        }
        translate([0, 0, -0.1]) rail_cutout();
    }
}

// --- Standard Helpers ---

module rounded_box(w, l, h, r) {
    x_shift = w/2 - r;
    y_shift = l/2 - r;
    hull() {
        translate([x_shift, y_shift, 0]) cylinder(r=r, h=h);
        translate([-x_shift, y_shift, 0]) cylinder(r=r, h=h);
        translate([x_shift, -y_shift, 0]) cylinder(r=r, h=h);
        translate([-x_shift, -y_shift, 0]) cylinder(r=r, h=h);
    }
}

module lego_studs() {
    o = stud_pitch / 2;
    translate([o, o, 0]) cylinder(d=stud_diameter, h=stud_height);
    translate([-o, o, 0]) cylinder(d=stud_diameter, h=stud_height);
    translate([o, -o, 0]) cylinder(d=stud_diameter, h=stud_height);
    translate([-o, -o, 0]) cylinder(d=stud_diameter, h=stud_height);
}

module lego_holes(d, h) {
    o = stud_pitch / 2;
    translate([o, o, 0]) cylinder(d=d, h=h);
    translate([-o, o, 0]) cylinder(d=d, h=h);
    translate([o, -o, 0]) cylinder(d=d, h=h);
    translate([-o, -o, 0]) cylinder(d=d, h=h);
}

module rail_cutout() {
    translate([-rail_inner_width/2, -base_length/2 - 1, rail_lip_thickness])
        cube([rail_inner_width, base_length + 2, rail_cavity_height]);
    translate([-rail_slot_width/2, -base_length/2 - 1, 0])
        cube([rail_slot_width, base_length + 2, rail_cavity_height + rail_lip_thickness]);
}

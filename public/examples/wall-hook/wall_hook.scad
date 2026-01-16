// Wall Hook
// Customizable hook for hanging items on walls
// License: CC0 (Public Domain)

/* [Hook] */
// Hook length (how far it extends from wall)
hook_length = 50; // [20:100]

// Hook height (tip curve)
hook_height = 25; // [10:50]

// Hook opening (gap for hanging items)
hook_opening = 20; // [10:40]

// Hook thickness
hook_thickness = 8; // [4:15]

/* [Backplate] */
// Backplate width
backplate_width = 30; // [20:80]

// Backplate height
backplate_height = 60; // [30:120]

// Backplate thickness
backplate_thickness = 4; // [2:8]

/* [Mounting] */
// Mounting type
mount_type = "screws"; // [screws, keyhole, adhesive]

// Number of screw holes
screw_count = 2; // [1:4]

// Screw hole diameter
screw_diameter = 5; // [3:8]

// Countersink screw holes
countersink = "yes"; // [yes, no]

/* [Style] */
// Hook curve style
curve_style = "round"; // [round, angular, organic]

// Add reinforcement
add_gusset = "yes"; // [yes, no]

// Gusset size (% of hook length)
gusset_size = 40; // [20:60]

/* [Quality] */
$fn = 48; // [24:64]

/* [Hidden] */
gusset_length = hook_length * gusset_size / 100;

module wall_hook() {
    union() {
        // Backplate
        backplate();
        
        // Main hook
        translate([0, backplate_thickness, 0])
            hook();
        
        // Gusset (triangular support)
        if (add_gusset == "yes") {
            translate([0, backplate_thickness - 0.1, 0])
                gusset();
        }
    }
}

module backplate() {
    difference() {
        // Main plate
        translate([-backplate_width/2, 0, 0])
            cube([backplate_width, backplate_thickness, backplate_height]);
        
        // Mounting holes
        if (mount_type == "screws") {
            screw_holes();
        } else if (mount_type == "keyhole") {
            keyhole();
        }
    }
}

module screw_holes() {
    hole_spacing = (backplate_height - 20) / (screw_count - 1);
    
    for (i = [0:screw_count-1]) {
        z_pos = 10 + (i * hole_spacing);
        
        translate([0, -0.1, z_pos]) {
            rotate([-90, 0, 0]) {
                cylinder(d=screw_diameter, h=backplate_thickness + 0.2);
                
                if (countersink == "yes") {
                    // Countersink cone
                    cylinder(d1=screw_diameter*2, d2=screw_diameter, h=screw_diameter*0.6);
                }
            }
        }
    }
}

module keyhole() {
    // Classic keyhole slot
    z_top = backplate_height * 0.75;
    z_bottom = backplate_height * 0.25;
    
    translate([0, -0.1, z_top])
        rotate([-90, 0, 0])
        cylinder(d=screw_diameter*2, h=backplate_thickness + 0.2);
    
    translate([0, -0.1, z_bottom])
        rotate([-90, 0, 0])
        cylinder(d=screw_diameter, h=backplate_thickness + 0.2);
    
    // Connecting slot
    translate([-screw_diameter/2, -0.1, z_bottom])
        cube([screw_diameter, backplate_thickness + 0.2, z_top - z_bottom]);
}

module hook() {
    if (curve_style == "round") {
        round_hook();
    } else if (curve_style == "angular") {
        angular_hook();
    } else if (curve_style == "organic") {
        organic_hook();
    }
}

module round_hook() {
    // Base extends from wall
    translate([-hook_thickness/2, 0, hook_height])
        cube([hook_thickness, hook_length, hook_thickness]);
    
    // Curved tip
    translate([0, hook_length, hook_height + hook_thickness/2])
        rotate([0, 90, 0])
        rotate_extrude(angle=180)
        translate([hook_opening/2 + hook_thickness/2, 0, 0])
        circle(d=hook_thickness);
    
    // Upturned tip
    translate([-hook_thickness/2, hook_length - hook_opening/2 - hook_thickness/2, hook_height + hook_thickness])
        cube([hook_thickness, hook_thickness, hook_opening]);
}

module angular_hook() {
    // Horizontal arm
    translate([-hook_thickness/2, 0, hook_height])
        cube([hook_thickness, hook_length, hook_thickness]);
    
    // Downward section
    translate([-hook_thickness/2, hook_length - hook_thickness, hook_height - hook_opening])
        cube([hook_thickness, hook_thickness, hook_opening + hook_thickness]);
    
    // Upturned tip
    translate([-hook_thickness/2, hook_length - hook_thickness - hook_opening/2, hook_height - hook_opening])
        cube([hook_thickness, hook_opening/2 + hook_thickness, hook_thickness]);
}

module organic_hook() {
    // Use hull for smooth organic shape
    hull() {
        translate([-hook_thickness/2, 0, hook_height])
            cube([hook_thickness, hook_thickness, hook_thickness]);
        translate([0, hook_length * 0.7, hook_height + hook_thickness/2])
            sphere(d=hook_thickness);
    }
    
    hull() {
        translate([0, hook_length * 0.7, hook_height + hook_thickness/2])
            sphere(d=hook_thickness);
        translate([0, hook_length, hook_height - hook_opening/2])
            sphere(d=hook_thickness);
    }
    
    hull() {
        translate([0, hook_length, hook_height - hook_opening/2])
            sphere(d=hook_thickness);
        translate([0, hook_length - hook_opening/2, hook_height - hook_opening])
            sphere(d=hook_thickness * 1.2);
    }
}

module gusset() {
    // Triangular support bracket
    translate([-hook_thickness/2, 0, 0])
        linear_extrude(height=hook_thickness)
        polygon([
            [0, 0],
            [0, gusset_length],
            [hook_thickness, gusset_length],
            [hook_thickness, 0]
        ]);
    
    // Vertical support
    translate([-hook_thickness/2, 0, 0])
        cube([hook_thickness, hook_thickness, hook_height]);
}

// Render
wall_hook();

/**
 * 3D Preview using Three.js
 * @license GPL-3.0-or-later
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

/**
 * Theme-aware color scheme for 3D preview
 */
const PREVIEW_COLORS = {
  light: {
    background: 0xf5f5f5,
    gridPrimary: 0xcccccc,
    gridSecondary: 0xe0e0e0,
    model: 0x2196f3,
    ambientLight: 0xffffff,
  },
  dark: {
    background: 0x1a1a1a,
    gridPrimary: 0x404040,
    gridSecondary: 0x2d2d2d,
    model: 0x4d9fff,
    ambientLight: 0xffffff,
  },
  'light-hc': {
    background: 0xffffff,
    gridPrimary: 0x000000,
    gridSecondary: 0x666666,
    model: 0x0052cc,
    ambientLight: 0xffffff,
  },
  'dark-hc': {
    background: 0x000000,
    gridPrimary: 0xffffff,
    gridSecondary: 0x999999,
    model: 0x66b3ff,
    ambientLight: 0xffffff,
  },
};

/**
 * Preview manager class
 */
export class PreviewManager {
  constructor(container, options = {}) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mesh = null;
    this.gridHelper = null;
    this.animationId = null;
    this.currentTheme = options.theme || 'light';
    this.highContrast = options.highContrast || false;
  }

  /**
   * Initialize Three.js scene
   */
  init() {
    // Clear container
    this.container.innerHTML = '';

    // Detect initial theme
    this.currentTheme = this.detectTheme();
    const colors = PREVIEW_COLORS[this.currentTheme];

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(colors.background);

    // Create camera
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    this.camera.position.set(0, 0, 200);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Add lights (store references for potential theme updates)
    this.ambientLight = new THREE.AmbientLight(colors.ambientLight, 0.6);
    this.scene.add(this.ambientLight);

    this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight1.position.set(1, 1, 1);
    this.scene.add(this.directionalLight1);

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    this.directionalLight2.position.set(-1, -1, -1);
    this.scene.add(this.directionalLight2);

    // Add grid helper
    this.gridHelper = new THREE.GridHelper(200, 20, colors.gridPrimary, colors.gridSecondary);
    this.scene.add(this.gridHelper);

    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 1000;

    // Handle window resize
    this.handleResize = () => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.handleResize);

    // Start animation loop
    this.animate();

    console.log(`[Preview] Three.js scene initialized (theme: ${this.currentTheme})`);
  }

  /**
   * Detect current theme from document
   * @returns {string} 'light', 'dark', 'light-hc', or 'dark-hc'
   */
  detectTheme() {
    const root = document.documentElement;
    const dataTheme = root.getAttribute('data-theme');
    const highContrast = root.getAttribute('data-high-contrast') === 'true';
    
    let baseTheme;
    if (dataTheme === 'dark') {
      baseTheme = 'dark';
    } else if (dataTheme === 'light') {
      baseTheme = 'light';
    } else {
      // Auto mode - check system preference
      baseTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return highContrast ? `${baseTheme}-hc` : baseTheme;
  }

  /**
   * Update preview colors for theme change
   * @param {string} theme - 'light', 'dark', 'light-hc', or 'dark-hc'
   * @param {boolean} highContrast - High contrast mode enabled
   */
  updateTheme(theme, highContrast = false) {
    // Determine theme key
    let themeKey = theme;
    if (highContrast && !theme.endsWith('-hc')) {
      themeKey = `${theme}-hc`;
    }
    
    if (!this.scene || themeKey === this.currentTheme) return;
    
    this.currentTheme = themeKey;
    this.highContrast = highContrast;
    const colors = PREVIEW_COLORS[themeKey] || PREVIEW_COLORS.light;
    
    // Update scene background
    this.scene.background.setHex(colors.background);
    
    // Update grid colors
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      // Use thicker grid lines in high contrast mode
      const gridSize = highContrast ? 3 : 2;
      this.gridHelper = new THREE.GridHelper(200, 20, colors.gridPrimary, colors.gridSecondary);
      this.gridHelper.material.linewidth = gridSize;
      this.scene.add(this.gridHelper);
    }
    
    // Update model color if mesh exists
    if (this.mesh && this.mesh.material) {
      this.mesh.material.color.setHex(colors.model);
    }
    
    console.log(`[Preview] Theme updated to ${themeKey}`);
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Load and display STL from ArrayBuffer
   * @param {ArrayBuffer} stlData - Binary STL data
   */
  loadSTL(stlData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('[Preview] Loading STL, size:', stlData.byteLength, 'bytes');

        // Remove existing mesh
        if (this.mesh) {
          this.scene.remove(this.mesh);
          this.mesh.geometry.dispose();
          this.mesh.material.dispose();
          this.mesh = null;
        }

        // Load STL
        const loader = new STLLoader();
        const geometry = loader.parse(stlData);

        console.log('[Preview] STL parsed, vertices:', geometry.attributes.position.count);

        // Compute normals and center geometry
        geometry.computeVertexNormals();
        geometry.center();

        // Create material with theme-aware color
        const colors = PREVIEW_COLORS[this.currentTheme];
        const material = new THREE.MeshPhongMaterial({
          color: colors.model,
          specular: 0x111111,
          shininess: 30,
          flatShading: false,
        });

        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Auto-fit camera to model
        this.fitCameraToModel();

        console.log('[Preview] STL loaded and displayed');
        resolve();
      } catch (error) {
        console.error('[Preview] Failed to load STL:', error);
        reject(error);
      }
    });
  }

  /**
   * Fit camera to model bounds
   */
  fitCameraToModel() {
    if (!this.mesh) return;

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(this.mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Get the max side of the bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // Add some padding
    cameraZ *= 1.5;

    // Update camera position
    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.camera.lookAt(center);

    // Update controls target
    this.controls.target.copy(center);
    this.controls.update();

    console.log('[Preview] Camera fitted to model, size:', size, 'distance:', cameraZ);
  }

  /**
   * Clear the preview
   */
  clear() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    this.container.innerHTML = '';
    
    console.log('[Preview] Resources disposed');
  }
}

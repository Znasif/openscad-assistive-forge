<template>
  <section class="preview-panel">
    <div class="preview-header">
      <h2>Preview</h2>
      <span :class="`status-badge status-${previewState}`">
        {{ getStatusMessage() }}
      </span>
    </div>

    <div ref="containerRef" class="preview-container"></div>

    <div class="preview-actions">
      <button
        @click="$emit('render')"
        class="button button-primary"
        :disabled="previewState === 'rendering'"
      >
        {{ previewState === 'rendering' ? 'Generating...' : 'Generate STL' }}
      </button>
      
      <button
        @click="$emit('download')"
        class="button button-secondary"
        :disabled="!stlData || previewState === 'rendering'"
      >
        Download STL
      </button>
    </div>

    <div v-if="error && previewState === 'error'" class="error-message" role="alert">
      <strong>Error:</strong> {{ error }}
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const props = defineProps({
  stlData: [String, ArrayBuffer],
  previewState: String,
  error: String,
});

defineEmits(['render', 'download']);

const containerRef = ref(null);
let scene = null;
let renderer = null;
let camera = null;
let controls = null;
let animationId = null;

// Initialize Three.js scene
onMounted(() => {
  if (!containerRef.value) return;

  const container = containerRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(50, 50, 50);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  // Grid
  const gridHelper = new THREE.GridHelper(100, 20);
  scene.add(gridHelper);

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Handle resize
  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };
  window.addEventListener('resize', handleResize);

  // Cleanup
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    }
  });
});

// Load STL data
watch(() => props.stlData, (newStlData) => {
  if (!newStlData || !scene) return;

  // Remove previous model
  const previousModel = scene.getObjectByName('model');
  if (previousModel) {
    scene.remove(previousModel);
  }

  // Load new model
  const loader = new STLLoader();
  const geometry = loader.parse(newStlData);
  geometry.computeVertexNormals();
  geometry.center();

  const material = new THREE.MeshPhongMaterial({
    color: 0x3b82f6,
    specular: 0x111111,
    shininess: 200,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'model';
  scene.add(mesh);

  // Fit camera to model
  const box = new THREE.Box3().setFromObject(mesh);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

  camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
});

const getStatusMessage = () => {
  switch (props.previewState) {
    case 'idle':
      return 'Ready to generate';
    case 'pending':
      return 'Parameters changed - click Generate to update';
    case 'rendering':
      return 'Rendering...';
    case 'current':
      return 'Preview up to date';
    case 'error':
      return `Error: ${props.error}`;
    default:
      return '';
  }
};
</script>

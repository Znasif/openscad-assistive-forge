<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

  export let stlData = null;
  export let previewState = 'idle';
  export let error = null;

  const dispatch = createEventDispatcher();

  let containerRef;
  let scene;
  let renderer;
  let camera;
  let controls;
  let animationId;

  // Initialize Three.js scene
  onMount(() => {
    if (!containerRef) return;

    const container = containerRef;
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
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  // Cleanup
  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
  });

  // Load STL data when it changes
  $: if (stlData && scene) {
    // Remove previous model
    const previousModel = scene.getObjectByName('model');
    if (previousModel) {
      scene.remove(previousModel);
    }

    // Load new model
    const loader = new STLLoader();
    const geometry = loader.parse(stlData);
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
  }

  function getStatusMessage() {
    switch (previewState) {
      case 'idle':
        return 'Ready to generate';
      case 'pending':
        return 'Parameters changed - click Generate to update';
      case 'rendering':
        return 'Rendering...';
      case 'current':
        return 'Preview up to date';
      case 'error':
        return `Error: ${error}`;
      default:
        return '';
    }
  }
</script>

<section class="preview-panel">
  <div class="preview-header">
    <h2>Preview</h2>
    <span class="status-badge status-{previewState}">
      {getStatusMessage()}
    </span>
  </div>

  <div bind:this={containerRef} class="preview-container"></div>

  <div class="preview-actions">
    <button
      on:click={() => dispatch('render')}
      class="button button-primary"
      disabled={previewState === 'rendering'}
    >
      {previewState === 'rendering' ? 'Generating...' : 'Generate STL'}
    </button>
    
    <button
      on:click={() => dispatch('download')}
      class="button button-secondary"
      disabled={!stlData || previewState === 'rendering'}
    >
      Download STL
    </button>
  </div>

  {#if error && previewState === 'error'}
    <div class="error-message" role="alert">
      <strong>Error:</strong> {error}
    </div>
  {/if}
</section>

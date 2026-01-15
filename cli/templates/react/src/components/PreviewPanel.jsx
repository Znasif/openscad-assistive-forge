/**
 * Preview Panel Component
 * @license GPL-3.0-or-later
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function PreviewPanel({ stlData, previewState, error, onRender, onDownload }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

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
      requestAnimationFrame(animate);
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

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Load STL data
  useEffect(() => {
    if (!stlData || !sceneRef.current) return;

    const scene = sceneRef.current;

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
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

    cameraRef.current.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
    cameraRef.current.lookAt(center);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, [stlData]);

  const getStatusMessage = () => {
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
  };

  return (
    <section className="preview-panel">
      <div className="preview-header">
        <h2>Preview</h2>
        <span className={`status-badge status-${previewState}`}>
          {getStatusMessage()}
        </span>
      </div>

      <div ref={containerRef} className="preview-container"></div>

      <div className="preview-actions">
        <button
          onClick={onRender}
          className="button button-primary"
          disabled={previewState === 'rendering'}
        >
          {previewState === 'rendering' ? 'Generating...' : 'Generate STL'}
        </button>
        
        <button
          onClick={onDownload}
          className="button button-secondary"
          disabled={!stlData || previewState === 'rendering'}
        >
          Download STL
        </button>
      </div>

      {error && previewState === 'error' && (
        <div className="error-message" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}
    </section>
  );
}

export default PreviewPanel;

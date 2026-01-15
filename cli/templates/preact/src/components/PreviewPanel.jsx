/**
 * Preview Panel Component
 * @license GPL-3.0-or-later
 */

import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export function PreviewPanel({ 
  stlData, 
  isRendering, 
  progress, 
  error, 
  format,
  onRender, 
  onDownload,
  onFormatChange 
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);
  
  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(50, 50, 50);
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
    controlsRef.current = controls;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);
  
  // Load STL when data changes
  useEffect(() => {
    if (!stlData || !sceneRef.current) return;
    
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    // Remove old mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
    }
    
    // Load STL
    const loader = new STLLoader();
    const geometry = loader.parse(stlData);
    geometry.center();
    geometry.computeBoundingBox();
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      specular: 0x111111,
      shininess: 200
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;
    
    // Fit camera to model
    if (geometry.boundingBox && camera) {
      const box = geometry.boundingBox;
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
      camera.lookAt(0, 0, 0);
      controls?.update();
    }
  }, [stlData]);
  
  return (
    <section style={styles.panel}>
      <div ref={containerRef} style={styles.container}>
        {!stlData && !isRendering && (
          <div style={styles.placeholder}>
            <p>Generate a render to see preview</p>
          </div>
        )}
        
        {isRendering && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <p>Rendering... {progress}%</p>
          </div>
        )}
        
        {error && (
          <div style={styles.errorMessage}>
            <p>{error}</p>
            <button class="btn secondary" onClick={onRender}>Retry</button>
          </div>
        )}
      </div>
      
      <div style={styles.controls}>
        <div style={styles.formatSelect}>
          <label for="format">Format:</label>
          <select 
            id="format" 
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            style={styles.select}
          >
            <option value="stl">STL</option>
            <option value="off">OFF</option>
            <option value="3mf">3MF</option>
          </select>
        </div>
        
        <div style={styles.actionButtons}>
          <button 
            class="btn primary"
            onClick={onRender}
            disabled={isRendering}
          >
            {isRendering ? 'Rendering...' : 'Generate'}
          </button>
          
          <button
            class="btn secondary"
            onClick={onDownload}
            disabled={!stlData || isRendering}
          >
            Download
          </button>
        </div>
      </div>
    </section>
  );
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  container: {
    position: 'relative',
    aspectRatio: '4 / 3',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  placeholder: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)'
  },
  loadingOverlay: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    gap: '1rem',
    zIndex: '10'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorMessage: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
    gap: '1rem'
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  formatSelect: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  select: {
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.75rem'
  }
};

/**
 * Preview Panel Component
 * @license GPL-3.0-or-later
 */

import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="preview-panel">
      <div class="preview-container" #previewContainer>
        <div class="preview-placeholder" *ngIf="!stlData && !isRendering">
          <p>Generate a render to see preview</p>
        </div>
        
        <div class="loading-overlay" *ngIf="isRendering">
          <div class="spinner"></div>
          <p>Rendering... {{ progress }}%</p>
        </div>
        
        <div class="error-message" *ngIf="error">
          <p>{{ error }}</p>
          <button (click)="render.emit()">Retry</button>
        </div>
      </div>
      
      <div class="controls">
        <div class="format-select">
          <label for="format">Format:</label>
          <select 
            id="format" 
            [ngModel]="format"
            (ngModelChange)="formatChange.emit($event)"
          >
            <option value="stl">STL</option>
            <option value="off">OFF</option>
            <option value="3mf">3MF</option>
          </select>
        </div>
        
        <div class="action-buttons">
          <button 
            class="btn primary"
            (click)="render.emit()"
            [disabled]="isRendering"
          >
            {{ isRendering ? 'Rendering...' : 'Generate' }}
          </button>
          
          <button
            class="btn secondary"
            (click)="download.emit()"
            [disabled]="!stlData || isRendering"
          >
            Download
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .preview-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .preview-container {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--bg-secondary, #f8f9fa);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .preview-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary, #666);
    }
    
    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      gap: 1rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error-message {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(220, 38, 38, 0.1);
      color: #dc2626;
      gap: 1rem;
    }
    
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    
    .format-select {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .format-select select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
    }
    
    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s, opacity 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn.primary {
      background: var(--accent-color, #2563eb);
      color: white;
    }
    
    .btn.primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    
    .btn.secondary {
      background: var(--bg-secondary, #f8f9fa);
      color: var(--text-primary, #333);
      border: 1px solid var(--border-color, #e0e0e0);
    }
    
    .btn.secondary:hover:not(:disabled) {
      background: var(--border-color, #e0e0e0);
    }
    
    .btn:focus-visible {
      outline: 2px solid var(--accent-color, #2563eb);
      outline-offset: 2px;
    }
  `]
})
export class PreviewPanelComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('previewContainer') containerRef!: ElementRef<HTMLDivElement>;
  
  @Input() stlData: ArrayBuffer | null = null;
  @Input() isRendering = false;
  @Input() progress = 0;
  @Input() error: string | null = null;
  @Input() format: 'stl' | 'off' | '3mf' = 'stl';
  
  @Output() render = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() formatChange = new EventEmitter<'stl' | 'off' | '3mf'>();
  
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private mesh: THREE.Mesh | null = null;
  private animationId: number | null = null;
  
  ngAfterViewInit() {
    this.initThree();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['stlData'] && this.stlData) {
      this.loadModel();
    }
  }
  
  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer?.dispose();
  }
  
  private initThree() {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(50, 50, 50);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-1, -1, -1);
    this.scene.add(backLight);
    
    // Animation loop
    this.animate();
    
    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls?.update();
    if (this.scene && this.camera) {
      this.renderer?.render(this.scene, this.camera);
    }
  }
  
  private handleResize() {
    const container = this.containerRef?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  private loadModel() {
    if (!this.stlData || !this.scene) return;
    
    // Remove old mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    
    // Load STL
    const loader = new STLLoader();
    const geometry = loader.parse(this.stlData);
    geometry.center();
    geometry.computeBoundingBox();
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      specular: 0x111111,
      shininess: 200
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    
    // Fit camera to model
    if (geometry.boundingBox && this.camera) {
      const box = geometry.boundingBox;
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      this.camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
      this.camera.lookAt(0, 0, 0);
      this.controls?.update();
    }
  }
}

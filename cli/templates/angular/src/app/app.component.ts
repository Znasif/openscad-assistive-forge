/**
 * Root Application Component
 * @license GPL-3.0-or-later
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header.component';
import { ParametersPanelComponent } from './components/parameters-panel.component';
import { PreviewPanelComponent } from './components/preview-panel.component';
import { OpenScadService } from './services/openscad.service';

interface ParamSchema {
  title?: string;
  description?: string;
  properties?: Record<string, any>;
  'x-groups'?: Array<{ name: string; parameters: string[] }>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ParametersPanelComponent, PreviewPanelComponent],
  template: `
    <div class="app" [class.dark]="darkMode()">
      <app-header 
        [title]="schema()?.title || 'OpenSCAD Customizer'"
        [description]="schema()?.description"
        [darkMode]="darkMode()"
        (toggleDarkMode)="toggleDarkMode()"
        (resetParameters)="resetParameters()"
      />
      
      <main class="main-layout">
        <app-parameters-panel
          [schema]="schema()"
          [parameters]="parameters()"
          (parameterChange)="updateParameter($event)"
        />
        
        <app-preview-panel
          [stlData]="stlData()"
          [isRendering]="isRendering()"
          [progress]="progress()"
          [error]="error()"
          [format]="outputFormat()"
          (render)="handleRender()"
          (download)="handleDownload()"
          (formatChange)="outputFormat.set($event)"
        />
      </main>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: background-color 0.3s, color 0.3s;
    }
    
    .app.dark {
      --bg-primary: #1a1a2e;
      --bg-secondary: #16213e;
      --text-primary: #eee;
      --text-secondary: #aaa;
      --border-color: #333;
      --accent-color: #4dabf7;
    }
    
    .main-layout {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 1rem;
      padding: 1rem;
      max-width: 1600px;
      margin: 0 auto;
    }
    
    @media (max-width: 768px) {
      .main-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  // Signals for reactive state
  schema = signal<ParamSchema | null>(null);
  parameters = signal<Record<string, any>>({});
  stlData = signal<ArrayBuffer | null>(null);
  isRendering = signal(false);
  progress = signal(0);
  error = signal<string | null>(null);
  darkMode = signal(false);
  outputFormat = signal<'stl' | 'off' | '3mf'>('stl');
  
  private openscadService = new OpenScadService();
  private scadContent = '';
  
  constructor() {
    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('theme');
      this.darkMode.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }
  }
  
  ngOnInit() {
    this.loadEmbeddedData();
    this.loadFromUrl();
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.loadFromUrl());
  }
  
  private loadEmbeddedData() {
    try {
      const schemaEl = document.getElementById('param-schema');
      if (schemaEl) {
        const schema = JSON.parse(schemaEl.textContent || '{}');
        this.schema.set(schema);
        
        // Initialize parameters with defaults
        const params: Record<string, any> = {};
        if (schema.properties) {
          for (const [key, prop] of Object.entries(schema.properties)) {
            params[key] = (prop as any).default;
          }
        }
        this.parameters.set(params);
      }
      
      const scadEl = document.getElementById('scad-source');
      if (scadEl) {
        this.scadContent = scadEl.textContent || '';
      }
    } catch (err) {
      console.error('Failed to load embedded data:', err);
    }
  }
  
  private loadFromUrl() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    
    try {
      const urlParams = JSON.parse(decodeURIComponent(hash));
      this.parameters.update(current => ({ ...current, ...urlParams }));
    } catch {
      // Ignore invalid hash
    }
  }
  
  private updateUrl() {
    const params = this.parameters();
    const hash = encodeURIComponent(JSON.stringify(params));
    window.history.replaceState(null, '', `#${hash}`);
  }
  
  updateParameter(event: { name: string; value: any }) {
    this.parameters.update(params => ({
      ...params,
      [event.name]: event.value
    }));
    this.updateUrl();
  }
  
  toggleDarkMode() {
    this.darkMode.update(v => !v);
    localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
  }
  
  resetParameters() {
    const schema = this.schema();
    if (schema?.properties) {
      const defaults: Record<string, any> = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        defaults[key] = (prop as any).default;
      }
      this.parameters.set(defaults);
      this.updateUrl();
    }
  }
  
  async handleRender() {
    if (this.isRendering()) return;
    
    this.isRendering.set(true);
    this.progress.set(0);
    this.error.set(null);
    
    try {
      const result = await this.openscadService.render(
        this.scadContent,
        this.parameters(),
        this.outputFormat(),
        (p) => this.progress.set(p)
      );
      this.stlData.set(result);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.isRendering.set(false);
    }
  }
  
  handleDownload() {
    const data = this.stlData();
    if (!data) return;
    
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model.${this.outputFormat()}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

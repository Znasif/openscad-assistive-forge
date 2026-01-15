/**
 * OpenSCAD WASM Service
 * @license GPL-3.0-or-later
 */

export class OpenScadService {
  private worker: Worker | null = null;
  private pendingResolve: ((value: ArrayBuffer) => void) | null = null;
  private pendingReject: ((reason: Error) => void) | null = null;
  private progressCallback: ((progress: number) => void) | null = null;
  
  constructor() {
    this.initWorker();
  }
  
  private initWorker() {
    this.worker = new Worker(
      new URL('../worker/openscad-worker.js', import.meta.url),
      { type: 'module' }
    );
    
    this.worker.onmessage = (event) => {
      const { type, data, error, progress } = event.data;
      
      switch (type) {
        case 'progress':
          if (this.progressCallback) {
            this.progressCallback(progress);
          }
          break;
        case 'complete':
          if (this.pendingResolve) {
            this.pendingResolve(data);
            this.cleanup();
          }
          break;
        case 'error':
          if (this.pendingReject) {
            this.pendingReject(new Error(error));
            this.cleanup();
          }
          break;
      }
    };
    
    this.worker.onerror = (error) => {
      if (this.pendingReject) {
        this.pendingReject(new Error(error.message));
        this.cleanup();
      }
    };
  }
  
  private cleanup() {
    this.pendingResolve = null;
    this.pendingReject = null;
    this.progressCallback = null;
  }
  
  async render(
    scadContent: string,
    parameters: Record<string, any>,
    format: 'stl' | 'off' | '3mf' = 'stl',
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }
      
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      this.progressCallback = onProgress || null;
      
      // Build parameter assignments
      let parameterizedContent = '';
      for (const [key, value] of Object.entries(parameters)) {
        if (typeof value === 'string') {
          parameterizedContent += `${key} = "${value}";\n`;
        } else if (typeof value === 'boolean') {
          parameterizedContent += `${key} = ${value ? 'true' : 'false'};\n`;
        } else {
          parameterizedContent += `${key} = ${value};\n`;
        }
      }
      parameterizedContent += scadContent;
      
      this.worker.postMessage({
        type: 'render',
        scadContent: parameterizedContent,
        format
      });
    });
  }
  
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

/**
 * OpenSCAD WASM Worker
 * @license GPL-3.0-or-later
 */

import OpenSCAD from 'openscad-wasm-prebuilt';

let instance = null;

async function initOpenSCAD() {
  if (!instance) {
    instance = await OpenSCAD({
      noInitialRun: true,
      print: (text) => console.log('[OpenSCAD]', text),
      printErr: (text) => console.error('[OpenSCAD]', text)
    });
  }
  return instance;
}

async function render(scadContent, format = 'stl') {
  const openscad = await initOpenSCAD();
  
  // Write source file
  openscad.FS.writeFile('/input.scad', scadContent);
  
  // Determine output file extension
  const outputFile = `/output.${format}`;
  
  // Run OpenSCAD
  const args = ['/input.scad', '-o', outputFile];
  
  self.postMessage({ type: 'progress', progress: 10 });
  
  try {
    openscad.callMain(args);
    
    self.postMessage({ type: 'progress', progress: 80 });
    
    // Read output
    const output = openscad.FS.readFile(outputFile);
    
    self.postMessage({ type: 'progress', progress: 100 });
    
    // Clean up
    openscad.FS.unlink('/input.scad');
    openscad.FS.unlink(outputFile);
    
    return output.buffer;
  } catch (error) {
    throw new Error(`OpenSCAD render failed: ${error.message}`);
  }
}

self.onmessage = async function(event) {
  const { type, scadContent, format } = event.data;
  
  if (type === 'render') {
    try {
      const result = await render(scadContent, format);
      self.postMessage({ type: 'complete', data: result }, [result]);
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};

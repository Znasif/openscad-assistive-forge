/**
 * OpenSCAD WASM Web Worker
 * @license GPL-3.0-or-later
 */

import { createOpenSCAD } from 'openscad-wasm-prebuilt';

// Worker state
let openscadInstance = null;
let initialized = false;
let currentRenderTimeout = null;
let mountedFiles = new Map(); // Track files in virtual filesystem

/**
 * Escape a string for use in a RegExp
 * @param {string} s
 * @returns {string}
 */
function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Initialize OpenSCAD WASM
 */
async function initWASM() {
  try {
    self.postMessage({
      type: 'PROGRESS',
      payload: { requestId: 'init', percent: 0, message: 'Loading OpenSCAD engine...' },
    });

    // Initialize OpenSCAD WASM
    openscadInstance = await createOpenSCAD();
    initialized = true;

    self.postMessage({
      type: 'READY',
    });

    console.log('[Worker] OpenSCAD WASM initialized successfully');
  } catch (error) {
    console.error('[Worker] Failed to initialize OpenSCAD:', error);
    self.postMessage({
      type: 'ERROR',
      payload: {
        requestId: 'init',
        code: 'INIT_FAILED',
        message: 'Failed to initialize OpenSCAD engine',
        details: error.message,
      },
    });
  }
}

/**
 * Mount files into OpenSCAD virtual filesystem
 * @param {Map<string, string>} files - Map of file paths to content
 * @returns {Promise<void>}
 */
async function mountFiles(files) {
  if (!openscadInstance || !openscadInstance.FS) {
    throw new Error('OpenSCAD filesystem not available');
  }
  
  const FS = openscadInstance.FS;
  
  // Create directory structure
  const directories = new Set();
  
  for (const filePath of files.keys()) {
    // Extract all directory components
    const parts = filePath.split('/');
    let currentPath = '';
    
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      directories.add(currentPath);
    }
  }
  
  // Create directories
  for (const dir of Array.from(directories).sort()) {
    try {
      FS.mkdir(dir);
      console.log(`[Worker FS] Created directory: ${dir}`);
    } catch (error) {
      // Directory may already exist, ignore
      if (error.code !== 'EEXIST') {
        console.warn(`[Worker FS] Failed to create directory ${dir}:`, error.message);
      }
    }
  }
  
  // Write files
  for (const [filePath, content] of files.entries()) {
    try {
      FS.writeFile(filePath, content);
      mountedFiles.set(filePath, content);
      console.log(`[Worker FS] Mounted file: ${filePath} (${content.length} bytes)`);
    } catch (error) {
      console.error(`[Worker FS] Failed to mount file ${filePath}:`, error);
      throw new Error(`Failed to mount file: ${filePath}`);
    }
  }
  
  console.log(`[Worker FS] Successfully mounted ${files.size} files`);
}

/**
 * Clear all mounted files from virtual filesystem
 */
function clearMountedFiles() {
  if (!openscadInstance || !openscadInstance.FS) {
    mountedFiles.clear();
    return;
  }
  
  const FS = openscadInstance.FS;
  
  for (const filePath of mountedFiles.keys()) {
    try {
      FS.unlink(filePath);
    } catch (error) {
      // File may already be deleted, ignore
    }
  }
  
  mountedFiles.clear();
  console.log('[Worker FS] Cleared all mounted files');
}

/**
 * Convert parameters to OpenSCAD variable assignments
 * @param {Object} parameters - Parameter key-value pairs
 * @returns {string} OpenSCAD variable assignments
 */
function parametersToScad(parameters) {
  if (!parameters || Object.keys(parameters).length === 0) {
    return '';
  }

  const assignments = Object.entries(parameters).map(([key, value]) => {
    // Handle different value types
    if (typeof value === 'string') {
      // Escape quotes in strings
      const escaped = value.replace(/"/g, '\\"');
      return `${key} = "${escaped}";`;
    } else if (typeof value === 'number') {
      return `${key} = ${value};`;
    } else if (typeof value === 'boolean') {
      return `${key} = ${value};`;
    } else {
      return `${key} = ${JSON.stringify(value)};`;
    }
  });

  return assignments.join('\n') + '\n\n';
}

/**
 * Apply parameter overrides by replacing existing assignments when possible.
 * This avoids the "assigned but overwritten" issue when prepending overrides.
 *
 * @param {string} scadContent
 * @param {Object} parameters
 * @returns {{scad: string, replacedKeys: string[], prependedKeys: string[]}}
 */
function applyOverrides(scadContent, parameters) {
  if (!parameters || Object.keys(parameters).length === 0) {
    return { scad: scadContent, replacedKeys: [], prependedKeys: [] };
  }

  let updated = scadContent;
  const replacedKeys = [];
  const prependedKeys = [];

  const formatValue = (value) => {
    if (typeof value === 'string') {
      const escaped = value.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return JSON.stringify(value);
  };

  for (const [key, value] of Object.entries(parameters)) {
    const keyRe = escapeRegExp(key);
    const assignmentValue = formatValue(value);
    const lineRe = new RegExp(
      `^(\\s*)(${keyRe})\\s*=\\s*[^;]*;([ \\t]*\\/\\/.*)?$`,
      'm'
    );

    if (lineRe.test(updated)) {
      updated = updated.replace(lineRe, `$1$2 = ${assignmentValue};$3`);
      replacedKeys.push(key);
    } else {
      prependedKeys.push(key);
    }
  }

  if (prependedKeys.length > 0) {
    const prependParams = {};
    for (const k of prependedKeys) prependParams[k] = parameters[k];
    updated = parametersToScad(prependParams) + updated;
  }

  return { scad: updated, replacedKeys, prependedKeys };
}

/**
 * Supported output formats
 */
const OUTPUT_FORMATS = {
  STL: 'stl',
  OBJ: 'obj',
  OFF: 'off',
  AMF: 'amf',
  '3MF': '3mf',
};

/**
 * Render using export method (fallback for formats without dedicated renderTo* methods)
 * @param {string} scadContent - OpenSCAD source code
 * @param {string} format - Output format (obj, off, amf, 3mf)
 * @returns {Promise<string|ArrayBuffer>} Rendered data
 */
async function renderWithExport(scadContent, format) {
  // This is a fallback approach if OpenSCAD WASM doesn't have format-specific methods
  // We'll try using the file system approach: write .scad, export to format
  
  const inputFile = '/tmp/input.scad';
  const outputFile = `/tmp/output.${format}`;
  
  try {
    // Write input file
    openscadInstance.FS.writeFile(inputFile, scadContent);
    
    // Execute OpenSCAD export command
    // This assumes OpenSCAD WASM supports command-line style operations
    await openscadInstance.callMain(['-o', outputFile, inputFile]);
    
    // Read output file
    const outputData = openscadInstance.FS.readFile(outputFile);
    
    // Clean up
    openscadInstance.FS.unlink(inputFile);
    openscadInstance.FS.unlink(outputFile);
    
    return outputData;
  } catch (error) {
    console.error(`[Worker] Export to ${format} failed:`, error);
    throw new Error(`Export to ${format.toUpperCase()} format not supported by OpenSCAD WASM`);
  }
}

/**
 * Render OpenSCAD to specified format
 */
async function render(payload) {
  const { requestId, scadContent, parameters, timeoutMs, files, mainFile, outputFormat = 'stl' } = payload;

  try {
    self.postMessage({
      type: 'PROGRESS',
      payload: { requestId, percent: 10, message: 'Preparing model...' },
    });

    // Mount additional files if provided (for multi-file projects)
    if (files && Object.keys(files).length > 0) {
      // Convert files object to Map
      const filesMap = new Map(Object.entries(files));
      
      self.postMessage({
        type: 'PROGRESS',
        payload: { requestId, percent: 15, message: `Mounting ${filesMap.size} files...` },
      });
      
      await mountFiles(filesMap);
      
      self.postMessage({
        type: 'PROGRESS',
        payload: { requestId, percent: 20, message: 'Files mounted successfully' },
      });
    }

    // Apply parameter overrides (replace-in-file when possible)
    const applied = applyOverrides(scadContent, parameters);
    const fullScadContent = applied.scad;

    console.log('[Worker] Rendering with parameters:', parameters);

    self.postMessage({
      type: 'PROGRESS',
      payload: { requestId, percent: 30, message: 'Compiling OpenSCAD...' },
    });

    // Set up timeout
    const timeoutPromise = new Promise((_, reject) => {
      currentRenderTimeout = setTimeout(() => {
        reject(new Error('Render timeout exceeded'));
      }, timeoutMs || 60000);
    });

    // Determine the format to render
    const format = (outputFormat || 'stl').toLowerCase();
    const formatName = format.toUpperCase();
    
    // Render to specified format
    const renderPromise = (async () => {
      // Note: render methods are blocking calls - we can't get intermediate progress
      // Use indeterminate progress messaging
      self.postMessage({
        type: 'PROGRESS',
        payload: { requestId, percent: -1, message: `Rendering model to ${formatName} (this may take a while)...` },
      });

      let outputData;
      
      // Call appropriate render method based on format
      // OpenSCAD WASM may support: renderToStl, renderToObj, renderToOff, renderToAmf, renderTo3mf
      switch (format) {
        case 'stl':
          outputData = await openscadInstance.renderToStl(fullScadContent);
          break;
        case 'obj':
          // Try renderToObj method if available
          if (typeof openscadInstance.renderToObj === 'function') {
            outputData = await openscadInstance.renderToObj(fullScadContent);
          } else {
            // Fallback: use writeFile approach
            outputData = await renderWithExport(fullScadContent, 'obj');
          }
          break;
        case 'off':
          if (typeof openscadInstance.renderToOff === 'function') {
            outputData = await openscadInstance.renderToOff(fullScadContent);
          } else {
            outputData = await renderWithExport(fullScadContent, 'off');
          }
          break;
        case 'amf':
          if (typeof openscadInstance.renderToAmf === 'function') {
            outputData = await openscadInstance.renderToAmf(fullScadContent);
          } else {
            outputData = await renderWithExport(fullScadContent, 'amf');
          }
          break;
        case '3mf':
          if (typeof openscadInstance.renderTo3mf === 'function') {
            outputData = await openscadInstance.renderTo3mf(fullScadContent);
          } else {
            outputData = await renderWithExport(fullScadContent, '3mf');
          }
          break;
        default:
          throw new Error(`Unsupported output format: ${format}`);
      }

      self.postMessage({
        type: 'PROGRESS',
        payload: { requestId, percent: 95, message: `Processing ${formatName} output...` },
      });

      return { data: outputData, format };
    })();

    // Race between render and timeout
    const result = await Promise.race([renderPromise, timeoutPromise]);
    const { data: outputData, format: resultFormat } = result;

    // Clear timeout
    if (currentRenderTimeout) {
      clearTimeout(currentRenderTimeout);
      currentRenderTimeout = null;
    }

    // Convert output data to ArrayBuffer
    let outputBuffer;
    let triangleCount = 0;
    let isTextFormat = false;

    if (outputData instanceof ArrayBuffer) {
      outputBuffer = outputData;
    } else if (typeof outputData === 'string') {
      // Text format (ASCII STL, OBJ, OFF, etc.)
      isTextFormat = true;
      const encoder = new TextEncoder();
      outputBuffer = encoder.encode(outputData).buffer;
      
      // Count triangles for mesh formats
      if (resultFormat === 'stl') {
        triangleCount = (outputData.match(/facet normal/g) || []).length;
      } else if (resultFormat === 'obj') {
        triangleCount = (outputData.match(/^f /gm) || []).length;
      } else if (resultFormat === 'off') {
        // OFF format has triangle count in header
        const match = outputData.match(/^OFF\s+\d+\s+(\d+)/);
        if (match) triangleCount = parseInt(match[1]);
      }
    } else if (outputData instanceof Uint8Array) {
      outputBuffer = outputData.buffer;
    } else {
      throw new Error(`Unknown ${resultFormat.toUpperCase()} data format`);
    }

    // For binary STL, read triangle count from header
    if (resultFormat === 'stl' && !isTextFormat && outputBuffer.byteLength > 84) {
      const view = new DataView(outputBuffer);
      triangleCount = view.getUint32(80, true);
    }

    self.postMessage({
      type: 'COMPLETE',
      payload: {
        requestId,
        data: outputBuffer,
        format: resultFormat,
        stats: {
          triangles: triangleCount,
          size: outputBuffer.byteLength,
        },
      },
    }, [outputBuffer]); // Transfer ownership of ArrayBuffer

    console.log('[Worker] Render complete:', triangleCount, 'triangles');
  } catch (error) {
    // Clear timeout on error
    if (currentRenderTimeout) {
      clearTimeout(currentRenderTimeout);
      currentRenderTimeout = null;
    }

    console.error('[Worker] Render failed:', error);

    // Handle both Error objects and raw error codes
    const errorMessage = error?.message || String(error);
    const isTimeout = errorMessage.includes('timeout');
    self.postMessage({
      type: 'ERROR',
      payload: {
        requestId,
        code: isTimeout ? 'TIMEOUT' : 'RENDER_FAILED',
        message: isTimeout 
          ? 'Render exceeded time limit. Try simplifying the model or reducing $fn value.'
          : 'Failed to render model: ' + errorMessage,
        details: error?.stack || String(error),
      },
    });
  }
}

/**
 * Cancel current render
 */
function cancelRender(requestId) {
  if (currentRenderTimeout) {
    clearTimeout(currentRenderTimeout);
    currentRenderTimeout = null;
    
    self.postMessage({
      type: 'ERROR',
      payload: {
        requestId,
        code: 'CANCELLED',
        message: 'Render cancelled by user',
      },
    });
  }
}

// Message handler
self.onmessage = async (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      await initWASM();
      break;

    case 'RENDER':
      if (!initialized) {
        self.postMessage({
          type: 'ERROR',
          payload: {
            requestId: payload.requestId,
            code: 'RENDER_FAILED',
            message: 'Worker not initialized. Please wait for initialization to complete.',
          },
        });
        return;
      }
      await render(payload);
      break;

    case 'CANCEL':
      cancelRender(payload.requestId);
      break;

    case 'MOUNT_FILES':
      try {
        await mountFiles(payload.files);
        self.postMessage({
          type: 'FILES_MOUNTED',
          payload: { success: true, count: payload.files.size },
        });
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          payload: {
            requestId: 'mount',
            code: 'MOUNT_FAILED',
            message: 'Failed to mount files: ' + error.message,
          },
        });
      }
      break;

    case 'CLEAR_FILES':
      clearMountedFiles();
      self.postMessage({
        type: 'FILES_CLEARED',
        payload: { success: true },
      });
      break;

    default:
      console.warn('[Worker] Unknown message type:', type);
  }
};

/**
 * Main App Component
 * @license GPL-3.0-or-later
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { Header } from './components/Header';
import { ParametersPanel } from './components/ParametersPanel';
import { PreviewPanel } from './components/PreviewPanel';

export function App() {
  const [schema, setSchema] = useState(null);
  const [parameters, setParameters] = useState({});
  const [scadContent, setScadContent] = useState('');
  const [stlData, setStlData] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState('stl');
  const [worker, setWorker] = useState(null);
  
  // Initialize dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);
  
  // Load embedded data
  useEffect(() => {
    try {
      const schemaEl = document.getElementById('param-schema');
      if (schemaEl) {
        const schemaData = JSON.parse(schemaEl.textContent);
        setSchema(schemaData);
        
        // Initialize parameters with defaults
        const params = {};
        if (schemaData.properties) {
          for (const [key, prop] of Object.entries(schemaData.properties)) {
            params[key] = prop.default;
          }
        }
        setParameters(params);
      }
      
      const scadEl = document.getElementById('scad-source');
      if (scadEl) {
        setScadContent(scadEl.textContent);
      }
    } catch (err) {
      console.error('Failed to load embedded data:', err);
    }
  }, []);
  
  // Load from URL hash
  useEffect(() => {
    const loadFromUrl = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      
      try {
        const urlParams = JSON.parse(decodeURIComponent(hash));
        setParameters(prev => ({ ...prev, ...urlParams }));
      } catch {
        // Ignore invalid hash
      }
    };
    
    loadFromUrl();
    window.addEventListener('hashchange', loadFromUrl);
    return () => window.removeEventListener('hashchange', loadFromUrl);
  }, []);
  
  // Initialize worker
  useEffect(() => {
    const w = new Worker(
      new URL('./worker/openscad-worker.js', import.meta.url),
      { type: 'module' }
    );
    
    w.onmessage = (event) => {
      const { type, data, error, progress } = event.data;
      
      switch (type) {
        case 'progress':
          setProgress(progress);
          break;
        case 'complete':
          setStlData(data);
          setIsRendering(false);
          break;
        case 'error':
          setError(error);
          setIsRendering(false);
          break;
      }
    };
    
    setWorker(w);
    return () => w.terminate();
  }, []);
  
  // Update URL when parameters change
  useEffect(() => {
    const hash = encodeURIComponent(JSON.stringify(parameters));
    window.history.replaceState(null, '', `#${hash}`);
  }, [parameters]);
  
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  }, []);
  
  const resetParameters = useCallback(() => {
    if (schema?.properties) {
      const defaults = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        defaults[key] = prop.default;
      }
      setParameters(defaults);
    }
  }, [schema]);
  
  const updateParameter = useCallback((name, value) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleRender = useCallback(() => {
    if (!worker || isRendering) return;
    
    setIsRendering(true);
    setProgress(0);
    setError(null);
    
    // Build parameterized content
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
    
    worker.postMessage({
      type: 'render',
      scadContent: parameterizedContent,
      format: outputFormat
    });
  }, [worker, isRendering, parameters, scadContent, outputFormat]);
  
  const handleDownload = useCallback(() => {
    if (!stlData) return;
    
    const blob = new Blob([stlData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [stlData, outputFormat]);
  
  return (
    <div class={`app ${darkMode ? 'dark' : ''}`}>
      <Header
        title={schema?.title || 'OpenSCAD Customizer'}
        description={schema?.description}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onResetParameters={resetParameters}
      />
      
      <main class="main-layout">
        <ParametersPanel
          schema={schema}
          parameters={parameters}
          onParameterChange={updateParameter}
        />
        
        <PreviewPanel
          stlData={stlData}
          isRendering={isRendering}
          progress={progress}
          error={error}
          format={outputFormat}
          onRender={handleRender}
          onDownload={handleDownload}
          onFormatChange={setOutputFormat}
        />
      </main>
    </div>
  );
}

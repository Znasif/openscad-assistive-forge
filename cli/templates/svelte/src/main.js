/**
 * OpenSCAD Customizer - Svelte Entry Point
 * @license GPL-3.0-or-later
 */

import './app.css';
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app'),
});

export default app;

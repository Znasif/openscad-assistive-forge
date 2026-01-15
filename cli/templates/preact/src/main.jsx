/**
 * Preact Entry Point
 * @license GPL-3.0-or-later
 */

import { render } from 'preact';
import { App } from './App';
import './app.css';

render(<App />, document.getElementById('app'));

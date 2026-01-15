/**
 * Header Component
 * @license GPL-3.0-or-later
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <h1>{{ title }}</h1>
          <p *ngIf="description">{{ description }}</p>
        </div>
        
        <div class="header-actions">
          <button 
            class="icon-btn" 
            (click)="resetParameters.emit()"
            title="Reset to defaults"
            aria-label="Reset parameters to defaults"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          
          <button 
            class="icon-btn"
            (click)="toggleDarkMode.emit()"
            [title]="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            [attr.aria-label]="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg *ngIf="!darkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg *ngIf="darkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--bg-secondary, #f8f9fa);
      border-bottom: 1px solid var(--border-color, #e0e0e0);
      padding: 1rem;
    }
    
    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-title h1 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-primary, #333);
    }
    
    .header-title p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }
    
    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-secondary, #666);
      transition: background-color 0.2s, color 0.2s;
    }
    
    .icon-btn:hover {
      background: var(--bg-hover, rgba(0, 0, 0, 0.05));
      color: var(--text-primary, #333);
    }
    
    .icon-btn:focus-visible {
      outline: 2px solid var(--accent-color, #2563eb);
      outline-offset: 2px;
    }
  `]
})
export class HeaderComponent {
  @Input() title = 'OpenSCAD Customizer';
  @Input() description?: string;
  @Input() darkMode = false;
  
  @Output() toggleDarkMode = new EventEmitter<void>();
  @Output() resetParameters = new EventEmitter<void>();
}

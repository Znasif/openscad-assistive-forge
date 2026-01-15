/**
 * Parameter Control Component
 * @license GPL-3.0-or-later
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parameter-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="param-control">
      <label [for]="name">
        <span class="param-name">{{ schema?.title || name }}</span>
        <span class="param-hint" *ngIf="schema?.description">{{ schema.description }}</span>
      </label>
      
      <!-- Range slider -->
      <div class="input-row" *ngIf="isRange()">
        <input
          type="range"
          [id]="name"
          [min]="schema.minimum"
          [max]="schema.maximum"
          [step]="schema['x-step'] || 1"
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
        />
        <input
          type="number"
          class="range-value"
          [min]="schema.minimum"
          [max]="schema.maximum"
          [step]="schema['x-step'] || 1"
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
          [attr.aria-label]="name + ' value'"
        />
      </div>
      
      <!-- Enum/Select -->
      <select
        *ngIf="isEnum()"
        [id]="name"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
      >
        <option *ngFor="let opt of schema.enum" [value]="opt">{{ opt }}</option>
      </select>
      
      <!-- Boolean toggle -->
      <div class="toggle-wrapper" *ngIf="isBoolean()">
        <input
          type="checkbox"
          [id]="name"
          [ngModel]="getBoolValue()"
          (ngModelChange)="setBoolValue($event)"
        />
        <span class="toggle-label">{{ getBoolValue() ? 'Yes' : 'No' }}</span>
      </div>
      
      <!-- Color picker -->
      <div class="input-row" *ngIf="isColor()">
        <input
          type="color"
          [id]="name"
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
        />
        <input
          type="text"
          class="color-value"
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
          pattern="^#[0-9A-Fa-f]{6}$"
          [attr.aria-label]="name + ' hex value'"
        />
      </div>
      
      <!-- Number input -->
      <input
        *ngIf="isNumber()"
        type="number"
        [id]="name"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
        [step]="schema['x-step'] || 1"
      />
      
      <!-- Text input -->
      <input
        *ngIf="isText()"
        type="text"
        [id]="name"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
        [maxlength]="schema.maxLength"
      />
    </div>
  `,
  styles: [`
    .param-control {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    
    .param-name {
      font-weight: 500;
      color: var(--text-primary, #333);
    }
    
    .param-hint {
      font-size: 0.75rem;
      color: var(--text-secondary, #666);
    }
    
    .input-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    
    input[type="range"] {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      background: var(--border-color, #e0e0e0);
      border-radius: 3px;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--accent-color, #2563eb);
      border-radius: 50%;
      cursor: pointer;
    }
    
    .range-value {
      width: 70px;
      padding: 0.375rem 0.5rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 6px;
      font-size: 0.875rem;
      text-align: right;
    }
    
    select,
    input[type="number"],
    input[type="text"] {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      font-size: 0.875rem;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
    }
    
    select:focus,
    input:focus {
      outline: none;
      border-color: var(--accent-color, #2563eb);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    input[type="checkbox"] {
      width: 44px;
      height: 24px;
      -webkit-appearance: none;
      appearance: none;
      background: var(--border-color, #e0e0e0);
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    input[type="checkbox"]::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }
    
    input[type="checkbox"]:checked {
      background: var(--accent-color, #2563eb);
    }
    
    input[type="checkbox"]:checked::before {
      transform: translateX(20px);
    }
    
    .toggle-label {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }
    
    input[type="color"] {
      width: 44px;
      height: 44px;
      padding: 2px;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      cursor: pointer;
    }
    
    .color-value {
      flex: 1;
      font-family: monospace;
    }
  `]
})
export class ParameterControlComponent {
  @Input() name = '';
  @Input() schema: any = {};
  @Input() value: any;
  
  @Output() valueChange = new EventEmitter<any>();
  
  isRange(): boolean {
    return this.schema?.type === 'number' && 
           this.schema?.minimum !== undefined && 
           this.schema?.maximum !== undefined &&
           !this.isColor();
  }
  
  isEnum(): boolean {
    return Array.isArray(this.schema?.enum) && !this.isBoolean();
  }
  
  isBoolean(): boolean {
    return this.schema?.type === 'boolean' ||
           (Array.isArray(this.schema?.enum) && 
            this.schema.enum.length === 2 &&
            this.schema.enum.every((v: any) => typeof v === 'string' && ['yes', 'no', 'true', 'false'].includes(v.toLowerCase())));
  }
  
  isColor(): boolean {
    return this.schema?.['x-hint'] === 'color' ||
           (this.schema?.type === 'string' && /^#[0-9A-Fa-f]{6}$/.test(this.value));
  }
  
  isNumber(): boolean {
    return this.schema?.type === 'number' && !this.isRange() && !this.isColor();
  }
  
  isText(): boolean {
    return this.schema?.type === 'string' && !this.isEnum() && !this.isColor();
  }
  
  getBoolValue(): boolean {
    if (typeof this.value === 'boolean') return this.value;
    if (typeof this.value === 'string') {
      return ['yes', 'true'].includes(this.value.toLowerCase());
    }
    return false;
  }
  
  setBoolValue(checked: boolean) {
    if (this.schema?.type === 'boolean') {
      this.valueChange.emit(checked);
    } else {
      this.valueChange.emit(checked ? 'yes' : 'no');
    }
  }
}

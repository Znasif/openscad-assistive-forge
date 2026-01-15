/**
 * Parameters Panel Component
 * @license GPL-3.0-or-later
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParameterControlComponent } from './parameter-control.component';

interface ParamSchema {
  title?: string;
  description?: string;
  properties?: Record<string, any>;
  'x-groups'?: Array<{ name: string; parameters: string[] }>;
}

@Component({
  selector: 'app-parameters-panel',
  standalone: true,
  imports: [CommonModule, ParameterControlComponent],
  template: `
    <aside class="parameters-panel">
      <h2>Parameters</h2>
      
      <div class="parameters-list" *ngIf="schema?.properties">
        <!-- Grouped parameters -->
        <ng-container *ngIf="schema['x-groups']?.length">
          <div class="param-group" *ngFor="let group of schema['x-groups']">
            <h3 class="group-title">{{ group.name }}</h3>
            <div class="group-content">
              <app-parameter-control
                *ngFor="let paramName of group.parameters"
                [name]="paramName"
                [schema]="schema.properties[paramName]"
                [value]="parameters[paramName]"
                (valueChange)="onParameterChange(paramName, $event)"
              />
            </div>
          </div>
        </ng-container>
        
        <!-- Ungrouped parameters -->
        <ng-container *ngIf="!schema['x-groups']?.length">
          <app-parameter-control
            *ngFor="let param of getParams()"
            [name]="param.name"
            [schema]="param.schema"
            [value]="parameters[param.name]"
            (valueChange)="onParameterChange(param.name, $event)"
          />
        </ng-container>
      </div>
    </aside>
  `,
  styles: [`
    .parameters-panel {
      background: var(--bg-secondary, #f8f9fa);
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }
    
    h2 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: var(--text-primary, #333);
    }
    
    .param-group {
      margin-bottom: 1.5rem;
    }
    
    .group-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }
    
    .group-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `]
})
export class ParametersPanelComponent {
  @Input() schema: ParamSchema | null = null;
  @Input() parameters: Record<string, any> = {};
  
  @Output() parameterChange = new EventEmitter<{ name: string; value: any }>();
  
  getParams(): Array<{ name: string; schema: any }> {
    if (!this.schema?.properties) return [];
    return Object.entries(this.schema.properties).map(([name, schema]) => ({
      name,
      schema
    }));
  }
  
  onParameterChange(name: string, value: any) {
    this.parameterChange.emit({ name, value });
  }
}

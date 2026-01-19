/**
 * Workflow Progress Unit Tests
 * Tests COGA-compliant workflow progress indicator
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initWorkflowProgress,
  showWorkflowProgress,
  hideWorkflowProgress,
  setWorkflowStep,
  completeWorkflowStep,
  resetWorkflowProgress,
  getWorkflowState,
  advanceWorkflowStep,
} from '../../src/js/workflow-progress.js';

describe('Workflow Progress', () => {
  let workflowElement;
  let srAnnouncer;

  beforeEach(() => {
    // Create mock workflow progress element
    workflowElement = document.createElement('div');
    workflowElement.id = 'workflowProgress';
    workflowElement.className = 'hidden';
    workflowElement.innerHTML = `
      <ol class="workflow-steps">
        <li class="workflow-step" data-step="upload"></li>
        <li class="workflow-step" data-step="customize"></li>
        <li class="workflow-step" data-step="render"></li>
        <li class="workflow-step" data-step="download"></li>
      </ol>
    `;
    document.body.appendChild(workflowElement);

    // Create mock SR announcer
    srAnnouncer = document.createElement('div');
    srAnnouncer.id = 'srAnnouncer';
    document.body.appendChild(srAnnouncer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    resetWorkflowProgress();
  });

  describe('initWorkflowProgress', () => {
    test('should initialize with hidden state by default', () => {
      initWorkflowProgress();
      expect(workflowElement.classList.contains('hidden')).toBe(true);
    });

    test('should show progress when visible=true', () => {
      initWorkflowProgress(true);
      expect(workflowElement.classList.contains('hidden')).toBe(false);
    });

    test('should reset state on init', () => {
      setWorkflowStep('customize');
      initWorkflowProgress();
      
      const state = getWorkflowState();
      expect(state.currentStep).toBeNull();
      expect(state.completedSteps).toEqual([]);
    });
  });

  describe('showWorkflowProgress / hideWorkflowProgress', () => {
    test('should show progress bar', () => {
      initWorkflowProgress();
      showWorkflowProgress();
      expect(workflowElement.classList.contains('hidden')).toBe(false);
    });

    test('should hide progress bar', () => {
      initWorkflowProgress(true);
      hideWorkflowProgress();
      expect(workflowElement.classList.contains('hidden')).toBe(true);
    });
  });

  describe('setWorkflowStep', () => {
    test('should set current step', () => {
      initWorkflowProgress();
      setWorkflowStep('upload');
      
      const state = getWorkflowState();
      expect(state.currentStep).toBe('upload');
    });

    test('should mark previous steps as completed', () => {
      initWorkflowProgress();
      setWorkflowStep('render');
      
      const state = getWorkflowState();
      expect(state.completedSteps).toContain('upload');
      expect(state.completedSteps).toContain('customize');
      expect(state.completedSteps).not.toContain('render');
    });

    test('should update UI with active class', () => {
      initWorkflowProgress();
      setWorkflowStep('customize');
      
      const customizeStep = workflowElement.querySelector('[data-step="customize"]');
      expect(customizeStep.classList.contains('active')).toBe(true);
      expect(customizeStep.getAttribute('aria-current')).toBe('step');
    });

    test('should update UI with completed class', () => {
      initWorkflowProgress();
      setWorkflowStep('render');
      
      const uploadStep = workflowElement.querySelector('[data-step="upload"]');
      expect(uploadStep.classList.contains('completed')).toBe(true);
    });

    test('should ignore invalid steps', () => {
      initWorkflowProgress();
      setWorkflowStep('invalid_step');
      
      const state = getWorkflowState();
      expect(state.currentStep).toBeNull();
    });
  });

  describe('completeWorkflowStep', () => {
    test('should mark step as completed', () => {
      initWorkflowProgress();
      completeWorkflowStep('upload');
      
      const state = getWorkflowState();
      expect(state.completedSteps).toContain('upload');
    });

    test('should update UI with completed class', () => {
      initWorkflowProgress();
      completeWorkflowStep('upload');
      
      const uploadStep = workflowElement.querySelector('[data-step="upload"]');
      expect(uploadStep.classList.contains('completed')).toBe(true);
    });
  });

  describe('resetWorkflowProgress', () => {
    test('should clear all state', () => {
      initWorkflowProgress();
      setWorkflowStep('render');
      resetWorkflowProgress();
      
      const state = getWorkflowState();
      expect(state.currentStep).toBeNull();
      expect(state.completedSteps).toEqual([]);
    });

    test('should remove active and completed classes', () => {
      initWorkflowProgress();
      setWorkflowStep('render');
      resetWorkflowProgress();
      
      const allSteps = workflowElement.querySelectorAll('.workflow-step');
      allSteps.forEach(step => {
        expect(step.classList.contains('active')).toBe(false);
        expect(step.classList.contains('completed')).toBe(false);
      });
    });
  });

  describe('getWorkflowState', () => {
    test('should return current state', () => {
      initWorkflowProgress();
      setWorkflowStep('customize');
      completeWorkflowStep('upload');
      
      const state = getWorkflowState();
      expect(state.currentStep).toBe('customize');
      expect(state.completedSteps).toContain('upload');
      expect(state.allSteps).toEqual(['upload', 'customize', 'render', 'download']);
    });
  });

  describe('advanceWorkflowStep', () => {
    test('should advance to first step when none active', () => {
      initWorkflowProgress();
      advanceWorkflowStep();
      
      const state = getWorkflowState();
      expect(state.currentStep).toBe('upload');
    });

    test('should advance to next step', () => {
      initWorkflowProgress();
      setWorkflowStep('upload');
      advanceWorkflowStep();
      
      const state = getWorkflowState();
      expect(state.currentStep).toBe('customize');
      expect(state.completedSteps).toContain('upload');
    });

    test('should complete final step', () => {
      initWorkflowProgress();
      setWorkflowStep('download');
      advanceWorkflowStep();
      
      const state = getWorkflowState();
      expect(state.completedSteps).toContain('download');
    });
  });
});

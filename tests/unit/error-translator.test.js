/**
 * Error Translator Unit Tests
 * Tests COGA-compliant error translation functionality
 */

import { describe, test, expect } from 'vitest';
import { 
  translateError, 
  createFriendlyErrorDisplay 
} from '../../src/js/error-translator.js';

describe('Error Translator', () => {
  describe('translateError', () => {
    test('should translate syntax errors', () => {
      const result = translateError('syntax error at line 42');
      
      expect(result.title).toBe('Code Problem Found');
      expect(result.explanation).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
      expect(result.technical).toBe('syntax error at line 42');
    });

    test('should translate undefined variable errors', () => {
      const result = translateError('undefined variable: my_variable');
      
      expect(result.title).toBe('Missing Variable');
      expect(result.explanation).toContain('my_variable');
      expect(result.suggestion).toBeTruthy();
    });

    test('should translate unknown function errors', () => {
      const result = translateError('unknown function: custom_func');
      
      expect(result.title).toBe('Unknown Function');
      expect(result.explanation).toContain('custom_func');
      expect(result.suggestion).toContain('library');
    });

    test('should translate memory errors', () => {
      const result = translateError('out of memory during render');
      
      expect(result.title).toBe('Model Too Complex');
      expect(result.suggestion).toContain('complexity');
    });

    test('should translate timeout errors', () => {
      const result = translateError('render timed out after 60 seconds');
      
      expect(result.title).toBe('Taking Too Long');
      expect(result.suggestion).toBeTruthy();
    });

    test('should translate file not found errors', () => {
      const result = translateError('file not found: missing_file.scad');
      
      expect(result.title).toBe('Missing File');
      expect(result.explanation).toContain('missing_file.scad');
    });

    test('should translate CGAL errors', () => {
      const result = translateError('CGAL error: invalid geometry');
      
      expect(result.title).toBe('Complex Geometry Issue');
      expect(result.suggestion).toBeTruthy();
    });

    test('should translate degenerate geometry errors', () => {
      const result = translateError('degenerate polygon detected');
      
      expect(result.title).toBe('Invalid Shape');
      expect(result.suggestion).toContain('dimension');
    });

    test('should provide default translation for unknown errors', () => {
      const result = translateError('some unknown error message xyz123');
      
      expect(result.title).toBe('Something Went Wrong');
      expect(result.explanation).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
      expect(result.technical).toBe('some unknown error message xyz123');
    });

    test('should handle null/undefined input', () => {
      const resultNull = translateError(null);
      const resultUndefined = translateError(undefined);
      const resultEmpty = translateError('');
      
      expect(resultNull.title).toBe('Something Went Wrong');
      expect(resultUndefined.title).toBe('Something Went Wrong');
      expect(resultEmpty.title).toBe('Something Went Wrong');
    });

    test('should handle non-string input', () => {
      const result = translateError(12345);
      
      expect(result.title).toBe('Something Went Wrong');
    });
  });

  describe('createFriendlyErrorDisplay', () => {
    test('should create accessible error element', () => {
      const element = createFriendlyErrorDisplay('syntax error');
      
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.className).toBe('error-message-friendly');
      expect(element.getAttribute('role')).toBe('alert');
      expect(element.getAttribute('aria-live')).toBe('assertive');
    });

    test('should include title, explanation, and suggestion', () => {
      const element = createFriendlyErrorDisplay('undefined variable: test');
      
      const title = element.querySelector('.error-title');
      const explanation = element.querySelector('.error-explanation');
      const suggestion = element.querySelector('.error-suggestion');
      
      expect(title).toBeTruthy();
      expect(explanation).toBeTruthy();
      expect(suggestion).toBeTruthy();
    });

    test('should include collapsible technical details', () => {
      const element = createFriendlyErrorDisplay('technical error message');
      
      const details = element.querySelector('.error-details-toggle');
      expect(details).toBeTruthy();
      
      const summary = details.querySelector('summary');
      expect(summary.textContent).toContain('technical');
      
      const technical = details.querySelector('.error-technical');
      expect(technical.textContent).toBe('technical error message');
    });
  });
});

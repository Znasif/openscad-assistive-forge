/**
 * OpenSCAD Customizer Parameter Parser
 * @license GPL-3.0-or-later
 */

import { detectLibraries } from './library-manager.js';

/**
 * Parse default value from OpenSCAD code
 * @param {string} valueStr - Value string from assignment
 * @returns {Object} Parsed value with type
 */
function parseDefaultValue(valueStr) {
  const trimmed = valueStr.trim();

  // Check if it's a quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return { type: 'string', value: trimmed.slice(1, -1) };
  }

  // Check if it's a number
  const num = parseFloat(trimmed);
  if (!isNaN(num) && trimmed !== '') {
    return {
      type: Number.isInteger(num) && !trimmed.includes('.')? 'integer' : 'number',
      value: num,
    };
  }

  // Check for boolean
  if (trimmed === 'true' || trimmed === 'false') {
    return { type: 'boolean', value: trimmed === 'true' };
  }

  // Unquoted string
  return { type: 'string', value: trimmed };
}

/**
 * Parse enum values from bracket hint
 * Handles: [opt1, opt2], [opt1,opt2], ["opt 1", "opt 2"], [0,2,4,6]
 * @param {string} enumStr - Enum string from bracket hint
 * @returns {Array} Array of enum values
 */
function parseEnumValues(enumStr) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;

  for (let i = 0; i < enumStr.length; i++) {
    const char = enumStr[i];

    if ((char === '"' || char === "'") && (i === 0 || enumStr[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      } else {
        current += char;
      }
    } else if (char === ',' && !inQuotes) {
      const trimmed = current.trim();
      if (trimmed) values.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }

  const trimmed = current.trim();
  if (trimmed) values.push(trimmed);

  return values;
}

/**
 * Extract parameters from OpenSCAD Customizer annotations
 * @param {string} scadContent - .scad file content
 * @returns {Object} Extracted parameters structure
 */
export function extractParameters(scadContent) {
  const lines = scadContent.split('\n');
  const groups = [];
  const parameters = {};

  let currentGroup = 'General';
  let groupOrder = 0;
  let paramOrder = 0;
  let scopeDepth = 0;
  let inBlockComment = false;

  const stripForScope = (input, state) => {
    let output = '';
    let inString = false;
    let stringChar = '';
    let escapeNext = false;

    for (let idx = 0; idx < input.length; idx++) {
      const char = input[idx];
      const next = input[idx + 1];

      if (state.inBlockComment) {
        if (char === '*' && next === '/') {
          state.inBlockComment = false;
          idx += 1;
        }
        continue;
      }

      if (!inString && char === '/' && next === '*') {
        state.inBlockComment = true;
        idx += 1;
        continue;
      }

      if (!inString && char === '/' && next === '/') {
        break;
      }

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        output += ' ';
        continue;
      }

      if (inString) {
        if (!escapeNext && char === '\\') {
          escapeNext = true;
          continue;
        }
        if (!escapeNext && char === stringChar) {
          inString = false;
          stringChar = '';
        }
        escapeNext = false;
        output += ' ';
        continue;
      }

      output += char;
    }

    return output;
  };

  // Regex patterns
  const groupPattern = /\/\*\s*\[\s*([^\]]+)\s*\]\s*\*\//;
  const assignmentPattern = /^([$]?[A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+);/;
  const bracketHintPattern = /\/\/\s*\[([^\]]+)\]/;
  const commentPattern = /\/\/\s*(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const depthBefore = scopeDepth;
    let handledGroup = false;

    if (depthBefore === 0) {
      // Check for group
      const groupMatch = line.match(groupPattern);
      if (groupMatch) {
        currentGroup = groupMatch[1].trim();
        
        // Skip Hidden group
        if (currentGroup.toLowerCase() !== 'hidden') {
          if (!groups.find((g) => g.id === currentGroup)) {
            groups.push({
              id: currentGroup,
              label: currentGroup,
              order: groupOrder++,
            });
          }
        }
        handledGroup = true;
      }
    }

    // Check for parameter assignment (top-level only)
    if (!handledGroup && depthBefore === 0) {
      const assignMatch = line.match(assignmentPattern);
      if (assignMatch) {
        const paramName = assignMatch[1];
        const valueStr = assignMatch[2].trim();

        // Skip if in Hidden group
        if (currentGroup.toLowerCase() === 'hidden') {
          const scopeState = { inBlockComment };
          const scopeLine = stripForScope(rawLine, scopeState);
          inBlockComment = scopeState.inBlockComment;
          for (const ch of scopeLine) {
            if (ch === '{') scopeDepth += 1;
            if (ch === '}') scopeDepth = Math.max(0, scopeDepth - 1);
          }
          continue;
        }

      // Parse default value
      const defaultVal = parseDefaultValue(valueStr);

      // Check for bracket hint and comment
      const afterAssignment = line.substring(line.indexOf(';') + 1);
      const bracketMatch = afterAssignment.match(bracketHintPattern);
      const commentMatch = afterAssignment.match(commentPattern);

      let param = {
        name: paramName,
        type: defaultVal.type,
        default: defaultVal.value,
        group: currentGroup,
        order: paramOrder++,
        description: '',
      };

      if (bracketMatch) {
        const hint = bracketMatch[1].trim();

        // Check for color type: [color]
        if (hint.toLowerCase() === 'color') {
          param.type = 'color';
          param.uiType = 'color';
          
          // Extract comment after bracket hint
          const afterBracket = afterAssignment.substring(
            afterAssignment.indexOf(']') + 1
          ).trim();
          if (afterBracket) {
            param.description = afterBracket;
          }
        }
        // Check for file type: [file] or [file:ext1,ext2]
        else if (hint.toLowerCase().startsWith('file')) {
          param.type = 'file';
          param.uiType = 'file';
          
          // Extract accepted file extensions
          if (hint.includes(':')) {
            const extPart = hint.substring(hint.indexOf(':') + 1).trim();
            param.acceptedExtensions = extPart.split(',').map(e => e.trim());
          }
          
          // Extract comment after bracket hint
          const afterBracket = afterAssignment.substring(
            afterAssignment.indexOf(']') + 1
          ).trim();
          if (afterBracket) {
            param.description = afterBracket;
          }
        }
        // Check if it's a range: [min:max] or [min:step:max]
        else {
          const rangeParts = hint.split(':');
          if (rangeParts.length >= 2 && rangeParts.every(p => !isNaN(parseFloat(p.trim())))) {
            const nums = rangeParts.map(p => parseFloat(p.trim()));
            
            if (nums.length === 2) {
              // [min:max]
              param.minimum = nums[0];
              param.maximum = nums[1];
              param.uiType = 'slider';
            } else if (nums.length === 3) {
              // [min:step:max]
              param.minimum = nums[0];
              param.step = nums[1];
              param.maximum = nums[2];
              param.uiType = 'slider';
              
              // Determine if integer or float based on step
              if (Number.isInteger(nums[1]) && !hint.includes('.')) {
                param.type = 'integer';
              } else {
                param.type = 'number';
              }
            }

            // Extract comment after bracket hint
            const afterBracket = afterAssignment.substring(
              afterAssignment.indexOf(']') + 1
            ).trim();
            if (afterBracket) {
              param.description = afterBracket;
            }
          } else {
            // It's an enum: [opt1, opt2, opt3]
            const enumValues = parseEnumValues(hint);
            param.enum = enumValues;
            param.type = 'string'; // Enums are typically strings
            
            // Check if it's a yes/no toggle
            const lowerVals = enumValues.map(v => v.toLowerCase());
            if (
              enumValues.length === 2 &&
              lowerVals.includes('yes') &&
              lowerVals.includes('no')
            ) {
              param.uiType = 'toggle';
            } else {
              param.uiType = 'select';
            }

            // Extract comment after bracket hint (if any)
            const afterBracket = afterAssignment.substring(
              afterAssignment.indexOf(']') + 1
            ).trim();
            if (afterBracket) {
              param.description = afterBracket;
            }
          }
        }
      } else if (commentMatch) {
        // Comment without bracket hint
        param.description = commentMatch[1].trim();
        param.uiType = 'input';
      } else {
        // Bare parameter
        param.uiType = 'input';
      }

        parameters[paramName] = param;
      }
    }

    const scopeState = { inBlockComment };
    const scopeLine = stripForScope(rawLine, scopeState);
    inBlockComment = scopeState.inBlockComment;
    for (const ch of scopeLine) {
      if (ch === '{') scopeDepth += 1;
      if (ch === '}') scopeDepth = Math.max(0, scopeDepth - 1);
    }
  }

  // If no groups were found, create a default group
  if (groups.length === 0) {
    groups.push({
      id: 'General',
      label: 'General',
      order: 0,
    });
  }

  // Detect library usage
  const detectedLibraries = detectLibraries(scadContent);

  return {
    groups,
    parameters,
    libraries: detectedLibraries,
  };
}

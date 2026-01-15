/**
 * Parameters Panel Component
 * @license GPL-3.0-or-later
 */

import { useState } from 'react';
import ParameterControl from './ParameterControl';

function ParametersPanel({ schema, parameters, onChange }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  // Get groups from schema
  const groups = schema['x-groups'] || [
    { name: 'default', label: 'Parameters', parameters: Object.keys(schema.properties || {}) },
  ];

  // Toggle group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Check if group is expanded (default to true)
  const isGroupExpanded = (groupName) => {
    return expandedGroups[groupName] !== false;
  };

  // Reset parameters to defaults
  const handleReset = () => {
    const defaults = {};
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      defaults[key] = prop.default;
    }
    Object.entries(defaults).forEach(([key, value]) => {
      onChange(key, value);
    });
  };

  return (
    <aside className="params-panel">
      <div className="params-header">
        <h2>Parameters</h2>
        <button onClick={handleReset} className="reset-button" title="Reset to defaults">
          ↺ Reset
        </button>
      </div>

      <div className="params-content">
        {groups.map((group) => (
          <div key={group.name} className="param-group">
            <button
              className="group-header"
              onClick={() => toggleGroup(group.name)}
              aria-expanded={isGroupExpanded(group.name)}
            >
              <span className="group-icon">{isGroupExpanded(group.name) ? '▼' : '▶'}</span>
              <span className="group-label">{group.label || group.name}</span>
            </button>

            {isGroupExpanded(group.name) && (
              <div className="group-content">
                {group.parameters.map((paramName) => {
                  const paramSchema = schema.properties[paramName];
                  if (!paramSchema) return null;

                  return (
                    <ParameterControl
                      key={paramName}
                      name={paramName}
                      schema={paramSchema}
                      value={parameters[paramName]}
                      onChange={(value) => onChange(paramName, value)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default ParametersPanel;

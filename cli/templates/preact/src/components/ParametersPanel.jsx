/**
 * Parameters Panel Component
 * @license GPL-3.0-or-later
 */

import { ParameterControl } from './ParameterControl';

export function ParametersPanel({ schema, parameters, onParameterChange }) {
  if (!schema?.properties) return null;
  
  const groups = schema['x-groups'] || [];
  
  return (
    <aside class="parameters-panel" style={styles.panel}>
      <h2 style={styles.title}>Parameters</h2>
      
      <div class="parameters-list">
        {groups.length > 0 ? (
          groups.map(group => (
            <div class="param-group" key={group.name} style={styles.group}>
              <h3 style={styles.groupTitle}>{group.name}</h3>
              <div style={styles.groupContent}>
                {group.parameters.map(paramName => (
                  <ParameterControl
                    key={paramName}
                    name={paramName}
                    schema={schema.properties[paramName]}
                    value={parameters[paramName]}
                    onChange={(value) => onParameterChange(paramName, value)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          Object.entries(schema.properties).map(([name, propSchema]) => (
            <ParameterControl
              key={name}
              name={name}
              schema={propSchema}
              value={parameters[name]}
              onChange={(value) => onParameterChange(name, value)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
    height: 'fit-content',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto'
  },
  title: {
    margin: '0 0 1rem',
    fontSize: '1.25rem',
    color: 'var(--text-primary)'
  },
  group: {
    marginBottom: '1.5rem'
  },
  groupTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--border-color)'
  },
  groupContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }
};

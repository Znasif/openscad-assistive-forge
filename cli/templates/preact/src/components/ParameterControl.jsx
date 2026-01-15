/**
 * Parameter Control Component
 * @license GPL-3.0-or-later
 */

export function ParameterControl({ name, schema, value, onChange }) {
  const isRange = schema?.type === 'number' && 
                  schema?.minimum !== undefined && 
                  schema?.maximum !== undefined &&
                  schema?.['x-hint'] !== 'color';
  
  const isEnum = Array.isArray(schema?.enum) && !isBoolean();
  
  function isBoolean() {
    return schema?.type === 'boolean' ||
           (Array.isArray(schema?.enum) && 
            schema.enum.length === 2 &&
            schema.enum.every(v => typeof v === 'string' && ['yes', 'no', 'true', 'false'].includes(v.toLowerCase())));
  }
  
  const isColor = schema?.['x-hint'] === 'color' ||
                  (schema?.type === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value));
  
  const isNumber = schema?.type === 'number' && !isRange && !isColor;
  const isText = schema?.type === 'string' && !isEnum && !isColor;
  
  const getBoolValue = () => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['yes', 'true'].includes(value.toLowerCase());
    }
    return false;
  };
  
  const setBoolValue = (checked) => {
    if (schema?.type === 'boolean') {
      onChange(checked);
    } else {
      onChange(checked ? 'yes' : 'no');
    }
  };
  
  return (
    <div style={styles.control}>
      <label for={name}>
        <span style={styles.name}>{schema?.title || name}</span>
        {schema?.description && (
          <span style={styles.hint}>{schema.description}</span>
        )}
      </label>
      
      {isRange && (
        <div style={styles.inputRow}>
          <input
            type="range"
            id={name}
            min={schema.minimum}
            max={schema.maximum}
            step={schema['x-step'] || 1}
            value={value}
            onInput={(e) => onChange(parseFloat(e.target.value))}
            style={styles.range}
          />
          <input
            type="number"
            min={schema.minimum}
            max={schema.maximum}
            step={schema['x-step'] || 1}
            value={value}
            onInput={(e) => onChange(parseFloat(e.target.value))}
            style={styles.rangeValue}
            aria-label={`${name} value`}
          />
        </div>
      )}
      
      {isEnum && (
        <select
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.select}
        >
          {schema.enum.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      
      {isBoolean() && (
        <div style={styles.toggleWrapper}>
          <input
            type="checkbox"
            id={name}
            checked={getBoolValue()}
            onChange={(e) => setBoolValue(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.toggleLabel}>{getBoolValue() ? 'Yes' : 'No'}</span>
        </div>
      )}
      
      {isColor && (
        <div style={styles.inputRow}>
          <input
            type="color"
            id={name}
            value={value}
            onInput={(e) => onChange(e.target.value)}
            style={styles.colorPicker}
          />
          <input
            type="text"
            value={value}
            onInput={(e) => onChange(e.target.value)}
            pattern="^#[0-9A-Fa-f]{6}$"
            style={styles.colorValue}
            aria-label={`${name} hex value`}
          />
        </div>
      )}
      
      {isNumber && (
        <input
          type="number"
          id={name}
          value={value}
          onInput={(e) => onChange(parseFloat(e.target.value))}
          step={schema['x-step'] || 1}
          style={styles.input}
        />
      )}
      
      {isText && (
        <input
          type="text"
          id={name}
          value={value}
          onInput={(e) => onChange(e.target.value)}
          maxlength={schema.maxLength}
          style={styles.input}
        />
      )}
    </div>
  );
}

const styles = {
  control: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  name: {
    fontWeight: '500',
    color: 'var(--text-primary)',
    display: 'block'
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    display: 'block',
    marginTop: '0.125rem'
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  range: {
    flex: '1',
    height: '6px'
  },
  rangeValue: {
    width: '70px',
    padding: '0.375rem 0.5rem',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    textAlign: 'right'
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  checkbox: {
    width: '44px',
    height: '24px'
  },
  toggleLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)'
  },
  colorPicker: {
    width: '44px',
    height: '44px',
    padding: '2px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  colorValue: {
    flex: '1',
    fontFamily: 'monospace',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.875rem'
  }
};

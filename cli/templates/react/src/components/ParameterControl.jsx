/**
 * Parameter Control Component
 * @license GPL-3.0-or-later
 */

function ParameterControl({ name, schema, value, onChange }) {
  const handleChange = (e) => {
    const { type, value: inputValue, checked } = e.target;

    if (type === 'checkbox') {
      onChange(checked);
    } else if (type === 'number' || type === 'range') {
      const numValue = parseFloat(inputValue);
      if (schema.type === 'integer') {
        onChange(Math.round(numValue));
      } else {
        onChange(numValue);
      }
    } else {
      onChange(inputValue);
    }
  };

  // Render based on parameter type
  const renderControl = () => {
    // Boolean (yes/no toggle)
    if (
      schema.type === 'string' &&
      Array.isArray(schema.enum) &&
      schema.enum.length === 2 &&
      schema.enum.includes('yes') &&
      schema.enum.includes('no')
    ) {
      return (
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={value === 'yes'}
            onChange={(e) => onChange(e.target.checked ? 'yes' : 'no')}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">{value === 'yes' ? 'Yes' : 'No'}</span>
        </label>
      );
    }

    // Enum (dropdown)
    if (Array.isArray(schema.enum)) {
      return (
        <select value={value} onChange={handleChange} className="select-control">
          {schema.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Number with range (slider + input)
    if (
      (schema.type === 'number' || schema.type === 'integer') &&
      schema.minimum !== undefined &&
      schema.maximum !== undefined
    ) {
      const step = schema.multipleOf || (schema.type === 'integer' ? 1 : 0.1);
      
      return (
        <div className="range-control">
          <input
            type="range"
            min={schema.minimum}
            max={schema.maximum}
            step={step}
            value={value}
            onChange={handleChange}
            className="range-slider"
          />
          <input
            type="number"
            min={schema.minimum}
            max={schema.maximum}
            step={step}
            value={value}
            onChange={handleChange}
            className="range-input"
          />
        </div>
      );
    }

    // Number without range (plain input)
    if (schema.type === 'number' || schema.type === 'integer') {
      const step = schema.multipleOf || (schema.type === 'integer' ? 1 : 0.1);
      
      return (
        <input
          type="number"
          step={step}
          value={value}
          onChange={handleChange}
          className="number-control"
        />
      );
    }

    // Boolean (checkbox)
    if (schema.type === 'boolean') {
      return (
        <label className="checkbox-control">
          <input
            type="checkbox"
            checked={value}
            onChange={handleChange}
          />
          <span className="checkbox-label">{value ? 'True' : 'False'}</span>
        </label>
      );
    }

    // String (text input)
    return (
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="text-control"
      />
    );
  };

  return (
    <div className="param-control">
      <label className="param-label">
        <span className="param-name">{schema.title || name}</span>
        {schema.description && (
          <span className="param-description">{schema.description}</span>
        )}
      </label>
      {renderControl()}
    </div>
  );
}

export default ParameterControl;

<script>
  import { createEventDispatcher } from 'svelte';

  export let name;
  export let schema;
  export let value;

  const dispatch = createEventDispatcher();

  // Check if it's a yes/no toggle
  $: isYesNoToggle =
    schema.type === 'string' &&
    Array.isArray(schema.enum) &&
    schema.enum.length === 2 &&
    schema.enum.includes('yes') &&
    schema.enum.includes('no');

  // Check if it's a number range
  $: isNumberRange =
    (schema.type === 'number' || schema.type === 'integer') &&
    schema.minimum !== undefined &&
    schema.maximum !== undefined;

  // Calculate step value
  $: step = schema.multipleOf || (schema.type === 'integer' ? 1 : 0.1);

  // Handle changes
  function handleChange(e) {
    const { type, value: inputValue, checked } = e.target;

    if (type === 'checkbox' && schema.type === 'boolean') {
      dispatch('change', checked);
    } else if (type === 'number' || type === 'range') {
      const numValue = parseFloat(inputValue);
      if (schema.type === 'integer') {
        dispatch('change', Math.round(numValue));
      } else {
        dispatch('change', numValue);
      }
    } else {
      dispatch('change', inputValue);
    }
  }

  // Handle yes/no toggle
  function handleYesNoChange(e) {
    dispatch('change', e.target.checked ? 'yes' : 'no');
  }
</script>

<div class="param-control">
  <label class="param-label">
    <span class="param-name">{schema.title || name}</span>
    {#if schema.description}
      <span class="param-description">{schema.description}</span>
    {/if}
  </label>
  
  <!-- Yes/No Toggle -->
  {#if isYesNoToggle}
    <label class="toggle-control">
      <input
        type="checkbox"
        checked={value === 'yes'}
        on:change={handleYesNoChange}
      />
      <span class="toggle-slider"></span>
      <span class="toggle-label">{value === 'yes' ? 'Yes' : 'No'}</span>
    </label>

  <!-- Enum Dropdown -->
  {:else if schema.enum}
    <select {value} on:change={handleChange} class="select-control">
      {#each schema.enum as option}
        <option value={option}>{option}</option>
      {/each}
    </select>

  <!-- Number Range (slider + input) -->
  {:else if isNumberRange}
    <div class="range-control">
      <input
        type="range"
        min={schema.minimum}
        max={schema.maximum}
        {step}
        {value}
        on:input={handleChange}
        class="range-slider"
      />
      <input
        type="number"
        min={schema.minimum}
        max={schema.maximum}
        {step}
        {value}
        on:input={handleChange}
        class="range-input"
      />
    </div>

  <!-- Number Input -->
  {:else if schema.type === 'number' || schema.type === 'integer'}
    <input
      type="number"
      {step}
      {value}
      on:input={handleChange}
      class="number-control"
    />

  <!-- Boolean Checkbox -->
  {:else if schema.type === 'boolean'}
    <label class="checkbox-control">
      <input
        type="checkbox"
        checked={value}
        on:change={handleChange}
      />
      <span class="checkbox-label">{value ? 'True' : 'False'}</span>
    </label>

  <!-- Text Input -->
  {:else}
    <input
      type="text"
      {value}
      on:input={handleChange}
      class="text-control"
    />
  {/if}
</div>

<script>
  import { createEventDispatcher } from 'svelte';
  import ParameterControl from './ParameterControl.svelte';

  export let schema;
  export let parameters;

  const dispatch = createEventDispatcher();

  let expandedGroups = {};

  // Get groups from schema
  $: groups = schema['x-groups'] || [
    { name: 'default', label: 'Parameters', parameters: Object.keys(schema.properties || {}) },
  ];

  // Toggle group expansion
  function toggleGroup(groupName) {
    expandedGroups = {
      ...expandedGroups,
      [groupName]: !expandedGroups[groupName],
    };
  }

  // Check if group is expanded (default to true)
  function isGroupExpanded(groupName) {
    return expandedGroups[groupName] !== false;
  }

  // Reset parameters to defaults
  function handleReset() {
    const defaults = {};
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      defaults[key] = prop.default;
    }
    Object.entries(defaults).forEach(([key, value]) => {
      dispatch('change', { name: key, value });
    });
  }
</script>

<aside class="params-panel">
  <div class="params-header">
    <h2>Parameters</h2>
    <button on:click={handleReset} class="reset-button" title="Reset to defaults">
      ↺ Reset
    </button>
  </div>

  <div class="params-content">
    {#each groups as group (group.name)}
      <div class="param-group">
        <button
          class="group-header"
          on:click={() => toggleGroup(group.name)}
          aria-expanded={isGroupExpanded(group.name)}
        >
          <span class="group-icon">{isGroupExpanded(group.name) ? '▼' : '▶'}</span>
          <span class="group-label">{group.label || group.name}</span>
        </button>

        {#if isGroupExpanded(group.name)}
          <div class="group-content">
            {#each group.parameters as paramName (paramName)}
              {#if schema.properties[paramName]}
                <ParameterControl
                  name={paramName}
                  schema={schema.properties[paramName]}
                  value={parameters[paramName]}
                  on:change={(e) => dispatch('change', { name: paramName, value: e.detail })}
                />
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</aside>

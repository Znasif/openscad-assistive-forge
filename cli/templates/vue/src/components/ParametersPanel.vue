<template>
  <aside class="params-panel">
    <div class="params-header">
      <h2>Parameters</h2>
      <button @click="handleReset" class="reset-button" title="Reset to defaults">
        ↺ Reset
      </button>
    </div>

    <div class="params-content">
      <div v-for="group in groups" :key="group.name" class="param-group">
        <button
          class="group-header"
          @click="toggleGroup(group.name)"
          :aria-expanded="isGroupExpanded(group.name)"
        >
          <span class="group-icon">{{ isGroupExpanded(group.name) ? '▼' : '▶' }}</span>
          <span class="group-label">{{ group.label || group.name }}</span>
        </button>

        <div v-if="isGroupExpanded(group.name)" class="group-content">
          <ParameterControl
            v-for="paramName in group.parameters"
            :key="paramName"
            :name="paramName"
            :schema="schema.properties[paramName]"
            :value="parameters[paramName]"
            @change="(value) => $emit('change', paramName, value)"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import ParameterControl from './ParameterControl.vue';

const props = defineProps({
  schema: Object,
  parameters: Object,
});

const emit = defineEmits(['change']);

const expandedGroups = ref({});

// Get groups from schema
const groups = computed(() => {
  return props.schema['x-groups'] || [
    { name: 'default', label: 'Parameters', parameters: Object.keys(props.schema.properties || {}) },
  ];
});

// Toggle group expansion
const toggleGroup = (groupName) => {
  expandedGroups.value = {
    ...expandedGroups.value,
    [groupName]: !expandedGroups.value[groupName],
  };
};

// Check if group is expanded (default to true)
const isGroupExpanded = (groupName) => {
  return expandedGroups.value[groupName] !== false;
};

// Reset parameters to defaults
const handleReset = () => {
  const defaults = {};
  for (const [key, prop] of Object.entries(props.schema.properties || {})) {
    defaults[key] = prop.default;
  }
  Object.entries(defaults).forEach(([key, value]) => {
    emit('change', key, value);
  });
};
</script>

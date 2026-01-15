<template>
  <div class="param-control">
    <label class="param-label">
      <span class="param-name">{{ schema.title || name }}</span>
      <span v-if="schema.description" class="param-description">{{ schema.description }}</span>
    </label>
    
    <!-- Yes/No Toggle -->
    <label v-if="isYesNoToggle" class="toggle-control">
      <input
        type="checkbox"
        :checked="value === 'yes'"
        @change="handleYesNoChange"
      />
      <span class="toggle-slider"></span>
      <span class="toggle-label">{{ value === 'yes' ? 'Yes' : 'No' }}</span>
    </label>

    <!-- Enum Dropdown -->
    <select
      v-else-if="schema.enum"
      :value="value"
      @change="handleChange"
      class="select-control"
    >
      <option v-for="option in schema.enum" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <!-- Number Range (slider + input) -->
    <div
      v-else-if="isNumberRange"
      class="range-control"
    >
      <input
        type="range"
        :min="schema.minimum"
        :max="schema.maximum"
        :step="step"
        :value="value"
        @input="handleChange"
        class="range-slider"
      />
      <input
        type="number"
        :min="schema.minimum"
        :max="schema.maximum"
        :step="step"
        :value="value"
        @input="handleChange"
        class="range-input"
      />
    </div>

    <!-- Number Input -->
    <input
      v-else-if="schema.type === 'number' || schema.type === 'integer'"
      type="number"
      :step="step"
      :value="value"
      @input="handleChange"
      class="number-control"
    />

    <!-- Boolean Checkbox -->
    <label v-else-if="schema.type === 'boolean'" class="checkbox-control">
      <input
        type="checkbox"
        :checked="value"
        @change="handleChange"
      />
      <span class="checkbox-label">{{ value ? 'True' : 'False' }}</span>
    </label>

    <!-- Text Input -->
    <input
      v-else
      type="text"
      :value="value"
      @input="handleChange"
      class="text-control"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: String,
  schema: Object,
  value: [String, Number, Boolean],
});

const emit = defineEmits(['change']);

// Check if it's a yes/no toggle
const isYesNoToggle = computed(() => {
  return (
    props.schema.type === 'string' &&
    Array.isArray(props.schema.enum) &&
    props.schema.enum.length === 2 &&
    props.schema.enum.includes('yes') &&
    props.schema.enum.includes('no')
  );
});

// Check if it's a number range
const isNumberRange = computed(() => {
  return (
    (props.schema.type === 'number' || props.schema.type === 'integer') &&
    props.schema.minimum !== undefined &&
    props.schema.maximum !== undefined
  );
});

// Calculate step value
const step = computed(() => {
  return props.schema.multipleOf || (props.schema.type === 'integer' ? 1 : 0.1);
});

// Handle changes
const handleChange = (e) => {
  const { type, value: inputValue, checked } = e.target;

  if (type === 'checkbox' && props.schema.type === 'boolean') {
    emit('change', checked);
  } else if (type === 'number' || type === 'range') {
    const numValue = parseFloat(inputValue);
    if (props.schema.type === 'integer') {
      emit('change', Math.round(numValue));
    } else {
      emit('change', numValue);
    }
  } else {
    emit('change', inputValue);
  }
};

// Handle yes/no toggle
const handleYesNoChange = (e) => {
  emit('change', e.target.checked ? 'yes' : 'no');
};
</script>

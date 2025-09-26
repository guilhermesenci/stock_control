<!-- UnitCostField.vue - Componente para campo de custo unitário -->
<template>
  <div class="form-group horizontal">
    <label for="unitCost">Custo unitário:</label>
    <div class="input-with-button">
      <input
        id="unitCost"
        type="number"
        v-model.number="localValue"
        placeholder="0.00"
        step="0.01"
        min="0.01"
        required
        :readonly="readonly"
        :disabled="disabled || loading"
        :class="{ 'readonly-field': readonly }"
        @input="handleInput"
      />
      <button 
        v-if="showSuggestButton" 
        type="button" 
        class="btn-suggest" 
        @click="handleSuggest"
        :disabled="loading"
      >
        {{ suggestButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue: number;
  readonly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  showSuggestButton?: boolean;
  suggestButtonText?: string;
}

interface Emits {
  (e: 'update:modelValue', value: number): void;
  (e: 'suggest'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  readonly: false,
  disabled: false,
  loading: false,
  showSuggestButton: false,
  suggestButtonText: 'Sugerir último'
});

const emit = defineEmits<Emits>();

const localValue = ref(props.modelValue);

// Sincroniza com o valor do modelo
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
}, { immediate: true });

function handleInput() {
  emit('update:modelValue', localValue.value);
}

function handleSuggest() {
  emit('suggest');
}
</script>

<style scoped>
.form-group.horizontal {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.readonly-field {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.btn-suggest {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-suggest:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-suggest:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>

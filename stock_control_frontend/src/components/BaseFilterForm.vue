<template>
    <div class="filter-form">
      <div 
        v-for="field in fields" 
        :key="String(field.key)" 
        class="filter-field" 
      >
        <label :for="String(field.key)">{{ field.label }}</label>
  
        <!-- checkbox -->
        <input
          v-if="field.type === 'checkbox'"
          :id="String(field.key)"
          type="checkbox"
          v-model="localFilters[String(field.key)]"
          class="checkbox-group"
        />
  
        <!-- campo de data brasileiro -->
        <BrazilianDateInput
          v-else-if="field.type === 'date'"
          :id="String(field.key)"
          v-model="localFilters[String(field.key)]"
          :placeholder="field.placeholder || 'DD/MM/YYYY'"
        />
  
        <!-- demais tipos -->
        <input
          v-else
          :id="String(field.key)"
          :type="field.type"
          :placeholder="field.placeholder || ''"
          v-model="localFilters[String(field.key)]"
        />
      </div>
  
      <div class="filter-actions">
        <button @click="emitSearch" class="search-button">Pesquisar</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, toRefs, watch, onMounted } from 'vue';
  import type { FilterField } from '@/types/filter';
  import BrazilianDateInput from './BrazilianDateInput.vue';
  
  // Ensure FilterField has a key of type string or number
  type StringOrNumberKey = string | number;
  
  interface Props<T> {
    fields: FilterField<T>[];
    modelValue: Record<string, any>;
  }
  
  const props = defineProps<Props<any>>();
  const emit  = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void;
    (e: 'search', value: Record<string, any>): void;
  }>();
  
  // cria cópia reativa dos filtros
  const localFilters = reactive({ ...props.modelValue });
  
  onMounted(() => {
    console.log('BaseFilterForm: Component mounted');
    console.log('BaseFilterForm: Initial modelValue:', props.modelValue);
    console.log('BaseFilterForm: Initial localFilters:', localFilters);
  });
  
  // sempre sincroniza prop -> local
  watch(
    () => props.modelValue,
    (newVal) => {
      console.log('BaseFilterForm: modelValue changed:', newVal);
      Object.assign(localFilters, newVal);
      console.log('BaseFilterForm: localFilters updated:', localFilters);
    }
  );
  
  // quando clica em pesquisar, emite os valores
  function emitSearch() {
    console.log('BaseFilterForm: emitSearch called with values:', { ...localFilters });
    
    try {
      emit('update:modelValue', { ...localFilters });
      console.log('BaseFilterForm: Emitted update:modelValue event');
      
      emit('search', { ...localFilters });
      console.log('BaseFilterForm: Emitted search event');
    } catch (error) {
      console.error('BaseFilterForm: Error emitting events:', error);
    }
  }
  </script>
  
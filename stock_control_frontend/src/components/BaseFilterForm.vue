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
        <button @click="emitSearch">Pesquisar</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, toRefs, watch } from 'vue';
  import type { FilterField } from '@/types/filter';
  
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
  
  // sempre sincroniza prop -> local
  watch(
    () => props.modelValue,
    (newVal) => {
      Object.assign(localFilters, newVal);
    }
  );
  
  // quando clica em pesquisar, emite os valores
  function emitSearch() {
    emit('update:modelValue', { ...localFilters });
    emit('search', { ...localFilters });
  }
  </script>
  
  <style scoped>
  .filter-form {
    display: flex;
    gap: 2rem;
    align-items: center;
  }
  .filter-field {
    display: flex;
    flex-direction: column;
  }
  .filter-actions {
    margin-left: auto;
  }
  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  </style>
  
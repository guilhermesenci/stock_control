<template>
    <form @submit.prevent="onSubmit">
      <slot name="fields" :form="form" />
      <div class="form-actions">
        <button type="submit">{{ submitLabel }}</button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import type { TransactionForm } from '@/types/transaction';
  
  const props = defineProps<{
    form: TransactionForm;
    submitLabel?: string;
  }>();
  
  const emit = defineEmits<{
    (e: 'submit', form: TransactionForm): void;
  }>();
  
  function onSubmit() {
    emit('submit', { ...props.form });
  }
  </script>
  
  <style scoped>
  .form-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    background-color: #28a745;
    color: white;
    cursor: pointer;
  }
  button:hover {
    background-color: #218838;
  }
  </style>
  
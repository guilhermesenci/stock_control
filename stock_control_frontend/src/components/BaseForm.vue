<template>
    <form @submit.prevent="onSubmit" class="form-container">
      <slot name="fields" :form="form" />
      <div class="form-actions">
        <!-- Se o slot actions não for fornecido, mostra o botão padrão -->
        <slot name="actions">
          <button type="submit">{{ submitLabel }}</button>
        </slot>
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
    (e: 'cancel'): void;
  }>();
  
  function onSubmit() {
    emit('submit', { ...props.form });
  }
  </script>
  
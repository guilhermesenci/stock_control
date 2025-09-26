<template>
  <input
    :id="id"
    :type="type"
    :placeholder="placeholder"
    :value="displayValue"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    :class="inputClass"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatBrazilianDateToISO, formatDateToBrazilian } from '@/utils/date';

interface Props {
  modelValue: string;
  id?: string;
  type?: string;
  placeholder?: string;
  inputClass?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: 'DD/MM/YYYY',
  inputClass: '',
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Valor exibido no input (formato brasileiro)
const displayValue = ref('');

// Valor interno para controle
const internalValue = ref('');

// Atualiza o valor exibido quando o modelValue muda
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Se o valor vem do backend (ISO), converte para brasileiro
    if (newValue.includes('-')) {
      displayValue.value = formatDateToBrazilian(newValue);
      internalValue.value = newValue;
    } else if (newValue.includes('/')) {
      // Se já está em formato brasileiro
      displayValue.value = newValue;
      internalValue.value = formatBrazilianDateToISO(newValue);
    } else {
      displayValue.value = newValue;
      internalValue.value = newValue;
    }
  } else {
    displayValue.value = '';
    internalValue.value = '';
  }
}, { immediate: true });

// Manipula a entrada do usuário
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  
  // Remove caracteres não numéricos exceto /
  value = value.replace(/[^\d/]/g, '');
  
  // Aplica máscara DD/MM/YYYY
  if (value.length >= 2 && !value.includes('/')) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  if (value.length >= 5 && value.split('/').length === 2) {
    const parts = value.split('/');
    if (parts[1].length >= 2) {
      value = parts[0] + '/' + parts[1].substring(0, 2) + '/' + parts[1].substring(2);
    }
  }
  
  // Limita o tamanho
  if (value.length > 10) {
    value = value.substring(0, 10);
  }
  
  displayValue.value = value;
  
  // Se a data está completa, converte para ISO e emite
  if (value.length === 10 && value.split('/').length === 3) {
    const isoValue = formatBrazilianDateToISO(value);
    if (isoValue !== value) { // Se a conversão foi bem-sucedida
      internalValue.value = isoValue;
      emit('update:modelValue', isoValue);
    }
  } else {
    // Se não está completa, emite o valor como está
    emit('update:modelValue', value);
  }
}

// Manipula o foco
function handleFocus(event: Event) {
  const target = event.target as HTMLInputElement;
  target.select();
}

// Manipula o blur (quando perde o foco)
function handleBlur(event: Event) {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  
  // Se a data está incompleta, limpa
  if (value && value.length < 10) {
    displayValue.value = '';
    internalValue.value = '';
    emit('update:modelValue', '');
  }
}
</script>

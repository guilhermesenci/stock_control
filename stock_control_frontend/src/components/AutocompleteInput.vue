<template>
    <div class="form-group">
      <label :for="id">{{ label }}</label>
      <input
        :id="id" type="text" :placeholder="placeholder"
        v-model="modelValue" @focus="onFocus"
        @blur="onBlur" @keydown.down.prevent="onKeyDown"
        @keydown.up.prevent="onKeyUp" @keydown.enter.prevent="onKeyEnter"
        class="login-field"
      />
      <ul v-if="show && filtered.length" class="suggestions-list">
        <li v-for="(opt, i) in filtered" :key="opt"
            :class="{ selected: i === selectedIndex }"
            @mousedown.prevent="$emit('update:modelValue', opt)">
          {{ opt }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { toRefs, watch } from 'vue';
  const props = defineProps({
    id: String,
    label: String,
    modelValue: String,
    options: Array,
    placeholder: String
  });
  const emit = defineEmits(['update:modelValue']);
  
  import {
    input, filtered, show, selectedIndex,
    onFocus, onBlur, onKeyDown, onKeyUp, onKeyEnter
  } from '@/composables/useAutocomplete';(props.options);
  
  watch(input, val => emit('update:modelValue', val));
  </script>
  
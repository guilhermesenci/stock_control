<!-- SupplierSelector.vue - Componente para seleção de fornecedor -->
<template>
  <div class="form-group">
    <label for="supplier">Fornecedor:</label>
    <div class="autocomplete-container">
      <input 
        id="supplier" 
        type="text" 
        v-model="searchTerm" 
        @input="handleSearch"
        @keydown="handleKeydown"
        @focus="showSuggestions = suggestions.length > 0"
        @blur="hideSuggestions"
        placeholder="Digite o nome do fornecedor"
        autocomplete="off"
        required
      />
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-list">
        <div 
          v-for="(supplier, index) in suggestions" 
          :key="supplier.codFornecedor"
          :class="['suggestion-item', { active: selectedIndex === index }]"
          @click="selectSupplier(supplier)"
          @mouseover="selectedIndex = index"
        >
          {{ supplier.nomeFornecedor }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { supplierService } from '@/services/supplierService';
import type { Fornecedor } from '@/services/supplierService';

interface Props {
  modelValue?: Fornecedor | null;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: Fornecedor | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
});

const emit = defineEmits<Emits>();

const searchTerm = ref('');
const suggestions = ref<Fornecedor[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
let searchTimeout: any = null;

// Sincroniza com o valor do modelo
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchTerm.value = newValue.nomeFornecedor;
  } else {
    searchTerm.value = '';
  }
}, { immediate: true });

async function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (!searchTerm.value) {
    suggestions.value = [];
    showSuggestions.value = false;
    emit('update:modelValue', null);
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const results = await supplierService.searchSuppliers(searchTerm.value);
      suggestions.value = results.filter(s => s.active);
      showSuggestions.value = true;
      selectedIndex.value = -1;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      suggestions.value = [];
    }
  }, 300);
}

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

function handleKeydown(event: KeyboardEvent) {
  if (!showSuggestions.value || !suggestions.value.length) return;
  
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (selectedIndex.value < suggestions.value.length - 1) {
      selectedIndex.value++;
    } else {
      selectedIndex.value = 0;
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
    } else {
      selectedIndex.value = suggestions.value.length - 1;
    }
  } else if (event.key === 'Enter' && selectedIndex.value >= 0) {
    event.preventDefault();
    selectSupplier(suggestions.value[selectedIndex.value]);
  } else if (event.key === 'Escape') {
    showSuggestions.value = false;
  }
}

function selectSupplier(supplier: Fornecedor) {
  emit('update:modelValue', supplier);
  showSuggestions.value = false;
}
</script>

<style scoped>
.autocomplete-container {
  position: relative;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f5f5f5;
}
</style>

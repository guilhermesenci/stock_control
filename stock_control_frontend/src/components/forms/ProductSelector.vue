<!-- ProductSelector.vue - Componente para seleção de produto -->
<template>
  <div class="form-group">
    <label for="product-search">Produto:</label>
    <div class="autocomplete-container">
      <input 
        id="product-search" 
        type="text" 
        v-model="searchTerm" 
        @input="handleSearch"
        @keydown="handleKeydown"
        @focus="showSuggestions = suggestions.length > 0"
        @blur="hideSuggestions"
        placeholder="Digite o SKU ou nome do produto"
        autocomplete="off"
        required
      />
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-list">
        <div 
          v-for="(product, index) in suggestions" 
          :key="product.codSku"
          :class="['suggestion-item', { active: selectedIndex === index }]"
          @click="selectProduct(product)"
          @mouseover="selectedIndex = index"
        >
          {{ product.codSku }} - {{ product.descricaoItem }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '@/services/api';
import type { Item } from '@/types/item';

interface Props {
  modelValue?: Item | null;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: Item | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
});

const emit = defineEmits<Emits>();

const searchTerm = ref('');
const suggestions = ref<Item[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
let searchTimeout: any = null;

// Sincroniza com o valor do modelo
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchTerm.value = `${newValue.codSku} - ${newValue.descricaoItem}`;
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
      const { data } = await api.get(`/api/v1/itens/?search=${encodeURIComponent(searchTerm.value)}`);
      suggestions.value = data.results || [];
      showSuggestions.value = suggestions.value.length > 0;
      selectedIndex.value = -1;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
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
    selectProduct(suggestions.value[selectedIndex.value]);
  } else if (event.key === 'Escape') {
    showSuggestions.value = false;
  }
}

function selectProduct(product: Item) {
  emit('update:modelValue', product);
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

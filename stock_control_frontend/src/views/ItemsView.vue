<!-- ItemsView.vue -->
<template>
    <div class="items-view view">
      <h1>Cadastro de itens</h1>
      <button class="btn-new-item inclusion-button" @click="showNewItemModal = true">Cadastrar novo item</button>
      <ItemEditModal
        v-if="showNewItemModal"
        :item="emptyItem"
        @cancel="showNewItemModal = false"
        @save="onNewItemSave"
      />
      <ItemEditModal
        v-if="showEditItemModal"
        :item="itemToEdit"
        @cancel="showEditItemModal = false"
        @save="onEditItemSave"
      />
      <div class="items-filters filter-container">
        <h2>Filtros</h2>
        <ItemsFilters v-model="filters" @search="onSearch" />
      </div>
      <div class="items-list list-container">
        <h2>Lista de itens</h2>
        <ItemsList :filters="filters" :refreshKey="refreshKey" @edit="onEditItem" @delete="onDeleteItem" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import ItemsFilters from '@/components/ItemsFilters.vue'
  import ItemsList from '@/components/ItemsList.vue'
  import ItemEditModal from '@/components/ItemEditModal.vue'
  import { itemService, type Item } from '@/services/itemService'
  
  interface ItemFilters {
    itemSKU: string
    itemDescription: string
    showOnlyActiveItems: boolean
  }
  
  const filters = ref<ItemFilters>({
    itemSKU: '',
    itemDescription: '',
    showOnlyActiveItems: true,
  })
  
  // chave reativa para forçar reload
  const refreshKey = ref(0)

  // controle do modal
  const showNewItemModal = ref(false)
  const showEditItemModal = ref(false)
  const itemToEdit = ref<Item | null>(null)
  const emptyItem: Item = {
    codSku: '',
    descricaoItem: '',
    unidMedida: '',
    active: true,
  }

  function onSearch() {
    console.log('ItemsView: Evento de busca recebido')
    console.log('ItemsView: Filtros atuais:', filters.value)
    
    // incrementa para disparar watcher em ItemsList
    refreshKey.value++
    console.log('ItemsView: refreshKey incrementado para:', refreshKey.value)
  }

  // observa mudanças nos filtros
  watch(filters, (newValue) => {
    console.log('ItemsView: Filtros atualizados:', newValue)
    // Não precisamos chamar onSearch aqui, pois o ItemsFilters já emite o evento search
  }, { deep: true })

  async function onNewItemSave(newItem: Item) {
    try {
      await itemService.createItem(newItem)
      showNewItemModal.value = false
      onSearch()
    } catch (err) {
      console.error('Erro ao cadastrar item:', err)
    }
  }

  function onEditItem(item: Item) {
    itemToEdit.value = { ...item }
    showEditItemModal.value = true
  }

  async function onEditItemSave(updatedItem: Item) {
    try {
      await itemService.updateItem(updatedItem.codSku, {
        descricaoItem: updatedItem.descricaoItem,
        unidMedida: updatedItem.unidMedida,
        active: updatedItem.active,
      })
      showEditItemModal.value = false
      onSearch()
    } catch (err) {
      console.error('Erro ao editar item:', err)
    }
  }

  async function onDeleteItem(item: Item) {
    if (confirm(`Tem certeza que deseja deletar o item "${item.descricaoItem}"?`)) {
      try {
        await itemService.deleteItem(item.codSku)
        onSearch()
      } catch (err) {
        console.error('Erro ao deletar item:', err)
      }
    }
  }
  </script>
  
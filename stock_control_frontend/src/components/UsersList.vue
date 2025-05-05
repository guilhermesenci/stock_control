<!-- UsersList.vue -->

<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="email"
        @update:sort="(key) => table.setSort(key as keyof User)"
      >
        <!-- Slot para coluna isMaster -->
        <template #cell-isMaster="{ value }">
          {{ value ? 'Sim' : 'Não' }}
        </template>
  
        <!-- Slot para coluna isActive -->
        <template #cell-isActive="{ value }">
          {{ value ? 'Sim' : 'Não' }}
        </template>
  
        <!-- Slot para coluna permissions -->
        <template #cell-permissions="{ row }">
          <button @click="editUser(row)">Editar permissões</button>
        </template>
  
        <!-- Slot para coluna de ação edit -->
        <template #cell-edit="{ row }">
          <button class="btn-edit" @click="editUser(row)">
            Editar usuário
          </button>
        </template>
      </BaseTable>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import BaseTable from '@/components/BaseTable.vue';
  import { useTable } from '@/composables/useTable';
  import type { ColumnDef } from '@/composables/useTable';
  
  interface User {
    name: string;
    email: string;
    isMaster: boolean;
    isActive: boolean;
    permissions?: string;
  }
  
  // dados iniciais
  const users = ref<User[]>([
    { name: 'João Silva',    email: 'example@example.com',  isMaster: true,  isActive: true  },
    { name: 'Maria Oliveira', email: 'example2@example.com', isMaster: false, isActive: true  },
    { name: 'Pedro Santos',   email: 'example3@example.com', isMaster: false, isActive: false }
  ]);
  
  // Definição de colunas, agora incluindo a coluna 'edit'
  const columns: ColumnDef<User>[] = [
    { key: 'name',        label: 'Nome do usuário',      sortable: true },
    { key: 'email',       label: 'E-mail',               sortable: true },
    { key: 'isMaster',    label: 'É usuário master?',    sortable: true },
    { key: 'isActive',    label: 'Está ativo?',          sortable: true },
    { key: 'permissions', label: 'Permissões',           sortable: false },
    { key: 'edit' as keyof User, label: 'Editar usuário', sortable: false }
  ];
  
  // Composable de tabela (sem filtros nesse exemplo)
  const table = useTable<User>(users, columns);
  
  // Ação de editar
  function editUser(user: User) {
    console.log('Editing user:', user);
    // abra modal ou roteie para formulário de edição
  }
  </script>
  
  <style scoped>
  .btn-edit {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #007bff;
    background: white;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-edit:hover {
    background: #007bff;
    color: white;
  }
  </style>
  
  
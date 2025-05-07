<!-- UsersList.vue -->
<template>
    <div>
        <BaseTable :columns="columns" :rows="table.data.value" :sortKey="table.sortKey.value"
            :sortOrder="table.sortOrder.value" keyField="email"
            @update:sort="(key) => table.setSort(key as keyof User)">
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
                <button class="btn-edit" @click="openPermissionsModal(row)">
                    Editar permissões
                </button>
            </template>

            <!-- Slot para coluna de ação edit -->
            <template #cell-edit="{ row }">
                <button class="btn-edit" @click="openEditModal(row)">
                    Editar usuário
                </button>
            </template>
        </BaseTable>

        <PermissionsModal v-if="selectedUser" :user="selectedUser" :screens="allScreens"
            :initialPermissions="selectedUser.permissionsList" @close="selectedUser = null" @save="onSavePermissions" />

        <!-- Modal de edição de usuário -->
        <UserEditModal
                v-if="selectedUserForEdit"
                :user="selectedUserForEdit"
                @cancel="selectedUserForEdit = null"
                @save="onSaveUser"
            />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseTable from '@/components/BaseTable.vue';
import PermissionsModal from '@/components/PermissionsModal.vue';
import UserEditModal from '@/components/UserEditModal.vue';
import { useTable } from '@/composables/useTable';
import type { ColumnDef } from '@/composables/useTable';

interface User {
    name: string;
    email: string;
    isMaster: boolean;
    isActive: boolean;
    permissionsList: string[];
}

// dados iniciais
const users = ref<User[]>([
    { name: 'João', email: 'joao@x.com', isMaster: true, isActive: true, permissionsList: ['dashboard', 'items'] }
]);

const allScreens = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transações' },
  { id: 'stock', label: 'Custos do Estoque' },
  { id: 'items', label: 'Cadastro de Itens' },
  { id: 'users', label: 'Cadastro de Usuários' },
];

// Definição de colunas, agora incluindo a coluna 'edit'
const columns: ColumnDef<User>[] = [
    { key: 'name', label: 'Nome do usuário', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'isMaster', label: 'É usuário master?', sortable: true },
    { key: 'isActive', label: 'Está ativo?', sortable: true },
    { key: 'permissions' as keyof User, label: 'Permissões', sortable: false },
    { key: 'edit' as keyof User, label: 'Editar usuário', sortable: false }
];

// Composable de tabela (sem filtros nesse exemplo)
const table = useTable<User>(users, columns);

const selectedUser = ref<User|null>(null);
function openPermissionsModal(user: User) {
  selectedUser.value = user;
}

function onSavePermissions(newPermissions: string[]) {
  if (!selectedUser.value) return;
  selectedUser.value.permissionsList = newPermissions;
  // aqui salve via API, ex: userService.updatePermissions(email, newPermissions)
  selectedUser.value = null;
}

// estado para edição de usuário
const selectedUserForEdit = ref<User|null>(null);
function openEditModal(user: User) {
    selectedUserForEdit.value = user;
}

// Ao salvar as alterações do usuário:
function onSaveUser(updated: User) {
    // atualiza no array original
    const idx = users.value.findIndex(u => u.email === updated.email);
    if (idx !== -1) users.value[idx] = updated;
    selectedUserForEdit.value = null;
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
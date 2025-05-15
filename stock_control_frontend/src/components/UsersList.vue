<!-- UsersList.vue -->
<template>
    <div>
        <div class="users-actions">
            <button class="inclusion-button" @click="openCreateModal">Adicionar Usuário</button>
        </div>
        <div class="users-list list-container">
            <BaseTable :columns="columns" :rows="table.data.value" :sortKey="table.sortKey.value"
                :sortOrder="table.sortOrder.value" keyField="id"
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
            <template #cell-permissionsList="{ row }">
                <button class="btn-edit table-btn" @click="openPermissionsModal(row)">
                    Editar permissões
                </button>
            </template>

            <!-- Slot para coluna de ação edit -->
            <template #cell-edit="{ row }">
                <button class="btn-edit table-btn" @click="openEditModal(row)">
                    Editar usuário
                </button>
            </template>

            <!-- Slot para coluna de ação delete -->
            <template #cell-delete="{ row }">
                <button class="btn-delete table-btn" @click="onDelete(row)">
                    Deletar usuário
                </button>
            </template>
        </BaseTable>
        </div>
        <PermissionsModal v-if="selectedUser" :user="selectedUser" :screens="allScreens"
            :initialPermissions="selectedUser.permissionsList" @close="selectedUser = null" @save="onSavePermissions" />

        <!-- Modal de edição de usuário -->
        <UserEditModal
                v-if="selectedUserForEdit"
                :user="selectedUserForEdit"
                @cancel="selectedUserForEdit = null"
                @save="onSaveUser"
            />
            
        <!-- Modal de criação de usuário -->
        <UserCreateModal
                v-if="showCreateModal"
                @cancel="showCreateModal = false"
                @save="onCreateUser"
            />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseTable from '@/components/BaseTable.vue';
import PermissionsModal from '@/components/PermissionsModal.vue';
import UserEditModal from '@/components/UserEditModal.vue';
import UserCreateModal from '@/components/UserCreateModal.vue';
import { useTable } from '@/composables/useTable';
import type { ColumnDef } from '@/composables/useTable';
import userService, { type User, type CreateUserData, type UpdateUserData } from '@/services/userService';

// lista de usuários
const users = ref<User[]>([]);

const allScreens = [
  { id: 'home', label: 'Home' },
  { id: 'estoques', label: 'Estoques' },
  { id: 'registrar_transacao', label: 'Registrar transação' },
  { id: 'consultar_transacoes', label: 'Consultar transações' },
  { id: 'custos_estoque', label: 'Custos do Estoque' },
  { id: 'cadastro_itens', label: 'Cadastro de Itens' },
  { id: 'suppliers', label: 'Cadastro de Fornecedores' },
  { id: 'cadastro_usuarios', label: 'Cadastro de Usuários' }
];

// Definição de colunas, agora incluindo a coluna 'delete'
const columns: ColumnDef<User>[] = [
    { key: 'username', label: 'Nome de usuário', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'firstName', label: 'Nome', sortable: true },
    { key: 'lastName', label: 'Sobrenome', sortable: true },
    { key: 'isMaster', label: 'É usuário master?', sortable: true },
    { key: 'isActive', label: 'Está ativo?', sortable: true },
    { key: 'permissionsList' as keyof User, label: 'Permissões', sortable: false },
    { key: 'edit' as keyof User, label: 'Editar usuário', sortable: false },
    { key: 'delete' as keyof User, label: 'Deletar usuário', sortable: false }
];

// Carregar usuários ao montar o componente
onMounted(async () => {
    try {
        users.value = await userService.getUsers();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
});

// Composable de tabela
const table = useTable<User>(users, columns);

// Gerenciamento de permissões
const selectedUser = ref<User|null>(null);
function openPermissionsModal(user: User) {
  // Verifica se o usuário é master
  if (user.isMaster) {
    alert('Usuários master já possuem acesso total ao sistema. Não é necessário gerenciar suas permissões.');
    return;
  }
  
  selectedUser.value = user;
}

async function onSavePermissions(newPermissions: string[]) {
  if (!selectedUser.value) return;
  
  try {
    const updatedUser = await userService.updatePermissions(
      selectedUser.value.id, 
      newPermissions
    );
    
    // Atualiza o usuário na lista
    const idx = users.value.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) users.value[idx] = updatedUser;
    
    selectedUser.value = null;
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
  }
}

// Gerenciamento de edição de usuário
const selectedUserForEdit = ref<User|null>(null);
function openEditModal(user: User) {
    selectedUserForEdit.value = user;
}

// Ao salvar as alterações do usuário:
async function onSaveUser(updated: UpdateUserData) {
    if (!selectedUserForEdit.value) return;
    
    try {
        const updatedUser = await userService.updateUser(
            selectedUserForEdit.value.id,
            updated
        );
        
        // Atualiza no array original
        const idx = users.value.findIndex(u => u.id === updatedUser.id);
        if (idx !== -1) users.value[idx] = updatedUser;
        
        selectedUserForEdit.value = null;
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
    }
}

// Gerenciamento de criação de usuário
const showCreateModal = ref(false);
function openCreateModal() {
    showCreateModal.value = true;
}

async function onCreateUser(userData: CreateUserData) {
    try {
        const newUser = await userService.createUser(userData);
        users.value.push(newUser);
        showCreateModal.value = false;
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
    }
}

// Função para deletar usuário
async function onDelete(user: User) {
    if (confirm(`Tem certeza que deseja deletar o usuário "${user.username}"?`)) {
        try {
            await userService.deleteUser(user.id);
            // Remove o usuário da lista
            users.value = users.value.filter(u => u.id !== user.id);
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
        }
    }
}
</script>

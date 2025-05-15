<template>
    <div class="side-menu">
        <button @click="toggleMenu" class="menu-button">
            <span>{{ isMenuOpen ? '✖' : '☰' }}</span>
        </button>
        <div v-if="isMenuOpen" class="menu-content">
            <ul>
                <!-- Home sempre visível -->
                <MenuItem class="menu-item" to="/" label="Home" v-if="hasPermission('home')" />
                <MenuItem class="menu-item" to="/estoques" label="Estoques" v-if="hasPermission('estoques')" />
                <MenuItem class="menu-item" to="/registrar-transacao" label="Registrar transação" v-if="hasPermission('registrar_transacao')" />
                <MenuItem class="menu-item" to="/consultar-transacoes" label="Consultar transações" v-if="hasPermission('consultar_transacoes')" />
                <MenuItem class="menu-item" to="/custos" label="Custos do Estoque" v-if="hasPermission('custos_estoque')" />
                <MenuItem class="menu-item" to="/itens" label="Cadastro de Itens" v-if="hasPermission('cadastro_itens')" />
                <MenuItem class="menu-item" to="/fornecedores" label="Cadastro de Fornecedores" v-if="hasPermission('suppliers')" />
                <MenuItem class="menu-item" to="/usuarios" label="Cadastro de Usuários" v-if="hasPermission('cadastro_usuarios')" />
                <MenuItem class="menu-item" to="/logout" label="Logout" @click="handleLogout" />
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, h, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
        authStore.logout()
    }
}

// Verifica se o usuário tem permissão para acessar determinada rota
const hasPermission = (permission: string): boolean => {
    // Se não há usuário atual, não mostra nada
    if (!authStore.currentUser) return false;
    
    // Usuários master têm acesso a tudo
    if (authStore.currentUser.isMaster) return true;
    
    // Verifica se o usuário tem a permissão específica
    return authStore.currentUser.permissionsList.includes(permission);
}

interface MenuItemProps {
    to: string;
    label: string;
    onClick?: () => void;
}

const MenuItem = defineComponent({
    props: {
        to: { type: String, required: true },
        label: { type: String, required: true },
        onClick: { type: Function, required: false },
        class: { type: String, required: false }
    },
    setup(props: MenuItemProps) {
        return () =>
            h('li', [
                h(RouterLink, 
                    { 
                        to: props.to, 
                        class: props.class,
                        onClick: props.onClick
                    }, 
                    props.label
                )
            ]);
    }
});
</script>

<style scoped>

.menu-item {
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.side-menu {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #333;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;    
}

.menu-button {
    background-color: #444;
    border: none;
    padding: 10px;
    cursor: grab;
    font-size: 20px;
}

.menu-item {
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.3s;
}



.menu-button:hover {
    background-color: #555;
}

.menu-content {
    margin-top: 20px;
}

.menu-content ul {
    list-style-type: none;
    padding: 0;
}

.menu-content li {
    margin: 10px 0;
}

.menu-content a {
    color: white;
    text-decoration: none;
}

.menu-content a:hover {
    text-decoration: underline;
}

.menu-content a.active:hover {
    color: #00f;
    text-decoration: none;
}

.menu-content a.active {
    font-weight: bold;
    color: #ff0;
    text-decoration: underline;
}

</style>

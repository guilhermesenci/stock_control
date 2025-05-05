<template>
    <div class="side-menu">
        <button @click="toggleMenu" class="menu-button">
            <span>{{ isMenuOpen ? '✖' : '☰' }}</span>
        </button>
        <div v-if="isMenuOpen" class="menu-content">
            <ul>
                <MenuItem to="/" label="Home" />
                <MenuItem to="/estoques" label="Estoques" />
                <MenuItem to="/registrar-transacao" label="Gegistrar transação" />
                <MenuItem to="/consultar-transacoes" label="Consultar transações" />
                <MenuItem to="/custos" label="Custos do Estoque" />
                <MenuItem to="/itens" label="Cadastro de Itens" />
                <MenuItem to="/usuarios" label="Cadastro de Usuários" />
                <MenuItem to="/logout" label="Logout" />
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue'
import { RouterLink } from 'vue-router'

const isMenuOpen = ref(false)
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

interface MenuItemProps {
    to: string;
    label: string;
}

const MenuItem = defineComponent({
    props: {
        to: { type: String, required: true },
        label: { type: String, required: true }
    },
    setup(props: MenuItemProps) {
        return () =>
            h('li', [
                h(RouterLink, { to: props.to, class: 'active' }, props.label)
            ]);
    }
});
</script>

<style scoped>
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
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    font-size: 20px;
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

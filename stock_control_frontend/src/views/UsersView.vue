<template>
    <div class="users-view">
        <h1>Cadastro de usuários</h1>
        <div class="users-list">
        <h2>Usuários</h2>
            <UsersList />
        </div>
    </div>
</template>
<script setup lang="ts">
import UsersList from '@/components/UsersList.vue';
</script>

<style scoped>
.users-view {
    padding: 16px;
}

.users-list {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    padding: 16px;
    box-sizing: border-box;
}
</style>
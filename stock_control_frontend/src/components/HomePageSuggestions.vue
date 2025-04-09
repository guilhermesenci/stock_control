<script setup lang="ts">

</script>

<template>
    <div class="homepage-title">
        <h1 class="homepage-title-text">Controle de estoque projeto congonhas</h1>
    </div>
    <div class="suggestion-items">
        <h2 class="suggestion-title">Acessados frequentemente</h2>
        <div class="suggestion-item">
            <button class="suggestion-item-button">
                <!-- <img src="../assets/1.png" alt="Suggestion 1" /> -->
                <span>Estoques</span>
            </button>
        </div>
        <div class="suggestion-item">
            <button class="suggestion-item-button">
                <!-- <img src="../assets/2.png" alt="Suggestion 2" /> -->
                <span>Custos do estoque</span>
            </button>
        </div>
        <div class="suggestion-item">
            <button class="suggestion-item-button">
                <!-- <img src="../assets/3.png" alt="Suggestion 3" /> -->
                <span>Registrar transação</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.homepage-title {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    padding-bottom: 100px;
}
.suggestion-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-align: center;
}
.suggestion-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.suggestion-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 40px;
    background-color: #f0f0f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.suggestion-item-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.5rem;
    color: #333;
}
.suggestion-item-button:hover {
    background-color: #bbb;
}
.suggestion-item-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #007bff;
}
.suggestion-item-button img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}
.suggestion-item-button span {
    font-size: 1.5rem;
    font-weight: bold;
}
.suggestion-item-button span:focus {
    outline: none;
    box-shadow: 0 0 0 2px #007bff;
}
.suggestion-item-button span:active {
    transform: scale(0.95);
}
</style>

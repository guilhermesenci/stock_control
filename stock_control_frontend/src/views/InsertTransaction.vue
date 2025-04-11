<template>
    <div class="insert-transaction">
        <h1>Inserir Transação no Estoque</h1>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="sku">SKU do Produto:</label>
                <input
                    type="text"
                    id="sku"
                    v-model="sku"
                    placeholder="Digite o SKU"
                    required
                />
            </div>
            <div class="form-group">
                <label for="product">Produto:</label>
                <input
                    type="text"
                    id="product"
                    v-model="product"
                    readonly
                    placeholder=""
                />
            </div>
            <div class="form-group">
                <label for="quantity">Quantidade:</label>
                <input
                    type="number"
                    id="quantity"
                    v-model="quantity"
                    placeholder="Digite a quantidade"
                    required
                />
            </div>
            <div class="form-group">
                <label>
                    <input
                        type="checkbox"
                        v-model="isEntry"
                    />
                    É entrada?
                </label>
            </div>
            <button type="submit">Salvar Transação</button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sku = ref('');
const product = ref('');
const quantity = ref(0);
const isEntry = ref(false);

const handleSubmit = () => {
    const transaction = {
        sku: sku.value,
        product: product.value,
        quantity: quantity.value,
        isEntry: isEntry.value,
    };
    console.log('Transação salva:', transaction);
};
</script>
<script setup lang="ts">

</script>

<style scoped lang="scss">
    .insert-transaction {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;

    h1 {
        margin-bottom: 20px;
        font-size: 2rem;
    }

    form {
        display: flex;
        flex-direction: column;
        width: 300px;

        .form-group {
            margin-bottom: 15px;

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            input[type="text"],
            input[type="number"] {
                width: 100%;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
        }

        button {
            padding: 10px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background-color: #218838;
            }
        }
    }
}
</style>

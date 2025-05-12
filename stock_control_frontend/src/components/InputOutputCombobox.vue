<template>
    <div class="input-output-combobox">
        <label :for="id" class="combobox-label">{{ label }}</label>
        <select
            :id="id"
            class="combobox-select"
            v-model="selectedValue"
            @change="onSelect"
        >
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.text }}
            </option>
        </select>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue';

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    options: {
        type: Array as () => Array<{ value: string; text: string }>,
        required: true,
    },
    modelValue: {
        type: [Boolean, String],
        required: false,
        default: true
    }
});

const emits = defineEmits(['update:modelValue']);
const selectedValue = ref(props.options[0].value);

// Converter string para boolean quando necessário
function convertToBooleanIfNeeded(value: string | boolean): boolean {
    if (typeof value === 'boolean') return value;
    return value === 'true';
}

const onSelect = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedValue.value = target.value;
    
    // Converte para boolean antes de emitir
    const booleanValue = convertToBooleanIfNeeded(selectedValue.value);
    console.log('Emitting boolean value:', booleanValue);
    emits('update:modelValue', booleanValue);
};

// Inicializa com o valor do modelo
onMounted(() => {
    // Converte para string para o v-model do select
    if (props.modelValue !== undefined) {
        selectedValue.value = String(props.modelValue);
        console.log('Initial value:', selectedValue.value);
    }
});

// Atualiza quando o valor externo mudar
watch(() => props.modelValue, (newValue) => {
    if (newValue !== undefined) {
        selectedValue.value = String(newValue);
        console.log('Value changed to:', selectedValue.value);
    }
});
</script>

<style scoped>
.input-output-combobox {
    margin-bottom: 1rem;
}

.combobox-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.combobox-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}
</style>

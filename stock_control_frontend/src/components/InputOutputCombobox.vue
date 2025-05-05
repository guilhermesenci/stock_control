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
import { ref, defineProps, defineEmits } from 'vue';
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
});
const emits = defineEmits(['update:modelValue']);
const selectedValue = ref(props.options[0].value);
const onSelect = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedValue.value = target.value;
    emits('update:modelValue', selectedValue.value);
};

</script>

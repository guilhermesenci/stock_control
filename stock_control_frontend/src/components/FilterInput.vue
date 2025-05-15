<template>
    <div class="filter-input">
        <label :for="id" class="filter-label">{{ label }}</label>
        <input
            :id="id"
            type="text"
            class="filter-input-field"
            v-model="inputValue"
            @input="onInput"
            :placeholder="placeholder"
        />
    </div>
</template>

<script>
export default {
    name: "FilterInput",
    props: {
        id: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            default: "Type to filter...",
        },
        value: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            inputValue: this.value,
        };
    },
    watch: {
        value(newValue) {
            this.inputValue = newValue;
        },
    },
    methods: {
        onInput() {
            this.$emit("input", this.inputValue);
        },
    },
};
</script>

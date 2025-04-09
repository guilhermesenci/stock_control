<template>
    <div class="filter-checkbox">
        <label>
            <input
                type="checkbox"
                :value="value"
                :checked="modelValue"
                @change="emitChange($event.target.checked)"
            />
            {{ label }}
        </label>
    </div>
</template>

<script>
export default {
    name: "FilterCheckbox",
    props: {
        label: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number, Boolean],
            required: true,
        },
        modelValue: {
            type: [Array, Boolean],
            required: true,
        },
    },
    emits: ["update:modelValue"],
    methods: {
        emitChange(checked) {
            this.$emit("update:modelValue", checked);
        },
    },
};
</script>

<style scoped>
.filter-checkbox {
    margin: 5px 0;
}
label {
    cursor: pointer;
}
</style>
<template>
    <div class="menu-item" @click="handleClick">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "MenuItem",
    props: {
        route: {
            type: String,
            required: true,
        },
    },
    methods: {
        handleClick() {
            this.$router.push(this.route);
        },
    },
};
</script>

<style scoped>
.menu-item {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.menu-item:hover {
    background-color: #f0f0f0;
}
</style>
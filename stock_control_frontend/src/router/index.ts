import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import StocksView from '@/views/StocksView.vue';
import StockCostsView from '@/views/StockCostsView.vue';
import InsertTransaction from '@/views/InsertTransaction.vue';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  // global
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/estoques',
    name: 'Estoques',
    component: StocksView,
  },
  {
    path: '/custos',
    name: 'Custos estoque',
    component: StockCostsView,
  },
  {
    path: '/transacao',
    name: 'Transação',
    component: InsertTransaction,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import StocksView from '@/views/StocksView.vue';
import StockCostsView from '@/views/StockCostsView.vue';
import InsertTransactionView from '@/views/InsertTransactionView.vue';
import SearchTransactionsView from '@/views/SearchTransactionsView.vue';
import ItemsView from '@/views/ItemsView.vue';
import UsersView from '@/views/UsersView.vue';
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
    path: '/registrar-transacao',
    name: 'Transação',
    component: InsertTransactionView,
  },
  {
    path: '/consultar-transacoes',
    name: 'Consultar transações',
    component: SearchTransactionsView,
  },
  {
    path: '/custos',
    name: 'Custos estoque',
    component: StockCostsView,
  },
  {
    path: '/itens',
    name: 'Itens',
    component: ItemsView,
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: UsersView,
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

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
    meta: { requiresAuth: false },
  },
  {
    path: '/estoques',
    name: 'Estoques',
    component: StocksView,
    meta: { requiresAuth: true },
  },
  {
    path: '/registrar-transacao',
    name: 'Transação',
    component: InsertTransactionView,
    meta: { requiresAuth: true },
  },
  {
    path: '/consultar-transacoes',
    name: 'Consultar transações',
    component: SearchTransactionsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/custos',
    name: 'Custos estoque',
    component: StockCostsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/itens',
    name: 'Itens',
    component: ItemsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: UsersView,
    meta: { requiresAuth: true },
  },
  // Rota de fallback para redirecionar para login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redireciona para login se não estiver autenticado
    next({ name: 'Login' });
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // Se estiver autenticado e tentar acessar login, redireciona para home
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;

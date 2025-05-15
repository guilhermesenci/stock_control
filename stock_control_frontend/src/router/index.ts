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
import SuppliersView from '@/views/SuppliersView.vue';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  // global
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true, permission: 'home' },
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
    meta: { requiresAuth: true, permission: 'estoques' },
  },
  {
    path: '/registrar-transacao',
    name: 'Transação',
    component: InsertTransactionView,
    meta: { requiresAuth: true, permission: 'registrar_transacao' },
  },
  {
    path: '/consultar-transacoes',
    name: 'Consultar transações',
    component: SearchTransactionsView,
    meta: { requiresAuth: true, permission: 'consultar_transacoes' },
  },
  {
    path: '/custos',
    name: 'Custos estoque',
    component: StockCostsView,
    meta: { requiresAuth: true, permission: 'custos_estoque' },
  },
  {
    path: '/itens',
    name: 'Itens',
    component: ItemsView,
    meta: { requiresAuth: true, permission: 'cadastro_itens' },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: UsersView,
    meta: { requiresAuth: true, permission: 'cadastro_usuarios' },
  },
  {
    path: '/fornecedores',
    name: 'Fornecedores',
    component: SuppliersView,
    meta: { requiresAuth: true, permission: 'suppliers' },
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redireciona para login se não estiver autenticado
    next({ name: 'Login' });
    return;
  } 
  
  if (to.name === 'Login' && authStore.isAuthenticated) {
    // Se estiver autenticado e tentar acessar login, redireciona para home
    next({ name: 'Home' });
    return;
  }

  // Verifica permissões se a rota exigir autenticação
  if (requiresAuth && to.meta.permission) {
    // Certifica-se de que temos informações do usuário atual
    if (!authStore.currentUser) {
      try {
        // Carrega informações do usuário atual se não estiverem disponíveis
        await authStore.fetchCurrentUser();
      } catch (error) {
        console.error('Erro ao carregar usuário atual:', error);
        next({ name: 'Login' });
        return;
      }
    }

    // Usuários master têm acesso a todas as rotas
    if (authStore.currentUser?.isMaster) {
      next();
      return;
    }

    // Verifica se o usuário tem a permissão necessária
    const requiredPermission = to.meta.permission as string;
    const userPermissions = authStore.currentUser?.permissionsList || [];

    if (!userPermissions.includes(requiredPermission)) {
      // Se não tiver permissão, redireciona para a página inicial ou exibe uma mensagem
      alert(`Você não tem permissão para acessar esta página.`);
      next(from.path); // Volta para a página anterior
      return;
    }
  }

  next();
});

export default router;

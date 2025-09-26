// test/error-handling-demo.ts - Demonstração do novo sistema de tratamento de erros
import { useNotificationStore } from '@/stores/notifications';

/**
 * Demonstração do novo sistema de tratamento de erros
 * Este arquivo pode ser usado para testar diferentes cenários de erro
 */
export function demonstrateErrorHandling() {
  const notificationStore = useNotificationStore();

  // Simula diferentes tipos de erro que podem vir da API

  // 1. Erro de validação do Django REST Framework (caso do SKU duplicado)
  const validationError = {
    response: {
      status: 400,
      data: {
        "codSku": ["Item com este Código SKU já existe."]
      }
    }
  };

  // 2. Erro de validação com múltiplos campos
  const multipleValidationError = {
    response: {
      status: 400,
      data: {
        "codSku": ["Item com este Código SKU já existe."],
        "descricaoItem": ["Este campo é obrigatório."],
        "unidMedida": ["Unidade de medida inválida."]
      }
    }
  };

  // 3. Erro com campo 'detail'
  const detailError = {
    response: {
      status: 404,
      data: {
        "detail": "Item não encontrado."
      }
    }
  };

  // 4. Erro com campo 'message'
  const messageError = {
    response: {
      status: 500,
      data: {
        "message": "Erro interno do servidor."
      }
    }
  };

  // 5. Erro sem dados específicos (statusText)
  const statusTextError = {
    response: {
      status: 401,
      statusText: "Unauthorized"
    }
  };

  // 6. Erro de rede
  const networkError = {
    message: "Network Error"
  };

  console.log('=== Demonstração do Sistema de Tratamento de Erros ===');
  
  // Testa cada tipo de erro
  console.log('\n1. Erro de validação (SKU duplicado):');
  notificationStore.apiError(validationError);
  
  setTimeout(() => {
    console.log('\n2. Erro de validação múltipla:');
    notificationStore.apiError(multipleValidationError);
  }, 2000);
  
  setTimeout(() => {
    console.log('\n3. Erro com detail:');
    notificationStore.apiError(detailError);
  }, 4000);
  
  setTimeout(() => {
    console.log('\n4. Erro com message:');
    notificationStore.apiError(messageError);
  }, 6000);
  
  setTimeout(() => {
    console.log('\n5. Erro com statusText:');
    notificationStore.apiError(statusTextError);
  }, 8000);
  
  setTimeout(() => {
    console.log('\n6. Erro de rede:');
    notificationStore.apiError(networkError);
  }, 10000);
}

// Função para testar programaticamente
export function testErrorHandling() {
  const notificationStore = useNotificationStore();
  
  // Limpa notificações existentes
  notificationStore.clear();
  
  // Executa a demonstração
  demonstrateErrorHandling();
}

// Para usar no console do navegador:
// import { testErrorHandling } from '@/test/error-handling-demo';
// testErrorHandling();

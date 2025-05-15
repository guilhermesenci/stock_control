import api from '@/types/api'
import type { Paginated } from '@/types/api'

// Simple cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

class TransactionCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cacheLifetime: number = 30000; // 30 seconds default cache lifetime
  
  // Generate a cache key from params
  generateKey(endpoint: string, params?: any): string {
    return `${endpoint}|${params ? JSON.stringify(params) : ''}`;
  }
  
  // Get value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.cacheLifetime) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  // Store value in cache
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }
  
  // Clear cache
  clear(): void {
    this.cache.clear();
  }
  
  // Clear cache for specific endpoint
  clearEndpoint(endpoint: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(endpoint)) {
        this.cache.delete(key);
      }
    }
  }
}

// Create a single cache instance
const transactionCache = new TransactionCache();

// Interfaces para objetos camelCase (resposta e envio da API)
export interface Transacao {
  idTransacao?: number
  codNf?: string
  codSku: string
  quantidade: number
  valorUnit: string
  codFornecedor?: number
  is_saida?: boolean  // Flag to indicate this is for a saida transaction (for stock validation)
}

export interface Entrada {
  codEntrada?: number
  transacao: number
  matUsuario: number
  dataEntrada: string
  horaEntrada: string
}

export interface Saida {
  codPedido?: number
  transacao: number
  matUsuario: number
  dataSaida: string
  horaSaida: string
}

// Interface para informações do usuário de inventário
export interface InventoryUserInfo {
  id: number;
  nomeUsuario: string;
}

// Interface para as transações formatadas para a tabela
export interface FormattedTransaction {
  id: string;
  idTransacao: number;
  transactionType: 'entrada' | 'saida';
  date: string;
  time: string;
  sku: string;
  description: string;
  quantity: number;
  unityMeasure: string;
  unitCost: number;
  totalCost: number;
  notaFiscal?: string;
  username?: string;
}

// Interface para parâmetros de busca
export interface TransactionSearchParams {
  sku?: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  notaFiscal?: string;
}

class TransactionService {
  async getTransacoes(page = 1): Promise<Paginated<Transacao>> {
    const { data } = await api.get(`/api/v1/transacoes/`)
    return data
  }

  async createTransacao(t: Omit<Transacao, 'idTransacao'>): Promise<Transacao> {
    console.log('Sending transacao payload:', t);
    
    const { data } = await api.post('/api/v1/transacoes/', t)
    
    // Clear cache after creating a transaction
    transactionCache.clearEndpoint('unified-transactions');
    
    return data
  }

  async getEntradas(page = 1, params?: { dataEntradaAfter?: string; dataEntradaBefore?: string; codNf?: string; codSku?: string }): Promise<Paginated<Entrada>> {
    let url = `/api/v1/entradas/`;
    
    // Add all parameters that are defined
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    console.log('getEntradas: Making API call with URL:', url);
    console.log('getEntradas: Params:', params);
    
    const { data } = await api.get(url);
    console.log('getEntradas: Response:', data);
    
    return data;
  }

  async createEntrada(transacaoId: number, matUsuario: number): Promise<Entrada> {
    const dataEntrada = new Date().toISOString().slice(0, 10);
    const horaEntrada = new Date().toISOString().slice(11, 19);
    
    // Enviar diretamente em camelCase
    const entrada: Entrada = {
      transacao: transacaoId,
      matUsuario: matUsuario,
      dataEntrada: dataEntrada,
      horaEntrada: horaEntrada,
    }
    console.log('Sending entrada payload:', entrada);
    const { data } = await api.post('/api/v1/entradas/', entrada)
    
    // Clear cache after creating an entrada
    transactionCache.clearEndpoint('unified-transactions');
    
    return data
  }

  async getSaidas(page = 1, params?: { dataSaidaAfter?: string; dataSaidaBefore?: string; codSku?: string }): Promise<Paginated<Saida>> {
    let url = `/api/v1/saidas/`;
    
    // Add all parameters that are defined
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    console.log('getSaidas: Making API call with URL:', url);
    console.log('getSaidas: Params:', params);
    
    const { data } = await api.get(url);
    console.log('getSaidas: Response:', data);
    
    return data;
  }

  async createSaida(transacaoId: number, matUsuario: number): Promise<Saida> {
    const dataSaida = new Date().toISOString().slice(0, 10);
    const horaSaida = new Date().toISOString().slice(11, 19);
    
    // Enviar diretamente em camelCase
    const saida: Saida = {
      transacao: transacaoId,
      matUsuario: matUsuario,
      dataSaida: dataSaida,
      horaSaida: horaSaida
    };
    
    console.log('Sending saida payload:', JSON.stringify(saida, null, 2));
    
    try {
      const { data } = await api.post('/api/v1/saidas/', saida);
      console.log('Saida response:', data);
      
      // Clear cache after creating a saida
      transactionCache.clearEndpoint('unified-transactions');
      
      return data;
    } catch (error: any) {
      console.error('Error creating saida:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCurrentUserInventoryInfo(): Promise<InventoryUserInfo> {
    const { data } = await api.get('/api/v1/current-user-inventory-info/');
    console.log('Raw user inventory info response:', data);
    
    return data;
  }

  async createEntradaTransaction(
    codSku: string,
    quantidade: number,
    valorUnit: string,
    matUsuario: number,
    codNf: string,
    codFornecedor: number
  ): Promise<Entrada> {
    // Create Transacao first
    const transacao = await this.createTransacao({
      codNf: codNf,
      codSku,
      quantidade,
      valorUnit,
      codFornecedor,
    });
    
    // Then create Entrada
    return this.createEntrada(transacao.idTransacao!, matUsuario);
  }

  async createSaidaTransaction(
    codSku: string,
    quantidade: number,
    valorUnit: string,
    matUsuario: number
  ): Promise<Saida> {
    console.log('Creating saida transaction for SKU:', codSku);
    
    try {
      // Create Transacao first (without codNf and codFornecedor)
      // Pass is_saida flag to signal this is a transaction for a saida (for backend validation)
      const transacao = await this.createTransacao({
        codSku,
        quantidade,
        valorUnit,
        is_saida: true  // This flag tells the backend to validate stock availability
      });
      
      console.log('Transaction created with ID:', transacao.idTransacao);
      
      // Then create Saida
      return this.createSaida(transacao.idTransacao!, matUsuario);
    } catch (error: any) {
      console.error('Error in createSaidaTransaction:', error.response?.data || error.message);
      throw error;
    }
  }

  async getNotaFiscalByCodNf(codNf: string): Promise<Transacao | null> {
    try {
      const { data } = await api.get(`/api/v1/transacoes/?codNf=${codNf}`);
      if (data.results && data.results.length > 0) {
        return data.results[0]; 
      }
      return null;
    } catch {
      return null;
    }
  }

  async getNotaFiscalByCodNfAndFornecedor(codNf: string, codFornecedor: number): Promise<Transacao | null> {
    try {
      const { data } = await api.get(`/api/v1/transacoes/?codNf=${codNf}&codFornecedor=${codFornecedor}`);
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  // Método para buscar transações combinadas (usando o novo endpoint otimizado)
  async getUnifiedTransactions(params?: TransactionSearchParams): Promise<FormattedTransaction[]> {
    console.log('getUnifiedTransactions: Starting with params:', params);
    
    // Check cache first
    const cacheKey = transactionCache.generateKey('unified-transactions', params);
    const cachedData = transactionCache.get<FormattedTransaction[]>(cacheKey);
    
    if (cachedData) {
      console.log('getUnifiedTransactions: Returning data from cache');
      return cachedData;
    }
    
    // Build URL with parameters
    let url = '/api/v1/unified-transactions/';
    const queryParams: string[] = [];
    
    if (params?.page) {
      queryParams.push(`page=${params.page}`);
    }
    if (params?.dateFrom) {
      queryParams.push(`dateFrom=${encodeURIComponent(params.dateFrom)}`);
    }
    if (params?.dateTo) {
      queryParams.push(`dateTo=${encodeURIComponent(params.dateTo)}`);
    }
    if (params?.notaFiscal) {
      queryParams.push(`notaFiscal=${encodeURIComponent(params.notaFiscal)}`);
    }
    if (params?.sku) {
      queryParams.push(`sku=${encodeURIComponent(params.sku)}`);
    }
    if (params?.description) {
      queryParams.push(`description=${encodeURIComponent(params.description)}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    console.log('getUnifiedTransactions: Making API call with URL:', url);
    
    try {
      const { data } = await api.get(url);
      console.log('getUnifiedTransactions: Response received', data.results.length, 'transactions');
      
      // Store data in cache
      transactionCache.set(cacheKey, data.results);
      
      // The backend already returns data in the expected format
      return data.results;
    } catch (error) {
      console.error('Error in getUnifiedTransactions:', error);
      return [];
    }
  }

  // Método para buscar transações (combina entradas e saídas)
  async getTransactions(params?: TransactionSearchParams): Promise<FormattedTransaction[]> {
    // Use the new optimized endpoint which combines everything in a single call
    try {
      return await this.getUnifiedTransactions(params);
    } catch (error) {
      console.error('Error in unified transactions endpoint, falling back to legacy implementation:', error);
      
      // Original implementation as fallback
      console.log('getTransactions: Starting with params:', params);
      
      const page = params?.page || 1;
      // Updated parameter names to match new filters
      const entradasParams = {
        dataEntradaAfter: params?.dateFrom,
        dataEntradaBefore: params?.dateTo,
        codNf: params?.notaFiscal,
        codSku: params?.sku
      };
      const saidasParams = {
        dataSaidaAfter: params?.dateFrom,
        dataSaidaBefore: params?.dateTo,
        codSku: params?.sku
      };
      
      // Buscar entradas e saídas em paralelo
      console.log('getTransactions: Fetching entradas and saidas in parallel');
      const [entradas, saidas] = await Promise.all([
        this.getEntradas(page, entradasParams),
        this.getSaidas(page, saidasParams)
      ]);
      
      console.log('getTransactions: Received entradas:', entradas);
      console.log('getTransactions: Received saidas:', saidas);
      
      // Array para armazenar transações formatadas
      const transactions: FormattedTransaction[] = [];

      // Processar entradas
      if (entradas && entradas.results && entradas.results.length > 0) {
        for (const entrada of entradas.results) {
          try {
            console.log('Processing entrada:', entrada);
            
            // Pular entradas sem ID de transação
            if (!entrada.transacao) {
              console.warn('Skipping entrada without transacao:', entrada);
              continue;
            }
            
            const { data: transacao } = await api.get(`/api/v1/transacoes/${entrada.transacao}/`);
            
            // Verificar se NF corresponde ao filtro (se houver)
            if (params?.notaFiscal && transacao.codNf !== params.notaFiscal) continue;

            // Verificar se SKU corresponde ao filtro (se houver)
            if (params?.sku && transacao.codSku.toString() !== params.sku) continue;

            // Buscamos dados do item para pegar descrição e unidade de medida
            try {
              const { data: item } = await api.get(`/api/v1/itens/${transacao.codSku}/`);
              
              // Verificar se a descrição corresponde ao filtro (se houver)
              if (params?.description && 
                  !item.descricaoItem.toLowerCase().includes(params.description.toLowerCase())) {
                continue;
              }

              // Use today's date if dataEntrada is undefined
              const dataEntrada = entrada.dataEntrada || new Date().toISOString().split('T')[0];
              const horaEntrada = entrada.horaEntrada || new Date().toISOString().split('T')[1].substring(0, 8);

              // Buscar informações do usuário
              let username = 'N/A';
              try {
                if (entrada.matUsuario) {
                  const { data: user } = await api.get(`/api/v1/usuarios/${entrada.matUsuario}/`);
                  username = user.nomeUsuario || 'N/A';
                } else {
                  console.log('matUsuario is undefined, using default username');
                }
              } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
              }

              transactions.push({
                id: `entrada-${entrada.codEntrada || 'unknown'}`,
                idTransacao: transacao.idTransacao,
                transactionType: 'entrada',
                date: dataEntrada,
                time: horaEntrada,
                sku: transacao.codSku.toString(),
                description: item.descricaoItem || 'N/A',
                quantity: transacao.quantidade,
                unityMeasure: item.unidMedida || 'und',
                unitCost: parseFloat(transacao.valorUnit),
                totalCost: transacao.quantidade * parseFloat(transacao.valorUnit),
                notaFiscal: transacao.codNf,
                username: username
              });
            } catch (error) {
              console.error('Erro ao buscar detalhes do item:', error);
            }
          } catch (error) {
            console.error('Erro ao buscar transação para entrada:', error);
          }
        }
      }

      // Processar saídas
      if (saidas && saidas.results && saidas.results.length > 0 && params?.notaFiscal == null) {
        for (const saida of saidas.results) {
          try {
            console.log('Processing saida:', saida);
            
            // Pular saídas sem ID de transação
            if (!saida.transacao) {
              console.warn('Skipping saida without transacao:', saida);
              continue;
            }
            
            const { data: transacao } = await api.get(`/api/v1/transacoes/${saida.transacao}/`);
            
            // Verificar se SKU corresponde ao filtro (se houver)
            if (params?.sku && transacao.codSku.toString() !== params.sku) continue;

            // Buscamos dados do item para pegar descrição, unidade de medida e custo médio
            try {
              const { data: item } = await api.get(`/api/v1/itens/${transacao.codSku}/`);
              
              // Verificar se a descrição corresponde ao filtro (se houver)
              if (params?.description && 
                  !item.descricaoItem.toLowerCase().includes(params.description.toLowerCase())) {
                continue;
              }

              // Use today's date if dataSaida is undefined
              const dataSaida = saida.dataSaida || new Date().toISOString().split('T')[0];
              const horaSaida = saida.horaSaida || new Date().toISOString().split('T')[1].substring(0, 8);

              // Buscar informações do usuário
              let username = 'N/A';
              try {
                if (saida.matUsuario) {
                  const { data: user } = await api.get(`/api/v1/usuarios/${saida.matUsuario}/`);
                  username = user.nomeUsuario || 'N/A';
                } else {
                  console.log('matUsuario is undefined, using default username');
                }
              } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
              }

              transactions.push({
                id: `saida-${saida.codPedido || 'unknown'}`,
                idTransacao: transacao.idTransacao,
                transactionType: 'saida',
                date: dataSaida,
                time: horaSaida,
                sku: transacao.codSku.toString(),
                description: item.descricaoItem || 'N/A',
                quantity: transacao.quantidade,
                unityMeasure: item.unidMedida || 'und',
                unitCost: parseFloat(transacao.valorUnit) || 0,
                totalCost: transacao.quantidade * (parseFloat(transacao.valorUnit) || 0),
                username: username
              });
            } catch (error) {
              console.error('Erro ao buscar detalhes do item ou custo médio:', error);
            }
          } catch (error) {
            console.error('Erro ao buscar transação para saída:', error);
          }
        }
      }

      // Ordenar por data/hora (mais recente primeiro)
      const sortedTransactions = transactions.sort((a, b) => {
        if (!a.date || !a.time || !b.date || !b.time) {
          return 0; // If any date or time is missing, consider them equal
        }
        
        try {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0; // If dates are invalid, consider them equal
          }
          
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Error sorting transactions:', error);
          return 0;
        }
      });
      
      return sortedTransactions;
    }
  }

  async updateTransacao(transacao: Transacao): Promise<Transacao> {
    const { data } = await api.put(`/api/v1/transacoes/${transacao.idTransacao}/`, transacao);
    return data;
  }

  // Métodos CRUD 
  async updateEntrada(entrada: Entrada): Promise<Entrada> {
    const { data } = await api.put(`/api/v1/entradas/${entrada.codEntrada}/`, entrada);
    return data;
  }

  async updateSaida(saida: Saida): Promise<Saida> {
    const { data } = await api.put(`/api/v1/saidas/${saida.codPedido}/`, saida);
    return data;
  }

  // Métodos para deletar
  async deleteEntrada(codEntrada: number): Promise<void> {
    await api.delete(`/api/v1/entradas/${codEntrada}/`);
  }

  async deleteSaida(codPedido: number): Promise<void> {
    await api.delete(`/api/v1/saidas/${codPedido}/`);
  }

  async deleteTransacao(idTransacao: number): Promise<void> {
    await api.delete(`/api/v1/transacoes/${idTransacao}/`);
  }

  // Método para recalcular e atualizar os custos das saídas subsequentes
  async recalculateSubsequentSaidaCosts(transactionId: number, sku: string): Promise<void> {
    console.log(`Recalculating costs for subsequent transactions of transactionId ${transactionId} and sku ${sku}`);
    
    try {
      // 1. Buscar todas as transações para este SKU
      const allTransactions = await this.getTransactions({
        sku: sku
      });
      console.log('allTransactions:', allTransactions);
      
      // Ordenar as transações por data/hora (mais antiga primeiro)
      allTransactions.sort((a, b) => {
        return a.idTransacao - b.idTransacao;
      });
      
      // 2. Filtrar para obter apenas as transações após a data/hora especificada
      
      
      // 3. Recalcular o custo médio para cada transação
      let entradaQtde = 0;
      let entradaValor = 0;
      let saidaQtde = 0;
      let saidaValor = 0;
      
      // Lista de saídas que precisam ser atualizadas
      const saidasToUpdate: FormattedTransaction[] = [];
      
      // Primeiro passo: Calcular o estoque e valor total até o ponto de deleção/edição
      // Processando transações anteriores à data de modificação
      for (const tx of allTransactions) {
        if (tx.idTransacao <= transactionId) {
          if (tx.transactionType === 'entrada') {
            entradaQtde += tx.quantity;
            entradaValor += tx.quantity * tx.unitCost;
          } else {
            saidaQtde += tx.quantity;
            saidaValor += tx.quantity * tx.unitCost;
          }
        }
      }
      
      // Segundo passo: Para cada transação após a data de modificação
      for (const tx of allTransactions) {
        console.log('tx:', tx);
        if (tx.idTransacao > transactionId) {
          if (tx.transactionType === 'entrada') {
            // Adicionar ao estoque
            entradaQtde += tx.quantity;
            entradaValor += tx.quantity * tx.unitCost;
          } else if (tx.transactionType === 'saida') {
            // Calcular o custo médio atual
            const estoqueAtual = entradaQtde - saidaQtde;
            const valorEstoqueAtual = entradaValor - saidaValor;
            
            let custoMedio = 0;
            if (estoqueAtual > 0) {
              custoMedio = valorEstoqueAtual / estoqueAtual;
            }
            
            console.log(`Calculating cost for exit transaction ${tx.id} at time ${tx.date} ${tx.time}:`);
            console.log(`- Current stock: ${estoqueAtual}, Current value: ${valorEstoqueAtual}`);
            console.log(`- Average cost: ${custoMedio}`);
            
            // Arredondar para 2 casas decimais
            custoMedio = parseFloat(custoMedio.toFixed(2));
            
            // Adicionar à lista de saídas para atualizar
            saidasToUpdate.push({
              ...tx,
              unitCost: custoMedio,
              totalCost: custoMedio * tx.quantity
            });
            
            // Atualizar contadores de saída
            saidaQtde += tx.quantity;
            saidaValor += tx.quantity * custoMedio; // Usar o novo custo médio
          }
        }
      }
      
      console.log(`Found ${saidasToUpdate.length} subsequent exit transactions to update`);
      
      if (saidasToUpdate.length === 0) {
        return; // Nenhuma transação para atualizar
      }
      
      // 4. Atualizar cada saída com seu novo custo médio
      for (const transaction of saidasToUpdate) {
        try {
          const [type, id] = transaction.id.split('-');
          if (type === 'saida') {
            const codPedido = parseInt(id);
            
            // Obter a saída atual
            const { data: saida } = await api.get(`/api/v1/saidas/${codPedido}/`);
            
            // Obter a transação associada
            const { data: transacao } = await api.get(`/api/v1/transacoes/${saida.transacao}/`);
            
            // Atualizar a transação com o novo custo médio
            await api.put(`/api/v1/transacoes/${transacao.idTransacao}/`, {
              codSku: transaction.sku,
              quantidade: transaction.quantity,
              valorUnit: transaction.unitCost.toString(), // Atualiza com o custo médio calculado
            });
            
            console.log(`Updated transaction ${transaction.id} with new unit cost ${transaction.unitCost}`);
          }
        } catch (error) {
          console.error(`Error updating cost for transaction ${transaction.id}:`, error);
        }
      }
      
      // Limpar o cache para forçar recarregamento dos dados atualizados
      transactionCache.clearEndpoint('unified-transactions');
      
    } catch (error) {
      console.error('Error in recalculateSubsequentSaidaCosts:', error);
      throw error;
    }
  }

  // Verifica se a deleção de uma entrada ou a edição de uma transação causaria estoque negativo
  async validateStockWouldRemainPositive(
    sku: string, 
    operationType: 'delete' | 'edit',
    transactionId?: string, 
    newQuantity?: number
  ): Promise<boolean> {
    console.log(`Validating stock levels for SKU ${sku} - operation: ${operationType}`);
    
    try {
      // 1. Buscar todas as transações para este SKU
      const allTransactions = await this.getTransactions({
        sku: sku
      });
      
      // Função para converter datas no formato brasileiro para objetos Date
      const parseDate = (dateStr: string, timeStr: string): Date => {
        // Verificar se a data está no formato brasileiro (DD/MM/YYYY)
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day, 
                         parseInt(timeStr.split(':')[0]),
                         parseInt(timeStr.split(':')[1]),
                         parseInt(timeStr.split(':')[2] || '0'));
        } else {
          // Assumir formato ISO (YYYY-MM-DD)
          return new Date(`${dateStr}T${timeStr}`);
        }
      };
      
      // Ordenar as transações por data/hora (mais antiga primeiro)
      allTransactions.sort((a, b) => {
        const dateA = parseDate(a.date, a.time);
        const dateB = parseDate(b.date, b.time);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Encontrar a transação que estamos modificando/excluindo
      let targetTransaction: FormattedTransaction | undefined;
      if (transactionId) {
        console.log('allTransactions:', allTransactions);
        console.log('transactionId:', transactionId);
        targetTransaction = allTransactions.find(t => t.idTransacao === transactionId);
        
        if (!targetTransaction) {
          console.error(`Transaction with ID ${transactionId} not found`);
          return false;
        }
      }
      
      // Simular o efeito no estoque
      let currentStock = 0;
      
      for (const tx of allTransactions) {
        // Pular a transação que estamos excluindo
        if (operationType === 'delete' && tx.idTransacao === transactionId) {
          continue;
        }
        
        // Aplicar a nova quantidade para a transação que estamos editando
        const transactionQty = (operationType === 'edit' && tx.idTransacao === transactionId && newQuantity !== undefined) 
          ? newQuantity 
          : tx.quantity;
        
        // Atualizar o estoque simulado
        if (tx.transactionType === 'entrada') {
          currentStock += transactionQty;
        } else {
          currentStock -= transactionQty;
        }
        
        // Verificar se o estoque ficou negativo
        if (currentStock < 0) {
          console.error(`Operation would result in negative stock (${currentStock}) after transaction ${tx.id}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in validateStockWouldRemainPositive:', error);
      return false;
    }
  }

  // Método genérico para deletar uma transação pelo ID
  async deleteTransaction(transactionId: string): Promise<void> {
    // Parse the transaction ID to determine the type and real ID
    const [type, id] = transactionId.split('-');
    
    // Se for uma entrada, precisamos recalcular todas as saídas subsequentes
    if (type === 'entrada') {
      try {
        // Primeiro, obter os detalhes da transação a ser excluída
        const codEntrada = parseInt(id);
        const { data: entrada } = await api.get(`/api/v1/entradas/${codEntrada}/`);
        const { data: transacao } = await api.get(`/api/v1/transacoes/${entrada.transacao}/`);
        
        const sku = transacao.codSku.toString();
        const dataEntrada = entrada.dataEntrada;
        const horaEntrada = entrada.horaEntrada;
        const idTransacao = transacao.idTransacao;
        
        // Validar se a exclusão não deixará o estoque negativo
        const isValid = await this.validateStockWouldRemainPositive(
          sku, 
          'delete',
          idTransacao
        );
        
        if (!isValid) {
          throw new Error(
            "Não é possível excluir esta entrada pois resultaria em estoque negativo em algum momento. " +
            "Remova primeiro as saídas posteriores que utilizam este estoque."
          );
        }
        
        // Realizar a exclusão da entrada
        await this.deleteEntrada(parseInt(id));
        
        // Também excluir a transação associada
        await this.deleteTransacao(idTransacao);
        
        // Recalcular custos das saídas subsequentes após a exclusão
        await this.recalculateSubsequentSaidaCosts(idTransacao, sku);
      } catch (error) {
        console.error('Error deleting entrada transaction and recalculating costs:', error);
        throw error;
      }
    } else if (type === 'saida') {
      try {
        // Obter os detalhes da saída para encontrar a transação associada
        const codPedido = parseInt(id);
        const { data: saida } = await api.get(`/api/v1/saidas/${codPedido}/`);
        const idTransacao = saida.transacao;
        
        // Primeiro excluir a saída
        await this.deleteSaida(codPedido);
        
        // Depois excluir a transação
        await this.deleteTransacao(idTransacao);
      } catch (error) {
        console.error('Error deleting saida transaction:', error);
        throw error;
      }
    } else {
      throw new Error(`Unknown transaction type: ${type}`);
    }
    
    // Clear cache after deleting a transaction
    transactionCache.clearEndpoint('unified-transactions');
  }

  // Método para atualizar uma transação (entrada ou saída)
  async updateTransaction(transaction: FormattedTransaction): Promise<void> {
    console.log('transaction:', transaction);
    
    if (transaction.isEntry) {
      // Atualizar uma transação de entrada
    
      const transactionsData = await this.getTransactions({
        sku: transaction.sku,
        notaFiscal: transaction.codNf,
      });


      const transactionData = transactionsData[0]

      const [type, id] = transaction.id.split('-');
      
      // Primeiro, obter a entrada atual para atualizar
      const { data: entrada } = await api.get(`/api/v1/entradas/${id}/`);
      
      // Se a quantidade está sendo reduzida, verificar se isso não resultaria em estoque negativo
      if (transaction.quantity < transactionData.quantity) {
        const isValid = await this.validateStockWouldRemainPositive(
          transaction.sku,
          'edit',
          transaction.idTransacao,
          transaction.quantity
        );
        
        if (!isValid) {
          throw new Error(
            "Não é possível reduzir a quantidade desta entrada pois resultaria em estoque negativo em algum momento. " +
            "Remova primeiro as saídas posteriores que utilizam este estoque."
          );
        }
      }
      
      // Verificar se o valor unitário foi alterado
      const valorUnitAnterior = transactionData.unitCost;
      const valorUnitNovo = transaction.unitCost;
      
      // Atualizar a transação com novos valores
      await api.put(`/api/v1/transacoes/${transactionData.idTransacao}/`, {
        codNf: transactionData.notaFiscal,
        codSku: transaction.sku,
        quantidade: transaction.quantity,
        valorUnit: transaction.unitCost.toString(),
        codFornecedor: transaction.supplierId,
      });
      
      // Se o valor unitário foi alterado ou a quantidade mudou, recalcular custos das saídas subsequentes
      if (valorUnitAnterior !== valorUnitNovo || transaction.quantity !== transactionData.quantity) {
        await this.recalculateSubsequentSaidaCosts(
          transaction.idTransacao,
          transaction.sku
        );
      }
    } else {

      const { data: transacao } = await api.get(`/api/v1/transacoes/${transaction.idTransacao}/`);

      console.log('transaction.sku:', transaction.sku);
      console.log('transacao.codSku:', transacao.codSku);
      console.log('transaction:', transaction);
      console.log('transacao:', transacao);

      const [type, id] = transaction.id.split('-');

      // Para saídas, o formato do ID é "saida-codPedido"
      const codPedido = parseInt(id);
      
      // Obter a saída atual
      const { data: saida } = await api.get(`/api/v1/saidas/${codPedido}/`);
      
      // Se estiver aumentando a quantidade de saída, verificar se há estoque disponível
      if (transaction.quantity > transacao.quantidade || transaction.sku !== transacao.codSku) {
        const isValid = await this.validateStockWouldRemainPositive(
          transaction.sku,
          'edit',
          transaction.idTransacao,
          transaction.quantity
        );
        
        if (!isValid) {
          throw new Error(
            "Não é possível aumentar a quantidade desta saída pois não há estoque suficiente. " +
            "Adicione mais entradas deste item antes de aumentar esta saída."
          );
        }
      }
      
      // Atualizar a transação com novos valores
      await api.put(`/api/v1/transacoes/${transacao.idTransacao}/`, {
        codSku: transaction.sku,
        quantidade: transaction.quantity,
        valorUnit: transaction.unitCost.toString(),
      });
    }
  }
}

export const transactionService = new TransactionService()

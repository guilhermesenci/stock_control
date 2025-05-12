import api from '@/types/api'
import type { Paginated } from '@/types/api'

// Interfaces para objetos camelCase (resposta e envio da API)
export interface Transacao {
  idTransacao?: number
  codNf?: string
  codSku: number
  quantidade: number
  valorUnit: string
  codFornecedor?: number
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
  matUsuario: number;
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
    const { data } = await api.get(`/api/v1/transacoes/?page=${page}`)
    return data
  }

  async createTransacao(t: Omit<Transacao, 'idTransacao'>): Promise<Transacao> {
    console.log('Sending transacao payload:', t);
    const { data } = await api.post('/api/v1/transacoes/', t)
    return data
  }

  async getEntradas(page = 1, params?: { dateFrom?: string; dateTo?: string }): Promise<Paginated<Entrada>> {
    let url = `/api/v1/entradas/?page=${page}`;
    
    if (params?.dateFrom) {
      url += `&dataEntradaAfter=${params.dateFrom}`;
    }
    if (params?.dateTo) {
      url += `&dataEntradaBefore=${params.dateTo}`;
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
    
    return data
  }

  async getSaidas(page = 1, params?: { dateFrom?: string; dateTo?: string }): Promise<Paginated<Saida>> {
    let url = `/api/v1/saidas/?page=${page}`;
    
    if (params?.dateFrom) {
      url += `&dataSaidaAfter=${params.dateFrom}`;
    }
    if (params?.dateTo) {
      url += `&dataSaidaBefore=${params.dateTo}`;
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
      
      return data;
    } catch (error: any) {
      console.error('Error creating saida:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCurrentUserInventoryInfo(): Promise<InventoryUserInfo> {
    const { data } = await api.get('/api/v1/current-user-info/');
    console.log('Raw user info response:', data);
    
    return data;
  }

  async createEntradaTransaction(
    codSku: number,
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
    codSku: number,
    quantidade: number,
    valorUnit: string,
    matUsuario: number
  ): Promise<Saida> {
    console.log('Creating saida transaction for SKU:', codSku);
    
    try {
      // Create Transacao first (without codNf and codFornecedor)
      const transacao = await this.createTransacao({
        codSku,
        quantidade,
        valorUnit,
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

  // Método para buscar transações (combina entradas e saídas)
  async getTransactions(params?: TransactionSearchParams): Promise<FormattedTransaction[]> {
    console.log('getTransactions: Starting with params:', params);
    
    const page = params?.page || 1;
    const dateParams = {
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo
    };
    
    console.log('getTransactions: Using dateParams:', dateParams);
    
    // Buscar entradas e saídas em paralelo
    console.log('getTransactions: Fetching entradas and saidas in parallel');
    const [entradas, saidas] = await Promise.all([
      this.getEntradas(page, dateParams),
      this.getSaidas(page, dateParams)
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

  // Métodos CRUD 
  async updateEntrada(entrada: Entrada): Promise<Entrada> {
    const { data } = await api.put(`/api/v1/entradas/${entrada.codEntrada}/`, entrada);
    return data;
  }

  async updateSaida(saida: Saida): Promise<Saida> {
    const { data } = await api.put(`/api/v1/saidas/${saida.codPedido}/`, saida);
    return data;
  }

  async updateTransacao(transacao: Transacao): Promise<Transacao> {
    const { data } = await api.put(`/api/v1/transacoes/${transacao.idTransacao}/`, transacao);
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

  // Método genérico para deletar uma transação pelo ID
  async deleteTransaction(transactionId: string): Promise<void> {
    // Parse the transaction ID to determine the type and real ID
    const [type, id] = transactionId.split('-');
    
    if (type === 'entrada') {
      await this.deleteEntrada(parseInt(id));
    } else if (type === 'saida') {
      await this.deleteSaida(parseInt(id));
    } else {
      throw new Error(`Unknown transaction type: ${type}`);
    }
  }

  // Método para atualizar uma transação (entrada ou saída)
  async updateTransaction(transaction: FormattedTransaction): Promise<void> {
    const [type, id] = transaction.id.split('-');
    
    if (type === 'entrada') {
      // Atualizar uma transação de entrada
      const codEntrada = parseInt(id);
      
      // Primeiro, obter a entrada atual para atualizar
      const { data: entrada } = await api.get(`/api/v1/entradas/${codEntrada}/`);
      
      // Em seguida, obter a transação associada
      const { data: transacao } = await api.get(`/api/v1/transacoes/${entrada.transacao}/`);
      
      // Atualizar a transação com novos valores
      await api.put(`/api/v1/transacoes/${transacao.idTransacao}/`, {
        codNf: transacao.codNf,
        codSku: parseInt(transaction.sku),
        quantidade: transaction.quantity,
        valorUnit: transaction.unitCost.toString(),
        codFornecedor: transacao.codFornecedor,
      });
      
    } else if (type === 'saida') {
      // Para saídas, o formato do ID é "saida-codPedido"
      const codPedido = parseInt(id);
      
      // Obter a saída atual
      const { data: saida } = await api.get(`/api/v1/saidas/${codPedido}/`);
      
      // Obter a transação associada
      const { data: transacao } = await api.get(`/api/v1/transacoes/${saida.transacao}/`);
      
      // Atualizar a transação com novos valores
      await api.put(`/api/v1/transacoes/${transacao.idTransacao}/`, {
        codSku: parseInt(transaction.sku),
        quantidade: transaction.quantity,
        valorUnit: transaction.unitCost.toString(),
      });
    } else {
      throw new Error(`Unknown transaction type: ${type}`);
    }
  }
}

export const transactionService = new TransactionService()

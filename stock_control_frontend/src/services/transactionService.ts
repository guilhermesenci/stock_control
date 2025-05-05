import api from './api';
import type { AxiosResponse } from 'axios';

export interface NotaFiscal {
  cod_nf: string;
  cod_sku: number;
  quantidade: number;
  valor_unit: string;
}

export interface Entrada {
  cod_entrada: number;
  cod_nf: string;
  mat_usuario: number;
  data_entrada: string; // YYYY-MM-DD
  hora_entrada: string; // HH:MM:SS
}

export interface Saida {
  cod_pedido: number;
  cod_sku: number;
  qtd_saida: number;
  mat_usuario: number;
  data_saida: string; // YYYY-MM-DD
  hora_saida: string; // HH:MM:SS
}

class TransactionService {
  /** Lista notas fiscais (paginação opcional) */
  async getNotasFiscais(page = 1): Promise<AxiosResponse<NotaFiscal[]>> {
    const res = await api.get(`/vi/notas-fiscais/?page=${page}`);
    return res;
  }

  /** Cria uma nota fiscal */
  async createNotaFiscal(nota: NotaFiscal): Promise<NotaFiscal> {
    const res: AxiosResponse<NotaFiscal> = await api.post(
      `/vi/notas-fiscais/`,
      nota
    );
    return res.data;
  }

  /** Lista entradas */
  async getEntradas(page = 1): Promise<AxiosResponse<Entrada[]>> {
    const res = await api.get(`/vi/entradas/?page=${page}`);
    return res;
  }

  /** Registra uma nova entrada */
  async createEntrada(entrada: Entrada): Promise<Entrada> {
    const res: AxiosResponse<Entrada> = await api.post(
      `/vi/entradas/`,
      entrada
    );
    return res.data;
  }

  /** Lista saídas */
  async getSaidas(page = 1): Promise<AxiosResponse<Saida[]>> {
    const res = await api.get(`/vi/saidas/?page=${page}`);
    return res;
  }

  /** Registra uma nova saída */
  async createSaida(saida: Saida): Promise<Saida> {
    const res: AxiosResponse<Saida> = await api.post(`/vi/saidas/`, saida);
    return res.data;
  }

  /** Exemplo de filtro de transações por SKU */
  async filterBySku(cod_sku: number): Promise<AxiosResponse<(Entrada | Saida)[]>> {
    const res = await api.get(`/vi/entradas/?cod_sku=${cod_sku}`);
    const res2 = await api.get(`/vi/saidas/?cod_sku=${cod_sku}`);
    return {
      ...res, // pega status e headers de res
      data: [...res.data, ...res2.data],
    };
  }
}

export const transactionService = new TransactionService();

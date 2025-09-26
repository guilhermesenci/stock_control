// types/transaction.ts
import type { BaseEntity } from './common';

/**
 * Interface para formulário de transação
 */
export interface TransactionForm {
  isEntry: boolean;
  supplierId?: number;
  supplierName?: string;
  codNf?: string;
  sku: string;
  product: string;
  quantity: number;
  unitCost: number;
}

/**
 * Interface para transação base
 */
export interface Transaction extends BaseEntity {
  codNf?: string;
  codSku: string;
  quantidade: number;
  valorUnit: string;
  codFornecedor?: number;
  is_saida?: boolean;
}

/**
 * Interface para entrada
 */
export interface Entrada extends BaseEntity {
  transacao: number;
  matUsuario: number;
  dataEntrada: string;
  horaEntrada: string;
}

/**
 * Interface para saída
 */
export interface Saida extends BaseEntity {
  transacao: number;
  matUsuario: number;
  dataSaida: string;
  horaSaida: string;
}

/**
 * Interface para informações do usuário de inventário
 */
export interface InventoryUserInfo {
  id: number;
  nomeUsuario: string;
}

/**
 * Interface para transações formatadas para exibição
 */
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

/**
 * Interface para parâmetros de busca de transações
 */
export interface TransactionSearchParams {
  sku?: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  notaFiscal?: string;
}
  
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
  
// types/item.ts
export interface ItemDTO {
  cod_sku: number;
  descricao_item: string;
  unid_medida: string;
  active?: boolean;
}

export interface Item {
  codSku: number;
  descricaoItem: string;
  unidMedida: string;
  active: boolean;
} 
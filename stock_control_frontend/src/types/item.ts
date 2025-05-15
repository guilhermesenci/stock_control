// types/item.ts
export interface ItemDTO {
  cod_sku: string;
  descricao_item: string;
  unid_medida: string;
  active?: boolean;
}

export interface Item {
  codSku: string;
  descricaoItem: string;
  unidMedida: string;
  active: boolean;
} 
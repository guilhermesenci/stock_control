import api from '@/types/api'
import type { Paginated } from '@/types/api'
import { mapPaginated } from '@/types/api'

export interface NotaFiscalDTO {
  cod_nf:    string
  cod_sku:   number
  quantidade:number
  valor_unit:string
}

export interface EntradaDTO {
  cod_entrada: number
  cod_nf:      string
  mat_usuario: number
  data_entrada:string
  hora_entrada:string
}

export interface SaidaDTO {
  cod_pedido: number
  cod_sku:    number
  qtd_saida:  number
  mat_usuario:number
  data_saida: string
  hora_saida: string
}

/** CamelCase models */
export interface NotaFiscal {
  codNf:      string
  codSku:     number
  quantidade: number
  valorUnit:  string
}

export interface Entrada {
  codEntrada: number
  codNf:      string
  matUsuario: number
  dataEntrada:string
  horaEntrada:string
}

export interface Saida {
  codPedido: number
  codSku:    number
  qtdSaida:  number
  matUsuario:number
  dataSaida: string
  horaSaida: string
}

class TransactionService {
  async getNotasFiscais(page = 1): Promise<Paginated<NotaFiscal>> {
    const { data } = await api.get(`/vi/notas-fiscais/?page=${page}`)
    return mapPaginated<NotaFiscalDTO, NotaFiscal>(data, (n) => ({
      codNf:      n.cod_nf,
      codSku:     n.cod_sku,
      quantidade: n.quantidade,
      valorUnit:  n.valor_unit,
    }))
  }

  async createNotaFiscal(n: NotaFiscal): Promise<NotaFiscal> {
    const dto: NotaFiscalDTO = {
      cod_nf:     n.codNf,
      cod_sku:    n.codSku,
      quantidade: n.quantidade,
      valor_unit: n.valorUnit,
    }
    const { data } = await api.post<NotaFiscalDTO>('/vi/notas-fiscais/', dto)
    return {
      codNf:      data.cod_nf,
      codSku:     data.cod_sku,
      quantidade: data.quantidade,
      valorUnit:  data.valor_unit,
    }
  }

  async getEntradas(page = 1): Promise<Paginated<Entrada>> {
    const { data } = await api.get(`/vi/entradas/?page=${page}`)
    return mapPaginated<EntradaDTO, Entrada>(data, (e) => ({
      codEntrada: e.cod_entrada,
      codNf:      e.cod_nf,
      matUsuario: e.mat_usuario,
      dataEntrada:e.data_entrada,
      horaEntrada:e.hora_entrada,
    }))
  }

  async createEntrada(ent: Entrada): Promise<Entrada> {
    const dto: EntradaDTO = {
      cod_entrada: ent.codEntrada,
      cod_nf:      ent.codNf,
      mat_usuario: ent.matUsuario,
      data_entrada:ent.dataEntrada,
      hora_entrada:ent.horaEntrada,
    }
    const { data } = await api.post<EntradaDTO>('/vi/entradas/', dto)
    return {
      codEntrada: data.cod_entrada,
      codNf:      data.cod_nf,
      matUsuario: data.mat_usuario,
      dataEntrada:data.data_entrada,
      horaEntrada:data.hora_entrada,
    }
  }

  async getSaidas(page = 1): Promise<Paginated<Saida>> {
    const { data } = await api.get(`/vi/saidas/?page=${page}`)
    return mapPaginated<SaidaDTO, Saida>(data, (s) => ({
      codPedido: s.cod_pedido,
      codSku:    s.cod_sku,
      qtdSaida:  s.qtd_saida,
      matUsuario:s.mat_usuario,
      dataSaida: s.data_saida,
      horaSaida: s.hora_saida,
    }))
  }

  async createSaida(out: Saida): Promise<Saida> {
    const dto: SaidaDTO = {
      cod_pedido: out.codPedido,
      cod_sku:    out.codSku,
      qtd_saida:  out.qtdSaida,
      mat_usuario:out.matUsuario,
      data_saida: out.dataSaida,
      hora_saida: out.horaSaida,
    }
    const { data } = await api.post<SaidaDTO>('/vi/saidas/', dto)
    return {
      codPedido: data.cod_pedido,
      codSku:    data.cod_sku,
      qtdSaida:  data.qtd_saida,
      matUsuario:data.mat_usuario,
      dataSaida: data.data_saida,
      horaSaida: data.hora_saida,
    }
  }
}

export const transactionService = new TransactionService()

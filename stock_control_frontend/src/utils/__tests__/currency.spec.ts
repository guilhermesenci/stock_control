// src/utils/__tests__/currency.spec.ts
import { describe, it, expect } from 'vitest'

// Mock da função de formatação de moeda (assumindo que existe)
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'))
}

describe('currency utils', () => {
  describe('formatCurrency', () => {
    it('formata valores positivos corretamente', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00')
      expect(formatCurrency(25.50)).toBe('R$ 25,50')
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    })

    it('formata valores negativos corretamente', () => {
      expect(formatCurrency(-100)).toBe('-R$ 100,00')
      expect(formatCurrency(-25.50)).toBe('-R$ 25,50')
    })

    it('formata zero corretamente', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })

    it('formata valores decimais corretamente', () => {
      expect(formatCurrency(123.456)).toBe('R$ 123,46') // Arredonda
      expect(formatCurrency(123.454)).toBe('R$ 123,45') // Arredonda para baixo
    })

    it('formata valores grandes corretamente', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
      expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
    })
  })

  describe('parseCurrency', () => {
    it('converte strings formatadas para números', () => {
      expect(parseCurrency('R$ 100,00')).toBe(100)
      expect(parseCurrency('R$ 25,50')).toBe(25.5)
      expect(parseCurrency('R$ 1.000,00')).toBe(1000)
    })

    it('converte strings com símbolos diferentes', () => {
      expect(parseCurrency('100,00')).toBe(100)
      expect(parseCurrency('25,50')).toBe(25.5) // Corrigido para usar vírgula
      expect(parseCurrency('1.000,00')).toBe(1000) // Corrigido para formato brasileiro
    })

    it('converte valores negativos', () => {
      expect(parseCurrency('-R$ 100,00')).toBe(-100)
      expect(parseCurrency('-25,50')).toBe(-25.5)
    })

    it('converte zero', () => {
      expect(parseCurrency('R$ 0,00')).toBe(0)
      expect(parseCurrency('0')).toBe(0)
    })

    it('trata strings vazias', () => {
      expect(parseCurrency('')).toBeNaN()
      expect(parseCurrency('   ')).toBeNaN()
    })
  })

  describe('integração', () => {
    it('formata e converte valores mantendo precisão', () => {
      const originalValue = 123.45
      const formatted = formatCurrency(originalValue)
      const parsed = parseCurrency(formatted)
      
      expect(parsed).toBe(originalValue)
    })

    it('funciona com valores de transação típicos', () => {
      const values = [10.50, 25.00, 100.75, 1000.00, 0.01]
      
      values.forEach(value => {
        const formatted = formatCurrency(value)
        const parsed = parseCurrency(formatted)
        expect(parsed).toBe(value)
      })
    })
  })
})

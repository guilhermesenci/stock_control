/**
 * Formata um número inteiro para o formato brasileiro (com pontos como separadores de milhar)
 * @param value Número inteiro a ser formatado
 * @returns String formatada (ex: 250000 => "250.000")
 */
export function formatInteger(value: number): string {
    if (value ===  null || value === undefined) {
        return "-";
    }
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formata um número decimal para o formato brasileiro (com pontos como separadores de milhar e vírgula para decimais)
 * @param value Número decimal a ser formatado
 * @returns String formatada (ex: 2500.00 => "2.500,00")
 */
export function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Converte uma string formatada no padrão brasileiro para um número inteiro
 * @param value String formatada (ex: "250.000")
 * @returns Número inteiro (ex: 250000)
 */
export function parseInteger(value: string): number | null {
  if (!value || value === "-") {
    return null;
  }
  
  // Remove todos os pontos e converte para número
  return parseInt(value.replace(/\./g, ''), 10);
}

/**
 * Converte uma string formatada no padrão brasileiro para um número decimal
 * @param value String formatada (ex: "2.500,00")
 * @returns Número decimal (ex: 2500.00)
 */
export function parseDecimal(value: string): number | null {
  if (!value || value === "-") {
    return null;
  }
  
  // Remove pontos, substitui vírgula por ponto e converte para número
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}

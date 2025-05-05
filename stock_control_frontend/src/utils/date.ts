/** Converte "DD/MM/YYYY" em número de milissegundos desde 1970 */
export function parseBrazilianDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    // mês no construtor Date é 0‑indexado
    return new Date(year, month - 1, day).getTime();
  }
  
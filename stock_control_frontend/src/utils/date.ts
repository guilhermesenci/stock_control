/** Converte "DD/MM/YYYY" em número de milissegundos desde 1970 */
export function parseBrazilianDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    // mês no construtor Date é 0‑indexado
    return new Date(year, month - 1, day).getTime();
}

/** Formata uma data do formato ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/YYYY) */
export function formatDateToBrazilian(isoDate: string): string {
    // Se a data já estiver no formato brasileiro, retorna como está
    if (isoDate.includes('/')) return isoDate;
    
    try {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error('Erro ao formatar data:', e);
        return isoDate; // Retorna a string original em caso de erro
    }
}
  
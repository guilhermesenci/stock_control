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

/** Converte uma data do formato brasileiro (DD/MM/YYYY) para o formato ISO (YYYY-MM-DD) */
export function formatBrazilianDateToISO(brazilianDate: string): string {
    // Se a data já estiver no formato ISO, retorna como está
    if (brazilianDate.includes('-')) return brazilianDate;
    
    try {
        const [day, month, year] = brazilianDate.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
        console.error('Erro ao converter data brasileira para ISO:', e);
        return brazilianDate; // Retorna a string original em caso de erro
    }
}

/** Obtém a data atual no formato brasileiro (DD/MM/YYYY) */
export function getCurrentBrazilianDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

/** Obtém a data atual no formato ISO (YYYY-MM-DD) */
export function getCurrentISODate(): string {
    return new Date().toISOString().split('T')[0];
}
  
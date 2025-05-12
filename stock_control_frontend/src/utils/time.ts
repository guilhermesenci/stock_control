export function parseConsumptionTime(input: string | null): string {
  if (!input) return 'N/A';
  
  const [valueStr, unit] = input.split(' ');
  const value = Number(valueStr);
  
  if (isNaN(value)) return 'N/A';
  
  switch (unit) {
    case 'dia':
    case 'dias':
      return `${value} dia${value !== 1 ? 's' : ''}`;
    case 'semana':
    case 'semanas':
      return `${value} semana${value !== 1 ? 's' : ''}`;
    case 'mês':
    case 'meses':
      return `${value} ${value === 1 ? 'mês' : 'meses'}`;
    case 'ano':
    case 'anos':
      return `${value} ano${value !== 1 ? 's' : ''}`;
    default:
      return input; // Retorna o input original se não conseguir parsear
  }
}
  
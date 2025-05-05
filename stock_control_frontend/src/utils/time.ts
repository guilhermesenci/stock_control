export function parseConsumptionTime(input: string): number {
    const [valueStr, unit] = input.split(' ');
    const value = Number(valueStr);
  
    switch (unit) {
      case 'dia':
      case 'dias':
        return value;
      case 'semana':
      case 'semanas':
        return value * 7;
      case 'mês':
      case 'meses':
        return value * 30;
      case 'ano':
      case 'anos':
        return value * 365;
      default:
        return 0;
    }
  }
  
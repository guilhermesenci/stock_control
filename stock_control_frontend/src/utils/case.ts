// src/utils/case.ts
/**
 * Converte uma string de snake_case para camelCase
 * @param str String em snake_case
 * @returns String em camelCase
 */
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte recursivamente as chaves de um objeto de snake_case para camelCase
 * @param data Objeto ou array com chaves em snake_case
 * @returns Objeto ou array com chaves em camelCase
 */
export function toCamelCase(data: any): any {
    if (data === null || data === undefined || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => toCamelCase(item));
    }

    return Object.keys(data).reduce((result: any, key: string) => {
        const camelKey = snakeToCamel(key);
        result[camelKey] = toCamelCase(data[key]);
        return result;
    }, {});
}

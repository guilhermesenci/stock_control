// src/utils/case.ts
function snakeToCamel(s: string): string {
    return s.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
export function toCamelCase<T>(input: any): T {
    if (Array.isArray(input)) {
        return input.map((item) => toCamelCase(item)) as any;
    }
    if (input !== null && typeof input === 'object') {
        return Object.entries(input).reduce((acc, [key, value]) => {
            const camelKey = snakeToCamel(key);
            (acc as any)[camelKey] = toCamelCase(value);
            return acc;
        }, {} as Record<string, any>) as T;
    }
    return input;
}

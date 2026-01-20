/**
 * Безопасное преобразование значения в массив
 * Если значение уже массив - возвращает его
 * Если это объект с полем results - возвращает results
 * Иначе возвращает пустой массив
 */
export function ensureArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === 'object' && 'results' in value && Array.isArray(value.results)) {
    return value.results;
  }
  return [];
}

/**
 * Безопасный вызов map на значении
 */
export function safeMap<T, R>(value: any, mapper: (item: T, index: number) => R): R[] {
  const array = ensureArray<T>(value);
  return array.map(mapper);
}

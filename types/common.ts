/**
 * 🧩 공통 유틸리티 타입 및 함수
 * 코드 중복을 줄이고 재사용성을 높이기 위한 유틸리티
 */

// 제네릭 상태 관리 타입
export interface GenericState<T> {
  data: T;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string | null;
}

// 상태 업데이트를 위한 제네릭 리듀서
export function createGenericReducer<T>(initialState: T) {
  return function reducer(
    state: GenericState<T>, 
    action: 
      | { type: 'SET_DATA'; payload: Partial<T> }
      | { type: 'SET_STATUS'; payload: GenericState<T>['status'] }
      | { type: 'SET_ERROR'; payload: string | null }
  ): GenericState<T> {
    switch (action.type) {
      case 'SET_DATA':
        return { 
          ...state, 
          data: { ...state.data, ...action.payload },
          status: 'success'
        };
      case 'SET_STATUS':
        return { ...state, status: action.payload };
      case 'SET_ERROR':
        return { 
          ...state, 
          status: 'error', 
          error: action.payload 
        };
      default:
        return state;
    }
  };
}

// 성능 측정 유틸리티
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T, 
  label: string = 'Function'
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`🚀 ${label} 성능: ${end - start}ms`);
    return result;
  }) as T;
}

// 안전한 상태 업데이트를 위한 유틸리티
export function safeStateUpdate<T>(
  currentState: T, 
  updates: Partial<T>
): T {
  return { ...currentState, ...updates };
}

// 조건부 상태 업데이트
export function conditionalUpdate<T>(
  condition: boolean, 
  updateFn: (state: T) => Partial<T>
) {
  return (state: T): T => 
    condition ? { ...state, ...updateFn(state) } : state;
}

// 로깅 데코레이터
export function LogMethod(
  target: any, 
  propertyKey: string, 
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`🔍 Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`✅ ${propertyKey} result:`, result);
    return result;
  };

  return descriptor;
}

// 제네릭 캐시 유틸리티
export class GenericCache<T> {
  private cache: Map<string, T> = new Map();

  set(key: string, value: T) {
    this.cache.set(key, value);
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

// 배열 유틸리티
export const ArrayUtils = {
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> =>
    array.reduce((result, item) => {
      const groupKey = String(item[key]);
      return {
        ...result,
        [groupKey]: [...(result[groupKey] || []), item]
      };
    }, {} as Record<string, T[]>),

  uniqueBy: <T>(array: T[], key: keyof T): T[] =>
    Array.from(
      new Map(array.map(item => [item[key], item])).values()
    ),

  findLast: <T>(
    array: T[],
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): T | undefined =>
    array.slice().reverse().find(predicate)
};

// 객체 유틸리티
export const ObjectUtils = {
  omit: <T extends object, K extends keyof T>(
    obj: T, 
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },

  pick: <T extends object, K extends keyof T>(
    obj: T, 
    keys: K[]
  ): Pick<T, K> => 
    keys.reduce((result, key) => ({
      ...result,
      [key]: obj[key]
    }), {} as Pick<T, K>)
};

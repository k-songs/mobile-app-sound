import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 🔧 AsyncStorage를 쉽게 사용할 수 있는 커스텀 훅
 *
 * @param key - 저장소 키
 * @param initialValue - 초기값
 * @returns [storedValue, setValue, loading, error]
 */
export const useAsyncStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => Promise<void>, boolean, string | null] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 저장소에서 값 불러오기
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setLoading(true);
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Storage error');
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // 값 저장하기
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Storage error');
    }
  };

  return [storedValue, setValue, loading, error];
};

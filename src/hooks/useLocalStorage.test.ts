import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage에 값이 없을 때 초기값을 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('localStorage에 저장된 값을 초기값으로 불러온다', () => {
    localStorage.setItem('test-key', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('saved');
  });

  it('값이 변경되면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));
    act(() => result.current[1]('new value'));
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new value');
  });

  it('함수형 업데이터로 값을 변경하면 localStorage에 저장한다', () => {
    localStorage.setItem('test-key', JSON.stringify(1));
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    act(() => result.current[1]((prev) => (prev as number) + 1));
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe(2);
  });

  it('localStorage에 유효하지 않은 JSON이 있으면 초기값을 반환한다', () => {
    localStorage.setItem('test-key', 'invalid{{json');
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('객체 타입 값을 직렬화하여 저장하고 복원한다', () => {
    const { result } = renderHook(() => useLocalStorage<{ a: number }>('test-key', { a: 0 }));
    act(() => result.current[1]({ a: 42 }));
    const restored = JSON.parse(localStorage.getItem('test-key')!);
    expect(restored).toEqual({ a: 42 });
  });
});

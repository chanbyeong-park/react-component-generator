import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

describe('useComponentGenerator - localStorage 영속화', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage에 저장된 컴포넌트를 마운트 시 불러온다', () => {
    const stored = [
      { id: 'c1', prompt: '버튼', code: 'render(<button />)', createdAt: new Date('2024-01-01').toISOString() },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].id).toBe('c1');
  });

  it('불러온 컴포넌트의 createdAt은 Date 인스턴스다', () => {
    const stored = [
      { id: 'c1', prompt: '버튼', code: 'render(<button />)', createdAt: new Date('2024-06-01').toISOString() },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('localStorage 데이터가 없으면 빈 배열로 시작한다', () => {
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(0);
  });

  it('컴포넌트를 삭제하면 localStorage도 업데이트된다', async () => {
    const stored = [
      { id: 'a', prompt: 'A', code: 'render(<div />)', createdAt: new Date().toISOString() },
      { id: 'b', prompt: 'B', code: 'render(<span />)', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.removeComponent('a'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('rcg:components')!);
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('b');
    });
  });

  it('전체 삭제 시 localStorage도 빈 배열로 갱신된다', async () => {
    const stored = [
      { id: 'x', prompt: 'X', code: 'render(<p />)', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.clearAll());

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('rcg:components')!);
      expect(saved).toHaveLength(0);
    });
  });
});

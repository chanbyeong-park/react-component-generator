import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeView } from './CodeView';

const SAMPLE_CODE = 'const hello = () => "world";';

describe('CodeView', () => {
  it('코드를 화면에 표시한다', () => {
    render(<CodeView code={SAMPLE_CODE} />);
    expect(screen.getByText(SAMPLE_CODE)).toBeInTheDocument();
  });

  it('초기에 복사 버튼이 "복사" 텍스트로 표시된다', () => {
    render(<CodeView code={SAMPLE_CODE} />);
    expect(screen.getByRole('button', { name: '복사' })).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 "복사됨!"으로 변경된다', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<CodeView code={SAMPLE_CODE} />);
    await userEvent.click(screen.getByRole('button', { name: '복사' }));
    expect(screen.getByRole('button', { name: '복사됨!' })).toBeInTheDocument();
  });
});

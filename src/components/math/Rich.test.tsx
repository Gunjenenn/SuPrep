import { describe, expect, test } from 'bun:test';
import { render } from '@/test/render';
import { parseRich } from './parse-rich';
import { Rich } from './Rich';

describe('parseRich', () => {
  test('splits text, math and bold', () => {
    expect(parseRich('If $3x=15$, find **x**.')).toEqual([
      { k: 't', v: 'If ' },
      { k: 'm', v: '3x=15' },
      { k: 't', v: ', find ' },
      { k: 'b', v: 'x' },
      { k: 't', v: '.' },
    ]);
  });

  test('escaped dollars stay as text', () => {
    expect(parseRich('costs \\$40 or $x$')).toEqual([
      { k: 't', v: 'costs $40 or ' },
      { k: 'm', v: 'x' },
    ]);
  });

  test('plain text is one part', () => {
    expect(parseRich('Сайн уу')).toEqual([{ k: 't', v: 'Сайн уу' }]);
  });
});

describe('<Rich>', () => {
  test('renders KaTeX for math and <strong> for bold', () => {
    const { container } = render(<Rich text={'**Налалт** нь $m=\\frac{2}{3}$\nдараагийн мөр'} />);
    expect(container.querySelector('strong')?.textContent).toBe('Налалт');
    expect(container.querySelector('.katex')).not.toBeNull();
    expect(container.querySelectorAll('br').length).toBe(1);
  });
});

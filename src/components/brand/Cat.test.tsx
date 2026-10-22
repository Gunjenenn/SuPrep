import { describe, expect, test } from 'bun:test';
import { render } from '@/test/render';
import { CatHead, type CatMood, CatSitting } from './Cat';

const MOODS: CatMood[] = ['idle', 'happy', 'think', 'wow', 'sleep', 'wink', 'focus'];

describe('CatHead', () => {
  test.each(MOODS)('renders mood %s with an accessible label', (mood) => {
    const { getByRole } = render(<CatHead mood={mood} size={80} />);
    const svg = getByRole('img', { name: 'Суу муур' });
    expect(svg.getAttribute('width')).toBe('80');
  });

  test('happy and sleep draw arcs instead of open eyes', () => {
    const open = render(<CatHead mood="idle" />).container.querySelectorAll('.cat-eye').length;
    const happy = render(<CatHead mood="happy" />).container.querySelectorAll('.cat-eye').length;
    expect(open).toBe(2);
    expect(happy).toBe(0);
  });

  test('CatSitting can hide the scarf', () => {
    const withScarf = render(<CatSitting />).container.querySelectorAll('path').length;
    const without = render(<CatSitting scarf={false} />).container.querySelectorAll('path').length;
    expect(withScarf).toBeGreaterThan(without);
  });
});

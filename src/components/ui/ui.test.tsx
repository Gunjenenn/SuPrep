import { afterEach, describe, expect, mock, test } from 'bun:test';
import { act, fireEvent, render, screen } from '@/test/render';
import { Bar } from './Bar';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Modal } from './Modal';
import { Pill } from './Pill';
import { SegmentedControl } from './SegmentedControl';
import { Switch } from './Switch';
import { clearToasts, Toaster, toast } from './toast';

describe('Button', () => {
  test('3D variants get the btn3d class and token colors', () => {
    render(<Button variant="lime">Эхлэх</Button>);
    const b = screen.getByRole('button', { name: 'Эхлэх' });
    expect(b.className).toContain('btn3d');
    expect(b.getAttribute('style')).toContain('var(--c-lime)');
    expect(b.getAttribute('type')).toBe('button');
  });

  test('ghost has no extrusion', () => {
    render(<Button variant="ghost">Алгасах</Button>);
    expect(screen.getByRole('button').className).not.toContain('btn3d');
  });

  test('calls onClick unless disabled', () => {
    const onClick = mock();
    const { rerender } = render(<Button onClick={onClick}>Шалгах</Button>);
    fireEvent.click(screen.getByRole('button'));
    rerender(
      <Button onClick={onClick} disabled>
        Шалгах
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

test('Pill renders its tone classes', () => {
  render(<Pill tone="danger">Буруу</Pill>);
  expect(screen.getByText('Буруу').className).toContain('text-danger');
});

test('Bar reports a clamped percentage', () => {
  render(<Bar value={1.7} label="ахиц" />);
  expect(screen.getByRole('progressbar', { name: 'ахиц' }).getAttribute('aria-valuenow')).toBe('100');
});

test('Switch toggles aria-checked through onChange', () => {
  const onChange = mock();
  render(<Switch checked={false} onChange={onChange} label="Сануулга" />);
  const sw = screen.getByRole('switch', { name: 'Сануулга' });
  expect(sw.getAttribute('aria-checked')).toBe('false');
  fireEvent.click(sw);
  expect(onChange).toHaveBeenCalledWith(true);
});

test('SegmentedControl: click and arrow keys pick options', () => {
  const onChange = mock();
  render(
    <SegmentedControl
      label="Төрөл"
      value="word"
      onChange={onChange}
      options={[
        { value: 'word', label: 'Үгс' },
        { value: 'formula', label: 'Томьёо' },
        { value: 'mine', label: 'Миний багц' },
      ]}
    />,
  );
  expect(screen.getByRole('radio', { name: 'Үгс' }).getAttribute('aria-checked')).toBe('true');
  fireEvent.click(screen.getByRole('radio', { name: 'Томьёо' }));
  fireEvent.keyDown(screen.getByRole('radio', { name: 'Үгс' }), { key: 'ArrowLeft' });
  expect(onChange.mock.calls).toEqual([['formula'], ['mine']]);
});

test('Modal closes on Escape and renders nothing when closed', () => {
  const onClose = mock();
  const { rerender } = render(
    <Modal open label="Түвшин ахилаа" onClose={onClose}>
      <button type="button">OK</button>
    </Modal>,
  );
  expect(screen.getByRole('dialog', { name: 'Түвшин ахилаа' })).toBeTruthy();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).toHaveBeenCalled();
  rerender(
    <Modal open={false} label="Түвшин ахилаа" onClose={onClose}>
      x
    </Modal>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('EmptyState shows the sleeping cat and title', () => {
  render(<EmptyState title="Алдаа алга" />);
  expect(screen.getByText('Алдаа алга')).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Суу муур' })).toBeTruthy();
});

describe('toast', () => {
  afterEach(() => clearToasts());
  test('toast() shows a message in the Toaster', () => {
    render(<Toaster />);
    act(() => {
      toast('+40 XP', { tone: 'xp' });
    });
    expect(screen.getByText('+40 XP')).toBeTruthy();
  });
});

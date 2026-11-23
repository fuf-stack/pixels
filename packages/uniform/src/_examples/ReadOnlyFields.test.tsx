import type { VetoTypeAny } from '@fuf-stack/veto';
import type { ReactElement } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { array, boolean, number, string, veto } from '@fuf-stack/veto';

import '@testing-library/jest-dom/vitest';

import Checkboxes from '../Checkboxes';
import DatePicker from '../DatePicker';
import Form from '../Form';
import Input from '../Input';
import RadioBoxes from '../RadioBoxes';
import Radios from '../Radios';
import RadioTabs from '../RadioTabs';
import Select from '../Select';
import Slider from '../Slider';
import Switch from '../Switch';
import SwitchBox from '../SwitchBox';
import TextArea from '../TextArea';
import Time from '../Time';

interface FieldStateProps {
  disabled?: boolean;
  readOnly?: boolean;
}

interface FieldCase {
  /** Renders the field registered at `field` */
  renderField: (props: FieldStateProps) => ReactElement;
  /** Required schema for the field */
  schema: VetoTypeAny;
  /** Stored value of the field */
  value: unknown;
}

const options = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
];

const fieldCases: Record<string, FieldCase> = {
  Checkboxes: {
    renderField: (props) => (
      <Checkboxes {...props} name="field" options={options} />
    ),
    schema: array(string()).min(1),
    value: ['a'],
  },
  DatePicker: {
    renderField: (props) => <DatePicker {...props} name="field" />,
    schema: string(),
    value: '2026-01-02T00:00:00.000Z',
  },
  Input: {
    renderField: (props) => <Input {...props} name="field" />,
    schema: string(),
    value: 'stored',
  },
  NumberInput: {
    renderField: (props) => <Input {...props} name="field" type="number" />,
    schema: number(),
    value: 42,
  },
  PasswordInput: {
    renderField: (props) => <Input {...props} name="field" type="password" />,
    schema: string(),
    value: 'secret',
  },
  RadioBoxes: {
    renderField: (props) => (
      <RadioBoxes {...props} name="field" options={options} />
    ),
    schema: string(),
    value: 'a',
  },
  Radios: {
    renderField: (props) => (
      <Radios {...props} name="field" options={options} />
    ),
    schema: string(),
    value: 'a',
  },
  RadioTabs: {
    renderField: (props) => (
      <RadioTabs {...props} name="field" options={options} />
    ),
    schema: string(),
    value: 'a',
  },
  Select: {
    renderField: (props) => (
      <Select {...props} label="Field" name="field" options={options} />
    ),
    schema: string(),
    value: 'a',
  },
  Slider: {
    renderField: (props) => <Slider {...props} name="field" />,
    schema: number(),
    value: 40,
  },
  Switch: {
    renderField: (props) => <Switch {...props} name="field" />,
    schema: boolean(),
    value: true,
  },
  SwitchBox: {
    renderField: (props) => <SwitchBox {...props} label="Field" name="field" />,
    schema: boolean(),
    value: true,
  },
  TextArea: {
    renderField: (props) => <TextArea {...props} name="field" />,
    schema: string(),
    value: 'stored',
  },
  Time: {
    renderField: (props) => <Time {...props} name="field" />,
    schema: string(),
    value: '10:30',
  },
};

const renderForm = (
  { renderField, schema, value }: FieldCase,
  props: FieldStateProps,
  onSubmit = vi.fn(),
) =>
  render(
    <Form
      initialValues={{ field: value }}
      onSubmit={onSubmit}
      validation={veto({ field: schema })}
    >
      {/* Scopes focus assertions to the field, not the submit button. */}
      <div data-testid="field_under_test">{renderField(props)}</div>
      <button type="submit">Submit</button>
    </Form>,
  );

/** Tries every common way to change a field: keys, typing, and clicks. */
const attemptChanges = async (
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
) => {
  await user.tab();
  await user.keyboard('{ArrowRight}{ArrowDown}{Backspace}{Delete}1x ');
  const targets = [
    ...container.querySelectorAll<HTMLElement>(
      'input, textarea, [role="radio"], [role="tab"], [role="switch"], label',
    ),
  ];
  await targets.reduce(async (previous, target) => {
    await previous;
    await user.click(target);
  }, Promise.resolve());
};

describe.each(Object.entries(fieldCases))('%s readOnly', (_name, fieldCase) => {
  it('stays enabled and focusable', async () => {
    const user = userEvent.setup();
    const { container } = renderForm(fieldCase, { readOnly: true });

    // Buttons that would change the value (e.g. a date picker's calendar
    // trigger) are disabled by the read-only control; the field itself is not.
    expect(container.querySelector(':disabled:not(button)')).toBeNull();
    expect(
      container.querySelector('[aria-disabled="true"]:not(button)'),
    ).toBeNull();

    await user.tab();
    expect(screen.getByTestId('field_under_test')).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it('ignores user changes and submits the stored value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = renderForm(fieldCase, { readOnly: true }, onSubmit);

    await attemptChanges(user, container);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
        { field: fieldCase.value },
        expect.anything(),
      );
    });
  });
});

describe('readOnly slider', () => {
  it('marks the focusable thumb input as read-only', () => {
    const { container, rerender } = render(
      <Form initialValues={{ field: 40 }} onSubmit={vi.fn()}>
        <Slider name="field" readOnly />
      </Form>,
    );

    const thumbInput = container.querySelector(
      '[data-slot="thumb"] input[type="range"]',
    );
    expect(thumbInput).toHaveAttribute('aria-readonly', 'true');

    rerender(
      <Form initialValues={{ field: 40 }} onSubmit={vi.fn()}>
        <Slider name="field" />
      </Form>,
    );
    expect(thumbInput).not.toHaveAttribute('aria-readonly');
  });
});

describe('readOnly text fields', () => {
  it.each([
    ['Input', <Input key="input" name="field" readOnly />],
    ['TextArea', <TextArea key="textarea" name="field" readOnly />],
  ])('%s uses a native readonly control', (_name, field) => {
    render(
      <Form initialValues={{ field: 'copy me' }} onSubmit={vi.fn()}>
        {field}
      </Form>,
    );

    const control = screen.getByRole('textbox');
    expect(control).toHaveAttribute('readonly');
    expect(control).toHaveValue('copy me');
  });

  it('hides the clear button of a clearable read-only input', () => {
    render(
      <Form initialValues={{ field: 'stored' }} onSubmit={vi.fn()}>
        <Input clearable name="field" readOnly />
      </Form>,
    );

    expect(screen.queryByLabelText('clear input')).not.toBeInTheDocument();
  });
});

describe('readOnly validation', () => {
  it('reports schema errors for an invalid read-only value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Form
        initialValues={{ field: 'ab' }}
        onSubmit={onSubmit}
        validation={veto({ field: string().min(3, 'Too short') })}
      >
        <Input name="field" readOnly />
        <button type="submit">Submit</button>
      </Form>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Too short')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('omits the value when the field is both disabled and read-only', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Form
        initialValues={{ field: 'stored' }}
        onSubmit={onSubmit}
        validation={veto({ field: string().optional() })}
      >
        <Input disabled name="field" readOnly />
        <button type="submit">Submit</button>
      </Form>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({}, expect.anything());
    });
  });
});

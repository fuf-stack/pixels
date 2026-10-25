import type { Story } from './FieldCard.storySetup';

import { expect, userEvent, within } from 'storybook/test';

import Input from '../../Input';
import {
  meta as sharedMeta,
  validationOptionalNickname,
} from './FieldCard.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/FieldCard/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const EdgeCaseOptionalFieldTouched: Story = {
  name: 'Optional Field Touch',
  parameters: {
    edgeCaseDescription:
      'Touching an empty optional field must not mark its card or untouched required siblings as invalid.',
    formProps: { validation: validationOptionalNickname },
  },
  args: {
    name: 'user',
    label: 'User Profile',
    children: (
      <>
        <Input label="Username" name="user.username" />
        <Input label="Nickname (optional)" name="user.nickname" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldCardLabel = canvas.getByRole('heading', {
      name: /user profile/i,
    });

    // Touch ONLY the optional nickname field
    const nicknameInput = canvas.getByTestId('user_nickname');
    await userEvent.click(nicknameInput);
    await userEvent.tab();

    // Wait a moment for validation
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Card should NOT be danger - optional field has no error
    expect(fieldCardLabel).not.toHaveClass('text-danger');

    // No errors should be visible
    expect(canvas.queryByTestId('user_nickname_error')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('user_username_error')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('user_error')).not.toBeInTheDocument();
  },
};

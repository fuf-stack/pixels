import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';

import { createStyling } from '@fuf-stack/pixel-utils';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import Input from '../Input';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Input> = {
  title: 'uniform/Input',
  component: Input,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className={{ form: 'min-w-60' }}
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
    },
    // Keep the edge-case explanation outside the form, as in the original stories.
    (Story, context) => {
      return context.parameters.edgeCaseDescription ? (
        edgeCaseDecorator(Story, context)
      ) : (
        <Story />
      );
    },
  ],
};

export type Story = StoryObj<typeof Input>;

export interface Superhero {
  emoji: string;
  name: string;
  power: string;
}

export const superheroData: Record<string, Superhero> = {
  spiderman: { name: 'Spider-Man', emoji: '🕷️', power: 'Web-slinging' },
  batman: { name: 'Batman', emoji: '🦇', power: 'Detective skills' },
  superman: { name: 'Superman', emoji: '💪', power: 'Super strength' },
  wonderwoman: { name: 'Wonder Woman', emoji: '⚡', power: 'Combat mastery' },
  ironman: { name: 'Iron Man', emoji: '🤖', power: 'Powered armor' },
  thor: { name: 'Thor', emoji: '⚡', power: 'Thunder god' },
  hulk: { name: 'Hulk', emoji: '💥', power: 'Smash everything' },
  blackpanther: { name: 'Black Panther', emoji: '🐱', power: 'Vibranium suit' },
};

export const renderAllSizes = () => {
  return ['sm', 'md', 'lg'].map((size) => {
    return (
      <Input
        key={size}
        className="mt-4"
        name={size}
        placeholder={size}
        // @ts-expect-error this is ok
        size={size}
      />
    );
  });
};

export const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

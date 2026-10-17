import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';

import { createStyling } from '@fuf-stack/pixel-utils';
import { number, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import Slider from '../Slider';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Slider> = {
  title: 'uniform/Slider',
  component: Slider,
  decorators: [
    (Story, context) => {
      const { parameters } = context;
      const content = (
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
      const renderField = () => {
        return content;
      };
      return parameters.edgeCaseDescription
        ? edgeCaseDecorator(renderField, context)
        : content;
    },
  ],
};

export type Story = StoryObj<typeof Slider>;

export const requiredValidation = veto({
  sliderField: number(),
});

export const validation = veto({
  sliderField: number().min(50, 'Value must be at least 50'),
});

export const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['field'] }] } },
});

export const edgecasesRequiredValidation = veto({ sliderField: number() });

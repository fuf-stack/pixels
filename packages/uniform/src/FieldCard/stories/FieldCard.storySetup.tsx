import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';

import { createStyling } from '@fuf-stack/pixel-utils';
import { object, refineObject, string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import FieldCard from '../FieldCard';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof FieldCard> = {
  title: 'uniform/FieldCard',
  component: FieldCard,
  decorators: [
    (Story, context) => {
      const { parameters } = context;
      const content = (
        <Form
          className={{ form: 'min-w-md' }}
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

export type Story = StoryObj<typeof FieldCard>;

export const validationPizzaDelivery = veto({
  delivery: object({
    street: string().min(3, 'Street too short for delivery driver to find'),
    city: string().min(2, 'City name too short'),
    phone: string().min(10, 'Phone number must have at least 10 digits'),
  }),
});

export const validationSpaceMission = veto({
  mission: object({
    commander: string().min(2, 'Commander name required'),
    pilot: string().optional(),
  }),
});

export const validationHobbies = veto({
  hobbies: object({
    favorite: string().optional(),
    secondary: string().optional(),
  }).optional(),
});

export const validationSecretIdentity = veto({
  identity: refineObject(
    object({
      realName: string().min(2, 'Name too short'),
      heroName: string().min(2, 'Hero name too short'),
      email: string().email('Invalid email format'),
    }),
  )({
    custom: (data, ctx) => {
      const realName = (data.realName as string | undefined)?.toLowerCase();
      const heroName = (data.heroName as string | undefined)?.toLowerCase();
      const email = data.email as string | undefined;

      // Rule 1: Real name and hero name must be different
      if (realName && heroName && realName === heroName) {
        ctx.addIssue({
          code: 'custom',
          message: "Your secret identity isn't very secret if names match!",
        });
      }

      // Rule 2: Email should contain hero name for official hero business
      if (email && heroName && !email.toLowerCase().includes(heroName)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Official hero email must contain your hero name',
        });
      }
    },
  }),
});

export const validationTacoOrder = veto({
  taco: refineObject(
    object({
      shell: string().min(1),
      protein: string().min(1),
      salsa: string().min(1),
    }),
  )({
    custom: (data, ctx) => {
      const shell = data.shell as string | undefined;
      const protein = data.protein as string | undefined;
      const salsa = data.salsa as string | undefined;

      // All parts must be selected for a complete taco
      if (!shell || !protein || !salsa) {
        ctx.addIssue({
          code: 'custom',
          message: 'A proper taco needs shell, protein, AND salsa!',
        });
      }
    },
  }),
});

export const validationBackupContacts = veto({
  // External trigger field
  trigger: string().optional(),
  contacts: refineObject(
    object({
      email: string().optional(),
      phone: string().optional(),
    }),
  )({
    custom: (data, ctx) => {
      const email = data.email as string | undefined;
      const phone = data.phone as string | undefined;

      if (!email && !phone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Provide at least one way to reach you (email or phone)',
        });
      }
    },
  }),
});

export const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['heading'] }] } },
});

export const validationOptionalNickname = veto({
  user: object({
    username: string().min(3, 'Username must be at least 3 characters'),
    nickname: string().optional(),
  }),
});

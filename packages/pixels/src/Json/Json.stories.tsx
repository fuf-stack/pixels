import type { Meta, StoryObj } from '@storybook/react-vite';

import Json from './Json';

const meta: Meta<typeof Json> = {
  title: 'pixels/Json',
  component: Json,
};

export default meta;
type Story = StoryObj<typeof Json>;

const testObject = {
  aList: [1, 2, 3],
  anObject: { bool: true, number: 123, null: null, string: 'a string' },
};

export const WithJsonString: Story = {
  args: {
    value: JSON.stringify(testObject, null, 2),
  },
};

export const WithJsonObject: Story = {
  args: {
    value: testObject,
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
    value: testObject,
  },
};

export const InvalidJson: Story = {
  args: {
    value: 'this is a string, not a Json',
  },
};

const programmersLife = {
  coffee: {
    cups: 42,
    status: 'Not enough',
    lastBreak: "What's a break?",
    type: "Whatever's left in the pot",
  },
  bugs: {
    found: 99,
    fixed: 1,
    created: 157,
    excuses: [
      'It works on my machine',
      "That's not a bug, it's a feature",
      'Cannot reproduce',
      null, // The bug that got away
    ],
  },
  meetings: {
    scheduled: 8,
    necessary: 0,
    timeSpentPretendingToPayAttention: '3 hours',
    cameraMalfunction: true,
    muted: 'Definitely not talking about the project manager',
  },
};

export const DayInTheLifeOfAProgrammer: Story = {
  args: {
    value: programmersLife,
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';

import Tabs from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Pixels/Tabs',
  component: Tabs,
  decorators: [
    (Story) => {
      return (
        <div className="w-[600px]">
          <Story />
        </div>
      );
    },
  ],
} as Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    ariaLabel: 'Basic tabs example',
    tabs: [
      {
        key: 'coffee',
        label: 'Coffee',
        content: 'The liquid that turns "leave me alone" into "good morning!"',
      },
      {
        key: 'tea',
        label: 'Tea',
        content: 'Hot leaf juice for sophisticated people',
      },
      {
        key: 'water',
        label: 'Water',
        content: 'The boring choice your doctor keeps recommending',
      },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    ariaLabel: 'Tabs with icons',
    tabs: [
      {
        key: 'cat',
        label: (
          <div className="flex items-center gap-2">
            <span>🐱</span>
            <span>Cat Pictures</span>
          </div>
        ),
        content:
          'Loading cat pictures... Just kidding, your cat walked across the keyboard and deleted them all.',
      },
      {
        key: 'dog',
        label: (
          <div className="flex items-center gap-2">
            <span>🐕</span>
            <span>Dog Pictures</span>
          </div>
        ),
        content:
          'All the good boys and girls are currently out for a walk. Please try again later.',
      },
      {
        key: 'fish',
        label: (
          <div className="flex items-center gap-2">
            <span>🐠</span>
            <span>Fish Pictures</span>
          </div>
        ),
        content: 'Sorry, all fish pictures are currently underwater.',
      },
    ],
  },
};

export const DisabledTabs: Story = {
  args: {
    ariaLabel: 'Tabs with disabled items',
    tabs: [
      {
        key: 'monday',
        label: 'Monday',
        content:
          'The day everyone pretends their weekend emails got lost in spam.',
      },
      {
        key: 'weekend',
        label: 'Weekend',
        content: 'Error 404: Weekend not found',
        disabled: true,
      },
      {
        key: 'meeting',
        label: 'Meeting',
        content: 'This could have been an email',
      },
      {
        key: 'vacation',
        label: 'Vacation',
        content: 'Nice try! Get back to work!',
        disabled: true,
      },
    ],
  },
};

export const VerticalLayout: Story = {
  args: {
    ariaLabel: 'Developer life cycle',
    vertical: true,
    className: {
      base: 'h-[300px]',
      tabList: 'w-48',
    },
    tabs: [
      {
        key: 'code',
        label: 'Writing Code',
        content:
          "Step 1: Write code\nStep 2: Wonder why it works\nStep 3: Don't touch it ever again",
      },
      {
        key: 'debug',
        label: 'Debugging',
        content:
          'Adding console.log() every 2 lines because console.log() is the new debugger',
      },
      {
        key: 'coffee',
        label: 'Coffee Break',
        content: 'Converting caffeine into code since 2024',
      },
      {
        key: 'stackoverflow',
        label: 'StackOverflow',
        content: 'Ctrl+C, Ctrl+V: A love story',
      },
    ],
  },
};

export const CustomContent: Story = {
  args: {
    ariaLabel: 'Developer profile',
    tabs: [
      {
        key: 'profile',
        label: 'Profile',
        content: (
          <div className="p-4">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200" />
              <div>
                <h3 className="text-xl font-bold">404 Name Not Found</h3>
                <p className="text-gray-600">Professional Googler</p>
              </div>
            </div>
            <p className="text-gray-700">
              I turn coffee into code and bugs into features. Sometimes I even
              write code that works. My code works on my machine, and
              that&apos;s all that matters.
            </p>
          </div>
        ),
      },
      {
        key: 'settings',
        label: 'Settings',
        content: (
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <button
                  className="rounded bg-blue-500 px-4 py-2 text-white"
                  type="button"
                >
                  Toggle (like your life choices)
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <button
                  className="rounded bg-blue-500 px-4 py-2 text-white"
                  type="button"
                >
                  Ignore All
                </button>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
};

export const DifferentPlacements: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <Tabs
          ariaLabel="Top tabs"
          placement="top"
          tabs={[
            {
              key: '1',
              label: 'Plan A',
              content: "When all else fails, this won't work either",
            },
            {
              key: '2',
              label: 'Plan B',
              content: 'Same as Plan A, but with more panic',
            },
          ]}
        />
        <Tabs
          ariaLabel="Bottom tabs"
          placement="bottom"
          tabs={[
            { key: '1', label: 'Success', content: 'Works on my machine! 🤷‍♂️' },
            {
              key: '2',
              label: 'Failure',
              content: "It's not a bug, it's an undocumented feature",
            },
          ]}
        />
      </div>
    );
  },
};

export const Radius: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div className="min-h-[200px]">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            No Radius (Sharp Corners Like My Code Reviews)
          </h3>
          <Tabs
            ariaLabel="No radius tabs"
            radius="none"
            variant="solid"
            tabs={[
              {
                key: '1',
                label: 'Square',
                content: 'As straight-edged as my debugging skills',
              },
              {
                key: '2',
                label: 'Sharp',
                content: 'Like my feedback in pull requests',
              },
              {
                key: '3',
                label: 'Angular',
                content: 'Not the framework, just the shape',
              },
            ]}
          />
        </div>

        <div className="min-h-[200px]">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Small Radius (Slightly Softer Than My Error Messages)
          </h3>
          <Tabs
            ariaLabel="Small radius tabs"
            radius="sm"
            variant="bordered"
            tabs={[
              {
                key: '1',
                label: 'Gentle',
                content: 'Just a hint of roundness',
              },
              {
                key: '2',
                label: 'Subtle',
                content: 'Barely noticeable, like my bug fixes',
              },
              {
                key: '3',
                label: 'Soft',
                content: 'A minor curve in the matrix',
              },
            ]}
          />
        </div>

        <div className="min-h-[200px]">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Medium Radius (Default, Like My Commit Frequency)
          </h3>
          <Tabs
            ariaLabel="Medium radius tabs"
            radius="md"
            variant="light"
            tabs={[
              {
                key: '1',
                label: 'Balanced',
                content: 'Not too sharp, not too round',
              },
              {
                key: '2',
                label: 'Middle',
                content: 'Like my estimations - somewhere in the middle',
              },
              {
                key: '3',
                label: 'Default',
                content: 'The safe choice, like copying from Stack Overflow',
              },
            ]}
          />
        </div>

        <div className="min-h-[200px]">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Large Radius (Smooth Like My Git Workflow)
          </h3>
          <Tabs
            ariaLabel="Large radius tabs"
            radius="lg"
            variant="solid"
            tabs={[
              {
                key: '1',
                label: 'Rounder',
                content: 'Getting quite curvy now',
              },
              {
                key: '2',
                label: 'Smoother',
                content: 'Like my coffee - smooth and refreshing',
              },
              {
                key: '3',
                label: 'Softer',
                content: 'Easy on the eyes, unlike my variable names',
              },
            ]}
          />
        </div>

        <div className="min-h-[200px]">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Full Radius (Round Like My Debug Loops)
          </h3>
          <Tabs
            ariaLabel="Full radius tabs"
            radius="full"
            variant="bordered"
            tabs={[
              {
                key: '1',
                label: 'Circular',
                content: 'As round as my infinite loops',
              },
              {
                key: '2',
                label: 'Pill',
                content: 'Like the ones I need after a long debugging session',
              },
              {
                key: '3',
                label: 'Round',
                content: 'Perfect circles, unlike my project timelines',
              },
            ]}
          />
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Small (Like My Patience)
          </h3>
          <Tabs
            ariaLabel="Small tabs"
            size="sm"
            tabs={[
              {
                key: '1',
                label: 'Espresso',
                content: 'Small but mighty, like your deadline',
              },
              { key: '2', label: 'Doppio', content: 'Double the trouble' },
              { key: '3', label: 'Triple', content: "Now we're talking!" },
            ]}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Medium (Like My Coffee)
          </h3>
          <Tabs
            ariaLabel="Medium tabs"
            size="md"
            tabs={[
              { key: '1', label: 'Morning', content: "Don't talk to me" },
              { key: '2', label: 'Noon', content: "Still don't talk to me" },
              { key: '3', label: 'Night', content: 'Okay, now we can talk' },
            ]}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Large (Like My TODO List)
          </h3>
          <Tabs
            ariaLabel="Large tabs"
            size="lg"
            tabs={[
              {
                key: '1',
                label: 'Bugs',
                content: "They're not bugs, they're features in disguise",
              },
              { key: '2', label: 'More Bugs', content: 'The saga continues' },
              {
                key: '3',
                label: 'Even More',
                content: 'At this point, just restart your computer',
              },
            ]}
          />
        </div>
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Solid Variant (Like My Excuses)
          </h3>
          <Tabs
            ariaLabel="Solid tabs"
            variant="solid"
            tabs={[
              { key: '1', label: 'Monday', content: "My alarm didn't ring" },
              {
                key: '2',
                label: 'Wednesday',
                content: 'My dog ate my keyboard',
              },
              {
                key: '3',
                label: 'Friday',
                content: 'Internet was down (really!)',
              },
            ]}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Bordered Variant (Like My Life Choices)
          </h3>
          <Tabs
            ariaLabel="Bordered tabs"
            variant="bordered"
            tabs={[
              { key: '1', label: 'Sleep', content: 'A distant memory' },
              { key: '2', label: 'Work', content: 'An ongoing nightmare' },
              { key: '3', label: 'Coffee', content: 'The only solution' },
            ]}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Light Variant (Like My Bank Account)
          </h3>
          <Tabs
            ariaLabel="Light tabs"
            variant="light"
            tabs={[
              {
                key: '1',
                label: 'Salary',
                content: 'Here today, gone tomorrow',
              },
              { key: '2', label: 'Savings', content: '404 Not Found' },
              {
                key: '3',
                label: 'Budget',
                content: "We don't talk about that",
              },
            ]}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Underlined Variant (Like My Commit Messages)
          </h3>
          <Tabs
            ariaLabel="Underlined tabs"
            variant="underlined"
            tabs={[
              {
                key: '1',
                label: 'Fix',
                content: '"Fixed bug" (Created 3 new ones)',
              },
              {
                key: '2',
                label: 'Update',
                content: '"Updated logic" (Completely rewrote everything)',
              },
              {
                key: '3',
                label: 'Refactor',
                content: '"Refactored code" (Ctrl+Z wasn\'t working)',
              },
            ]}
          />
        </div>
      </div>
    );
  },
};

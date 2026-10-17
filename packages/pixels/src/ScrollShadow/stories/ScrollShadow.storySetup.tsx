import type { Meta, StoryObj } from '@storybook/react-vite';

import ScrollShadow from '../ScrollShadow';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof ScrollShadow> = {
  title: 'pixels/ScrollShadow',
  component: ScrollShadow,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: { type: 'range', min: 10, max: 100, step: 5 },
    },
    hideScrollBar: {
      control: 'boolean',
    },
  },
};

export type Story = StoryObj<typeof ScrollShadow>;

const funnyVerticalItems = [
  '🍕 Pizza delivery guy who forgot the pizza',
  '🐢 Turtle racing champion (retired)',
  '🎵 Elevator music that makes you question life choices',
  '🧦 Sock that went missing in the dryer (found!)',
  '🚀 Rocket ship powered by coffee',
  '🐧 Penguin wearing a tuxedo to a beach party',
  '🎪 Circus elephant who learned to juggle',
  '🌮 Taco Tuesday on a Wednesday (scandal!)',
  '🎭 Drama llama with trust issues',
  '🎸 Guitar that only plays polka music',
  '🦖 Dinosaur who survived by being really good at hide and seek',
  "🍪 Cookie monster's diet coach",
  '🎯 Dart board that never gets bullseyes',
  '🎨 Paint that watched too much reality TV',
  '🧸 Teddy bear who moonlights as a bouncer',
  '🎮 Gaming controller with commitment issues',
  '🌈 Rainbow that ran out of colors',
  '🔮 Crystal ball showing only cat videos',
  "🎪 Clown who's afraid of children",
  "🐙 Octopus who can't multitask",
];

export const VerticalContent = () => {
  return (
    <>
      {/* eslint-disable-next-line prefer-spread */}
      {Array.apply(null, Array(50)).map((_, i) => {
        const item = funnyVerticalItems[i % funnyVerticalItems.length];
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="border-b border-default-200 p-2 hover:bg-default-50"
          >
            {item}
          </div>
        );
      })}
    </>
  );
};

const funnyHorizontalCards = [
  '🎭 Drama Queen',
  '🦄 Unicorn CEO',
  '🐸 Frog Prince',
  '🎪 Circus Manager',
  '🧙‍♂️ Wizard IT',
  '🎨 Artist Barista',
  '🚀 Space Janitor',
  '🦖 Dino Lawyer',
  '🎸 Rock Star Chef',
  '🧸 Teddy Bear Therapist',
  '🎯 Dart Champion',
  '🎮 Gaming Grandma',
  '🌮 Taco Philosopher',
  '🎪 Clown Doctor',
  '🔮 Fortune Teller',
  '🐙 Octopus Accountant',
  '🎵 Musical Dentist',
  '🌈 Rainbow Engineer',
  '🍪 Cookie Architect',
  '🎭 Method Actor',
];

export const HorizontalContent = () => {
  return (
    <div className="flex space-x-4">
      {/* eslint-disable-next-line prefer-spread */}
      {Array.apply(null, Array(20)).map((_, i) => {
        const card = funnyHorizontalCards[i % funnyHorizontalCards.length];
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="h-20 w-32 flex-none cursor-pointer rounded bg-info-100 p-2 text-sm transition-colors hover:bg-info-200"
          >
            <div className="text-center font-medium">{card}</div>
          </div>
        );
      })}
    </div>
  );
};

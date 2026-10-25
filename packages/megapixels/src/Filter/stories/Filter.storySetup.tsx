import type { FiltersConfiguration } from '../filters/types';

import { FaGhost, FaMagic, FaPizzaSlice, FaSmile } from 'react-icons/fa';

import { filters as f } from '..';

export const filters: FiltersConfiguration = [
  f.boolean({
    name: 'magical',
    icon: <FaMagic />,
    config: { text: 'Magical', textPrefix: 'is', textNoWord: 'not' },
  }),
  f.checkboxes({
    name: 'mood',
    icon: <FaSmile />,
    config: {
      text: 'Mood',
      options: ['😊', '😴', '🤓', '🤖'].map((mood) => {
        return { label: mood, value: mood };
      }),
    },
  }),
  f.checkboxes({
    name: 'snacks',
    icon: <FaPizzaSlice />,
    config: {
      text: 'Snacks',
      options: ['🍕', '🍪', '🍫', '🍿'].map((snack) => {
        return { label: snack, value: snack };
      }),
    },
  }),
  f.boolean({
    name: 'haunted',
    icon: <FaGhost />,
    config: { text: 'Haunted', textPrefix: 'is', textNoWord: 'not' },
  }),
];

export default filters;

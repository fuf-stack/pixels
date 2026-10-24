import type { StylingConfig } from './styling';

// Owned merge rules for semantic utilities already used by the workspace.
// These classify utilities; tokens.css generates their CSS.
const sizes = ['small', 'medium', 'large'];

const semanticMergeConfig: StylingConfig = {
  extend: {
    theme: { spacing: ['divider'], radius: sizes },
    classGroups: {
      shadow: [{ shadow: sizes }],
      opacity: [{ opacity: ['disabled'] }],
      'font-size': [{ text: ['tiny', ...sizes] }],
      'border-w': [{ border: sizes }],
      'bg-image': [
        {
          'bg-stripe-gradient': [
            'default',
            'primary',
            'secondary',
            'success',
            'warning',
            'danger',
          ],
        },
      ],
      transition: [
        'transition-background',
        'transition-colors-opacity',
        'transition-width',
        'transition-height',
        'transition-size',
        'transition-left',
        'transition-transform-opacity',
        'transition-transform-background',
        'transition-transform-colors',
        'transition-transform-colors-opacity',
      ],
    },
  },
};

export default semanticMergeConfig;

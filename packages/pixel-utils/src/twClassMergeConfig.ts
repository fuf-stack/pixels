// Generated from @fuf-stack/pixels-theme/theme.css by pnpm build.
// Do not edit this configuration directly.
import type { ConfigExtension } from 'tailwind-merge';

const twClassMergeConfig = {
  extend: {
    theme: {
      text: ['tiny', 'small', 'medium', 'large'],
      radius: ['small', 'medium', 'large'],
      spacing: ['divider'],
      shadow: ['small', 'medium', 'large'],
      ease: ['soft-spring'],
    },
    classGroups: {
      opacity: ['opacity-disabled', 'opacity-hover'],
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
      'bg-size': ['bg-stripe-size'],
      'bg-image': [
        'bg-stripe-gradient-default',
        'bg-stripe-gradient-primary',
        'bg-stripe-gradient-secondary',
        'bg-stripe-gradient-success',
        'bg-stripe-gradient-warning',
        'bg-stripe-gradient-danger',
      ],
      'border-w': ['border-small', 'border-medium', 'border-large'],
      'border-w-x': ['border-x-small', 'border-x-medium', 'border-x-large'],
      'border-w-y': ['border-y-small', 'border-y-medium', 'border-y-large'],
      'border-w-t': ['border-t-small', 'border-t-medium', 'border-t-large'],
      'border-w-r': ['border-r-small', 'border-r-medium', 'border-r-large'],
      'border-w-b': ['border-b-small', 'border-b-medium', 'border-b-large'],
      'border-w-l': ['border-l-small', 'border-l-medium', 'border-l-large'],
      'border-w-s': ['border-s-small', 'border-s-medium', 'border-s-large'],
      'border-w-e': ['border-e-small', 'border-e-medium', 'border-e-large'],
      'border-w-bs': ['border-bs-small', 'border-bs-medium', 'border-bs-large'],
      'border-w-be': ['border-be-small', 'border-be-medium', 'border-be-large'],
    },
  },
} satisfies ConfigExtension<string, string>;

export default twClassMergeConfig;

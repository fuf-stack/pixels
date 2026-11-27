import { cn, tv } from '@fuf-stack/pixel-utils';

import './theme.css';

export const caption = cn('text-body text-brand', 'text-caption');
export const heading = tv({ base: 'text-body text-brand' });
export const resetColor = cn('text-sm', 'text-body');

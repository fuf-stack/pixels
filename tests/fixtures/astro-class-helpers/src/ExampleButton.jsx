import { useState } from 'react';

import { tv } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';

const label = tv({ base: 'text-sm text-danger' });

export default function ExampleButton() {
  const [pressed, setPressed] = useState(false);
  return (
    <Button className="text-body text-brand" onClick={() => setPressed(true)}>
      <span className={label({ class: 'text-body' })}>
        {pressed ? 'Hydrated' : 'Click me'}
      </span>
    </Button>
  );
}

import type { ComponentProps } from 'react';

import { Toaster as SonnerToaster } from 'sonner';

export type ToasterProps = Pick<
  ComponentProps<typeof SonnerToaster>,
  'visibleToasts' | 'position'
>;

const Toaster = (props: ToasterProps) => {
  return <SonnerToaster {...props} />;
};

export default Toaster;

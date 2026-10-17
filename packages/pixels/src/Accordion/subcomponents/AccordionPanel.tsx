import type { ReactNode } from 'react';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';

interface AccordionPanelProps {
  /** Expanded panel content */
  children: ReactNode;
  /** CSS class name */
  className: string;
  /** Whether the owning item is disabled */
  disabled: boolean;
  /** Whether the panel is expanded */
  expanded: boolean;
  /** ID referenced by the trigger */
  id: string;
  /** ID of the button naming this panel */
  labelledBy: string;
}

/** Named accordion panel retaining closing content until its exit animation ends */
const AccordionPanel = ({
  children,
  className,
  disabled,
  expanded,
  id,
  labelledBy,
}: AccordionPanelProps) => {
  const reducedMotion = useReducedMotion();

  const content = (
    <div
      aria-labelledby={labelledBy}
      className={className}
      data-disabled={disabled || undefined}
      data-open={expanded || undefined}
      data-slot="content"
      id={id}
      role="region"
    >
      {children}
    </div>
  );

  if (reducedMotion) {
    return expanded ? content : null;
  }

  return (
    <AnimatePresence initial={false}>
      {expanded ? (
        <motion.section
          animate={{
            height: 'auto',
            opacity: 1,
            transitionEnd: { overflow: 'visible' },
          }}
          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {content}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
};

export default AccordionPanel;

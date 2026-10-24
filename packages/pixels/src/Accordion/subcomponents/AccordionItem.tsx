import type { KeyboardEventHandler } from 'react';
import type { ButtonProps } from 'react-aria-components';
import type { AccordionItemProps } from '../Accordion';
import type { AccordionClassNames } from '../accordionVariants';

import { useId } from 'react';
import { Button } from 'react-aria-components';

import AccordionPanel from './AccordionPanel';

interface AccordionItemControlProps extends AccordionItemProps {
  /** CSS class name */
  className: AccordionClassNames;
  /** Whether the panel is expanded */
  expanded: boolean;
  /** Hides the expansion chevron */
  hideIndicator: boolean;
  /** Index key used by the group selection */
  itemKey: string;
  /** Keyboard navigation between group headings */
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
  /** Callback when expansion is toggled */
  onToggle: (key: string) => void;
}

// retain the existing hover and focus selectors from React Aria's interaction state
const renderTrigger: NonNullable<ButtonProps['render']> = (props, state) => {
  return (
    <button
      {...props}
      data-focus={state.isFocused || undefined}
      data-hover={state.isHovered || undefined}
      type="button"
    />
  );
};

/** Heading, trigger associations and panel for one expandable item
 *
 * @see https://react-aria.adobe.com/Button
 */
const AccordionItem = ({
  children,
  className,
  disabled = false,
  expanded,
  hideIndicator,
  itemKey,
  onKeyDown,
  onToggle,
  subtitle = undefined,
  title,
}: AccordionItemControlProps) => {
  const id = useId();

  const triggerId = `accordion-${id}-trigger`;
  const panelId = `accordion-${id}-panel`;

  const dataAttributes = {
    'data-disabled': disabled || undefined,
    'data-open': expanded || undefined,
  };

  // toggle this panel through the owning group's selection policy
  const handleToggle = () => {
    onToggle(itemKey);
  };

  return (
    <div {...dataAttributes} className={className.base} data-slot="base">
      {/* heading and expansion action */}
      <h2 {...dataAttributes} className={className.heading} data-slot="heading">
        <Button
          aria-controls={panelId}
          aria-expanded={expanded}
          className={className.trigger}
          data-accordion-trigger
          data-open={expanded || undefined}
          data-slot="trigger"
          id={triggerId}
          isDisabled={disabled}
          onKeyDown={onKeyDown}
          onPress={handleToggle}
          render={renderTrigger}
          type="button"
        >
          <div className={className.titleWrapper} data-slot="titleWrapper">
            <span
              {...dataAttributes}
              className={className.title}
              data-slot="title"
            >
              {title}
            </span>
            {subtitle ? (
              <span className={className.subtitle} data-slot="subtitle">
                {subtitle}
              </span>
            ) : null}
          </div>

          {!hideIndicator ? (
            <span
              {...dataAttributes}
              aria-hidden="true"
              className={className.indicator}
              data-slot="indicator"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="1em"
                viewBox="0 0 24 24"
                width="1em"
              >
                <path
                  d="M15.5 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
          ) : null}
        </Button>
      </h2>

      {/* panel associated with the expansion action */}
      <AccordionPanel
        className={className.content}
        disabled={disabled}
        expanded={expanded}
        id={panelId}
        labelledBy={triggerId}
      >
        {children}
      </AccordionPanel>
    </div>
  );
};

export default AccordionItem;

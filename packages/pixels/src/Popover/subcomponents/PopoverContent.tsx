import type { PopoverProps } from '../Popover';
import type { PopoverClassNames } from '../popoverVariants';

import { usePreventScroll } from 'react-aria';
import { Dialog, Heading } from 'react-aria-components';

import ScrollShadow from '../../ScrollShadow/ScrollShadow';

interface PopoverContentProps extends Pick<
  PopoverProps,
  'content' | 'contentTestId' | 'footer' | 'header'
> {
  /** CSS class name */
  className: PopoverClassNames;
  /** Resolved arrow direction after placement flips */
  placement: string | null;
  /** Prevents page scrolling while the dialog is mounted */
  shouldBlockScroll: boolean;
}

/**
 * Named dialog with a scrollable body and optional header and footer
 *
 * Scroll locking is independent of the non-modal overlay behavior
 *
 * @see https://react-aria.adobe.com/Dialog
 */
const PopoverContent = ({
  className: classNames,
  content,
  contentTestId = undefined,
  footer = undefined,
  header = undefined,
  placement,
  shouldBlockScroll,
}: PopoverContentProps) => {
  usePreventScroll({ isDisabled: !shouldBlockScroll });

  return (
    <Dialog
      className={classNames.base}
      data-arrow
      data-open
      data-placement={placement ?? undefined}
      data-slot="base"
      data-testid={contentTestId}
    >
      <div
        className={classNames.content}
        data-arrow
        data-open
        data-placement={placement ?? undefined}
        data-slot="content"
      >
        {/* title and separator */}
        {header ? (
          <div className={classNames.headerWrapper} data-slot="header-wrapper">
            <Heading
              className={classNames.header}
              data-slot="header"
              slot="title"
            >
              {header}
            </Heading>
            <hr className={classNames.divider} />
          </div>
        ) : null}

        {/* independently scrollable body */}
        <ScrollShadow className={classNames.body} dataSlot="body">
          {content}
        </ScrollShadow>

        {/* footer and separator */}
        {footer ? (
          <div className={classNames.footerWrapper} data-slot="footer-wrapper">
            <hr className={classNames.divider} />
            <div className={classNames.footer} data-slot="footer">
              {footer}
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
};

export default PopoverContent;

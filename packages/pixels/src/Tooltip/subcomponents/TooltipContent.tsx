import type { TooltipProps } from '../Tooltip';
import type { TooltipClassNames } from '../tooltipVariants';

import { ScrollShadow } from '../../ScrollShadow';

interface TooltipContentProps extends Pick<
  TooltipProps,
  'content' | 'footer' | 'header'
> {
  /** CSS class name */
  className: TooltipClassNames;
}

/** Header, scrollable information and footer inside the tooltip surface */
const TooltipContent = ({
  className: classNames,
  content,
  footer = undefined,
  header = undefined,
}: TooltipContentProps) => {
  return (
    <div className={classNames.content} data-slot="content">
      <div>
        {/* optional heading */}
        {header ? (
          <div className={classNames.headerWrapper}>
            <div className={classNames.header}>{header}</div>
            <hr className={classNames.divider} />
          </div>
        ) : null}

        {/* scrollable information */}
        <ScrollShadow className={classNames.body}>{content}</ScrollShadow>

        {/* optional footer */}
        {footer ? (
          <div className={classNames.footerWrapper}>
            <hr className={classNames.divider} />
            <div className={classNames.footer}>{footer}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TooltipContent;

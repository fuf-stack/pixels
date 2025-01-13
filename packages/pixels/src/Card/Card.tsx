import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import {
  Card as NextCard,
  CardBody as NextCardBody,
  CardFooter as NextCardFooter,
  CardHeader as NextCardHeader,
} from '@nextui-org/card';
import { Divider as NextDivider } from '@nextui-org/divider';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// card styling variants
export const cardVariants = tv({
  slots: {
    base: 'border border-divider',
    body: '',
    divider: 'my-0 border-divider',
    footer: '',
    header: 'text-base font-semibold',
  },
});

type VariantProps = TVProps<typeof cardVariants>;
type ClassName = TVClassName<typeof cardVariants>;

export interface CardProps extends VariantProps {
  /** card body content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** footer content */
  footer?: ReactNode;
  /** header content */
  header?: ReactNode;
  /** ref */
  ref?: React.RefObject<HTMLDivElement | null> | undefined;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Card component based on [NextUI Card](https://nextui.org/docs/components/card)
 */
const Card = ({
  children = null,
  className = undefined,
  footer = undefined,
  header = undefined,
  ref = undefined,
  testId = undefined,

}: CardProps) => {
  // classNames from slots
  const variants = cardVariants();
  const { divider: dividerClassName, ...classNames } = variantsToClassNames(
    variants,
    className,
    'base',
  );

  const divider = <NextDivider className={dividerClassName} />;

  return (
    <NextCard
      classNames={classNames}
      data-testid={testId && `card_${testId}`}
      fullWidth
      radius="sm"
      ref={ref}
      shadow="none"
    >
      {header && (
        <>
          <NextCardHeader data-testid={testId && `card_header_${testId}`}>
            {header}
          </NextCardHeader>
          {divider}
        </>
      )}
      <NextCardBody data-testid={testId && `card_body_${testId}`}>
        {children}
      </NextCardBody>
      {footer && (
        <>
          {divider}
          <NextCardFooter data-testid={testId && `card_footer_${testId}`}>
            {footer}
          </NextCardFooter>
        </>
      )}
    </NextCard>
  );
};

export default Card;

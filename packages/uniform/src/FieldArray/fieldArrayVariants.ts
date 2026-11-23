import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

export const fieldArrayVariants = tv({
  slots: {
    /** class for the actions menu button */
    actionsMenuButton: [
      // base styles
      'flex items-center justify-center text-default-600',
      // fixed height/no round corners/center align
      'h-full rounded-none',
      // focus styles - inset ring
      'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
    ],
    /** class for the append button */
    appendButton: [
      // base styles
      'w-full justify-start rounded-t-none rounded-b-small font-semibold',
      // match label height (p-3 = 12px vertical padding + text-base line height)
      '!h-[48px] !min-h-0',
      // focus styles - inset ring with rounded bottom corners to match container
      'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
    ],
    /** base class for the field array wrapper */
    base: [
      // base styles
      'overflow-hidden rounded-small border border-divider bg-content1',
      // divider between items
      'divide-y divide-divider',
    ],
    /** class for the element fields grid */
    elementFieldsGrid: ['w-full grow p-3'],
    /** class for the label */
    label: [
      // keep the label in normal flow at full width
      'pointer-events-auto! static! z-auto! block! w-full!',
      // reset any transforms or translations
      'translate-x-0! translate-y-0! transform-none!',
      // card header styling - use text-medium (16px) instead of text-base for correct 48px height
      'rounded-t-small p-3 text-medium font-semibold',
    ],
    /** class for the list */
    list: ['overflow-hidden'],
    /** class for the list item (performs motion animations) */
    listItem: [
      // base styles
      'group relative flex flex-row',
      // overlap borders by shifting first item up 1px (similar to how last item overlaps with append button)
      'first:-mt-px',
    ],
    /** class for the list item inner */
    listItemInner: [
      // base styles
      'flex w-full flex-row items-stretch divide-divider bg-content1',
      // x division and borders
      'divide-x divide-solid border-t border-b border-divider',
    ],
    /** class for the list wrapper */
    listWrapper: ['overflow-hidden'],
    /** class for the remove button */
    removeButton: [
      // base styles
      'flex items-center justify-center',
      // fixed height/no round corners
      '!h-full !min-h-0 !rounded-none px-3',
      // focus styles - inset ring
      'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
    ],
    /** class for the sort drag handle */
    sortDragHandle: [
      // base styles
      'flex cursor-grab items-center justify-center px-2 text-default-600 transition-colors',
      // hover and  dragging state
      'group-data-[dragging=true]:bg-default-100 hover:bg-default-100 active:cursor-grabbing',
      // focus styles - inset ring
      'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
    ],
  },
  variants: {
    hasLabel: {
      false: {
        // focus styles - when there is no label, the first item actions menu button should have rounded top right corners
        actionsMenuButton:
          'group-[:first-child]:!rounded-tr-small group-[:first-child]:group-data-[dragging=true]:!rounded-tr-none',
        // focus styles - when there is no label, the first item remove button focus ring should have rounded top right corners
        removeButton:
          'group-[:first-child]:!rounded-tr-small group-[:first-child]:group-data-[dragging=true]:!rounded-tr-none',
        // focus styles - when there is no label, the first item sort drag handle focus ring should have rounded top left corners
        sortDragHandle:
          'group-[:first-child]:rounded-tl-small group-[:first-child]:group-data-[dragging=true]:rounded-tl-none',
      },
    },
  },
});

export type VariantProps = TVProps<typeof fieldArrayVariants>;

export type ClassName = TVClassName<typeof fieldArrayVariants>;
